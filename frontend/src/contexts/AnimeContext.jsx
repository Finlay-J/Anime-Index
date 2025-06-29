import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AnimeContext = createContext();

export const useAnimeContext = () => {
    return useContext(AnimeContext);
};

export const AnimeProvider = ({children}) => {
    const [favorites, setFavorites] = useState([]);
    const [userReviews, setUserReviews] = useState({});
    const { user } = useAuth();

    // Helper function to get user-specific storage keys
    const getUserFavoritesKey = (userId) => {
        return `favorites_user_${userId}`;
    };

    const getUserReviewsKey = (userId) => {
        return `reviews_user_${userId}`;
    };

    // Load user-specific data when user changes
    useEffect(() => {
        if (user) {
            const userFavoritesKey = getUserFavoritesKey(user.id);
            const userReviewsKey = getUserReviewsKey(user.id);
            
            // Load favorites
            const storedFavs = localStorage.getItem(userFavoritesKey);
            if (storedFavs) {
                setFavorites(JSON.parse(storedFavs));
            } else {
                setFavorites([]);
            }

            // Load reviews
            const storedReviews = localStorage.getItem(userReviewsKey);
            if (storedReviews) {
                setUserReviews(JSON.parse(storedReviews));
            } else {
                setUserReviews({});
            }
        } else {
            setFavorites([]);
            setUserReviews({});
        }
    }, [user]);

    // Save favorites whenever they change
    useEffect(() => {
        if (user) {
            const userFavoritesKey = getUserFavoritesKey(user.id);
            localStorage.setItem(userFavoritesKey, JSON.stringify(favorites));
        }
    }, [favorites, user]);

    // Save reviews whenever they change
    useEffect(() => {
        if (user) {
            const userReviewsKey = getUserReviewsKey(user.id);
            localStorage.setItem(userReviewsKey, JSON.stringify(userReviews));
        }
    }, [userReviews, user]);

    const addToFavorite = (anime) => {
        if (!user) {
            console.warn('User must be logged in to add favorites');
            return;
        }
        setFavorites(prev => [...prev, anime]);
    }
    
    const removeFromFavorite = (animeId) => {
        if (!user) {
            console.warn('User must be logged in to remove favorites');
            return;
        }
        setFavorites(prev => prev.filter(anime => anime.id !== animeId));
        // Also remove review when removing from favorites
        removeReview(animeId);
    }

    const isFavorite = (animeId) => {
        return favorites.some(anime => anime.id === animeId);
    }

    // Rating and Review functions
    const addOrUpdateReview = (animeId, rating, comment = '') => {
        if (!user) {
            console.warn('User must be logged in to add reviews');
            return;
        }

        const review = {
            animeId,
            rating,
            comment: comment.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        setUserReviews(prev => ({
            ...prev,
            [animeId]: review
        }));
    };

    const removeReview = (animeId) => {
        if (!user) {
            console.warn('User must be logged in to remove reviews');
            return;
        }

        setUserReviews(prev => {
            const updated = { ...prev };
            delete updated[animeId];
            return updated;
        });
    };

    const getUserReview = (animeId) => {
        return userReviews[animeId] || null;
    };

    const hasUserReviewed = (animeId) => {
        return !!userReviews[animeId];
    };

    const value = {
        favorites,
        addToFavorite,
        removeFromFavorite,
        isFavorite,
        isLoggedIn: !!user,
        // Rating and review methods
        userReviews,
        addOrUpdateReview,
        removeReview,
        getUserReview,
        hasUserReviewed
    }

    return <AnimeContext.Provider value={value}>
        {children}
    </AnimeContext.Provider>
}
