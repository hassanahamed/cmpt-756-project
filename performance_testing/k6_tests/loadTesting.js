import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "1m", target: 1000 },
    { duration: "2m", target: 5000 },
    { duration: "1m", target: 0 }
  ]
};

export default function() {
  // Send requests to both endpoints simultaneously using the batch function
  let res = http.batch([
    { method: "GET", url: "http://34.138.14.29:5001/movies" },
    { method: "GET", url: "http://35.202.11.70:5001/movies" }
  ]);

  // Check that the responses are valid
  check(res[0], {
    "status is 200": (r) => r.status === 200,
    "response is JSON": (r) => r.headers["Content-Type"] === "application/json"
  });
  
  check(res[1], {
    "status is 200": (r) => r.status === 200,
    "response is JSON": (r) => r.headers["Content-Type"] === "application/json"
  });

  // Sleep for a short period to avoid overwhelming the server
  sleep(0.1);
}
