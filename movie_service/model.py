from flask import Flask
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()

class Ratings(db.Model):
    __tablename__ = 'ratings'
    tconst = db.Column(db.String(100), primary_key=True)
    averagerating = db.Column(db.Float)
    numvotes = db.Column(db.Integer)

class ActorData(db.Model):
    __tablename__ = 'actor_data'
    tconst = db.Column(db.String(100), primary_key=True)
    ordering = db.Column(db.Integer)
    nconst = db.Column(db.String(100))
    category = db.Column(db.String(100))
    job = db.Column(db.String(100))
    characters = db.Column(db.String(100))

class CrewData(db.Model):
    __tablename__ = 'crew_data'
    tconst = db.Column(db.String(100), primary_key=True)
    directors = db.Column(db.String(5000))
    writers = db.Column(db.String(500))
    nconst = db.Column(db.String(100))
    primaryname = db.Column(db.String(5000))
    birthyear = db.Column(db.Float)
    deathyear = db.Column(db.Float)
    knownfortitles = db.Column(db.String(5000))
    titletype = db.Column(db.String(5000))
    primarytitle = db.Column(db.String(6400))
    originaltitle = db.Column(db.String(5000))
    endyear = db.Column(db.String(5000))
    isadult = db.Column(db.Float)
    genres = db.Column(db.String(5000))

class MovieDetails(db.Model):
    __tablename__ = 'movie_details'
    tconst = db.Column(db.String(100), primary_key=True)
    primarytitle = db.Column(db.String(5000))
    originaltitle = db.Column(db.String(5000))
    startyear = db.Column(db.Float)
    genres = db.Column(db.String(5000))
    runtimeminutes = db.Column(db.Float)
    language = db.Column(db.String(5000))
    region = db.Column(db.String(5000))
    release_year = db.Column(db.Float)
