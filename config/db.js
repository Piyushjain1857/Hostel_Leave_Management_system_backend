const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_FILE = path.join(__dirname, 'db.json');

let pool;

// In-memory mock database state (changed to let for file loading)
let mockStudents = [
  {
    id: 1,
    name: 'Piyush jain',
    email: 'student@college.edu',
    password: bcrypt.hashSync('password123', 10),
    hostelRoom: 'B-Block 402',
    phone: '9876543210',
    course: 'B.Tech Computer Science',
    year: '3rd Year',
    profileImage: '',
    coverImage: '',
    created_at: new Date()
  },
  {
    id: 3,
    name: 'Anshu Kumari',
    email: 'anshu.k@college.edu',
    password: bcrypt.hashSync('password123', 10),
    hostelRoom: 'C-Block 205',
    phone: '9876543218',
    course: 'B.Tech ECE',
    year: '4th Year',
    profileImage: '',
    created_at: new Date()
  }
];

let mockParents = [
  {
    id: 1,
    name: 'Parent Test',
    email: 'parent@college.edu',
    password: bcrypt.hashSync('password123', 10),
    phone: '9876543211',
    studentId: 1,
    profileImage: ''
  }
];

let mockWardens = [
  {
    id: 1,
    name: 'Warden Test',
    email: 'warden@college.edu',
    password: bcrypt.hashSync('password123', 10),
    phone: '9876543212',
    hostelAssigned: 'B-Block',
    shift: 'Day Shift',
    profileImage: ''
  }
];

let mockAdmins = [
  {
    id: 1,
    name: 'Admin Test',
    email: 'admin@college.edu',
    password: bcrypt.hashSync('password123', 10)
  }
];

let mockLeaveRequests = [
  {
    id: 101,
    studentId: 1,
    reason: 'Emergency visit to home town for family wedding function.',
    fromDate: '2026-05-10',
    toDate: '2026-05-14',
    destination: 'Home town',
    parentPhone: '9876543210',
    expectedTimeOut: '09:00:00',
    expectedTimeIn: '18:00:00',
    actualTimeOut: '2026-05-10 09:15:00',
    actualTimeIn: '2026-05-14 17:40:00',
    status: 'Returned',
    parentStatus: 'Approved',
    wardenStatus: 'Approved',
    finalStatus: 'Approved',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: 102,
    studentId: 1,
    reason: 'Weekend outing to local guardian\'s house in metro city.',
    fromDate: '2026-05-20',
    toDate: '2026-05-22',
    destination: 'Metro city',
    parentPhone: '9876543210',
    expectedTimeOut: '10:00:00',
    expectedTimeIn: '20:00:00',
    actualTimeOut: '2026-05-20 10:05:00',
    actualTimeIn: null,
    status: 'Out',
    parentStatus: 'Approved',
    wardenStatus: 'Approved',
    finalStatus: 'Approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 103,
    studentId: 1,
    reason: 'Special dental appointment and treatment at university hospital.',
    fromDate: '2026-05-28',
    toDate: '2026-05-28',
    destination: 'University hospital',
    parentPhone: '9876543210',
    expectedTimeOut: '09:30:00',
    expectedTimeIn: '14:30:00',
    actualTimeOut: null,
    actualTimeIn: null,
    status: 'Pending',
    parentStatus: 'Pending',
    wardenStatus: 'Pending',
    finalStatus: 'Pending',
    createdAt: new Date()
  }
];

let mockGateLogs = [
  {
    id: 1,
    studentId: 1,
    leaveId: 101,
    exitTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    entryTime: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000),
    status: 'Returned'
  }
];

let mockNotifications = [
  {
    id: 1,
    title: 'Curfew Reminder',
    message: 'Students are requested to be back in their respective blocks by 8:30 PM today.',
    role: 'student',
    status: 'Unread',
    createdAt: new Date()
  }
];

let mockSettings = [
  {
    id: 1,
    universityName: 'State Institute of Technology',
    hostelName: 'Block-B Academic Hostel',
    contactEmail: 'admin.hostel@college.edu',
    contactPhone: '+91 9876543210'
  }
];

let mockFeedback = [
  {
    id: 1,
    userId: 1,
    subject: 'Mess food quality issue',
    description: 'The dinner served yesterday was cold and not cooked properly.',
    category: 'Mess & Food',
    status: 'Pending',
    createdAt: new Date()
  }
];

let mockSupportTickets = [
  {
    id: 1,
    userId: 1,
    subject: 'Wifi connection drops frequently',
    description: 'Wifi disconnects every 10 minutes in room B-402.',
    status: 'Pending',
    createdAt: new Date()
  }
];

let mockPasswordHistory = [];
let mockActivityLogs = [];
let mockQRPasses = [];
let mockHostels = [
  { id: 1, hostelName: 'Block-A', capacity: 100, occupiedRooms: 40, wardenId: 1 },
  { id: 2, hostelName: 'Block-B', capacity: 150, occupiedRooms: 120, wardenId: null }
];
let mockRooms = [
  { id: 1, roomNumber: 'A-101', hostelId: 1, capacity: 2, occupied: 1 },
  { id: 2, roomNumber: 'B-402', hostelId: 2, capacity: 3, occupied: 3 }
];
let mockProfileImages = [];

// Screens 41-48 Mocks
let mockRoles = [
  { id: 1, roleName: 'student', permissions: 'read_own,create_leave' },
  { id: 2, roleName: 'parent', permissions: 'read_own,approve_leave' },
  { id: 3, roleName: 'warden', permissions: 'read_all,approve_leave,manage_hostel' },
  { id: 4, roleName: 'admin', permissions: 'all' }
];
let mockPermissions = [];
let mockUserRoles = [];
let mockAttendance = [];
let mockEmergencyContacts = [
  { id: 1, studentId: 1, name: 'John Doe Sr.', relation: 'Father', phone: '9876543211', address: '123 Main St' }
];
let mockVisitors = [];
let mockRoomAllocations = [
  { id: 1, studentId: 1, roomId: 2, allocationDate: '2026-01-10' }
];
let mockAuditLogs = [];
let mockAnnouncements = [
  { id: 1, title: 'Welcome to new semester', description: 'Classes start on Monday.', priority: 'High', postedBy: 'Admin', createdAt: new Date() }
];

let mockPasswordResetOTP = [];

