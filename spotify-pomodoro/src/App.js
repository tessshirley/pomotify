import React from 'react';
import { useSpotifyAuth } from './useSpotifyAuth';
import { useSpotifyPlayer } from './useSpotifyPlayer';
import { 
  Timer, 
  useTimer, 
  formatTime,
  FOCUS_PLAYLIST_ID, 
  BREAK_PLAYLIST_ID 
} from './timer';
import './App.css';
import logo from './square.png';
import blanklogo from './blanksquare.png';

function App() {
  const { accessToken, isAuthenticated, login, logout, error } = useSpotifyAuth();
  const { currentTrack, isPlaying, playerReady, playPlaylist, togglePlayback } = useSpotifyPlayer(accessToken);
  
  const [skipLogin, setSkipLogin] = React.useState(false);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [mode, setMode] = React.useState('focus');
  const [sessionsCompleted, setSessionsCompleted] = React.useState(0);

  // Use the custom timer hook
  const { timeLeft, isRunning, start, pause, reset, setTimeLeft } = useTimer(
    mode === 'focus' ? 25 * 60 : 5 * 60
  );

  // Debug logging
  React.useEffect(() => {
    console.log('Auth status:', { isAuthenticated, error, accessToken: accessToken ? 'Present' : 'Missing' });
  }, [accessToken, isAuthenticated, error]);

  // Handle timer completion
  const handleTimerComplete = React.useCallback(() => {
    if (mode === 'focus') {
      setSessionsCompleted(prev => prev + 1);
      setMode('break');
      setTimeLeft(5 * 60);
      if (playerReady) {
        playPlaylist(BREAK_PLAYLIST_ID);
      }
    } else {
      setMode('focus');
      setTimeLeft(25 * 60);
      if (playerReady) {
        playPlaylist(FOCUS_PLAYLIST_ID);
      }
    }
    pause();
    setIsTimerRunning(false);
  }, [mode, playerReady, playPlaylist, setTimeLeft, pause]);

  // Timer countdown effect
  React.useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete, setTimeLeft]);

  // Handle timer mode changes
  const handleModeChange = React.useCallback((newMode) => {
    setMode(newMode);
    if (!playerReady && !skipLogin) return;
    
    if (playerReady) {
      const playlistId = newMode === 'focus' ? FOCUS_PLAYLIST_ID : BREAK_PLAYLIST_ID;
      playPlaylist(playlistId);
    }
  }, [playerReady, skipLogin, playPlaylist]);

  const handleSkipLogin = () => {
    console.log('⏭️ Skipping Spotify login');
    setSkipLogin(true);
  };

  // Timer control functions
  const startTimer = () => {
    start();
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    pause();
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    reset(mode === 'focus' ? 25 * 60 : 5 * 60);
    setIsTimerRunning(false);
  };

  const switchMode = (newMode) => {
    pause();
    setIsTimerRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
    handleModeChange(newMode);
  };

  // Login Screen
  if (!isAuthenticated && !skipLogin) {
    return (
      <div className="App">
        <header className="App-header">
          
          <img src={logo} className="App-logo" alt="logo" /> 
          
          <h1 style={{ color: '#282c34', marginBottom: '20px' }}>
            Focus Timer
          </h1>
          
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
          
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '18px' }}>
            Connect Spotify to enhance your focus sessions
          </p>
          
          <button
            onClick={login}
            style={{
              backgroundColor: '#1DB954',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '10px',
              width: '200px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1ed760'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1DB954'}
          >
            Login with Spotify
          </button>
          
          <button
            onClick={handleSkipLogin}
            style={{
              backgroundColor: '#282c34', 
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: '200px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1b1e23ff'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#282c34'}
          >
            Use without Login
          </button>

        </header>
      </div>
    );
  }

  // Main App
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        
        {/* Centered Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ 
            color: 'white', 
            marginBottom: '8px',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            Focus Session
          </h1>
          
          {skipLogin && !isAuthenticated && (
            <p style={{ 
              color: '#a0a0a0', 
              fontSize: '1rem'
            }}>
              Using timer without Spotify
            </p>
          )}
        </div>

        {/* Timer Section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ position: 'relative' }}>
            {/* Logo that spins :) */}
            <img 
              src={blanklogo} 
              className={`App-logo ${isTimerRunning ? 'spinning' : ''}`}
              alt="logo" 
              style={{
                width: '400px',
                height: '400px',
                borderRadius: '8px',
                opacity: 0.9
              }}
            />
            
            {/* Timer Display Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {/* Timer Display */}
              <div style={{
                color: '#ffffffff',
                fontSize: '2rem',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Timer Components */}
        <Timer
          mode={mode}
          timeLeft={timeLeft}
          isRunning={isRunning}
          isTimerRunning={isTimerRunning}
          sessionsCompleted={sessionsCompleted}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer}
          onModeChange={switchMode}
        />

        {/* Centered Logout Button */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={skipLogin ? () => setSkipLogin(false) : logout}
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#444'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#333'}
          >
            {skipLogin ? 'Back to Login' : 'Logout'}
          </button>
        </div>

        {/* Spotify Player */}
        {currentTrack && isAuthenticated && (
          <div style={{ 
            backgroundColor: '#2d2d2d',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            margin: '0 auto 16px auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}>
              <img 
                src={currentTrack.album.images[0]?.url} 
                alt="Album"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px'
                }}
              />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {currentTrack.name}
                </div>
                <div style={{ 
                  color: '#a0a0a0', 
                  fontSize: '14px'
                }}>
                  {currentTrack.artists[0]?.name}
                </div>
              </div>
              <button
                onClick={togglePlayback}
                style={{
                  backgroundColor: '#1DB954',
                  color: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1ed760'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#1DB954'}
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!playerReady && isAuthenticated && (
          <div style={{ 
            color: '#a0a0a0', 
            textAlign: 'center',
            fontSize: '14px',
            marginTop: '16px'
          }}>
            Connecting to Spotify...
          </div>
        )}
      </div>
    </div>
  );
}

export default App;