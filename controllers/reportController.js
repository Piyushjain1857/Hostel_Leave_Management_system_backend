const db = require('../config/db');

/**
 * @desc    Get leave report statistics
 * @route   GET /reports/leaves
 */
const getLeaveReport = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM LeaveRequests');
    const students = await db.query('SELECT id, name, hostelRoom, course FROM students');

    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s; });

    const report = leaves.map(l => {
      const student = studentMap[l.studentId] || {};
      return {
        leaveId: l.id,
        studentName: student.name || 'Unknown',
        hostelRoom: student.hostelRoom || 'Unknown',
        course: student.course || 'Unknown',
        fromDate: l.fromDate,
        toDate: l.toDate,
        reason: l.reason,
        destination: l.destination,
        parentStatus: l.parentStatus,
        wardenStatus: l.wardenStatus,
        finalStatus: l.finalStatus,
        status: l.status,
        createdAt: l.createdAt
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Leave Report Error:', error.message);
    res.status(500).json({ message: 'Error generating leave reports.' });
  }
};

/**
 * @desc    Get student database reports
 * @route   GET /reports/students
 */
const getStudentReport = async (req, res) => {
  try {
    const students = await db.query('SELECT id, name, email, phone, hostelRoom, course, year, created_at FROM students');
    const leaves = await db.query('SELECT id, studentId, status FROM LeaveRequests');

    // Calculate total leaves applied per student
    const studentLeaves = {};
    leaves.forEach(l => {
      if (!studentLeaves[l.studentId]) {
        studentLeaves[l.studentId] = { total: 0, approved: 0 };
      }
      studentLeaves[l.studentId].total++;
      if (l.status === 'Approved' || l.status === 'Completed') {
        studentLeaves[l.studentId].approved++;
      }
    });

    const report = students.map(s => ({
      ...s,
      totalLeaves: studentLeaves[s.id]?.total || 0,
      approvedLeaves: studentLeaves[s.id]?.approved || 0
    }));

    res.json(report);
  } catch (error) {
    console.error('Student Report Error:', error.message);
    res.status(500).json({ message: 'Error generating student reports.' });
  }
};

/**
 * @desc    Get student movement logs (GateLogs) report
 * @route   GET /reports/movement
 */
const getMovementReport = async (req, res) => {
  try {
    const logs = await db.query('SELECT * FROM GateLogs');
    const students = await db.query('SELECT id, name, hostelRoom FROM students');
    const leaves = await db.query('SELECT id, destination, reason FROM LeaveRequests');

    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s; });

    const leaveMap = {};
    leaves.forEach(l => { leaveMap[l.id] = l; });

    const report = logs.map(g => {
      const student = studentMap[g.studentId] || {};
      const leave = leaveMap[g.leaveId] || {};
      return {
        logId: g.id,
        studentName: student.name || 'Unknown',
        hostelRoom: student.hostelRoom || 'Unknown',
        leaveId: g.leaveId,
        destination: leave.destination || 'N/A',
        reason: leave.reason || 'N/A',
        exitTime: g.exitTime,
        entryTime: g.entryTime,
        status: g.status
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Movement Report Error:', error.message);
    res.status(500).json({ message: 'Error generating movement reports.' });
  }
};

const getReportDetails = async (req, res) => {
  try {
    const students = await db.query('SELECT COUNT(*) as count FROM students');
    const leaves = await db.query('SELECT * FROM LeaveRequests');
    const logs = await db.query('SELECT * FROM GateLogs');

    const totalStudents = students[0].count || 0;
    const totalLeaves = leaves.length;
    const pendingLeaves = leaves.filter(x => x.status === 'Pending').length;
    const approvedLeaves = leaves.filter(x => x.status === 'Approved').length;
    const activeOutpasses = logs.filter(x => x.status === 'Checked-Out').length;
    const lateReturns = logs.filter(x => x.status === 'Late').length;

    res.json({
      summary: {
        totalStudents,
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        activeOutpasses,
        lateReturns
      },
      weeklyTrends: [
        { day: 'Mon', checkouts: 4, returns: 3 },
        { day: 'Tue', checkouts: 6, returns: 5 },
        { day: 'Wed', checkouts: 3, returns: 4 },
        { day: 'Thu', checkouts: 8, returns: 6 },
        { day: 'Fri', checkouts: 12, returns: 10 },
        { day: 'Sat', checkouts: 15, returns: 12 },
        { day: 'Sun', checkouts: 18, returns: 16 }
      ]
    });
  } catch (error) {
    console.error('Get Report Details Error:', error.message);
    res.status(500).json({ message: 'Error retrieving report details.' });
  }
};

const exportReport = async (req, res) => {
  try {
    const leaves = await db.query('SELECT * FROM LeaveRequests');
    let csv = 'Leave ID,Student ID,Reason,From Date,To Date,Destination,Status\n';
    leaves.forEach(l => {
      csv += `${l.id},${l.studentId},"${(l.reason || '').replace(/"/g, '""')}",${l.fromDate},${l.toDate},"${(l.destination || '').replace(/"/g, '""')}",${l.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=hlms_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export Report Error:', error.message);
    res.status(500).json({ message: 'Error exporting reports.' });
  }
};

module.exports = {
  getLeaveReport,
  getStudentReport,
  getMovementReport,
  getReportDetails,
  exportReport
};
