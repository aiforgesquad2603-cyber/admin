fetch('http://localhost:3000/api/generate-quiz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Science', difficulty: 'Easy', questionCount: 2 })
})
.then(async r => {
  console.log('Status:', r.status);
  console.log('Body:', await r.text());
})
.catch(e => console.error('Error:', e.message));
