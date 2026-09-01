const fetch = require('node-fetch');

async function main() {
  try {
    const res = await fetch('http://localhost:8000/api/agenda/8c86b1c7-e569-43ad-9165-f46c0d97e211/attendance', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        // Missing Authorization header intentionally, wait, the API requires ADMIN
      },
      body: JSON.stringify({
        userId: 'c615af40-b4bf-419f-888e-46b6241da7b7',
        attended: true
      })
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (e) {
    console.error(e);
  }
}
main();