let mockPortalRules = [
  { id: 'p1', title: '1. Use of Authentic Credentials Only', desc: 'Access to this digital portal is strictly restricted to your authorized @college.edu institutional email address. Do not attempt to register secondary accounts or use personal email addresses. Doing so will result in an automatic account suspension.' },
  { id: 'p2', title: '2. Strict Parent Account Linking Protocols', desc: 'You must ensure your correct parent or guardian email is registered in the system for outpass approvals. Falsifying parent emails, creating fake proxy accounts, or approving your own outpasses is considered a severe disciplinary offense.' },
  { id: 'p3', title: '3. Maintaining Profile Accuracy', desc: 'It is the student\'s responsibility to keep their emergency contact numbers, blood group, and allocated room details updated in the Profile section. Outpass applications may be automatically rejected by the system if the profile data is found to be incomplete or mismatched.' },
  { id: 'p4', title: '4. Dynamic QR Gate Pass Integrity', desc: 'Do not screenshot, screen-record, or share your QR gate passes. The QR codes rotate dynamically every few seconds. Presenting an old or static screenshot at the security scanner will trigger an immediate security alert and block your exit.' },
  { id: 'p5', title: '5. Honesty in Leave Applications', desc: 'Providing false reasons, fabricated medical certificates, or fake destination addresses for leave applications will result in a permanent ban from using the digital portal. All applications are subject to random verification calls to parents.' },
  { id: 'p6', title: '6. Account Password Security', desc: 'You are required to change your access passkey every 90 days. Never share your password or OTPs with peers, seniors, or even administration staff. You are entirely responsible for any outpass generated from your logged-in session.' },
  { id: 'p7', title: '7. Mandatory Gate Scanning Protocol', desc: 'When entering or exiting the campus, you must physically present your own device to the security guard to scan the QR code. Tailgating behind another student without scanning your own pass will flag you as an unauthorized absconder.' },
  { id: 'p8', title: '8. Status Acknowledgement and Bulletins', desc: 'Students are expected to frequently check the Announcements tab. You must manually click and mark critical bulletins as "Read" to acknowledge receipt of important administrative notices. Ignorance of a published rule is not an acceptable excuse.' },
  { id: 'p9', title: '9. Automated Session Timeouts', desc: 'For your security, the portal will automatically log you out after 30 minutes of inactivity. If you are using a shared computer in the library or computer lab, you must ensure you manually log out and close the browser window.' },
  { id: 'p10', title: '10. Proper Issue Reporting Channels', desc: 'If you experience bugs, application crashes, or approval delays exceeding 48 hours, do not create duplicate outpass requests. Instead, raise a detailed technical ticket via the Support Hub tab so the IT team can resolve the underlying issue.' }
];

let mockHostelRules = [
  { id: 'h1', title: '1. Strict Night Curfew Hours', desc: 'All campus borders, main gates, and hostel block entrances are strictly shut down at 8:30 PM every night without exception. Students attempting late entries will be denied access to the block and must wait in the security lounge. Repeated late entries will trigger automated disciplinary logs which are instantly emailed to registered parents or guardians.' },
  { id: 'h2', title: '2. Outpass Application Deadlines', desc: 'All outpass applications must be submitted through this digital portal at least 24 hours prior to the requested leave start time. This buffer period is mandatory to guarantee that the Chief Warden has adequate time to review the request, cross-check academic schedules, and issue an approval.' },
  { id: 'h3', title: '3. Mandatory Biometric Attendance Checks', desc: 'Biometric fingerprint scanning is actively enforced in all block lobbies from 9:00 PM to 9:30 PM daily. It is the absolute responsibility of the student to ensure their attendance is marked. Unmarked absences, even if the student is inside the room, will incur heavy penalty fines and a potential suspension of outpass privileges.' },
  { id: 'h4', title: '4. Enforcement of Silence Hours', desc: 'Strict silence must be maintained in all corridors, common rooms, and residential rooms from 10:00 PM to 6:00 AM. This policy respects the study and sleep schedules of all residents. Playing loud music, shouting across hallways, or gathering in large noisy groups during these hours will lead to confiscation of speakers and disciplinary action.' },
  { id: 'h5', title: '5. Comprehensive Visitor Policy', desc: 'Under no circumstances are outside visitors, including day-scholars and family members, permitted inside individual student rooms. All visitors must be registered at the main gate and can only be entertained in the designated ground-floor visitor lounges during approved visiting hours (4:00 PM to 7:00 PM).' },
  { id: 'h6', title: '6. Room Cleanliness and Maintenance', desc: 'Students are held responsible for the daily tidiness and hygiene of their allocated rooms. Surprise inspections are conducted weekly by the block wardens. Rooms found with accumulated garbage, unhygienic conditions, or damaged furniture will result in maintenance fines levied equally among the room\'s occupants.' },
  { id: 'h7', title: '7. Prohibition of Heavy Electrical Appliances', desc: 'To prevent severe fire hazards and power tripping, heavy electrical appliances such as induction stoves, room heaters, electric kettles, and irons are strictly prohibited in student rooms. Only laptops, mobile chargers, and small table lamps are permitted. Confiscated items will not be returned until the end of the semester.' },
  { id: 'h8', title: '8. Zero Tolerance for Contraband & Intoxicants', desc: 'The institution enforces a strict zero-tolerance policy for the possession, consumption, or distribution of alcohol, tobacco products, e-cigarettes, and illegal narcotic substances. Any discovery of such items during random sweeps will lead to immediate expulsion from the hostel and potential handover to local law enforcement.' },
  { id: 'h9', title: '9. Liability for Damage to Institutional Property', desc: 'Any intentional or accidental damage to institutional property—including corridor lighting, elevator buttons, lounge furniture, or bathroom fixtures—will result in repair costs being deducted directly from the responsible student\'s security deposit. If the culprit is unidentified, the fine is distributed across the entire floor.' },
  { id: 'h10', title: '10. Mandatory Dress Code in Common Areas', desc: 'Appropriate, modest, and clean casual wear must be worn at all times when outside the residential room. This includes all common areas, mess halls, sports facilities, and administrative offices. Nightwear and bathroom slippers are strictly prohibited in the dining hall.' },
  { id: 'h11', title: '11. Strict Mess Timings and Dining Etiquette', desc: 'Meals are freshly prepared and served only during strict pre-defined time slots (Breakfast: 7:30-9:00 AM, Lunch: 12:30-2:00 PM, Dinner: 7:30-9:00 PM). Taking mess utensils, plates, or prepared food into hostel rooms is considered theft and is strictly not allowed.' },
  { id: 'h12', title: '12. Overnight Leave Return Protocols', desc: 'When returning from an approved overnight or multi-day leave, students must scan their QR gate pass back into the campus before the 8:30 PM curfew on the designated end date. Failing to report back on time without extending the outpass online will flag the student as an unauthorized absentee.' },
  { id: 'h13', title: '13. Protocols for Medical Emergencies', desc: 'In the event of a severe illness or injury, students must immediately notify the block warden or utilize the 24/7 medical room located on the ground floor of Block A. The on-campus nurse will evaluate the situation and arrange for an ambulance to the partnered hospital if necessary.' },
  { id: 'h14', title: '14. Zero Tolerance Anti-Ragging Policy', desc: 'Ragging, bullying, hazing, or any form of physical or mental harassment is a severe criminal offense under state law. Perpetrators of such acts face immediate rustication from the college, permanent blacklisting, and a mandatory First Information Report (FIR) filed with the local police.' },
  { id: 'h15', title: '15. Room Key Security and Management', desc: 'Duplication of room keys by outside vendors is strictly forbidden and constitutes a major security breach. Lost keys must be reported to the Chief Warden desk immediately to arrange for a full lock replacement at the student\'s expense.' },
  { id: 'h16', title: '16. Safekeeping of Personal Valuables', desc: 'Students are solely responsible for the safety of their laptops, cash, jewelry, and other high-value items. Always double-lock your room and cupboards when stepping out, even for a few minutes. The institution assumes no liability for stolen or misplaced personal property.' },
  { id: 'h17', title: '17. Birthday Celebrations and Gatherings', desc: 'Birthday celebrations are permitted only in the designated common rooms and must conclude strictly by 11:30 PM. Smearing cake on walls, using party poppers that leave permanent stains, or causing property damage will result in heavy fines for the entire organizing group.' },
  { id: 'h18', title: '18. E-Commerce Deliveries & Parcels', desc: 'All e-commerce packages, mail, and food deliveries must be collected directly from the designated parcel drop-off zone at the main security gate before 8:00 PM. Delivery personnel are not allowed past the main gate under any circumstances.' },
  { id: 'h19', title: '19. Mandatory Resource Conservation', desc: 'As part of our green campus initiative, students must switch off all lights, fans, and electronics when leaving their room. Any leaking taps or running toilets must be reported to the maintenance desk via the Support Hub immediately to prevent water wastage.' },
  { id: 'h20', title: '20. Mandatory Fire Evacuation Drills', desc: 'Mandatory participation is required for all emergency fire drills conducted each semester. When the alarm sounds, students must leave all belongings, exit via the marked stairwells (do not use elevators), and assemble at the designated safe zone on the main sports ground.' }
];

