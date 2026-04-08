// SIMPLE VERSION - Run this in browser console (F12) while logged in
// This uses native fetch instead of axios

(async () => {
    // Get auth from localStorage
    const authState = JSON.parse(localStorage.getItem('auth-store') || '{}');
    const token = authState.state?.token;
    const tenantId = authState.state?.tenantId;

    if (!token || !tenantId) {
        console.error('❌ Not logged in. Please login first.');
        return;
    }

    console.log(`🔑 Tenant: ${tenantId}`);
    
    try {
        // Seed the data
        console.log('🌱 Seeding patient types...');
        const response = await fetch(`http://localhost:5073/api/patient-type-configurations/seed/${tenantId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Seed failed:', error);
            return;
        }
        
        const result = await response.json();
        console.log('✅ Seeded:', result.patientTypes.join(', '));
        
        // Verify
        console.log('\n🔍 Verifying...');
        const verify = await fetch('http://localhost:5073/api/patient-type-configurations', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Tenant-ID': tenantId
            }
        });
        
        const configs = await verify.json();
        console.log(`✅ Found ${configs.length} configurations`);
        configs.forEach(c => console.log(`  ✓ ${c.displayName}`));
        
        console.log('\n🎉 SUCCESS! Refresh the page now.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();
