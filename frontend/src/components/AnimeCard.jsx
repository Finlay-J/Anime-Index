import "../css/AnimeCard.css";
import { useState } from "react";
import { useAnimeContext } from "../contexts/AnimeContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import RatingModal from "./RatingModal";

function AnimeCard({ anime }) {
    const { isFavorite, addToFavorite, removeFromFavorite, isLoggedIn, getUserReview } = useAnimeContext();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const favorite = isFavorite(anime.id);
    const userReview = getUserReview(anime.id);

    function onFavoriteClick(e) {
        e.preventDefault();
        
        // If user is not logged in, redirect to login
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (favorite) {
            removeFromFavorite(anime.id);
        } else {
            addToFavorite(anime);
        }
    }

    function onRatingClick(e) {
        e.preventDefault();
        setIsRatingModalOpen(true);
    }

    const renderUserRating = () => {
        if (!userReview || !userReview.rating) return null;
        
        return (
            <div className="user-rating">
                <span className="rating-stars">
                    {'⭐'.repeat(userReview.rating)}
                </span>
                <span className="rating-number">{userReview.rating}/5</span>
            </div>
        );
    };
  return (
    <>
        <div className="anime-card">
              <div className="anime-poster">
                  <img src={`https://image.tmdb.org/t/p/w500${anime.poster_path}`} alt={anime.name || anime.title} />
                  <div className="anime-overlay">
                      <button 
                          className={`favorite-btn ${favorite ? "active" : ""} ${!isLoggedIn ? "login-required" : ""}`} 
                          onClick={onFavoriteClick}
                          title={!isLoggedIn ? "Login to add favorites" : favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                          {!isLoggedIn ? "🔒" : "❤︎"}
                      </button>
                      {favorite && isLoggedIn && (
                          <button 
                              className="rating-btn"
                              onClick={onRatingClick}
                              title={userReview ? "Edit your rating" : "Rate this anime"}
                          >
                              ⭐
                          </button>
                      )}
                  </div>
              </div>
              <div className="anime-info">
                  <h3>{anime.name || anime.title}</h3>
                  <p>{anime.first_air_date?.split("-")[0] || anime.release_date?.split("-")[0]}</p>
                  {renderUserRating()}
              </div>
        </div>
        
        <RatingModal 
            anime={anime}
            isOpen={isRatingModalOpen}
            onClose={() => setIsRatingModalOpen(false)}
        />
    </>
  );
}

export default AnimeCard;
