// Cost Estimate Sharing API
// Email, SMS, and WhatsApp sharing functionality

import { getApi } from '../api';

export interface ShareCostEstimateRequest {
  // Patient Information
  patientId?: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;

  // Cost Information
  estimateNumber?: string;
  totalCost: number;
  surgeryName: string;
  doctorName?: string;

  // Sharing Options
  method: 'email' | 'sms' | 'whatsapp';
  
  // PDF Attachment (Base64 encoded)
  pdfBase64?: string;
  pdfFilename?: string;

  // Message Customization
  subject?: string;
  message?: string;
  includeEstimateLink?: boolean;
}

export interface ShareCostEstimateResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveredAt?: string;
}

/**
 * Share cost estimate via email with PDF attachment
 */
export const shareCostEstimateByEmail = async (
  request: ShareCostEstimateRequest
): Promise<ShareCostEstimateResponse> => {
  try {
    const response = await getApi().post('/counseling/share/email', {
      to: request.patientEmail,
      subject: request.subject || `Cost Estimate - ${request.surgeryName}`,
      body: request.message || generateEmailBody(request),
      attachments: request.pdfBase64
        ? [
            {
              filename: request.pdfFilename || 'cost-estimate.pdf',
              content: request.pdfBase64,
              contentType: 'application/pdf',
              encoding: 'base64',
            },
          ]
        : [],
      metadata: {
        estimateNumber: request.estimateNumber,
        patientId: request.patientId,
        totalCost: request.totalCost,
      },
    });

    return {
      success: true,
      messageId: response.data.messageId,
      deliveredAt: response.data.deliveredAt,
    };
  } catch (error: any) {
    console.error('Error sharing cost estimate by email:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send email',
    };
  }
};

/**
 * Share cost estimate via SMS with download link
 */
export const shareCostEstimateBySMS = async (
  request: ShareCostEstimateRequest
): Promise<ShareCostEstimateResponse> => {
  try {
    const response = await getApi().post('/counseling/share/sms', {
      to: request.patientPhone,
      message: request.message || generateSMSBody(request),
      metadata: {
        estimateNumber: request.estimateNumber,
        patientId: request.patientId,
        totalCost: request.totalCost,
      },
    });

    return {
      success: true,
      messageId: response.data.messageId,
      deliveredAt: response.data.deliveredAt,
    };
  } catch (error: any) {
    console.error('Error sharing cost estimate by SMS:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send SMS',
    };
  }
};

/**
 * Share cost estimate via WhatsApp with PDF attachment
 */
export const shareCostEstimateByWhatsApp = async (
  request: ShareCostEstimateRequest
): Promise<ShareCostEstimateResponse> => {
  try {
    const response = await getApi().post('/counseling/share/whatsapp', {
      to: request.patientPhone,
      message: request.message || generateWhatsAppBody(request),
      attachments: request.pdfBase64
        ? [
            {
              filename: request.pdfFilename || 'cost-estimate.pdf',
              content: request.pdfBase64,
              contentType: 'application/pdf',
            },
          ]
        : [],
      metadata: {
        estimateNumber: request.estimateNumber,
        patientId: request.patientId,
        totalCost: request.totalCost,
      },
    });

    return {
      success: true,
      messageId: response.data.messageId,
      deliveredAt: response.data.deliveredAt,
    };
  } catch (error: any) {
    console.error('Error sharing cost estimate by WhatsApp:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send WhatsApp message',
    };
  }
};

/**
 * Universal share function that routes to appropriate method
 */
export const shareCostEstimate = async (
  request: ShareCostEstimateRequest
): Promise<ShareCostEstimateResponse> => {
  switch (request.method) {
    case 'email':
      return shareCostEstimateByEmail(request);
    case 'sms':
      return shareCostEstimateBySMS(request);
    case 'whatsapp':
      return shareCostEstimateByWhatsApp(request);
    default:
      return {
        success: false,
        error: `Unknown sharing method: ${request.method}`,
      };
  }
};

// ============================================================================
// MESSAGE TEMPLATES
// ============================================================================

function generateEmailBody(request: ShareCostEstimateRequest): string {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Cost Estimate for ${request.surgeryName}
          </h2>
          
          <p>Dear ${request.patientName},</p>
          
          <p>
            Thank you for choosing our hospital for your eye care needs. 
            Please find attached the cost estimate for your upcoming ${request.surgeryName} procedure.
          </p>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
              <strong style="font-size: 16px;">Estimated Total Cost:</strong><br>
              <span style="font-size: 24px; color: #2563eb; font-weight: bold;">${formatCurrency(request.totalCost)}</span>
            </p>
          </div>
          
          ${request.doctorName ? `<p><strong>Consulting Doctor:</strong> ${request.doctorName}</p>` : ''}
          
          ${
            request.estimateNumber
              ? `<p><strong>Estimate Number:</strong> ${request.estimateNumber}</p>`
              : ''
          }
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px;">
              <strong>Important Notes:</strong><br>
              • This is an estimated cost. Actual charges may vary based on your condition.<br>
              • This estimate is valid for 30 days from the date of issue.<br>
              • Please confirm pricing with our billing department before proceeding.<br>
            </p>
          </div>
          
          <p>
            If you have any questions about this estimate or would like to schedule your surgery,
            please don't hesitate to contact us.
          </p>
          
          <p>
            Thank you,<br>
            <strong>Hospital Team</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>
      </body>
    </html>
  `;
}

function generateSMSBody(request: ShareCostEstimateRequest): string {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return `Hi ${request.patientName}, your cost estimate for ${request.surgeryName} is ${formatCurrency(request.totalCost)}. ${request.estimateNumber ? `Ref: ${request.estimateNumber}. ` : ''}A detailed PDF has been sent to your email. Contact us for any questions. - Hospital Team`;
}

function generateWhatsAppBody(request: ShareCostEstimateRequest): string {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return `
*Cost Estimate*

Dear ${request.patientName},

Please find your cost estimate for *${request.surgeryName}*:

💰 *Total Cost:* ${formatCurrency(request.totalCost)}
${request.doctorName ? `👨‍⚕️ *Doctor:* ${request.doctorName}` : ''}
${request.estimateNumber ? `📋 *Estimate No:* ${request.estimateNumber}` : ''}

_This is an estimated cost. Actual charges may vary. Valid for 30 days._

If you have any questions, feel free to contact us.

Thank you,
*Hospital Team*
  `.trim();
}

export default {
  shareCostEstimate,
  shareCostEstimateByEmail,
  shareCostEstimateBySMS,
  shareCostEstimateByWhatsApp,
};
