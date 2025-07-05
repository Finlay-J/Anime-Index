const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const BACKEND_URL = "http://localhost:8000";

export const getPopularAnime = async () => {
  try {
    const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_keywords=210024&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc`);
    if (!response.ok) {
      throw new Error("Failed to fetch popular anime");
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching popular anime:", error);
    return [];
  }
};

export const searchAnime = async (query) => {
  try { 
    const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&with_genres=16&with_keywords=210024&with_origin_country=JP&with_original_language=ja&sort_by=popularity.desc&query=${encodeURIComponent(
         query
        )}`
    );
    if (!response.ok) {
      throw new Error("Failed to search anime");
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
}

export const authenticateUser = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate user");
    }

    return await response.json();

  } catch (error) {
    console.error("Error authenticating user:", error);
    throw error;
  }
};

export const registerUser = async (email, password) => {
  try { 
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password})
    });

    if (!response.ok) {
      throw new Error("Failed to register user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;  
  }
};

export const getUserFavorites = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/anime/favorites`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user favorites");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    throw error;
  }  
};

export const addToFavorites = async (token, animeId, animeData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/anime/favorites/${animeId}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anime_data:{
          tmdb_id: animeId,
          title: animeData.title,
          name: animeData.name,
          poster_path: animeData.poster_path,
          overview: animeData.overview,
          first_air_date: animeData.first_air_date,
          vote_average: animeData.vote_average,
          vote_count: animeData.vote_count
        }
       })
    });

    if (!response.ok) {
      throw new Error("Failed to add to favorites");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (token, animeId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/anime/favorites/${animeId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to remove from favorites");
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const createOrUpdateReview = async (token, animeId, animeData, rating, comment)  => {
  try {
    const response = await fetch(`${BACKEND_URL}/reviews/${animeId}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating,
        comment,
        anime_data: {
          tmdb_id: animeId,
          title: animeData.title,
          name: animeData.name,
          poster_path: animeData.poster_path,
          overview: animeData.overview,
          first_air_date: animeData.first_air_date,
          vote_average: animeData.vote_average,
          vote_count: animeData.vote_count
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to create or update review");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating or updating review:", error);
    throw error;
  }
};

export const getGlobalRankings = async (sortBy= 'rating', Limit = 25) => {
  try {
    const response = await fetch(`${BACKEND_URL}/rankings?sort_by=${sortBy}&limit=${Limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch global rankings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching global rankings:", error);
    return [];
  }
};

export const getUserReviews = async (token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/reviews`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user reviews");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
};
