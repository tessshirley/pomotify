import React from 'react';
import Timer from './timer.js';
import { useSpotifyAuth } from './useSpotifyAuth';
import { useSpotifyPlayer } from './useSpotifyPlayer';
import './App.css';

// You can replace these with your own playlist IDs
const FOCUS_PLAYLIST_ID = '37i9dQZF1DX5UfG5FJqDQC'; // Spotify's "Deep Focus" playlist
const BREAK_PLAYLIST_ID = '37i9dQZF1DX4sWSpwq3LiO'; // Spotify's "Peaceful Piano" playlist

function App() {
  const { accessToken, isAuthenticated, login, logout, error } = useSpotifyAuth();
  const { currentTrack, isPlaying, playerReady, playPlaylist, togglePlayback } = useSpotifyPlayer(accessToken);

  // Debug: Log environment variables and auth state
  React.useEffect(() => {
    console.log('=== SPOTIFY AUTH DEBUG ===');
    console.log('REACT_APP_SPOTIFY_CLIENT_ID:', process.env.REACT_APP_SPOTIFY_CLIENT_ID);
    console.log('REACT_APP_REDIRECT_URI:', process.env.REACT_APP_REDIRECT_URI);
    console.log('Access Token:', accessToken);
    console.log('Authenticated:', isAuthenticated);
    console.log('Error:', error);
    console.log('========================');
  }, [accessToken, isAuthenticated, error]);

  // Handle mode changes from Timer
  const handleModeChange = (newMode) => {
    if (!playerReady) {
      console.log('Player not ready yet');
      return;
    }

    if (newMode === 'focus') {
      playPlaylist(FOCUS_PLAYLIST_ID);
    } else {
      playPlaylist(BREAK_PLAYLIST_ID);
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h1 className="text-4xl font-bold mb-6">Spotify Pomodoro Timer</h1>
          
          {/* Debug info on login screen */}
          {error && (
            <div className="bg-red-900 border border-red-700 p-4 rounded mb-4">
              <strong className="text-red-200">Error:</strong>
              <div className="text-red-300 text-sm mt-1">{error}</div>
              <div className="text-red-400 text-xs mt-2">
                Check your .env file and Spotify Dashboard settings
              </div>
            </div>
          )}
          
          <p className="text-gray-300 mb-8">
            Connect your Spotify account to play focus music during work sessions and relaxing music during breaks.
          </p>
          <button
            onClick={login}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200"
          >
            Login with Spotify
          </button>
          
          {/* Debug info box */}
          <div className="mt-6 p-3 bg-gray-800 rounded text-left">
            <div className="text-sm text-gray-400">
              <div>Client ID: {process.env.REACT_APP_SPOTIFY_CLIENT_ID ? '✅ Loaded' : '❌ Missing'}</div>
              <div>Redirect URI: {process.env.REACT_APP_REDIRECT_URI || '❌ Missing'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Pomodoro Focus</h1>
          <div className="flex items-center space-x-4">
            {playerReady && (
              <span className="text-green-400 text-sm">✓ Player Ready</span>
            )}
            <button
              onClick={logout}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Timer */}
        <Timer onModeChange={handleModeChange} />

        {/* Now Playing */}
        {currentTrack && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={currentTrack.album.images[0]?.url} 
                  alt={currentTrack.album.name}
                  className="w-14 h-14 rounded"
                />
                <div>
                  <div className="font-semibold text-white">{currentTrack.name}</div>
                  <div className="text-gray-400 text-sm">
                    {currentTrack.artists.map(artist => artist.name).join(', ')}
                  </div>
                </div>
              </div>
              <button
                onClick={togglePlayback}
                className="bg-green-500 hover:bg-green-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>
            </div>
          </div>
        )}

        {/* Player Status */}
        {!playerReady && (
          <div className="mt-4 p-3 bg-yellow-900 text-yellow-200 rounded text-sm">
            Loading Spotify player... Make sure Spotify is open on one of your devices.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;