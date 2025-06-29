import "../css/Favorites.css";
import { useAnimeContext } from "../contexts/AnimeContext";
import { useAuth } from "../contexts/AuthContext";
import AnimeCard from "../components/AnimeCard";
import LoginPrompt from "../components/LoginPrompt";
import ReviewsList from "../components/ReviewsList";
import RatingsSummary from "../components/RatingsSummary";

function Favorites(){
    const {favorites} = useAnimeContext();
    const { isAuthenticated } = useAuth();

    // Show login prompt if user is not authenticated
    if (!isAuthenticated) {
        return <LoginPrompt message="Please login to view and manage your favorite anime" />;
    }

    if (favorites && favorites.length > 0) {
    return ( 
        <div className="favorites">
            <h2>Your Favorites</h2>

            <RatingsSummary favorites={favorites} />

            <div className="anime-grid">
                {favorites.map(anime => (
                    <AnimeCard anime={anime} key={anime.id} />
                ))}
            </div>

            <ReviewsList favorites={favorites} />
        </div>
    )
    }

    return <div className="favorites-empty">
        <h2>No Favorites</h2>
        <p>You have no favorite anime yet.</p>
    </div>
}

export default Favorites;