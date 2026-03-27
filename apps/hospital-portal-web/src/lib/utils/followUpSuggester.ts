// Smart Follow-Up Suggester
// Maps ICD-10 diagnosis codes to recommended follow-up intervals

export interface FollowUpSuggestion {
  interval: number; // Days
  reason: string;
  urgency: 'routine' | 'urgent' | 'critical';
  multipleVisits?: Array<{ days: number; reason: string }>;
}

/**
 * Get recommended follow-up based on diagnosis ICD-10 codes
 * @param icd10Codes Array of ICD-10 codes from diagnoses
 * @param isPOPostOp Whether patient is post-operative (affects suggestions)
 * @returns Suggested follow-up interval and reason
 */
export function getFollowUpSuggestion(
  icd10Codes: string[],
  isPOPostOp: boolean = false
): FollowUpSuggestion {
  
  // Default routine follow-up
  const defaultSuggestion: FollowUpSuggestion = {
    interval: 30,
    reason: 'Routine follow-up',
    urgency: 'routine',
  };

  if (!icd10Codes || icd10Codes.length === 0) {
    return defaultSuggestion;
  }

  // Check for highest priority conditions first
  
  // ========================================
  // CRITICAL CONDITIONS (1-7 days)
  // ========================================
  
  // Acute Angle-Closure Glaucoma (H40.2x)
  if (icd10Codes.some(code => code.startsWith('H40.2'))) {
    return {
      interval: 1,
      reason: 'Acute angle-closure glaucoma - check IOP and inflammation',
      urgency: 'critical',
      multipleVisits: [
        { days: 1, reason: 'Check IOP and response to treatment' },
        { days: 7, reason: 'Re-evaluate IOP control' },
        { days: 30, reason: 'Long-term management assessment' },
      ],
    };
  }

  // Retinal Detachment (H33.x)
  if (icd10Codes.some(code => code.startsWith('H33'))) {
    return {
      interval: 1,
      reason: 'Retinal detachment - urgent surgical evaluation',
      urgency: 'critical',
    };
  }

  // Endophthalmitis (H44.0x)
  if (icd10Codes.some(code => code.startsWith('H44.0'))) {
    return {
      interval: 1,
      reason: 'Endophthalmitis - daily follow-up required',
      urgency: 'critical',
      multipleVisits: [
        { days: 1, reason: 'Check response to antibiotics' },
        { days: 3, reason: 'Re-assess infection control' },
        { days: 7, reason: 'Visual recovery assessment' },
      ],
    };
  }

  // Central Retinal Artery Occlusion (H34.1)
  if (icd10Codes.some(code => code.startsWith('H34.1'))) {
    return {
      interval: 1,
      reason: 'CRAO - urgent evaluation and systemic workup',
      urgency: 'critical',
    };
  }

  // ========================================
  // POST-OPERATIVE FOLLOW-UPS
  // ========================================
  
  // Cataract Post-Op (H26.x or Z98.89 with isPOPostOp flag)
  if (isPOPostOp || icd10Codes.some(code => code.startsWith('Z98.89'))) {
    return {
      interval: 1,
      reason: 'Post-operative cataract surgery follow-up',
      urgency: 'urgent',
      multipleVisits: [
        { days: 1, reason: 'Day 1 post-op - check IOP, inflammation, wound' },
        { days: 7, reason: 'Week 1 - visual acuity, refraction' },
        { days: 30, reason: 'Month 1 - final visual outcome, refraction' },
      ],
    };
  }

  // Glaucoma Surgery Post-Op (Z98.89 with glaucoma diagnosis)
  if (
    isPOPostOp && 
    icd10Codes.some(code => code.startsWith('H40'))
  ) {
    return {
      interval: 1,
      reason: 'Post-operative glaucoma surgery follow-up',
      urgency: 'urgent',
      multipleVisits: [
        { days: 1, reason: 'Day 1 - check bleb, IOP, anterior chamber' },
        { days: 7, reason: 'Week 1 - IOP control assessment' },
        { days: 30, reason: 'Month 1 - long-term IOP control' },
      ],
    };
  }

  // ========================================
  // URGENT CONDITIONS (7-14 days)
  // ========================================
  
  // Acute Iritis/Uveitis (H20.x)
  if (icd10Codes.some(code => code.startsWith('H20'))) {
    return {
      interval: 7,
      reason: 'Acute iritis - monitor inflammation response',
      urgency: 'urgent',
    };
  }

  // Corneal Ulcer (H16.0)
  if (icd10Codes.some(code => code.startsWith('H16.0'))) {
    return {
      interval: 3,
      reason: 'Corneal ulcer - monitor healing and response to treatment',
      urgency: 'urgent',
    };
  }

  // Preseptal/Orbital Cellulitis (H05.01)
  if (icd10Codes.some(code => code.startsWith('H05.01'))) {
    return {
      interval: 3,
      reason: 'Orbital/preseptal cellulitis - monitor infection resolution',
      urgency: 'urgent',
    };
  }

  // ========================================
  // GLAUCOMA CONDITIONS (30 days)
  // ========================================
  
  // Primary Open-Angle Glaucoma (H40.11)
  if (icd10Codes.some(code => code.startsWith('H40.11'))) {
    return {
      interval: 30,
      reason: 'POAG - re-check IOP after medication initiation',
      urgency: 'routine',
    };
  }

  // Glaucoma Suspect (H40.00)
  if (icd10Codes.some(code => code.startsWith('H40.00'))) {
    return {
      interval: 60,
      reason: 'Glaucoma suspect - monitor IOP and optic disc',
      urgency: 'routine',
    };
  }

  // Any other glaucoma (H40.x)
  if (icd10Codes.some(code => code.startsWith('H40'))) {
    return {
      interval: 30,
      reason: 'Glaucoma management - monitor IOP control',
      urgency: 'routine',
    };
  }

  // ========================================
  // DIABETIC RETINOPATHY (60-90 days)
  // ========================================
  
  // Proliferative Diabetic Retinopathy (E11.359)
  if (icd10Codes.some(code => code.includes('E11.35') || code.includes('E10.35'))) {
    return {
      interval: 60,
      reason: 'PDR - progression monitoring and laser/injection planning',
      urgency: 'routine',
    };
  }

  // Non-Proliferative Diabetic Retinopathy - Severe (E11.349)
  if (icd10Codes.some(code => code.includes('E11.34') || code.includes('E10.34'))) {
    return {
      interval: 90,
      reason: 'Severe NPDR - monitor for progression to PDR',
      urgency: 'routine',
    };
  }

  // Non-Proliferative Diabetic Retinopathy - Moderate (E11.339)
  if (icd10Codes.some(code => code.includes('E11.33') || code.includes('E10.33'))) {
    return {
      interval: 120,
      reason: 'Moderate NPDR - monitor for progression',
      urgency: 'routine',
    };
  }

  // Non-Proliferative Diabetic Retinopathy - Mild (E11.329)
  if (icd10Codes.some(code => code.includes('E11.32') || code.includes('E10.32'))) {
    return {
      interval: 180,
      reason: 'Mild NPDR - routine progression monitoring',
      urgency: 'routine',
    };
  }

  // Diabetic Macular Edema (E11.311)
  if (icd10Codes.some(code => code.includes('E11.31') || code.includes('E10.31'))) {
    return {
      interval: 30,
      reason: 'DME - post-injection follow-up or treatment planning',
      urgency: 'routine',
    };
  }

  // ========================================
  // AGE-RELATED MACULAR DEGENERATION (30-90 days)
  // ========================================
  
  // Wet AMD (H35.32)
  if (icd10Codes.some(code => code.startsWith('H35.32'))) {
    return {
      interval: 30,
      reason: 'Wet AMD - anti-VEGF injection follow-up',
      urgency: 'routine',
    };
  }

  // Dry AMD (H35.31)
  if (icd10Codes.some(code => code.startsWith('H35.31'))) {
    return {
      interval: 180,
      reason: 'Dry AMD - monitor for progression',
      urgency: 'routine',
    };
  }

  // ========================================
  // CATARACT (90-180 days)
  // ========================================
  
  // Senile Cataract (H25.x)
  if (icd10Codes.some(code => code.startsWith('H25'))) {
    return {
      interval: 180,
      reason: 'Cataract monitoring - reassess visual function',
      urgency: 'routine',
    };
  }

  // ========================================
  // REFRACTIVE ERRORS (365 days)
  // ========================================
  
  // Myopia (H52.1)
  if (icd10Codes.some(code => code.startsWith('H52.1'))) {
    return {
      interval: 365,
      reason: 'Myopia - annual refraction check',
      urgency: 'routine',
    };
  }

  // Hypermetropia (H52.0)
  if (icd10Codes.some(code => code.startsWith('H52.0'))) {
    return {
      interval: 365,
      reason: 'Hypermetropia - annual refraction check',
      urgency: 'routine',
    };
  }

  // Astigmatism (H52.2)
  if (icd10Codes.some(code => code.startsWith('H52.2'))) {
    return {
      interval: 365,
      reason: 'Astigmatism - annual refraction check',
      urgency: 'routine',
    };
  }

  // Presbyopia (H52.4)
  if (icd10Codes.some(code => code.startsWith('H52.4'))) {
    return {
      interval: 365,
      reason: 'Presbyopia - annual prescription update',
      urgency: 'routine',
    };
  }

  // ========================================
  // ALLERGIC CONDITIONS (14-30 days)
  // ========================================
  
  // Allergic Conjunctivitis (H10.1)
  if (icd10Codes.some(code => code.startsWith('H10.1'))) {
    return {
      interval: 14,
      reason: 'Allergic conjunctivitis - assess treatment response',
      urgency: 'routine',
    };
  }

  // ========================================
  // DRY EYE (30-60 days)
  // ========================================
  
  // Dry Eye Syndrome (H04.12)
  if (icd10Codes.some(code => code.startsWith('H04.12') || code.startsWith('H04.122'))) {
    return {
      interval: 60,
      reason: 'Dry eye - assess treatment efficacy',
      urgency: 'routine',
    };
  }

  // ========================================
  // KERATOCONUS (60-90 days)
  // ========================================
  
  // Keratoconus (H18.6)
  if (icd10Codes.some(code => code.startsWith('H18.6'))) {
    return {
      interval: 90,
      reason: 'Keratoconus - monitor progression, consider cross-linking',
      urgency: 'routine',
    };
  }

  // ========================================
  // DEFAULT
  // ========================================
  
  return defaultSuggestion;
}

/**
 * Calculate follow-up date from today
 * @param daysFromNow Number of days from today
 * @returns Date object
 */
export function calculateFollowUpDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

/**
 * Format date for display
 * @param date Date to format
 * @returns Formatted date string (DD-MMM-YYYY)
 */
export function formatFollowUpDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Get all follow-up visit schedule for multi-visit conditions
 * @param icd10Codes Array of ICD-10 codes
 * @param isPOPostOp Whether patient is post-operative
 * @returns Array of follow-up visit schedules
 */
export function getFollowUpSchedule(
  icd10Codes: string[],
  isPOPostOp: boolean = false
): Array<{ date: Date; reason: string; urgency: string }> {
  const suggestion = getFollowUpSuggestion(icd10Codes, isPOPostOp);
  
  if (suggestion.multipleVisits) {
    return suggestion.multipleVisits.map(visit => ({
      date: calculateFollowUpDate(visit.days),
      reason: visit.reason,
      urgency: suggestion.urgency,
    }));
  }
  
  // Single visit
  return [{
    date: calculateFollowUpDate(suggestion.interval),
    reason: suggestion.reason,
    urgency: suggestion.urgency,
  }];
}
