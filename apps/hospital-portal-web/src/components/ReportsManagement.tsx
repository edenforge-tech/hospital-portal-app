'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Users,
  DollarSign,
  Briefcase,
  Shield,
  Clock,
  Filter,
  RefreshCw,
  Trash2,
  Search,
  FileSpreadsheet,
  FileDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  Mail,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Pagination } from '@/components/Pagination';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: any;
  color: string;
  fields: ReportField[];
}

interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
  options?: string[];
  required?: boolean;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: Date;
  generatedBy: string;
  dateRange: { from: Date; to: Date };
  format: 'pdf' | 'excel' | 'csv';
  status: 'completed' | 'processing' | 'failed';
  fileSize: string;
  recordCount: number;
}

interface ScheduledReport {
  id: string;
  templateId: string;
  templateName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: Date;
  recipients: string[];
  isActive: boolean;
}

type ReportCategory = 'patient' | 'appointment' | 'financial' | 'staff' | 'compliance';

// Report Templates
const reportTemplates: ReportTemplate[] = [
  {
    id: 'patient_demographics',
    name: 'Patient Demographics Report',
    description: 'Comprehensive patient demographic analysis including age, gender, location',
    category: 'patient',
    icon: Users,
    color: 'text-blue-600 bg-blue-100',
    fields: [
      { id: 'ageGroups', label: 'Age Groups', type: 'multiselect', options: ['0-17', '18-44', '45-64', '65+'] },
      { id: 'gender', label: 'Gender', type: 'multiselect', options: ['Male', 'Female', 'Other'] },
      { id: 'bloodType', label: 'Blood Type', type: 'multiselect', options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] }
    ]
  },
  {
    id: 'patient_medical_history',
    name: 'Patient Medical History Report',
    description: 'Detailed medical history including conditions, allergies, medications',
    category: 'patient',
    icon: Activity,
    color: 'text-emerald-600 bg-emerald-100',
    fields: [
      { id: 'conditions', label: 'Medical Conditions', type: 'text' },
      { id: 'includeAllergies', label: 'Include Allergies', type: 'select', options: ['Yes', 'No'] },
      { id: 'includeMedications', label: 'Include Medications', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    id: 'appointment_summary',
    name: 'Appointment Summary Report',
    description: 'Summary of scheduled, completed, and cancelled appointments',
    category: 'appointment',
    icon: Calendar,
    color: 'text-purple-600 bg-purple-100',
    fields: [
      { id: 'status', label: 'Status', type: 'multiselect', options: ['Scheduled', 'Completed', 'Cancelled', 'No Show'], required: true },
      { id: 'department', label: 'Department', type: 'multiselect', options: ['Ophthalmology', 'Optometry', 'Retina', 'Glaucoma'] },
      { id: 'appointmentType', label: 'Appointment Type', type: 'multiselect', options: ['Checkup', 'Follow-up', 'Surgery', 'Emergency'] }
    ]
  },
  {
    id: 'financial_revenue',
    name: 'Financial Revenue Report',
    description: 'Revenue breakdown by department, payment method, and insurance',
    category: 'financial',
    icon: DollarSign,
    color: 'text-green-600 bg-green-100',
    fields: [
      { id: 'revenueType', label: 'Revenue Type', type: 'multiselect', options: ['Consultations', 'Procedures', 'Medications', 'Tests'] },
      { id: 'paymentMethod', label: 'Payment Method', type: 'multiselect', options: ['Cash', 'Credit Card', 'Insurance', 'Other'] },
      { id: 'groupBy', label: 'Group By', type: 'select', options: ['Department', 'Doctor', 'Day', 'Month'] }
    ]
  },
  {
    id: 'financial_expenses',
    name: 'Expense Analysis Report',
    description: 'Detailed expense tracking and cost analysis',
    category: 'financial',
    icon: TrendingUp,
    color: 'text-amber-600 bg-amber-100',
    fields: [
      { id: 'expenseCategory', label: 'Expense Category', type: 'multiselect', options: ['Salaries', 'Equipment', 'Supplies', 'Utilities', 'Other'] },
      { id: 'department', label: 'Department', type: 'multiselect', options: ['All', 'Ophthalmology', 'Optometry', 'Administration'] }
    ]
  },
  {
    id: 'staff_performance',
    name: 'Staff Performance Report',
    description: 'Employee performance metrics including attendance, appointments, ratings',
    category: 'staff',
    icon: Briefcase,
    color: 'text-indigo-600 bg-indigo-100',
    fields: [
      { id: 'staffType', label: 'Staff Type', type: 'multiselect', options: ['Doctors', 'Nurses', 'Administrative', 'Support'] },
      { id: 'metrics', label: 'Metrics', type: 'multiselect', options: ['Attendance', 'Appointments', 'Patient Rating', 'Revenue'] },
      { id: 'topPerformers', label: 'Show Top Performers', type: 'select', options: ['Top 5', 'Top 10', 'Top 20', 'All'] }
    ]
  },
  {
    id: 'compliance_hipaa',
    name: 'HIPAA Compliance Report',
    description: 'Audit trail and compliance verification for HIPAA regulations',
    category: 'compliance',
    icon: Shield,
    color: 'text-red-600 bg-red-100',
    fields: [
      { id: 'auditEvents', label: 'Audit Events', type: 'multiselect', options: ['Access', 'Modifications', 'Deletions', 'Exports'] },
      { id: 'userRole', label: 'User Role', type: 'multiselect', options: ['All', 'Doctors', 'Nurses', 'Admin'] },
      { id: 'includeViolations', label: 'Include Violations', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    id: 'compliance_security',
    name: 'Security Audit Report',
    description: 'Security events including failed logins, permission changes, access logs',
    category: 'compliance',
    icon: Activity,
    color: 'text-red-600 bg-red-100',
    fields: [
      { id: 'eventType', label: 'Event Type', type: 'multiselect', options: ['Login Attempts', 'Permission Changes', 'Data Access', 'System Changes'] },
      { id: 'severity', label: 'Severity', type: 'multiselect', options: ['Critical', 'Warning', 'Info'] }
    ]
  }
];

// Mock generated reports
const mockGeneratedReports: GeneratedReport[] = [
  {
    id: 'rpt_001',
    templateId: 'patient_demographics',
    templateName: 'Patient Demographics Report',
    generatedAt: new Date('2026-01-25T10:30:00'),
    generatedBy: 'Admin User',
    dateRange: { from: new Date('2026-01-01'), to: new Date('2026-01-31') },
    format: 'pdf',
    status: 'completed',
    fileSize: '2.4 MB',
    recordCount: 1935
  },
  {
    id: 'rpt_002',
    templateId: 'appointment_summary',
    templateName: 'Appointment Summary Report',
    generatedAt: new Date('2026-01-24T15:45:00'),
    generatedBy: 'Dr. Sarah Johnson',
    dateRange: { from: new Date('2026-01-01'), to: new Date('2026-01-24') },
    format: 'excel',
    status: 'completed',
    fileSize: '1.8 MB',
    recordCount: 2133
  },
  {
    id: 'rpt_003',
    templateId: 'financial_revenue',
    templateName: 'Financial Revenue Report',
    generatedAt: new Date('2026-01-23T09:15:00'),
    generatedBy: 'Finance Manager',
    dateRange: { from: new Date('2025-12-01'), to: new Date('2025-12-31') },
    format: 'pdf',
    status: 'completed',
    fileSize: '3.1 MB',
    recordCount: 856
  },
  {
    id: 'rpt_004',
    templateId: 'staff_performance',
    templateName: 'Staff Performance Report',
    generatedAt: new Date('2026-01-22T14:20:00'),
    generatedBy: 'HR Manager',
    dateRange: { from: new Date('2026-01-01'), to: new Date('2026-01-22') },
    format: 'csv',
    status: 'completed',
    fileSize: '856 KB',
    recordCount: 34
  },
  {
    id: 'rpt_005',
    templateId: 'compliance_hipaa',
    templateName: 'HIPAA Compliance Report',
    generatedAt: new Date('2026-01-21T11:00:00'),
    generatedBy: 'Compliance Officer',
    dateRange: { from: new Date('2025-10-01'), to: new Date('2025-12-31') },
    format: 'pdf',
    status: 'completed',
    fileSize: '5.2 MB',
    recordCount: 3421
  }
];

// Mock scheduled reports
const mockScheduledReports: ScheduledReport[] = [
  {
    id: 'sch_001',
    templateId: 'patient_demographics',
    templateName: 'Patient Demographics Report',
    frequency: 'monthly',
    nextRun: new Date('2026-02-01T09:00:00'),
    recipients: ['admin@visioncare.com', 'manager@visioncare.com'],
    isActive: true
  },
  {
    id: 'sch_002',
    templateId: 'financial_revenue',
    templateName: 'Financial Revenue Report',
    frequency: 'weekly',
    nextRun: new Date('2026-01-27T08:00:00'),
    recipients: ['finance@visioncare.com'],
    isActive: true
  },
  {
    id: 'sch_003',
    templateId: 'compliance_hipaa',
    templateName: 'HIPAA Compliance Report',
    frequency: 'monthly',
    nextRun: new Date('2026-02-01T10:00:00'),
    recipients: ['compliance@visioncare.com', 'admin@visioncare.com'],
    isActive: true
  }
];

export function ReportsManagement() {
  const [activeTab, setActiveTab] = useState<'templates' | 'generated' | 'scheduled'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: new Date(new Date().setDate(1)),
    to: new Date()
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [generatedReports] = useState<GeneratedReport[]>(mockGeneratedReports);
  const [scheduledReports] = useState<ScheduledReport[]>(mockScheduledReports);

  // Filter templates
  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter generated reports
  const filteredReports = generatedReports.filter(report =>
    report.templateName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil((activeTab === 'templates' ? filteredTemplates.length : filteredReports.length) / itemsPerPage);
  const paginatedItems = activeTab === 'templates'
    ? filteredTemplates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowGenerateModal(true);
  };

  const handlePreviewReport = (report: GeneratedReport) => {
    setSelectedReport(report);
    setShowPreviewModal(true);
  };

  const handleScheduleReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowScheduleModal(true);
  };

  const generatePDF = (template: ReportTemplate) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(template.name, 20, 20);
    
    doc.setFontSize(12);
    doc.text('Vision Care Hospital Network', 20, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 37);
    doc.text(`Date Range: ${dateRange.from?.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString()}`, 20, 44);
    
    // Sample data table
    const headers = [['#', 'Name', 'Value', 'Status', 'Date']];
    const data = Array.from({ length: 20 }, (_, i) => [
      String(i + 1),
      `Record ${i + 1}`,
      `$${(Math.random() * 1000).toFixed(2)}`,
      ['Active', 'Completed', 'Pending'][Math.floor(Math.random() * 3)],
      new Date(2026, 0, Math.floor(Math.random() * 25) + 1).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 55,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateCSV = (template: ReportTemplate) => {
    const headers = ['#', 'Name', 'Value', 'Status', 'Date'];
    const data = Array.from({ length: 50 }, (_, i) => [
      i + 1,
      `Record ${i + 1}`,
      `$${(Math.random() * 1000).toFixed(2)}`,
      ['Active', 'Completed', 'Pending'][Math.floor(Math.random() * 3)],
      new Date(2026, 0, Math.floor(Math.random() * 25) + 1).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Generate and manage reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Report Templates
          </button>
          <button
            onClick={() => setActiveTab('generated')}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
              activeTab === 'generated'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Generated Reports ({generatedReports.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
              activeTab === 'scheduled'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Scheduled Reports ({scheduledReports.length})
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === 'templates' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ReportCategory | 'all')}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="patient">Patient Reports</option>
                <option value="appointment">Appointment Reports</option>
                <option value="financial">Financial Reports</option>
                <option value="staff">Staff Reports</option>
                <option value="compliance">Compliance Reports</option>
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${template.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded capitalize">
                      {template.category}
                    </span>
                  </div>
                  <CardTitle className="mt-4">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Fields: {template.fields.length}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateReport(template)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                      <Button
                        onClick={() => handleScheduleReport(template)}
                        variant="outline"
                        size="sm"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Generated Reports Tab */}
      {activeTab === 'generated' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No generated reports found</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                        {report.format === 'pdf' ? <FileText className="h-5 w-5" /> :
                         report.format === 'excel' ? <FileSpreadsheet className="h-5 w-5" /> :
                         <FileText className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{report.templateName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(report.generatedAt)}
                          </span>
                          <span>{report.recordCount.toLocaleString()} records</span>
                          <span>{report.fileSize}</span>
                          <span className="capitalize">{report.format.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Generated by {report.generatedBy}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePreviewReport(report)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Schedule New Report
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {scheduledReports.map((scheduled) => (
                  <div
                    key={scheduled.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${scheduled.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{scheduled.templateName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="capitalize font-medium">{scheduled.frequency}</span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Next run: {formatDate(scheduled.nextRun)}
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {scheduled.recipients.length} recipient(s)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Recipients: {scheduled.recipients.join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={scheduled.isActive ? 'text-amber-600' : 'text-green-600'}
                        >
                          {scheduled.isActive ? 'Pause' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pagination */}
      {(activeTab === 'templates' || activeTab === 'generated') && filteredTemplates.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={activeTab === 'templates' ? filteredTemplates.length : filteredReports.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Generate Report Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>Configure and generate {selectedTemplate?.name}</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range *</Label>
                <DateRangePicker
                  dateRange={dateRange}
                  onChange={setDateRange}
                />
              </div>

              {/* Dynamic Fields */}
              {selectedTemplate.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-red-600"> *</span>}
                  </Label>
                  {field.type === 'select' && (
                    <select
                      id={field.id}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  {field.type === 'multiselect' && (
                    <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                      {field.options?.map(option => (
                        <label key={option} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {field.type === 'text' && (
                    <Input id={field.id} type="text" />
                  )}
                </div>
              ))}

              {/* Export Format */}
              <div className="space-y-2">
                <Label>Export Format *</Label>
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      generatePDF(selectedTemplate);
                      setShowGenerateModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => {
                      generateCSV(selectedTemplate);
                      setShowGenerateModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={() => setShowGenerateModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Preview functionality
                    setShowGenerateModal(false);
                    setShowPreviewModal(true);
                  }}
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Report Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {selectedReport?.templateName || selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Report Header */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold">Vision Care Hospital Network</h2>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <div>
                  <p>Report: {selectedReport?.templateName || selectedTemplate?.name}</p>
                  <p>Generated: {formatDate(new Date())}</p>
                </div>
                <div className="text-right">
                  <p>Date Range: {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}</p>
                  <p>Records: {selectedReport?.recordCount.toLocaleString() || '1,234'}</p>
                </div>
              </div>
            </div>

            {/* Sample Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">Record {i + 1}</td>
                      <td className="p-2">${(Math.random() * 1000).toFixed(2)}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
                          {['Active', 'Completed', 'Pending'][Math.floor(Math.random() * 3)]}
                        </span>
                      </td>
                      <td className="p-2">{new Date(2026, 0, Math.floor(Math.random() * 25) + 1).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowPreviewModal(false)} variant="outline">
                Close
              </Button>
              {selectedTemplate && (
                <>
                  <Button
                    onClick={() => {
                      generatePDF(selectedTemplate);
                      setShowPreviewModal(false);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      generateCSV(selectedTemplate);
                      setShowPreviewModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>Set up automated report generation</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Template</Label>
              <Input value={selectedTemplate?.name || ''} disabled />
            </div>

            <div className="space-y-2">
              <Label>Frequency *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Email Recipients *</Label>
              <Input type="email" placeholder="email@example.com" />
              <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
            </div>

            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input type="date" />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => setShowScheduleModal(false)} variant="outline">
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Schedule Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
