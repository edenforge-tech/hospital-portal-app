'use client';

import React, { useState, useEffect } from 'react';
import { getApi } from '@/lib/api';
import { UserPlus, LogOut, Printer, Search, Clock, User, AlertCircle } from 'lucide-react';

interface Visitor {
  id: string;
  visitorName: string;
  mobileNumber: string;
  patientId?: string;
  patientName?: string;
  patientRoomNumber?: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  passNumber?: string;
  status: 'active' | 'checked-out';
  createdBy: string;
}

export default function VisitorManagement() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    visitorName: '',
    mobileNumber: '',
    patientId: '',
    patientName: '',
    patientRoomNumber: '',
    purpose: '',
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchVisitors = async () => {
    try {
      const api = getApi();
      const response = await api.get('/visitors/active'); // Backend API to implement
      setVisitors(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch visitors:', error);
      setLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const api = getApi();
      const response = await api.post('/visitors/check-in', {
        ...formData,
        checkInTime: new Date().toISOString(),
      });
      
      // Print visitor pass
      if (response.data?.passNumber) {
        printVisitorPass(response.data);
      }
      
      // Reset form and refresh
      setFormData({
        visitorName: '',
        mobileNumber: '',
        patientId: '',
        patientName: '',
        patientRoomNumber: '',
        purpose: '',
      });
      setShowCheckInForm(false);
      fetchVisitors();
    } catch (error) {
      console.error('Failed to check in visitor:', error);
      alert('Failed to check in visitor. Please try again.');
    }
  };

  const handleCheckOut = async (visitorId: string) => {
    if (!confirm('Check out this visitor?')) return;
    
    try {
      const api = getApi();
      await api.post(`/visitors/${visitorId}/check-out`, {
        checkOutTime: new Date().toISOString(),
      });
      fetchVisitors();
    } catch (error) {
      console.error('Failed to check out visitor:', error);
      alert('Failed to check out visitor. Please try again.');
    }
  };

  const printVisitorPass = (visitor: Visitor) => {
    // Create printable visitor pass
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Visitor Pass - ${visitor.passNumber}</title>
          <style>
            @media print {
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .pass-number {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin: 10px 0;
            }
            .field {
              margin: 8px 0;
              padding: 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .label {
              font-size: 12px;
              color: #6b7280;
              font-weight: bold;
            }
            .value {
              font-size: 14px;
              color: #111827;
              margin-top: 3px;
            }
            .footer {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
            }
            .instructions {
              background: #fef3c7;
              border: 1px solid #fbbf24;
              border-radius: 5px;
              padding: 10px;
              margin-top: 15px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0; color: #1f2937;">VISITOR PASS</h2>
            <div class="pass-number">#${visitor.passNumber}</div>
            <p style="margin: 5px 0; font-size: 12px; color: #6b7280;">
              ${new Date(visitor.checkInTime).toLocaleString()}
            </p>
          </div>
          
          <div class="field">
            <div class="label">VISITOR NAME</div>
            <div class="value">${visitor.visitorName}</div>
          </div>
          
          <div class="field">
            <div class="label">MOBILE NUMBER</div>
            <div class="value">${visitor.mobileNumber}</div>
          </div>
          
          <div class="field">
            <div class="label">VISITING PATIENT</div>
            <div class="value">${visitor.patientName || 'General Visit'}</div>
          </div>
          
          ${
            visitor.patientRoomNumber
              ? `
          <div class="field">
            <div class="label">ROOM NUMBER</div>
            <div class="value">${visitor.patientRoomNumber}</div>
          </div>
          `
              : ''
          }
          
          <div class="field">
            <div class="label">PURPOSE</div>
            <div class="value">${visitor.purpose}</div>
          </div>
          
          <div class="instructions">
            <strong>INSTRUCTIONS:</strong><br/>
            • Please wear this pass visibly at all times<br/>
            • Follow hospital visitor guidelines<br/>
            • Check out at reception when leaving<br/>
            • Valid for today only
          </div>
          
          <div class="footer">
            Thank you for visiting our hospital<br/>
            This pass is property of the hospital
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const calculateDuration = (checkInTime: string): string => {
    const checkIn = new Date(checkInTime);
    const now = new Date();
    const durationMinutes = Math.floor((now.getTime() - checkIn.getTime()) / (1000 * 60));
    
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const filteredVisitors = visitors.filter(
    (v) =>
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.mobileNumber.includes(searchQuery) ||
      v.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passNumber?.includes(searchQuery)
  );

  const activeVisitorsCount = visitors.filter((v) => v.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading visitor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      {/* Header */}
      <div className="bg-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Visitor Management</h2>
            <p className="text-purple-100">IPD Patient Visitor Tracking</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-3 text-center">
            <div className="text-3xl font-bold">{activeVisitorsCount}</div>
            <div className="text-sm text-purple-100">Active Visitors</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Action Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitors by name, phone, pass number, or patient name..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => setShowCheckInForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Check In Visitor
          </button>
        </div>

        {/* Active Visitors List */}
        {filteredVisitors.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <User className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No active visitors</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVisitors
              .filter((v) => v.status === 'active')
              .map((visitor) => (
                <div
                  key={visitor.id}
                  className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{visitor.visitorName}</h3>
                        <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                          #{visitor.passNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Mobile:</span> {visitor.mobileNumber}
                        </div>
                        {visitor.patientName && (
                          <div>
                            <span className="font-medium">Visiting:</span> {visitor.patientName}
                          </div>
                        )}
                        {visitor.patientRoomNumber && (
                          <div>
                            <span className="font-medium">Room:</span> {visitor.patientRoomNumber}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Purpose:</span> {visitor.purpose}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Duration:</span> {calculateDuration(visitor.checkInTime)}
                        </div>
                        <div>
                          <span className="font-medium">Check-in:</span>{' '}
                          {new Date(visitor.checkInTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => printVisitorPass(visitor)}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Printer className="w-4 h-4" />
                        Reprint Pass
                      </button>
                      <button
                        onClick={() => handleCheckOut(visitor.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Check Out
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Check-In Form Modal */}
      {showCheckInForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-purple-600 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Visitor Check-In</h3>
              <p className="text-purple-100 mt-1">Register a new visitor</p>
            </div>

            <form onSubmit={handleCheckIn} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visitor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    required
                    pattern="[0-9]{10}"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.patientRoomNumber}
                    onChange={(e) => setFormData({ ...formData, patientRoomNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select purpose</option>
                    <option value="Patient Visit">Patient Visit</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Delivery">Delivery</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Note:</strong> Visitor pass will be automatically printed after check-in. Please ensure the
                  visitor wears the pass visibly at all times.
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckInForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Check In & Print Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
