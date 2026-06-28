const fs = require('fs');
const path = './backend/config/db.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.mockLeaveRequests = data.mockLeaveRequests.map(leave => {
  if (!leave.expectedTimeOut) leave.expectedTimeOut = '09:00';
  if (!leave.expectedTimeIn) leave.expectedTimeIn = '18:00';
  return leave;
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Patched db.json');
