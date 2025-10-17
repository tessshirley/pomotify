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

    // handles what happens when timer reaches 0
    const handleTimerComplete = useCallback(() => {
        // if just finished a focus session...
        if(mode === 'focus') {
            // increment completed sessions count
            setSessionsCompleted(prev => prev + 1);
            // switch to break mode
            setMode('break');
            // reset timer to break duration
            setTimerLeft(breakTime);
            // TODO: trigger break music/playlist here
        } else {
            // if just finished a break:
            setMode('focus');
            setTimeLeft(focusTime);
            // TODO: trigger break music/playlist here
        }
    }, [mode, focusTime, breakTime]);
}   