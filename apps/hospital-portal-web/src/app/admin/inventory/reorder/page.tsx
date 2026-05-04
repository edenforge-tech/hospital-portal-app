'use client';

/**
 * Auto-Reorder Management Page  (/admin/inventory/reorder)
 *
 * Two tabs:
 *   1. Reorder History  — auto-generated purchase requisitions (AutoReorder type)
 *   2. Reorder Config   — per-item threshold settings (ReorderLevel / ReorderQuantity)
 *
 * Top controls:
 *   â€¢ "Run Now" button — manually triggers auto-reorder for the current tenant
 *   â€¢ Below-Reorder badge — count of items currently below threshold
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Play, ChevronDown, ChevronRight, AlertTriangle,
  Settings, Clock, CheckCircle, Edit, Save, X, EyeOff, Eye,
} from 'lucide-react';
import {
  inventoryReorderApi,
  ReorderHistoryDto,
  ReorderConfigDto,
} from '@/lib/api/inventory-service.api';
import { toast } from 'react-hot-toast';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    POCreated: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// â”€â”€â”€ History Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function HistoryRow({ req }: { req: ReorderHistoryDto }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => setOpen(p => !p)}
      >
        <td className="px-4 py-3">
          {open
            ? <ChevronDown className="w-4 h-4 text-gray-400" />
            : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </td>
        <td className="px-4 py-3 font-mono text-sm font-semibold">{req.requisitionNumber}</td>
        <td className="px-4 py-3 text-sm text-gray-700">
          {new Date(req.requisitionDate).toLocaleDateString('en-IN')}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{req.storeName ?? '—'}</td>
        <td className="px-4 py-3">
          <StatusBadge status={req.requisitionStatus} />
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{req.itemCount}</td>
        <td className="px-4 py-3 text-xs text-gray-400">
          {new Date(req.createdAt).toLocaleString('en-IN')}
        </td>
      </tr>
      {open && req.items.length > 0 && (
        <tr>
          <td colSpan={7} className="px-10 pb-4 bg-gray-50">
            <table className="w-full text-xs mt-2">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left pb-1">Item</th>
                  <th className="text-right pb-1">Required Qty</th>
                  <th className="text-right pb-1">Stock at Trigger</th>
                  <th className="text-left pb-1">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {req.items.map((it, i) => (
                  <tr key={i} className="py-1">
                    <td className="py-1.5 pr-3 font-medium">{it.itemName}</td>
                    <td className="text-right py-1.5 pr-3 text-blue-700 font-semibold">{it.requiredQuantity}</td>
                    <td className={`text-right py-1.5 pr-3 font-medium ${it.currentStock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {it.currentStock}
                    </td>
                    <td className="py-1.5 text-gray-500">{it.remarks ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

// â”€â”€â”€ Config Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ConfigRow({ item, onSaved }: { item: ReorderConfigDto; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [reorderLevel, setReorderLevel] = useState(item.reorderLevel);
  const [reorderQty, setReorderQty] = useState(item.reorderQuantity);
  const [saving, setSaving] = useState(false);
  const [suppressing, setSuppressing] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await inventoryReorderApi.updateConfig(item.id, {
        reorderLevel,
        reorderQuantity: reorderQty,
      });
      setEditing(false);
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setReorderLevel(item.reorderLevel);
    setReorderQty(item.reorderQuantity);
    setEditing(false);
  };

  const suppressItem = async () => {
    setSuppressing(true);
    try {
      await inventoryReorderApi.suppress(item.id);
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? e?.message ?? 'Failed to suppress item');
    } finally {
      setSuppressing(false);
    }
  };

  const enableItem = async () => {
    setSuppressing(true);
    try {
      await inventoryReorderApi.enable(item.id);
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? e?.message ?? 'Failed to enable item');
    } finally {
      setSuppressing(false);
    }
  };

  return (
    <tr className={`hover:bg-gray-50 ${item.belowReorder ? 'bg-red-50' : ''}`}>
      <td className="px-4 py-3 font-medium text-sm text-gray-900">
        <div className="flex items-center gap-2">
          {item.belowReorder && (
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
          )}
          {item.itemName}
        </div>
        {item.genericName && (
          <div className="text-xs text-gray-400">{item.genericName}</div>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{item.itemType}</span>
      </td>
      <td className={`px-4 py-3 text-sm font-semibold text-right ${item.belowReorder ? 'text-red-600' : 'text-gray-700'}`}>
        {item.currentStock} {item.unit}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <input
            type="number"
            min={0}
            value={reorderLevel}
            onChange={e => setReorderLevel(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20 text-sm text-right"
          />
        ) : (
          <span className="text-sm">{item.reorderLevel}</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <input
            type="number"
            min={0}
            value={reorderQty}
            onChange={e => setReorderQty(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20 text-sm text-right"
          />
        ) : (
          <span className="text-sm">{item.reorderQuantity}</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 text-right">
        {item.stockCoveragePercent != null ? `${item.stockCoveragePercent}%` : '—'}
      </td>
      <td className="px-4 py-3 text-center">
        {item.reorderSuppressed ? (
          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
            Suppressed
          </span>
        ) : (
          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
            Active
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="flex gap-1 justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-3 w-3" /> {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-1 px-2 py-1 text-xs border rounded text-gray-600 hover:bg-gray-50"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs border rounded text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Edit className="h-3 w-3" /> Edit
            </button>
            {item.reorderSuppressed ? (
              <button
                onClick={enableItem}
                disabled={suppressing}
                className="flex items-center gap-1 px-2 py-1 text-xs border rounded text-green-600 border-green-200 hover:bg-green-50 disabled:opacity-50"
              >
                <Eye className="h-3 w-3" /> Enable
              </button>
            ) : (
              <button
                onClick={suppressItem}
                disabled={suppressing}
                className="flex items-center gap-1 px-2 py-1 text-xs border rounded text-amber-600 border-amber-200 hover:bg-amber-50 disabled:opacity-50"
              >
                <EyeOff className="h-3 w-3" /> Suppress
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Tab = 'history' | 'config';

export default function ReorderPage() {
  const [tab, setTab] = useState<Tab>('history');

  // History state
  const [history, setHistory] = useState<ReorderHistoryDto[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStatus, setHistoryStatus] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);

  // Config state
  const [config, setConfig] = useState<ReorderConfigDto[]>([]);
  const [configTotal, setConfigTotal] = useState(0);
  const [configPage, setConfigPage] = useState(1);
  const [configSearch, setConfigSearch] = useState('');
  const [belowOnly, setBelowOnly] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);

  // Below-reorder count (for badge)
  const [belowCount, setBelowCount] = useState<number | null>(null);

  // Trigger state
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await inventoryReorderApi.history({
        page: historyPage,
        pageSize: 20,
        status: historyStatus || undefined,
      });
      setHistory(res.items);
      setHistoryTotal(res.total);
    } catch { /* non-fatal */ }
    finally { setHistoryLoading(false); }
  }, [historyPage, historyStatus]);

  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await inventoryReorderApi.config({
        page: configPage,
        pageSize: 50,
        search: configSearch || undefined,
        belowReorder: belowOnly || undefined,
      });
      setConfig(res.items);
      setConfigTotal(res.total);
      // Update below count from all items (page 1, large pageSize)
      if (!belowOnly && configPage === 1) {
        setBelowCount(res.items.filter(i => i.belowReorder).length);
      }
    } catch { /* non-fatal */ }
    finally { setConfigLoading(false); }
  }, [configPage, configSearch, belowOnly]);

  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { loadConfig(); }, [loadConfig]);

  const triggerReorder = async () => {
    setTriggering(true);
    setTriggerMsg(null);
    try {
      const res = await inventoryReorderApi.trigger();
      setTriggerMsg(res.message);
      loadHistory(); // Refresh history after trigger
    } catch (e: any) {
      setTriggerMsg(e?.response?.data?.error ?? e?.message ?? 'Trigger failed');
      toast.error(e?.response?.data?.error ?? e?.message ?? 'Trigger failed');
    } finally { setTriggering(false); }
  };

  const historyPageCount = Math.ceil(historyTotal / 20);
  const configPageCount = Math.ceil(configTotal / 50);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auto-Reorder</h1>
          <p className="text-sm text-gray-500 mt-1">
            Nightly reorder runs at 01:00 UTC. Use "Run Now" to trigger manually.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {belowCount != null && belowCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
              <AlertTriangle className="h-4 w-4" />
              {belowCount} item{belowCount !== 1 ? 's' : ''} below reorder level
            </div>
          )}
          <button
            onClick={triggerReorder}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {triggering ? 'Running…' : 'Run Now'}
          </button>
        </div>
      </div>

      {/* Trigger message */}
      {triggerMsg && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <CheckCircle className="inline h-4 w-4 mr-1.5 mb-0.5" />
          {triggerMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { id: 'history', label: 'Reorder History', icon: Clock },
          { id: 'config', label: 'Item Thresholds', icon: Settings },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* â”€â”€ History Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <select
              value={historyStatus}
              onChange={e => { setHistoryStatus(e.target.value); setHistoryPage(1); }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="POCreated">PO Created</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button onClick={loadHistory} className="p-2 border rounded-lg hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
            <span className="text-sm text-gray-500">{historyTotal} requisition{historyTotal !== 1 ? 's' : ''}</span>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-4 py-3" />
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Requisition #</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Store</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Generated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historyLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading…</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No auto-reorder history found.</td></tr>
                ) : history.map(req => (
                  <HistoryRow key={req.id} req={req} />
                ))}
              </tbody>
            </table>
          </div>

          {historyPageCount > 1 && (
            <div className="flex justify-center gap-2">
              <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
              <span className="px-3 py-1 text-sm text-gray-600">{historyPage} / {historyPageCount}</span>
              <button disabled={historyPage === historyPageCount} onClick={() => setHistoryPage(p => p + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {/* â”€â”€ Config Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {tab === 'config' && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search items…"
              value={configSearch}
              onChange={e => { setConfigSearch(e.target.value); setConfigPage(1); }}
              className="border rounded-lg px-3 py-2 text-sm w-64"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={belowOnly}
                onChange={e => { setBelowOnly(e.target.checked); setConfigPage(1); }}
                className="h-4 w-4 rounded border-gray-300 text-red-600"
              />
              Below reorder only
            </label>
            <button onClick={loadConfig} className="p-2 border rounded-lg hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
            <span className="text-sm text-gray-500">{configTotal} items</span>
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Item</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Current Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Reorder Level</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Reorder Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Coverage %</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {configLoading ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading…</td></tr>
                ) : config.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">No items found.</td></tr>
                ) : config.map(item => (
                  <ConfigRow key={item.id} item={item} onSaved={loadConfig} />
                ))}
              </tbody>
            </table>
          </div>

          {configPageCount > 1 && (
            <div className="flex justify-center gap-2">
              <button disabled={configPage === 1} onClick={() => setConfigPage(p => p - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
              <span className="px-3 py-1 text-sm text-gray-600">{configPage} / {configPageCount}</span>
              <button disabled={configPage === configPageCount} onClick={() => setConfigPage(p => p + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


