// Callback.js
import { useEffect } from 'react';
import { useSpotifyAuth } from './useSpotifyAuth';

const Callback = () => {
  const { accessToken, isAuthenticated, error } = useSpotifyAuth();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Redirect to main app after successful authentication
      window.location.href = '/';
    }
  }, [isAuthenticated, accessToken]);

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <p>Processing authentication...</p>
    </div>
  );
};

export default Callback;