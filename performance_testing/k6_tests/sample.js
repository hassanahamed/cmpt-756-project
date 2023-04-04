import http, { head } from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";





const postMoviesAndRatinglatencyTrendServerfull = new Trend("post_movies_and_rating_serverfull_latency");
const postMoviesAndRatingresponseTimeTrendServerfull = new Trend("post_movies_and_rating_serverfull_response_time");
const postMoviesAndRatingthroughputTrendServerfull = new Trend("post_movies_and_rating_serverfull_throughput");

const postMoviesAndRatinglatencyTrendServerless = new Trend("post_movies_and_rating_serverless_latency");
const postMoviesAndRatingresponseTimeTrendServerless = new Trend("post_movies_and_rating_serverless_response_time");
const postMoviesAndRatingthroughputTrendServerless = new Trend("post_movies_and_rating_serverless_throughput");



const putMoviesAndRatinglatencyTrendServerfull = new Trend("put_movies_and_rating_serverfull_latency");
const putMoviesAndRatingresponseTimeTrendServerfull = new Trend("put_movies_and_rating_serverfull_response_time");
const putMoviesAndRatingthroughputTrendServerfull = new Trend("put_movies_and_rating_serverfull_throughput");

const putMoviesAndRatinglatencyTrendServerless = new Trend("put_movies_and_rating_serverless_latency");
const putMoviesAndRatingresponseTimeTrendServerless = new Trend("put_movies_and_rating_serverless_response_time");
const putMoviesAndRatingthroughputTrendServerless = new Trend("put_movies_and_rating_serverless_throughput");


const deleteMoviesAndRatinglatencyTrendServerfull = new Trend("delete_movies_and_rating_serverfull_latency");
const deleteMoviesAndRatingresponseTimeTrendServerfull = new Trend("delete_movies_and_rating_serverfull_response_time");
const deleteMoviesAndRatingthroughputTrendServerfull = new Trend("delete_movies_and_rating_serverfull_throughput");

