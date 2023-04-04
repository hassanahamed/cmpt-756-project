import http, { head } from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";





const postMovieslatencyTrendServerfull = new Trend("post_movies_serverfull_latency");
const postMoviesresponseTimeTrendServerfull = new Trend("post_movies_serverfull_response_time");
const postMoviesthroughputTrendServerfull = new Trend("post_movies_serverfull_throughput");

const postMovieslatencyTrendServerless = new Trend("post_movies_serverless_latency");
const postMoviesresponseTimeTrendServerless = new Trend("post_movies_serverless_response_time");
const postMoviesthroughputTrendServerless = new Trend("post_movies_serverless_throughput");



const putMovieslatencyTrendServerfull = new Trend("put_movies_serverfull_latency");
const putMoviesresponseTimeTrendServerfull = new Trend("put_movies_serverfull_response_time");
const putMoviesthroughputTrendServerfull = new Trend("put_movies_serverfull_throughput");

const putMovieslatencyTrendServerless = new Trend("put_movies_serverless_latency");
const putMoviesresponseTimeTrendServerless = new Trend("put_movies_serverless_response_time");
const putMoviesthroughputTrendServerless = new Trend("put_movies_serverless_throughput");


const deleteMovieslatencyTrendServerfull = new Trend("delete_movies_serverfull_latency");
const deleteMoviesresponseTimeTrendServerfull = new Trend("delete_movies_serverfull_response_time");
const deleteMoviesthroughputTrendServerfull = new Trend("delete_movies_serverfull_throughput");

const deleteMovieslatencyTrendServerless = new Trend("delete_movies_serverless_latency");
const deleteMoviesresponseTimeTrendServerless = new Trend("delete_movies_serverless_response_time");
const deleteMoviesthroughputTrendServerless = new Trend("delete_movies_serverless_throughput");



