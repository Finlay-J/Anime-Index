from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from datetime import timedelta, datetime
from typing import List
import httpx
import os
from decouple import config

from .database import engine, get_db
from .models import Base, User
from .schemas import (
    UserCreate, UserResponse, Token, 
    AnimeResponse, FavoriteCreate, FavoriteResponse,
    ReviewCreate, ReviewUpdate, ReviewResponse, AnimeRankingResponse
)
from .auth import authenticate_user, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from .crud import (
    get_user_by_email, create_user, get_user_favorites, 
    create_favorite, delete_favorite, get_favorite,
    get_user_reviews, get_user_review_for_anime, create_or_update_review,
    delete_review, get_anime_reviews, get_global_rankings
)
from . import models


#crate tables
Base.metadata.create_all(bind=engine)

#init fastapi app
app = FastAPI(
    title="Anime Index API",
    description="API for managing anime index",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#health check endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Anime Index API!"}

#auth endpoint
@app.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    db_user = get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    #create user
    new_user = create_user(db=db, user=user)
    return new_user

@app.post("/auth/login", response_model=Token)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user and return access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/protected")
async def protected_route(current_user: models.User = Depends(get_current_user)):
    """A protected route that requires authentication."""
    return {"message": f"Hello {current_user.name}, you are authenticated!"}

@app.get("/anime/popular")
async def get_popular_anime():
    """Fetch popular anime from TMDB."""
    api_key = config('TMDB_API_KEY')
    url = f"https://api.themoviedb.org/3/discover/tv?api_key={api_key}&with_genres=16&with_keywords=210024&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from TMDB")
        
        data = response.json()
        return data.get("results", [])
    
@app.get("/anime/search")
async def search_anime(query: str):
    """Search anime by title."""
    api_key = config("TMDB_API_KEY")
    url = f"https://api.themoviedb.org/3/search/tv?api_key={api_key}&with_genres=16&query={query}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from TMDB")
        
        data = response.json()
        return data.get("results", [])

@app.get("/anime/favorites", response_model=List[AnimeResponse])
async def get_favorites(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's favorite anime."""
    favorites = get_user_favorites(db, current_user.id)
    return [fav.anime for fav in favorites]

@app.post("/anime/favorites/{anime_tmdb_id}", response_model=dict)
async def add_favorite(
    anime_tmdb_id: int,
    favorite_data: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an anime to user's favorites."""
    anime = get_favorite(db, current_user.id, anime_tmdb_id)
    
    if anime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anime already in favorites"
        )
    
    new_favorite = create_favorite(db, current_user.id, favorite_data.anime_data)
    return {"message": "Anime added to favorites", "favorite": new_favorite}


@app.delete("/anime/favorites/{anime_tmdb_id}", response_model=dict)
async def remove_favorite(
    anime_tmdb_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an anime from user's favorites."""
    success = delete_favorite(db, current_user.id, anime_tmdb_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found"
        )
    return {"message": "Anime removed from favorites"}

@app.get("/favorites/check/{anime_tmdb_id}", response_model=dict)
async def check_favorite(
    anime_tmdb_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if an anime is in user's favorites."""
    favorite = get_favorite(db, current_user.id, anime_tmdb_id)
    
    return {"favorite": favorite is not None}


@app.get("/reviews", response_model=List[ReviewResponse])
async def get_user_reviews(
        current_user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        """Get all reviews by the current user."""
        reviews = get_user_reviews(db, current_user.id)
        return reviews

@app.get("/reviews/{anime_tmdb_id}", response_model=ReviewResponse)
async def get_user_review(
    anime_tmdb_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's review for a specific anime."""
    review = get_user_review_for_anime(db, current_user.id, anime_tmdb_id)
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return review

@app.post("/reviews/{anime_tmdb_id}", response_model=ReviewResponse)
async def create_ir_update_review_endpoint(
    anime_tmdb_id: int,
    review_data: ReviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update a review for an anime."""
    review = create_or_update_review(db, current_user.id, anime_tmdb_id, review_data)
    
    return review

@app.delete("/reviews/{anime_tmdb_id}", response_model=dict)
async def delete_review_endpoint(
    anime_tmdb_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review for an anime."""
    success = delete_review(db, current_user.id, anime_tmdb_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    return {"message": "Review deleted successfully"}

@app.get("/anime/{anime_tmdb_id}/reviews", response_model=List[ReviewResponse])
async def get_anime_reviews_endpoint(
    anime_tmdb_id: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a specific anime."""
    reviews = get_anime_reviews(db, anime_tmdb_id)
    
    return reviews

@app.get("/rankings", response_model=List[AnimeRankingResponse])
async def get_rankings(
    sort_by: str = "rating",
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get global anime rankings based on reviews."""
    rankings = get_global_rankings(db, sort_by, limit)
    
    result = []
    for rank, (anime, avg_rating, review_count, user_count) in enumerate(rankings, 1):
        result.append({
            "anime": {
                **anime.__dict__,
                "average_rating": float(avg_rating),
                "review_count": review_count,
                "user_count": user_count,
            },
            "rank": rank
       })
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)