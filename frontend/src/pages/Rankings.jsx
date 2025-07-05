import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Rankings.css';

const Rankings = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('rating'); 
    const [limit, setLimit] = useState(25); 

    useEffect(() => {
        fetchRankings();
    }, [sortBy, limit]);

    const fetchRankings = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `http://localhost:8000/rankings?sort_by=${sortBy}&limit=${limit}`

            );
            if (!response.ok) {
                throw new Error('Failed to fetch rankings');
            }
            const data = await response.json();
            setRankings(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="rankings-container">
                <div className="loading">   
                    <div className="loading-spinner"></div>
                    <p>Loading rankings...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rankings-container">
                <div className="error-state">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchRankings} className="retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rankings-container">
            <div className='rankings-header'>
                <h1>Anime Rankings</h1>
                <div className='global-stats'>
                    <span className='stat-item'>
                        {rankings.length} Ranked Anime
                    </span>
                    <span className='stat-item'>
                        {rankings.reduce((sum, item) => sum + item.anime.review_count, 0)} Total Reviews
                    </span>
                    <span className='stat-item'>
                        {rankings.reduce((sum, item) => sum + item.anime.user_count, 0)} Contributing Users
                    </span>
                </div>
            </div>

            <div className='controls'>
                <div className='sort-controls'>
                    <label htmlFor='sort-select'>Sort By:</label>
                    <select 
                        id='sort-select' 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className='sort-select'
                    >
                        <option value='rating'>Rating</option>
                        <option value="count">Review Count</option>
                        <option value="recent">Recently Rated</option>
                    </select>
            </div>

            <div className='limit-controls'>
                <label htmlFor='limit-select'>Results Per Page:</label>
                <select 
                    id='limit-select' 
                    value={limit} 
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className='limit-select'
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>

        {rankings.length === 0 ? (
            <div className="empty-state">
                <h2>No Rankings Available</h2>
                <p>It seems there are no rankings to display at the moment.</p>
                <Link to='/' className='cta-btn'>Browse Anime</Link>
            </div>
        ) : (
            <div className="rankings-list">
                {rankings.map((item) => (
                    <div key={item.anime.id} className="ranking-item">
                        <div className="rank-badge">
                            #{item.rank}
                        </div>
                        
                        <div className="anime-poster">
                            <img 
                                src={`https://image.tmdb.org/t/p/w200${item.anime.poster_path}`}
                                alt={item.anime.title || item.anime.name}
                                onError={(e) => {
                                    e.target.src = '/placeholder-anime.png';
                                }}
                            />
                        </div>
                        
                        <div className='anime-details'>
                            <h3>{item.anime.title || item.anime.name}</h3>
                            <p className='anime-year'>
                                {item.anime.first_air_date?.split("-")[0] || item.anime.release_date?.split("-")[0] || 'Unknown Year'}
                            </p>
                            {item.anime.overview && (
                                <p className='anime-overview'>
                                    {item.anime.overview.substring(0, 150)}...
                                </p>
                            )}
                        </div>
                        <div className='ranking-stats'>
                            <div className='average-rating'>
                                <span className='rating-stars'>
                                    {'⭐'.repeat(Math.round(item.anime.average_rating))}
                                </span>
                                <span className='rating-number'>
                                    {item.anime.average_rating.toFixed(1)}
                                </span>
                            </div>

                            <div className="review-stats">
                                <span className='review-count'>
                                    {item.anime.review_count} review{item.anime.review_count !== 1 ? 's' : ''}
                                </span>
                                <span className='user-count'>
                                    {item.anime.user_count} user{item.anime.user_count !== 1 ? 's' : ''}
                                </span>
                            </div>
                            
                            <div className='tmdb-rating'>
                                <span className='tmdb-label'>TMDB Rating:</span>
                                <span className='tmdb-score'>
                                    {item.anime.tmdb_rating ? item.anime.tmdb_rating.toFixed(1) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

}

export default Rankings;