export let options = {
  scenarios: {
    endpoints: {
      executor: "ramping-vus",
      startVUs: 10,
      stages: [
        { duration: "1m", target: 100 },
        { duration: "2m", target: 500 },
        { duration: "2m", target: 1000 },
        { duration: "2m", target: 2000 },
        { duration: "2m", target: 1000 },
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
    "primarytitle": "Test Movie1 serverfull",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022
  });

  let movie2 = JSON.stringify({
    "tconst": Math.floor(Math.random() * 1000000000).toString(),
    "primarytitle": "Test Movie1 serverless",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022
  });
  // Define server URLs
  const moviesServerfullUrl = "http://34.121.13.53:5001/movies";
  const moviesServerlessUrl = "http://34.139.187.14:5001/movies";
  const headers = { 'Content-Type': 'application/json' };

  // params: {headers: headers},

  // Send requests to both endpoints simultaneously using the batch function
  let res = http.batch([
    { method: "POST", url: moviesServerfullUrl, params: {headers: headers}, body: movie1 },
    { method: "POST", url: moviesServerlessUrl, params: {headers: headers}, body: movie2 }
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
  postMovieslatencyTrendServerfull.add(serverfullLatencyValue, { endpoint: "post_movies_serverfull" });
  postMoviesresponseTimeTrendServerfull.add(serverfullResponseTimeValue, { endpoint: "post_movies_serverfull" });
  postMoviesthroughputTrendServerfull.add(serverfullThroughputValue, { endpoint: "post_movies_serverfull" });

  postMovieslatencyTrendServerless.add(serverlessLatencyValue, { endpoint: "post_movies_serverless" });
  postMoviesresponseTimeTrendServerless.add(serverlessResponseTimeValue, { endpoint: "post_movies_serverless" });
  postMoviesthroughputTrendServerless.add(serverlessThroughputValue, { endpoint: "post_movies_serverless" });

  let tconstIds = [];
  tconstIds.push(JSON.parse(movie1).tconst);
  tconstIds.push(JSON.parse(movie2).tconst);

  // Sleep for a short period to avoid overwhelming the server
  // sleep(0.5)
  






  //  ------------------------------------------------------ PUT ------------------------------------------------------
  movie1 = JSON.stringify({
    "primarytitle": "Test Movie1 updated",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022
  });

  movie2 = JSON.stringify({
    "primarytitle": "Test Movie1 updated",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022
  });

  // Send requests to both endpoints simultaneously using the batch function
  let res2 = http.batch([
    { method: "PUT", url: moviesServerfullUrl+"/"+tconstIds[0].toString(), params: {headers: headers}, body: movie1 },
    { method: "PUT", url: moviesServerlessUrl+"/"+tconstIds[1].toString(), params: {headers: headers}, body: movie2 }
  ]);

  // Check that the responses are valid
  check(res2[0], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie updated successfully') !== -1,
  });

  check(res2[1], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie updated successfully') !== -1,
  });


    // Record latency, response time and throughput metrics for each endpoint separately
    serverfullLatencyValue = res2[0].timings.waiting;
    serverfullResponseTimeValue = res2[0].timings.duration;
    serverfullThroughputValue = 1 / (serverfullResponseTimeValue / 1000);
  
    serverlessLatencyValue = res2[1].timings.waiting;
    serverlessResponseTimeValue = res2[1].timings.duration;
    serverlessThroughputValue = 1 / (serverlessResponseTimeValue / 1000);
  
    // Add metrics to trends for each endpoint separately
    putMovieslatencyTrendServerfull.add(serverfullLatencyValue, { endpoint: "put_movies_serverfull" });
    putMoviesresponseTimeTrendServerfull.add(serverfullResponseTimeValue, { endpoint: "put_movies_serverfull" });
    putMoviesthroughputTrendServerfull.add(serverfullThroughputValue, { endpoint: "put_movies_serverfull" });
  
    putMovieslatencyTrendServerless.add(serverlessLatencyValue, { endpoint: "put_movies_serverless" });
    putMoviesresponseTimeTrendServerless.add(serverlessResponseTimeValue, { endpoint: "put_movies_serverless" });
    putMoviesthroughputTrendServerless.add(serverlessThroughputValue, { endpoint: "put_movies_serverless" });


  // Sleep for a short period to avoid overwhelming the server


  // sleep(0.5);


  //  ------------------------------------------------------ Delete ------------------------------------------------------
 

  // Send requests to both endpoints simultaneously using the batch function
  let res3 = http.batch([
    { method: "DELETE", url: moviesServerfullUrl+"/"+tconstIds[0].toString()},
    { method: "DELETE", url: moviesServerlessUrl+"/"+tconstIds[1].toString()}
  ]);

  // Check that the responses are valid
  check(res3[0], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie deleted successfully') !== -1,
  });

  check(res3[1], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie deleted successfully') !== -1,
  });


    // Record latency, response time and throughput metrics for each endpoint separately
    serverfullLatencyValue = res3[0].timings.waiting;
    serverfullResponseTimeValue = res3[0].timings.duration;
    serverfullThroughputValue = 1 / (serverfullResponseTimeValue / 1000);
  
    serverlessLatencyValue = res3[1].timings.waiting;
    serverlessResponseTimeValue = res3[1].timings.duration;
    serverlessThroughputValue = 1 / (serverlessResponseTimeValue / 1000);
  
    // Add metrics to trends for each endpoint separately
    deleteMovieslatencyTrendServerfull.add(serverfullLatencyValue, { endpoint: "delete_movies_serverfull" });
    deleteMoviesresponseTimeTrendServerfull.add(serverfullResponseTimeValue, { endpoint: "delete_movies_serverfull" });
    deleteMoviesthroughputTrendServerfull.add(serverfullThroughputValue, { endpoint: "delete_movies_serverfull" });
  
    deleteMovieslatencyTrendServerless.add(serverlessLatencyValue, { endpoint: "delete_movies_serverless" });
    deleteMoviesresponseTimeTrendServerless.add(serverlessResponseTimeValue, { endpoint: "delete_movies_serverless" });
    deleteMoviesthroughputTrendServerless.add(serverlessThroughputValue, { endpoint: "delete_movies_serverless" });


  // Sleep for a short period to avoid overwhelming the server
  // sleep(0.5)

  // tconstIds = movieIds.filter((id) => id !== movieId);

}
