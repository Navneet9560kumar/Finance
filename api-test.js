const BASE_URL = 'http://localhost:3000/api';

// Helper function to log results
const printResult = (testName, passed, details = '') => {
    if (passed) {
        console.log(`✅ [PASS] ${testName}`);
    } else {
        console.log(`❌ [FAIL] ${testName} | ${details}`);
    }
};

const runTests = async () => {
    console.log('🚀 Starting API Automated Tests...\n');
    let adminToken, viewerToken;

    try {
        // ==========================================
        // TEST 1: Admin Login
        // ==========================================
        const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
        });
        const adminData = await adminLogin.json();
        
        if (adminLogin.status === 200 && adminData.token) {
            adminToken = adminData.token;
            printResult('Admin Login', true);
        } else {
            printResult('Admin Login', false, adminData.message);
            return; 
        }

        // ==========================================
        // TEST 2: Admin Creates a Record
        // ==========================================
        const createRecord = await fetch(`${BASE_URL}/records`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                amount: 1200,
                type: 'expense',
                category: 'Travel',
                notes: 'Flight Ticket'
            })
        });
        printResult('Admin Can Create Record', createRecord.status === 201);

        // ==========================================
        // TEST 3: Get Dashboard Summary
        // ==========================================
        const getSummary = await fetch(`${BASE_URL}/records/summary`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        printResult('Get Dashboard Summary', getSummary.status === 200);

        // ==========================================
        // TEST 4: Advanced Search - Text Search
        // ==========================================
        // Seed database me ek record hai jiske notes me "Project" likha hai
        const textSearch = await fetch(`${BASE_URL}/records?search=Project`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const textSearchData = await textSearch.json();
        const foundProject = textSearchData.records && textSearchData.records.some(r => r.notes.includes('Project'));
        printResult('Advanced Search: Text Partial Match', foundProject);

        // ==========================================
        // TEST 5: Advanced Search - Amount Range
        // ==========================================
        // Records between 5000 and 15000
        const amountFilter = await fetch(`${BASE_URL}/records?minAmount=5000&maxAmount=15000`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const amountData = await amountFilter.json();
        const allAmountsValid = amountData.records && amountData.records.every(r => r.amount >= 5000 && r.amount <= 15000);
        printResult('Advanced Search: Amount Range Filter', allAmountsValid);

        // ==========================================
        // TEST 6: Advanced Search - Sorting
        // ==========================================
        const sortFilter = await fetch(`${BASE_URL}/records?sort=amount_desc`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const sortData = await sortFilter.json();
        const isSorted = sortData.records && (sortData.records.length < 2 || sortData.records[0].amount >= sortData.records[1].amount);
        printResult('Advanced Search: Sorting (Highest Amount First)', isSorted);

        // ==========================================
        // TEST 7: Viewer Login
        // ==========================================
        const viewerLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'viewer@test.com', password: 'password123' })
        });
        const viewerData = await viewerLogin.json();
        
        if (viewerLogin.status === 200 && viewerData.token) {
            viewerToken = viewerData.token;
            printResult('Viewer Login', true);
        } else {
            printResult('Viewer Login', false, viewerData.message);
        }

        // ==========================================
        // TEST 8: Viewer Tries to Create (Should Fail)
        // ==========================================
        const viewerCreate = await fetch(`${BASE_URL}/records`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${viewerToken}`
            },
            body: JSON.stringify({ amount: 500, type: 'income', category: 'Gift' })
        });
        printResult('Role-Based Access (Viewer Blocked from Creating)', viewerCreate.status === 403);

    } catch (error) {
        console.error('\n⚠️ Test Execution Failed:');
        console.error(error.message);
    }

    console.log('\n🏁 Testing Completed.');
};

runTests();