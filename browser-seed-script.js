// Run this in the browser console (F12) while logged into the application
// This will seed the 8 patient type configurations for your tenant

async function seedPatientTypes() {
    const api = axios.create({
        baseURL: 'http://localhost:5073/api'
    });

    // Get stored tenant and token from localStorage
    const authState = JSON.parse(localStorage.getItem('auth-store') || '{}');
    const token = authState.state?.token;
    const tenantId = authState.state?.tenantId;

    if (!token || !tenantId) {
        console.error('❌ Not logged in or missing tenant ID');
        return;
    }

    console.log(`🔑 Using tenant ID: ${tenantId}`);
    console.log(`🔑 Using token: ${token.substring(0, 20)}...`);

    // Set headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.defaults.headers.common['X-Tenant-ID'] = tenantId;

    try {
        console.log('🌱 Seeding patient types...');
        const response = await api.post(`/patient-type-configurations/seed/${tenantId}`, {});
        console.log('✅ SUCCESS:', response.data);
        console.log(`Seeded ${response.data.patientTypes.length} patient types:`, response.data.patientTypes);
        
        // Verify by fetching all configs
        console.log('\n🔍 Verifying...');
        const verifyResponse = await api.get('/patient-type-configurations');
        console.log(`✅ Verification: Found ${verifyResponse.data.length} patient type configurations`);
        verifyResponse.data.forEach(config => {
            console.log(`  - ${config.displayName} (${config.patientType})`);
        });
        
        console.log('\n🎉 Done! Refresh the page to see the patient type cards.');
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.error('Full error:', error);
    }
}

// Run the function
seedPatientTypes();
