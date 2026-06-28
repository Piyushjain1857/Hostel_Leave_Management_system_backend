async function run() {
  const login = await fetch('http://localhost:5005/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'admin@college.edu', password: 'password123'})
  });
  const data = await login.json();
  console.log("Login:", data);

  const del = await fetch('http://localhost:5005/leaves/108', {
    method: 'DELETE',
    headers: {'Authorization': `Bearer ${data.token}`}
  });
  const delData = await del.text();
  console.log("Delete status:", del.status);
  console.log("Delete response:", delData);
}
run();
