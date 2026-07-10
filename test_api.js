async function runTests() {
  console.log('Testing Signup...');
  let res = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testuser', email: 'test@example.com', password: 'password123' })
  });
  console.log('Signup:', await res.json());

  console.log('Testing Login...');
  res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
  });
  console.log('Login:', await res.json());

  console.log('Testing Verify (valid code)...');
  res = await fetch('http://localhost:3000/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', code: '123456' })
  });
  console.log('Verify:', await res.json());
}

runTests();
