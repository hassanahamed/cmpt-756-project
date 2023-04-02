import http from "k6/http";
import { check, sleep } from "k6";
import { InfluxDB } from "k6/metrics";

export let options = {
  scenarios: {
    endpoints: {
      executor: "ramping-vus",
      startVUs: 10,
      stages: [
        { duration: "1m", target: 100 },
        { duration: "2m", target: 500 },
        { duration: "1m", target: 100 }
      ],
      gracefulRampDown: "30s",
    },
  },
  // Configure the influxdb output
  ext: {
    influxDB: {
      host: "http://34.174.39.10:8086",
      database: "mydb",
      measurement: "load_testing_metrics",
      tags: {
        load_test_name: "endpoint_load_test",
      },
    },
  },
};

// Define the metrics to collect
let latency = new InfluxDB({
  measurement: "latency",
  tags: { request_type: "GET" },
});

let responseTime = new InfluxDB({
  measurement: "response_time",
  tags: { request_type: "GET" },
});

let throughput = new InfluxDB({
  measurement: "throughput",
  tags: { request_type: "GET" },
});

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

  // Record latency, response time and throughput metrics
  let latencyValue = res.reduce((acc, r) => acc + r.timings.duration, 0) / res.length;
  let responseTimeValue = res.reduce((acc, r) => acc + r.timings.duration, 0);
  let throughputValue = res.length / (responseTimeValue / 1000);

  // Log the metrics
  latency.addPoint(latencyValue);
  responseTime.addPoint(responseTimeValue);
  throughput.addPoint(throughputValue);

  // Sleep for a short period to avoid overwhelming the server
  sleep(0.1);
}
