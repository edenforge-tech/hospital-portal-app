'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Package, Truck, CheckCircle2 } from 'lucide-react';
import { opticalOrdersApi, OpticalOrder } from '@/lib/api/optical-orders.api';

interface OpticalTabProps {
  patientId: string;
}

export function OpticalTab({ patientId }: OpticalTabProps) {
  const [orders, setOrders] = useState<OpticalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [patientId]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await opticalOrdersApi.getByPatient(patientId);
      setOrders(response.data || []);
    } catch (err: any) {
      console.error('Error loading optical orders:', err);
      setError('Failed to load optical orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (id: string) => {
    try {
      await opticalOrdersApi.markDelivered(id);
      loadOrders();
    } catch (err) {
      console.error('Error marking delivered:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading optical orders...</span>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    ordered: 'bg-blue-100 text-blue-800',
    in_production: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-orange-100 text-orange-800',
  };

  const PrescriptionGrid = ({ order }: { order: OpticalOrder }) => (
    <div className="mt-3 bg-gray-50 rounded-lg p-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left py-1">Eye</th>
            <th className="text-center py-1">SPH</th>
            <th className="text-center py-1">CYL</th>
            <th className="text-center py-1">AXIS</th>
            <th className="text-center py-1">ADD</th>
            <th className="text-center py-1">VA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="font-medium text-gray-700 py-1">OD (R)</td>
            <td className="text-center">{order.odSphere || '-'}</td>
            <td className="text-center">{order.odCylinder || '-'}</td>
            <td className="text-center">{order.odAxis || '-'}</td>
            <td className="text-center">{order.odAdd || '-'}</td>
            <td className="text-center">{order.odVa || '-'}</td>
          </tr>
          <tr>
            <td className="font-medium text-gray-700 py-1">OS (L)</td>
            <td className="text-center">{order.osSphere || '-'}</td>
            <td className="text-center">{order.osCylinder || '-'}</td>
            <td className="text-center">{order.osAxis || '-'}</td>
            <td className="text-center">{order.osAdd || '-'}</td>
            <td className="text-center">{order.osVa || '-'}</td>
          </tr>
        </tbody>
      </table>
      {order.pd && <p className="text-xs text-gray-500 mt-1">PD: {order.pd}{order.pdRight ? ` (R: ${order.pdRight}, L: ${order.pdLeft})` : ''}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Orders */}
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  {order.orderType === 'contact_lenses' ? <Eye className="w-5 h-5 text-indigo-600" /> :
                   <Package className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 capitalize">{order.orderType?.replace(/_/g, ' ')}</h4>
                  {order.orderNumber && <p className="text-xs text-gray-500">{order.orderNumber}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
                {order.status === 'ready' && (
                  <button onClick={() => handleDeliver(order.id)} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Deliver
                  </button>
                )}
              </div>
            </div>

            <PrescriptionGrid order={order} />

            {/* Frame & Lens Details */}
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              {(order.frameBrand || order.frameModel || order.frameType) && (
                <div>
                  <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">Frame</h5>
                  <p className="text-gray-900">{[order.frameBrand, order.frameModel].filter(Boolean).join(' ') || order.frameType}</p>
                  {order.frameColor && <p className="text-gray-500">{order.frameColor}</p>}
                </div>
              )}
              {(order.lensType || order.lensMaterial || order.lensCoating) && (
                <div>
                  <h5 className="text-xs font-medium text-gray-500 uppercase mb-1">Lens</h5>
                  <p className="text-gray-900">{[order.lensType, order.lensMaterial].filter(Boolean).join(' - ')}</p>
                  {order.lensCoating && <p className="text-gray-500">Coating: {order.lensCoating}</p>}
                  {order.tint && <p className="text-gray-500">Tint: {order.tint}</p>}
                </div>
              )}
            </div>

            {/* Order info */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              {order.orderDate && <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>}
              {order.estimatedDelivery && <span>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>}
              {order.deliveredAt && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</span>}
              {order.prescribedByName && <span>Prescribed by: {order.prescribedByName}</span>}
              {order.amount != null && <span className="font-medium text-gray-600">Amount: ${order.amount.toFixed(2)}{order.paidAmount != null ? ` (Paid: $${order.paidAmount.toFixed(2)})` : ''}</span>}
            </div>

            {order.notes && <p className="mt-2 text-sm text-gray-500 italic">{order.notes}</p>}
          </div>
        ))}
      </div>

      {orders.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No optical orders found for this patient.</p>
        </div>
      )}
    </div>
  );
}
