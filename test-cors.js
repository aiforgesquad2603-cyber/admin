fetch('https://admin-production-6c75.up.railway.app/api/quizzes').then(r => console.log(r.headers.get('access-control-allow-origin')))
