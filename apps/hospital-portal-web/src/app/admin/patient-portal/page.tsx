'use client';

import React, { useState, useEffect } from 'react';
import {
  portalAppointmentsApi,
  portalDocumentsApi,
  portalMessagesApi,
  portalHealthRecordsApi,
  portalPrescriptionsApi,
  portalBillingApi,
  portalProfileApi,
  type PortalAppointment,
  type PortalDocument,
  type PortalMessage,
  type HealthRecord,
  type Prescription,
  type BillingStatement,
} from '@/lib/api/patient-portal.api';

const PatientPortalPage = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'documents' | 'messages' | 'health' | 'prescriptions' | 'billing'>('dashboard');
  const [dashboard, setDashboard] = useState<any>(null);
  const [appointments, setAppointments] = useState<PortalAppointment[]>([]);
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [billingStatements, setBillingStatements] = useState<BillingStatement[]>([]);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      const data = await portalProfileApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const loadTabData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'appointments') {
        const data = await portalAppointmentsApi.list();
        setAppointments(data);
      } else if (activeTab === 'documents') {
        const data = await portalDocumentsApi.list();
        setDocuments(data);
      } else if (activeTab === 'messages') {
        const data = await portalMessagesApi.list();
        setMessages(data);
      } else if (activeTab === 'health') {
        const data = await portalHealthRecordsApi.get();
        setHealthRecords(data);
      } else if (activeTab === 'prescriptions') {
        const data = await portalPrescriptionsApi.list();
        setPrescriptions(data);
      } else if (activeTab === 'billing') {
        const data = await portalBillingApi.getStatements();
        setBillingStatements(data);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (data: any) => {
    try {
      await portalAppointmentsApi.book(data);
      setShowBookModal(false);
      loadTabData();
      loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    try {
      await portalAppointmentsApi.cancel(id, reason);
      loadTabData();
      loadDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleRequestRefill = async (prescriptionId: string) => {
    try {
      await portalPrescriptionsApi.requestRefill(prescriptionId);
      alert('Refill request submitted successfully');
      loadTabData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request refill');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      checked_in: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
      discontinued: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      partial: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const MetricCard = ({ label, value, subtext, color, icon }: { label: string; value: number | string; subtext?: string; color: string; icon?: string }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">{label}</div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Upcoming Appointments"
          value={dashboard?.upcomingAppointments?.length || 0}
          color="text-blue-600"
          icon="📅"
        />
        <MetricCard
          label="Unread Messages"
          value={dashboard?.unreadMessages || 0}
          color="text-purple-600"
          icon="✉️"
        />
        <MetricCard
          label="Active Prescriptions"
          value={dashboard?.activePrescriptions || 0}
          color="text-green-600"
          icon="💊"
        />
        <MetricCard
          label="Pending Bills"
          value={`$${dashboard?.pendingBills || 0}`}
          color="text-orange-600"
          icon="💰"
        />
      </div>

      {dashboard?.upcomingAppointments && dashboard.upcomingAppointments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {dashboard.upcomingAppointments.map((appt: PortalAppointment) => (
              <div key={appt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{appt.providerName}</div>
                    <div className="text-sm text-gray-600">{appt.specialty}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(appt.date).toLocaleDateString()} at {appt.startTime}
                    </div>
                    <div className="text-sm text-gray-500">{appt.location.facilityName}</div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
                {appt.telehealth?.enabled && (
                  <div className="mt-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      🎥 Join Telehealth Visit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboard?.recentDocuments && dashboard.recentDocuments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Documents</h3>
          <div className="space-y-2">
            {dashboard.recentDocuments.map((doc: PortalDocument) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()}</div>
                  </div>
                  {doc.isNew && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">NEW</span>
                  )}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Portal</h1>
        <div className="flex gap-2">
          {activeTab === 'appointments' && (
            <button
              onClick={() => setShowBookModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Book Appointment
            </button>
          )}
          {activeTab === 'messages' && (
            <button
              onClick={() => setShowMessageModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              New Message
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {['dashboard', 'appointments', 'documents', 'messages', 'health', 'prescriptions', 'billing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && dashboard && <DashboardTab />}

          {activeTab === 'appointments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading appointments...
                      </td>
                    </tr>
                  ) : appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium">{appt.providerName}</div>
                          <div className="text-xs text-gray-500">{appt.specialty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{new Date(appt.date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{appt.startTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{appt.appointmentType}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>{appt.location.facilityName}</div>
                          {appt.location.room && (
                            <div className="text-xs text-gray-500">Room: {appt.location.room}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={appt.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {appt.canCancel && (
                            <button
                              onClick={() => handleCancelAppointment(appt.id)}
                              className="text-red-600 hover:text-red-800 mr-3"
                            >
                              Cancel
                            </button>
                          )}
                          {appt.telehealth?.enabled && (
                            <button className="text-blue-600 hover:text-blue-800">Join Video</button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading documents...</div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No documents found</div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500">
                          {doc.type.replace(/_/g, ' ')} • {new Date(doc.date).toLocaleDateString()}
                        </div>
                        {doc.provider && (
                          <div className="text-xs text-gray-500">Provider: {doc.provider}</div>
                        )}
                      </div>
                      {doc.isNew && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                    {doc.canDownload && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No messages found</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
                      !msg.isRead ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      setSelectedItem(msg);
                      if (!msg.isRead) portalMessagesApi.markAsRead(msg.id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{msg.senderName}</span>
                          {!msg.isRead && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">UNREAD</span>
                          )}
                        </div>
                        <div className="text-sm font-medium">{msg.subject}</div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.body}</div>
                      </div>
                      <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'health' && healthRecords && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Allergies</h3>
                {healthRecords.allergies.length === 0 ? (
                  <div className="text-gray-500 text-sm">No known allergies</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {healthRecords.allergies.map((allergy, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="font-medium">{allergy.name}</div>
                        <div className="text-sm text-gray-600">Reaction: {allergy.reaction}</div>
                        <div className="text-xs text-gray-500">Severity: {allergy.severity}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Current Medications</h3>
                {healthRecords.medications.length === 0 ? (
                  <div className="text-gray-500 text-sm">No current medications</div>
                ) : (
                  <div className="space-y-2">
                    {healthRecords.medications.map((med, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-gray-600">
                          {med.dosage} • {med.frequency}
                        </div>
                        <div className="text-xs text-gray-500">
                          Started: {new Date(med.startDate).toLocaleDateString()} • Status: {med.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Conditions</h3>
                {healthRecords.conditions.length === 0 ? (
                  <div className="text-gray-500 text-sm">No active conditions</div>
                ) : (
                  <div className="space-y-2">
                    {healthRecords.conditions.map((cond, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="font-medium">{cond.name}</div>
                        <div className="text-sm text-gray-600">
                          Diagnosed: {new Date(cond.diagnosedDate).toLocaleDateString()} • Status: {cond.status}
                        </div>
                        {cond.notes && <div className="text-xs text-gray-500 mt-1">{cond.notes}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading prescriptions...</div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No prescriptions found</div>
              ) : (
                prescriptions.map((rx) => (
                  <div key={rx.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{rx.medicationName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {rx.dosage} • {rx.frequency}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Prescribed by: {rx.prescribedBy} on {new Date(rx.prescribedDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Refills remaining: {rx.refillsRemaining}
                        </div>
                        {rx.pharmacy && (
                          <div className="text-sm text-gray-500">Pharmacy: {rx.pharmacy}</div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={rx.status} />
                        {rx.canRequestRefill && (
                          <button
                            onClick={() => handleRequestRefill(rx.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Request Refill
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading billing statements...</div>
              ) : billingStatements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No billing statements found</div>
              ) : (
                billingStatements.map((stmt) => (
                  <div key={stmt.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold">Statement #{stmt.statementNumber}</div>
                        <div className="text-sm text-gray-600">
                          Date: {new Date(stmt.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Due: {new Date(stmt.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <StatusBadge status={stmt.status} />
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Amount:</span>
                        <span className="font-medium">${stmt.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Amount Paid:</span>
                        <span className="text-green-600">${stmt.amountPaid.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Amount Due:</span>
                        <span className="text-red-600">${stmt.amountDue.toFixed(2)}</span>
                      </div>
                    </div>
                    {stmt.canPayOnline && stmt.amountDue > 0 && (
                      <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                        Pay Now
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientPortalPage;
