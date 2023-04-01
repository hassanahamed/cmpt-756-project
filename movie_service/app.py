import requests
from flask import Flask, jsonify, request
import socket
from flask_sqlalchemy import SQLAlchemy
from urllib.parse import quote_plus



app = Flask(__name__)
password = 'Welcome@1234'
encoded_password = quote_plus(password)
CLOUD_SQL_USERNAME="postgres"
CLOUD_SQL_DATABASE="imdb"
CLOUD_SQL_INSTANCE="cmpt-786-im:us-central1:cmpt-756-final-project"
CLOUD_SQL_PROXY_IP="localhost"
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

# movies = [
#     {"id": 1, "title": "The Shawshank Redemption", "year": 1994},
#     {"id": 2, "title": "The Godfather", "year": 1972},
#     {"id": 3, "title": "The Godfather: Part II", "year": 1974},
#     {"id": 4, "title": "The Dark Knight", "year": 2008},
#     {"id": 5, "title": "12 Angry Men", "year": 1957},
# ]

# @app.route("/movies")
# def get_movies():
#     for movie in movies:
#         ratings_response = requests.get(f"http://rating-service:5002/ratings?movie_id={movie['id']}")
#         if ratings_response.ok:
#             ratings = ratings_response.json()
#             movie["ratings"] = ratings
#     return jsonify(movies)

# @app.route('/movies/latest')
# def get_latest_movies():
#     latest_movies = MovieDetails.query.order_by(MovieDetails.release_year.desc()).limit(10).all()
#     movies_list = []
#     for movie in latest_movies:
#         movies_list.append({
#             'tconst': movie.tconst,
#             'primarytitle': movie.primarytitle,
#             'genres': movie.genres,
#             'runtimeminutes': movie.runtimeminutes,
#             'language': movie.language,
#             'region': movie.region,
#             'release_year': movie.release_year
#         })
#     return jsonify(movies_list)


##          simple standalone movie service  --------------------------------------------------------------------  


@app.route('/movies', methods=['GET'])
def get_movies():
    movies = MovieDetails.query.order_by(MovieDetails.release_year.desc()).limit(100).all()
    movies_list = []
    for movie in movies:
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

@app.route('/movies/<string:tconst>', methods=['GET'])
def get_movie(tconst):
    movie = MovieDetails.query.filter_by(tconst=tconst).first()
    if movie is None:
        return jsonify({'error': 'Movie not found'}), 404
    movie_dict = {
        'tconst': movie.tconst,
        'primarytitle': movie.primarytitle,
        'genres': movie.genres,
        'runtimeminutes': movie.runtimeminutes,
        'language': movie.language,
        'region': movie.region,
        'release_year': movie.release_year
    }
    return jsonify(movie_dict)

@app.route('/movies', methods=['POST'])
def create_movie():
    data = request.get_json()
    tconst = data.get('tconst')
    primarytitle = data.get('primarytitle')
    genres = data.get('genres')
    runtimeminutes = data.get('runtimeminutes')
    language = data.get('language')
    region = data.get('region')
    release_year = data.get('release_year')
    movie = MovieDetails(tconst=tconst, primarytitle=primarytitle, genres=genres,
                         runtimeminutes=runtimeminutes, language=language,
                         region=region, release_year=release_year)
    db.session.add(movie)
    db.session.commit()
    return jsonify({'message': 'Movie created successfully'})

@app.route('/movies/<string:tconst>', methods=['PUT'])
def update_movie(tconst):
    movie = MovieDetails.query.filter_by(tconst=tconst).first()
    if movie is None:
        return jsonify({'error': 'Movie not found'}), 404
    data = request.get_json()
    movie.primarytitle = data.get('primarytitle', movie.primarytitle)
    movie.genres = data.get('genres', movie.genres)
    movie.runtimeminutes = data.get('runtimeminutes', movie.runtimeminutes)
    movie.language = data.get('language', movie.language)
    movie.region = data.get('region', movie.region)
    movie.release_year = data.get('release_year', movie.release_year)
    db.session.commit()
    return jsonify({'message': 'Movie updated successfully'})

@app.route('/movies/<string:tconst>', methods=['DELETE'])
def delete_movie(tconst):
    movie = MovieDetails.query.filter_by(tconst=tconst).first()
    if movie is None:
        return jsonify({'error': 'Movie not found'}), 404
    db.session.delete(movie)
    db.session.commit()
    return jsonify({'message': 'Movie deleted successfully'})








    ##  involving rating service------------------------------------------------------------------------------------


@app.route('/movies_by_rating', methods=['GET'])
def get_movies_by_rating():
    data = request.get_json()
    rating_threshold = data.get('rating_threshold')
    movies = MovieDetails.query.order_by(MovieDetails.release_year.desc()).limit(100).all()
    if rating_threshold:
        rating_service_url = 'http://rating-service:5002/ratings'
        movies_with_ratings = []
        for movie in movies:
            rating_service_payload = {'tconst': movie.tconst}
            rating_response = requests.get(rating_service_url, json=rating_service_payload)
            rating = rating_response.json()['averagerating']
            if rating >= float(rating_threshold):
                movies_with_ratings.append({'movie': movie.to_dict(), 'rating': rating})
        return jsonify(movies_with_ratings)
    else:
        return jsonify([movie.to_dict() for movie in movies])

@app.route('/movies_by_rating', methods=['POST'])
def create_movie_by_rating():
    movie_data = request.get_json()
    new_movie = MovieDetails(**movie_data)
    db.session.add(new_movie)
    db.session.commit()

    rating_service_url = 'http://rating-service:5002/ratings'
    rating_service_payload = {
        'tconst': new_movie.tconst,
        'averagerating': movie_data['averagerating'],
        'numvotes': movie_data['numvotes']
    }
    rating_response = requests.post(rating_service_url, json=rating_service_payload)
    return jsonify(new_movie.to_dict()), 201

@app.route('/movie_by_rating/<tconst>', methods=['GET'])
def get_movie_by_rating(tconst):
    movie = MovieDetails.query.filter_by(tconst=tconst).first()
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404

    rating_service_url = 'http://rating-service:5002/ratings'
    rating_service_payload = {'tconst': tconst}
    rating_response = requests.get(rating_service_url, json=rating_service_payload)
    rating = rating_response.json()['averagerating']
    return jsonify({'movie': movie.to_dict(), 'rating': rating})

@app.route('/movie_by_rating/<tconst>', methods=['PUT'])
def update_movie_by_rating(tconst):
    movie_data = request.get_json()
    movie = MovieDetails.query.filter_by(tconst=tconst).first()
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404

    movie.primarytitle = movie_data['primarytitle']
    movie.genres = movie_data['genres']


@app.route('/movie_by_rating/<tconst>', methods=['DELETE'])
def delete_movie_by_rating(tconst):
    movie = MovieDetails.query.filter_by(tconst=tconst).first()
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404

    rating_service_url = 'http://rating-service:5002/ratings'
    rating_service_payload = {'tconst': tconst}
    rating_response = requests.delete(rating_service_url, json=rating_service_payload)
    if rating_response.status_code == 404:
        return jsonify({'error': 'Rating not found for movie'}), 404
    elif rating_response.status_code != 204:
        return jsonify({'error': 'Failed to delete rating for movie'}), 500

    return jsonify({'message': 'Rating deleted for movie'}), 204
   




if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
