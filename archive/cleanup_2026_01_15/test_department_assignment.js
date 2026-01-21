// Test assigning department to user directly via API
// Run with: node test_department_assignment.js

const axios = require('axios');

const API_BASE = 'http://localhost:5073/api';
const userId = 'd3e13e5f-c733-4e7d-adb7-f88ea98d35f3'; // Sam Aluri
const departmentId = '11111111-1111-1111-1111-111111111111'; // Emergency Medicine
const tenantId = '8a934250-001c-4ab1-9161-08dd3d29fecc';

// You'll need to get a valid token first by logging in
const token = 'YOUR_TOKEN_HERE';

async function assignDepartment() {
    try {
        console.log('\n=== Assigning Department via API ===\n');
        
        const response = await axios.post(
            `${API_BASE}/users/${userId}/department-access`,
            {
                departmentId: departmentId,
                accessLevel: 'Full Access',
                isPrimary: true
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-ID': tenantId,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✓ Success!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('✗ Error:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data);
        console.error('Full error:', error.message);
    }
}

assignDepartment();