const deleteMoviesAndRatinglatencyTrendServerless = new Trend("delete_movies_and_rating_serverless_latency");
const deleteMoviesAndRatingresponseTimeTrendServerless = new Trend("delete_movies_and_rating_serverless_response_time");
const deleteMoviesAndRatingthroughputTrendServerless = new Trend("delete_movies_and_rating_serverless_throughput");



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
    "primarytitle": "Test Movie1",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022,
    "averagerating": 8,
    "numvotes": 1000
  });

  let movie2 = JSON.stringify({
    "tconst": Math.floor(Math.random() * 1000000000).toString(),
    "primarytitle": "Test Movie1",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022,
    "averagerating": 8,
    "numvotes": 1000
  });
  // Define server URLs
  const moviesServerfullUrl = "http://104.196.115.165:5001/movies_by_rating";
  const moviesServerlessUrl = "http://34.168.91.132:5001/movies_by_rating";
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
    'response body': (r) => r.body.indexOf('Movie and rating created successfully') !== -1,
  });

  check(res[1], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie and rating created successfully') !== -1,
  });

  // Record latency, response time and throughput metrics for each endpoint separately
  let serverfullLatencyValue = res[0].timings.waiting;
  let serverfullResponseTimeValue = res[0].timings.duration;
  let serverfullThroughputValue = 1 / (serverfullResponseTimeValue / 1000);

  let serverlessLatencyValue = res[1].timings.waiting;
  let serverlessResponseTimeValue = res[1].timings.duration;
  let serverlessThroughputValue = 1 / (serverlessResponseTimeValue / 1000);

  // Add metrics to trends for each endpoint separately
  postMoviesAndRatinglatencyTrendServerfull.add(serverfullLatencyValue, { endpoint: "post_movies_and_rating_serverfull" });
  postMoviesAndRatingresponseTimeTrendServerfull.add(serverfullResponseTimeValue, { endpoint: "post_movies_and_rating_serverfull" });
  postMoviesAndRatingthroughputTrendServerfull.add(serverfullThroughputValue, { endpoint: "post_movies_and_rating_serverfull" });

  postMoviesAndRatinglatencyTrendServerless.add(serverlessLatencyValue, { endpoint: "post_movies_and_rating_serverless" });
  postMoviesAndRatingresponseTimeTrendServerless.add(serverlessResponseTimeValue, { endpoint: "post_movies_and_rating_serverless" });
  postMoviesAndRatingthroughputTrendServerless.add(serverlessThroughputValue, { endpoint: "post_movies_and_rating_serverless" });

  let tconstIds = [];
  tconstIds.push(JSON.parse(movie1).tconst);
  tconstIds.push(JSON.parse(movie2).tconst);

  // Sleep for a short period to avoid overwhelming the server
  sleep(0.5)
  






  //  ------------------------------------------------------ PUT ------------------------------------------------------
  movie1 = JSON.stringify({
    "primarytitle": "Test Movie1 updated",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022,
    "averagerating": 8.5,
    "numvotes": 2000
  });

  movie2 = JSON.stringify({
    "primarytitle": "Test Movie1 updated",
    "genres": "Action",
    "runtimeminutes": 120,
    "language": "English",
    "region": "US",
    "release_year": 2022,
    "averagerating": 8.5,
    "numvotes": 2000
  });

  // Send requests to both endpoints simultaneously using the batch function
  let res2 = http.batch([
    { method: "PUT", url: moviesServerfullUrl+"/"+tconstIds[0].toString(), params: {headers: headers}, body: movie1 },
    { method: "PUT", url: moviesServerlessUrl+"/"+tconstIds[1].toString(), params: {headers: headers}, body: movie2 }
  ]);

  // Check that the responses are valid
  check(res2[0], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie and rating updated successfully') !== -1,
  });

  check(res2[1], {
    "status is 200": (r) => r.status === 200,
    'response body': (r) => r.body.indexOf('Movie and rating updated successfully') !== -1,
  });


    // Record latency, response time and throughput metrics for each endpoint separately
    serverfullLatencyValue = res2[0].timings.waiting;
    serverfullResponseTimeValue = res2[0].timings.duration;
    serverfullThroughputValue = 1 / (serverfullResponseTimeValue / 1000);
  
    serverlessLatencyValue = res2[1].timings.waiting;
    serverlessResponseTimeValue = res2[1].timings.duration;
    serverlessThroughputValue = 1 / (serverlessResponseTimeValue / 1000);
  
    // Add metrics to trends for each endpoint separately
    putMoviesAndRatinglatencyTrendServerfull.add(serverfullLatencyValue, { endpoint: "put_movies_and_rating_serverfull" });
    putMoviesAndRatingresponseTimeTrendServerfull.add(serverfullResponseTimeValue, { endpoint: "put_movies_and_rating_serverfull" });
    putMoviesAndRatingthroughputTrendServerfull.add(serverfullThroughputValue, { endpoint: "put_movies_and_rating_serverfull" });
  
    putMoviesAndRatinglatencyTrendServerless.add(serverlessLatencyValue, { endpoint: "put_movies_and_rating_serverless" });
    putMoviesAndRatingresponseTimeTrendServerless.add(serverlessResponseTimeValue, { endpoint: "put_movies_and_rating_serverless" });
    putMoviesAndRatingthroughputTrendServerless.add(serverlessThroughputValue, { endpoint: "put_movies_and_rating_serverless" });


  // Sleep for a short period to avoid overwhelming the server


  sleep(0.5);


  //  ------------------------------------------------------ Delete ------------------------------------------------------
 

  // Send requests to both endpoints simultaneously using the batch function
  let res3 = http.batch([
    { method: "DELETE", url: moviesServerfullUrl+"/"+tconstIds[0].toString()},
    { method: "DELETE", url: moviesServerlessUrl+"/"+tconstIds[1].toString()}
  ]);

  // Check that the responses are valid
  check(res3[0], {
    "status is 200": (r) => r.status === 200,
  });

  check(res3[1], {
    "status is 200": (r) => r.status === 200,
  });


    // Record latency, response time and throughput metrics for each endpoint separately
    serverfullLatencyValue = res3[0].timings.waiting;
    serverfullResponseTimeValue = res3[0].timings.duration;
    serverfullThroughputValue = 1 / (serverfullResponseTimeValue / 1000);
  
    serverlessLatencyValue = res3[1].timings.waiting;
    serverlessResponseTimeValue = res3[1].timings.duration;
    serverlessThroughputValue = 1 / (serverlessResponseTimeValue / 1000);
  
    // Add metrics to trends for each endpoint separately
    deleteMoviesAndRatinglatencyTrendServerfull.add(serverfullLatencyValue, { endpoint: "delete_movies_and_rating_serverfull" });
    deleteMoviesAndRatingresponseTimeTrendServerfull.add(serverfullResponseTimeValue, { endpoint: "delete_movies_and_rating_serverfull" });
    deleteMoviesAndRatingthroughputTrendServerfull.add(serverfullThroughputValue, { endpoint: "delete_movies_and_rating_serverfull" });
  
    deleteMoviesAndRatinglatencyTrendServerless.add(serverlessLatencyValue, { endpoint: "delete_movies_and_rating_serverless" });
    deleteMoviesAndRatingresponseTimeTrendServerless.add(serverlessResponseTimeValue, { endpoint: "delete_movies_and_rating_serverless" });
    deleteMoviesAndRatingthroughputTrendServerless.add(serverlessThroughputValue, { endpoint: "delete_movies_and_rating_serverless" });


  // Sleep for a short period to avoid overwhelming the server
  sleep(0.5)

  tconstIds = movieIds.filter((id) => id !== movieId);

}
