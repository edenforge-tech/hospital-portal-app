-- Update all organizations with comprehensive real data
-- India Eye Hospital Network organizations

-- Update Main Network organization
UPDATE organization
SET 
    organization_name = 'Hospital Network',
    address = 'Corporate Office, Tower A, Cyber City',
    city = 'New Delhi',
    state_province = 'Delhi',
    postal_code = '110001',
    country_code = 'IN',
    phone = '+91-11-4567-8900',
    email = 'main@indiaeye.com',
    primary_color = '#4F46E5',
    secondary_color = '#818CF8',
    timezone = 'Asia/Kolkata',
    language_code = 'en',
    currency_code = 'INR',
    logo_url = 'https://placehold.co/200x80/4F46E5/white?text=India+Eye+Main',
    license_number = 'IEH-MN-2020-001',
    accreditation_status = 'NABH Accredited',
    regulatory_body = 'Medical Council of India'
WHERE organization_code = 'IEHN_MAIN';

-- Update Regional Centers organization
UPDATE organization
SET 
    organization_name = 'Regional Hospital Network',
    address = 'Regional Head Office, Business Park',
    city = 'Mumbai',
    state_province = 'Maharashtra',
    postal_code = '400001',
    country_code = 'IN',
    phone = '+91-22-4567-8900',
    email = 'regional@indiaeye.com',
    primary_color = '#059669',
    secondary_color = '#34D399',
    timezone = 'Asia/Kolkata',
    language_code = 'en',
    currency_code = 'INR',
    logo_url = 'https://placehold.co/200x80/059669/white?text=India+Eye+Regional',
    license_number = 'IEH-RC-2021-001',
    accreditation_status = 'ISO 9001:2015',
    regulatory_body = 'Medical Council of India'
WHERE organization_code = 'IEHN_REGIONAL';

-- Update Main Hospital organization
UPDATE organization
SET 
    organization_name = 'Multi-Specialty Hospital',
    address = '123 Healthcare Avenue, Medical District',
    city = 'Bangalore',
    state_province = 'Karnataka',
    postal_code = '560001',
    country_code = 'IN',
    phone = '+91-80-4567-8900',
    email = 'info@mainhospital.com',
    primary_color = '#DC2626',
    secondary_color = '#F87171',
    timezone = 'Asia/Kolkata',
    language_code = 'en',
    currency_code = 'INR',
    logo_url = 'https://placehold.co/200x80/DC2626/white?text=Main+Hospital',
    license_number = 'MH-BLR-2019-001',
    accreditation_status = 'JCI Accredited',
    regulatory_body = 'Karnataka Medical Council'
WHERE organization_code = 'MAIN_HOSP';

-- Update Medical Center UAE organization
UPDATE organization
SET 
    organization_name = 'Medical Center',
    address = 'Dubai Healthcare City, Building 27',
    city = 'Dubai',
    state_province = 'Dubai',
    postal_code = '505004',
    country_code = 'AE',
    phone = '+971-4-567-8900',
    email = 'info@medcenteruae.com',
    primary_color = '#7C3AED',
    secondary_color = '#A78BFA',
    timezone = 'Asia/Dubai',
    language_code = 'en',
    currency_code = 'AED',
    logo_url = 'https://placehold.co/200x80/7C3AED/white?text=Med+Center+UAE',
    license_number = 'DHA-2022-MC-001',
    accreditation_status = 'DHA Accredited',
    regulatory_body = 'Dubai Health Authority'
WHERE organization_code = 'MED_CENTER_UAE';

-- Verification query
SELECT 
    name,
    organization_code,
    organization_name as type,
    city,
    email,
    phone,
    license_number,
    accreditation_status
FROM organization 
WHERE deleted_at IS NULL 
ORDER BY name;
