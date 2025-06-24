const axios = require('axios');

const BASE_URL = process.env.PERF_API_BASE_URL || 'http://localhost:5000/api';
const TESTS = [
  { name: '/spots', method: 'get', url: '/spots?lat=26.2183&lng=78.1828' },
  { name: '/spots/top', method: 'get', url: '/spots/top' },
];

async function timeRequest(method, url) {
  const start = Date.now();
  await axios({ method, url: BASE_URL + url });
  return Date.now() - start;
}

async function main() {
  console.log('Performance Test Results:');
  for (const test of TESTS) {
    let total = 0;
    let runs = 5;
    for (let i = 0; i < runs; i++) {
      total += await timeRequest(test.method, test.url);
    }
    console.log(`${test.name}: Avg ${(total / runs).toFixed(1)} ms`);
  }
  // Test /spots/:id
  const spots = (await axios.get(BASE_URL + '/spots?lat=26.2183&lng=78.1828')).data;
  if (spots.length > 0) {
    const spotId = spots[0]._id;
    let total = 0;
    let runs = 5;
    for (let i = 0; i < runs; i++) {
      total += await timeRequest('get', `/spots/${spotId}`);
    }
    console.log(`/spots/:id: Avg ${(total / runs).toFixed(1)} ms`);
  } else {
    console.log('/spots/:id: No spots found to test.');
  }
}

main().catch(e => {
  console.error('Performance test failed:', e.message);
}); 