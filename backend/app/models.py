from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from datetime import datetime


from .database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)  
    created_at = Column(DateTime, default=datetime)  
    updated_at = Column(DateTime, default=datetime, onupdate=datetime)

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):  
        return f"<User(email={self.email}, name={self.name})>"
    

class Anime(Base):
    __tablename__ = 'anime'

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, nullable=False)
    title = Column(String, nullable=False)
    name = Column(String, nullable=False)
    poster_path = Column(String)
    backdrop_path = Column(String)
    overview = Column(Text)
    first_air_date = Column(String)
    release_date = Column(String)
    vote_average = Column(Float)
    vote_count = Column(Integer)
    genre_ids = Column(String)  # Store as JSON string
    origin_country = Column(String)
    original_language = Column(String)
    popularity = Column(Float)
    created_at = Column(DateTime, default=datetime)


    favorites = relationship("Favorite", back_populates="anime", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="anime", cascade="all, delete-orphan")

    def __repr__(self):  
        return f"<Anime(tmdb_id={self.tmdb_id}, title={self.title or self.name})>"


class Favorite(Base):
    __tablename__ = 'favorites'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    anime_id = Column(Integer, ForeignKey('anime.id'), nullable=False)
    created_at = Column(DateTime, default=datetime)

    user = relationship("User", back_populates="favorites")
    anime = relationship("Anime", back_populates="favorites")

    def __repr__(self):  
        return f"<Favorite(user_id={self.user_id}, anime_id={self.anime_id})>"
    

class Review(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    anime_id = Column(Integer, ForeignKey('anime.id'), nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text)  # Optional review text
    created_at = Column(DateTime, default=datetime)
    updated_at = Column(DateTime, default=datetime, onupdate=datetime)


    user = relationship("User", back_populates="reviews")
    anime = relationship("Anime", back_populates="reviews")

    def __repr__(self):  
        return f"<Review(user_id={self.user_id}, anime_id={self.anime_id}, rating={self.rating})>"