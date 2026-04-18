const BASE_URL = "https://streamify-78bd.vercel.app/api";







// 🎵 GET ALL SONGS (LOCAL)
export const getSongs = async () => {
  const res = await fetch(`${BASE_URL}/songs`);
  return res.json();
};

// 🔎 GLOBAL SEARCH / DISCOVERY (TAMIL HITS, ETC.)
export const discoverSongs = async (query: string) => {
  try {
    const res = await fetch(`${BASE_URL}/discover?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    
    // Exact mapping logic from Web App
    const rawData = data?.data?.results || data?.data?.songs || data?.data || data?.results || [];
    const items = Array.isArray(rawData) ? rawData : (rawData.results || rawData.songs || []);
    
    return items.map((item: any) => {
      // Robust Image Selection
      let img = "";
      if (Array.isArray(item.image)) {
          img = item.image[item.image.length - 1]?.url || item.image[item.image.length - 1]?.link || item.image[0]?.url || "";
      } else {
          img = item.image || "";
      }

      // Robust Download URL Selection
      let songUrl = "";
      if (Array.isArray(item.downloadUrl)) {
          songUrl = item.downloadUrl[item.downloadUrl.length - 1]?.url || item.downloadUrl[item.downloadUrl.length - 1]?.link || item.downloadUrl[0]?.url || "";
      } else {
          songUrl = item.url || "";
      }

      return {
        _id: item.id || item._id,
        title: item.name || item.title || "Unknown Title",
        artist: item.primaryArtists || item.artist || item.artists?.primary?.[0]?.name || "Online Hit",
        image: img || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
        url: songUrl,
        category: 'Discover'
      };
    });
  } catch (err) {
    console.error("Discovery error:", err);
    return [];
  }
};


// 🔑 LOGIN
export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// 🔐 SIGNUP
export const signupUser = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// 📚 GET USER LIBRARY (LIKED SONGS, PLAYLISTS)
export const getUserLibrary = async (userId: string) => {
  try {
    const res = await fetch(`${BASE_URL}/user/${userId}`);
    const data = await res.json();
    if (data.success) {
        return {
            favorites: data.user.favorites || [],
            playlists: data.user.playlists || []
        };
    }
    return { favorites: [], playlists: [] };
  } catch (err) {
    console.error("Library fetch error:", err);
    return { favorites: [], playlists: [] };
  }
};

// ❤️ SYNC FAVORITES
export const syncFavorites = async (userId: string, favorites: any[]) => {
    try {
        const res = await fetch(`${BASE_URL}/user/${userId}/favorites`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites }),
        });
        return await res.json();
    } catch (err) {
        console.error("Favorite sync error:", err);
        return { success: false };
    }
};

// 📂 SYNC PLAYLISTS
export const syncPlaylists = async (userId: string, playlists: any[]) => {
    try {
        const res = await fetch(`${BASE_URL}/user/${userId}/playlists`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playlists }),
        });
        return await res.json();
    } catch (err) {
        console.error("Playlist sync error:", err);
        return { success: false };
    }
};
