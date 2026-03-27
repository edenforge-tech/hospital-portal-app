'use client';

/**
 * CounsellingSheet
 * A screen-renderable A4-styled counselling sheet.
 *
 * Usage:
 *   - Embed in a hidden div and capture with html2canvas → pdf (via printElementAsPDF)
 *   - OR render visually in a modal / print preview panel
 *
 * The component is intentionally self-contained with inline-compatible Tailwind
 * so it captures correctly headlessly.
 */

import React from 'react';
import type { CounsellingSheetData } from '@/lib/pdf-generator';

// ─── Helpers ────────────────────────────────────────────────────────────────

const DEFAULT_CONSENT =
  'I, the undersigned, confirm that I have received counselling regarding the above-mentioned procedure(s),' +
  ' including the risks, benefits, alternatives and estimated costs. I have had the opportunity to ask questions' +
  ' and have them answered to my satisfaction. I understand that the final cost may vary based on intra-operative' +
  ' findings and I consent to proceed with the recommended management plan.';

const fmt = (n?: number | null) =>
  n != null
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(n)
    : '—';

// ─── Component ───────────────────────────────────────────────────────────────

interface CounsellingSheetProps {
  data: CounsellingSheetData;
  /** If true, renders a compact preview card (not full A4) */
  preview?: boolean;
}

