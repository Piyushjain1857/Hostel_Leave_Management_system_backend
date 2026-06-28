const fs = require('fs');
const dbFile = 'config/db.json';
if (fs.existsSync(dbFile)) {
  const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  
  // Extract default rules from db.js
  const dbJs = fs.readFileSync('config/db.js', 'utf8');
  
  const portalMatch = dbJs.match(/let mockPortalRules = (\[[\s\S]*?\]);/);
  const hostelMatch = dbJs.match(/let mockHostelRules = (\[[\s\S]*?\]);/);
  
  if (portalMatch) {
    data.mockPortalRules = eval(portalMatch[1]);
  }
  if (hostelMatch) {
    data.mockHostelRules = eval(hostelMatch[1]);
  }
  
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  console.log('Successfully restored rules in db.json');
} else {
  console.log('db.json not found');
}
