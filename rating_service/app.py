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

class Rating(db.Model):
    __tablename__ = 'ratings'
    tconst = db.Column(db.String(100), primary_key=True)
    averagerating = db.Column(db.Float, nullable=False)
    numvotes = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'tconst': self.tconst,
            'averagerating': self.averagerating,
            'numvotes': self.numvotes
        }

@app.route('/ratings', methods=['GET'])
def get_ratings():
    data = request.get_json()
    tconst = data.get('tconst')
    if tconst:
        rating = Rating.query.filter_by(tconst=tconst).first()
        if rating:
            return jsonify(rating.to_dict())
        else:
            return jsonify({'error': 'Rating not found'}), 404
    else:
        ratings = Rating.query.all()
        return jsonify([rating.to_dict() for rating in ratings])

@app.route('/ratings', methods=['POST'])
def create_rating():
    rating_data = request.get_json()
    new_rating = Rating(**rating_data)
    db.session.add(new_rating)
    db.session.commit()
    return jsonify(new_rating.to_dict()), 201


@app.route('/ratings', methods=['PUT'])
def update_rating():
    data = request.get_json()
    tconst = data.get('tconst')
    rating_data = request.get_json()
    rating = Rating.query.filter_by(tconst=tconst).first()
    if not rating:
        return jsonify({'error': 'Rating not found'}), 404

    rating.averagerating = rating_data['averagerating']
    rating.numvotes = rating_data['numvotes']
    db.session.commit()
    return jsonify(rating.to_dict())

@app.route('/ratings', methods=['DELETE'])
def delete_rating():
    data = request.get_json()
    tconst = data.get('tconst')
    rating = Rating.query.filter_by(tconst=tconst).first()
    if not rating:
        return jsonify({'error': 'Rating not found'}), 404

    db.session.delete(rating)
    db.session.commit()
    return jsonify({'message': 'Rating deleted successfully'})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
