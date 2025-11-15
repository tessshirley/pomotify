import React from 'react';

const FOCUS_PLAYLIST_ID = '37i9dQZF1DX5UfG5FJqDQC';
const BREAK_PLAYLIST_ID = '37i9dQZF1DX4sWSpwq3LiO';

// Custom hook for timer logic
export const useTimer = (initialTime) => {
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

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = (newTime) => {
    setIsRunning(false);
    setTimeLeft(newTime);
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

// Mode selector component
export const ModeSelector = ({ mode, onModeChange }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <button
          onClick={() => onModeChange('focus')}
          style={{
            backgroundColor: mode === 'focus' ? '#ef4444' : '#374151',
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
            if (mode !== 'focus') e.target.style.backgroundColor = '#4b5563';
          }}
          onMouseOut={(e) => {
            if (mode !== 'focus') e.target.style.backgroundColor = '#374151';
          }}
        >
          Focus
        </button>
        <button
          onClick={() => onModeChange('break')}
          style={{
            backgroundColor: mode === 'break' ? '#10b981' : '#374151',
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
            if (mode !== 'break') e.target.style.backgroundColor = '#4b5563';
          }}
          onMouseOut={(e) => {
            if (mode !== 'break') e.target.style.backgroundColor = '#374151';
          }}
        >
          Break
        </button>
      </div>
    </div>
  );
};

// Control buttons component
export const ControlButtons = ({ 
  isRunning, 
  onStart, 
  onPause, 
  onReset, 
  sessionsCompleted 
}) => {
  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={onStart}
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
          onClick={onPause}
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
          onClick={onReset}
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

// Main timer component
export const Timer = ({
  mode,
  timeLeft,
  isRunning,
  isTimerRunning,
  sessionsCompleted,
  onStart,
  onPause,
  onReset,
  onModeChange
}) => {
  return (
    <>
      <ModeSelector mode={mode} onModeChange={onModeChange} />
      <TimerDisplay timeLeft={timeLeft} mode={mode} isTimerRunning={isTimerRunning} />
      <ControlButtons
        isRunning={isRunning}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        sessionsCompleted={sessionsCompleted}
      />
    </>
  );
};

export { FOCUS_PLAYLIST_ID, BREAK_PLAYLIST_ID };