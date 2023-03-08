from flask import Flask, jsonify
import requests
import socket

app = Flask(__name__)

movies = [
    {"id": 1, "title": "The Shawshank Redemption", "year": 1994},
    {"id": 2, "title": "The Godfather", "year": 1972},
    {"id": 3, "title": "The Godfather: Part II", "year": 1974},
    {"id": 4, "title": "The Dark Knight", "year": 2008},
    {"id": 5, "title": "12 Angry Men", "year": 1957},
]

@app.route("/movies")
def get_movies():
    rating_service_ip = socket.gethostbyname("rating_service")
    for movie in movies:
        ratings_response = requests.get(f"http://{rating_service_ip}:5000/ratings?movie_id={movie['id']}")
        if ratings_response.ok:
            ratings = ratings_response.json()
            movie["ratings"] = ratings
    return jsonify(movies)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
