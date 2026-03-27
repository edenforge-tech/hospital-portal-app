using System;
using System.Collections.Generic;

namespace AuthService.Models.Counselor
{
    // ==================== Consent Template DTOs ====================
    
    public class ConsentTemplateDto
    {
        public Guid Id { get; set; }
        public string TemplateName { get; set; } = null!;
        public string ConsentCategory { get; set; } = null!;
        public string? Description { get; set; }
        public string TemplateHtml { get; set; } = null!;
        public bool RequiresPatientSignature { get; set; }
        public bool RequiresWitnessSignature { get; set; }
        public bool RequiresGuardianSignature { get; set; }
        public string? Version { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateConsentTemplateRequest
    {
        public string TemplateName { get; set; } = null!;
        public string ConsentCategory { get; set; } = null!; // SurgeryConsent, AnesthesiaConsent, etc.
        public string? Description { get; set; }
        public string TemplateHtml { get; set; } = null!;
        public bool RequiresPatientSignature { get; set; } = true;
        public bool RequiresWitnessSignature { get; set; } = true;
        public bool RequiresGuardianSignature { get; set; } = false;
        public List<string>? ComplianceStandards { get; set; }
        public string? Version { get; set; }
    }

    // ==================== Patient Consent DTOs ====================
    
    public class PatientConsentDto
    {
        public Guid Id { get; set; }
        public Guid TemplateId { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? PackageId { get; set; }
        public string RenderedHtml { get; set; } = null!;
        public bool IsPatientSigned { get; set; }
        public DateTime? PatientSignedAt { get; set; }
        public bool IsWitnessSigned { get; set; }
        public DateTime? WitnessSignedAt { get; set; }
        public bool IsGuardianSigned { get; set; }
        public DateTime? GuardianSignedAt { get; set; }
        public string ConsentStatus { get; set; } = "Draft";
        public string? PdfUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Display fields (populated from JOINs)
        public string? PatientName { get; set; }
        public string? PatientMrn { get; set; }
    }

    public class RenderConsentRequest
    {
        public Guid TemplateId { get; set; }
        public Guid SessionId { get; set; }
        public Guid PatientId { get; set; }
        public Guid? PackageId { get; set; }
        public Dictionary<string, string> PlaceholderValues { get; set; } = new();
    }

    public class SignConsentRequest
    {
        public string? PatientSignatureBase64 { get; set; }
        public string? WitnessName { get; set; }
        public string? WitnessSignatureBase64 { get; set; }
        public string? GuardianName { get; set; }
        public string? GuardianRelation { get; set; }
        public string? GuardianSignatureBase64 { get; set; }
    }

    public class RevokeConsentRequest
    {
        public string RevocationReason { get; set; } = null!;
    }

    public class ConsentListResponse
    {
        public int TotalRecords { get; set; }
        public List<PatientConsentDto> Consents { get; set; } = new();
    }
}
