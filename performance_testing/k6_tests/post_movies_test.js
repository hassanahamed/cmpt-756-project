import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const latencyTrend = new Trend("latency");
const responseTimeTrend = new Trend("response_time");
const throughputTrend = new Trend("throughput");
const errorRate = new Rate("errors");

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
  let movie = {
    tconst: Math.floor(Math.random() * 1000000000),
    primarytitle: "Test Movie",
    genres: ["Action", "Comedy"],
    runtimeminutes: 120,
    language: "English",
    region: "US",
    release_year: 2022
  };

  // Send a POST request to the /movies endpoint with the movie object
  let res = http.post("http://35.202.11.70:5001/movies", JSON.stringify(movie), {
    headers: { "Content-Type": "application/json" }
  });

  // Check that the response is valid
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response is JSON": (r) => r.headers["Content-Type"] === "application/json"
  });

  // Record latency, response time and throughput metrics
  let latencyValue = res.timings.waiting;
  let responseTimeValue = res.timings.duration;
  let throughputValue = 1 / (responseTimeValue / 1000);

  // Add metrics to trends
  latencyTrend.add(latencyValue);
  responseTimeTrend.add(responseTimeValue);
  throughputTrend.add(throughputValue);
  errorRate.add(res.status !== 200);

  // Sleep for a short period to avoid overwhelming the server
  sleep(0.1);
}