let mockWardenDirectory = [
  { id: 'w1', role: 'Chief Authority', name: 'Dr. Anil jain Sharma', location: 'Main Campus Office', phone: '+91 98765 43210', email: 'warden.chief@college.edu', color: 'primary', initials: 'AJ' },
  { id: 'w2', role: 'Block A & B', name: 'Prof. Suresh Chandra', location: 'Ground Floor, Block A', phone: '+91 91234 56789', email: 'warden.blockab@college.edu', color: 'secondary', initials: 'SC' },
  { id: 'w3', role: 'Block C & D', name: 'Prof. Mahendra Pal', location: 'First Floor, Block C', phone: '+91 99887 76655', email: 'warden.blockcd@college.edu', color: 'warning', initials: 'MP' }
];


let saveTimeout = null;

async function performSave() {
  try {
    const data = {
      mockStudents,
      mockParents,
      mockWardens,
      mockAdmins,
      mockLeaveRequests,
      mockGateLogs,
      mockNotifications,
      mockSettings,
      mockFeedback,
      mockSupportTickets,
      mockPasswordHistory,
      mockActivityLogs,
      mockQRPasses,
      mockHostels,
      mockRooms,
      mockProfileImages,
      mockRoles,
      mockPermissions,
      mockUserRoles,
      mockAttendance,
      mockEmergencyContacts,
      mockVisitors,
      mockRoomAllocations,
      mockAuditLogs,
      mockAnnouncements,
      mockPasswordResetOTP,
      mockPortalRules,
      mockHostelRules,
      mockWardenDirectory
    };
    await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('[LOCAL FILE DB] Persisted state successfully to config/db.json');
  } catch (error) {
    console.error('[LOCAL FILE DB] Error saving database file:', error.message);
  }
}

function saveToFile() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(performSave, 500);
}

function loadFromFile() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      if (data.mockStudents) mockStudents = data.mockStudents;
      if (data.mockParents) mockParents = data.mockParents;
      if (data.mockWardens) mockWardens = data.mockWardens;
      if (data.mockAdmins) mockAdmins = data.mockAdmins;
      if (data.mockLeaveRequests) mockLeaveRequests = data.mockLeaveRequests;
      if (data.mockGateLogs) mockGateLogs = data.mockGateLogs;
      if (data.mockNotifications) mockNotifications = data.mockNotifications;
      if (data.mockSettings) mockSettings = data.mockSettings;
      if (data.mockFeedback) mockFeedback = data.mockFeedback;
      if (data.mockSupportTickets) mockSupportTickets = data.mockSupportTickets;
      if (data.mockPasswordHistory) mockPasswordHistory = data.mockPasswordHistory;
      if (data.mockActivityLogs) mockActivityLogs = data.mockActivityLogs;
      if (data.mockQRPasses) mockQRPasses = data.mockQRPasses;
      if (data.mockHostels) mockHostels = data.mockHostels;
      if (data.mockRooms) mockRooms = data.mockRooms;
      if (data.mockProfileImages) mockProfileImages = data.mockProfileImages;
      if (data.mockRoles) mockRoles = data.mockRoles;
      if (data.mockPermissions) mockPermissions = data.mockPermissions;
      if (data.mockUserRoles) mockUserRoles = data.mockUserRoles;
      if (data.mockAttendance) mockAttendance = data.mockAttendance;
      if (data.mockEmergencyContacts) mockEmergencyContacts = data.mockEmergencyContacts;
      if (data.mockVisitors) mockVisitors = data.mockVisitors;
      if (data.mockRoomAllocations) mockRoomAllocations = data.mockRoomAllocations;
      if (data.mockAuditLogs) mockAuditLogs = data.mockAuditLogs;
      if (data.mockAnnouncements) mockAnnouncements = data.mockAnnouncements;
      if (data.mockPasswordResetOTP) mockPasswordResetOTP = data.mockPasswordResetOTP;
      if (data.mockPortalRules) mockPortalRules = data.mockPortalRules;
      if (data.mockHostelRules) mockHostelRules = data.mockHostelRules;
      if (data.mockWardenDirectory) mockWardenDirectory = data.mockWardenDirectory;
      console.log('[LOCAL FILE DB] Loaded persistent database from config/db.json');
    } else {
      saveToFile();
    }
  } catch (error) {
    console.error('[LOCAL FILE DB] Error loading database file:', error.message);
  }
}

async function initializeDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('⚠️ WARNING: DATABASE_URL not set in environment.');
    console.log('🔄 Bypassing to fully persistent LOCAL FILE database mode (db.json).');
    loadFromFile();
    return;
  }

  try {
    console.log('Connecting to PostgreSQL server...');
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database pool.');
    client.release();

    await createTables();
  } catch (error) {
    console.error('PostgreSQL Connection/Initialization Error:', error.message);
    console.log('🔄 Bypassing to fully persistent LOCAL FILE database mode (db.json).');
    pool = null;
    loadFromFile();
  }
}

