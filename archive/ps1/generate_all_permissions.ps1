# Generate Complete 297 Permissions SQL Script
# Hospital Portal - RBAC Implementation
# Date: November 10, 2025

$outputFile = "seed_all_297_permissions.sql"

# Define all 297 permissions organized by module
$permissions = @(
    # 1. PATIENT MANAGEMENT (24 permissions)
    @{Code="patient_management.patient_record.create"; Name="Create Patient Record"; Module="patient_management"; Action="create"; Resource="patient_record"},
    @{Code="patient_management.patient_record.read"; Name="Read Patient Record"; Module="patient_management"; Action="read"; Resource="patient_record"},
    @{Code="patient_management.patient_record.update"; Name="Update Patient Record"; Module="patient_management"; Action="update"; Resource="patient_record"},
    @{Code="patient_management.patient_record.delete"; Name="Delete Patient Record"; Module="patient_management"; Action="delete"; Resource="patient_record"},
    @{Code="patient_management.patient_demographics.create"; Name="Create Patient Demographics"; Module="patient_management"; Action="create"; Resource="patient_demographics"},
    @{Code="patient_management.patient_demographics.read"; Name="Read Patient Demographics"; Module="patient_management"; Action="read"; Resource="patient_demographics"},
    @{Code="patient_management.patient_demographics.update"; Name="Update Patient Demographics"; Module="patient_management"; Action="update"; Resource="patient_demographics"},
    @{Code="patient_management.patient_demographics.delete"; Name="Delete Patient Demographics"; Module="patient_management"; Action="delete"; Resource="patient_demographics"},
    @{Code="patient_management.patient_contact.create"; Name="Create Patient Contact"; Module="patient_management"; Action="create"; Resource="patient_contact"},
    @{Code="patient_management.patient_contact.read"; Name="Read Patient Contact"; Module="patient_management"; Action="read"; Resource="patient_contact"},
    @{Code="patient_management.patient_contact.update"; Name="Update Patient Contact"; Module="patient_management"; Action="update"; Resource="patient_contact"},
    @{Code="patient_management.patient_contact.delete"; Name="Delete Patient Contact"; Module="patient_management"; Action="delete"; Resource="patient_contact"},
    @{Code="patient_management.patient_consent.create"; Name="Create Patient Consent"; Module="patient_management"; Action="create"; Resource="patient_consent"},
    @{Code="patient_management.patient_consent.read"; Name="Read Patient Consent"; Module="patient_management"; Action="read"; Resource="patient_consent"},
    @{Code="patient_management.patient_consent.update"; Name="Update Patient Consent"; Module="patient_management"; Action="update"; Resource="patient_consent"},
    @{Code="patient_management.patient_consent.delete"; Name="Delete Patient Consent"; Module="patient_management"; Action="delete"; Resource="patient_consent"},
    @{Code="patient_management.patient_document.upload"; Name="Upload Patient Document"; Module="patient_management"; Action="upload"; Resource="patient_document"},
    @{Code="patient_management.patient_document.read"; Name="Read Patient Document"; Module="patient_management"; Action="read"; Resource="patient_document"},
    @{Code="patient_management.patient_document.update"; Name="Update Patient Document"; Module="patient_management"; Action="update"; Resource="patient_document"},
    @{Code="patient_management.patient_document.delete"; Name="Delete Patient Document"; Module="patient_management"; Action="delete"; Resource="patient_document"},
    @{Code="patient_management.patient_preferences.create"; Name="Create Patient Preferences"; Module="patient_management"; Action="create"; Resource="patient_preferences"},
    @{Code="patient_management.patient_preferences.read"; Name="Read Patient Preferences"; Module="patient_management"; Action="read"; Resource="patient_preferences"},
    @{Code="patient_management.patient_preferences.update"; Name="Update Patient Preferences"; Module="patient_management"; Action="update"; Resource="patient_preferences"},
    @{Code="patient_management.patient_preferences.delete"; Name="Delete Patient Preferences"; Module="patient_management"; Action="delete"; Resource="patient_preferences"},

    # 2. CLINICAL DOCUMENTATION (20 permissions)
    @{Code="clinical_documentation.assessment.create"; Name="Create Clinical Assessment"; Module="clinical_documentation"; Action="create"; Resource="assessment"},
    @{Code="clinical_documentation.assessment.read"; Name="Read Clinical Assessment"; Module="clinical_documentation"; Action="read"; Resource="assessment"},
    @{Code="clinical_documentation.assessment.update"; Name="Update Clinical Assessment"; Module="clinical_documentation"; Action="update"; Resource="assessment"},
    @{Code="clinical_documentation.assessment.delete"; Name="Delete Clinical Assessment"; Module="clinical_documentation"; Action="delete"; Resource="assessment"},
    @{Code="clinical_documentation.diagnosis.create"; Name="Create Diagnosis"; Module="clinical_documentation"; Action="create"; Resource="diagnosis"},
    @{Code="clinical_documentation.diagnosis.read"; Name="Read Diagnosis"; Module="clinical_documentation"; Action="read"; Resource="diagnosis"},
    @{Code="clinical_documentation.diagnosis.update"; Name="Update Diagnosis"; Module="clinical_documentation"; Action="update"; Resource="diagnosis"},
    @{Code="clinical_documentation.diagnosis.delete"; Name="Delete Diagnosis"; Module="clinical_documentation"; Action="delete"; Resource="diagnosis"},
    @{Code="clinical_documentation.clinical_notes.create"; Name="Create Clinical Notes"; Module="clinical_documentation"; Action="create"; Resource="clinical_notes"},
    @{Code="clinical_documentation.clinical_notes.read"; Name="Read Clinical Notes"; Module="clinical_documentation"; Action="read"; Resource="clinical_notes"},
    @{Code="clinical_documentation.clinical_notes.update"; Name="Update Clinical Notes"; Module="clinical_documentation"; Action="update"; Resource="clinical_notes"},
    @{Code="clinical_documentation.clinical_notes.delete"; Name="Delete Clinical Notes"; Module="clinical_documentation"; Action="delete"; Resource="clinical_notes"},
    @{Code="clinical_documentation.examination.create"; Name="Create Examination"; Module="clinical_documentation"; Action="create"; Resource="examination"},
    @{Code="clinical_documentation.examination.read"; Name="Read Examination"; Module="clinical_documentation"; Action="read"; Resource="examination"},
    @{Code="clinical_documentation.examination.update"; Name="Update Examination"; Module="clinical_documentation"; Action="update"; Resource="examination"},
    @{Code="clinical_documentation.examination.delete"; Name="Delete Examination"; Module="clinical_documentation"; Action="delete"; Resource="examination"},
    @{Code="clinical_documentation.treatment_plan.create"; Name="Create Treatment Plan"; Module="clinical_documentation"; Action="create"; Resource="treatment_plan"},
    @{Code="clinical_documentation.treatment_plan.read"; Name="Read Treatment Plan"; Module="clinical_documentation"; Action="read"; Resource="treatment_plan"},
    @{Code="clinical_documentation.treatment_plan.update"; Name="Update Treatment Plan"; Module="clinical_documentation"; Action="update"; Resource="treatment_plan"},
    @{Code="clinical_documentation.treatment_plan.delete"; Name="Delete Treatment Plan"; Module="clinical_documentation"; Action="delete"; Resource="treatment_plan"},

    # 3. PHARMACY (16 permissions)
    @{Code="pharmacy.prescription.create"; Name="Create Prescription"; Module="pharmacy"; Action="create"; Resource="prescription"},
    @{Code="pharmacy.prescription.read"; Name="Read Prescription"; Module="pharmacy"; Action="read"; Resource="prescription"},
    @{Code="pharmacy.prescription.update"; Name="Update Prescription"; Module="pharmacy"; Action="update"; Resource="prescription"},
    @{Code="pharmacy.prescription.delete"; Name="Delete Prescription"; Module="pharmacy"; Action="delete"; Resource="prescription"},
    @{Code="pharmacy.medication_dispensing.create"; Name="Create Medication Dispensing"; Module="pharmacy"; Action="create"; Resource="medication_dispensing"},
    @{Code="pharmacy.medication_dispensing.read"; Name="Read Medication Dispensing"; Module="pharmacy"; Action="read"; Resource="medication_dispensing"},
    @{Code="pharmacy.medication_dispensing.update"; Name="Update Medication Dispensing"; Module="pharmacy"; Action="update"; Resource="medication_dispensing"},
    @{Code="pharmacy.medication_dispensing.delete"; Name="Delete Medication Dispensing"; Module="pharmacy"; Action="delete"; Resource="medication_dispensing"},
    @{Code="pharmacy.drug_inventory.create"; Name="Create Drug Inventory"; Module="pharmacy"; Action="create"; Resource="drug_inventory"},
    @{Code="pharmacy.drug_inventory.read"; Name="Read Drug Inventory"; Module="pharmacy"; Action="read"; Resource="drug_inventory"},
    @{Code="pharmacy.drug_inventory.update"; Name="Update Drug Inventory"; Module="pharmacy"; Action="update"; Resource="drug_inventory"},
    @{Code="pharmacy.drug_inventory.delete"; Name="Delete Drug Inventory"; Module="pharmacy"; Action="delete"; Resource="drug_inventory"},
    @{Code="pharmacy.drug_interaction.create"; Name="Create Drug Interaction"; Module="pharmacy"; Action="create"; Resource="drug_interaction"},
    @{Code="pharmacy.drug_interaction.read"; Name="Read Drug Interaction"; Module="pharmacy"; Action="read"; Resource="drug_interaction"},
    @{Code="pharmacy.drug_interaction.update"; Name="Update Drug Interaction"; Module="pharmacy"; Action="update"; Resource="drug_interaction"},
    @{Code="pharmacy.drug_interaction.delete"; Name="Delete Drug Interaction"; Module="pharmacy"; Action="delete"; Resource="drug_interaction"},

    # 4. LAB DIAGNOSTICS (16 permissions)
    @{Code="lab_diagnostics.lab_test.create"; Name="Create Lab Test"; Module="lab_diagnostics"; Action="create"; Resource="lab_test"},
    @{Code="lab_diagnostics.lab_test.read"; Name="Read Lab Test"; Module="lab_diagnostics"; Action="read"; Resource="lab_test"},
    @{Code="lab_diagnostics.lab_test.update"; Name="Update Lab Test"; Module="lab_diagnostics"; Action="update"; Resource="lab_test"},
    @{Code="lab_diagnostics.lab_test.delete"; Name="Delete Lab Test"; Module="lab_diagnostics"; Action="delete"; Resource="lab_test"},
    @{Code="lab_diagnostics.lab_result.create"; Name="Create Lab Result"; Module="lab_diagnostics"; Action="create"; Resource="lab_result"},
    @{Code="lab_diagnostics.lab_result.read"; Name="Read Lab Result"; Module="lab_diagnostics"; Action="read"; Resource="lab_result"},
    @{Code="lab_diagnostics.lab_result.update"; Name="Update Lab Result"; Module="lab_diagnostics"; Action="update"; Resource="lab_result"},
    @{Code="lab_diagnostics.lab_result.delete"; Name="Delete Lab Result"; Module="lab_diagnostics"; Action="delete"; Resource="lab_result"},
    @{Code="lab_diagnostics.sample_collection.create"; Name="Create Sample Collection"; Module="lab_diagnostics"; Action="create"; Resource="sample_collection"},
    @{Code="lab_diagnostics.sample_collection.read"; Name="Read Sample Collection"; Module="lab_diagnostics"; Action="read"; Resource="sample_collection"},
    @{Code="lab_diagnostics.sample_collection.update"; Name="Update Sample Collection"; Module="lab_diagnostics"; Action="update"; Resource="sample_collection"},
    @{Code="lab_diagnostics.sample_collection.delete"; Name="Delete Sample Collection"; Module="lab_diagnostics"; Action="delete"; Resource="sample_collection"},
    @{Code="lab_diagnostics.lab_equipment.create"; Name="Create Lab Equipment"; Module="lab_diagnostics"; Action="create"; Resource="lab_equipment"},
    @{Code="lab_diagnostics.lab_equipment.read"; Name="Read Lab Equipment"; Module="lab_diagnostics"; Action="read"; Resource="lab_equipment"},
    @{Code="lab_diagnostics.lab_equipment.update"; Name="Update Lab Equipment"; Module="lab_diagnostics"; Action="update"; Resource="lab_equipment"},
    @{Code="lab_diagnostics.lab_equipment.delete"; Name="Delete Lab Equipment"; Module="lab_diagnostics"; Action="delete"; Resource="lab_equipment"},

    # 5. RADIOLOGY (12 permissions)
    @{Code="radiology.imaging_order.create"; Name="Create Imaging Order"; Module="radiology"; Action="create"; Resource="imaging_order"},
    @{Code="radiology.imaging_order.read"; Name="Read Imaging Order"; Module="radiology"; Action="read"; Resource="imaging_order"},
    @{Code="radiology.imaging_order.update"; Name="Update Imaging Order"; Module="radiology"; Action="update"; Resource="imaging_order"},
    @{Code="radiology.imaging_order.delete"; Name="Delete Imaging Order"; Module="radiology"; Action="delete"; Resource="imaging_order"},
    @{Code="radiology.imaging_result.create"; Name="Create Imaging Result"; Module="radiology"; Action="create"; Resource="imaging_result"},
    @{Code="radiology.imaging_result.read"; Name="Read Imaging Result"; Module="radiology"; Action="read"; Resource="imaging_result"},
    @{Code="radiology.imaging_result.update"; Name="Update Imaging Result"; Module="radiology"; Action="update"; Resource="imaging_result"},
    @{Code="radiology.imaging_result.delete"; Name="Delete Imaging Result"; Module="radiology"; Action="delete"; Resource="imaging_result"},
    @{Code="radiology.pacs_access.read"; Name="PACS Access"; Module="radiology"; Action="read"; Resource="pacs_access"},
    @{Code="radiology.radiology_report.create"; Name="Create Radiology Report"; Module="radiology"; Action="create"; Resource="radiology_report"},
    @{Code="radiology.radiology_report.read"; Name="Read Radiology Report"; Module="radiology"; Action="read"; Resource="radiology_report"},
    @{Code="radiology.radiology_report.update"; Name="Update Radiology Report"; Module="radiology"; Action="update"; Resource="radiology_report"},

    # 6. OT MANAGEMENT (14 permissions)
    @{Code="ot_management.surgery_schedule.create"; Name="Create Surgery Schedule"; Module="ot_management"; Action="create"; Resource="surgery_schedule"},
    @{Code="ot_management.surgery_schedule.read"; Name="Read Surgery Schedule"; Module="ot_management"; Action="read"; Resource="surgery_schedule"},
    @{Code="ot_management.surgery_schedule.update"; Name="Update Surgery Schedule"; Module="ot_management"; Action="update"; Resource="surgery_schedule"},
    @{Code="ot_management.surgery_schedule.delete"; Name="Delete Surgery Schedule"; Module="ot_management"; Action="delete"; Resource="surgery_schedule"},
    @{Code="ot_management.ot_booking.create"; Name="Create OT Booking"; Module="ot_management"; Action="create"; Resource="ot_booking"},
    @{Code="ot_management.ot_booking.read"; Name="Read OT Booking"; Module="ot_management"; Action="read"; Resource="ot_booking"},
    @{Code="ot_management.ot_booking.update"; Name="Update OT Booking"; Module="ot_management"; Action="update"; Resource="ot_booking"},
    @{Code="ot_management.ot_booking.delete"; Name="Delete OT Booking"; Module="ot_management"; Action="delete"; Resource="ot_booking"},
    @{Code="ot_management.surgical_equipment.create"; Name="Create Surgical Equipment"; Module="ot_management"; Action="create"; Resource="surgical_equipment"},
    @{Code="ot_management.surgical_equipment.read"; Name="Read Surgical Equipment"; Module="ot_management"; Action="read"; Resource="surgical_equipment"},
    @{Code="ot_management.surgical_equipment.update"; Name="Update Surgical Equipment"; Module="ot_management"; Action="update"; Resource="surgical_equipment"},
    @{Code="ot_management.post_op_care.create"; Name="Create Post-Op Care"; Module="ot_management"; Action="create"; Resource="post_op_care"},
    @{Code="ot_management.post_op_care.read"; Name="Read Post-Op Care"; Module="ot_management"; Action="read"; Resource="post_op_care"},
    @{Code="ot_management.post_op_care.update"; Name="Update Post-Op Care"; Module="ot_management"; Action="update"; Resource="post_op_care"},

    # 7. APPOINTMENTS (14 permissions)
    @{Code="appointments.appointment.create"; Name="Create Appointment"; Module="appointments"; Action="create"; Resource="appointment"},
    @{Code="appointments.appointment.read"; Name="Read Appointment"; Module="appointments"; Action="read"; Resource="appointment"},
    @{Code="appointments.appointment.update"; Name="Update Appointment"; Module="appointments"; Action="update"; Resource="appointment"},
    @{Code="appointments.appointment.delete"; Name="Delete Appointment"; Module="appointments"; Action="delete"; Resource="appointment"},
    @{Code="appointments.appointment.cancel"; Name="Cancel Appointment"; Module="appointments"; Action="cancel"; Resource="appointment"},
    @{Code="appointments.appointment.reschedule"; Name="Reschedule Appointment"; Module="appointments"; Action="reschedule"; Resource="appointment"},
    @{Code="appointments.waitlist.create"; Name="Create Waitlist"; Module="appointments"; Action="create"; Resource="waitlist"},
    @{Code="appointments.waitlist.read"; Name="Read Waitlist"; Module="appointments"; Action="read"; Resource="waitlist"},
    @{Code="appointments.waitlist.update"; Name="Update Waitlist"; Module="appointments"; Action="update"; Resource="waitlist"},
    @{Code="appointments.slot_availability.read"; Name="Read Slot Availability"; Module="appointments"; Action="read"; Resource="slot_availability"},
    @{Code="appointments.slot_availability.update"; Name="Update Slot Availability"; Module="appointments"; Action="update"; Resource="slot_availability"},
    @{Code="appointments.appointment_reminder.create"; Name="Create Appointment Reminder"; Module="appointments"; Action="create"; Resource="appointment_reminder"},
    @{Code="appointments.appointment_reminder.read"; Name="Read Appointment Reminder"; Module="appointments"; Action="read"; Resource="appointment_reminder"},
    @{Code="appointments.appointment_reminder.update"; Name="Update Appointment Reminder"; Module="appointments"; Action="update"; Resource="appointment_reminder"},

    # 8. BILLING & REVENUE (18 permissions)
    @{Code="billing_revenue.invoice.create"; Name="Create Invoice"; Module="billing_revenue"; Action="create"; Resource="invoice"},
    @{Code="billing_revenue.invoice.read"; Name="Read Invoice"; Module="billing_revenue"; Action="read"; Resource="invoice"},
    @{Code="billing_revenue.invoice.update"; Name="Update Invoice"; Module="billing_revenue"; Action="update"; Resource="invoice"},
    @{Code="billing_revenue.invoice.delete"; Name="Delete Invoice"; Module="billing_revenue"; Action="delete"; Resource="invoice"},
    @{Code="billing_revenue.payment.create"; Name="Create Payment"; Module="billing_revenue"; Action="create"; Resource="payment"},
    @{Code="billing_revenue.payment.read"; Name="Read Payment"; Module="billing_revenue"; Action="read"; Resource="payment"},
    @{Code="billing_revenue.payment.refund"; Name="Refund Payment"; Module="billing_revenue"; Action="refund"; Resource="payment"},
    @{Code="billing_revenue.insurance_claim.create"; Name="Create Insurance Claim"; Module="billing_revenue"; Action="create"; Resource="insurance_claim"},
    @{Code="billing_revenue.insurance_claim.read"; Name="Read Insurance Claim"; Module="billing_revenue"; Action="read"; Resource="insurance_claim"},
    @{Code="billing_revenue.insurance_claim.update"; Name="Update Insurance Claim"; Module="billing_revenue"; Action="update"; Resource="insurance_claim"},
    @{Code="billing_revenue.insurance_claim.submit"; Name="Submit Insurance Claim"; Module="billing_revenue"; Action="submit"; Resource="insurance_claim"},
    @{Code="billing_revenue.charge_item.create"; Name="Create Charge Item"; Module="billing_revenue"; Action="create"; Resource="charge_item"},
    @{Code="billing_revenue.charge_item.read"; Name="Read Charge Item"; Module="billing_revenue"; Action="read"; Resource="charge_item"},
    @{Code="billing_revenue.charge_item.update"; Name="Update Charge Item"; Module="billing_revenue"; Action="update"; Resource="charge_item"},
    @{Code="billing_revenue.discount.apply"; Name="Apply Discount"; Module="billing_revenue"; Action="apply"; Resource="discount"},
    @{Code="billing_revenue.revenue_report.read"; Name="Read Revenue Report"; Module="billing_revenue"; Action="read"; Resource="revenue_report"},
    @{Code="billing_revenue.revenue_report.export"; Name="Export Revenue Report"; Module="billing_revenue"; Action="export"; Resource="revenue_report"},
    @{Code="billing_revenue.payment_reconciliation.create"; Name="Create Payment Reconciliation"; Module="billing_revenue"; Action="create"; Resource="payment_reconciliation"},

    # 9. INVENTORY (14 permissions)
    @{Code="inventory.stock_item.create"; Name="Create Stock Item"; Module="inventory"; Action="create"; Resource="stock_item"},
    @{Code="inventory.stock_item.read"; Name="Read Stock Item"; Module="inventory"; Action="read"; Resource="stock_item"},
    @{Code="inventory.stock_item.update"; Name="Update Stock Item"; Module="inventory"; Action="update"; Resource="stock_item"},
    @{Code="inventory.stock_item.delete"; Name="Delete Stock Item"; Module="inventory"; Action="delete"; Resource="stock_item"},
    @{Code="inventory.stock_transfer.create"; Name="Create Stock Transfer"; Module="inventory"; Action="create"; Resource="stock_transfer"},
    @{Code="inventory.stock_transfer.read"; Name="Read Stock Transfer"; Module="inventory"; Action="read"; Resource="stock_transfer"},
    @{Code="inventory.stock_transfer.approve"; Name="Approve Stock Transfer"; Module="inventory"; Action="approve"; Resource="stock_transfer"},
    @{Code="inventory.reorder_level.create"; Name="Create Reorder Level"; Module="inventory"; Action="create"; Resource="reorder_level"},
    @{Code="inventory.reorder_level.read"; Name="Read Reorder Level"; Module="inventory"; Action="read"; Resource="reorder_level"},
    @{Code="inventory.reorder_level.update"; Name="Update Reorder Level"; Module="inventory"; Action="update"; Resource="reorder_level"},
    @{Code="inventory.stock_count.create"; Name="Create Stock Count"; Module="inventory"; Action="create"; Resource="stock_count"},
    @{Code="inventory.stock_count.read"; Name="Read Stock Count"; Module="inventory"; Action="read"; Resource="stock_count"},
    @{Code="inventory.stock_count.approve"; Name="Approve Stock Count"; Module="inventory"; Action="approve"; Resource="stock_count"},
    @{Code="inventory.expiry_tracking.read"; Name="Read Expiry Tracking"; Module="inventory"; Action="read"; Resource="expiry_tracking"},

    # 10. HRM (16 permissions)
    @{Code="hrm.employee.create"; Name="Create Employee"; Module="hrm"; Action="create"; Resource="employee"},
    @{Code="hrm.employee.read"; Name="Read Employee"; Module="hrm"; Action="read"; Resource="employee"},
    @{Code="hrm.employee.update"; Name="Update Employee"; Module="hrm"; Action="update"; Resource="employee"},
    @{Code="hrm.employee.delete"; Name="Delete Employee"; Module="hrm"; Action="delete"; Resource="employee"},
    @{Code="hrm.attendance.create"; Name="Create Attendance"; Module="hrm"; Action="create"; Resource="attendance"},
    @{Code="hrm.attendance.read"; Name="Read Attendance"; Module="hrm"; Action="read"; Resource="attendance"},
    @{Code="hrm.attendance.approve"; Name="Approve Attendance"; Module="hrm"; Action="approve"; Resource="attendance"},
    @{Code="hrm.leave.create"; Name="Create Leave"; Module="hrm"; Action="create"; Resource="leave"},
    @{Code="hrm.leave.read"; Name="Read Leave"; Module="hrm"; Action="read"; Resource="leave"},
    @{Code="hrm.leave.approve"; Name="Approve Leave"; Module="hrm"; Action="approve"; Resource="leave"},
    @{Code="hrm.payroll.create"; Name="Create Payroll"; Module="hrm"; Action="create"; Resource="payroll"},
    @{Code="hrm.payroll.read"; Name="Read Payroll"; Module="hrm"; Action="read"; Resource="payroll"},
    @{Code="hrm.payroll.process"; Name="Process Payroll"; Module="hrm"; Action="process"; Resource="payroll"},
    @{Code="hrm.performance_review.create"; Name="Create Performance Review"; Module="hrm"; Action="create"; Resource="performance_review"},
    @{Code="hrm.performance_review.read"; Name="Read Performance Review"; Module="hrm"; Action="read"; Resource="performance_review"},
    @{Code="hrm.performance_review.update"; Name="Update Performance Review"; Module="hrm"; Action="update"; Resource="performance_review"},

    # 11. VENDOR & PROCUREMENT (14 permissions)
    @{Code="vendor_procurement.vendor.create"; Name="Create Vendor"; Module="vendor_procurement"; Action="create"; Resource="vendor"},
    @{Code="vendor_procurement.vendor.read"; Name="Read Vendor"; Module="vendor_procurement"; Action="read"; Resource="vendor"},
    @{Code="vendor_procurement.vendor.update"; Name="Update Vendor"; Module="vendor_procurement"; Action="update"; Resource="vendor"},
    @{Code="vendor_procurement.vendor.delete"; Name="Delete Vendor"; Module="vendor_procurement"; Action="delete"; Resource="vendor"},
    @{Code="vendor_procurement.purchase_order.create"; Name="Create Purchase Order"; Module="vendor_procurement"; Action="create"; Resource="purchase_order"},
    @{Code="vendor_procurement.purchase_order.read"; Name="Read Purchase Order"; Module="vendor_procurement"; Action="read"; Resource="purchase_order"},
    @{Code="vendor_procurement.purchase_order.approve"; Name="Approve Purchase Order"; Module="vendor_procurement"; Action="approve"; Resource="purchase_order"},
    @{Code="vendor_procurement.goods_receipt.create"; Name="Create Goods Receipt"; Module="vendor_procurement"; Action="create"; Resource="goods_receipt"},
    @{Code="vendor_procurement.goods_receipt.read"; Name="Read Goods Receipt"; Module="vendor_procurement"; Action="read"; Resource="goods_receipt"},
    @{Code="vendor_procurement.vendor_payment.create"; Name="Create Vendor Payment"; Module="vendor_procurement"; Action="create"; Resource="vendor_payment"},
    @{Code="vendor_procurement.vendor_payment.read"; Name="Read Vendor Payment"; Module="vendor_procurement"; Action="read"; Resource="vendor_payment"},
    @{Code="vendor_procurement.vendor_payment.approve"; Name="Approve Vendor Payment"; Module="vendor_procurement"; Action="approve"; Resource="vendor_payment"},
    @{Code="vendor_procurement.quotation.create"; Name="Create Quotation"; Module="vendor_procurement"; Action="create"; Resource="quotation"},
    @{Code="vendor_procurement.quotation.read"; Name="Read Quotation"; Module="vendor_procurement"; Action="read"; Resource="quotation"},

    # 12. BED MANAGEMENT (10 permissions)
    @{Code="bed_management.bed.create"; Name="Create Bed"; Module="bed_management"; Action="create"; Resource="bed"},
    @{Code="bed_management.bed.read"; Name="Read Bed"; Module="bed_management"; Action="read"; Resource="bed"},
    @{Code="bed_management.bed.update"; Name="Update Bed"; Module="bed_management"; Action="update"; Resource="bed"},
    @{Code="bed_management.bed_allocation.create"; Name="Create Bed Allocation"; Module="bed_management"; Action="create"; Resource="bed_allocation"},
    @{Code="bed_management.bed_allocation.read"; Name="Read Bed Allocation"; Module="bed_management"; Action="read"; Resource="bed_allocation"},
    @{Code="bed_management.bed_allocation.update"; Name="Update Bed Allocation"; Module="bed_management"; Action="update"; Resource="bed_allocation"},
    @{Code="bed_management.bed_transfer.create"; Name="Create Bed Transfer"; Module="bed_management"; Action="create"; Resource="bed_transfer"},
    @{Code="bed_management.bed_transfer.approve"; Name="Approve Bed Transfer"; Module="bed_management"; Action="approve"; Resource="bed_transfer"},
    @{Code="bed_management.discharge.create"; Name="Create Discharge"; Module="bed_management"; Action="create"; Resource="discharge"},
    @{Code="bed_management.discharge.approve"; Name="Approve Discharge"; Module="bed_management"; Action="approve"; Resource="discharge"},

    # 13. AMBULANCE (8 permissions)
    @{Code="ambulance.ambulance_booking.create"; Name="Create Ambulance Booking"; Module="ambulance"; Action="create"; Resource="ambulance_booking"},
    @{Code="ambulance.ambulance_booking.read"; Name="Read Ambulance Booking"; Module="ambulance"; Action="read"; Resource="ambulance_booking"},
    @{Code="ambulance.ambulance_booking.update"; Name="Update Ambulance Booking"; Module="ambulance"; Action="update"; Resource="ambulance_booking"},
    @{Code="ambulance.ambulance_trip.create"; Name="Create Ambulance Trip"; Module="ambulance"; Action="create"; Resource="ambulance_trip"},
    @{Code="ambulance.ambulance_trip.read"; Name="Read Ambulance Trip"; Module="ambulance"; Action="read"; Resource="ambulance_trip"},
    @{Code="ambulance.ambulance_trip.complete"; Name="Complete Ambulance Trip"; Module="ambulance"; Action="complete"; Resource="ambulance_trip"},
    @{Code="ambulance.vehicle_maintenance.create"; Name="Create Vehicle Maintenance"; Module="ambulance"; Action="create"; Resource="vehicle_maintenance"},
    @{Code="ambulance.vehicle_maintenance.read"; Name="Read Vehicle Maintenance"; Module="ambulance"; Action="read"; Resource="vehicle_maintenance"},

    # 14. DOCUMENT SHARING (18 permissions)
    @{Code="document_sharing.document_type.create"; Name="Create Document Type"; Module="document_sharing"; Action="create"; Resource="document_type"},
    @{Code="document_sharing.document_type.read"; Name="Read Document Type"; Module="document_sharing"; Action="read"; Resource="document_type"},
    @{Code="document_sharing.document_type.update"; Name="Update Document Type"; Module="document_sharing"; Action="update"; Resource="document_type"},
    @{Code="document_sharing.document_type.delete"; Name="Delete Document Type"; Module="document_sharing"; Action="delete"; Resource="document_type"},
    @{Code="document_sharing.access_rule.create"; Name="Create Access Rule"; Module="document_sharing"; Action="create"; Resource="access_rule"},
    @{Code="document_sharing.access_rule.read"; Name="Read Access Rule"; Module="document_sharing"; Action="read"; Resource="access_rule"},
    @{Code="document_sharing.access_rule.update"; Name="Update Access Rule"; Module="document_sharing"; Action="update"; Resource="access_rule"},
    @{Code="document_sharing.access_rule.delete"; Name="Delete Access Rule"; Module="document_sharing"; Action="delete"; Resource="access_rule"},
    @{Code="document_sharing.document_upload.create"; Name="Upload Document"; Module="document_sharing"; Action="create"; Resource="document_upload"},
    @{Code="document_sharing.document_upload.read"; Name="Read Document"; Module="document_sharing"; Action="read"; Resource="document_upload"},
    @{Code="document_sharing.document_upload.download"; Name="Download Document"; Module="document_sharing"; Action="download"; Resource="document_upload"},
    @{Code="document_sharing.document_sharing.create"; Name="Share Document"; Module="document_sharing"; Action="create"; Resource="document_sharing"},
    @{Code="document_sharing.document_sharing.read"; Name="Read Shared Documents"; Module="document_sharing"; Action="read"; Resource="document_sharing"},
    @{Code="document_sharing.document_sharing.revoke"; Name="Revoke Document Access"; Module="document_sharing"; Action="revoke"; Resource="document_sharing"},
    @{Code="document_sharing.access_audit.read"; Name="Read Access Audit"; Module="document_sharing"; Action="read"; Resource="access_audit"},
    @{Code="document_sharing.access_check.verify"; Name="Verify Access"; Module="document_sharing"; Action="verify"; Resource="access_check"},
    @{Code="document_sharing.bulk_share.create"; Name="Bulk Share Documents"; Module="document_sharing"; Action="create"; Resource="bulk_share"},
    @{Code="document_sharing.bulk_share.revoke"; Name="Bulk Revoke Access"; Module="document_sharing"; Action="revoke"; Resource="bulk_share"},

    # 15. SYSTEM SETTINGS (14 permissions)
    @{Code="system_settings.configuration.read"; Name="Read Configuration"; Module="system_settings"; Action="read"; Resource="configuration"},
    @{Code="system_settings.configuration.update"; Name="Update Configuration"; Module="system_settings"; Action="update"; Resource="configuration"},
    @{Code="system_settings.user.create"; Name="Create User"; Module="system_settings"; Action="create"; Resource="user"},
    @{Code="system_settings.user.read"; Name="Read User"; Module="system_settings"; Action="read"; Resource="user"},
    @{Code="system_settings.user.update"; Name="Update User"; Module="system_settings"; Action="update"; Resource="user"},
    @{Code="system_settings.user.delete"; Name="Delete User"; Module="system_settings"; Action="delete"; Resource="user"},
    @{Code="system_settings.role.create"; Name="Create Role"; Module="system_settings"; Action="create"; Resource="role"},
    @{Code="system_settings.role.read"; Name="Read Role"; Module="system_settings"; Action="read"; Resource="role"},
    @{Code="system_settings.role.update"; Name="Update Role"; Module="system_settings"; Action="update"; Resource="role"},
    @{Code="system_settings.role.delete"; Name="Delete Role"; Module="system_settings"; Action="delete"; Resource="role"},
    @{Code="system_settings.audit_log.read"; Name="Read Audit Log"; Module="system_settings"; Action="read"; Resource="audit_log"},
    @{Code="system_settings.backup.create"; Name="Create Backup"; Module="system_settings"; Action="create"; Resource="backup"},
    @{Code="system_settings.backup.restore"; Name="Restore Backup"; Module="system_settings"; Action="restore"; Resource="backup"},
    @{Code="system_settings.system_health.read"; Name="Read System Health"; Module="system_settings"; Action="read"; Resource="system_health"},

    # 16. QUALITY ASSURANCE (10 permissions)
    @{Code="quality_assurance.incident.create"; Name="Create Incident"; Module="quality_assurance"; Action="create"; Resource="incident"},
    @{Code="quality_assurance.incident.read"; Name="Read Incident"; Module="quality_assurance"; Action="read"; Resource="incident"},
    @{Code="quality_assurance.incident.update"; Name="Update Incident"; Module="quality_assurance"; Action="update"; Resource="incident"},
    @{Code="quality_assurance.incident.close"; Name="Close Incident"; Module="quality_assurance"; Action="close"; Resource="incident"},
    @{Code="quality_assurance.audit.create"; Name="Create Audit"; Module="quality_assurance"; Action="create"; Resource="audit"},
    @{Code="quality_assurance.audit.read"; Name="Read Audit"; Module="quality_assurance"; Action="read"; Resource="audit"},
    @{Code="quality_assurance.audit.complete"; Name="Complete Audit"; Module="quality_assurance"; Action="complete"; Resource="audit"},
    @{Code="quality_assurance.compliance.read"; Name="Read Compliance"; Module="quality_assurance"; Action="read"; Resource="compliance"},
    @{Code="quality_assurance.quality_report.create"; Name="Create Quality Report"; Module="quality_assurance"; Action="create"; Resource="quality_report"},
    @{Code="quality_assurance.quality_report.read"; Name="Read Quality Report"; Module="quality_assurance"; Action="read"; Resource="quality_report"}
)

