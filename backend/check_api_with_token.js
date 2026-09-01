const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

async function main() {
  const secret = 'kwt-sorgum-super-secret-key-2026';
  const token = jwt.sign({ userId: 'c615af40-b4bf-419f-888e-46b6241da7b7', role: 'ADMIN' }, secret, { expiresIn: '1d' });
  
  const res = await fetch('http://localhost:8000/api/agenda/8c86b1c7-e569-43ad-9165-f46c0d97e211/attendance', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      userId: 'c615af40-b4bf-419f-888e-46b6241da7b7',
      attended: true
    })
  });
  
  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', text);
}
main();
