import { useState, useEffect, useCallback } from 'react';

export const useSpotifyPlayer = (accessToken) => {
  const [player, setPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) {
      console.log('No access token, skipping player initialization');
      return;
    }

    console.log('🎵 Starting Spotify player initialization...');

    // Check if script is already loaded
    if (!window.Spotify) {
      console.log('Loading Spotify Web Playback SDK script...');
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Spotify SDK script loaded successfully');
      };
      
      script.onerror = () => {
        console.error('Failed to load Spotify SDK script');
        setPlayerError('Failed to load Spotify player');
      };
      
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('Spotify Web Playback SDK Ready - Creating player instance');
      initializePlayer();
    };

    // If SDK is already loaded, initialize immediately
    if (window.Spotify) {
      console.log('🎵 Spotify SDK already available, initializing player...');
      initializePlayer();
    }

    function initializePlayer() {
      try {
        console.log('Creating new Spotify Player instance...');
        const newPlayer = new window.Spotify.Player({
          name: 'Pomodoro Focus Timer',
          getOAuthToken: cb => { 
            console.log('Providing access token to player');
            cb(accessToken); 
          },
          volume: 0.5
        });

        setPlayer(newPlayer);

        // Ready event
        newPlayer.addListener('ready', ({ device_id }) => {
          console.log('Player Ready with Device ID:', device_id);
          setDeviceId(device_id);
          setPlayerReady(true);
          setPlayerError(null);
          
          // Automatically transfer playback to this device
          console.log('Attempting to transfer playback to web player...');
          transferPlaybackToDevice(device_id);
        });

        // Not Ready event
        newPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Player Not Ready, Device ID:', device_id);
          setPlayerReady(false);
        });

        // Player state changed
        newPlayer.addListener('player_state_changed', state => {
          console.log('Player State Changed:', state);
          if (!state) {
            console.log('No player state available - player might be inactive');
            setCurrentTrack(null);
            setIsPlaying(false);
            return;
          }
          
          console.log('Track:', state.track_window.current_track?.name);
          console.log('Playing:', !state.paused);
          console.log('Volume:', state.volume);
          console.log('Repeat:', state.repeat_mode);
          console.log('Shuffle:', state.shuffle);
          
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        });

        // Error events
        newPlayer.addListener('initialization_error', ({ message }) => {
          console.error('Initialization Error:', message);
          setPlayerError(`Initialization failed: ${message}`);
        });

        newPlayer.addListener('authentication_error', ({ message }) => {
          console.error('Authentication Error:', message);
          setPlayerError(`Authentication failed: ${message}`);
        });

        newPlayer.addListener('account_error', ({ message }) => {
          console.error('Account Error:', message);
          setPlayerError(`Account error: ${message}`);
        });

        newPlayer.addListener('playback_error', ({ message }) => {
          console.error('Playback Error:', message);
          setPlayerError(`Playback error: ${message}`);
        });

        // Connect to the player
        console.log('Connecting player to Spotify...');
        newPlayer.connect().then(success => {
          console.log(success ? 'Player connected successfully' : 'Player failed to connect');
          if (!success) {
            setPlayerError('Failed to connect to Spotify player');
          }
        });

      } catch (error) {
        console.error('Error initializing Spotify player:', error);
        setPlayerError(`Player initialization failed: ${error.message}`);
      }
    }

    // Function to transfer playback to our device
    const transferPlaybackToDevice = async (device_id) => {
      try {
        console.log(`Transferring playback to device: ${device_id}`);
        const response = await fetch(`https://api.spotify.com/v1/me/player`, {
          method: 'PUT',
          body: JSON.stringify({
            device_ids: [device_id],
            play: false // Don't auto-play, we'll do that manually
          }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
        });

        if (response.ok) {
          console.log('Playback transferred successfully to web player');
        } else if (response.status === 404) {
          console.log('No active device found - this is normal for first time');
        } else {
          console.error(`Transfer failed with status: ${response.status}`);
          const errorText = await response.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('Error transferring playback:', error);
      }
    };

    return () => {
      if (player) {
        console.log(' Cleaning up player...');
        player.disconnect();
      }
    };
  }, [accessToken]);

  // Play a specific playlist
  const playPlaylist = useCallback(async (playlistId) => {
    if (!deviceId || !accessToken) {
      console.error(' Cannot play - missing device ID or access token');
      console.log('Device ID:', deviceId);
      console.log('Access Token:', accessToken ? 'Present' : 'Missing');
      return;
    }

    try {
      console.log(`Attempting to play playlist: ${playlistId}`);
      console.log(`Target device: ${deviceId}`);

      // First, ensure playback is transferred to our device
      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      // Then play the playlist
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (response.ok) {
        console.log(`Successfully started playing playlist: ${playlistId}`);
      } else {
        console.error(`Failed to play playlist: ${response.status}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // If we get a 404, try without device_id (Spotify will use active device)
        if (response.status === 404) {
          console.log('Retrying without device_id parameter...');
          await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            body: JSON.stringify({
              context_uri: `spotify:playlist:${playlistId}`,
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
          });
        }
      }
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  }, [accessToken, deviceId]);

  // Play/pause toggle
  const togglePlayback = useCallback(async () => {
    if (!player || !deviceId) {
      console.error('No player or device ID available for playback toggle');
      return;
    }

    try {
      console.log('Toggling playback, currently:', isPlaying ? 'Playing' : 'Paused');
      
      if (isPlaying) {
        await player.pause();
        console.log(' Playback paused');
      } else {
        await player.resume();
        console.log('Playback resumed');
      }
    } catch (error) {
      console.error(' Error toggling playback:', error);
    }
  }, [player, isPlaying, deviceId]);

  // Manual play function
  const playTrack = useCallback(async (trackUri) => {
    if (!deviceId || !accessToken) return;

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          uris: [trackUri],
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }, [accessToken, deviceId]);

  return {
    player,
    currentTrack,
    isPlaying,
    deviceId,
    playerReady,
    playerError,
    playPlaylist,
    togglePlayback,
    playTrack
  };
};