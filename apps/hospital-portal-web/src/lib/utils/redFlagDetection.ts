/**
 * Red Flag Detection Utility for Ophthalmology Examinations
 * 
 * Analyzes optometry data to detect critical findings that require
 * immediate attention from the examining doctor.
 */

import { Alert } from '@/components/doctors-desk/AlertBanner';

interface OptometryData {
  visualAcuity?: {
    distanceOD?: string;
    distanceOS?: string;
    nearOD?: string;
    nearOS?: string;
    pinholeOD?: string;
    pinholeOS?: string;
  };
  tonometry?: {
    iopOD?: number;
    iopOS?: number;
    method?: string;
    time?: string;
  };
  refraction?: {
    finalRxOD?: { sphere?: number; cylinder?: number; axis?: number };
    finalRxOS?: { sphere?: number; cylinder?: number; axis?: number };
  };
  keratometry?: {
    k1OD?: number;
    k2OD?: number;
    axisOD?: number;
    k1OS?: number;
    k2OS?: number;
    axisOS?: number;
  };
  pachymetry?: {
    cctOD?: number;
    cctOS?: number;
  };
}

/**
 * Converts Snellen visual acuity to a numeric score for comparison
 * Higher numbers = worse vision
 */
function snellenToScore(snellen: string): number {
  if (!snellen) return 0;
  
  const cleanSnellen = snellen.toUpperCase().trim();
  
  // Special cases
  const specialCases: { [key: string]: number } = {
    'NPL': 1000, // No perception of light (worst possible)
    'PL': 900,   // Perception of light only
    'HM': 800,   // Hand motion
    'CF': 700,   // Counting fingers
    'CFCF': 700,
  };
  
  if (specialCases[cleanSnellen]) {
    return specialCases[cleanSnellen];
  }
  
  // Parse fraction (e.g., "6/60", "20/200")
  const match = cleanSnellen.match(/(\d+)\/(\d+)/);
  if (match) {
    const numerator = parseInt(match[1]);
    const denominator = parseInt(match[2]);
    return (denominator / numerator) * 100; // Higher denominator = worse vision
  }
  
  return 0;
}

/**
 * Analyzes optometry data and generates red flag alerts
 */
