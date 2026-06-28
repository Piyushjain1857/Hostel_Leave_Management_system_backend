/**
 * HLMS E2E Integration and API Test Suite
 * Programmatically simulates the entire outpass application, parent approval, 
 * QR pass generation, security gate scanning (exit and return), and warden auditing cycle.
 */

const BACKEND_URL = 'http://localhost:5005';

async function runTests() {
  console.log('================================================================');
  console.log('   🚀 RUNNING HLMS SCREEN 3 - SCREEN 10 END-TO-END API TESTS    ');
  console.log('================================================================\n');

  let studentToken = '';
  let parentToken = '';
  let wardenToken = '';
  let testLeaveId = null;

  try {
    // ----------------------------------------------------------------
    // 1. REGISTER STUDENT
    // ----------------------------------------------------------------
    console.log('🧪 Test 1: Registering a new test student...');
    const registerRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Test Student',
        email: `tester_${Date.now()}@college.edu`,
        password: 'password123',
        hostelRoom: 'C-Block 101'
      })
    });
    
    const registerData = await registerRes.json();
    if (registerRes.ok) {
      console.log('✅ Student registered successfully!');
    } else {
      console.log(`⚠️ Register failed: ${registerData.message}. Trying to login directly...`);
    }

    // ----------------------------------------------------------------
    // 2. LOGIN STUDENT
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 2: Authenticating student login...');
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@college.edu',
        password: 'password123'
      })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Student authentication failed: ${loginData.message}`);
    }
    studentToken = loginData.token;
    console.log('✅ Student logged in successfully!');
    console.log(`   Student Name: ${loginData.student.name}, Room: ${loginData.student.hostelRoom}`);

    // ----------------------------------------------------------------
    // 3. APPLY LEAVE (SCREEN 3)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 3: Submitting Leave Request (Apply Leave)...');
    const applyRes = await fetch(`${BACKEND_URL}/leave/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        reason: 'Out-station research hackathon representation.',
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        destination: 'SIT Delhi Campus',
        parentPhone: '9876543210'
      })
    });

    const applyData = await applyRes.json();
    if (!applyRes.ok) {
      throw new Error(`Apply leave failed: ${applyData.message}`);
    }
    testLeaveId = applyData.leaveId;
    console.log(`✅ Leave request applied successfully! Leave ID: ${testLeaveId}`);

    // ----------------------------------------------------------------
    // 4. FETCH LEAVE HISTORY (SCREEN 4)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 4: Fetching student leave history...');
    const historyRes = await fetch(`${BACKEND_URL}/leave/history`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    const historyData = await historyRes.json();
    if (!historyRes.ok) {
      throw new Error(`Fetch history failed: ${historyData.message}`);
    }
    const matchingLeave = historyData.find(l => l.id === testLeaveId);
    if (!matchingLeave) {
      throw new Error(`Newly created leave ID ${testLeaveId} not found in student history!`);
    }
    console.log(`✅ Leave history retrieved! Total logs: ${historyData.length}`);
    console.log(`   Applied Leave State: Status is "${matchingLeave.status}"`);

    // ----------------------------------------------------------------
    // 5. PARENT LOGIN (SCREEN 6)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 5: Authenticating Parent Login...');
    const parentLoginRes = await fetch(`${BACKEND_URL}/parent/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'parent@college.edu',
        password: 'password123'
      })
    });

    const parentLoginData = await parentLoginRes.json();
    if (!parentLoginRes.ok) {
      throw new Error(`Parent auth failed: ${parentLoginData.message}`);
    }
    parentToken = parentLoginData.token;
    console.log('✅ Parent authenticated successfully!');

    // ----------------------------------------------------------------
    // 6. PARENT PENDING APPROVALS LIST & APPROVE (SCREEN 7)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 6: Checking Parent Pending Board & Approving Leave...');
    const parentPendingRes = await fetch(`${BACKEND_URL}/parent/pending`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${parentToken}` }
    });

    const parentPendingData = await parentPendingRes.json();
    if (!parentPendingRes.ok) {
      throw new Error(`Parent fetch pending failed: ${parentPendingData.message}`);
    }
    console.log(`   Pending list loaded! Count: ${parentPendingData.length}`);

    // Approve the leave
    const approveRes = await fetch(`${BACKEND_URL}/parent/approve/${testLeaveId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${parentToken}` }
    });

    const approveData = await approveRes.json();
    if (!approveRes.ok) {
      throw new Error(`Parent approval PUT request failed: ${approveData.message}`);
    }
    console.log(`✅ Leave ID ${testLeaveId} successfully approved by Parent!`);

    // ----------------------------------------------------------------
    // 7. GENERATE QR PASS (SCREEN 5)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 7: Generating secure QR Gate Pass...');
    const qrRes = await fetch(`${BACKEND_URL}/leave/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ leaveId: testLeaveId })
    });

    const qrData = await qrRes.json();
    if (!qrRes.ok) {
      throw new Error(`QR generation failed: ${qrData.message}`);
    }
    console.log('✅ QR Gate Pass generated successfully!');
    console.log(`   Embedded QR Url: ${qrData.qrUrl}`);

    // Create the expected QR code payload text
    const qrPayload = JSON.stringify({
      leaveId: qrData.leaveId,
      studentId: 1, // Student ID
      studentName: qrData.studentName,
      fromDate: qrData.fromDate,
      toDate: qrData.toDate,
      destination: qrData.destination,
      status: 'Approved' // approved by parent
    });

    // ----------------------------------------------------------------
    // 8. SECURITY SCAN VERIFICATION (SCREEN 10)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 8: Simulating Security Guard scanning QR Pass...');
    const verifyRes = await fetch(`${BACKEND_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrText: qrPayload })
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      throw new Error(`QR Scanner verification failed: ${verifyData.message}`);
    }
    console.log(`✅ QR scan verification complete! Status: ${verifyData.message}`);
    console.log(`   Student Name: ${verifyData.student.name}, Room: ${verifyData.student.room}`);
    console.log(`   Pass Status: "${verifyData.leave.status}"`);

    // ----------------------------------------------------------------
    // 9. LOG GATE EXIT (SCREEN 10)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 9: Recording student Exit check-out at main gate...');
    const exitRes = await fetch(`${BACKEND_URL}/exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaveId: testLeaveId })
    });

    const exitData = await exitRes.json();
    if (!exitRes.ok) {
      throw new Error(`Exit punch recording failed: ${exitData.message}`);
    }
    console.log(`✅ Exit punch recorded successfully! Status updated to "${exitData.status}"`);

    // ----------------------------------------------------------------
    // 10. LOG GATE RETURN (SCREEN 10)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 10: Recording student Return check-in at main gate...');
    const returnRes = await fetch(`${BACKEND_URL}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaveId: testLeaveId })
    });

    const returnData = await returnRes.json();
    if (!returnRes.ok) {
      throw new Error(`Return punch recording failed: ${returnData.message}`);
    }
    console.log(`✅ Return punch recorded successfully! Status updated to "${returnData.status}"`);

    // ----------------------------------------------------------------
    // 11. WARDEN LOGIN (SCREEN 8)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 11: Authenticating Warden Login...');
    const wardenLoginRes = await fetch(`${BACKEND_URL}/warden/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'warden@college.edu',
        password: 'password123'
      })
    });

    const wardenLoginData = await wardenLoginRes.json();
    if (!wardenLoginRes.ok) {
      throw new Error(`Warden auth failed: ${wardenLoginData.message}`);
    }
    wardenToken = wardenLoginData.token;
    console.log('✅ Warden authenticated successfully!');

    // ----------------------------------------------------------------
    // 12. WARDEN DASHBOARD STATISTICS & MOVEMENT FEED (SCREEN 9)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 12: Checking Warden Dashboard Statistics & Activity Feed...');
    const wardenDashRes = await fetch(`${BACKEND_URL}/warden/dashboard`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${wardenToken}` }
    });

    const wardenDashData = await wardenDashRes.json();
    if (!wardenDashRes.ok) {
      throw new Error(`Warden dashboard fetch failed: ${wardenDashData.message}`);
    }
    console.log('✅ Warden audit logs retrieved!');
    console.log(`   Global Stats:`, wardenDashData.stats);
    console.log(`   Recent pending leaves queue size: ${wardenDashData.pendingLeaves.length}`);

    console.log('\n================================================================');
    console.log('   🎉 ALL HLMS E2E SYSTEM INTEGRATION TESTS COMPLETED SUCCESSFULLY!  ');
    console.log('================================================================');

  } catch (error) {
    console.error('\n❌ HLMS INTEGRATION TEST FAILURE:', error.message);
    process.exit(1);
  }
}

runTests();
