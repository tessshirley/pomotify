import { useState, useEffect } from 'react';

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Generate Spotify authentication URL
  const getAuthUrl = () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join('%20');

    return `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
  };

  useEffect(() => {
    // Check URL hash for access token (after redirect)
    const hash = window.location.hash;
    if (hash) {
      const token = hash
        .substring(1)
        .split('&')
        .find(elem => elem.startsWith('access_token'))
        ?.split('=')[1];

      if (token) {
        setAccessToken(token);
        setIsAuthenticated(true);
        window.localStorage.setItem('spotify_access_token', token);
        
        // Clean up URL
        window.location.hash = '';
      }
    }

    // Check localStorage for existing token
    const storedToken = window.localStorage.getItem('spotify_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    window.location.href = getAuthUrl();
  };

  const logout = () => {
    setAccessToken(null);
    setIsAuthenticated(false);
    window.localStorage.removeItem('spotify_access_token');
  };

  return { accessToken, isAuthenticated, login, logout };
};