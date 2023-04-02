import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const latencyTrend1 = new Trend("latency_api1");
const responseTimeTrend1 = new Trend("response_time_api1");
const throughputTrend1 = new Trend("throughput_api1");
const errorRate1 = new Rate("errors_api1");

const latencyTrend2 = new Trend("latency_api2");
const responseTimeTrend2 = new Trend("response_time_api2");
const throughputTrend2 = new Trend("throughput_api2");
const errorRate2 = new Rate("errors_api2");

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
  // Output to InfluxDB
  // Adjust the values below with your own InfluxDB server details
  // Note that you should create the 'k6' database in your InfluxDB instance beforehand
  // and that the InfluxDB user should have write permissions to that database
  // Otherwise, the script will output an error
  influxDBv1: {
    address: "http://34.174.39.10:8086",
    database: "mydb",
    tags: { 
      loadtest: "example"
    },
  },
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

  // Record latency, response time and throughput metrics for each endpoint separately
  let latencyValue1 = res[0].timings.duration;
  let responseTimeValue1 = res[0].timings.duration;
  let throughputValue1 = 1 / (responseTimeValue1 / 1000);

  let latencyValue2 = res[1].timings.duration;
  let responseTimeValue2 = res[1].timings.duration;
  let throughputValue2 = 1 / (responseTimeValue2 / 1000);

  // Add metrics to trends for each endpoint separately
  latencyTrend1.add(latencyValue1);
  responseTimeTrend1.add(responseTimeValue1);
  throughputTrend1.add(throughputValue1);
  errorRate1.add(res[0].status !== 200);

  latencyTrend2.add(latencyValue2);
  responseTimeTrend2.add(responseTimeValue2);
  throughputTrend2.add(throughputValue2);
  errorRate2.add(res[1].status !== 200);


  // Sleep for a short period to avoid overwhelming the server
  sleep(0.1);
}
