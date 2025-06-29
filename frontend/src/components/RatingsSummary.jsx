import { useAnimeContext } from '../contexts/AnimeContext';
import '../css/RatingsSummary.css';

const RatingsSummary = ({ favorites }) => {
    const { getUserReview } = useAnimeContext();

    // Get all reviews for favorite anime
    const reviews = favorites
        .map(anime => getUserReview(anime.id))
        .filter(review => review && review.rating > 0);

    if (reviews.length === 0) {
        return null;
    }

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const reviewsWithComments = reviews.filter(review => review.comment && review.comment.trim().length > 0).length;
    
    // Count ratings by star
    const ratingCounts = [1, 2, 3, 4, 5].map(star => 
        reviews.filter(review => review.rating === star).length
    );

    return (
        <div className="ratings-summary">
            <h3>Your Rating Summary</h3>
            <div className="summary-stats">
                <div className="stat-item">
                    <span className="stat-number">{totalReviews}</span>
                    <span className="stat-label">Rated Anime</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{averageRating.toFixed(1)}</span>
                    <span className="stat-label">Average Rating</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{reviewsWithComments}</span>
                    <span className="stat-label">With Reviews</span>
                </div>
            </div>
            
            <div className="rating-distribution">
                <h4>Rating Distribution</h4>
                <div className="distribution-bars">
                    {ratingCounts.map((count, index) => {
                        const star = index + 1;
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                            <div key={star} className="distribution-item">
                                <span className="star-label">{star}⭐</span>
                                <div className="distribution-bar">
                                    <div 
                                        className="distribution-fill" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="count-label">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RatingsSummary;
