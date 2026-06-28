const db = require('../config/db');
async function run() {
  await db.initializeDatabase(); // to loadFromFile
  const result = await db.query('DELETE FROM LeaveRequests WHERE id = ?', [111]);
  console.log("Delete result:", result);
  console.log("affectedRows:", result.affectedRows);
  console.log("Is 0?", result.affectedRows === 0);
}
run();