export function detectRedFlags(optometryData: OptometryData | null): Alert[] {
  if (!optometryData) {
    return [];
  }

  const alerts: Alert[] = [];
  let alertIdCounter = 1;

  // ===== IOP RED FLAGS =====
  if (optometryData.tonometry) {
    const { iopOD, iopOS } = optometryData.tonometry;
    
    // Critical: Very high IOP (>30 mmHg) - possible acute angle closure
    if (iopOD && iopOD > 30) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'critical',
        message: `Critically High IOP in Right Eye: ${iopOD} mmHg`,
        details: 'Possible acute angle closure glaucoma - requires immediate evaluation and management. Assess for pain, halos, pupil dilation.'
      });
    }
    if (iopOS && iopOS > 30) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'critical',
        message: `Critically High IOP in Left Eye: ${iopOS} mmHg`,
        details: 'Possible acute angle closure glaucoma - requires immediate evaluation and management. Assess for pain, halos, pupil dilation.'
      });
    }
    
    // Warning: Elevated IOP (21-30 mmHg) - possible glaucoma
    if (iopOD && iopOD > 21 && iopOD <= 30) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'warning',
        message: `Elevated IOP in Right Eye: ${iopOD} mmHg`,
        details: 'Possible ocular hypertension or glaucoma. Review optic nerve and visual field. Consider gonioscopy if not recently done.'
      });
    }
    if (iopOS && iopOS > 21 && iopOS <= 30) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'warning',
        message: `Elevated IOP in Left Eye: ${iopOS} mmHg`,
        details: 'Possible ocular hypertension or glaucoma. Review optic nerve and visual field. Consider gonioscopy if not recently done.'
      });
    }
    
    // Warning: Significant IOP asymmetry (>5 mmHg difference)
    if (iopOD && iopOS && Math.abs(iopOD - iopOS) > 5) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'warning',
        message: `Significant IOP Asymmetry: ${Math.abs(iopOD - iopOS)} mmHg difference`,
        details: `OD: ${iopOD} mmHg, OS: ${iopOS} mmHg. Consider causes of asymmetric IOP (angle closure, inflammation, trauma, steroid use).`
      });
    }
  }

  // ===== VISUAL ACUITY RED FLAGS =====
  if (optometryData.visualAcuity) {
    const { distanceOD, distanceOS, pinholeOD, pinholeOS } = optometryData.visualAcuity;
    
    // Critical: Severe vision loss (worse than 6/60 or 20/200)
    if (distanceOD) {
      const scoreOD = snellenToScore(distanceOD);
      if (scoreOD >= 300) { // 6/60 or worse
        alerts.push({
          id: `alert-${alertIdCounter++}`,
          severity: 'critical',
          message: `Severe Vision Loss in Right Eye: ${distanceOD}`,
          details: 'Legal blindness threshold. Investigate cause: cataract, macular disease, optic neuropathy, or retinal pathology.'
        });
      }
    }
    
    if (distanceOS) {
      const scoreOS = snellenToScore(distanceOS);
      if (scoreOS >= 300) { // 6/60 or worse
        alerts.push({
          id: `alert-${alertIdCounter++}`,
          severity: 'critical',
          message: `Severe Vision Loss in Left Eye: ${distanceOS}`,
          details: 'Legal blindness threshold. Investigate cause: cataract, macular disease, optic neuropathy, or retinal pathology.'
        });
      }
    }
    
    // Warning: Poor pinhole improvement suggests non-refractive cause
    if (distanceOD && pinholeOD) {
      const distanceScore = snellenToScore(distanceOD);
      const pinholeScore = snellenToScore(pinholeOD);
      const improvement = distanceScore - pinholeScore;
      
      if (distanceScore > 100 && improvement < 50) { // Poor vision with minimal pinhole improvement
        alerts.push({
          id: `alert-${alertIdCounter++}`,
          severity: 'warning',
          message: `Poor Pinhole Improvement in Right Eye`,
          details: `Distance: ${distanceOD}, Pinhole: ${pinholeOD}. Minimal improvement suggests pathology beyond refractive error (media opacity, macular disease, optic nerve disorder).`
        });
      }
    }
    
    if (distanceOS && pinholeOS) {
      const distanceScore = snellenToScore(distanceOS);
      const pinholeScore = snellenToScore(pinholeOS);
      const improvement = distanceScore - pinholeScore;
      
      if (distanceScore > 100 && improvement < 50) {
        alerts.push({
          id: `alert-${alertIdCounter++}`,
          severity: 'warning',
          message: `Poor Pinhole Improvement in Left Eye`,
          details: `Distance: ${distanceOS}, Pinhole: ${pinholeOS}. Minimal improvement suggests pathology beyond refractive error (media opacity, macular disease, optic nerve disorder).`
        });
      }
    }
  }

  // ===== KERATOMETRY RED FLAGS =====
  if (optometryData.keratometry) {
    const { k1OD, k2OD, k1OS, k2OS } = optometryData.keratometry;
    
    // Warning: Steep keratometry (>47D) - possible keratoconus
    if (k2OD && k2OD > 47) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'warning',
        message: `Steep Keratometry in Right Eye: ${k2OD.toFixed(2)}D`,
        details: 'Rule out keratoconus. Check for irregular astigmatism, scissoring reflex, Vogt striae, Fleischer ring.'
      });
    }
    
    if (k2OS && k2OS > 47) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'warning',
        message: `Steep Keratometry in Left Eye: ${k2OS.toFixed(2)}D`,
        details: 'Rule out keratoconus. Check for irregular astigmatism, scissoring reflex, Vogt striae, Fleischer ring.'
      });
    }
    
    // Warning: High astigmatism (>3D difference between K1 and K2)
    if (k1OD && k2OD && Math.abs(k2OD - k1OD) > 3) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'warning',
        message: `High Corneal Astigmatism in Right Eye: ${Math.abs(k2OD - k1OD).toFixed(2)}D`,
        details: 'Assess for irregular astigmatism or keratoconus. Consider corneal topography if not recently done.'
      });
    }
    
    if (k1OS && k2OS && Math.abs(k2OS - k1OS) > 3) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'warning',
        message: `High Corneal Astigmatism in Left Eye: ${Math.abs(k2OS - k1OS).toFixed(2)}D`,
        details: 'Assess for irregular astigmatism or keratoconus. Consider corneal topography if not recently done.'
      });
    }
  }

  // ===== PACHYMETRY RED FLAGS =====
  if (optometryData.pachymetry) {
    const { cctOD, cctOS } = optometryData.pachymetry;
    
    // Info: Thin cornea (<500μm) affects IOP measurement accuracy
    if (cctOD && cctOD < 500) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'info',
        message: `Thin Central Corneal Thickness in Right Eye: ${cctOD}μm`,
        details: 'IOP may be underestimated. Adjust glaucoma risk assessment accordingly. Normal range: 520-560μm.'
      });
    }
    
    if (cctOS && cctOS < 500) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'info',
        message: `Thin Central Corneal Thickness in Left Eye: ${cctOS}μm`,
        details: 'IOP may be underestimated. Adjust glaucoma risk assessment accordingly. Normal range: 520-560μm.'
      });
    }
    
    // Info: Thick cornea (>580μm) affects IOP measurement
    if (cctOD && cctOD > 580) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'info',
        message: `Thick Central Corneal Thickness in Right Eye: ${cctOD}μm`,
        details: 'IOP may be overestimated. Consider this when evaluating glaucoma risk. Normal range: 520-560μm.'
      });
    }
    
    if (cctOS && cctOS > 580) {
      alerts.push({
        id: `alert-${alertIdCounter++}`,
        severity: 'info',
        message: `Thick Central Corneal Thickness in Left Eye: ${cctOS}μm`,
        details: 'IOP may be overestimated. Consider this when evaluating glaucoma risk. Normal range: 520-560μm.'
      });
    }
  }

  // Sort alerts: critical first, then warning, then info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

/**
 * Helper function to check if there are any critical alerts
 */
export function hasCriticalAlerts(alerts: Alert[]): boolean {
  return alerts.some(alert => alert.severity === 'critical');
}

/**
 * Helper function to get alert count by severity
 */
export function getAlertCounts(alerts: Alert[]) {
  return {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
    total: alerts.length
  };
}