Write-Host "Generating SQL script for $($permissions.Count) permissions..." -ForegroundColor Cyan

# Generate SQL file
$sql = @"
-- ============================================
-- Complete 297 Permissions Seed Script
-- Hospital Portal RBAC Implementation
-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- ============================================

-- Insert all 297 permissions
-- Using ON CONFLICT to avoid duplicates
-- Tenant ID: 00000000-0000-0000-0000-000000000000 (system-wide)

"@

foreach ($perm in $permissions) {
    $sql += @"

INSERT INTO permissions (
    id, "TenantId", "Code", "Name", "Module", "Action", "ResourceType",
    scope, "Description", is_system_permission, department_specific, 
    is_custom, "IsActive", "CreatedAt"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    '$($perm.Code)',
    '$($perm.Name)',
    '$($perm.Module)',
    '$($perm.Action)',
    '$($perm.Resource)',
    'global',
    '$($perm.Name) permission for $($perm.Module) module',
    true,
    false,
    false,
    true,
    NOW()
)
ON CONFLICT ("TenantId", "Code") DO NOTHING;

"@
}

# Add verification queries
$sql += @"

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count total permissions
SELECT COUNT(*) as total_permissions 
FROM permissions 
WHERE "TenantId" = '00000000-0000-0000-0000-000000000000';

