'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, AlertOctagon, AlertCircle, Info, Cake, Star, Globe, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { patientAllergiesApi } from '@/lib/api/patient-allergies.api';
import { opdBillsApi, examinationApi } from '@/lib/api';
import { patientInsuranceApi } from '@/lib/api/patient-insurance.api';
import { labReportsApi } from '@/lib/api/lab-reports.api';
import { surgeryRequestsApi } from '@/lib/api/surgery-requests.api';
import { appointmentsApi } from '@/lib/api';
import { format, differenceInDays, parseISO } from 'date-fns';

interface Alert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'info';
  category: 'allergy' | 'infection' | 'lab' | 'iop' | 'surgery' | 'billing' | 'followup' | 'insurance' | 'pending' | 'birthday' | 'vip' | 'language';
  title: string;
  message: string;
  icon: React.ElementType;
  timestamp?: Date;
  dismissible: boolean;
}

interface AlertBannerProps {
  patientId: string;
  patient?: any;
}

const ALERT_STYLES = {
  critical: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-900',
    badge: 'bg-red-600 text-white',
    icon: 'text-red-600',
  },
  high: {
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-900',
    badge: 'bg-orange-600 text-white',
    icon: 'text-orange-600',
  },
  medium: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-900',
    badge: 'bg-yellow-600 text-white',
    icon: 'text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-900',
    badge: 'bg-blue-600 text-white',
    icon: 'text-blue-600',
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ patientId, patient }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!patientId) return;

      setLoading(true);
      const detectedAlerts: Alert[] = [];

      try {
        // Parallel fetch for all alert sources
        const [
          allergiesRes,
          billsRes,
          examinationsRes,
          insuranceRes,
          labReportsRes,
          surgeriesRes,
          appointmentsRes,
        ] = await Promise.allSettled([
          patientAllergiesApi.getByPatient(patientId),
          opdBillsApi.getByPatient(patientId),
          examinationApi.getByPatient(patientId),
          patientInsuranceApi.getByPatient(patientId),
          labReportsApi.getByPatient(patientId),
          surgeryRequestsApi.getByPatient(patientId),
          appointmentsApi.getByPatient(patientId),
        ]);

        // 1. CRITICAL: Drug Allergies
        if (allergiesRes.status === 'fulfilled' && allergiesRes.value.data) {
          const criticalAllergies = allergiesRes.value.data.filter((a: any) => 
            a.severity === 'severe' || a.severity === 'critical'
          );
          if (criticalAllergies.length > 0) {
            detectedAlerts.push({
              id: 'allergy-critical',
              type: 'critical',
              category: 'allergy',
              title: 'CRITICAL ALLERGY WARNING',
              message: `Patient has ${criticalAllergies.length} severe allergy(ies): ${criticalAllergies.map((a: any) => a.allergen).join(', ')}`,
              icon: AlertOctagon,
              dismissible: false, // Cannot dismiss critical allergies
            });
          }
        }

        // 2. CRITICAL: Active Infections (from diagnosis)
        if (examinationsRes.status === 'fulfilled' && examinationsRes.value.data) {
          const recentExams = examinationsRes.value.data
            .filter((e: any) => e.diagnosis)
            .slice(0, 5); // Check last 5 exams
          
          const infections = recentExams.filter((e: any) => {
            const diagnosis = e.diagnosis?.toLowerCase() || '';
            return diagnosis.includes('covid') || 
                   diagnosis.includes('infection') || 
                   diagnosis.includes('mrsa') || 
                   diagnosis.includes('tuberculosis') ||
                   diagnosis.includes('tb');
          });

          if (infections.length > 0) {
            detectedAlerts.push({
              id: 'infection-active',
              type: 'critical',
              category: 'infection',
              title: 'ISOLATION REQUIRED',
              message: `Active infection detected: ${infections[0].diagnosis}`,
              icon: ShieldAlert,
              timestamp: new Date(infections[0].examinationDate),
              dismissible: false,
            });
          }
        }

        // 3. CRITICAL: Blood Glucose Alerts
        if (labReportsRes.status === 'fulfilled' && labReportsRes.value.data) {
          const glucoseTests = labReportsRes.value.data.filter((lab: any) => 
            lab.testName?.toLowerCase().includes('glucose') || 
            lab.testName?.toLowerCase().includes('sugar') ||
            lab.testCategory === 'Blood'
          );

          const criticalGlucose = glucoseTests.find((lab: any) => {
            const results = lab.results || [];
            return results.some((r: any) => r.status === 'critical');
          });

          if (criticalGlucose) {
            detectedAlerts.push({
              id: 'glucose-critical',
              type: 'critical',
              category: 'lab',
              title: 'CRITICAL LAB VALUE',
              message: `Blood glucose critical - Review lab report from ${format(new Date(criticalGlucose.reportDate || criticalGlucose.createdAt), 'MMM dd, yyyy')}`,
              icon: AlertTriangle,
              timestamp: new Date(criticalGlucose.reportDate || criticalGlucose.createdAt),
              dismissible: true,
            });
          }
        }

        // 4. HIGH: High IOP (Glaucoma Risk)
        if (examinationsRes.status === 'fulfilled' && examinationsRes.value.data) {
          const recentExams = examinationsRes.value.data.slice(0, 3);
          const highIOP = recentExams.find((exam: any) => {
            // Check if examination has tonometry data with high IOP
            const notes = exam.notes?.toLowerCase() || '';
            return notes.includes('iop') && (notes.includes('high') || notes.includes('>21'));
          });

          if (highIOP) {
            detectedAlerts.push({
              id: 'iop-high',
              type: 'high',
              category: 'iop',
              title: 'HIGH IOP DETECTED',
              message: 'Elevated intraocular pressure - Glaucoma monitoring required',
              icon: AlertTriangle,
              timestamp: new Date(highIOP.examinationDate),
              dismissible: true,
            });
          }
        }

        // 5. HIGH: Pending Surgery
        if (surgeriesRes.status === 'fulfilled' && surgeriesRes.value.data) {
          const upcomingSurgeries = surgeriesRes.value.data.filter((s: any) => {
            if (!s.scheduledDate) return false;
            const daysUntil = differenceInDays(new Date(s.scheduledDate), new Date());
            return daysUntil >= 0 && daysUntil <= 7 && s.status !== 'completed' && s.status !== 'cancelled';
          });

          if (upcomingSurgeries.length > 0) {
            const surgery = upcomingSurgeries[0];
            detectedAlerts.push({
              id: 'surgery-pending',
              type: 'high',
              category: 'surgery',
              title: 'SURGERY SCHEDULED',
              message: `${surgery.surgeryType || 'Surgery'} scheduled for ${format(new Date(surgery.scheduledDate), 'MMM dd, yyyy')}`,
              icon: AlertCircle,
              timestamp: new Date(surgery.scheduledDate),
              dismissible: true,
            });
          }
        }

        // 6. HIGH: Unpaid Bills
        if (billsRes.status === 'fulfilled' && billsRes.value.data) {
          const unpaidBills = billsRes.value.data.filter((b: any) => 
            b.paymentStatus === 'pending' || b.paymentStatus === 'partial'
          );
          
          const totalOutstanding = unpaidBills.reduce((sum: number, b: any) => 
            sum + (b.totalAmount - (b.paidAmount || 0)), 0
          );

          if (totalOutstanding > 5000) {
            detectedAlerts.push({
              id: 'billing-outstanding',
              type: 'high',
              category: 'billing',
              title: 'OUTSTANDING PAYMENT',
              message: `₹${totalOutstanding.toFixed(2)} pending across ${unpaidBills.length} bill(s)`,
              icon: AlertCircle,
              dismissible: true,
            });
          }
        }

        // 7. MEDIUM: Overdue Follow-Up
        if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.data) {
          const missedAppointments = appointmentsRes.value.data.filter((apt: any) => {
            if (!apt.appointmentDateTime) return false;
            const aptDate = new Date(apt.appointmentDateTime);
            return aptDate < new Date() && apt.status === 'scheduled';
          });

          if (missedAppointments.length > 0) {
            const latest = missedAppointments[0];
            detectedAlerts.push({
              id: 'followup-overdue',
              type: 'medium',
              category: 'followup',
              title: 'OVERDUE FOLLOW-UP',
              message: `Missed appointment on ${format(new Date(latest.appointmentDateTime), 'MMM dd, yyyy')}`,
              icon: AlertCircle,
              timestamp: new Date(latest.appointmentDateTime),
              dismissible: true,
            });
          }
        }

        // 8. MEDIUM: Insurance Expiry
        if (insuranceRes.status === 'fulfilled' && insuranceRes.value.data && insuranceRes.value.data.length > 0) {
          const activeInsurance = insuranceRes.value.data.find((ins: any) => ins.status === 'active');
          if (activeInsurance?.expiryDate) {
            const daysUntilExpiry = differenceInDays(new Date(activeInsurance.expiryDate), new Date());
            if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
              detectedAlerts.push({
                id: 'insurance-expiring',
                type: 'medium',
                category: 'insurance',
                title: 'INSURANCE EXPIRING',
                message: `Policy ${activeInsurance.policyNumber} expires in ${daysUntilExpiry} days (${format(new Date(activeInsurance.expiryDate), 'MMM dd, yyyy')})`,
                icon: AlertCircle,
                timestamp: new Date(activeInsurance.expiryDate),
                dismissible: true,
              });
            }
          }
        }

        // 9. MEDIUM: Lab Results Pending
        if (labReportsRes.status === 'fulfilled' && labReportsRes.value.data) {
          const pendingLabs = labReportsRes.value.data.filter((lab: any) => 
            lab.status === 'ordered' || lab.status === 'sample_collected' || lab.status === 'in_progress'
          );
          
          const urgentPending = pendingLabs.filter((lab: any) => lab.urgency === 'stat' || lab.urgency === 'urgent');
          
          if (urgentPending.length > 0) {
            detectedAlerts.push({
              id: 'lab-pending',
              type: 'medium',
              category: 'pending',
              title: 'URGENT LAB PENDING',
              message: `${urgentPending.length} urgent lab test(s) awaiting results`,
              icon: AlertCircle,
              dismissible: true,
            });
          }
        }

        // 10. INFO: Birthday
        if (patient?.dateOfBirth) {
          const dob = new Date(patient.dateOfBirth);
          const today = new Date();
          const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
          if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
          }
          
          const daysUntilBirthday = differenceInDays(nextBirthday, today);
          
          if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
            detectedAlerts.push({
              id: 'birthday-upcoming',
              type: 'info',
              category: 'birthday',
              title: daysUntilBirthday === 0 ? '🎂 BIRTHDAY TODAY' : 'UPCOMING BIRTHDAY',
              message: daysUntilBirthday === 0 
                ? `Happy Birthday to ${patient.firstName}!`
                : `Birthday on ${format(nextBirthday, 'MMM dd')} (${daysUntilBirthday} days)`,
              icon: Cake,
              dismissible: true,
            });
          }
        }

        // 11. INFO: VIP Patient
        if (patient?.patientType && (patient.patientType.toLowerCase().includes('vip') || patient.patientType.toLowerCase().includes('staff'))) {
          detectedAlerts.push({
            id: 'vip-patient',
            type: 'info',
            category: 'vip',
            title: 'VIP PATIENT',
            message: `Patient Type: ${patient.patientType}`,
            icon: Star,
            dismissible: true,
          });
        }

        // 12. INFO: Language Preference
        if (patient?.primaryLanguage && patient.primaryLanguage.toLowerCase() !== 'english') {
          detectedAlerts.push({
            id: 'language-preference',
            type: 'info',
            category: 'language',
            title: 'LANGUAGE PREFERENCE',
            message: `Preferred Language: ${patient.primaryLanguage} (Translator may be needed)`,
            icon: Globe,
            dismissible: true,
          });
        }

        // Sort alerts by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, info: 3 };
        detectedAlerts.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

        setAlerts(detectedAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [patientId, patient]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    
    // Log dismissal for HIPAA audit trail
    console.log(`Alert dismissed: ${alertId} at ${new Date().toISOString()}`);
    // TODO: Send to audit log API
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (loading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {visibleAlerts.map(alert => {
        const styles = ALERT_STYLES[alert.type];
        const Icon = alert.icon;

        return (
          <div
            key={alert.id}
            className={`${styles.bg} border-l-4 rounded-r-lg p-3 flex items-start gap-3`}
          >
            <Icon className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold text-sm ${styles.text}`}>{alert.title}</h4>
                    <Badge className={`${styles.badge} text-xs`}>
                      {alert.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className={`text-sm ${styles.text}`}>{alert.message}</p>
                  {alert.timestamp && (
                    <p className="text-xs text-gray-600 mt-1">
                      {format(alert.timestamp, 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
                {alert.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="flex-shrink-0 h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