async function createTables() {
  const queries = [
    // 1. Students Table (Expanded)
    `CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      hostelRoom VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      course VARCHAR(255) DEFAULT '',
      year VARCHAR(50) DEFAULT '',
      profileImage TEXT DEFAULT NULL,
      coverImage TEXT DEFAULT NULL,
      isVerified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 2. Parents Table (Expanded)
    `CREATE TABLE IF NOT EXISTS Parents (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      studentId INT DEFAULT NULL,
      profileImage TEXT DEFAULT NULL,
      isVerified BOOLEAN DEFAULT FALSE
    );`,

    // 3. Wardens Table (Expanded)
    `CREATE TABLE IF NOT EXISTS Wardens (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) DEFAULT '',
      hostelAssigned VARCHAR(255) DEFAULT '',
      shift VARCHAR(100) DEFAULT '',
      profileImage TEXT DEFAULT NULL,
      isVerified BOOLEAN DEFAULT FALSE
    );`,

    // 4. Admins Table (New)
    `CREATE TABLE IF NOT EXISTS Admins (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      isVerified BOOLEAN DEFAULT FALSE
    );`,

    // 5. LeaveRequests Table (Expanded)
    `CREATE TABLE IF NOT EXISTS LeaveRequests (
      id SERIAL PRIMARY KEY,
      studentId INT NOT NULL,
      reason TEXT NOT NULL,
      fromDate DATE NOT NULL,
      toDate DATE NOT NULL,
      destination VARCHAR(255) NOT NULL,
      parentPhone VARCHAR(20) NOT NULL,
      expectedTimeOut TIME DEFAULT NULL,
      expectedTimeIn TIME DEFAULT NULL,
      actualTimeOut TIMESTAMP DEFAULT NULL,
      actualTimeIn TIMESTAMP DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      parentStatus VARCHAR(50) DEFAULT 'Pending',
      wardenStatus VARCHAR(50) DEFAULT 'Pending',
      finalStatus VARCHAR(50) DEFAULT 'Pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    );`,

    // 6. GateLogs Table
    `CREATE TABLE IF NOT EXISTS GateLogs (
      id SERIAL PRIMARY KEY,
      studentId INT NOT NULL,
      leaveId INT NOT NULL,
      exitTime TIMESTAMP NULL DEFAULT NULL,
      entryTime TIMESTAMP NULL DEFAULT NULL,
      status VARCHAR(50) NOT NULL,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (leaveId) REFERENCES LeaveRequests(id) ON DELETE CASCADE
    );`,

    // 7. Notifications Table (New)
    `CREATE TABLE IF NOT EXISTS Notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      role VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'Unread',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 8. Settings Table (New)
    `CREATE TABLE IF NOT EXISTS Settings (
      id SERIAL PRIMARY KEY,
      universityName VARCHAR(255) NOT NULL,
      hostelName VARCHAR(255) NOT NULL,
      contactEmail VARCHAR(255) NOT NULL,
      contactPhone VARCHAR(50) NOT NULL
    );`,

    // 9. Feedback Table (New)
    `CREATE TABLE IF NOT EXISTS Feedback (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 10. SupportTickets Table (New)
    `CREATE TABLE IF NOT EXISTS SupportTickets (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      subject VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 11. ActivityLogs Table
    `CREATE TABLE IF NOT EXISTS ActivityLogs (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      role VARCHAR(50) NOT NULL,
      activity TEXT NOT NULL,
      ipAddress VARCHAR(50),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 12. PasswordHistory Table
    `CREATE TABLE IF NOT EXISTS PasswordHistory (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      role VARCHAR(50) NOT NULL,
      hashedPassword VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 13. QRPasses Table
    `CREATE TABLE IF NOT EXISTS QRPasses (
      id SERIAL PRIMARY KEY,
      leaveId INT NOT NULL,
      qrCode TEXT NOT NULL,
      generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expiryDate TIMESTAMP NULL DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'Active'
    );`,

    // 14. Hostels Table
    `CREATE TABLE IF NOT EXISTS Hostels (
      id SERIAL PRIMARY KEY,
      hostelName VARCHAR(255) NOT NULL,
      capacity INT DEFAULT 0,
      occupiedRooms INT DEFAULT 0,
      wardenId INT DEFAULT NULL
    );`,

    // 15. Rooms Table
    `CREATE TABLE IF NOT EXISTS Rooms (
      id SERIAL PRIMARY KEY,
      roomNumber VARCHAR(50) NOT NULL,
      hostelId INT NOT NULL,
      capacity INT DEFAULT 1,
      occupied INT DEFAULT 0,
      FOREIGN KEY (hostelId) REFERENCES Hostels(id) ON DELETE CASCADE
    );`,

    // Screens 41-48 Tables
    `CREATE TABLE IF NOT EXISTS Roles (
      id SERIAL PRIMARY KEY,
      roleName VARCHAR(50) NOT NULL UNIQUE,
      permissions TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS Attendance (
      id SERIAL PRIMARY KEY,
      studentId INT NOT NULL,
      checkInTime TIMESTAMP,
      checkOutTime TIMESTAMP,
      date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Present'
    );`,

    `CREATE TABLE IF NOT EXISTS EmergencyContacts (
      id SERIAL PRIMARY KEY,
      studentId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      relation VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS Visitors (
      id SERIAL PRIMARY KEY,
      visitorName VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      studentId INT NOT NULL,
      purpose TEXT NOT NULL,
      visitDate DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending'
    );`,

    `CREATE TABLE IF NOT EXISTS RoomAllocations (
      id SERIAL PRIMARY KEY,
      studentId INT NOT NULL,
      roomId INT NOT NULL,
      allocationDate DATE NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS AuditLogs (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      action VARCHAR(255) NOT NULL,
      module VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS Announcements (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      priority VARCHAR(50) DEFAULT 'Normal',
      postedBy VARCHAR(100) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 16. EmailVerification
    `CREATE TABLE IF NOT EXISTS EmailVerification (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      role VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      isVerified BOOLEAN DEFAULT FALSE,
      expiresAt TIMESTAMP NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 17. PasswordResetOTP
    `CREATE TABLE IF NOT EXISTS PasswordResetOTP (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expiresAt TIMESTAMP NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 18. LoginHistory
    `CREATE TABLE IF NOT EXISTS LoginHistory (
      id SERIAL PRIMARY KEY,
      userId INT NOT NULL,
      role VARCHAR(50) NOT NULL,
      loginTime TIMESTAMP NOT NULL,
      ipAddress VARCHAR(50),
      device VARCHAR(255),
      browser VARCHAR(255),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // 19. Policies
    `CREATE TABLE IF NOT EXISTS Policies (
      id VARCHAR(50) PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL
    );`,

    // 20. WardenDirectoryCards
    `CREATE TABLE IF NOT EXISTS WardenDirectoryCards (
      id VARCHAR(50) PRIMARY KEY,
      role VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      color VARCHAR(50) NOT NULL,
      initials VARCHAR(10) NOT NULL
    );`
  ];

  try {
    const client = await pool.connect();
    console.log('Verifying and creating all PostgreSQL tables...');
    for (const q of queries) {
      await client.query(q);
    }

    // Safely add any new columns to students table in case it was created earlier without them
    try {
      console.log('Applying any missing schema updates to students table...');
      await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS hostelRoom VARCHAR(50)');
      await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS profileImage TEXT');
      await client.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS coverImage TEXT');
    } catch (alterErr) {
      console.error('Minor schema update error (safe to ignore if columns exist):', alterErr.message);
    }

    // Seed default Student if empty
    const { rows: students } = await client.query('SELECT id FROM students LIMIT 1');
    if (students.length === 0) {
      console.log('Seeding default student to PostgreSQL...');
      await client.query(
        'INSERT INTO students (name, email, password, hostelRoom, phone, course, year, isVerified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        ['Piyush jain', 'student@college.edu', bcrypt.hashSync('password123', 10), 'B-Block 402', '9876543210', 'B.Tech Computer Science', '3rd Year', true]
      );
    }

    // Seed default Parent if empty
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
        { id: 'p3', title: '3. Maintaining Profile Accuracy', desc: 'It is the student\'s responsibility to keep their emergency contact numbers, blood group, and allocated room details updated in the Profile section. Outpass applications may be automatically rejected by the system if the profile data is found to be incomplete or mismatched.' },
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
        { id: 'h6', title: '6. Room Cleanliness and Maintenance', desc: 'Students are held responsible for the daily tidiness and hygiene of their allocated rooms. Surprise inspections are conducted weekly by the block wardens. Rooms found with accumulated garbage, unhygienic conditions, or damaged furniture will result in maintenance fines levied equally among the room\'s occupants.' },
        { id: 'h7', title: '7. Prohibition of Heavy Electrical Appliances', desc: 'To prevent severe fire hazards and power tripping, heavy electrical appliances such as induction stoves, room heaters, electric kettles, and irons are strictly prohibited in student rooms. Only laptops, mobile chargers, and small table lamps are permitted. Confiscated items will not be returned until the end of the semester.' }
      ];
      for (const p of hostelPolicies) {
        await client.query('INSERT INTO Policies (id, type, title, description) VALUES ($1, $2, $3, $4)', [p.id, 'hostel', p.title, p.desc]);
      }
    }

    client.release();
    console.log('Database tables verified and seeded successfully.');
  } catch (error) {
    console.error('Error creating database tables:', error.message);
    throw error;
  }
}

// In-Memory Query Router & Matcher (Upgraded for Screens 11 to 20 CRUDs)
async function query(sql, params = []) {
  if (pool) {
    let pgSql = sql;

    // Convert MySQL backticks to double quotes
    pgSql = pgSql.replace(/`/g, '"');

    // Convert ? to $1, $2 etc.
    let i = 1;
    pgSql = pgSql.replace(/\?/g, () => '$' + (i++));

    // Automatically append RETURNING id for INSERT queries if not present
    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql += ' RETURNING id';
    }

    try {
      const res = await pool.query(pgSql, params);
      if (isInsert) {
        return {
          insertId: res.rows && res.rows[0] ? res.rows[0].id : null,
          affectedRows: res.rowCount
        };
      }

      const isUpdateOrDelete = pgSql.trim().toUpperCase().startsWith('UPDATE') || pgSql.trim().toUpperCase().startsWith('DELETE');
      if (isUpdateOrDelete) {
        return { affectedRows: res.rowCount };
      }

      return res.rows;
    } catch (e) {
      console.error('[DB ERROR] Query:', pgSql, 'Params:', params, 'Error:', e.message);
      throw e;
    }
  }

  const normalized = sql.trim().replace(/\s+/g, ' ').toLowerCase();
  console.log(`[MOCK DB] Executing Query: "${sql.trim().replace(/\s+/g, ' ')}" with`, params);

  // Auto-persist file database on write operations
  const isWrite = normalized.startsWith('insert') || normalized.startsWith('update') || normalized.startsWith('delete');
  if (isWrite) {
    setTimeout(saveToFile, 10);
  }

  // Helper to map camelCase LeaveRequests to snake_case leave_requests properties
  const mapLeaveForOldClient = (l) => ({
    ...l,
    student_id: l.studentId,
    startDate: l.fromDate,
    endDate: l.toDate,
    created_at: l.createdAt
  });

  // ==========================================

  // ==========================================
  // PUBLIC CONTENT MATCHERS
  // ==========================================
  if (normalized.includes('select * from policies where type = ?')) {
    const type = params[0];
    if (type === 'portal') return mockPortalRules;
    if (type === 'hostel') return mockHostelRules;
    return [];
  }

  if (normalized.includes('select * from wardendirectorycards')) {
    return mockWardenDirectory;
  }

  if (normalized.startsWith('delete from policies where type = ?')) {
    const type = params[0];
    if (type === 'portal') mockPortalRules = [];
    if (type === 'hostel') mockHostelRules = [];
    saveToFile();
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('insert into policies')) {
    const [id, type, title, desc] = params;
    const rule = { id, title, desc }; // Map DB column to mock state prop
    if (type === 'portal') mockPortalRules.push({ id, title, desc });
    if (type === 'hostel') mockHostelRules.push({ id, title, desc });
    saveToFile();
    return { insertId: id };
  }

  if (normalized.startsWith('delete from wardendirectorycards')) {
    mockWardenDirectory = [];
    saveToFile();
    return { affectedRows: 1 };
  }

  if (normalized.startsWith('insert into wardendirectorycards')) {
    const [id, role, name, location, phone, email, color, initials] = params;
    mockWardenDirectory.push({ id, role, name, location, phone, email, color, initials });
    saveToFile();
    return { insertId: id };
  }

  // 1. ADMINS MATCHERS
  // ==========================================
  if (normalized.includes('from admins where email =')) {
    const email = params[0];
    const u = mockAdmins.find(x => x.email.toLowerCase() === email.toLowerCase());
    return u ? [u] : [];
  }
  if (normalized.startsWith('insert into admins')) {
    const [name, email, password] = params;
    const id = mockAdmins.length + 1;
    mockAdmins.push({ id, name, email, password });
    saveToFile();
    return { insertId: id };
  }
  if (normalized.includes('from admins where id =')) {
    const id = Number(params[0]);
    const u = mockAdmins.find(x => x.id === id);
    return u ? [u] : [];
  }

  // ==========================================
  // 2. SETTINGS MATCHERS
  // ==========================================
  if (normalized.includes('from settings')) {
    return mockSettings;
  }
  if (normalized.startsWith('update settings')) {
    const [uName, hName, email, phone, id] = params;
    const s = mockSettings.find(x => x.id === Number(id || 1));
    if (s) {
      s.universityName = uName;
      s.hostelName = hName;
      s.contactEmail = email;
      s.contactPhone = phone;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // ==========================================
  // 3. NOTIFICATIONS MATCHERS
  // ==========================================
  if (normalized.startsWith('select') && normalized.includes('from notifications')) {
    return mockNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (normalized.startsWith('insert into notifications')) {
    const [title, message, role] = params;
    const id = mockNotifications.length + 1;
    mockNotifications.push({ id, title, message, role, status: 'Unread', createdAt: new Date() });
    saveToFile();
    return { insertId: id };
  }
  if (normalized.startsWith('delete from notifications')) {
    const id = Number(params[0]);
    const idx = mockNotifications.findIndex(x => x.id === id);
    if (idx !== -1) {
      mockNotifications.splice(idx, 1);
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('update notifications set status =')) {
    const [status, id] = params;
    const n = mockNotifications.find(x => x.id === Number(id));
    if (n) {
      n.status = status;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // ==========================================
  // 4. STUDENTS CRUD MATCHERS
  // ==========================================
  if (normalized.includes('from students where email =')) {
    const email = params[0];
    const u = mockStudents.find(x => x.email.toLowerCase() === email.toLowerCase());
    return u ? [u] : [];
  }
  if (normalized.startsWith('insert into students')) {
    // Standard signature: name, email, password, hostelroom, phone, course, year
    const [name, email, password, hostelRoom, phone, course, year] = params;
    const id = mockStudents.length + 1;
    mockStudents.push({
      id,
      name,
      email,
      password,
      hostelRoom,
      phone: phone || '',
      course: course || '',
      year: year || '',
      created_at: new Date()
    });
    saveToFile();
    return { insertId: id };
  }
  if (normalized.startsWith('update students set name =') && normalized.includes('coverimage =')) {
    const [name, email, phone, course, year, hostelRoom, profileImage, coverImage, id] = params;
    const s = mockStudents.find(x => x.id === Number(id));
    if (s) {
      s.name = name;
      s.email = email;
      s.phone = phone;
      s.course = course;
      s.year = year;
      s.hostelRoom = hostelRoom;
      s.profileImage = profileImage;
      s.coverImage = coverImage;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('update students set name =') && normalized.includes('profileimage =') && !normalized.includes('coverimage =')) {
    const [name, email, phone, course, year, hostelRoom, profileImage, id] = params;
    const s = mockStudents.find(x => x.id === Number(id));
    if (s) {
      s.name = name;
      s.email = email;
      s.phone = phone;
      s.course = course;
      s.year = year;
      s.hostelRoom = hostelRoom;
      s.profileImage = profileImage;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('update students set name =')) {
    const [name, email, phone, course, year, hostelRoom, id] = params;
    const s = mockStudents.find(x => x.id === Number(id));
    if (s) {
      s.name = name;
      s.email = email;
      s.phone = phone;
      s.course = course;
      s.year = year;
      s.hostelRoom = hostelRoom;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('delete from students')) {
    const id = Number(params[0]);
    const idx = mockStudents.findIndex(x => x.id === id);
    if (idx !== -1) {
      mockStudents.splice(idx, 1);
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.includes('from students where id =')) {
    const id = Number(params[0]);
    const u = mockStudents.find(x => x.id === id);
    return u ? [u] : [];
  }
  if (normalized.includes('select id, name, hostelroom from students') || normalized === 'select * from students' || normalized.includes('select id, name from students')) {
    return mockStudents;
  }
  if (normalized.includes('select count(*) as count from students')) {
    return [{ count: mockStudents.length }];
  }

  // ==========================================
  // 5. WARDENS CRUD MATCHERS
  // ==========================================
  if (normalized.includes('from wardens where email =')) {
    const email = params[0];
    const u = mockWardens.find(x => x.email.toLowerCase() === email.toLowerCase());
    return u ? [u] : [];
  }
  if (normalized.startsWith('insert into wardens')) {
    const [name, email, password, phone, hostelAssigned, shift] = params;
    const id = mockWardens.length + 1;
    mockWardens.push({
      id,
      name,
      email,
      password,
      phone: phone || '',
      hostelAssigned: hostelAssigned || '',
      shift: shift || ''
    });
    saveToFile();
    return { insertId: id };
  }
  if (normalized.startsWith('update wardens set name =') && normalized.includes('profileimage =')) {
    const [name, email, phone, hostelAssigned, shift, profileImage, id] = params;
    const w = mockWardens.find(x => x.id === Number(id));
    if (w) {
      w.name = name;
      w.email = email;
      w.phone = phone;
      w.hostelAssigned = hostelAssigned;
      w.shift = shift;
      w.profileImage = profileImage;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('update wardens set name =')) {
    const [name, email, phone, hostelAssigned, shift, id] = params;
    const w = mockWardens.find(x => x.id === Number(id));
    if (w) {
      w.name = name;
      w.email = email;
      w.phone = phone;
      w.hostelAssigned = hostelAssigned;
      w.shift = shift;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('delete from wardens')) {
    const id = Number(params[0]);
    const idx = mockWardens.findIndex(x => x.id === id);
    if (idx !== -1) {
      mockWardens.splice(idx, 1);
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.includes('from wardens where id =')) {
    const id = Number(params[0]);
    const u = mockWardens.find(x => x.id === id);
    return u ? [u] : [];
  }
  if (normalized === 'select * from wardens') {
    return mockWardens;
  }

  // ==========================================
  // 6. PARENTS CRUD MATCHERS
  // ==========================================
  if (normalized.includes('from parents where email =')) {
    const email = params[0];
    const u = mockParents.find(x => x.email.toLowerCase() === email.toLowerCase());
    return u ? [u] : [];
  }
  if (normalized.startsWith('insert into parents')) {
    const [name, email, password, phone, studentId] = params;
    const id = mockParents.length + 1;
    mockParents.push({
      id,
      name,
      email,
      password,
      phone: phone || '',
      studentId: studentId ? Number(studentId) : null
    });
    saveToFile();
    return { insertId: id };
  }
  if (normalized.startsWith('update parents set name =') && normalized.includes('profileimage =')) {
    const [name, email, phone, profileImage, id] = params;
    const p = mockParents.find(x => x.id === Number(id));
    if (p) {
      p.name = name;
      p.email = email;
      p.phone = phone;
      p.profileImage = profileImage;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('update parents set name =')) {
    const [name, email, phone, studentId, id] = params;
    const p = mockParents.find(x => x.id === Number(id));
    if (p) {
      p.name = name;
      p.email = email;
      p.phone = phone;
      p.studentId = studentId ? Number(studentId) : null;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('delete from parents')) {
    const id = Number(params[0]);
    const idx = mockParents.findIndex(x => x.id === id);
    if (idx !== -1) {
      mockParents.splice(idx, 1);
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }
  if (normalized.includes('from parents where id =')) {
    const id = Number(params[0]);
    const u = mockParents.find(x => x.id === id);
    return u ? [u] : [];
  }
  if (normalized.includes('from parents where studentid =')) {
    const studentId = Number(params[0]);
    const p = mockParents.filter(x => x.studentId === studentId);
    return p;
  }
  if (normalized === 'select * from parents') {
    return mockParents;
  }

  // ==========================================
  // 7. LEAVE REQUESTS CORE MATCHERS
  // ==========================================
  if (normalized.startsWith('insert into leaverequests')) {
    const [studentId, reason, fromDate, toDate, destination, parentPhone, expectedTimeOut, expectedTimeIn] = params;
    const id = mockLeaveRequests.length + 101;
    const newLeave = {
      id,
      studentId: Number(studentId),
      reason,
      fromDate,
      toDate,
      destination,
      parentPhone,
      expectedTimeOut: expectedTimeOut || null,
      expectedTimeIn: expectedTimeIn || null,
      status: 'Pending',
      parentStatus: 'Pending',
      wardenStatus: 'Pending',
      finalStatus: 'Pending',
      createdAt: new Date()
    };
    mockLeaveRequests.push(newLeave);
    saveToFile();
    return { insertId: id };
  }

  if (normalized.startsWith('insert into leave_requests')) {
    const [student_id, reason, startDate, endDate] = params;
    const id = mockLeaveRequests.length + 101;
    const newLeave = {
      id,
      studentId: Number(student_id),
      reason,
      fromDate: startDate,
      toDate: endDate,
      destination: 'Home Town',
      parentPhone: '9876543210',
      status: 'Pending',
      parentStatus: 'Pending',
      wardenStatus: 'Pending',
      finalStatus: 'Pending',
      createdAt: new Date()
    };
    mockLeaveRequests.push(newLeave);
    saveToFile();
    return { insertId: id };
  }

  if (normalized.includes('select count(*) as count from leave_requests')) {
    const studentId = Number(params[0]);
    let filtered = mockLeaveRequests.filter(x => x.studentId === studentId);
    if (normalized.includes('status = "approved"')) {
      filtered = filtered.filter(x => x.status === 'Approved');
    } else if (normalized.includes('status = "pending"')) {
      filtered = filtered.filter(x => x.status === 'Pending');
    }
    return [{ count: filtered.length }];
  }

  if (normalized.includes('from leave_requests where student_id =')) {
    const studentId = Number(params[0]);
    let leaves = mockLeaveRequests.filter(x => x.studentId === studentId);
    if (normalized.includes('order by created_at desc')) {
      leaves = [...leaves].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (normalized.includes('limit 5')) {
      leaves = leaves.slice(0, 5);
    }
    return leaves.map(mapLeaveForOldClient);
  }

  // Parent pending/history: WHERE studentId = ? AND status = ? (with student JOIN)
  if (normalized.startsWith('select') && normalized.includes('from leaverequests') && normalized.includes('studentid =') && normalized.includes('status =')) {
    const studentId = Number(params[0]);
    const status = params[1];
    const studentRecord = mockStudents.find(s => s.id === studentId);
    const studentName = studentRecord ? studentRecord.name : 'Unknown';
    return mockLeaveRequests
      .filter(x => x.studentId === studentId && x.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(x => ({ ...x, studentName }));
  }

  // Parent history (all leaves for student, no status filter)
  if (normalized.startsWith('select') && normalized.includes('from leaverequests') && normalized.includes('studentid =') && !normalized.includes('status =')) {
    const studentId = Number(params[0]);
    const studentRecord = mockStudents.find(s => s.id === studentId);
    const studentName = studentRecord ? studentRecord.name : 'Unknown';
    return mockLeaveRequests
      .filter(x => x.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(x => ({ ...x, studentName }));
  }

  if (normalized.startsWith('select') && normalized.includes('from leaverequests where id =')) {
    const id = Number(params[0]);
    const l = mockLeaveRequests.find(x => x.id === id);
    return l ? [l] : [];
  }

  if (normalized.startsWith('select') && normalized.includes('from leaverequests where status =')) {
    const status = params[0];
    return mockLeaveRequests
      .filter(x => x.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (normalized.startsWith('update leaverequests set parentstatus =')) {
    const [pStatus, wStatus, fStatus, status, id] = params;
    const l = mockLeaveRequests.find(x => x.id === Number(id));
    if (l) {
      l.parentStatus = pStatus;
      l.wardenStatus = wStatus;
      l.finalStatus = fStatus;
      l.status = status;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.startsWith('update leaverequests set status =')) {
    // approve: params = [status, parentStatus, id]
    // reject:  params = [status, parentStatus, finalStatus, id]
    let status, parentStatus, finalStatus, id;
    if (params.length === 4) {
      // reject: (status, parentStatus, finalStatus, id)
      [status, parentStatus, finalStatus, id] = params;
    } else {
      // approve: (status, parentStatus, id)
      [status, parentStatus, id] = params;
      finalStatus = status;
    }
    const l = mockLeaveRequests.find(x => x.id === Number(id));
    if (l) {
      l.status = status;
      l.parentStatus = parentStatus || status;
      l.finalStatus = finalStatus || status;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.startsWith('delete from leaverequests')) {
    const id = Number(params[0]);
    const idx = mockLeaveRequests.findIndex(x => x.id === id);
    if (idx !== -1) {
      mockLeaveRequests.splice(idx, 1);
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.startsWith('select') && normalized.includes('from leaverequests')) {
    return mockLeaveRequests;
  }

  // ==========================================
  // 8. GATE LOGS & SCRIPTS
  // ==========================================
  if (normalized.startsWith('insert into gatelogs')) {
    const [studentId, leaveId, exitTime, entryTime, status] = params;
    const id = mockGateLogs.length + 1;
    const newLog = {
      id,
      studentId: Number(studentId),
      leaveId: Number(leaveId),
      exitTime: exitTime || new Date(),
      entryTime: entryTime || null,
      status
    };
    mockGateLogs.push(newLog);
    saveToFile();
    return { insertId: id };
  }

  if (normalized.startsWith('update gatelogs set entrytime =')) {
    const [entryTime, status, leaveId] = params;
    const log = mockGateLogs.find(x => x.leaveId === Number(leaveId));
    if (log) {
      log.entryTime = entryTime || new Date();
      log.status = status;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.includes('from gatelogs')) {
    return mockGateLogs;
  }

  // ==========================================
  // 9. NEW USER PROFILE & PASSWORD MATCHERS
  // ==========================================


  if (normalized.startsWith('update students set password =')) {
    const [password, id] = params;
    const s = mockStudents.find(x => x.id === Number(id));
    if (s) {
      s.password = password;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.startsWith('update parents set password =')) {
    const [password, id] = params;
    const p = mockParents.find(x => x.id === Number(id));
    if (p) {
      p.password = password;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.startsWith('update wardens set password =')) {
    const [password, id] = params;
    const w = mockWardens.find(x => x.id === Number(id));
    if (w) {
      w.password = password;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // ==========================================
  // 10. NEW FEEDBACK MATCHERS
  // ==========================================
  if (normalized.startsWith('insert into feedback')) {
    const [userId, subject, description, category, status] = params;
    const id = mockFeedback.length + 1;
    const newFb = {
      id,
      userId: Number(userId),
      subject,
      description,
      category,
      status: status || 'Pending',
      createdAt: new Date()
    };
    mockFeedback.push(newFb);
    saveToFile();
    return { insertId: id };
  }

  if (normalized.includes('from feedback where userid =')) {
    const userId = Number(params[0]);
    return mockFeedback.filter(x => x.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (normalized.includes('from feedback')) {
    return mockFeedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (normalized.startsWith('update feedback set status =')) {
    const [status, id] = params;
    const fb = mockFeedback.find(x => x.id === Number(id));
    if (fb) {
      fb.status = status;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // ==========================================
  // 11. NEW SUPPORT TICKETS MATCHERS
  // ==========================================
  if (normalized.startsWith('insert into supporttickets')) {
    const [userId, subject, description, status] = params;
    const id = mockSupportTickets.length + 1;
    const newSt = {
      id,
      userId: Number(userId),
      subject,
      description,
      status: status || 'Pending',
      createdAt: new Date()
    };
    mockSupportTickets.push(newSt);
    saveToFile();
    return { insertId: id };
  }

  if (normalized.includes('from supporttickets where userid =')) {
    const userId = Number(params[0]);
    return mockSupportTickets.filter(x => x.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (normalized.includes('from supporttickets')) {
    return mockSupportTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // ==========================================
  // 12. ADVANCED SCREENS MATCHERS
  // ==========================================
  if (normalized.startsWith('insert into activitylogs')) {
    const [userId, role, activity, ipAddress] = params;
    const id = mockActivityLogs.length + 1;
    mockActivityLogs.push({ id, userId: Number(userId), role, activity, ipAddress, createdAt: new Date() });
    saveToFile();
    return { insertId: id };
  }

  if (normalized.includes('from activitylogs')) {
    let logs = mockActivityLogs;
    if (normalized.includes('where role =')) {
      logs = logs.filter(l => l.role.toLowerCase() === params[0].toLowerCase());
    }
    return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (normalized.startsWith('insert into passwordhistory')) {
    const [userId, role, hashedPassword] = params;
    const id = mockPasswordHistory.length + 1;
    mockPasswordHistory.push({ id, userId: Number(userId), role, hashedPassword, createdAt: new Date() });
    saveToFile();
    return { insertId: id };
  }

  if (normalized.includes('from passwordhistory where userid =') && normalized.includes('and role =')) {
    return mockPasswordHistory.filter(x => x.userId === Number(params[0]) && x.role === params[1])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (normalized.startsWith('insert into qrpasses')) {
    const [leaveId, qrCode, expiryDate] = params;
    const id = mockQRPasses.length + 1;
    mockQRPasses.push({ id, leaveId: Number(leaveId), qrCode, generatedAt: new Date(), expiryDate, status: 'Active' });
    saveToFile();
    return { insertId: id };
  }

  if (normalized.startsWith('update qrpasses set status =')) {
    const [status, id] = params;
    const q = mockQRPasses.find(x => x.id === Number(id));
    if (q) {
      q.status = status;
      saveToFile();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.includes('from qrpasses')) {
    return mockQRPasses.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  }

  if (normalized.includes('from hostels')) {
    if (normalized.includes('where id =')) {
      return mockHostels.filter(h => h.id === Number(params[0]));
    }
    return mockHostels;
  }

  if (normalized.startsWith('insert into hostels')) {
    const [hostelName, capacity, occupiedRooms, wardenId] = params;
    const id = mockHostels.length + 1;
    mockHostels.push({ id, hostelName, capacity, occupiedRooms, wardenId });
    saveToFile();
    return { insertId: id };
  }

  if (normalized.startsWith('update hostels set')) {
    const id = Number(params[params.length - 1]);
    const h = mockHostels.find(x => x.id === id);
    if (h) {
      h.hostelName = params[0]; h.capacity = params[1]; h.occupiedRooms = params[2]; h.wardenId = params[3];
      saveToFile(); return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.startsWith('delete from hostels')) {
    const id = Number(params[0]);
    const idx = mockHostels.findIndex(x => x.id === id);
    if (idx !== -1) { mockHostels.splice(idx, 1); saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }

  if (normalized.includes('from rooms')) {
    if (normalized.includes('where hostelid =')) {
      return mockRooms.filter(r => r.hostelId === Number(params[0]));
    }
    return mockRooms;
  }

  if (normalized.startsWith('insert into rooms')) {
    const [roomNumber, hostelId, capacity, occupied] = params;
    const id = mockRooms.length + 1;
    mockRooms.push({ id, roomNumber, hostelId: Number(hostelId), capacity, occupied });
    saveToFile(); return { insertId: id };
  }

  if (normalized.startsWith('update rooms set')) {
    const id = Number(params[params.length - 1]);
    const r = mockRooms.find(x => x.id === id);
    if (r) {
      r.roomNumber = params[0]; r.hostelId = Number(params[1]); r.capacity = params[2]; r.occupied = params[3];
      saveToFile(); return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (normalized.startsWith('delete from rooms')) {
    const id = Number(params[0]);
    const idx = mockRooms.findIndex(x => x.id === id);
    if (idx !== -1) { mockRooms.splice(idx, 1); saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }

  // --- SCREENS 41-48 MOCK QUERIES ---

  // Roles
  if (normalized.includes('from roles')) {
    if (normalized.includes('where id =')) return mockRoles.filter(r => r.id === Number(params[0]));
    return mockRoles;
  }
  if (normalized.startsWith('insert into roles')) {
    const id = mockRoles.length + 1;
    mockRoles.push({ id, roleName: params[0], permissions: params[1] });
    saveToFile(); return { insertId: id };
  }
  if (normalized.startsWith('update roles set')) {
    const id = Number(params[params.length - 1]);
    const r = mockRoles.find(x => x.id === id);
    if (r) { r.roleName = params[0]; r.permissions = params[1]; saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('delete from roles')) {
    const idx = mockRoles.findIndex(x => x.id === Number(params[0]));
    if (idx !== -1) { mockRoles.splice(idx, 1); saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }

  // Attendance
  if (normalized.includes('from attendance')) {
    let att = mockAttendance;
    if (normalized.includes('where studentid =')) att = att.filter(a => a.studentId === Number(params[0]));
    return att;
  }
  if (normalized.startsWith('insert into attendance')) {
    const id = mockAttendance.length + 1;
    mockAttendance.push({ id, studentId: Number(params[0]), checkInTime: params[1], checkOutTime: params[2], date: params[3], status: params[4] });
    saveToFile(); return { insertId: id };
  }

  // Emergency Contacts
  if (normalized.includes('from emergencycontacts')) {
    if (normalized.includes('where studentid =')) return mockEmergencyContacts.filter(e => e.studentId === Number(params[0]));
    return mockEmergencyContacts;
  }
  if (normalized.startsWith('insert into emergencycontacts')) {
    const id = mockEmergencyContacts.length + 1;
    mockEmergencyContacts.push({ id, studentId: Number(params[0]), name: params[1], relation: params[2], phone: params[3], address: params[4] });
    saveToFile(); return { insertId: id };
  }
  if (normalized.startsWith('update emergencycontacts set')) {
    const id = Number(params[params.length - 1]);
    const c = mockEmergencyContacts.find(x => x.id === id);
    if (c) { c.name = params[0]; c.relation = params[1]; c.phone = params[2]; c.address = params[3]; saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('delete from emergencycontacts')) {
    const idx = mockEmergencyContacts.findIndex(x => x.id === Number(params[0]));
    if (idx !== -1) { mockEmergencyContacts.splice(idx, 1); saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }

  // Visitors
  if (normalized.includes('from visitors')) {
    return mockVisitors;
  }
  if (normalized.startsWith('insert into visitors')) {
    const id = mockVisitors.length + 1;
    mockVisitors.push({ id, visitorName: params[0], phone: params[1], studentId: Number(params[2]), purpose: params[3], visitDate: params[4], status: params[5] });
    saveToFile(); return { insertId: id };
  }
  if (normalized.startsWith('update visitors set')) {
    const id = Number(params[params.length - 1]);
    const v = mockVisitors.find(x => x.id === id);
    if (v) { v.status = params[0]; saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('delete from visitors')) {
    const idx = mockVisitors.findIndex(x => x.id === Number(params[0]));
    if (idx !== -1) { mockVisitors.splice(idx, 1); saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }

  // Room Allocations
  if (normalized.includes('from roomallocations')) {
    return mockRoomAllocations;
  }
  if (normalized.startsWith('insert into roomallocations')) {
    const id = mockRoomAllocations.length + 1;
    mockRoomAllocations.push({ id, studentId: Number(params[0]), roomId: Number(params[1]), allocationDate: params[2] });
    saveToFile(); return { insertId: id };
  }
  if (normalized.startsWith('update roomallocations set')) {
    const id = Number(params[params.length - 1]);
    const r = mockRoomAllocations.find(x => x.id === id);
    if (r) { r.roomId = Number(params[0]); saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }

  // Audit Logs
  if (normalized.includes('from auditlogs')) {
    return mockAuditLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  if (normalized.startsWith('insert into auditlogs')) {
    const id = mockAuditLogs.length + 1;
    mockAuditLogs.push({ id, userId: Number(params[0]), action: params[1], module: params[2], timestamp: new Date() });
    saveToFile(); return { insertId: id };
  }

  // Announcements
  if (normalized.includes('from announcements')) {
    return mockAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  if (normalized.startsWith('insert into announcements')) {
    const id = mockAnnouncements.length + 1;
    mockAnnouncements.push({ id, title: params[0], description: params[1], priority: params[2], postedBy: params[3], createdAt: new Date() });
    saveToFile(); return { insertId: id };
  }
  if (normalized.startsWith('update announcements set')) {
    const id = Number(params[params.length - 1]);
    const a = mockAnnouncements.find(x => x.id === id);
    if (a) { a.title = params[0]; a.description = params[1]; a.priority = params[2]; saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }
  if (normalized.startsWith('delete from announcements')) {
    const idx = mockAnnouncements.findIndex(x => x.id === Number(params[0]));
    if (idx !== -1) { mockAnnouncements.splice(idx, 1); saveToFile(); return { affectedRows: 1 }; }
    return { affectedRows: 0 };
  }

  // Custom Analytics Queries handled purely by returning mocked aggregations
  if (normalized.includes('select count(*) as active_leaves')) {
    return [{
      active_leaves: mockLeaveRequests.filter(l => l.status === 'Approved').length,
      returning_today: 0,
      overdue: 0
    }];
  }

  // PasswordResetOTP
  if (normalized.startsWith('insert into passwordresetotp')) {
    const id = mockPasswordResetOTP.length + 1;
    mockPasswordResetOTP.push({ id, email: params[0], role: params[1], otp: params[2], expiresAt: params[3] });
    saveToFile(); return { insertId: id };
  }
  if (normalized.includes('from passwordresetotp where email =')) {
    // Handle 'SELECT * FROM PasswordResetOTP WHERE email = ? AND role = ? AND otp = ? ORDER BY id DESC LIMIT 1'
    const p = mockPasswordResetOTP.find(x => x.email === params[0] && x.role === params[1] && x.otp === params[2]);
    return p ? [p] : [];
  }
  if (normalized.startsWith('delete from passwordresetotp')) {
    mockPasswordResetOTP = mockPasswordResetOTP.filter(x => !(x.email === params[0] && x.role === params[1]));
    saveToFile(); return { affectedRows: 1 };
  }

  console.warn(`[MOCK DB] Unhandled SQL Query matched: "${normalized}"`);
  return [];
}

module.exports = {
  initializeDatabase,
  query,
  getPool: () => pool,
  mockStudents,
  mockParents,
  mockWardens,
  mockAdmins,
  mockLeaveRequests,
  mockGateLogs,
  mockNotifications,
  mockSettings,
  mockFeedback,
  mockSupportTickets,
  mockPasswordHistory,
  mockActivityLogs,
  mockQRPasses,
  mockHostels,
  mockRooms,
  mockProfileImages,
  mockRoles,
  mockPermissions,
  mockUserRoles,
  mockAttendance,
  mockEmergencyContacts,
  mockVisitors,
  mockRoomAllocations,
  mockAuditLogs,
  mockAnnouncements,
  mockPasswordResetOTP
};
