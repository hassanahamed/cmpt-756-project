import http, { head } from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";




const latencyTrendServerfull = new Trend("serverfull_latency");
const responseTimeTrendServerfull = new Trend("serverfull_response_time");
const throughputTrendServerfull = new Trend("serverfull_throughput");
const errorRateServerfull = new Rate("serverfull_errors");

const latencyTrendServerless = new Trend("serverless_latency");
const responseTimeTrendServerless = new Trend("serverless_response_time");
const throughputTrendServerless = new Trend("serverless_throughput");
const errorRateServerless = new Rate("serverless_errors");

let file = null;

// // Open the file in the init phase
// export function setup() {
//   file = open("tconst_ids.txt", "w");
// }

// export function teardown() {
//   // Close the file in the teardown phase
//   file.close();
// }

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
  // Generate a random movie object
  let movie1 = JSON.stringify({
    "tconst": Math.floor(Math.random() * 1000000000).toString(),
    "primarytitle": "Test Movie1",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022
  });

  let movie2 = JSON.stringify({
    "tconst": Math.floor(Math.random() * 1000000000).toString(),
    "primarytitle": "Test Movie1",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022
  });
  // Define server URLs
  const serverfullUrl = "http://34.138.14.29:5001/movies";
  const serverlessUrl = "http://35.202.11.70:5001/movies";
  const headers = { 'Content-Type': 'application/json' };


  // Send requests to both endpoints simultaneously using the batch function
  let res = http.batch([
    { method: "POST", url: serverfullUrl, params: {headers: headers}, body: movie1 },
    { method: "POST", url: serverlessUrl, params: {headers: headers}, body: movie2 }
  ]);

  // Check that the responses are valid
  check(res[0], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie created successfully') !== -1,
  });

  check(res[1], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie created successfully') !== -1,
  });

  // Record latency, response time and throughput metrics for each endpoint separately
  let serverfullLatencyValue = res[0].timings.waiting;
  let serverfullResponseTimeValue = res[0].timings.duration;
  let serverfullThroughputValue = 1 / (serverfullResponseTimeValue / 1000);

  let serverlessLatencyValue = res[1].timings.waiting;
  let serverlessResponseTimeValue = res[1].timings.duration;
  let serverlessThroughputValue = 1 / (serverlessResponseTimeValue / 1000);

  // Add metrics to trends for each endpoint separately
  latencyTrendServerfull.add(serverfullLatencyValue, { endpoint: "serverfull" });
  responseTimeTrendServerfull.add(serverfullResponseTimeValue, { endpoint: "serverfull" });
  throughputTrendServerfull.add(serverfullThroughputValue, { endpoint: "serverfull" });
  errorRateServerfull.add(res[0].status !== 200, { endpoint: "serverfull" });

  latencyTrendServerless.add(serverlessLatencyValue, { endpoint: "serverless" });
  responseTimeTrendServerless.add(serverlessResponseTimeValue, { endpoint: "serverless" });
  throughputTrendServerless.add(serverlessThroughputValue, { endpoint: "serverless" });
  errorRateServerless.add(res[1].status !== 200, { endpoint: "serverless" });

  // Sleep for a short period to avoid overwhelming the server
  sleep(0.1);
}