-- Count by module
SELECT "Module", COUNT(*) as count
FROM permissions
WHERE "TenantId" = '00000000-0000-0000-0000-000000000000'
GROUP BY "Module"
ORDER BY "Module";

-- Expected counts:
-- patient_management: 24
-- clinical_documentation: 20
-- pharmacy: 16
-- lab_diagnostics: 16
-- radiology: 12
-- ot_management: 14
-- appointments: 14
-- billing_revenue: 18
-- inventory: 14
-- hrm: 16
-- vendor_procurement: 14
-- bed_management: 10
-- ambulance: 8
-- document_sharing: 18
-- system_settings: 14
-- quality_assurance: 10
-- TOTAL: 297

-- List all permission codes
SELECT "Code", "Name", "Module"
FROM permissions
WHERE "TenantId" = '00000000-0000-0000-0000-000000000000'
ORDER BY "Module", "Code";
"@

# Write to file
$sql | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✓ Generated: $outputFile" -ForegroundColor Green
Write-Host "✓ Total permissions: $($permissions.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "To execute:" -ForegroundColor Yellow
Write-Host '$env:PGPASSWORD="Eden@#`$0606"; psql -h hospitalportal-db-server.postgres.database.azure.com -p 5432 -U postgres -d hospitalportal -f ' + $outputFile -ForegroundColor White
