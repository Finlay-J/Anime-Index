import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAnimeContext } from '../contexts/AnimeContext';
import { getUserReviews } from '../services/api';
import '../css/Profile.css';

function Profile() {
    const { user } = useAuth();
    const { favorites } = useAnimeContext();
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserReviews = async () => {
            if (user?.token) {
                try {
                    const reviews = await getUserReviews(user.token);
                    setUserReviews(reviews);
                } catch (error) {
                    console.error('Error fetching user reviews:', error);
                }
            }
            setLoading(false);
        };

        fetchUserReviews();
    }, [user]);

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-container">
                <div className="error">User not found</div>
            </div>
        );
    }

    // Calculate statistics
    const totalFavorites = favorites.length;
    const totalReviews = userReviews.length;
    const averageRating = totalReviews > 0 
        ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
        : 0;
    const reviewsWithComments = userReviews.filter(review => review.comment?.trim()).length;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
                <p className="member-since">
                    Member since {new Date(user.registeredTime).toLocaleDateString()}
                </p>
            </div>

            <div className="profile-stats">
                <div className="stat-card">
                    <div className="stat-number">{totalFavorites}</div>
                    <div className="stat-label">Favorite Anime</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{totalReviews}</div>
                    <div className="stat-label">Reviews Written</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{averageRating}</div>
                    <div className="stat-label">Average Rating</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{reviewsWithComments}</div>
                    <div className="stat-label">Detailed Reviews</div>
                </div>
            </div>

            <div className="profile-sections">
                <div className="recent-activity">
                    <h3>Recent Reviews</h3>
                    {userReviews.length > 0 ? (
                        <div className="recent-reviews">
                            {userReviews.slice(0, 5).map((review) => (
                                <div key={review.id} className="recent-review">
                                    <div className="review-anime">
                                        <img 
                                            src={`https://image.tmdb.org/t/p/w92${review.anime.poster_path}`}
                                            alt={review.anime.title || review.anime.name}
                                        />
                                        <div className="review-details">
                                            <h4>{review.anime.title || review.anime.name}</h4>
                                            <div className="review-rating">
                                                {'⭐'.repeat(review.rating)} {review.rating}/5
                                            </div>
                                            {review.comment && (
                                                <p className="review-comment">
                                                    "{review.comment.substring(0, 100)}..."
                                                </p>
                                            )}
                                            <small className="review-date">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-reviews">No reviews yet. Start rating some anime!</p>
                    )}
                </div>

                <div className="rating-distribution">
                    <h3>Rating Distribution</h3>
                    {totalReviews > 0 ? (
                        <div className="distribution-chart">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = userReviews.filter(r => r.rating === rating).length;
                                const percentage = (count / totalReviews) * 100;
                                return (
                                    <div key={rating} className="distribution-bar">
                                        <span className="rating-label">{rating}⭐</span>
                                        <div className="bar">
                                            <div 
                                                className="bar-fill" 
                                                style={{width: `${percentage}%`}}
                                            ></div>
                                        </div>
                                        <span className="rating-count">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="no-data">No rating data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;