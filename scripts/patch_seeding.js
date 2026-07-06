const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../config/db.js');
let dbContent = fs.readFileSync(dbPath, 'utf8');

const oldSeedBlock = `    // Seed default Parent if empty
    const [parents] = await client.query('SELECT id FROM Parents LIMIT 1');
    if (parents.length === 0) {
      console.log('Seeding default parent to PostgreSQL...');
      await client.query(
        'INSERT INTO Parents (name, email, password, phone, studentId, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
        ['Parent Test', 'parent@college.edu', bcrypt.hashSync('password123', 10), '9876543211', 1, true]
      );
    }

    // Seed default Warden if empty
    const [wardens] = await client.query('SELECT id FROM Wardens LIMIT 1');
    if (wardens.length === 0) {
      console.log('Seeding default warden to PostgreSQL...');
      await client.query(
        'INSERT INTO Wardens (name, email, password, phone, hostelAssigned, shift, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Warden Test', 'warden@college.edu', bcrypt.hashSync('password123', 10), '9876543212', 'B-Block', 'Day Shift', true]
      );
    }

    // Seed default Admin if empty
    const [admins] = await client.query('SELECT id FROM Admins LIMIT 1');
    if (admins.length === 0) {
      console.log('Seeding default admin to PostgreSQL...');
      await client.query(
        'INSERT INTO Admins (name, email, password, isVerified) VALUES (?, ?, ?, ?)',
        ['Admin Test', 'admin@college.edu', bcrypt.hashSync('password123', 10), true]
      );
    }

    // Seed default Settings if empty
    const [settings] = await client.query('SELECT id FROM Settings LIMIT 1');
    if (settings.length === 0) {
      console.log('Seeding default settings to PostgreSQL...');
      await client.query(
        'INSERT INTO Settings (universityName, hostelName, contactEmail, contactPhone) VALUES (?, ?, ?, ?)',
        ['State Institute of Technology', 'Block-B Academic Hostel', 'admin.hostel@college.edu', '+91 9876543210']
      );
    }`;

