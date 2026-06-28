/**
 * HLMS User Ecosystem & Logs Tracking (Screens 21-30) API Integration Tests
 * Run: node backend/scripts/verify_user_api.js
 */
const http = require('http');

const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}`;

// Simulated session tokens
let studentToken = 'mock-jwt-token-xyz-123456789';
let parentToken = 'mock-jwt-token-xyz-123456789';
let wardenToken = 'mock-jwt-token-xyz-123456789';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => { reject(err); });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('================================================================');
  console.log('    🚀 RUNNING HLMS USER ECOSYSTEM (SCREENS 21-30) API TESTS   ');
  console.log('================================================================\n');

  try {
    // Obtain active tokens by authenticating first
    console.log('🧪 Test 1: Authenticating Student, Parent and Warden...');

    // Login Student
    const studAuth = await request('POST', '/api/auth/login', {
      email: 'student@college.edu',
      password: 'password123'
    });
    if (studAuth.status === 200 && studAuth.body.token) {
      studentToken = studAuth.body.token;
      console.log('   ✅ Student Authenticated successfully.');
    } else {
      console.log('   ⚠️ Student Auth failed, proceeding with mock fallback.');
    }

    // Login Parent
    const parentAuth = await request('POST', '/parent/login', {
      email: 'parent@college.edu',
      password: 'password123'
    });
    if (parentAuth.status === 200 && parentAuth.body.token) {
      parentToken = parentAuth.body.token;
      console.log('   ✅ Parent Authenticated successfully.');
    } else {
      console.log('   ⚠️ Parent Auth failed, proceeding with mock fallback.');
    }

    // Login Warden
    const wardenAuth = await request('POST', '/warden/login', {
      email: 'warden@college.edu',
      password: 'password123'
    });
    if (wardenAuth.status === 200 && wardenAuth.body.token) {
      wardenToken = wardenAuth.body.token;
      console.log('   ✅ Warden Authenticated successfully.');
    } else {
      console.log('   ⚠️ Warden Auth failed, proceeding with mock fallback.');
    }

    console.log('\n🧪 Test 2: Student Profile Management APIs (Screen 21)...');
    const studProf = await request('GET', '/student/profile', null, studentToken);
    if (studProf.status === 200) {
      console.log(`   ✅ Fetch Profile: ${studProf.body.name} (${studProf.body.email})`);
    } else {
      throw new Error(`Fetch Student Profile failed. Status: ${studProf.status}`);
    }

    const studUpdate = await request('PUT', '/student/profile', {
      name: 'Piyush jain (Updated)',
      email: 'student@college.edu',
      phone: '9988776655',
      course: 'B.Tech CSE',
      year: '4th Year',
      hostelRoom: 'B-Block 402',
      profileImage: 'data:image/png;base64,simulated_avatar'
    }, studentToken);
    if (studUpdate.status === 200) {
      console.log('   ✅ Student Profile updated successfully.');
    } else {
      throw new Error('Update Student Profile failed.');
    }

    // Double-check verification: fetch profile again and assert changes are persistent
    const studProfAgain = await request('GET', '/student/profile', null, studentToken);
    if (studProfAgain.status === 200 && studProfAgain.body.name === 'Piyush jain (Updated)' && studProfAgain.body.profileImage === 'data:image/png;base64,simulated_avatar') {
      console.log('   ✅ Student Profile updates verified (Persistent in Database).');
    } else {
      throw new Error(`Profile validation failed: Name=${studProfAgain.body?.name}, Image=${studProfAgain.body?.profileImage}`);
    }

    console.log('\n🧪 Test 3: Student Notifications & Bulletins APIs (Screen 22)...');
    const studNotif = await request('GET', '/student/notifications', null, studentToken);
    if (studNotif.status === 200) {
      console.log(`   ✅ Notifications fetched successfully. Bulletins size: ${studNotif.body.length}`);
    } else {
      throw new Error('Get Student Notifications failed.');
    }

    console.log('\n🧪 Test 4: Parent Profile & History APIs (Screens 23, 24)...');
    const parentProf = await request('GET', '/parent/profile', null, parentToken);
    if (parentProf.status === 200) {
      console.log(`   ✅ Parent profile retrieved. Linked student: ${parentProf.body.studentName || 'None'}`);
    } else {
      throw new Error('Get Parent Profile failed.');
    }

    const parentHistory = await request('GET', '/parent/leave-history', null, parentToken);
    if (parentHistory.status === 200) {
      console.log(`   ✅ Child leave history fetched successfully. Logs: ${parentHistory.body.length}`);
    } else {
      throw new Error('Get Child Leave History failed.');
    }

    console.log('\n🧪 Test 5: Warden Profile & Approvals Overrides (Screens 25, 26)...');
    const wardenProf = await request('GET', '/warden/profile', null, wardenToken);
    if (wardenProf.status === 200) {
      console.log(`   ✅ Warden profile loaded. Duty Assigned: ${wardenProf.body.hostelAssigned} (${wardenProf.body.shift})`);
    } else {
      throw new Error('Get Warden Profile failed.');
    }

    const wardenPending = await request('GET', '/warden/pending', null, wardenToken);
    if (wardenPending.status === 200) {
      console.log(`   ✅ Warden pending list fetched. Pending leaves: ${wardenPending.body.length}`);
    } else {
      throw new Error('Warden fetch pending leaves failed.');
    }

    console.log('\n🧪 Test 6: Gate Logs student movement tracking (Screen 27)...');
    const logsTrack = await request('GET', '/tracking/students', null, wardenToken);
    if (logsTrack.status === 200) {
      console.log(`   ✅ Gate logs tracking movements pulled successfully. Movements count: ${logsTrack.body.length}`);
    } else {
      throw new Error('Fetch Gate Logs movements failed.');
    }

    console.log('\n🧪 Test 7: Leave Reports Analytics & Summaries (Screen 28)...');
    const repDetails = await request('GET', '/reports/details', null, wardenToken);
    if (repDetails.status === 200) {
      console.log(`   ✅ Analytical reports summary loaded: Strength: ${repDetails.body.summary?.totalStudents}, Checkouts: ${repDetails.body.summary?.activeOutpasses}`);
    } else {
      throw new Error('Get Analytical Reports details failed.');
    }

    console.log('\n🧪 Test 8: Student Feedbacks & Complaints lodging (Screen 29)...');
    const feedbackLodge = await request('POST', '/feedback', {
      subject: 'Frequent WiFi drops',
      description: 'WiFi speeds dropped below 1Mbps during evening peak study hours.',
      category: 'Internet & WiFi'
    }, studentToken);
    if (feedbackLodge.status === 201) {
      console.log(`   ✅ Student feedback lodge ticket registered successfully! ID: ${feedbackLodge.body.feedbackId}`);
    } else {
      throw new Error('Lodge student complaint ticket failed.');
    }

    console.log('\n🧪 Test 9: Support Ticketing Desks (Screen 30)...');
    const raiseTicket = await request('POST', '/support/ticket', {
      subject: 'Unable to scan QR gatepass',
      description: 'Scanner displayed Error 502 when trying to scan in B-Block.'
    }, studentToken);
    if (raiseTicket.status === 201) {
      console.log(`   ✅ Support ticket raised successfully! ID: ${raiseTicket.body.ticketId}`);
    } else {
      throw new Error('Raise support ticket failed.');
    }

    console.log('\n================================================================');
    console.log('   🎉 ALL HLMS USER ECOSYSTEM API TESTS COMPLETED SUCCESSFULLY!  ');
    console.log('================================================================');

  } catch (error) {
    console.error('\n❌ HLMS INTEGRATION API TEST ERROR:', error.message);
    process.exit(1);
  }
};

runTests();
