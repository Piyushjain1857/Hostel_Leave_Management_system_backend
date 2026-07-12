const http = require('http');

async function test() {
  const loginRes = await fetch('http://localhost:5005/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@college.edu', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login:', loginRes.status, loginData);
  
  if (loginData.token) {
    const dashRes = await fetch('http://localhost:5005/api/student/dashboard', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const dashData = await dashRes.json();
    console.log('Dashboard:', dashRes.status, dashData);
  }
}
test();
