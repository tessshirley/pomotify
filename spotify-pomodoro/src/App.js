import Timer from './timer.js';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Spotify Pomodoro Timer</h1>
        <Timer /> {/* This is where your Timer component gets rendered */}
      </div>
    </div>
  );
}

export default App;

