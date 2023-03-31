import http from 'k6/http';
import { check, sleep } from 'k6';

const ARCH1_URL = __ENV.ARCH1 || 'http://localhost:5001/movies/latest';
// const ARCH2_URL = __ENV.ARCH2 || 'http://localhost:8081';

export let options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<200'], // Ensure that 99% of requests are faster than 200ms
    http_req_failed: ['rate<0.1'], // Ensure that less than 10% of requests fail
  },
};

export default function () {
  http.get(`${ARCH1_URL}/movies`);
//   http.get(`${ARCH2_URL}/movies`);
  sleep(1);
}
