from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from typing import Optional, List
from . import models, schemas
from .auth import get_password_hash
import json
from datetime import datetime


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_anime_by_tmdb_id(db: Session, tmdb_id: int):
    return db.query(models.Anime).filter(models.Anime.tmdb_id == tmdb_id).first()

def create_anime(db: Session, anime: schemas.AnimeCreate):

    genre_ids_str = None
    if hasattr(anime, 'genre_ids') and anime.genre_ids:
        if isinstance(anime.genre_ids, list):
            genre_ids_str = ','.join(map(str, anime.genre_ids))
        else:
            genre_ids_str = str(anime.genre_ids)

    db_anime = models.Anime(
        tmdb_id=anime.tmdb_id,
        title=anime.title,
        name=anime.name,
        poster_path=anime.poster_path,
        backdrop_path=anime.backdrop_path,
        overview=anime.overview,
        first_air_date=anime.first_air_date,
        release_date=anime.release_date,
        vote_average=anime.vote_average,
        vote_count=anime.vote_count,
        genre_ids=json.dumps(anime.genre_ids) if anime.genre_ids else None,
        origin_country=anime.origin_country,
        original_language=anime.original_language,
        popularity=anime.popularity
    )
    db.add(db_anime)
    db.commit()
    db.refresh(db_anime)
    return db_anime

def get_or_create_anime(db: Session, anime_data: schemas.AnimeCreate):
    db_anime = get_anime_by_tmdb_id(db, anime_data.tmdb_id)
    if not db_anime:
        db_anime = create_anime(db, anime_data)
    return db_anime

def get_user_favorites(db: Session, user_id: int) -> List[schemas.FavoriteResponse]:
    return db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()

def get_favorite(db: Session, user_id: int, anime_id: int):
    anime = get_anime_by_tmdb_id(db, anime_id)

    if not anime:
        return None
    
    return db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.anime_id == anime.id
    ).first()

def create_favorite(db: Session, user_id: int, anime_data: schemas.AnimeCreate):
   
    db_anime = get_or_create_anime(db, anime_data)

    existing_favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.anime_id == db_anime.id
    ).first()

    if existing_favorite:
        return existing_favorite
    
    db_favorite = models.Favorite(
        user_id=user_id,
        anime_id=db_anime.id
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    return db_favorite

def delete_favorite(db: Session, user_id: int, anime_id: int):
    anime = get_anime_by_tmdb_id(db, anime_id)

    if not anime:
        return None
    
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.anime_id == anime.id
    ).first()

    if favorite:
        db.delete(favorite)
        db.commit()
        return True
    
    return False


def get_user_reviews(db: Session, user_id: int):
    return db.query(models.Review).filter(models.Review.user_id == user_id).all()

def get_user_review_for_anime(db: Session, user_id: int, anime_tmdb_id: int):
    anime = get_anime_by_tmdb_id(db, anime_tmdb_id)
    if not anime:
        return None
    
    return db.query(models.Review).filter(
        models.Review.user_id == user_id,
        models.Review.anime_id == anime.id
    ).first()

def create_or_update_review(db: Session, user_id: int, anime_tmdb_id: int, review_data: schemas.ReviewCreate):
    db_anime = get_or_create_anime(db, review_data.anime_data)

    existing_review = db.query(models.Review).filter(
        models.Review.user_id == user_id,
        models.Review.anime_id == db_anime.id  
    ).first()

    if existing_review:
        existing_review.rating = review_data.rating
        existing_review.comment = review_data.comment
        existing_review.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_review)
        return existing_review
    else:
        db_review = models.Review(
            user_id=user_id,
            anime_id=db_anime.id,
            rating=review_data.rating,
            comment=review_data.comment
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return db_review

def delete_review(db: Session, user_id: int, anime_tmdb_id: int):
    anime = get_anime_by_tmdb_id(db, anime_tmdb_id)

    if not anime:
        return None
    
    review = db.query(models.Review).filter(
        models.Review.user_id == user_id,
        models.Review.anime_id == anime.id
    ).first()

    if review:
        db.delete(review)
        db.commit()
        return True
    
    return False

def get_anime_reviews(db: Session, anime_tmdb_id: int):
    anime = get_anime_by_tmdb_id(db, anime_tmdb_id)
    if not anime:
        return []
    
    return db.query(models.Review).filter(models.Review.anime_id == anime.id).all()

def get_global_rankings(db: Session, sort_by:str = "rating", Limit: int = 50):
    rankings = db.query(
        models.Anime,
        func.avg(models.Review.rating).label("average_rating"),
        func.count(models.Review.id).label("review_count"),
        func.count(func.distinct(models.Review.user_id)).label('user_count')
    ).join(models.Review).group_by(models.Anime.id).having(func.count(models.Review.id) >= 1)

    if sort_by == "rating":
        rankings = rankings.order_by(desc('average_rating'), desc('review_count'))
    elif sort_by == "count":
        rankings = rankings.order_by(desc('review_count'))
    elif sort_by == "recent":
        rankings = rankings.order_by(desc(models.Review.created_at))

    return rankings.limit(Limit).all()