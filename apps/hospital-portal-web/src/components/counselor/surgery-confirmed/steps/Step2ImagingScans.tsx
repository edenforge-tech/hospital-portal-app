'use client';

/**
 * Step2ImagingScans
 * Unified investigation management: Imaging scans + Lab tests (all departments).
 * S2-1: Load all orders from 3 sources (pre-op protocol + imaging + counselor lab)
 * S2-2: Add any investigation from grouped catalog (Imaging / Lab / Cardiac / Viral Markers)
 * S2-3: Upload at desk — file or URL per order
 * S2-4: Mark results received (source-aware routing)
 * S2-5: Step-complete: "Confirm All Investigations Ready"
 * Share-link: generates a patient upload link per order.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2, Circle, FileImage, Upload, ExternalLink, AlertTriangle,
  Link2, Phone, MessageSquare, ClipboardCopy, Loader2,
  Plus, Inbox, FlaskConical, Trash2, Camera, IndianRupee,
} from 'lucide-react';

// ── Imaging modalities (Imaging tab) ─────────────────────────────────────────
const IMAGING_MODALITIES = [
  { key: 'AScan',       label: 'A-Scan',      apiType: 'A-Scan',       hasEye: true,  price: 1500 },
  { key: 'BScan',       label: 'B-Scan',       apiType: 'B-Scan',       hasEye: true,  price: 1000 },
  { key: 'OCT',         label: 'OCT',          apiType: 'OCT',          hasEye: true,  price: 1500 },
  { key: 'OCTMacula',   label: 'OCT Macula',   apiType: 'OCT Macula',   hasEye: true,  price: 1500 },
  { key: 'OCTRNFL',     label: 'OCT RNFL',     apiType: 'OCT RNFL',     hasEye: true,  price: 1500 },
  { key: 'AsOct',       label: 'AS-OCT',       apiType: 'AS OCT',       hasEye: true,  price: 1500 },
  { key: 'CCT',         label: 'CCT',          apiType: 'CCT',          hasEye: true,  price: 500  },
  { key: 'FundusPhoto', label: 'Fundus Photo', apiType: 'Fundus Photo', hasEye: true,  price: 500  },
  { key: 'HVFFields',   label: 'Visual Field', apiType: 'HVF Fields',   hasEye: true,  price: 1000 },
] as const;

// Groups for the "Add" tabs
const ADD_GROUPS = ['Imaging', 'Lab / Blood', 'Cardiac', 'Viral Markers'] as const;
type AddGroup = typeof ADD_GROUPS[number];
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApi } from '@/lib/api';
import { toast } from 'sonner';
import type { WorkflowStepItem } from '@/hooks/use-pre-admission-workflow';

// Unified response from GET /patient-investigations aggregator
interface PatientInvestigationDto {
  id: string;
  testName: string;
  testCode?: string;
  category?: string;
  price?: number;
  urgency?: string;
  status: string;
  orderedAt: string;
  resultReceivedAt?: string;
  documentUrl?: string;
  orderedByName?: string;
  laterality?: string;
  sourceType: 'lab' | 'imaging' | 'preop';
}

interface CatalogItem {
  id: string;
  testName: string;
  testCode?: string;
  category?: string;
  price?: number;
  sampleType?: string;
  turnaroundHours?: number;
}

type UnifiedOrder = {
  id: string;
  testName: string;
  testType: string;
  status: string;
  orderDate: string;
  resultReceivedAt?: string;
  documentUrl?: string;
  orderedByName?: string;
  price?: number;
  source: 'preop' | 'lab' | 'imaging';
};


interface Props {
  scheduleId: string;
  sessionId?: string;
  patientId?: string;
  patientPhone?: string;
  patientAge?: number;
  items: WorkflowStepItem[];
  allWorkflowItems?: WorkflowStepItem[];
  onMarkItem: (itemId: string, isComplete: boolean, notes?: string, documentUrl?: string) => void;
  isMutating?: boolean;
}

export function Step2ImagingScans({ scheduleId, sessionId, patientId, patientPhone, patientAge, items, allWorkflowItems, onMarkItem, isMutating }: Props) {
  const qc = useQueryClient();
  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState('');
  const [noteText, setNoteText] = useState('');

  // Add-new order state
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [addGroup, setAddGroup] = useState<AddGroup>('Imaging');
  const [newModality, setNewModality] = useState<string | null>(null);
  const [newEye, setNewEye] = useState<'OD' | 'OS' | 'OU'>('OD');
  const [newUrgency, setNewUrgency] = useState<'Routine' | 'Urgent' | 'Stat'>('Routine');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);

  // Upload-at-desk per order (file or URL)
  const [deskUploadFor, setDeskUploadFor] = useState<string | null>(null);
  const [deskDocUrl, setDeskDocUrl] = useState('');
  const [deskFile, setDeskFile] = useState<File | null>(null);
  const [deskFilePreview, setDeskFilePreview] = useState<string | null>(null);

  // Share-link state (per-order)
  type LinkData = { id: string; linkUrl: string; expiresAt: string };
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, LinkData>>({});
  const [showShareFor, setShowShareFor] = useState<string | null>(null);

  const completedCount = items.filter((i) => i.isComplete).length;
  const blockers = items.filter((i) => i.isBlocking && !i.isComplete);

  // ── S2-1: All investigations — single aggregator call ────────────────────
  const investigationsQueryKey = ['patient-investigations', patientId];
  const { data: investigations = [], isLoading: ordersLoading } = useQuery<PatientInvestigationDto[]>({
    queryKey: investigationsQueryKey,
    enabled: !!patientId,
    staleTime: 30_000,
    queryFn: async () => {
      const api = getApi();
      const res = await api.get('/patient-investigations', { params: { patientId, includeCompleted: false } });
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // ordersQueryKey kept as alias for invalidations on preop mutations
  const ordersQueryKey = investigationsQueryKey;

  // ── Investigation catalog (for Add panel) ─────────────────────────────────
  const { data: catalogItems = [] } = useQuery<CatalogItem[]>({
    queryKey: ['investigation-catalog'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const api = getApi();
      try {
        const res = await api.get('/PreOpTestManagement/lab-catalog');
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        // Static fallback with prices
        return [
          { id: 'fb1', testName: 'Complete Blood Count (CBC)', testCode: 'CBC', category: 'Lab / Blood', price: 180 },
          { id: 'fb2', testName: 'Fasting Blood Sugar (FBS)', testCode: 'FBS', category: 'Lab / Blood', price: 150 },
          { id: 'fb3', testName: 'Random Blood Sugar (RBS)', testCode: 'RBS', category: 'Lab / Blood', price: 120 },
          { id: 'fb4', testName: 'HbA1c', testCode: 'HBA1C', category: 'Lab / Blood', price: 350 },
          { id: 'fb5', testName: 'Blood Urea Nitrogen (BUN)', testCode: 'BUN', category: 'Lab / Blood', price: 150 },
          { id: 'fb6', testName: 'Serum Creatinine', testCode: 'CREAT', category: 'Lab / Blood', price: 180 },
          { id: 'fb7', testName: 'LFT (Liver Function Tests)', testCode: 'LFT', category: 'Lab / Blood', price: 450 },
          { id: 'fb8', testName: 'Blood Group & Rh Factor', testCode: 'ABO-RH', category: 'Lab / Blood', price: 200 },
          { id: 'fb9', testName: 'Coagulation Profile (PT/INR)', testCode: 'PT-INR', category: 'Lab / Blood', price: 280 },
          { id: 'fb10', testName: 'Serum Electrolytes', testCode: 'ELEC', category: 'Lab / Blood', price: 320 },
          { id: 'c1', testName: 'ECG (Electrocardiogram)', testCode: 'ECG', category: 'Cardiac', price: 250 },
          { id: 'c2', testName: 'Echocardiogram (Echo)', testCode: 'ECHO', category: 'Cardiac', price: 1200 },
          { id: 'c3', testName: 'Chest X-Ray (CXR)', testCode: 'CXR', category: 'Cardiac', price: 350 },
          { id: 'v1', testName: 'HIV I & II', testCode: 'HIV', category: 'Viral Markers', price: 350 },
          { id: 'v2', testName: 'HBsAg (Hepatitis B)', testCode: 'HBSAG', category: 'Viral Markers', price: 280 },
          { id: 'v3', testName: 'HCV (Hepatitis C)', testCode: 'HCV', category: 'Viral Markers', price: 350 },
          { id: 'v4', testName: 'VDRL (Syphilis)', testCode: 'VDRL', category: 'Viral Markers', price: 200 },
        ];
      }
    },
  });

  // Group catalog by category mapped to AddGroup tabs
  const CATEGORY_TO_GROUP: Record<string, AddGroup> = {
    'Lab / Blood': 'Lab / Blood',
    'Lab': 'Lab / Blood',
    'Laboratory': 'Lab / Blood',
    'Haematology': 'Lab / Blood',
    'Biochemistry': 'Lab / Blood',
    'Blood Tests': 'Lab / Blood',
    'Cardiac': 'Cardiac',
    'Cardiology': 'Cardiac',
    'Viral Markers': 'Viral Markers',
    'Virology': 'Viral Markers',
    'Serology': 'Viral Markers',
  };
  const catalogByGroup = (group: AddGroup): CatalogItem[] =>
    catalogItems.filter(
      (c) => CATEGORY_TO_GROUP[c.category ?? ''] === group
    );

  // ── Build unified order list from aggregator ────────────────────────────
  const allOrders: UnifiedOrder[] = investigations.map((o): UnifiedOrder => ({
    id: o.id,
    testName: o.sourceType === 'imaging' && o.laterality
      ? `${o.testName} (${o.laterality})`
      : o.testName,
    testType: o.category ?? o.sourceType,
    status: o.status,
    orderDate: o.orderedAt,
    resultReceivedAt: o.resultReceivedAt,
    documentUrl: o.documentUrl,
    orderedByName: o.orderedByName,
    price: o.price,
    source: o.sourceType,
  }));

  // ── Dedup check ───────────────────────────────────────────────────────────
  const isAlreadyOrdered = (testName: string): boolean => {
    const norm = testName.toLowerCase().trim();
    return allOrders.some(
      (o) =>
        o.status !== 'Cancelled' &&
        o.status !== 'Rejected' &&
        o.testName.toLowerCase().trim() === norm
    );
  };


  // ── S2-2a: Add imaging order ──────────────────────────────────────────────
  const addImagingMutation = useMutation({
    mutationFn: async (payload: { imagingType: string; laterality?: 'OD' | 'OS' | 'OU'; urgency: string }) => {
      const api = getApi();
      const res = await api.post('/Imaging/order', {
        patientId,
        imagingType: payload.imagingType,
        laterality: payload.laterality,
        urgency: payload.urgency,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationsQueryKey });
      toast.success('Imaging order added');
      setNewModality(null);
      setNewEye('OD');
      setNewUrgency('Routine');
      setShowAddOrder(false);
    },
    onError: () => toast.error('Failed to add imaging order'),
  });

  // ── S2-2b: Add lab / investigation order ──────────────────────────────────
  const addLabMutation = useMutation({
    mutationFn: async (item: CatalogItem) => {
      if (!sessionId || !patientId) throw new Error('Missing sessionId or patientId');
      const api = getApi();
      const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
      const res = await api.post('/PreOpTestManagement/lab-orders', {
        patientId,
        sessionId,
        tests: [{
          catalogId: isGuid ? item.id : null,
          testName: item.testName,
          testCode: item.testCode ?? null,
          price: item.price ?? null,
        }],
        urgency: newUrgency,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationsQueryKey });
      toast.success('Investigation order added');
      setSelectedCatalogItem(null);
      setShowAddOrder(false);
    },
    onError: () => toast.error('Failed to add investigation order'),
  });

  // ── S2-5: Delete order (preop/lab) ────────────────────────────────────────
  const deleteOrderMutation = useMutation({
    mutationFn: async ({ orderId, source }: { orderId: string; source: UnifiedOrder['source'] }) => {
      const api = getApi();
      if (source === 'lab') {
        await api.delete(`/PreOpTestManagement/lab-orders/${orderId}`);
      } else {
        await api.delete(`/PreOpTestManagement/orders/${orderId}`);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationsQueryKey });
      toast.success('Order removed');
    },
    onError: () => toast.error('Failed to remove order'),
  });

  // ── S2-4: Mark results received (source-aware) ────────────────────────────
  const markResultsMutation = useMutation({
    mutationFn: async ({ orderId, documentUrl }: { orderId: string; documentUrl?: string }) => {
      const api = getApi();
      await api.post(`/PreOpTestManagement/orders/${orderId}/mark-results-received`, {
        documentUrl: documentUrl || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationsQueryKey });
      toast.success('Results marked as received');
      setDeskUploadFor(null);
      setDeskDocUrl('');
      setDeskFile(null);
      setDeskFilePreview(null);
    },
    onError: () => toast.error('Failed to mark results received'),
  });

  const markImagingMutation = useMutation({
    mutationFn: async ({ orderId, documentUrl }: { orderId: string; documentUrl?: string }) => {
      const api = getApi();
      await api.patch(`/Imaging/${orderId}/status`, {
        status: 'Completed',
        imageStoragePath: documentUrl || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationsQueryKey });
      toast.success('Imaging results marked as received');
      setDeskUploadFor(null);
      setDeskDocUrl('');
      setDeskFile(null);
      setDeskFilePreview(null);
    },
    onError: () => toast.error('Failed to update imaging order'),
  });

  const markLabMutation = useMutation({
    mutationFn: async ({ orderId, documentUrl }: { orderId: string; documentUrl?: string }) => {
      const api = getApi();
      await api.patch(`/PreOpTestManagement/lab-orders/${orderId}/mark-received`, {
        documentUrl: documentUrl || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: investigationsQueryKey });
      toast.success('Lab results marked as received');
      setDeskUploadFor(null);
      setDeskDocUrl('');
      setDeskFile(null);
      setDeskFilePreview(null);
    },
    onError: () => toast.error('Failed to update lab order'),
  });


  // ── Generate upload link (per-order) ─────────────────────────────────────
  const generateLinkMutation = useMutation<LinkData, Error, string>({
    mutationFn: async (orderId: string) => {
      const api = getApi();
      const res = await api.post('/patient-uploads/generate-link', {
        patientId,
        scheduleId,
        orderId,
        purpose: 'pre_op_documents',
        description: 'Please upload your pre-operative scan documents',
        expiresInHours: 72,
      });
      return res.data as LinkData;
    },
    onSuccess: (data, orderId) => {
      setGeneratedLinks(prev => ({ ...prev, [orderId]: data }));
      setShowShareFor(orderId);
      toast.success('Upload link generated');
    },
    onError: () => toast.error('Failed to generate upload link'),
  });

  // Poll upload status for currently shown share panel
  const activeLink = showShareFor ? generatedLinks[showShareFor] : null;
  const { data: uploadStatus } = useQuery<{ fileCount: number; isExpired: boolean; usedAt?: string }>({
    queryKey: ['patient-upload-status', activeLink?.id],
    queryFn: async () => {
      const api = getApi();
      const res = await api.get(`/patient-uploads/${activeLink!.id}/status`);
      return res.data;
    },
    enabled: !!activeLink?.id,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const copyToClipboard = (link: LinkData) => {
    navigator.clipboard.writeText(link.linkUrl).then(
      () => toast.success('Link copied to clipboard'),
      () => toast.error('Failed to copy')
    );
  };

  const getWhatsappUrl = (link: LinkData) =>
    patientPhone
      ? `https://wa.me/${patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Please upload your pre-op documents using this secure link: ${link.linkUrl}`)}`
      : null;

  // Checklist confirmation item (S2-5)
  const confirmItem = items.find((i) => i.itemKey === 'scans_confirmed' || i.itemKey?.includes('scan') || i.itemKey?.includes('imaging'));
  const allResultsReceived = allOrders.length > 0 && allOrders.every((o) => !!o.resultReceivedAt);

  // Auto-complete labs_done + ecg_done (Step 4 items) when all orders have results
  const autoMarkLabsRef = useRef(false);
  useEffect(() => {
    if (!allResultsReceived || autoMarkLabsRef.current || !allWorkflowItems) return;
    autoMarkLabsRef.current = true;
    const labsItem = allWorkflowItems.find((i) => i.itemKey === 'labs_done');
    const ecgItem  = allWorkflowItems.find((i) => i.itemKey === 'ecg_done');
    if (labsItem && !labsItem.isComplete)
      onMarkItem(labsItem.id, true, 'Auto-completed: all investigation results received');
    if (ecgItem && !ecgItem.isComplete)
      onMarkItem(ecgItem.id, true, 'Auto-completed: all investigation results received');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allResultsReceived]);

  const handleDeskFileSelect = (orderId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (deskFilePreview) URL.revokeObjectURL(deskFilePreview);
    setDeskFile(file);
    setDeskFilePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    setDeskUploadFor(orderId);
    setDeskDocUrl('');
  };

  return (
    <div className="space-y-4">
      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Blocking items incomplete</p>
            <p className="text-xs text-red-600 mt-0.5">
              {blockers.map((b) => b.itemLabel).join(', ')} must be completed before proceeding.
            </p>
          </div>
        </div>
      )}

      {/* ── S2-1: Existing orders ──────────────────────────────────────────── */}
      <div className="border border-indigo-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-indigo-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">Investigations & Scans</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-600">
              {allOrders.filter((o) => !!o.resultReceivedAt).length}/{allOrders.length} results in
            </span>
            <button
              type="button"
              onClick={() => setShowAddOrder((v) => !v)}
              className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        </div>

        {ordersLoading && (
          <div className="px-4 py-3 space-y-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* S2-2: Add investigation — grouped tabs */}
        {showAddOrder && (
          <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-50/50 space-y-3">
            {/* Group tabs */}
            <div className="flex gap-1 flex-wrap border-b border-indigo-100 pb-2">
              {ADD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => { setAddGroup(g); setNewModality(null); setSelectedCatalogItem(null); }}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-md transition-colors font-medium',
                    addGroup === g
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300',
                  )}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Urgency (applies to all groups) */}
            <div>
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Urgency</p>
              <div className="flex gap-1">
                {(['Routine', 'Urgent', 'Stat'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setNewUrgency(u)}
                    className={cn(
                      'text-xs px-2 py-1 rounded-md border transition-colors',
                      newUrgency === u ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-200 hover:border-indigo-300',
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Imaging tab ───────────────────────────────────────────── */}
            {addGroup === 'Imaging' && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {IMAGING_MODALITIES.map((m) => {
                    const name = `${m.apiType}${newEye !== 'OU' ? ` (${newEye})` : ' (OU)'}`;
                    const dup = isAlreadyOrdered(name);
                    return (
                      <button
                        key={m.key}
                        type="button"
                        disabled={dup}
                        onClick={() => setNewModality(m.key)}
                        title={dup ? 'Already ordered' : m.label}
                        className={cn(
                          'flex flex-col items-start text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                          newModality === m.key
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300',
                        )}
                      >
                        <span className="font-medium">{m.label}</span>
                        <span className={cn('text-[10px]', newModality === m.key ? 'text-indigo-200' : 'text-green-600')}>
                          ₹{m.price}/eye{dup ? ' ✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Eye selector */}
                {newModality && (
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Eye</p>
                    <div className="flex gap-1">
                      {(['OD', 'OS', 'OU'] as const).map((eye) => (
                        <button
                          key={eye}
                          type="button"
                          onClick={() => setNewEye(eye)}
                          className={cn(
                            'text-xs px-2 py-1 rounded-md border transition-colors',
                            newEye === eye ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 border-gray-200 hover:border-indigo-300',
                          )}
                        >
                          {eye}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!newModality || addImagingMutation.isPending}
                    onClick={() => {
                      const mod = IMAGING_MODALITIES.find((m) => m.key === newModality)!;
                      addImagingMutation.mutate({ imagingType: mod.apiType, laterality: newEye, urgency: newUrgency });
                    }}
                    className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {addImagingMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Add Imaging Order
                  </button>
                  <button type="button" onClick={() => { setShowAddOrder(false); setNewModality(null); }} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">Cancel</button>
                </div>
              </>
            )}

            {/* ── Lab / Cardiac / Viral Markers tab ─────────────────────── */}
            {addGroup !== 'Imaging' && (
              <>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {catalogByGroup(addGroup).length === 0 && (
                    <p className="text-xs text-gray-400 py-1">No items in catalog for this category.</p>
                  )}
                  {catalogByGroup(addGroup).map((c) => {
                    const dup = isAlreadyOrdered(c.testName);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={dup}
                        onClick={() => setSelectedCatalogItem(selectedCatalogItem?.id === c.id ? null : c)}
                        title={dup ? 'Already ordered' : c.testName}
                        className={cn(
                          'text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                          selectedCatalogItem?.id === c.id
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300',
                        )}
                      >
                        <span className="block font-medium">{c.testName}</span>
                        {c.price != null && (
                          <span className={cn('text-[10px]', selectedCatalogItem?.id === c.id ? 'text-indigo-200' : 'text-green-600')}>
                            ₹{c.price}
                          </span>
                        )}
                        {dup && <span className="ml-1 text-[10px] opacity-60">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!selectedCatalogItem || addLabMutation.isPending}
                    onClick={() => {
                      if (selectedCatalogItem) addLabMutation.mutate(selectedCatalogItem);
                    }}
                    className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {addLabMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    Add Order{selectedCatalogItem ? ` — ${selectedCatalogItem.testName}` : ''}
                  </button>
                  <button type="button" onClick={() => { setShowAddOrder(false); setSelectedCatalogItem(null); }} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">Cancel</button>
                </div>
              </>
            )}
          </div>
        )}

        {allOrders.length === 0 && !ordersLoading && (
          <p className="px-4 py-3 text-xs text-gray-400">No orders yet. Add an order above.</p>
        )}

        <div className="divide-y divide-gray-100">
          {allOrders.map((order) => {
            const orderLink = generatedLinks[order.id];
            const isShowingShare = showShareFor === order.id;
            const isMarkingThisOrder = (markResultsMutation.isPending || markImagingMutation.isPending || markLabMutation.isPending) && deskUploadFor === order.id;
            return (
            <div key={order.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <FlaskConical className={cn('w-4 h-4 flex-shrink-0', order.resultReceivedAt ? 'text-green-500' : 'text-gray-400')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn('text-sm font-medium', order.resultReceivedAt ? 'text-green-700' : 'text-gray-800')}>{order.testName}</p>
                    {/* Source badge */}
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', {
                      'bg-violet-100 text-violet-700': order.source === 'imaging',
                      'bg-blue-100 text-blue-700': order.source === 'lab',
                      'bg-teal-100 text-teal-700': order.source === 'preop',
                    })}>
                      {order.source === 'imaging' ? 'Imaging' : order.source === 'lab' ? 'Lab' : 'Pre-Op'}
                    </span>
                    {/* Price badge */}
                    {order.price != null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 flex items-center gap-0.5">
                        <IndianRupee className="w-2.5 h-2.5" />{order.price}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {order.testType} · {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : '—'}
                    {order.orderedByName ? ` · ${order.orderedByName}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {order.resultReceivedAt ? (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Results in
                    </span>
                  ) : (
                    <>
                      {/* 📎 File upload */}
                      <label
                        className="p-1 rounded cursor-pointer text-gray-300 hover:text-teal-500 hover:bg-teal-50 transition-colors"
                        title="Attach file"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={handleDeskFileSelect(order.id)}
                        />
                      </label>
                      {/* 📷 Camera */}
                      <label
                        className="p-1 rounded cursor-pointer text-gray-300 hover:text-teal-500 hover:bg-teal-50 transition-colors"
                        title="Take photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleDeskFileSelect(order.id)}
                        />
                      </label>
                    </>
                  )}
                  {order.documentUrl && (
                    <a href={order.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {/* Share link per order */}
                  <button
                    type="button"
                    title={orderLink ? 'View share link' : 'Generate upload link'}
                    onClick={() => {
                      if (orderLink) {
                        setShowShareFor(isShowingShare ? null : order.id);
                      } else {
                        generateLinkMutation.mutate(order.id);
                      }
                    }}
                    className={cn('p-1 rounded transition-colors', orderLink ? 'text-teal-600 hover:bg-teal-50' : 'text-gray-300 hover:text-teal-500 hover:bg-teal-50')}
                  >
                    {generateLinkMutation.isPending && generateLinkMutation.variables === order.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Link2 className="w-3.5 h-3.5" />
                    }
                  </button>
                  {/* Delete (lab + preop only, not imaging) */}
                  {order.source !== 'imaging' && (
                    <button
                      type="button"
                      disabled={deleteOrderMutation.isPending}
                      onClick={() => deleteOrderMutation.mutate({ orderId: order.id, source: order.source })}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                      title="Remove order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* S2-3/S2-4: Upload at desk + mark results (source-aware) */}
              {deskUploadFor === order.id && (
                <div className="mt-2 ml-7 space-y-2">
                  {deskFile && deskFilePreview && (
                    <img src={deskFilePreview} alt="Document preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                  )}
                  {deskFile && !deskFilePreview && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <FileImage className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate max-w-[160px]">{deskFile.name}</span>
                    </div>
                  )}
                  {!deskFile && (
                    <input
                      type="url"
                      placeholder="Or paste document URL"
                      value={deskDocUrl}
                      onChange={(e) => setDeskDocUrl(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isMarkingThisOrder || (!deskFile && !deskDocUrl)}
                      onClick={() => {
                        const url = deskFilePreview || deskDocUrl || undefined;
                        if (order.source === 'imaging') {
                          markImagingMutation.mutate({ orderId: order.id, documentUrl: url });
                        } else if (order.source === 'lab') {
                          markLabMutation.mutate({ orderId: order.id, documentUrl: url });
                        } else {
                          markResultsMutation.mutate({ orderId: order.id, documentUrl: url });
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                      {isMarkingThisOrder ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Mark Results Received
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeskUploadFor(null); setDeskDocUrl(''); setDeskFile(null); setDeskFilePreview(null); }}
                      className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Per-order share link panel */}
              {isShowingShare && orderLink && (
                <div className="mt-2 ml-7 bg-teal-50 border border-teal-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 bg-white border border-teal-200 rounded-lg px-3 py-1.5">
                    <Link2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="flex-1 text-xs text-gray-600 truncate">{orderLink.linkUrl}</p>
                  </div>
                  <p className="text-xs text-gray-400">Expires: {new Date(orderLink.expiresAt).toLocaleString('en-IN')}</p>
                  {uploadStatus && uploadStatus.fileCount > 0 && (
                    <p className="text-xs text-green-600 font-semibold">✓ Patient uploaded {uploadStatus.fileCount} file{uploadStatus.fileCount > 1 ? 's' : ''}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderLink)}
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-200"
                    >
                      <ClipboardCopy className="w-3 h-3" /> Copy
                    </button>
                    {patientPhone && (
                      <>
                        <a
                          href={getWhatsappUrl(orderLink) ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg hover:bg-green-200"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                        <a
                          href={`sms:${patientPhone}?body=${encodeURIComponent(`Upload pre-op documents: ${orderLink.linkUrl}`)}`}
                          className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-200"
                        >
                          <Phone className="w-3 h-3" /> SMS
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedLinks(prev => { const n = { ...prev }; delete n[order.id]; return n; });
                        setShowShareFor(null);
                      }}
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-200"
                    >
                      New Link
                    </button>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* S2-5: Confirm All Investigations Ready */}
        {allOrders.length > 0 && (
          <div className="px-4 py-3 border-t border-indigo-100 bg-indigo-50/30">
            {allResultsReceived && confirmItem && !confirmItem.isComplete ? (
              <button
                type="button"
                disabled={isMutating}
                onClick={() => onMarkItem(confirmItem.id, true, `All ${allOrders.length} investigation results received`)}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm All Investigations Ready
              </button>
            ) : confirmItem?.isComplete ? (
              <p className="text-sm text-green-600 font-semibold flex items-center justify-center gap-2 py-1">
                <CheckCircle2 className="w-4 h-4" /> All investigations confirmed
              </p>
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">
                Mark all {allOrders.length} results as received to confirm
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Scan checklist ──────────────────────────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-medium text-gray-700">Scan & Investigation Checklist</span>
          </div>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              completedCount === items.length
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {completedCount}/{items.length}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item) => {
            // Age-based hint for ECG
            const isECG = item.itemKey === 'ecg_done';
            const ecgAutoRequired = isECG && patientAge != null && patientAge >= 40;
            const ecgWaived = isECG && patientAge != null && patientAge < 40;

            return (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    disabled={isMutating || ecgWaived}
                    onClick={() => {
                      if (item.isComplete) {
                        onMarkItem(item.id, false);
                      } else if (item.requiresDocument) {
                        setUploadFor(item.id);
                      } else {
                        onMarkItem(item.id, true);
                      }
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {item.isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-500" />
                    ) : (
                      <Circle
                        className={cn(
                          'w-5 h-5 transition-colors',
                          ecgWaived
                            ? 'text-gray-200'
                            : 'text-gray-300 hover:text-teal-400'
                        )}
                      />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          item.isComplete
                            ? 'text-gray-400 line-through'
                            : ecgWaived
                            ? 'text-gray-400'
                            : 'text-gray-800'
                        )}
                      >
                        {item.itemLabel}
                        {item.isMandatory && !item.isComplete && !ecgWaived && (
                          <span className="ml-1 text-xs text-red-500">*</span>
                        )}
                        {item.isBlocking && !item.isComplete && (
                          <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                            blocking
                          </span>
                        )}
                      </p>
                      {ecgAutoRequired && !item.isComplete && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Required (age ≥ 40)
                        </span>
                      )}
                      {ecgWaived && (
                        <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                          Waived (age &lt; 40)
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}

                    {item.documentUrl && (
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View document
                      </a>
                    )}
                    {item.notes && (
                      <p className="text-xs text-teal-600 mt-0.5 italic">Note: {item.notes}</p>
                    )}
                  </div>

                  {item.requiresDocument && !item.isComplete && !ecgWaived && (
                    <button
                      type="button"
                      onClick={() => setUploadFor(item.id)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Attach
                    </button>
                  )}
                </div>

                {/* Document attach inline form */}
                {uploadFor === item.id && (
                  <div className="mt-2 ml-8 space-y-2">
                    <input
                      type="url"
                      placeholder="Document URL (or leave blank)"
                      value={docUrl}
                      onChange={(e) => setDocUrl(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => {
                          onMarkItem(item.id, true, noteText || undefined, docUrl || undefined);
                          setUploadFor(null);
                          setDocUrl('');
                          setNoteText('');
                        }}
                        className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                      >
                        Mark Done
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUploadFor(null); setDocUrl(''); setNoteText(''); }}
                        className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
