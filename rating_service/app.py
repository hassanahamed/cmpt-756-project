from flask import Flask, jsonify, request

app = Flask(__name__)

ratings = [
    {"movie_id": 1, "rating": 9.3},
    {"movie_id": 2, "rating": 9.2},
    {"movie_id": 3, "rating": 9.0},
    {"movie_id": 4, "rating": 9.0},
    {"movie_id": 5, "rating": 8.9},
]

@app.route("/ratings")
def get_ratings():
    movie_id = int(request.args.get("movie_id"))
    movie_ratings = [r for r in ratings if r["movie_id"] == movie_id]
    return jsonify(movie_ratings)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
