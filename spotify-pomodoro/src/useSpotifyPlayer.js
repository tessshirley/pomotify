import { useState, useEffect, useCallback } from 'react';

export const useSpotifyPlayer = (accessToken) => {
  const [player, setPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: 'Pomodoro Focus Timer',
        getOAuthToken: cb => { cb(accessToken); },
        volume: 0.5
      });

      setPlayer(newPlayer);

      // Ready event
      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        setPlayerReady(true);
      });

      // Not Ready event
      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setPlayerReady(false);
      });

      // Player state changed
      newPlayer.addListener('player_state_changed', state => {
        if (!state) {
          console.log('No player state');
          return;
        }
        
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        
        console.log('Currently Playing', state.track_window.current_track);
        console.log('Position in Song', state.position);
        console.log('Duration of Song', state.duration);
      });

      // Connect to the player!
      newPlayer.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [player, accessToken]);

  // Play a specific playlist
  const playPlaylist = useCallback(async (playlistId) => {
    if (!deviceId) {
      console.error('No device ID available');
      return;
    }

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      console.log(`Playing playlist: ${playlistId}`);
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  }, [accessToken, deviceId]);

  // Play/pause toggle
  const togglePlayback = useCallback(async () => {
    if (!deviceId) return;

    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.resume();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [player, isPlaying, deviceId]);

  return {
    player,
    currentTrack,
    isPlaying,
    deviceId,
    playerReady,
    playPlaylist,
    togglePlayback
  };
};