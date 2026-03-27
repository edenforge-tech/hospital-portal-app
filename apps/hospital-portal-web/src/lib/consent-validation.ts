// Consent Validation Utilities
import { consentsApi } from '@/lib/api/consents.api';
import type { ConsentTemplate, PatientConsent } from '@/types/counselor';

/**
 * Validate that all required consents are signed for a session
 */
export async function validateSessionConsents(sessionId: string): Promise<{
  isValid: boolean;
  missingConsents: string[];
  totalRequired: number;
  signedCount: number;
}> {
  try {
    // Fetch all active templates
    const templates = await consentsApi.getTemplates();
    const activeTemplates = templates.filter((t) => t.isActive);

    // Fetch consents for this session
    const consents = await consentsApi.getSessionConsents(sessionId);

    // Check which consents are missing or unsigned
    const missingConsents: string[] = [];
    let signedCount = 0;

    for (const template of activeTemplates) {
      const consent = consents.find((c) => c.templateId === template.id);
      
      if (!consent) {
        missingConsents.push(template.templateName);
      } else if (consent.consentStatus !== 'FullySigned') {
        missingConsents.push(template.templateName);
      } else {
        signedCount++;
      }
    }

    return {
      isValid: missingConsents.length === 0,
      missingConsents,
      totalRequired: activeTemplates.length,
      signedCount,
    };
  } catch (error) {
    console.error('Error validating consents:', error);
    return {
      isValid: false,
      missingConsents: ['Error validating consents'],
      totalRequired: 0,
      signedCount: 0,
    };
  }
}

/**
 * Validate pre-surgery requirements
 */
export async function validatePreSurgeryRequirements(sessionId: string): Promise<{
  canProceedToSurgery: boolean;
  missingRequirements: string[];
}> {
  const consentValidation = await validateSessionConsents(sessionId);
  const missingRequirements: string[] = [];

  // Check consents
  if (!consentValidation.isValid) {
    missingRequirements.push(...consentValidation.missingConsents.map(c => `Consent: ${c}`));
  }

  // Add additional pre-surgery checks here (e.g., payment, insurance, medical clearance)
  // For now, only checking consents

  return {
    canProceedToSurgery: missingRequirements.length === 0,
    missingRequirements,
  };
}

/**
 * Get consent requirement summary for a session
 */
export async function getConsentSummary(sessionId: string): Promise<{
  total: number;
  signed: number;
  pending: number;
  percentage: number;
}> {
  const validation = await validateSessionConsents(sessionId);
  const total = validation.totalRequired;
  const signed = validation.signedCount;
  const pending = total - signed;
  const percentage = total > 0 ? Math.round((signed / total) * 100) : 0;

  return {
    total,
    signed,
    pending,
    percentage,
  };
}
