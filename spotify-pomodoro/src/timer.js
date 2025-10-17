import { useState, useEffect, useCallback} from 'react';

const Timer = () => {
    // state declarations with initial values

    // 25 min converted to seconds 
    const[timeLeft, setTimeLeft] = useState(25 * 60);
    // tracks if timer is currently running
    const[isRunning, setIsRunning] = useState(false);
    // current mode: 'focus or 'break'
    const[mode, setMode] = useState('focus');
    //count of completed focus sessions
    const[sessionsCompleted, setSessionsCompleted] = useState(0);

    //timer duration constants in seconds
    const focusTime = 25 * 60;
    const breakTime = 5 * 60;

    // handles what happens when timer reaches 0
    const handleTimerComplete = useCallback(() => {
        // if just finished a focus session...
        if(mode === 'focus') {
            // increment completed sessions count
            setSessionsCompleted(prev => prev + 1);
            // switch to break mode
            setMode('break');
            // reset timer to break duration
            setTimeLeft(breakTime);
            // TODO: trigger break music/playlist here
        } else {
            // if just finished a break:
            setMode('focus');
            setTimeLeft(focusTime);
            // TODO: trigger break music/playlist here
        }
    }, [mode, focusTime, breakTime]);

    // main timer - runs every time isRunning or timeLeft changes
    useEffect(() => {
        // will hold interval ID
        let interval = null;

        // only run the timer if it's running AND there's time left
        if (isRunning && timeLeft > 0) {
            // set up an interval that decreases timeLeft by 1 every second
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // timer has reached 0
            handleTimerComplete();
        }
        // this prevents memory leaks by clearing the interval
        return() => clearInterval(interval);
    }, [isRunning, timeLeft, handleTimerComplete]);

    // timer control functions //
    // start the timer
    const startTimer = () => setIsRunning(true);
    // pause the timer
    const pauseTimer = () => setIsRunning(false);
    // stop the timer 
    const resetTimer = () => {
        setIsRunning(false);
        // reset time based on current mode
        setTimeLeft(mode === 'focus' ? focusTime : breakTime);
    };

    // format seconds into mm:ss display
    const formatTime = (seconds) => {
        // calculate minutes 
        const mins = Math.floor(seconds / 60);
        // calculate remaining seconds
        const secs = seconds % 60;
        //format as mm:ss
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className='timer-container text-center'>
            {/* display current mode (focus time/break time)*/}
            <div className={'mode-indicator ${mode} mb-4'}>
                {mode === 'focus' ? 'Focus Time' : 'Break Time'}
            </div>

            {/* main timer display - large monospace font for readability */}
            <div className="text-6xl font-mono mb-6">
                {formatTime(timeLeft)}
            </div>

            {/* timer control buttons */}
            <div className="controls space-x-4">
                {/* start button - disabled when timer is already running */}
                <button
                    onClick={startTimer}
                    disabled={isRunning}
                    className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    start
                </button>

                {/* pause button - disabled when timer isn't running */}
                <button
                    onClick={pauseTimer}
                    disabled={!isRunning}
                    className="bg-yellow-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                    pause
                </button>

                {/* reset button - always enabled */}
                <button
                    onClick={resetTimer}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    reset
                </button>
            </div>

            {/* session counter display */}
            <div className="sessions mt-4 text-lg">
                Sessions Completed: {sessionsCompleted}
            </div>
        </div>
    );
};

export default Timer;