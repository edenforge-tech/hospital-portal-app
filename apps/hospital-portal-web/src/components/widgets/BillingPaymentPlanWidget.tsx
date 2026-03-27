/**
 * Billing & Payment Plan Widget
 * Detailed billing statement with flexible payment options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Receipt, Download, DollarSign } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import type { BillingStatement } from '@/lib/api/widgets.api';
import { widgetsApi } from '@/lib/api/widgets.api';

const BillingPaymentPlanWidget: React.FC<WidgetProps> = ({ patientId }) => {
  const [billing, setBilling] = useState<BillingStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEMI, setShowEMI] = useState(false);

  useEffect(() => {
    if (patientId) loadBilling();
  }, [patientId]);

  const loadBilling = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getBillingStatement(patientId!);
      setBilling(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !billing) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Billing & Payment
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
          <Download className="w-4 h-4 mr-1" />
          Invoice
        </button>
      </div>

      {/* Amount Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-600">Total Bill</div>
            <div className="text-xl font-bold text-gray-900">₹{billing.totalAmount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Paid</div>
            <div className="text-xl font-bold text-green-600">₹{billing.paidAmount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600">Balance Due</div>
            <div className="text-xl font-bold text-red-600">₹{billing.balanceDue.toLocaleString()}</div>
          </div>
        </div>
        {billing.insuranceCovered > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200/50 text-xs text-gray-700">
            Insurance Coverage: ₹{billing.insuranceCovered.toLocaleString()}
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left">
              <th className="px-3 py-2 text-xs font-medium text-gray-600">Description</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-600 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {billing.lineItems.map(item => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <div>{item.description}</div>
                  <div className="text-xs text-gray-500">{item.category}</div>
                </td>
                <td className="px-3 py-2 text-right font-medium">₹{item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment History */}
      {billing.payments.length > 0 && (
        <div className="border rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Payment History</h4>
          <div className="space-y-2">
            {billing.payments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                  <span className="text-xs text-gray-600 ml-2">{payment.method}</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {billing.balanceDue > 0 && (
          <>
            <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Pay ₹{billing.balanceDue.toLocaleString()} Now
            </button>
            <button
              onClick={() => setShowEMI(!showEMI)}
              className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Create EMI Plan
            </button>
          </>
        )}
      </div>

      {/* EMI Calculator (simplified) */}
      {showEMI && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium mb-3">EMI Calculator</h4>
          <div className="space-y-2">
            <select className="w-full px-3 py-2 border rounded text-sm">
              <option>3 months - ₹{Math.ceil(billing.balanceDue / 3).toLocaleString()}/month</option>
              <option>6 months - ₹{Math.ceil(billing.balanceDue / 6).toLocaleString()}/month</option>
              <option>12 months - ₹{Math.ceil(billing.balanceDue / 12).toLocaleString()}/month</option>
            </select>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPaymentPlanWidget;
