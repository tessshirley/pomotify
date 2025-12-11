import { useState, useEffect } from 'react';

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleAuthentication = async () => {
      console.log('Starting authentication process...');
      console.log('Current URL:', window.location.href);
      
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('access_token');
      const error = urlParams.get('error');
      
      console.log('URL Parameters:', {
        token: token ? `Present (length: ${token.length})` : 'Missing',
        error: error || 'None',
        allParams: Object.fromEntries(urlParams.entries())
      });

      // Handle errors first
      if (error) {
        console.error('Auth error from URL:', error);
        setError(`Authentication failed: ${error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Handle token from URL
      if (token) {
        console.log('New token received from URL, length:', token.length);
        console.log('Token preview:', token.substring(0, 20) + '...');
        await handleNewToken(token);
        return;
      }

      // Check for existing token in localStorage
      const storedToken = window.localStorage.getItem('spotify_access_token');
      if (storedToken) {
        console.log('Found stored token, length:', storedToken.length);
        await validateStoredToken(storedToken);
      } else {
        console.log('ℹNo stored token found in localStorage');
        console.log('LocalStorage contents:', { ...window.localStorage });
      }
    };

    handleAuthentication();
  }, []);

// ADD THIS MISSING FUNCTION
  const validateStoredToken = async (storedToken) => {
    try {
      setIsLoading(true);
      console.log('Validating stored token...');
      const isValid = await validateToken(storedToken);
      
      if (isValid) {
        console.log('Stored token is valid');
        setAccessToken(storedToken);
        setIsAuthenticated(true);
        setError(null);
      } else {
        console.log('Stored token is invalid, removing');
        window.localStorage.removeItem('spotify_access_token');
        setError('Your session has expired. Please login again.');
      }
    } catch (validationError) {
      console.error('Stored token validation error:', validationError);
      window.localStorage.removeItem('spotify_access_token');
      setError('Failed to validate stored token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewToken = async (token) => {
    try {
      setIsLoading(true);
      
      // Enhanced token validation
      if (!token) {
        console.error('Token is null or undefined');
        setError('No token received');
        return;
      }
      
      if (token.length < 10) {
        console.error('Token too short:', token);
        setError('Token appears to be invalid (too short)');
        return;
      }
      
      console.log('🔐 Validating new token...');
      const isValid = await validateToken(token);
      
      if (isValid) {
        console.log('Token validation successful!');
        setAccessToken(token);
        setIsAuthenticated(true);
        setError(null);
        window.localStorage.setItem('spotify_access_token', token);
        console.log('User is now authenticated');
      } else {
        console.error('Token validation failed');
        setError('Received invalid token from authentication. The token may have expired or is incorrect.');
        window.localStorage.removeItem('spotify_access_token');
      }
    } catch (validationError) {
      console.error('Token validation error:', validationError);
      setError('Failed to validate authentication token: ' + validationError.message);
      window.localStorage.removeItem('spotify_access_token');
    } finally {
      setIsLoading(false);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const validateToken = async (token) => {
    try {
      console.log('Making validation request to Spotify...');
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Validation response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Token valid for user:', userData.display_name || userData.id);
        return true;
      } else if (response.status === 401) {
        console.log('Token invalid (401 Unauthorized)');
        return false;
      } else {
        console.log(`Unexpected status ${response.status}, checking response body...`);
        try {
          const errorBody = await response.text();
          console.log('Error response body:', errorBody);
        } catch (e) {
          console.log('Could not read error response body');
        }
        // For non-401 errors, assume token might still be valid
        return true;
      }
    } catch (error) {
      console.error('Token validation network error:', error);
      // Network error doesn't necessarily mean token is invalid
      return true;
    }
  };

  
  const login = () => {
    console.log('Initiating Spotify login...');
    setError(null);
    setIsLoading(true);
    
    // Make sure this matches your backend URL
    const loginUrl = 'http://127.0.0.1:5001/auth/login';
    console.log('Redirecting to backend:', loginUrl);
    window.location.href = loginUrl;
  };

  const logout = () => {
    console.log('Logging out...');
    setAccessToken('');
    setIsAuthenticated(false);
    setError(null);
    window.localStorage.removeItem('spotify_access_token');
    console.log('Logout complete');
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