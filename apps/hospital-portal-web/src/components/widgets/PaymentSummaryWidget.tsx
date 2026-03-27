/**
 * Payment Summary Widget
 * Package breakdown, discounts, advance paid, balance, and payment history
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp as TrendingDown, Clock, CheckCircle2 as Check, AlertCircle, FileText, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi, type PaymentSummaryData } from '@/lib/api/widgets.api';

interface PaymentTransaction {
  id: string;
  date: Date;
  amount: number;
  mode: 'cash' | 'card' | 'upi' | 'insurance';
  receiptNo: string;
  description: string;
}

export default function PaymentSummaryWidget({
  widgetId,
  patientId,
  sessionId,
  size,
  isMinimized,
  data,
  onAction,
  onDataChange,
}: WidgetProps) {
  const [paymentData, setPaymentData] = useState<PaymentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      loadPaymentData();
    }
  }, [patientId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const data = await widgetsApi.getPaymentSummary(patientId);
      setPaymentData(data);
    } catch (err) {
      console.error('Error loading payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
        <DollarSign className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No patient selected</p>
        <p className="text-xs text-gray-400 mt-1">Select a patient to view payment summary</p>
      </div>
    );
  }

  if (loading || !paymentData) {
    return (
      <div className="flex items-center justify-center h-32">
        <Activity className="h-6 w-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading payment data...</span>
      </div>
    );
  }

  const isCompact = size === 'small';

  if (isCompact) {
    return (
      <div className="space-y-2">
        <div className="bg-blue-50 rounded p-2 border border-blue-200">
          <p className="text-xs text-gray-600">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">₹{paymentData.totalPayable.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded p-2 border border-orange-200">
          <p className="text-xs text-gray-600">Balance Due</p>
          <p className="text-lg font-bold text-orange-600">₹{paymentData.balanceDue.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  const daysToDue = paymentData.dueDate ? Math.ceil((new Date(paymentData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = daysToDue !== null && daysToDue < 0;
  const isUrgent = daysToDue !== null && daysToDue >= 0 && daysToDue <= 3;

  return (
    <div className="space-y-4">
      {/* Package Breakdown */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-gray-600" />
          <p className="text-sm font-semibold text-gray-900">Package Breakdown</p>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Package Amount</span>
            <span className="font-semibold text-gray-900">₹{paymentData.packageAmount.toLocaleString()}</span>
          </div>
          
          {paymentData.addons.map((addon, idx) => (
            <div key={idx} className="flex justify-between text-gray-600 pl-4">
              <span>+ {addon.name}</span>
              <span>₹{addon.amount.toLocaleString()}</span>
            </div>
          ))}
          
          <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
            <span className="text-gray-700">Subtotal</span>
            <span className="text-gray-900">₹{paymentData.subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Discounts & Insurance */}
      <div className="border border-gray-200 rounded-lg p-3 bg-green-50">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-green-600" />
          <p className="text-sm font-semibold text-gray-900">Discounts & Coverage</p>
        </div>
        
        <div className="space-y-2 text-sm">
          {/* Discount */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">{paymentData.discount.type} Discount</p>
            </div>
            <span className="font-semibold text-green-600">-₹{paymentData.discount.amount.toLocaleString()}</span>
          </div>
          
          {/* Insurance */}
          {paymentData.insuranceCoverage.amount > 0 && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-700">Insurance Coverage</p>
              <p className="text-xs text-gray-500">
                <span className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  paymentData.insuranceCoverage.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                )}>
                  {paymentData.insuranceCoverage.status}
                </span>
              </p>
            </div>
            <span className="font-semibold text-green-600">-₹{paymentData.insuranceCoverage.amount.toLocaleString()}</span>
          </div>
          )}
        </div>
      </div>

      {/* Total & Balance */}
      <div className="space-y-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Payable Amount</p>
              <p className="text-xs text-gray-500 mt-0.5">After discounts & insurance</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">₹{paymentData.totalPayable.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600">Advance Paid</p>
            </div>
            <p className="text-xl font-bold text-green-600">₹{paymentData.advancePaid.toLocaleString()}</p>
          </div>

          <div className={cn(
            'border rounded-lg p-3',
            isOverdue ? 'bg-red-50 border-red-200' : isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
          )}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className={cn(
                'h-4 w-4',
                isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-600'
              )} />
              <p className="text-xs text-gray-600">Balance Due</p>
            </div>
            <p className={cn(
              'text-xl font-bold',
              isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-900'
            )}>
              ₹{paymentData.balanceDue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Due Date Warning */}
        {(isOverdue || isUrgent) && (
          <div className={cn(
            'flex items-start gap-2 p-2 rounded text-xs',
            isOverdue ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
          )}>
            <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              {isOverdue
                ? `Payment overdue by ${Math.abs(daysToDue)} days!`
                : `Payment due in ${daysToDue} days`}
            </span>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="border border-gray-200 rounded-lg p-3">
        <p className="text-sm font-semibold text-gray-900 mb-3">Payment History</p>
        <div className="space-y-2">
          {paymentData.paymentHistory.map((txn, idx) => (
            <div key={idx} className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-600" />
                  <p className="text-sm text-gray-900 font-medium">₹{txn.amount.toLocaleString()}</p>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 uppercase">
                    {txn.mode}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {txn.date} • Receipt: {txn.reference}
                </p>
              </div>
              <button
                onClick={() => onAction?.({ type: 'VIEW_RECEIPT', payload: { receiptNo: txn.reference }, timestamp: new Date() })}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onAction?.({ type: 'COLLECT_PAYMENT', timestamp: new Date() })}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          Collect Payment
        </button>
        <button
          onClick={() => onAction?.({ type: 'PRINT_SUMMARY', timestamp: new Date() })}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Print
        </button>
      </div>
    </div>
  );
}
