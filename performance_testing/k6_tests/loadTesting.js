import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const latencyTrendServerfull = new Trend("latency_serverfull");
const responseTimeTrendServerfull = new Trend("response_time_serverfull");
const throughputTrendServerfull = new Trend("throughput_serverfull");
const errorRateServerfull = new Rate("errors_serverfull");

const latencyTrendServerless = new Trend("latency_serverless");
const responseTimeTrendServerless = new Trend("response_time_serverless");
const throughputTrendServerless = new Trend("throughput_serverless");
const errorRateServerless = new Rate("errors_serverless");

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
  let serverfullLatencyValue = res[0].timings.duration;
  let serverfullResponseTimeValue = res[0].timings.duration;
  let serverfullThroughputValue = 1 / (serverfullResponseTimeValue / 1000);

  let serverlessLatencyValue = res[1].timings.duration;
  let serverlessResponseTimeValue = res[1].timings.duration;
  let serverlessThroughputValue = 1 / (serverlessResponseTimeValue / 1000);

  // Add metrics to trends for each endpoint separately
  latencyTrendServerfull.add(serverfullLatencyValue);
  responseTimeTrendServerfull.add(serverfullResponseTimeValue);
  throughputTrendServerfull.add(serverfullThroughputValue);
  errorRateServerfull.add(res[0].status !== 200);

  latencyTrendServerless.add(serverlessLatencyValue);
  responseTimeTrendServerless.add(serverlessResponseTimeValue);
  throughputTrendServerless.add(serverlessThroughputValue);
  errorRateServerless.add(res[1].status !== 200);



  // Sleep for a short period to avoid overwhelming the server
  sleep(0.1);
}
