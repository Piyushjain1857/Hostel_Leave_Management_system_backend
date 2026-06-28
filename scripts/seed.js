const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // load dotenv from parent directory if run from scripts folder

async function runSeed() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_leave_db'
  };

  console.log('Seeding Database...');
  console.log('Using config:', {
    host: connectionConfig.host,
    user: connectionConfig.user,
    database: connectionConfig.database
  });

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);

    // 1. Ensure students table exists
    const createStudentsTableQuery = `
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        hostelRoom VARCHAR(255) NOT NULL,
        isVerified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await connection.query(createStudentsTableQuery);

    // 2. Ensure leave_requests table exists
    const createLeaveRequestsTableQuery = `
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await connection.query(createLeaveRequestsTableQuery);

    // 3. Seed Default Student if not exists
    const seedEmail = 'student@college.edu';
    let [students] = await connection.query('SELECT id FROM students WHERE email = ?', [seedEmail]);
    let studentId;

    if (students.length > 0) {
      studentId = students[0].id;
      console.log(`✅ Default test student "${seedEmail}" already exists (ID: ${studentId}).`);
    } else {
      // Hash 'password123'
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Insert test student
      const [insertResult] = await connection.query(
        'INSERT INTO students (name, email, password, hostelRoom, isVerified) VALUES (?, ?, ?, ?, ?)',
        ['Piyush jain', seedEmail, hashedPassword, 'B-Block 402', true]
      );
      studentId = insertResult.insertId;
      console.log(`🎉 Student account created successfully! (ID: ${studentId})`);
    }

    // 4. Check if leave requests already exist for this student
    const [leaves] = await connection.query('SELECT id FROM leave_requests WHERE student_id = ?', [studentId]);
    if (leaves.length > 0) {
      console.log('✅ Mock leave requests already seeded for this student.');
    } else {
      console.log('Seeding mock leave requests...');

      const leavesToSeed = [
        {
          reason: 'Emergency visit to home town for family wedding function.',
          startDate: '2026-05-10',
          endDate: '2026-05-14',
          status: 'Approved'
        },
        {
          reason: 'Weekend outing to local guardian\'s house in metro city.',
          startDate: '2026-05-20',
          endDate: '2026-05-22',
          status: 'Approved'
        },
        {
          reason: 'Special dental appointment and treatment at university hospital.',
          startDate: '2026-05-28',
          endDate: '2026-05-28',
          status: 'Pending'
        },
        {
          reason: 'Attend national hackathon representing college coding club.',
          startDate: '2026-06-05',
          endDate: '2026-06-08',
          status: 'Pending'
        }
      ];

      for (const leave of leavesToSeed) {
        await connection.query(
          'INSERT INTO leave_requests (student_id, reason, startDate, endDate, status) VALUES (?, ?, ?, ?, ?)',
          [studentId, leave.reason, leave.startDate, leave.endDate, leave.status]
        );
      }
      console.log('🎉 Successfully seeded mock leave requests!');
    }

    console.log('----------------------------------------------------');
    console.log(`Email:    ${seedEmail}`);
    console.log('Password: password123');
    console.log('Room:     B-Block 402');
    console.log('Status:   Seeded with 4 leave requests (2 Approved, 2 Pending)');
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.warn('\nMake sure your MySQL database is running and credentials in backend/.env are correct.');
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

runSeed();
