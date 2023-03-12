from flask import Flask, jsonify
import requests
import socket
from flask_sqlalchemy import SQLAlchemy
from urllib.parse import quote_plus
import psycopg2



app = Flask(__name__)
password = 'Welcome@1234'
encoded_password = quote_plus(password)
CLOUD_SQL_USERNAME="postgres"
CLOUD_SQL_DATABASE="imdb"
CLOUD_SQL_INSTANCE="cmpt-786-im:us-central1:cmpt-756-final-project"
CLOUD_SQL_PROXY_IP="host.docker.internal"
# app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql+psycopg2://{CLOUD_SQL_USERNAME}:{encoded_password}@/{CLOUD_SQL_DATABASE}?host=/cloudsql/{CLOUD_SQL_INSTANCE}"
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql+psycopg2://{CLOUD_SQL_USERNAME}:{encoded_password}@{CLOUD_SQL_PROXY_IP}/{CLOUD_SQL_DATABASE}"


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class MovieDetails(db.Model):
    __tablename__ = 'movie_details'
    tconst = db.Column(db.String(100), primary_key=True)
    primarytitle = db.Column(db.String(5000))
    genres = db.Column(db.String(5000))
    runtimeminutes = db.Column(db.Float)
    language = db.Column(db.String(5000))
    region = db.Column(db.String(5000))
    release_year = db.Column(db.Float)

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

@app.route('/movies/latest')
def get_latest_movies():
    latest_movies = MovieDetails.query.order_by(MovieDetails.release_year.desc()).limit(10).all()
    movies_list = []
    for movie in latest_movies:
        movies_list.append({
            'tconst': movie.tconst,
            'primarytitle': movie.primarytitle,
            'genres': movie.genres,
            'runtimeminutes': movie.runtimeminutes,
            'language': movie.language,
            'region': movie.region,
            'release_year': movie.release_year
        })
    return jsonify(movies_list)



# @app.route('/movies/latest2')
# def get_latest_movies2():
#     conn = psycopg2.connect(
#         host="host.docker.internal",
#         port=5432,
#         database="imdb",
#         user="postgres",
#         password="Welcome@1234"
#     )

#     # Open a cursor to execute SQL queries
#     cur = conn.cursor()

#     # Execute the SQL query to retrieve table names and column information
#     cur.execute("""
#         SELECT
#         table_name,
#         column_name,
#         data_type,
#         character_maximum_length
#         FROM
#         information_schema.columns
#         WHERE
#         table_schema = 'public';
#     """)

#     # Fetch all rows and print them
#     rows = cur.fetchall()
    

#     # Close the cursor and database connection
#     cur.close()
#     conn.close()
#     return jsonify(rows)



if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
