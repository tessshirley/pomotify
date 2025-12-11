import React from 'react';

const FOCUS_PLAYLIST_ID = '1hC5iQAWwA9KhMBdc6umos';
const BREAK_PLAYLIST_ID = '1l8lDo6c0DBRHTNaZC4JT8';

// Mode constants
export const MODE = {
  FOCUS: 'focus',
  BREAK: 'break'
};

// Mode time constants (in seconds)
export const MODE_TIMES = {
  [MODE.FOCUS]: 25 * 60,  // 25 minutes
  [MODE.BREAK]: 5 * 60    // 5 minutes
};

// Mode display names
export const MODE_DISPLAY_NAMES = {
  [MODE.FOCUS]: 'Focus',
  [MODE.BREAK]: 'Break'
};

// Mode colors
export const MODE_COLORS = {
  [MODE.FOCUS]: '#ef4444', // red
  [MODE.BREAK]: '#10b981'  // green
};

// Custom hook for timer logic with music integration
export const useTimer = (initialTime, mode, musicControls = {}) => {
  const { playerReady, isAuthenticated, skipLogin, playPlaylist, togglePlayback, isPlaying } = musicControls;
  const [timeLeft, setTimeLeft] = React.useState(initialTime);
  const [isRunning, setIsRunning] = React.useState(false);

  React.useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const start = () => {
    setIsRunning(true);
    // Auto-play music when timer starts
    if (playerReady && isAuthenticated && !skipLogin) {
      console.log('🎵 Timer started - playing music');
      const playlistId = mode === MODE.FOCUS ? FOCUS_PLAYLIST_ID : BREAK_PLAYLIST_ID;
      playPlaylist(playlistId);
    }
  };

  const pause = () => {
    setIsRunning(false);
    // Auto-pause music when timer pauses
    if (playerReady && isAuthenticated && !skipLogin && isPlaying) {
      console.log('⏸️ Timer paused - pausing music');
      togglePlayback();
    }
  };

  const reset = (newTime) => {
    setIsRunning(false);
    setTimeLeft(newTime);
    // Stop music when timer resets
    if (playerReady && isAuthenticated && !skipLogin && isPlaying) {
      console.log('🔄 Timer reset - pausing music');
      togglePlayback();
    }
  };

  return { timeLeft, isRunning, start, pause, reset, setTimeLeft };
};

// Format time for display
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Timer display component
export const TimerDisplay = ({ timeLeft, mode, isTimerRunning }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px'
    }}>
      <div style={{ position: 'relative' }}>
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
  );
};

// Mode selector component with music integration
export const ModeSelector = ({ mode, onModeChange, musicControls = {} }) => {
  const { playerReady, isAuthenticated, skipLogin, playPlaylist } = musicControls;

  const handleModeChange = (newMode) => {
    onModeChange(newMode);
    // Auto-play music when switching modes
    if (playerReady && isAuthenticated && !skipLogin) {
      const playlistId = newMode === MODE.FOCUS ? FOCUS_PLAYLIST_ID : BREAK_PLAYLIST_ID;
      console.log(`🔄 Switching to ${MODE_DISPLAY_NAMES[newMode]} mode - playing music`);
      playPlaylist(playlistId);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={() => handleModeChange(MODE.FOCUS)}
          style={{
            backgroundColor: mode === MODE.FOCUS ? MODE_COLORS[MODE.FOCUS] : '#374151',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (mode !== MODE.FOCUS) e.target.style.backgroundColor = '#4b5563';
          }}
          onMouseOut={(e) => {
            if (mode !== MODE.FOCUS) e.target.style.backgroundColor = '#374151';
          }}
        >
          {MODE_DISPLAY_NAMES[MODE.FOCUS]}
        </button>
        <button
          onClick={() => handleModeChange(MODE.BREAK)}
          style={{
            backgroundColor: mode === MODE.BREAK ? MODE_COLORS[MODE.BREAK] : '#374151',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (mode !== MODE.BREAK) e.target.style.backgroundColor = '#4b5563';
          }}
          onMouseOut={(e) => {
            if (mode !== MODE.BREAK) e.target.style.backgroundColor = '#374151';
          }}
        >
          {MODE_DISPLAY_NAMES[MODE.BREAK]}
        </button>
      </div>
    </div>
  );
};

// Control buttons component with music integration
export const ControlButtons = ({ 
  isRunning, 
  onStart, 
  onPause, 
  onReset, 
  sessionsCompleted,
  musicControls = {}
}) => {
  const { playerReady, isAuthenticated, skipLogin, isPlaying } = musicControls;

  const handleStart = () => {
    onStart();
    // Music control is now handled in the useTimer hook
  };

  const handlePause = () => {
    onPause();
    // Music control is now handled in the useTimer hook
  };

  const handleReset = () => {
    onReset();
    // Music control is now handled in the useTimer hook
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={handleStart}
          disabled={isRunning}
          style={{
            backgroundColor: isRunning ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isRunning) e.target.style.backgroundColor = '#34d399';
          }}
          onMouseOut={(e) => {
            if (!isRunning) e.target.style.backgroundColor = '#10b981';
          }}
        >
          Start
        </button>

        <button
          onClick={handlePause}
          disabled={!isRunning}
          style={{
            backgroundColor: !isRunning ? '#9ca3af' : '#f59e0b',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: !isRunning ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (isRunning) e.target.style.backgroundColor = '#fbbf24';
          }}
          onMouseOut={(e) => {
            if (isRunning) e.target.style.backgroundColor = '#f59e0b';
          }}
        >
          Pause
        </button>

        <button
          onClick={handleReset}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f87171'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
        >
          Reset
        </button>
      </div>

      {/* Session Counter */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '4px' }}>
          Sessions Completed
        </div>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {sessionsCompleted}
        </div>
      </div>
    </div>
  );
};

// Main timer component with music integration
export const Timer = ({
  mode,
  timeLeft,
  isRunning,
  isTimerRunning,
  sessionsCompleted,
  onStart,
  onPause,
  onReset,
  onModeChange,
  musicControls = {} // Add music controls prop
}) => {
  return (
    <>
      <ModeSelector 
        mode={mode} 
        onModeChange={onModeChange} 
        musicControls={musicControls}
      />
      <TimerDisplay 
        timeLeft={timeLeft} 
        mode={mode} 
        isTimerRunning={isTimerRunning} 
      />
      <ControlButtons
        isRunning={isRunning}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        sessionsCompleted={sessionsCompleted}
        musicControls={musicControls}
      />
    </>
  );
};

export { FOCUS_PLAYLIST_ID, BREAK_PLAYLIST_ID };