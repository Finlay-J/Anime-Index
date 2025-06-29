const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

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
