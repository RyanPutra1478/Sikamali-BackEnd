const baseUrl = 'https://sikamali-backend.devryan.my.id';

const publicEndpoints = [
  '/',
  '/api/ping',
  '/api/public/stats',
  '/api/public/villages',
  '/api/public/comparison'
];

async function testPublic() {
  console.log('--- TESTING PUBLIC ENDPOINTS ---');
  for (const ep of publicEndpoints) {
    try {
      const start = Date.now();
      const res = await fetch(baseUrl + ep);
      const time = Date.now() - start;
      const text = await res.text();
      console.log(`[${res.status}] ${ep} (${time}ms)`);
      if(res.status >= 400) {
        console.log(`  └─ Error Body:`, text);
      }
    } catch(e) {
      console.error(`[ERR] ${ep} - ${e.message}`);
    }
  }
}

testPublic();
