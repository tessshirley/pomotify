import React from 'react';
import Timer from './timer.js';
import { useSpotifyAuth } from './useSpotifyAuth';
import { useSpotifyPlayer } from './useSpotifyPlayer';
import './App.css'; // Using your light theme CSS
import logo from './square.png';

const FOCUS_PLAYLIST_ID = '37i9dQZF1DX5UfG5FJqDQC';
const BREAK_PLAYLIST_ID = '37i9dQZF1DX4sWSpwq3LiO';

function App() {
  const { accessToken, isAuthenticated, login, logout, error } = useSpotifyAuth();
  const { currentTrack, isPlaying, playerReady, playPlaylist, togglePlayback } = useSpotifyPlayer(accessToken);

  // Debug logging
  React.useEffect(() => {
    console.log('Auth status:', { isAuthenticated, error, accessToken: accessToken ? 'Present' : 'Missing' });
  }, [accessToken, isAuthenticated, error]);

  // Handle timer mode changes
  const handleModeChange = (newMode) => {
    if (!playerReady) return;
    
    const playlistId = newMode === 'focus' ? FOCUS_PLAYLIST_ID : BREAK_PLAYLIST_ID;
    playPlaylist(playlistId);
  };


  // Login Screen - Using App.css light theme
  if (!isAuthenticated) {
    return (
      <div className="App">
        <header className="App-header">
          
          {/* You can add a logo here if you want */}
          <img src={logo} className="App-logo" alt="logo" /> 
          
          {/* Simple Title */}
          <h1 style={{ color: '#282c34', marginBottom: '20px' }}>
            Focus Timer
          </h1>
          
          {/* Error Display */}
          {error && (
            <div style={{ 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '16px'
            }}>
              {error}
            </div>
          )}
          
          {/* Description */}
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '18px' }}>
            Connect Spotify to enhance your focus sessions
          </p>
          
          {/* Login Button */}
          <button
            onClick={login}
            style={{
              backgroundColor: '#1DB954', // Spotify green
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1ed760'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1DB954'}
          >
            🎵 Login with Spotify
          </button>

        </header>
      </div>
    );
  }

  // Main App (after login) - Keep dark theme for focus mode
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-medium">Focus Session</h1>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>

        {/* Timer */}
        <div className="mb-8">
          <Timer onModeChange={handleModeChange} />
        </div>

        {/* Now Playing */}
        {currentTrack && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <img 
                src={currentTrack.album.images[0]?.url} 
                alt="Album"
                className="w-12 h-12 rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {currentTrack.name}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  {currentTrack.artists[0]?.name}
                </div>
              </div>
              <button
                onClick={togglePlayback}
                className="bg-green-500 hover:bg-green-600 w-8 h-8 rounded-full flex items-center justify-center text-xs"
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!playerReady && (
          <div className="text-center text-gray-500 text-sm mt-4">
            Connecting to Spotify...
          </div>
        )}

      </div>
    </div>
  );
}

export default App;