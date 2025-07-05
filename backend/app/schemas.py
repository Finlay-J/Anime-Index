from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
import json

#user schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

#token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None  


class AnimeBase(BaseModel):
    tmdb_id: int
    title: str
    name: str
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    overview: Optional[str] = None
    first_air_date: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    genre_ids: Optional[str] = None
    origin_country: Optional[str] = None
    original_language: Optional[str] = None
    popularity: Optional[float] = None

class AnimeCreate(AnimeBase):
    pass

class AnimeResponse(AnimeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

#favorites
class FavoriteCreate(BaseModel):
    anime_data: AnimeCreate

class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    anime: AnimeResponse
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

    @validator('rating')
    def rating_must_be_between_1_and_10(cls, v):
        if v < 1 or v > 10:
            raise ValueError('Rating must be between 1 and 10')
        return v
    
    @validator('comment')
    def comment_length(cls, v):
        if v and len(v) > 500:
            raise ValueError('Comment must be 500 characters or less')
        return v
    
class ReviewCreate(ReviewBase):
    anime_data: AnimeCreate

class ReviewUpdate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    anime_id: int
    created_at: datetime
    updated_at: datetime
    anime: AnimeResponse
    user: UserResponse

    class Config:
        from_attributes = True

class AnimeWithStats(AnimeResponse):
    average_rating: float
    review_count: int
    user_count: int

class AnimeRankingResponse(BaseModel):
    anime: AnimeWithStats
    rank: int

    