const newSeedBlock = `    // Seed default Parent if empty
    const { rows: parents } = await client.query('SELECT id FROM Parents LIMIT 1');
    if (parents.length === 0) {
      console.log('Seeding default parent to PostgreSQL...');
      await client.query(
        'INSERT INTO Parents (name, email, password, phone, studentId, isVerified) VALUES ($1, $2, $3, $4, $5, $6)',
        ['Parent Test', 'parent@college.edu', bcrypt.hashSync('password123', 10), '9876543211', 1, true]
      );
    }

    // Seed default Warden if empty
    const { rows: wardens } = await client.query('SELECT id FROM Wardens LIMIT 1');
    if (wardens.length === 0) {
      console.log('Seeding default warden to PostgreSQL...');
      await client.query(
        'INSERT INTO Wardens (name, email, password, phone, hostelAssigned, shift, isVerified) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['Warden Test', 'warden@college.edu', bcrypt.hashSync('password123', 10), '9876543212', 'B-Block', 'Day Shift', true]
      );
    }

    // Seed default Admin if empty
    const { rows: admins } = await client.query('SELECT id FROM Admins LIMIT 1');
    if (admins.length === 0) {
      console.log('Seeding default admin to PostgreSQL...');
      await client.query(
        'INSERT INTO Admins (name, email, password, isVerified) VALUES ($1, $2, $3, $4)',
        ['Admin Test', 'admin@college.edu', bcrypt.hashSync('password123', 10), true]
      );
    }

    // Seed default Settings if empty
    const { rows: settings } = await client.query('SELECT id FROM Settings LIMIT 1');
    if (settings.length === 0) {
      console.log('Seeding default settings to PostgreSQL...');
      await client.query(
        'INSERT INTO Settings (universityName, hostelName, contactEmail, contactPhone) VALUES ($1, $2, $3, $4)',
        ['State Institute of Technology', 'Block-B Academic Hostel', 'admin.hostel@college.edu', '+91 9876543210']
      );
    }
    
    // Seed Warden Directory
    const { rows: wardenDir } = await client.query('SELECT id FROM WardenDirectoryCards LIMIT 1');
    if (wardenDir.length === 0) {
      console.log('Seeding warden directory to PostgreSQL...');
      const wardensList = [
        { id: 'w1', role: 'Chief Authority', name: 'Dr. Anil jain Sharma', location: 'Main Campus Office', phone: '+91 98765 43210', email: 'warden.chief@college.edu', color: 'primary', initials: 'AJ' },
        { id: 'w2', role: 'Block A & B', name: 'Prof. Suresh Chandra', location: 'Ground Floor, Block A', phone: '+91 91234 56789', email: 'warden.blockab@college.edu', color: 'secondary', initials: 'SC' },
        { id: 'w3', role: 'Block C & D', name: 'Prof. Mahendra Pal', location: 'First Floor, Block C', phone: '+91 99887 76655', email: 'warden.blockcd@college.edu', color: 'warning', initials: 'MP' }
      ];
      for (const w of wardensList) {
        await client.query(
          'INSERT INTO WardenDirectoryCards (id, role, name, location, phone, email, color, initials) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [w.id, w.role, w.name, w.location, w.phone, w.email, w.color, w.initials]
        );
      }
    }
    
    // Seed Policies
    const { rows: policies } = await client.query('SELECT id FROM Policies LIMIT 1');
    if (policies.length === 0) {
      console.log('Seeding policies to PostgreSQL...');
      const portalPolicies = [
        { id: 'p1', title: '1. Use of Authentic Credentials Only', desc: 'Access to this digital portal is strictly restricted to your authorized @college.edu institutional email address. Do not attempt to register secondary accounts or use personal email addresses. Doing so will result in an automatic account suspension.' },
        { id: 'p2', title: '2. Strict Parent Account Linking Protocols', desc: 'You must ensure your correct parent or guardian email is registered in the system for outpass approvals. Falsifying parent emails, creating fake proxy accounts, or approving your own outpasses is considered a severe disciplinary offense.' },
        { id: 'p3', title: '3. Maintaining Profile Accuracy', desc: 'It is the student\\'s responsibility to keep their emergency contact numbers, blood group, and allocated room details updated in the Profile section. Outpass applications may be automatically rejected by the system if the profile data is found to be incomplete or mismatched.' },
        { id: 'p4', title: '4. Dynamic QR Gate Pass Integrity', desc: 'Do not screenshot, screen-record, or share your QR gate passes. The QR codes rotate dynamically every few seconds. Presenting an old or static screenshot at the security scanner will trigger an immediate security alert and block your exit.' },
        { id: 'p5', title: '5. Honesty in Leave Applications', desc: 'Providing false reasons, fabricated medical certificates, or fake destination addresses for leave applications will result in a permanent ban from using the digital portal. All applications are subject to random verification calls to parents.' },
        { id: 'p6', title: '6. Account Password Security', desc: 'You are required to change your access passkey every 90 days. Never share your password or OTPs with peers, seniors, or even administration staff. You are entirely responsible for any outpass generated from your logged-in session.' },
        { id: 'p7', title: '7. Mandatory Gate Scanning Protocol', desc: 'When entering or exiting the campus, you must physically present your own device to the security guard to scan the QR code. Tailgating behind another student without scanning your own pass will flag you as an unauthorized absconder.' },
        { id: 'p8', title: '8. Status Acknowledgement and Bulletins', desc: 'Students are expected to frequently check the Announcements tab. You must manually click and mark critical bulletins as "Read" to acknowledge receipt of important administrative notices. Ignorance of a published rule is not an acceptable excuse.' },
        { id: 'p9', title: '9. Automated Session Timeouts', desc: 'For your security, the portal will automatically log you out after 30 minutes of inactivity. If you are using a shared computer in the library or computer lab, you must ensure you manually log out and close the browser window.' },
        { id: 'p10', title: '10. Proper Issue Reporting Channels', desc: 'If you experience bugs, application crashes, or approval delays exceeding 48 hours, do not create duplicate outpass requests. Instead, raise a detailed technical ticket via the Support Hub tab so the IT team can resolve the underlying issue.' }
      ];
      for (const p of portalPolicies) {
        await client.query('INSERT INTO Policies (id, type, title, description) VALUES ($1, $2, $3, $4)', [p.id, 'portal', p.title, p.desc]);
      }
      
      const hostelPolicies = [
        { id: 'h1', title: '1. Strict Night Curfew Hours', desc: 'All campus borders, main gates, and hostel block entrances are strictly shut down at 8:30 PM every night without exception. Students attempting late entries will be denied access to the block and must wait in the security lounge. Repeated late entries will trigger automated disciplinary logs which are instantly emailed to registered parents or guardians.' },
        { id: 'h2', title: '2. Outpass Application Deadlines', desc: 'All outpass applications must be submitted through this digital portal at least 24 hours prior to the requested leave start time. This buffer period is mandatory to guarantee that the Chief Warden has adequate time to review the request, cross-check academic schedules, and issue an approval.' },
        { id: 'h3', title: '3. Mandatory Biometric Attendance Checks', desc: 'Biometric fingerprint scanning is actively enforced in all block lobbies from 9:00 PM to 9:30 PM daily. It is the absolute responsibility of the student to ensure their attendance is marked. Unmarked absences, even if the student is inside the room, will incur heavy penalty fines and a potential suspension of outpass privileges.' },
        { id: 'h4', title: '4. Enforcement of Silence Hours', desc: 'Strict silence must be maintained in all corridors, common rooms, and residential rooms from 10:00 PM to 6:00 AM. This policy respects the study and sleep schedules of all residents. Playing loud music, shouting across hallways, or gathering in large noisy groups during these hours will lead to confiscation of speakers and disciplinary action.' },
        { id: 'h5', title: '5. Comprehensive Visitor Policy', desc: 'Under no circumstances are outside visitors, including day-scholars and family members, permitted inside individual student rooms. All visitors must be registered at the main gate and can only be entertained in the designated ground-floor visitor lounges during approved visiting hours (4:00 PM to 7:00 PM).' },
        { id: 'h6', title: '6. Room Cleanliness and Maintenance', desc: 'Students are held responsible for the daily tidiness and hygiene of their allocated rooms. Surprise inspections are conducted weekly by the block wardens. Rooms found with accumulated garbage, unhygienic conditions, or damaged furniture will result in maintenance fines levied equally among the room\\'s occupants.' },
        { id: 'h7', title: '7. Prohibition of Heavy Electrical Appliances', desc: 'To prevent severe fire hazards and power tripping, heavy electrical appliances such as induction stoves, room heaters, electric kettles, and irons are strictly prohibited in student rooms. Only laptops, mobile chargers, and small table lamps are permitted. Confiscated items will not be returned until the end of the semester.' }
      ];
      for (const p of hostelPolicies) {
        await client.query('INSERT INTO Policies (id, type, title, description) VALUES ($1, $2, $3, $4)', [p.id, 'hostel', p.title, p.desc]);
      }
    }`;

if (dbContent.includes(oldSeedBlock)) {
  dbContent = dbContent.replace(oldSeedBlock, newSeedBlock);
  fs.writeFileSync(dbPath, dbContent, 'utf8');
  console.log("Successfully patched seeding logic");
} else {
  console.log("Could not find the old block to replace.");
}
