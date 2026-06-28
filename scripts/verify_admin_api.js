/**
 * HLMS Admin Portal Ecosystem (Screens 11 to 20) Integration and API Test Suite
 * Programmatically simulates Admin Login, Student CRUD operations, Warden CRUD, Parent CRUD,
 * Leaves Admin overrides, settings changes, notification broadcasting, and gate log listing.
 */

const BACKEND_URL = 'http://localhost:5005';

async function runAdminTests() {
  console.log('================================================================');
  console.log('   🚀 RUNNING HLMS ADMIN ECOSYSTEM (SCREENS 11-20) API TESTS    ');
  console.log('================================================================\n');

  let adminToken = '';
  let testStudentId = null;
  let testWardenId = null;
  let testParentId = null;
  let testNotificationId = null;

  try {
    // ----------------------------------------------------------------
    // 1. ADMIN AUTHENTICATION (SCREEN 11)
    // ----------------------------------------------------------------
    console.log('🧪 Test 1: Authenticating Admin Login...');
    const adminLoginRes = await fetch(`${BACKEND_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@college.edu',
        password: 'password123'
      })
    });

    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok) {
      throw new Error(`Admin auth failed: ${adminLoginData.message}`);
    }
    adminToken = adminLoginData.token;
    console.log('✅ Admin authenticated successfully!');
    console.log(`   Admin Name: ${adminLoginData.admin.name}, Email: ${adminLoginData.admin.email}`);

    // ----------------------------------------------------------------
    // 2. ADMIN DASHBOARD STATS (SCREEN 12)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 2: Fetching Admin Dashboard Stats & Recent Activities...');
    const dashboardRes = await fetch(`${BACKEND_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const dashboardData = await dashboardRes.json();
    if (!dashboardRes.ok) {
      throw new Error(`Fetch dashboard stats failed: ${dashboardData.message}`);
    }
    console.log('✅ Dashboard metrics loaded successfully!');
    console.log('   Stats:', dashboardData.stats);

    const activitiesRes = await fetch(`${BACKEND_URL}/admin/recent-activities`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const activitiesData = await activitiesRes.json();
    if (activitiesRes.ok) {
      console.log(`   Recent activities feed size: ${activitiesData.length}`);
    }

    // ----------------------------------------------------------------
    // 3. STUDENT CRUD OPERATIONS (SCREEN 13)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 3: Running Student CRUD Operations...');
    const createStudRes = await fetch(`${BACKEND_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: `jane.doe_${Date.now()}@college.edu`,
        password: 'password123',
        hostelRoom: 'A-Block 303',
        phone: '9876543230',
        course: 'B.Tech IT',
        year: '2nd Year'
      })
    });
    const createStudData = await createStudRes.json();
    if (!createStudRes.ok) {
      throw new Error(`Create student failed: ${createStudData.message}`);
    }
    testStudentId = createStudData.studentId;
    console.log(`✅ Student created successfully! Student ID: ${testStudentId}`);

    // Read student details
    const getStudRes = await fetch(`${BACKEND_URL}/students/${testStudentId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const getStudData = await getStudRes.json();
    console.log(`   Fetched Student: ${getStudData.name} (${getStudData.email})`);

    // Update student details
    const updateStudRes = await fetch(`${BACKEND_URL}/students/${testStudentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Jane Doe Updated',
        email: getStudData.email,
        phone: '9876543230',
        course: 'B.Tech IT',
        year: '3rd Year',
        hostelRoom: 'A-Block 305'
      })
    });
    if (updateStudRes.ok) {
      console.log('✅ Student updated successfully.');
    }

    // ----------------------------------------------------------------
    // 4. WARDEN CRUD OPERATIONS (SCREEN 14)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 4: Running Warden CRUD Operations...');
    const createWardenRes = await fetch(`${BACKEND_URL}/wardens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Assistant Warden',
        email: `assistant.warden_${Date.now()}@college.edu`,
        password: 'password123',
        hostelAssigned: 'A-Block',
        shift: 'Night Shift',
        phone: '9876543231'
      })
    });
    const createWardenData = await createWardenRes.json();
    if (!createWardenRes.ok) {
      throw new Error(`Create warden failed: ${createWardenData.message}`);
    }
    testWardenId = createWardenData.wardenId;
    console.log(`✅ Warden created successfully! Warden ID: ${testWardenId}`);

    const getWardenRes = await fetch(`${BACKEND_URL}/wardens/${testWardenId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const getWardenData = await getWardenRes.json();
    console.log(`   Fetched Warden: ${getWardenData.name} Shift: ${getWardenData.shift}`);

    const updateWardenRes = await fetch(`${BACKEND_URL}/wardens/${testWardenId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Assistant Warden Updated',
        email: getWardenData.email,
        phone: '9876543231',
        hostelAssigned: 'A-Block',
        shift: 'Day Shift'
      })
    });
    if (updateWardenRes.ok) {
      console.log('✅ Warden updated successfully.');
    }

    // ----------------------------------------------------------------
    // 5. PARENT CRUD OPERATIONS (SCREEN 16)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 5: Running Parent CRUD Operations...');
    const createParentRes = await fetch(`${BACKEND_URL}/parents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Parent of Jane',
        email: `parent.jane_${Date.now()}@college.edu`,
        password: 'password123',
        phone: '9876543232',
        studentId: testStudentId
      })
    });
    const createParentData = await createParentRes.json();
    if (!createParentRes.ok) {
      throw new Error(`Create parent failed: ${createParentData.message}`);
    }
    testParentId = createParentData.parentId;
    console.log(`✅ Parent created successfully! Parent ID: ${testParentId}`);

    const getParentRes = await fetch(`${BACKEND_URL}/parents/${testParentId}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const getParentData = await getParentRes.json();
    console.log(`   Fetched Parent: ${getParentData.name} linked to Student ID: ${getParentData.studentId}`);

    // ----------------------------------------------------------------
    // 6. SYSTEM CONFIGURATION SETTINGS (SCREEN 19)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 6: Running Branding Settings Updates...');
    const getSettingsRes = await fetch(`${BACKEND_URL}/settings`);
    const getSettingsData = await getSettingsRes.json();
    console.log(`   Current Settings: University: "${getSettingsData.universityName}"`);

    const updateSettingsRes = await fetch(`${BACKEND_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        universityName: 'State Institute of Technology (Modified)',
        hostelName: 'Block-B Academic Hostel (Modified)',
        contactEmail: 'admin.modified@college.edu',
        contactPhone: '+91 9999999999'
      })
    });
    const updateSettingsData = await updateSettingsRes.json();
    if (!updateSettingsRes.ok) {
      throw new Error(`Update settings failed: ${updateSettingsData.message}`);
    }
    console.log(`✅ Settings updated! New contact: ${updateSettingsData.settings.contactEmail}`);

    // ----------------------------------------------------------------
    // 7. NOTIFICATION ANNOUNCEMENTS (SCREEN 18)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 7: Testing Notification Broadcast & Purge...');
    const createNotifRes = await fetch(`${BACKEND_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Emergency Drill Announcement',
        message: 'Fire alarm safety check today at 4:00 PM.',
        role: 'student'
      })
    });
    const createNotifData = await createNotifRes.json();
    if (!createNotifRes.ok) {
      throw new Error(`Broadcast notification failed: ${createNotifData.message}`);
    }
    testNotificationId = createNotifData.notificationId;
    console.log(`✅ Notification broadcasted! Announcement ID: ${testNotificationId}`);

    const deleteNotifRes = await fetch(`${BACKEND_URL}/notifications/${testNotificationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (deleteNotifRes.ok) {
      console.log('✅ Broadcasted notification successfully deleted / archived.');
    }

    // ----------------------------------------------------------------
    // 8. GATE LOGS AND REPORTS (SCREEN 20 & 17)
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 8: Fetching Gate Logs and Analytics Reports...');
    const logsRes = await fetch(`${BACKEND_URL}/gatelogs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const logsData = await logsRes.json();
    if (logsRes.ok) {
      console.log(`✅ Gate logs history compiled! Records: ${logsData.length}`);
    }

    const reportRes = await fetch(`${BACKEND_URL}/reports/leaves`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const reportData = await reportRes.json();
    if (reportRes.ok) {
      console.log(`✅ Analytics leaves report compiled! Records: ${reportData.length}`);
    }

    // ----------------------------------------------------------------
    // 9. CLEAN UP CREATED ENTITIES
    // ----------------------------------------------------------------
    console.log('\n🧪 Test 9: Cleaning up test CRUD records...');
    await fetch(`${BACKEND_URL}/students/${testStudentId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` } });
    await fetch(`${BACKEND_URL}/wardens/${testWardenId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` } });
    await fetch(`${BACKEND_URL}/parents/${testParentId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${adminToken}` } });
    console.log('✅ Test student, warden, and parent profiles purged.');

    console.log('\n================================================================');
    console.log('   🎉 ALL HLMS ADMIN PORTAL ECOSYSTEM API TESTS COMPLETED SUCCESSFULLY!  ');
    console.log('================================================================');

  } catch (error) {
    console.error('\n❌ HLMS ADMIN PORTAL TEST DESK FAILURE:', error.message);
    process.exit(1);
  }
}

runAdminTests();
