import { useState, useEffect } from "react";
import { searchAnime, getPopularAnime } from "../services/api";
import AnimeCard from "../components/AnimeCard"
import '../css/Home.css';



function Home() {
    const [searchQuery, setSearchQuery] = useState("");

    const [anime, setAnime] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadPopularAnime = async () => {
            try {
                const popularAnime = await getPopularAnime();
                setAnime(popularAnime);
            } catch (err) {
                console.error("Error fetching popular anime:", err);
                setError("Failed to load popular anime.");
            }
            finally {
                setLoading(false);
            }
        }
    
        loadPopularAnime();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return
        if (loading) return

        setLoading(true);
        try {
            const searchResults = await searchAnime(searchQuery)
            setAnime(searchResults)
            setError(null)
        }catch (err) {
            console.error("Error searching anime:", err)
            setError("Failed to search anime.")
        }finally {
            setLoading(false)
        }

        
        
    };
    

    return (
        <div className="home">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search for anime..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {loading ? (<div className="loading">Loading anime...</div>
            ) : (
                <div className="anime-grid">
                    {anime.map(anime => (
                        <AnimeCard anime={anime} key={anime.id} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Home;