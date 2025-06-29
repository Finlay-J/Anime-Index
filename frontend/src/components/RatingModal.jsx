import { useState, useEffect } from 'react';
import { useAnimeContext } from '../contexts/AnimeContext';
import '../css/RatingModal.css';

const RatingModal = ({ anime, isOpen, onClose }) => {
    const { addOrUpdateReview, getUserReview } = useAnimeContext();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load existing review when modal opens
    useEffect(() => {
        if (isOpen && anime) {
            const existingReview = getUserReview(anime.id);
            if (existingReview) {
                setRating(existingReview.rating);
                setComment(existingReview.comment || '');
            } else {
                setRating(0);
                setComment('');
            }
        }
    }, [isOpen, anime, getUserReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        addOrUpdateReview(anime.id, rating, comment);
        
        // Simulate a brief delay for better UX
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
        }, 500);
    };

    const renderStars = () => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            return (
                <button
                    key={index}
                    type="button"
                    className={`star ${starValue <= (hoverRating || rating) ? 'active' : ''}`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                >
                    ⭐
                </button>
            );
        });
    };

    if (!isOpen || !anime) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Rate & Review</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="anime-info-header">
                    <img 
                        src={`https://image.tmdb.org/t/p/w200${anime.poster_path}`} 
                        alt={anime.name || anime.title}
                        className="anime-poster-small"
                    />
                    <div className="anime-details">
                        <h4>{anime.name || anime.title}</h4>
                        <p>{anime.first_air_date?.split("-")[0] || anime.release_date?.split("-")[0]}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="rating-section">
                        <label>Your Rating:</label>
                        <div className="stars-container">
                            {renderStars()}
                        </div>
                        <span className="rating-text">
                            {rating > 0 ? `${rating}/5 stars` : 'Select a rating'}
                        </span>
                    </div>

                    <div className="comment-section">
                        <label htmlFor="comment">Your Review (optional):</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this anime..."
                            rows={4}
                            maxLength={500}
                        />
                        <small>{comment.length}/500 characters</small>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={rating === 0 || isSubmitting}
                            className="submit-btn"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;
