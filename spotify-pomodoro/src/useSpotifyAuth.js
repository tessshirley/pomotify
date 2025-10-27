import { useState, useEffect } from 'react';

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check URL for access token (after redirect from backend)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('access_token');
    const error = urlParams.get('error');
    
    console.log('🔍 Checking URL for auth response:');
    console.log('URL search params:', window.location.search);
    console.log('Token from URL:', token);
    console.log('Error from URL:', error);
    
    if (token) {
      console.log('✅ Token received from URL:', token);
      setAccessToken(token);
      setIsAuthenticated(true);
      window.localStorage.setItem('spotify_access_token', token);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (error) {
      console.error('❌ Auth error from URL:', error);
      setError(`Authentication failed: ${error}`);
    }

    // Check localStorage for existing token
    const storedToken = window.localStorage.getItem('spotify_access_token');
    if (storedToken && !token) {
      console.log('✅ Token found in localStorage');
      setAccessToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    console.log('🚀 Starting Spotify login...');
    setError(null);
    // Use absolute URL to backend on port 5001
    window.location.href = 'http://127.0.0.1:5001/auth/login';
  };

  const logout = () => {
    console.log('👋 Logging out...');
    setAccessToken('');
    setIsAuthenticated(false);
    window.localStorage.removeItem('spotify_access_token');
  };

  return { accessToken, isAuthenticated, login, logout, error };
};