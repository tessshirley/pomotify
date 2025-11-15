import { useState, useEffect } from 'react';

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleAuthentication = async () => {
      console.log('🔍 Checking authentication status...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('access_token');
      const error = urlParams.get('error');
      
      console.log('Current URL:', window.location.href);
      console.log('Token from URL:', token ? '✅ Present' : '❌ Missing');
      console.log('Error from URL:', error || 'None');

      // Handle errors first
      if (error) {
        console.error('❌ Auth error from URL:', error);
        setError(`Authentication failed: ${error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Handle token from URL
      if (token) {
        console.log('✅ New token received from URL');
        await handleNewToken(token);
        return;
      }

      // Check for existing token in localStorage
      const storedToken = window.localStorage.getItem('spotify_access_token');
      if (storedToken) {
        console.log('🔍 Found stored token, validating...');
        await validateStoredToken(storedToken);
      } else {
        console.log('ℹ️ No stored token found');
      }
    };

    handleAuthentication();
  }, []);

  const handleNewToken = async (token) => {
    try {
      setIsLoading(true);
      const isValid = await validateToken(token);
      
      if (isValid) {
        console.log('✅ Token is valid, storing and authenticating');
        setAccessToken(token);
        setIsAuthenticated(true);
        setError(null);
        window.localStorage.setItem('spotify_access_token', token);
      } else {
        console.error('❌ Token validation failed');
        setError('Received invalid token from authentication');
        window.localStorage.removeItem('spotify_access_token');
      }
    } catch (validationError) {
      console.error('❌ Token validation error:', validationError);
      setError('Failed to validate authentication token');
      window.localStorage.removeItem('spotify_access_token');
    } finally {
      setIsLoading(false);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const validateStoredToken = async (storedToken) => {
    try {
      setIsLoading(true);
      const isValid = await validateToken(storedToken);
      
      if (isValid) {
        console.log('✅ Stored token is valid');
        setAccessToken(storedToken);
        setIsAuthenticated(true);
        setError(null);
      } else {
        console.log('❌ Stored token is invalid, removing');
        window.localStorage.removeItem('spotify_access_token');
        setError('Your session has expired. Please login again.');
      }
    } catch (validationError) {
      console.error('❌ Stored token validation error:', validationError);
      window.localStorage.removeItem('spotify_access_token');
      setError('Failed to validate stored token');
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (token) => {
    try {
      console.log('🔐 Validating token with Spotify API...');
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        console.log('✅ Token is valid');
        return true;
      } else {
        console.log('❌ Token validation failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  };

  const login = () => {
    console.log('🚀 Initiating Spotify login...');
    setError(null);
    setIsLoading(true);
    
    // Make sure this matches your backend URL
    const loginUrl = 'http://localhost:5001/auth/login';
    console.log('🔗 Redirecting to backend:', loginUrl);
    window.location.href = loginUrl;
  };

  const logout = () => {
    console.log('👋 Logging out...');
    setAccessToken('');
    setIsAuthenticated(false);
    setError(null);
    window.localStorage.removeItem('spotify_access_token');
    console.log('✅ Logout complete');
  };

  return { 
    accessToken, 
    isAuthenticated, 
    login, 
    logout, 
    error,
    isLoading 
  };
};