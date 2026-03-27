// PDF Generation Utility for Cost Estimates and Documents
// Uses jsPDF and html2canvas for client-side PDF generation

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface CostEstimatePDFData {
  // Patient Information
  patientName: string;
  patientMRN?: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientEmail?: string;

  // Doctor Information
  doctorName?: string;
  doctorSpecialty?: string;

  // Hospital Information
  hospitalName: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  hospitalEmail?: string;
  hospitalLogo?: string; // Base64 or URL

  // Cost Breakdown
  surgeryName: string;
  surgeryCost: number;
  iolName?: string;
  iolCost?: number;
  consultationFee: number;
  totalCost: number;
  discount?: number;
  finalCost?: number;

  // Additional Details
  packageName?: string;
  packageDescription?: string;
  validityDays?: number;
  notes?: string;
  termsAndConditions?: string;

  // Metadata
  estimateNumber?: string;
  estimateDate: string;
  preparedBy?: string;
}

/**
 * Generate a professional cost estimate PDF
 * @param data Cost estimate data
 * @returns Promise<Blob> PDF blob
 */
export async function generateCostEstimatePDF(data: CostEstimatePDFData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with automatic wrapping
  const addText = (
    text: string,
    x: number,
    y: number,
    options?: { fontSize?: number; fontStyle?: string; align?: 'left' | 'center' | 'right'; maxWidth?: number }
  ) => {
    doc.setFontSize(options?.fontSize || 10);
    doc.setFont('helvetica', options?.fontStyle || 'normal');
    
    if (options?.align === 'center') {
      doc.text(text, pageWidth / 2, y, { align: 'center', maxWidth: options?.maxWidth || contentWidth });
    } else if (options?.align === 'right') {
      doc.text(text, pageWidth - margin, y, { align: 'right', maxWidth: options?.maxWidth || contentWidth });
    } else {
      doc.text(text, x, y, { maxWidth: options?.maxWidth || contentWidth });
    }
  };

  const addLine = (y: number, color: string = '#000000') => {
    doc.setDrawColor(color);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ========================================
  // HEADER SECTION
  // ========================================
  
  // Hospital Logo (if provided)
  if (data.hospitalLogo) {
    try {
      doc.addImage(data.hospitalLogo, 'PNG', margin, yPosition, 30, 15);
    } catch (error) {
      console.warn('Failed to add hospital logo:', error);
    }
  }

  // Hospital Name
  addText(data.hospitalName, margin + 35, yPosition + 5, {
    fontSize: 16,
    fontStyle: 'bold',
  });

  yPosition += 10;

  // Hospital Contact Info
  if (data.hospitalAddress) {
    addText(data.hospitalAddress, margin + 35, yPosition, { fontSize: 8 });
    yPosition += 4;
  }
  if (data.hospitalPhone || data.hospitalEmail) {
    const contactInfo = [data.hospitalPhone, data.hospitalEmail].filter(Boolean).join(' | ');
    addText(contactInfo, margin + 35, yPosition, { fontSize: 8 });
    yPosition += 4;
  }

  yPosition += 10;
  addLine(yPosition, '#3B82F6');
  yPosition += 10;

  // Document Title
  addText('COST ESTIMATE', pageWidth / 2, yPosition, {
    fontSize: 18,
    fontStyle: 'bold',
    align: 'center',
  });
  yPosition += 10;

  // Estimate Metadata
  if (data.estimateNumber) {
    addText(`Estimate No: ${data.estimateNumber}`, margin, yPosition, { fontSize: 9 });
  }
  addText(`Date: ${data.estimateDate}`, pageWidth - margin, yPosition, {
    fontSize: 9,
    align: 'right',
  });
  yPosition += 10;

  addLine(yPosition, '#E5E7EB');
  yPosition += 10;

  // ========================================
  // PATIENT INFORMATION
  // ========================================
  
  addText('PATIENT DETAILS', margin, yPosition, {
    fontSize: 12,
    fontStyle: 'bold',
  });
  yPosition += 8;

  // Patient info grid
  const patientInfo: [string, string][] = [
    ['Name', data.patientName],
    ...(data.patientMRN ? [['MRN', data.patientMRN] as [string, string]] : []),
    ...(data.patientAge ? [['Age', `${data.patientAge} years`] as [string, string]] : []),
    ...(data.patientGender ? [['Gender', data.patientGender] as [string, string]] : []),
    ...(data.patientPhone ? [['Phone', data.patientPhone] as [string, string]] : []),
    ...(data.patientEmail ? [['Email', data.patientEmail] as [string, string]] : []),
  ];

  patientInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label + ':', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 25, yPosition);
    yPosition += 5;
  });

  yPosition += 5;
  addLine(yPosition, '#E5E7EB');
  yPosition += 10;

  // ========================================
  // DOCTOR INFORMATION (if provided)
  // ========================================
  
  if (data.doctorName) {
    addText('CONSULTING DOCTOR', margin, yPosition, {
      fontSize: 12,
      fontStyle: 'bold',
    });
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Doctor:', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(data.doctorName, margin + 25, yPosition);
    yPosition += 5;

    if (data.doctorSpecialty) {
      doc.setFont('helvetica', 'bold');
      doc.text('Specialty:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(data.doctorSpecialty, margin + 25, yPosition);
      yPosition += 5;
    }

    yPosition += 5;
    addLine(yPosition, '#E5E7EB');
    yPosition += 10;
  }

  // ========================================
  // COST BREAKDOWN
  // ========================================
  
  addText('COST BREAKDOWN', margin, yPosition, {
    fontSize: 12,
    fontStyle: 'bold',
  });
  yPosition += 10;

  // Table Header
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Description', margin + 2, yPosition);
  doc.text('Amount', pageWidth - margin - 2, yPosition, { align: 'right' });
  yPosition += 8;
  doc.setTextColor(0, 0, 0); // Reset to black

  // Table Rows
  const costItems = [
    { description: `Surgery: ${data.surgeryName}`, amount: data.surgeryCost },
    ...(data.iolCost && data.iolCost > 0
      ? [{ description: `IOL: ${data.iolName || 'Intraocular Lens'}`, amount: data.iolCost }]
      : []),
    { description: 'Consultation Fee', amount: data.consultationFee },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  costItems.forEach((item, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251); // Light gray
      doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
    }

    doc.text(item.description, margin + 2, yPosition);
    doc.text(formatCurrency(item.amount), pageWidth - margin - 2, yPosition, { align: 'right' });
    yPosition += 8;
  });

  // Subtotal line
  yPosition += 2;
  addLine(yPosition, '#9CA3AF');
  yPosition += 8;

  // Subtotal
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', margin + 2, yPosition);
  doc.text(formatCurrency(data.totalCost), pageWidth - margin - 2, yPosition, { align: 'right' });
  yPosition += 8;

  // Discount (if applicable)
  if (data.discount && data.discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 197, 94); // Green
    doc.text('Discount:', margin + 2, yPosition);
    doc.text(`- ${formatCurrency(data.discount)}`, pageWidth - margin - 2, yPosition, { align: 'right' });
    doc.setTextColor(0, 0, 0); // Reset
    yPosition += 8;
  }

  // Final Total line
  yPosition += 2;
  addLine(yPosition, '#3B82F6');
  yPosition += 10;

  // Final Total
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(margin, yPosition - 7, contentWidth, 12, 'F');
  doc.setTextColor(255, 255, 255); // White text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TOTAL COST:', margin + 2, yPosition);
  doc.text(formatCurrency(data.finalCost || data.totalCost), pageWidth - margin - 2, yPosition, { align: 'right' });
  doc.setTextColor(0, 0, 0); // Reset
  yPosition += 15;

  // ========================================
  // PACKAGE INFORMATION (if applicable)
  // ========================================
  
  if (data.packageName) {
    addLine(yPosition, '#E5E7EB');
    yPosition += 10;

    doc.setFillColor(240, 253, 244); // Light green background
    doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');

    addText('✓ PACKAGE DEAL', margin + 2, yPosition, {
      fontSize: 11,
      fontStyle: 'bold',
    });
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Selected: ${data.packageName}`, margin + 2, yPosition);
    yPosition += 5;

    if (data.packageDescription) {
      doc.text(data.packageDescription, margin + 2, yPosition, { maxWidth: contentWidth - 4 });
      yPosition += 10;
    }

    yPosition += 10;
  }

  // ========================================
  // VALIDITY & NOTES
  // ========================================
  
  addLine(yPosition, '#E5E7EB');
  yPosition += 10;

  addText('IMPORTANT NOTES', margin, yPosition, {
    fontSize: 11,
    fontStyle: 'bold',
  });
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  // Validity
  if (data.validityDays) {
    const validityText = `• This estimate is valid for ${data.validityDays} days from the date of issue.`;
    doc.text(validityText, margin, yPosition, { maxWidth: contentWidth });
    yPosition += 7;
  }

  // Standard notes
  const standardNotes = [
    '• Actual charges may vary based on patient condition and additional procedures required.',
    '• This is an estimate only and does not constitute a final bill.',
    '• Please confirm availability and pricing with billing before finalizing surgery.',
    '• All costs are inclusive of applicable taxes unless specified otherwise.',
  ];

  if (data.notes) {
    standardNotes.unshift(`• ${data.notes}`);
  }

  standardNotes.forEach((note) => {
    const lines = doc.splitTextToSize(note, contentWidth);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5;
  });

  // ========================================
  // TERMS & CONDITIONS
  // ========================================
  
  if (data.termsAndConditions) {
    yPosition += 5;
    addLine(yPosition, '#E5E7EB');
    yPosition += 8;

    addText('TERMS & CONDITIONS', margin, yPosition, {
      fontSize: 10,
      fontStyle: 'bold',
    });
    yPosition += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const termsLines = doc.splitTextToSize(data.termsAndConditions, contentWidth);
    doc.text(termsLines, margin, yPosition);
    yPosition += termsLines.length * 4;
  }

  // ========================================
  // FOOTER
  // ========================================
  
  // Move to bottom of page
  yPosition = pageHeight - 25;
  addLine(yPosition, '#3B82F6');
  yPosition += 5;

  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128); // Gray
  addText('This is a computer-generated estimate and does not require a signature.', pageWidth / 2, yPosition, {
    fontSize: 8,
    align: 'center',
  });
  yPosition += 5;

  if (data.preparedBy) {
    addText(`Prepared by: ${data.preparedBy}`, pageWidth / 2, yPosition, {
      fontSize: 8,
      align: 'center',
    });
  }

  yPosition += 5;
  addText(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, yPosition, {
    fontSize: 7,
    align: 'center',
  });

  // Convert to Blob
  return doc.output('blob');
}

/**
 * Download PDF file
 * @param blob PDF blob
 * @param filename Filename for download
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open PDF in new tab
 * @param blob PDF blob
 */
export function openPDFInNewTab(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

/**
 * Convert PDF Blob to Base64 string (for email attachments)
 * @param blob PDF blob
 * @returns Promise<string> Base64 string
 */
export async function pdfBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Print HTML element as PDF
 * @param elementId ID of HTML element to convert
 * @param filename Filename for download
 */
export async function printElementAsPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(filename);
}

// ============================================================
// COUNSELLING SHEET PDF
// ============================================================

export interface CounsellingProcedureRow {
  eye: string;
  procedureName: string;
  iolModel?: string;
  packageName?: string;
  amount?: number;
}

export interface CounsellingSheetData {
  hospitalName: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  hospitalLogoBase64?: string;
  patientName: string;
  patientMRN?: string;
  patientDOB?: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientAddress?: string;
  doctorName?: string;
  sessionDate: string;
  counsellorName?: string;
  counsellorDesignation?: string;
  procedures: CounsellingProcedureRow[];
  totalAmount?: number;
  notes?: string;
  consentText?: string;
  // Session
  sessionNumber?: string;
  patientType?: string;
  referredBy?: string;
  // Diagnosis
  diagnosisOD?: string;
  diagnosisOS?: string;
  chiefComplaint?: string;
  // Payment
  paymentMode?: string;
  // Insurance
  insuranceProvider?: string;
  tpaName?: string;
  policyNumber?: string;
  corporateName?: string;
  // Vitals
  vitalsIopRight?: number;
  vitalsIopLeft?: number;
  vitalsVaRight?: string;
  vitalsVaLeft?: string;
  // Imaging orders
  imagingOrders?: Array<{ modality: string; eye: string; urgency: string; estimatedCost?: number }>;
  // Patient Decision
  patientDecision?: string; // e.g. "Willing to proceed — Ready now"
  // Pre-op / next steps
  preOpInstructions?: string[];
  nextSurgeryDate?: string;
  nextSurgeryTime?: string;
  reportTo?: string;
  followUpDate?: string;
}

const DEFAULT_CONSENT =
  'I, _________________________ [or guardian _______________________], confirm that I have been explained the proposed procedure(s), the risks and benefits, expected outcomes, and alternative treatment options in a language I understand. I have been given the opportunity to ask questions. I acknowledge receiving a copy of this Counselling Sheet and understand that this does not replace the surgical consent form to be signed separately.';

/**
 * Generate an A4 counselling sheet PDF — full hospital template with all sections.
 */
export async function generateCounsellingSheetPDF(data: CounsellingSheetData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const fmt = (n?: number) =>
    n !== undefined && n > 0
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
      : '—';

  const addHLine = (yPos: number, color = '#E5E7EB', lw = 0.3) => {
    doc.setDrawColor(color);
    doc.setLineWidth(lw);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // Auto page-break helper — adds a new page when `neededMm` of space is required
  const checkY = (neededMm = 20) => {
    if (y + neededMm > pageHeight - margin - 5) {
      doc.addPage();
      y = margin;
    }
  };

  // ── HEADER ──────────────────────────────────────────────────────────────
  if (data.hospitalLogoBase64) {
    // Logo on left, hospital info centred
    try {
      doc.addImage(data.hospitalLogoBase64, 'PNG', margin, y - 4, 22, 14);
    } catch { /* ignore invalid logo */ }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(data.hospitalName, pageWidth / 2, y, { align: 'center' });
    y += 5;
    if (data.hospitalAddress || data.hospitalPhone) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const contact = [data.hospitalAddress, data.hospitalPhone].filter(Boolean).join('  •  ');
      doc.text(contact, pageWidth / 2, y, { align: 'center', maxWidth: contentWidth - 30 });
      y += 4;
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(data.hospitalName, pageWidth / 2, y, { align: 'center' });
    y += 5;
    if (data.hospitalAddress || data.hospitalPhone) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const contact = [data.hospitalAddress, data.hospitalPhone].filter(Boolean).join('  •  ');
      doc.text(contact, pageWidth / 2, y, { align: 'center', maxWidth: contentWidth });
      y += 4;
    }
  }

  addHLine(y, '#2563EB', 0.8);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor('#1E40AF');
  doc.text('COUNSELLING SUMMARY SHEET', pageWidth / 2, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const sessionMeta = [`Date: ${data.sessionDate}`];
  if (data.sessionNumber) sessionMeta.unshift(`Session #: ${data.sessionNumber}`);
  doc.text(sessionMeta.join('     '), pageWidth / 2, y, { align: 'center' });
  y += 6;

  addHLine(y);
  y += 5;

  // ── PATIENT DETAILS ─────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor('#1E40AF');
  doc.text('PATIENT DETAILS', margin, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  const col1 = margin;
  const col2 = pageWidth / 2 + 4;
  const labelW = 28;

  const kv = (label: string, value: string | undefined, x: number, yy: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${label}:`, x, yy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(value || '—', x + labelW, yy, { maxWidth: contentWidth / 2 - labelW - 4 });
  };

  kv('Patient Name', data.patientName, col1, y);
  kv('MRN', data.patientMRN, col2, y); y += 5;
  kv('Date of Birth', data.patientDOB || (data.patientAge ? `${data.patientAge} yrs` : undefined), col1, y);
  kv('Phone', data.patientPhone, col2, y); y += 5;
  kv('Gender', data.patientGender, col1, y);
  kv('Patient Type', data.patientType, col2, y); y += 5;
  kv('Referred By', data.referredBy, col1, y);
  kv('Counsellor', data.counsellorName, col2, y); y += 5;
  kv('Consulting Doctor', data.doctorName, col1, y);
  kv('Session Date', data.sessionDate, col2, y); y += 6;

  addHLine(y);
  y += 5;

  // ── VITALS (if any available) ─────────────────────────────────────────────
  checkY(30);
  const hasVitals = data.vitalsIopRight !== undefined || data.vitalsIopLeft !== undefined ||
                    data.vitalsVaRight || data.vitalsVaLeft;
  if (hasVitals) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor('#1E40AF');
    doc.text('CLINICAL PARAMETERS', margin, y);
    doc.setTextColor(0, 0, 0);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const vW = contentWidth / 4;
    doc.text('Parameter', margin, y);
    doc.text('Right Eye (OD)', margin + vW, y);
    doc.text('Left Eye (OS)', margin + vW * 2, y);
    y += 4;
    doc.setFont('helvetica', 'normal');

    const vRow = (label: string, right: string, left: string) => {
      doc.text(label, margin, y);
      doc.text(right || '—', margin + vW, y);
      doc.text(left || '—', margin + vW * 2, y);
      y += 4.5;
    };

    if (data.vitalsVaRight || data.vitalsVaLeft) {
      vRow('Visual Acuity', data.vitalsVaRight || '—', data.vitalsVaLeft || '—');
    }
    if (data.vitalsIopRight !== undefined || data.vitalsIopLeft !== undefined) {
      vRow('IOP (mmHg)', data.vitalsIopRight !== undefined ? `${data.vitalsIopRight} mmHg` : '—',
           data.vitalsIopLeft !== undefined ? `${data.vitalsIopLeft} mmHg` : '—');
    }
    y += 3;
    addHLine(y);
    y += 5;
  }

  // ── DIAGNOSIS ─────────────────────────────────────────────────────────────
  checkY(28);
  const diag = data.diagnosisOD || data.diagnosisOS || data.chiefComplaint;
  if (diag) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor('#1E40AF');
    doc.text('DIAGNOSIS', margin, y);
    doc.setTextColor(0, 0, 0);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    if (data.chiefComplaint) {
      const ccLines = doc.splitTextToSize(`Chief Complaint: ${data.chiefComplaint}`, contentWidth - 4);
      doc.setFont('helvetica', 'bold');
      doc.text(ccLines, margin + 2, y);
      doc.setFont('helvetica', 'normal');
      y += ccLines.length * 4.5;
    }
    if (data.diagnosisOD) {
      const odLines = doc.splitTextToSize(`OD (Right Eye): ${data.diagnosisOD}`, contentWidth - 4);
      doc.text(odLines, margin + 2, y);
      y += odLines.length * 4.5;
    }
    if (data.diagnosisOS && data.diagnosisOS !== data.diagnosisOD) {
      const osLines = doc.splitTextToSize(`OS (Left Eye): ${data.diagnosisOS}`, contentWidth - 4);
      doc.text(osLines, margin + 2, y);
      y += osLines.length * 4.5;
    } else if (data.diagnosisOS === data.diagnosisOD && data.diagnosisOD) {
      // Same diagnosis both eyes — show once
      doc.text('OS (Left Eye): Same as above', margin + 2, y);
      y += 4.5;
    }
    y += 3;
    addHLine(y);
    y += 5;
  }

  // ── PATIENT DECISION ───────────────────────────────────────────────────────
  if (data.patientDecision) {
    checkY(16);
    const isWilling = /willing|ready/i.test(data.patientDecision);
    const bgR = isWilling ? 220 : 254; const bgG = isWilling ? 252 : 243; const bgB = isWilling ? 231 : 199;
    const txR = isWilling ? 22 : 146; const txG = isWilling ? 101 : 64; const txB = isWilling ? 52 : 14;
    doc.setFillColor(bgR, bgG, bgB);
    doc.rect(margin, y - 5, contentWidth, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(txR, txG, txB);
    doc.text(`PATIENT DECISION: ${data.patientDecision}`, margin + 3, y);
    doc.setTextColor(0, 0, 0);
    y += 8;
    addHLine(y);
    y += 5;
  }

  // ── RECOMMENDED PROCEDURES ────────────────────────────────────────────────
  checkY(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor('#1E40AF');
  doc.text('RECOMMENDED PROCEDURES', margin, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  // 4 columns: Eye | Recommended Procedure | IOL / Lens | Price
  const colW = { eye: 16, proc: contentWidth * 0.38, iol: contentWidth * 0.30, price: 0 };
  colW.price = contentWidth - colW.eye - colW.proc - colW.iol;

  // Table header row
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y - 5, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  let cx = margin;
  doc.text('Eye', cx + colW.eye / 2, y, { align: 'center' }); cx += colW.eye;
  doc.text('Procedure / Package', cx + 1, y); cx += colW.proc;
  doc.text('IOL / Lens', cx + 1, y); cx += colW.iol;
  doc.text('Amount', cx + colW.price - 1, y, { align: 'right' });
  y += 6;
  doc.setTextColor(0, 0, 0);

  // Table rows
  const rows = data.procedures && data.procedures.length > 0 ? data.procedures : [];
  rows.forEach((row, i) => {
    const procText = [row.procedureName, row.packageName ? `(${row.packageName})` : ''].filter(Boolean).join(' ');
    const procLines = doc.splitTextToSize(procText || '—', colW.proc - 2);
    const rowH = Math.max(8, procLines.length * 4.5 + 3);

    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, y - 4.5, contentWidth, rowH, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    cx = margin;
    doc.text(row.eye || '—', cx + colW.eye / 2, y, { align: 'center' }); cx += colW.eye;
    doc.text(procLines, cx + 1, y, { maxWidth: colW.proc - 2 }); cx += colW.proc;
    const iolLines = doc.splitTextToSize(row.iolModel || '—', colW.iol - 2);
    doc.text(iolLines, cx + 1, y, { maxWidth: colW.iol - 2 }); cx += colW.iol;
    doc.text(fmt(row.amount), cx + colW.price - 1, y, { align: 'right' });
    y += rowH;
  });

  if (rows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('No procedures recorded', margin + 2, y);
    y += 8;
  }

  addHLine(y, '#9CA3AF', 0.3);
  y += 5;

  // ── INSURANCE DETAILS (if applicable) ────────────────────────────────────
  checkY(25);
  const isInsurance = ['Insurance', 'CoPay', 'GovernmentScheme', 'Corporate'].includes(data.patientType || '');
  if (isInsurance) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor('#1E40AF');
    doc.text('INSURANCE / PAYMENT DETAILS', margin, y);
    doc.setTextColor(0, 0, 0);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    kv('Insurance Provider', data.insuranceProvider || '—', col1, y);
    kv('TPA Name', data.tpaName || '—', col2, y);
    y += 5;
    kv('Policy Number', data.policyNumber || '—', col1, y);
    kv('Corporate / Employer', data.corporateName || '—', col2, y);
    y += 5;

    addHLine(y);
    y += 5;
  }

  // ── IMAGING / LAB INVESTIGATIONS ─────────────────────────────────────────
  if (data.imagingOrders && data.imagingOrders.length > 0) {
    checkY(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor('#1E40AF');
    doc.text('INVESTIGATIONS ORDERED', margin, y);
    doc.setTextColor(0, 0, 0);
    y += 5;

    // Imaging table header
    const imgColW = { test: contentWidth * 0.38, eye: contentWidth * 0.17, urg: contentWidth * 0.25, cost: 0 };
    imgColW.cost = contentWidth - imgColW.test - imgColW.eye - imgColW.urg;

    doc.setFillColor(75, 85, 99);
    doc.rect(margin, y - 4.5, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    cx = margin;
    doc.text('Investigation', cx + 1, y); cx += imgColW.test;
    doc.text('Eye', cx + 1, y); cx += imgColW.eye;
    doc.text('Urgency', cx + 1, y); cx += imgColW.urg;
    doc.text('Est. Cost', cx + imgColW.cost - 1, y, { align: 'right' });
    y += 5;
    doc.setTextColor(0, 0, 0);

    data.imagingOrders.forEach((order, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y - 4, contentWidth, 7, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      cx = margin;
      doc.text(order.modality || '—', cx + 1, y); cx += imgColW.test;
      doc.text(order.eye || '—', cx + 1, y); cx += imgColW.eye;
      doc.text(order.urgency || '—', cx + 1, y); cx += imgColW.urg;
      doc.text(fmt(order.estimatedCost), cx + imgColW.cost - 1, y, { align: 'right' });
      y += 6;
    });

    addHLine(y, '#9CA3AF', 0.3);
    y += 5;
  }

  // ── COST SUMMARY ─────────────────────────────────────────────────────────
  checkY(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor('#1E40AF');
  doc.text('COST SUMMARY', margin, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  const totalAmt = data.totalAmount ?? 0;
  const imgTotal = (data.imagingOrders || []).reduce((s, o) => s + (o.estimatedCost ?? 0), 0);
  const grandTotal = totalAmt + imgTotal;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const summaryRow = (label: string, val: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.text(val, margin + 60, y);
    y += 5;
  };

  if (totalAmt > 0) summaryRow('Surgery / Package Cost:', fmt(totalAmt));
  if (imgTotal > 0) summaryRow('Investigations Cost:', fmt(imgTotal));
  summaryRow('Payment Mode:', data.paymentMode || '—');

  // AMOUNT TO PAY box
  if (grandTotal > 0) {
    const boxH = 13;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.8);
    doc.rect(margin + 4, y, contentWidth - 8, boxH, 'S');
    doc.setLineWidth(0.3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text('AMOUNT TO PAY:', margin + 8, y + 9);
    doc.setFontSize(12);
    doc.text(fmt(grandTotal), pageWidth - margin - 8, y + 9, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += boxH + 7;
  } else {
    y += 3;
  }

  addHLine(y);
  y += 5;

  // ── PRE-OPERATIVE INSTRUCTIONS ────────────────────────────────────────────
  const instructions = data.preOpInstructions && data.preOpInstructions.length > 0
    ? data.preOpInstructions
    : [
        'Fast for 6 hours — no food or water before surgery',
        'Continue prescribed eye drops as instructed',
        'Arrange an escort — do not self-drive post-surgery',
        'Wear loose, comfortable clothing on the day',
        'Bring all current medications for review',
        'Bring all previous eye reports and investigation records',
      ];

  checkY(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor('#1E40AF');
  doc.text('PRE-OPERATIVE INSTRUCTIONS', margin, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  instructions.forEach((instr) => {
    checkY(8);
    const lines = doc.splitTextToSize(`[ ] ${instr}`, contentWidth - 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4.5;
  });
  y += 3;

  addHLine(y);
  y += 5;

  // ── NEXT STEPS ────────────────────────────────────────────────────────────
  checkY(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor('#1E40AF');
  doc.text('NEXT STEPS', margin, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Tentative Surgery Date: ${data.nextSurgeryDate || '______________________'}`, margin, y);
  doc.text(`Time: ${data.nextSurgeryTime || '___________'}`, pageWidth / 2 + 5, y);
  y += 6;
  doc.text(`Operating Surgeon: ${data.doctorName || '____________________________________________'}`, margin, y);
  y += 6;
  doc.text(`Report to: ${data.reportTo || '____________________________________________________'}`, margin, y);
  y += 6;
  doc.text(`Follow-up visit: ${data.followUpDate || '_______________________________________________'}`, margin, y);
  y += 8;

  addHLine(y);
  y += 5;

  // ── COUNSELLOR LINE ──────────────────────────────────────────────────────
  checkY(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    `Counsellor: ${data.counsellorName || '______________________'}    Designation: ${data.counsellorDesignation || '___________________'}`,
    margin, y
  );
  y += 7;

  addHLine(y);
  y += 5;

  // ── PATIENT CONSENT ──────────────────────────────────────────────────────
  checkY(28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor('#1E40AF');
  doc.text('PATIENT / GUARDIAN CONSENT DECLARATION', margin, y);
  doc.setTextColor(0, 0, 0);
  y += 5;

  const consentText = data.consentText || DEFAULT_CONSENT;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const consentLines = doc.splitTextToSize(consentText, contentWidth);
  doc.text(consentLines, margin, y);
  y += consentLines.length * 4.5 + 6;

  // ── SIGNATURE BLOCK ──────────────────────────────────────────────────────
  checkY(68);
  const sigY = y;

  addHLine(sigY, '#D1D5DB', 0.5);

  const halfW = (contentWidth - 10) / 2;
  const rightSigX = margin + halfW + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Patient / Guardian', margin, sigY + 7);
  doc.text('Counsellor', rightSigX, sigY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  doc.text('Name: _______________________________', margin, sigY + 15);
  doc.text('Signature: ____________________________', margin, sigY + 22);
  doc.text('Date: _______________', margin, sigY + 29);
  doc.text('Guardian Name (if applicable): _____________', margin, sigY + 36);
  doc.text('Guardian Signature: ____________________', margin, sigY + 43);
  doc.text('Relation: ______________________________', margin, sigY + 50);

  doc.text(`Name: ${data.counsellorName || '______________________'}`, rightSigX, sigY + 15);
  doc.text(`Designation: ${data.counsellorDesignation || '_____________'}`, rightSigX, sigY + 22);
  doc.text('Signature: ____________________________', rightSigX, sigY + 29);
  doc.text('Date: _______________', rightSigX, sigY + 36);

  // Hospital Stamp box
  doc.setDrawColor('#9CA3AF');
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(rightSigX, sigY + 40, halfW, 18, 'S');
  doc.setLineDashPattern([], 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text('HOSPITAL STAMP', rightSigX + halfW / 2, sigY + 50, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Footer — always on the last (current) page
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `Generated: ${new Date().toLocaleString('en-IN')} — ${data.hospitalName}  |  This document is computer-generated.`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 5,
    { align: 'center' }
  );

  return doc.output('blob');
}
// ============================================================
// ADMISSION SLIP PDF
// ============================================================

export interface AdmissionSlipData {
  hospitalName: string;
  patientName: string;
  patientMRN?: string;
  surgeryDate?: string;
  surgeryTime?: string;
  reportTo?: string;
  doctorName?: string;
  paymentMode?: string;
}

/**
 * Generate a simple admission / day-care instruction slip
 */
export async function generateAdmissionSlipPDF(data: AdmissionSlipData): Promise<Blob> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.hospitalName, pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('ADMISSION / DAY-CARE INSTRUCTIONS', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setDrawColor('#2563EB');
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Patient details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const fields: [string, string | undefined][] = [
    ['Patient', data.patientName + (data.patientMRN ? `  |  MRN: ${data.patientMRN}` : '')],
    ['Surgeon', data.doctorName],
    ['Surgery Date', data.surgeryDate],
    ['Reporting Time', data.surgeryTime],
    ['Report To', data.reportTo],
    ['Payment Mode', data.paymentMode],
  ];
  fields.forEach(([label, value]) => {
    if (value) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 38, y);
      y += 7;
    }
  });

  y += 4;
  doc.setDrawColor('#E5E7EB');
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Instructions checklist
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Important Instructions:', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const checklist = [
    'Please arrive at the hospital at least 30 minutes before the scheduled time.',
    'Bring all previous reports, prescriptions, and valid ID proof.',
    'Do not eat or drink anything for at least 6 hours before surgery.',
    'Arrange a companion to accompany you on the day of surgery.',
    'Bring all medications you are currently taking.',
    'Do not wear contact lenses, jewellery, or make-up on the day of surgery.',
  ];
  checklist.forEach((item) => {
    const lines = doc.splitTextToSize(`• ${item}`, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 6 + 1;
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `Generated: ${new Date().toLocaleString('en-IN')} — ${data.hospitalName}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'center' }
  );

  return doc.output('blob');
}
