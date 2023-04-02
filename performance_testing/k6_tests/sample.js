import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const url = 'http://34.138.14.29:5001/movies';
  const payload = JSON.stringify({
    tconst: Math.floor(Math.random() * 1000000000),
    primarytitle: 'Test Movie',
    genres: 'Action',
    runtimeminutes: 120,
    language: 'English',
    region: 'US',
    release_year: 2022,
  });
  const headers = { 'Content-Type': 'application/json' };

  const res = http.post(url, payload, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie created successfully') !== -1,
  });
}

