-- =====================================================================
-- Consent Form Templates Seed Data
-- Version: 55
-- Purpose: Populate consent form templates with HTML and placeholders
-- Tables: consent_form_templates
-- =====================================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
BEGIN
    -- Get first available tenant
    SELECT id INTO v_tenant_id FROM tenant LIMIT 1;
    
    -- Get first available user
    SELECT id INTO v_user_id FROM users LIMIT 1;
    
    -- Fallback if no tenant/user found
    IF v_tenant_id IS NULL THEN
        v_tenant_id := '11b26293-9d9c-4633-927e-3294bff2a8d7'::UUID;
    END IF;
    
    IF v_user_id IS NULL THEN
        v_user_id := 'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID;
    END IF;
    
    RAISE NOTICE 'Using Tenant ID: %, User ID: %', v_tenant_id, v_user_id;
    
    -- =====================================================================
    -- PART 1: Surgery Consent Templates
    -- =====================================================================
    
    -- 1. Cataract Surgery Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        applicable_surgery_types, template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Cataract Surgery Informed Consent',
        'CONSENT-CATARACT-V1',
        'SurgeryConsent',
        ARRAY['PHACO', 'ECCE'],
        '<div class="consent-document"><h2>INFORMED CONSENT FOR CATARACT SURGERY</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>MR Number:</strong> {{MR_NUMBER}}</p><p><strong>Date:</strong> {{CONSENT_DATE}}</p><p><strong>Surgeon:</strong> Dr. {{SURGEON_NAME}}</p><p><strong>Eye:</strong> {{EYE_OPERATED}}</p><h3>Nature of Surgery</h3><p>I understand that I will undergo {{SURGERY_TYPE}} surgery with intraocular lens (IOL) implantation.</p><h3>Risks and Complications</h3><ul><li>Posterior capsule rupture, temporary eye pressure elevation</li><li>Infection (endophthalmitis), retinal detachment, IOL dislocation</li><li>Refractive surprise requiring glasses</li><li>Secondary procedures may be needed</li></ul><h3>IOL Details</h3><p><strong>IOL Type:</strong> {{IOL_TYPE}}</p><p><strong>IOL Power:</strong> {{IOL_POWER}} Diopters</p><h3>Consent Statement</h3><p>I certify that Dr. {{SURGEON_NAME}} has explained the nature, purpose, risks, benefits, and alternatives of the surgery. I have had the opportunity to ask questions and consent to proceed.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div><div class="witness-block"><p>______________________________</p><p>Witness Signature / Date</p></div><div class="surgeon-block"><p>______________________________</p><p>Surgeon Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, true, true,
        true, v_user_id, v_user_id
    );
    
    -- 2. Glaucoma Surgery Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        applicable_surgery_types, template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Glaucoma Surgery Informed Consent',
        'CONSENT-GLAUCOMA-V1',
        'SurgeryConsent',
        ARRAY['TRAB', 'AHMED'],
        '<div class="consent-document"><h2>INFORMED CONSENT FOR GLAUCOMA SURGERY</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Surgery Type:</strong> {{SURGERY_TYPE}}</p><p><strong>Eye:</strong> {{EYE_OPERATED}}</p><h3>Purpose of Surgery</h3><p>Glaucoma surgery aims to lower intraocular pressure (IOP) by creating a new drainage pathway for fluid to exit the eye.</p><h3>Important Understanding</h3><p><strong>Warning:</strong> Glaucoma surgery prevents further vision loss but does NOT restore vision already lost.</p><h3>Risks and Complications</h3><ul><li>Hypotony (low pressure), bleb leak, shallow anterior chamber</li><li>Infection (blebitis/endophthalmitis), cataract formation</li><li>Failure to control pressure - may need additional medications or repeat surgery (10-30% at 5 years)</li><li>Scarring requiring bleb revision or needling</li></ul><h3>Post-operative Requirements</h3><ul><li>Frequent eye drops (steroids, antibiotics)</li><li>Multiple follow-up visits (sometimes weekly initially)</li><li>Possible bleb massage</li><li>Lifelong monitoring of bleb and IOP</li></ul><h3>Consent Statement</h3><p>I understand that glaucoma surgery has variable success rate and may require additional procedures. I consent to Dr. {{SURGEON_NAME}} performing {{SURGERY_TYPE}} on my {{EYE_OPERATED}} eye.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div><div class="witness-block"><p>______________________________</p><p>Witness Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, true, true,
        true, v_user_id, v_user_id
    );
    
    -- 3. Retinal Surgery Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        applicable_surgery_types, template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Retinal Surgery Informed Consent',
        'CONSENT-RETINA-V1',
        'SurgeryConsent',
        ARRAY['VIT', 'BUCKLE'],
        '<div class="consent-document"><h2>INFORMED CONSENT FOR RETINAL SURGERY</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Diagnosis:</strong> {{DIAGNOSIS}}</p><p><strong>Surgery:</strong> {{SURGERY_TYPE}}</p><p><strong>Surgeon:</strong> Dr. {{SURGEON_NAME}}</p><h3>Purpose</h3><p>To repair retinal detachment, remove vitreous hemorrhage, treat diabetic retinopathy complications, or address other retinal pathology.</p><h3>Procedure Details</h3><p>May include: vitrectomy (removal of vitreous gel), membrane peeling, laser photocoagulation, gas/silicone oil tamponade, scleral buckle placement.</p><h3>Major Risks</h3><ul><li>Cataract formation (50-80% in phakic eyes)</li><li>Increased intraocular pressure (10-20%)</li><li>Recurrent retinal detachment (5-10%)</li><li>Infection (endophthalmitis less than 0.1%)</li><li>Hemorrhage, vision loss despite surgery</li></ul><h3>Gas/Oil Tamponade Positioning</h3><p>If gas or oil is used, I understand I must maintain strict head positioning (typically face-down or side-lying) for {{POSITIONING_DURATION}} days/weeks. Failure to comply may result in surgical failure.</p><p><strong>Air Travel Restriction:</strong> If gas is used, I CANNOT fly in airplanes until gas is completely absorbed ({{GAS_ABSORPTION_TIME}} weeks), as expansion at altitude can cause blindness.</p><h3>Consent</h3><p>I authorize Dr. {{SURGEON_NAME}} to perform {{SURGERY_TYPE}} and understand the risks, benefits, and alternatives.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div><div class="witness-block"><p>______________________________</p><p>Witness Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, true, true,
        true, v_user_id, v_user_id
    );
    
    -- 4. Refractive Surgery Consent (LASIK/PRK)
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        applicable_surgery_types, template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Refractive Surgery Informed Consent',
        'CONSENT-LASIK-V1',
        'SurgeryConsent',
        ARRAY['LASIK', 'PRK'],
        '<div class="consent-document"><h2>INFORMED CONSENT FOR REFRACTIVE SURGERY</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Age:</strong> {{PATIENT_AGE}}</p><p><strong>Surgery:</strong> {{SURGERY_TYPE}}</p><p><strong>Current Refraction:</strong> Right: {{RIGHT_EYE_REFRACTION}} / Left: {{LEFT_EYE_REFRACTION}}</p><h3>Understanding of Elective Nature</h3><p>I understand that refractive surgery is <strong>ELECTIVE</strong>. I have glasses/contact lenses as safe alternatives. This surgery is performed to reduce my dependence on corrective lenses, not for medical necessity.</p><h3>No Guarantee of Perfect Vision</h3><ul><li>20/20 vision is NOT guaranteed</li><li>May still need glasses for certain activities (driving at night, reading)</li><li>Results cannot be perfectly predicted</li><li>Enhancement surgery may be needed (5-15% of cases)</li></ul><h3>Risks and Complications</h3><ul><li>Undercorrection or overcorrection requiring glasses</li><li>Dry eyes (very common, may be permanent)</li><li>Glare, halos, starbursts at night</li><li>Reduced contrast sensitivity</li><li>Corneal ectasia (rare but serious, may require corneal transplant)</li><li>Flap complications (LASIK specific)</li><li>Infection, vision loss (rare)</li></ul><h3>Presbyopia Consideration</h3><p>If I am over age 40, I understand that I will eventually need reading glasses due to presbyopia, even with perfect distance vision after surgery.</p><h3>Consent</h3><p>I voluntarily choose to undergo {{SURGERY_TYPE}} performed by Dr. {{SURGEON_NAME}} understanding the risks and alternatives.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div><div class="witness-block"><p>______________________________</p><p>Witness Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, true, false,
        true, v_user_id, v_user_id
    );
    
    -- 5. Corneal Transplant Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        applicable_surgery_types, template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Corneal Transplant Informed Consent',
        'CONSENT-CORNEA-V1',
        'SurgeryConsent',
        ARRAY['PKP', 'DSEK', 'DMEK'],
        '<div class="consent-document"><h2>INFORMED CONSENT FOR CORNEAL TRANSPLANTATION</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Surgery Type:</strong> {{SURGERY_TYPE}}</p><p><strong>Eye:</strong> {{EYE_OPERATED}}</p><p><strong>Diagnosis:</strong> {{DIAGNOSIS}}</p><h3>Donor Tissue</h3><p>I understand that donor corneal tissue will be used. The tissue has been screened for infectious diseases (HIV, Hepatitis, Syphilis) but a small residual risk remains. The tissue is procured from certified eye banks following strict safety protocols.</p><h3>Graft Rejection Risk</h3><p><strong>Important:</strong> There is a lifelong risk of graft rejection (10-30% depending on type). Signs include redness, pain, light sensitivity, and blurred vision. <strong>Immediate medical attention is required if rejection is suspected.</strong></p><h3>Long-term Immunosuppression</h3><p>I may need steroid eye drops for months to years (sometimes lifelong) to prevent rejection. Long-term steroid use carries risks of cataract and glaucoma.</p><h3>Risks and Complications</h3><ul><li>Graft rejection (acute or chronic)</li><li>Graft failure requiring repeat transplant</li><li>High astigmatism (common, may need glasses/contacts/surgery)</li><li>Suture-related problems (irritation, infection, breakage)</li><li>Infection (very rare but serious)</li><li>Glaucoma, cataract, vision loss</li></ul><h3>Recovery Timeline</h3><p>Visual recovery is gradual (months to a year). Sutures may remain in place for 12-24 months (PKP). Frequent follow-up visits are required.</p><h3>Consent</h3><p>I consent to corneal transplantation and understand the need for long-term monitoring and medication compliance.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div><div class="witness-block"><p>______________________________</p><p>Witness Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, true, true,
        true, v_user_id, v_user_id
    );
    
    -- =====================================================================
    -- PART 2: Anesthesia Consent Templates
    -- =====================================================================
    
    -- 6. General Anesthesia Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'General Anesthesia Consent',
        'CONSENT-ANESTHESIA-GA-V1',
        'AnesthesiaConsent',
        '<div class="consent-document"><h2>CONSENT FOR GENERAL ANESTHESIA</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Procedure:</strong> {{PROCEDURE_NAME}}</p><p><strong>Anesthesiologist:</strong> Dr. {{ANESTHESIOLOGIST_NAME}}</p><h3>Risks of General Anesthesia</h3><ul><li>Nausea, vomiting, sore throat</li><li>Dental damage, lip/tongue injury</li><li>Allergic reactions</li><li>Aspiration pneumonia</li><li>Heart attack, stroke (rare)</li><li>Malignant hyperthermia (very rare)</li><li>Death (extremely rare, approximately 1 in 200,000)</li></ul><h3>NPO Instructions</h3><p>I have been instructed to fast (nothing to eat or drink) for at least {{NPO_HOURS}} hours before surgery. I confirm I have followed these instructions.</p><h3>Airway Management</h3><p>I understand that airway management (endotracheal intubation or laryngeal mask) may be required and carries risks of sore throat, hoarseness, and rarely, dental damage.</p><h3>Consent</h3><p>I consent to general anesthesia and authorize the anesthesia team to make decisions during the procedure.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, true, true,
        true, v_user_id, v_user_id
    );
    
    -- 7. Local/Regional Anesthesia Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Local/Regional Anesthesia Consent',
        'CONSENT-ANESTHESIA-LOCAL-V1',
        'AnesthesiaConsent',
        '<div class="consent-document"><h2>CONSENT FOR LOCAL/REGIONAL ANESTHESIA</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Anesthesia Type:</strong> {{ANESTHESIA_TYPE}}</p><h3>Risks</h3><ul><li>Allergic reaction to local anesthetic</li><li>Bleeding, bruising</li><li>Nerve damage (rare)</li><li>Retrobulbar hemorrhage (rare for retrobulbar block)</li><li>Globe perforation (very rare)</li><li>Systemic toxicity if excessive absorption</li></ul><h3>Awareness</h3><p>I understand I will be awake during the procedure and may feel pressure or movement, but should not feel pain. I agree to notify the surgical team if I experience discomfort.</p><h3>Consent</h3><p>I consent to {{ANESTHESIA_TYPE}} anesthesia.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, false, true,
        true, v_user_id, v_user_id
    );
    
    -- =====================================================================
    -- PART 3: General Treatment & Data/Privacy Consents
    -- =====================================================================
    
    -- 8. General Treatment Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'General Treatment and Hospitalization Consent',
        'CONSENT-TREATMENT-GENERAL-V1',
        'GeneralTreatmentConsent',
        '<div class="consent-document"><h2>GENERAL CONSENT FOR TREATMENT</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>MR Number:</strong> {{MR_NUMBER}}</p><h3>Consent to Treat</h3><p>I voluntarily consent to medical, surgical, and diagnostic procedures and treatments deemed necessary by the physicians and staff of {{HOSPITAL_NAME}}.</p><h3>Student/Trainee Involvement</h3><p>I understand that this is a teaching hospital and residents, fellows, medical students, and nursing students may participate in my care under supervision.</p><h3>Blood Transfusion</h3><p>In case of emergency, I authorize blood transfusion if deemed necessary by the treating physician.</p><h3>Personal Belongings</h3><p>I understand the hospital is not responsible for loss of personal items (jewelry, money, electronics). I have been advised to send valuables home.</p><h3>Hospital Policies</h3><p>I agree to comply with hospital rules and regulations during my stay.</p><div class="signature-block"><p>______________________________</p><p>Patient/Guardian Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, false, true,
        true, v_user_id, v_user_id
    );
    
    -- 9. Privacy and Data Sharing Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Privacy and Information Sharing Consent',
        'CONSENT-PRIVACY-V1',
        'DataSharingConsent',
        '<div class="consent-document"><h2>PRIVACY AND INFORMATION SHARING CONSENT</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><h3>Acknowledgment of Privacy Notice</h3><p>I acknowledge that I have received and reviewed the Notice of Privacy Practices of {{HOSPITAL_NAME}}. This notice explains how my health information may be used and disclosed and how I can access my information.</p><h3>Authorization to Release Information</h3><p>I authorize {{HOSPITAL_NAME}} to release my medical information to:</p><ul><li>My insurance company for billing and authorization purposes</li><li>Referring physicians and consulting specialists involved in my care</li><li>Family members designated by me: {{AUTHORIZED_FAMILY_MEMBERS}}</li></ul><h3>Telemedicine Consent</h3><p>I consent to telemedicine consultations where applicable, understanding that some information may be transmitted electronically.</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, false, false,
        true, v_user_id, v_user_id
    );
    
    -- 10. Photography Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Photography and Videography Consent',
        'CONSENT-PHOTOGRAPHY-V1',
        'PhotographyConsent',
        '<div class="consent-document"><h2>PHOTOGRAPHY AND VIDEOGRAPHY CONSENT</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><h3>Purpose</h3><p>I consent to photography and/or videography of my eye condition and treatment for the following purposes:</p><h3>Consent Options</h3><p><strong>Medical Records:</strong> I consent to photographs/videos for my medical record. [ ] Yes [ ] No</p><p><strong>Teaching:</strong> I consent to use of de-identified images for teaching. [ ] Yes [ ] No</p><p><strong>Research:</strong> I consent to use of de-identified images for research. [ ] Yes [ ] No</p><p><strong>Publication:</strong> I consent to use of de-identified images for journal publication. [ ] Yes [ ] No</p><h3>Understanding</h3><p>I understand that:</p><ul><li>Images will be de-identified</li><li>I can withdraw consent at any time</li><li>Withdrawal will not affect my medical care</li><li>Medical record images are permanent</li></ul><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, false, false,
        true, v_user_id, v_user_id
    );
    
    -- 11. Financial Responsibility Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Financial Responsibility and Payment Consent',
        'CONSENT-FINANCIAL-V1',
        'GeneralTreatmentConsent',
        '<div class="consent-document"><h2>FINANCIAL RESPONSIBILITY CONSENT</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Estimated Charges:</strong> Rs {{ESTIMATED_AMOUNT}}</p><p><strong>Payment Method:</strong> {{PAYMENT_METHOD}}</p><h3>Understanding of Charges</h3><p>I understand that the estimate provided is approximate and actual charges may vary based on the complexity of treatment, complications, or additional procedures required.</p><h3>Payment Responsibility</h3><p>I acknowledge that I am financially responsible for all charges incurred. If I have insurance, I understand that:</p><ul><li>I am responsible for deductibles, co-payments, and non-covered services</li><li>The hospital will bill my insurance, but I am ultimately responsible for payment</li><li>Pre-authorization does not guarantee payment</li></ul><h3>Billing and Collections</h3><p>I agree to pay all bills within {{PAYMENT_DUE_DAYS}} days. Overdue accounts may be sent to collections and I will be responsible for collection costs and legal fees.</p><h3>Refund Policy</h3><p>I understand the refund policy as explained, particularly regarding cancellations and package prepayments.</p><div class="signature-block"><p>______________________________</p><p>Patient/Responsible Party Signature / Date</p></div></div>',
        '2026-01-01'::date,
        true, false, false,
        true, v_user_id, v_user_id
    );
    
    -- 12. Research Participation Consent
    INSERT INTO consent_form_templates (
        id, tenant_id, template_name, template_code, consent_category,
        template_html, effective_from_date,
        requires_patient_signature, requires_witness_signature, requires_guardian_signature,
        is_active, created_by_user_id, updated_by_user_id
    ) VALUES (
        gen_random_uuid(), v_tenant_id,
        'Research Participation Consent',
        'CONSENT-RESEARCH-V1',
        'ResearchConsent',
        '<div class="consent-document"><h2>CONSENT FOR RESEARCH PARTICIPATION</h2><p><strong>Patient Name:</strong> {{PATIENT_NAME}}</p><p><strong>Study Title:</strong> {{STUDY_TITLE}}</p><p><strong>Principal Investigator:</strong> Dr. {{INVESTIGATOR_NAME}}</p><h3>Voluntary Participation</h3><p>I understand that participation in research is completely voluntary and will not affect my medical care if I decline.</p><h3>Purpose of Research</h3><p>{{RESEARCH_PURPOSE_DESCRIPTION}}</p><h3>What is Involved</h3><p>{{RESEARCH_PROCEDURES_DESCRIPTION}}</p><h3>Risks and Benefits</h3><p><strong>Risks:</strong> {{RESEARCH_RISKS}}</p><p><strong>Benefits:</strong> {{RESEARCH_BENEFITS}} (May include no direct benefit to me)</p><h3>Confidentiality</h3><p>My data will be de-identified and kept confidential. Results may be published but I will not be personally identifiable.</p><h3>Right to Withdraw</h3><p>I may withdraw from the study at any time without penalty or effect on my medical care.</p><h3>Contact Information</h3><p>Questions about the research: Dr. {{INVESTIGATOR_NAME}}, {{INVESTIGATOR_CONTACT}}</p><p>Questions about research rights: {{IRB_CONTACT}}</p><div class="signature-block"><p>______________________________</p><p>Patient Signature / Date</p></div><div class="witness-block"><p>______________________________</p><p>Witness/Research Coordinator / Date</p></div></div>',
        '2026-01-01'::date,
        false, true, true,
        true, v_user_id, v_user_id
    );
    
    RAISE NOTICE 'Consent form templates seeded successfully!';

END $$;

-- Verification Query
SELECT 'Consent Form Templates' as table_name, COUNT(*) as row_count FROM consent_form_templates;
SELECT consent_category, COUNT(*) as count FROM consent_form_templates GROUP BY consent_category ORDER BY count DESC;