export const CounsellingSheet = React.forwardRef<HTMLDivElement, CounsellingSheetProps>(
  function CounsellingSheet({ data, preview = false }, ref) {
    const totalAmount =
          (data.totalAmount ??
          data.procedures.reduce((sum, p) => sum + (p.amount ?? 0), 0)) || undefined;
    return (
      <div
        ref={ref}
        id="counselling-sheet-print"
        className={
          preview
            ? 'bg-white rounded-lg border border-gray-200 overflow-auto max-h-[80vh] text-xs'
            : 'bg-white text-xs font-sans'
        }
        style={{
          width: preview ? '100%' : '210mm',
          minHeight: preview ? undefined : '297mm',
          padding: preview ? '16px' : '18mm',
          boxSizing: 'border-box',
          color: '#111827',
        }}
      >
        {/* ── Hospital Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          {data.hospitalLogoBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.hospitalLogoBase64} alt="Hospital Logo" style={{ height: '48px', marginRight: '12px', objectFit: 'contain' }} />
          )}
          <div style={{ flex: 1, textAlign: data.hospitalLogoBase64 ? 'left' : 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{data.hospitalName}</p>
            {data.hospitalAddress && (
              <p style={{ fontSize: '9px', color: '#6B7280', marginTop: '2px' }}>{data.hospitalAddress}</p>
            )}
            {data.hospitalPhone && (
              <p style={{ fontSize: '9px', color: '#6B7280' }}>Ph: {data.hospitalPhone}</p>
            )}
          </div>
        </div>

        <div style={{ borderTop: '2px solid #2563EB', marginBottom: '6px' }} />

        <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', color: '#1E40AF', marginBottom: '4px', letterSpacing: '0.05em' }}>
          COUNSELLING SUMMARY SHEET
        </p>
        <p style={{ textAlign: 'center', fontSize: '8px', color: '#6B7280', marginBottom: '8px' }}>
          {data.sessionNumber ? `Session #: ${data.sessionNumber}     ` : ''}{`Date: ${data.sessionDate}`}
        </p>

        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />

        {/* ── Patient Details ── */}
        <SectionTitle>PATIENT DETAILS</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '9px' }}>
          <tbody>
            <KVRow left={['Patient Name', data.patientName]} right={['MRN', data.patientMRN]} />
            <KVRow left={['Date of Birth', data.patientDOB || (data.patientAge ? `${data.patientAge} yrs` : undefined)]} right={['Phone', data.patientPhone]} />
            <KVRow left={['Gender', data.patientGender]} right={['Patient Type', data.patientType]} />
            <KVRow left={['Referred By', data.referredBy]} right={['Counsellor', data.counsellorName]} />
            <KVRow left={['Consulting Doctor', data.doctorName]} right={['Session Date', data.sessionDate]} />
            {data.patientAddress && (
              <KVRow left={['Address', data.patientAddress]} right={[]} />
            )}
          </tbody>
        </table>

        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />

        {/* ── Clinical Vitals (if any) ── */}
        {(data.vitalsVaRight || data.vitalsVaLeft || data.vitalsIopRight !== undefined || data.vitalsIopLeft !== undefined) && (
          <>
            <SectionTitle>CLINICAL PARAMETERS</SectionTitle>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '9px' }}>
              <thead>
                <tr style={{ background: '#4B5563', color: '#fff' }}>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Parameter</th>
                  <th style={thStyle}>Right Eye (OD)</th>
                  <th style={thStyle}>Left Eye (OS)</th>
                </tr>
              </thead>
              <tbody>
                {(data.vitalsVaRight || data.vitalsVaLeft) && (
                  <tr style={{ background: '#F9FAFB' }}>
                    <td style={tdStyle}>Visual Acuity</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{data.vitalsVaRight || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{data.vitalsVaLeft || '—'}</td>
                  </tr>
                )}
                {(data.vitalsIopRight !== undefined || data.vitalsIopLeft !== undefined) && (
                  <tr>
                    <td style={tdStyle}>IOP (mmHg)</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{data.vitalsIopRight !== undefined ? `${data.vitalsIopRight} mmHg` : '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{data.vitalsIopLeft !== undefined ? `${data.vitalsIopLeft} mmHg` : '—'}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
          </>
        )}

        {/* ── Diagnosis ── */}
        {(data.diagnosisOD || data.diagnosisOS) && (
          <>
            <SectionTitle>DIAGNOSIS</SectionTitle>
            <div style={{ fontSize: '9px', marginBottom: '8px', paddingLeft: '4px' }}>
              {data.chiefComplaint && <p style={{ marginBottom: '3px' }}><strong>Chief Complaint:</strong> {data.chiefComplaint}</p>}
              {data.diagnosisOD && <p style={{ marginBottom: '3px' }}><strong>OD (Right Eye):</strong> {data.diagnosisOD}</p>}
              <p><strong>OS (Left Eye):</strong> {data.diagnosisOS || data.diagnosisOD || '—'}</p>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
          </>
        )}

        {/* ── Patient Decision ── */}
        {(data as any).patientDecision && (
          <>
            <div style={{
              backgroundColor: /willing|ready/i.test((data as any).patientDecision) ? '#dcfce7' : '#fef9c3',
              border: `1px solid ${/willing|ready/i.test((data as any).patientDecision) ? '#86efac' : '#fde047'}`,
              borderRadius: '6px',
              padding: '6px 10px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{ fontSize: '11px' }}>
                {/willing|ready/i.test((data as any).patientDecision) ? '✅' : '⏳'}
              </span>
              <span style={{ fontWeight: 700, fontSize: '9px', color: /willing|ready/i.test((data as any).patientDecision) ? '#166534' : '#78350f' }}>
                PATIENT DECISION:
              </span>
              <span style={{ fontSize: '9px', color: /willing|ready/i.test((data as any).patientDecision) ? '#15803d' : '#92400e' }}>
                {(data as any).patientDecision}
              </span>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
          </>
        )}

        {/* ── Recommended Procedures ── */}
        <SectionTitle>RECOMMENDED PROCEDURES</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px', fontSize: '9px' }}>
          <thead>
            <tr style={{ background: '#2563EB', color: '#fff' }}>
              <th style={{ ...thStyle, width: '12%' }}>Eye</th>
              <th style={{ ...thStyle, textAlign: 'left', width: '32%' }}>Procedure / Package</th>
              <th style={{ ...thStyle, textAlign: 'left', width: '30%' }}>IOL / Lens</th>
              <th style={{ ...thStyle, textAlign: 'right', width: '16%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.procedures.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#F9FAFB' : '#fff' }}>
                <td style={{ ...tdStyle, textAlign: 'center' }}>{row.eye || '—'}</td>
                <td style={tdStyle}>
                  {row.procedureName || '—'}
                  {row.packageName && <span style={{ color: '#6B7280' }}> ({row.packageName})</span>}
                </td>
                <td style={tdStyle}>{row.iolModel || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(row.amount)}</td>
              </tr>
            ))}
            {data.procedures.length === 0 && (
              <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic' }}>No procedures recorded</td></tr>
            )}
          </tbody>
          {totalAmount !== undefined && (
            <tfoot>
              <tr style={{ background: '#2563EB', color: '#fff' }}>
                <td colSpan={3} style={{ ...tdStyle, fontWeight: 700 }}>TOTAL ESTIMATED COST</td>
                <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>{fmt(totalAmount)}</td>
              </tr>
            </tfoot>
          )}
        </table>

        <p style={{ fontSize: '7.5px', color: '#6B7280', fontStyle: 'italic', marginBottom: '8px' }}>
          * Estimated costs are indicative and may vary depending on intra-operative findings.
        </p>

        {/* ── Insurance Details ── */}
        {(['Insurance', 'CoPay', 'GovernmentScheme', 'Corporate'].includes(data.patientType || '')) &&
          (data.insuranceProvider || data.tpaName || data.policyNumber || data.corporateName) && (
          <>
            <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
            <SectionTitle>INSURANCE / PAYMENT DETAILS</SectionTitle>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '9px' }}>
              <tbody>
                {data.insuranceProvider && <KVRow left={['Insurance Provider', data.insuranceProvider]} right={['TPA', data.tpaName]} />}
                {data.policyNumber && <KVRow left={['Policy Number', data.policyNumber]} right={['Corporate', data.corporateName]} />}
              </tbody>
            </table>
          </>
        )}

        {/* ── Investigations Ordered ── */}
        {data.imagingOrders && data.imagingOrders.length > 0 && (
          <>
            <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
            <SectionTitle>INVESTIGATIONS ORDERED</SectionTitle>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '9px' }}>
              <thead>
                <tr style={{ background: '#4B5563', color: '#fff' }}>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Investigation</th>
                  <th style={thStyle}>Eye</th>
                  <th style={thStyle}>Urgency</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.imagingOrders.map((order, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#F9FAFB' : '#fff' }}>
                    <td style={tdStyle}>{order.modality}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{order.eye}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>{order.urgency}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(order.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ── Cost Summary ── */}
        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
        <SectionTitle>COST SUMMARY</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '9px' }}>
          <tbody>
            {(totalAmount ?? 0) > 0 && (
              <tr><td style={tdStyle}><strong>Surgery / Package Cost</strong></td><td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(totalAmount)}</td></tr>
            )}
            {data.imagingOrders && data.imagingOrders.some(o => (o.estimatedCost ?? 0) > 0) && (
              <tr><td style={tdStyle}><strong>Investigations Cost</strong></td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{fmt(data.imagingOrders.reduce((s, o) => s + (o.estimatedCost ?? 0), 0))}</td>
              </tr>
            )}
            <tr><td style={tdStyle}><strong>Payment Mode</strong></td><td style={{ ...tdStyle, textAlign: 'right' }}>{data.paymentMode || '—'}</td></tr>
          </tbody>
        </table>
        {(totalAmount ?? 0) > 0 && (
          <div style={{ border: '2px solid #2563EB', borderRadius: '6px', padding: '8px 12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '11px', color: '#1E40AF' }}>AMOUNT TO PAY</span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#1E40AF' }}>
              {fmt((totalAmount ?? 0) + (data.imagingOrders || []).reduce((s, o) => s + (o.estimatedCost ?? 0), 0))}
            </span>
          </div>
        )}

        {/* ── Pre-Op Instructions ── */}
        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
        <SectionTitle>PRE-OPERATIVE INSTRUCTIONS</SectionTitle>
        <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '9px', marginBottom: '10px', lineHeight: 1.6 }}>
          {(data.preOpInstructions && data.preOpInstructions.length > 0 ? data.preOpInstructions : [
            'Fast for 6 hours — no food or water before surgery',
            'Continue prescribed eye drops as instructed',
            'Arrange an escort — do not self-drive post-surgery',
            'Wear loose, comfortable clothing on the day',
            'Bring all current medications for review',
            'Bring all previous eye reports and investigation records',
          ]).map((instr, i) => <li key={i} style={{ marginBottom: '3px' }}>☐ {instr}</li>)}
        </ul>

        {/* ── Next Steps ── */}
        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />
        <SectionTitle>NEXT STEPS</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '9px' }}>
          <tbody>
            <KVRow left={['Tentative Surgery Date', data.nextSurgeryDate]} right={['Time', data.nextSurgeryTime]} />
            <KVRow left={['Operating Surgeon', data.doctorName]} right={['Report to', data.reportTo]} />
            <KVRow left={['Follow-up Visit', data.followUpDate]} right={[]} />
          </tbody>
        </table>

        {/* ── Counsellor ── */}
        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '6px' }} />
        <p style={{ fontSize: '9px', marginBottom: '8px' }}>
          <strong>Counsellor:</strong> {data.counsellorName || '______________________'}{'     '}
          <strong>Designation:</strong> {data.counsellorDesignation || '______________________'}
        </p>

        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />

        {/* ── Consent ── */}
        <SectionTitle>PATIENT / GUARDIAN CONSENT DECLARATION</SectionTitle>
        <p style={{ fontSize: '9px', lineHeight: 1.6, color: '#374151', marginBottom: '14px' }}>
          {data.consentText || DEFAULT_CONSENT}
        </p>

        <div style={{ borderTop: '1px solid #E5E7EB', marginBottom: '8px' }} />

        {/* ── Signature Block ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px', fontSize: '9px' }}>
          <tbody>
            <tr>
              <td style={{ width: '48%', verticalAlign: 'top', paddingRight: '8px' }}>
                <p style={{ fontWeight: 700, marginBottom: '10px' }}>Patient / Guardian Signature</p>
                <p style={{ marginBottom: '8px' }}>Name: _____________________________</p>
                <p style={{ marginBottom: '8px' }}>Signature: ________________________</p>
                <p style={{ marginBottom: '8px' }}>Date: _______________________________</p>
                <p style={{ marginBottom: '8px' }}>Guardian Name: ____________________</p>
                <p>Guardian Signature: ________________</p>
              </td>
              <td style={{ width: '4%' }} />
              <td style={{ width: '48%', verticalAlign: 'top' }}>
                <p style={{ fontWeight: 700, marginBottom: '10px' }}>Counsellor Signature</p>
                <p style={{ marginBottom: '8px' }}>Name: {data.counsellorName || '_______________________'}</p>
                <p style={{ marginBottom: '8px' }}>Designation: {data.counsellorDesignation || '_____________'}</p>
                <p style={{ marginBottom: '8px' }}>Signature: ________________________</p>
                <p style={{ marginBottom: '8px' }}>Date: _______________________________</p>
                <div style={{ marginTop: '12px', border: '1px dashed #9CA3AF', borderRadius: '4px', padding: '8px', textAlign: 'center', minHeight: '50px' }}>
                  <p style={{ fontSize: '8px', color: '#9CA3AF', marginBottom: '4px' }}>HOSPITAL STAMP</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Footer ── */}
        {!preview && (
          <p style={{ marginTop: '16px', fontSize: '7px', color: '#9CA3AF', textAlign: 'center' }}>
            Generated: {new Date().toLocaleString('en-IN')} · This document is computer-generated.
          </p>
        )}
      </div>
    );
  }
);

