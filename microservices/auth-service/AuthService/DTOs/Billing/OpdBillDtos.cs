using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace AuthService.DTOs.Billing;

// ============ OPD Bill DTOs ============

public class OpdBillDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string BillNumber { get; set; } = null!;
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientMrn { get; set; }
    public Guid AppointmentId { get; set; }
    public Guid BranchId { get; set; }
    public string? BranchName { get; set; }
    public Guid? BillingRuleId { get; set; }
    public DateTime BillDate { get; set; }
    
    // Amounts - matches actual database schema
    public decimal ConsultationFee { get; set; }
    public decimal RegistrationFee { get; set; }
    public decimal AdditionalCharges { get; set; }
    public decimal GrossAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal NetAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal BalanceDue { get; set; }
    
    // Status
    public string Status { get; set; } = null!;
    public bool IsLocked { get; set; }
    public bool IsFreeVisit { get; set; }
    public string? FreeVisitReason { get; set; }
    public bool IsCredit { get; set; }
    public Guid? CreditApprovedBy { get; set; }
    public DateTime? CreditApprovedAt { get; set; }
    public string? CreditNotes { get; set; }
    public bool IsInsurance { get; set; }
    public string? InsuranceProvider { get; set; }
    public string? InsurancePolicyNumber { get; set; }
    public decimal InsuranceClaimAmount { get; set; }
    
    // Items
    public List<OpdBillItemDto>? BillItems { get; set; }
    public List<OpdBillPaymentDto>? Payments { get; set; }
    
    // Timestamps
    public Guid GeneratedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class OpdBillListDto
{
    public Guid Id { get; set; }
    public string BillNumber { get; set; } = null!;
    public string PatientName { get; set; } = null!;
    public string PatientMrn { get; set; } = null!;
    public DateTime BillDate { get; set; }
    public decimal NetAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal BalanceDue { get; set; }
    public string Status { get; set; } = null!;
    public bool IsFreeVisit { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ============ Bill Item DTOs ============

public class OpdBillItemDto
{
    public int Sequence { get; set; }
    public string ItemType { get; set; } = null!; // consultation, service, investigation, other
    public string ItemCode { get; set; } = null!;
    public string ItemName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal Amount { get; set; }
    public string? Notes { get; set; }
}

// ============ Payment DTOs ============

public class OpdBillPaymentDto
{
    public Guid Id { get; set; }
    public string PaymentReference { get; set; } = null!;
    public string PaymentMode { get; set; } = null!;
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? ReceivedByName { get; set; }
    public string? ReceiptNumber { get; set; }
    public string? CardType { get; set; }
    public string? CardLastFour { get; set; }
    public string? UpiId { get; set; }
}

// ============ Create/Update DTOs ============

public class CreateOpdBillDto
{
    [Required]
    public Guid AppointmentId { get; set; }
    
    [Required]
    public Guid PatientId { get; set; }
    
    [Required]
    public Guid BranchId { get; set; }
    
    public Guid? ConsultantId { get; set; }
    
    [Required]
    public decimal ConsultationFee { get; set; }
    
    public decimal RegistrationFee { get; set; } = 0;
    
    public decimal AdditionalCharges { get; set; } = 0;
    
    public decimal? DiscountPercentage { get; set; }
    public string? DiscountReason { get; set; }
    
    public decimal TaxAmount { get; set; } = 0;
    
    public List<CreateBillItemDto>? Items { get; set; }
    
    public string? Notes { get; set; }
    
    // Free visit support
    public bool IsFreeVisit { get; set; } = false;
    public string? FreeVisitReason { get; set; }
    
    // Insurance support
    public bool IsInsurance { get; set; } = false;
    public string? InsuranceProvider { get; set; }
    public string? InsurancePolicyNumber { get; set; }
    public decimal? InsuranceClaimAmount { get; set; }
}

public class CreateBillItemDto
{
    [Required]
    public string ItemType { get; set; } = null!;
    
    [Required]
    public string ItemCode { get; set; } = null!;
    
    [Required]
    public string ItemName { get; set; } = null!;
    
    public int Quantity { get; set; } = 1;
    
    [Required]
    public decimal UnitPrice { get; set; }
    
    public decimal DiscountPercent { get; set; } = 0;
    
    public string? Notes { get; set; }
}

public class AddPaymentDto
{
    [Required]
    public Guid OpdBillId { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!; // cash, card, upi, insurance, credit, online
    
    [Required]
    public decimal Amount { get; set; }
    
    // Card payment details
    public string? CardLastFour { get; set; }
    public string? CardType { get; set; }
    public string? CardTransactionId { get; set; }
    
    // UPI payment details
    public string? UpiTransactionId { get; set; }
    public string? UpiVpa { get; set; }
    
    // Online payment details
    public string? GatewayTransactionId { get; set; }
    public string? GatewayName { get; set; }
    
    public string? Notes { get; set; }
}

public class ApplyCreditDto
{
    [Required]
    public Guid OpdBillId { get; set; }
    
    public string? CreditNotes { get; set; }
}

public class ApplyDiscountDto
{
    [Required]
    public Guid OpdBillId { get; set; }
    
    [Required]
    public decimal DiscountPercentage { get; set; }
    
    [Required]
    public string DiscountReason { get; set; } = null!;
    
    // Authorization (required if discount > threshold)
    public string? AuthorizationPin { get; set; }
}

// ============ Billing Rules DTOs ============

public class BillingRuleDto
{
    public Guid Id { get; set; }
    public Guid? BranchId { get; set; }
    public string? BranchName { get; set; }
    public string Name { get; set; } = null!;
    public string VisitType { get; set; } = null!;
    public int FreeDays { get; set; }
    public int FreeVisits { get; set; }
    public string Condition { get; set; } = null!;
    public decimal DefaultFee { get; set; }
    public bool IsActive { get; set; }
    public int Priority { get; set; }
    public string? Description { get; set; }
}

public class CreateBillingRuleDto
{
    public Guid? BranchId { get; set; }
    
    [Required]
    public string Name { get; set; } = null!;
    
    [Required]
    public string VisitType { get; set; } = null!;
    
    public int FreeDays { get; set; } = 7;
    public int FreeVisits { get; set; } = 2;
    public string Condition { get; set; } = "first_reached";
    public decimal DefaultFee { get; set; }
    public int Priority { get; set; } = 100;
    public string? Description { get; set; }
}

public class UpdateBillingRuleDto
{
    public string? Name { get; set; }
    public int? FreeDays { get; set; }
    public int? FreeVisits { get; set; }
    public string? Condition { get; set; }
    public decimal? DefaultFee { get; set; }
    public bool? IsActive { get; set; }
    public int? Priority { get; set; }
    public string? Description { get; set; }
}

// ============ Billing Check DTOs ============

public class BillingCheckDto
{
    public Guid PatientId { get; set; }
    public Guid AppointmentId { get; set; }
    public string VisitType { get; set; } = null!;
    public bool IsFreeVisit { get; set; }
    public string? FreeVisitReason { get; set; }
    public decimal RecommendedFee { get; set; }
    public BillingRuleDto? AppliedRule { get; set; }
    public int PreviousVisitsInPeriod { get; set; }
    public DateTime? LastVisitDate { get; set; }
}
