import { useState } from 'react';
import { useAnimeContext } from '../contexts/AnimeContext';
import '../css/ReviewsList.css';

const ReviewsList = ({ favorites }) => {
    const { getUserReview } = useAnimeContext();
    const [sortBy, setSortBy] = useState('rating'); // 'rating', 'title', 'date'

    // Get reviews for all favorite anime
    const reviewedAnime = favorites
        .map(anime => ({
            ...anime,
            review: getUserReview(anime.id)
        }))
        .filter(anime => anime.review && anime.review.rating > 0);

    // Sort reviews
    const sortedReviews = [...reviewedAnime].sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return b.review.rating - a.review.rating;
            case 'title':
                return (a.name || a.title).localeCompare(b.name || b.title);
            case 'date':
                return new Date(b.review.createdAt || 0) - new Date(a.review.createdAt || 0);
            default:
                return 0;
        }
    });

    if (reviewedAnime.length === 0) {
        return (
            <div className="reviews-list">
                <h3>Your Reviews</h3>
                <p className="no-reviews">You haven't rated any anime yet. Click the ⭐ button on your favorite anime to add a rating!</p>
            </div>
        );
    }

    return (
        <div className="reviews-list">
            <div className="reviews-header">
                <h3>Your Reviews ({reviewedAnime.length})</h3>
                <div className="sort-controls">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="rating">Rating</option>
                        <option value="title">Title</option>
                        <option value="date">Date Added</option>
                    </select>
                </div>
            </div>

            <div className="reviews-grid">
                {sortedReviews.map(anime => (
                    <div key={anime.id} className="review-card">
                        <div className="review-anime-info">
                            <img 
                                src={`https://image.tmdb.org/t/p/w92${anime.poster_path}`} 
                                alt={anime.name || anime.title}
                                className="review-poster"
                            />
                            <div className="review-details">
                                <h4>{anime.name || anime.title}</h4>
                                <div className="review-rating">
                                    <span className="stars">{'⭐'.repeat(anime.review.rating)}</span>
                                    <span className="rating-text">{anime.review.rating}/5</span>
                                </div>
                            </div>
                        </div>
                        {anime.review.comment && (
                            <div className="review-comment">
                                <p>"{anime.review.comment}"</p>
                            </div>
                        )}
                        {anime.review.createdAt && (
                            <div className="review-date">
                                {new Date(anime.review.createdAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsList;