CounsellingSheet.displayName = 'CounsellingSheet';

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontWeight: 700, fontSize: '10px', marginBottom: '5px', textTransform: 'uppercase', color: '#1E40AF' }}>
      {children}
    </p>
  );
}

function KVRow({ left, right }: { left: [string, string | undefined | null] | [string] | [], right: [string, string | undefined | null] | [string] | [] }) {
  if (left.length === 0 && right.length === 0) return null;
  return (
    <tr>
      <td style={{ width: '50%', paddingBottom: '3px', fontSize: '9px' }}>
        {left.length >= 1 && <KV label={left[0] as string} value={left.length >= 2 ? (left[1] as string | undefined) : undefined} />}
      </td>
      <td style={{ width: '50%', paddingBottom: '3px', fontSize: '9px' }}>
        {right.length >= 1 && <KV label={right[0] as string} value={right.length >= 2 ? (right[1] as string | undefined) : undefined} />}
      </td>
    </tr>
  );
}

function KV({ label, value }: { label: string; value?: string | null }) {
  return (
    <span>
      <span style={{ fontWeight: 700 }}>{label}: </span>
      <span style={{ color: '#374151' }}>{value || '—'}</span>
    </span>
  );
}

const thStyle: React.CSSProperties = {
  padding: '5px 6px',
  fontWeight: 700,
  fontSize: '9px',
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  padding: '4px 6px',
  borderBottom: '1px solid #E5E7EB',
  fontSize: '9px',
  verticalAlign: 'top',
};

// ─── Preview modal wrapper ───────────────────────────────────────────────────

interface CounsellingSheetPreviewProps {
  data: CounsellingSheetData;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  isPrinting?: boolean;
}

export function CounsellingSheetPreview({
  data,
  isOpen,
  onClose,
  onDownload,
  isPrinting = false,
}: CounsellingSheetPreviewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <p className="font-semibold text-gray-900">Counselling Sheet Preview</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              disabled={isPrinting}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isPrinting ? 'Downloading…' : '⬇ Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sheet preview */}
        <div className="overflow-auto flex-1 p-4 bg-gray-100">
          <div className="shadow-md mx-auto" style={{ maxWidth: '210mm' }}>
            <CounsellingSheet data={data} preview />
          </div>
        </div>
      </div>
    </div>
  );
}
