async function run() {
  const login = await fetch('http://localhost:5005/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'admin@college.edu', password: 'password123', role: 'admin'})
  });
  const data = await login.json();
  const getReq = await fetch('http://localhost:5005/leaves', {
    method: 'GET',
    headers: {'Authorization': `Bearer ${data.token}`}
  });
  const getRes = await getReq.json();
  if (Array.isArray(getRes)) {
    console.log("Leaves count:", getRes.length);
    const ids = getRes.map(x => x.id);
    console.log("Leaves IDs:", ids.join(", "));
  } else {
    console.log("Not an array:", getRes);
  }
}
run();
