const express = require('express')
const request = require('request')
const cors = require('cors')
const dotenv = require('dotenv');

const port = 5001
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000' // ADD THIS

dotenv.config()

var spotify_client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET

// Validate environment variables
if (!spotify_client_id || !spotify_client_secret) {
  console.error('❌ MISSING ENVIRONMENT VARIABLES:');
  console.error('REACT_APP_SPOTIFY_CLIENT_ID:', spotify_client_id ? '✓' : '✗');
  console.error('REACT_APP_SPOTIFY_CLIENT_SECRET:', spotify_client_secret ? '✓' : '✗');
  process.exit(1);
}

var app = express();

// Enable CORS for all routes
app.use(cors())
// Parse JSON bodies
app.use(express.json())

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/auth/login', (req, res) => {
  console.log('🚀 Starting Spotify authentication flow...');
  
  var scope = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state"
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: "http://127.0.0.1:5001/auth/callback",
    state: state
  })

  console.log('🔗 Redirecting to Spotify authorization...');
  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', (req, res) => {
  console.log('📥 Received callback from Spotify');
  console.log('Query params:', req.query);
  
  var code = req.query.code;
  var state = req.query.state;
  var error = req.query.error;

  if (error) {
    console.error('❌ Spotify returned error:', error);
    return res.redirect(`${FRONTEND_URL}/?error=spotify_${error}`);
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return res.redirect(`${FRONTEND_URL}/?error=no_code`);
  }

  console.log('✅ Received authorization code from Spotify');

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: "http://127.0.0.1:5001/auth/callback",
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      console.log('✅ Successfully got access token!');
      console.log('🔗 Redirecting to frontend with token...');
      
      // Redirect to FRONTEND with token
      res.redirect(`${FRONTEND_URL}/?access_token=${access_token}`);
    } else {
      console.error('❌ Error getting token from Spotify:');
      console.error('Status:', response?.statusCode);
      console.error('Error:', error);
      console.error('Body:', body);
      
      const errorMessage = body?.error || 'token_failed';
      res.redirect(`${FRONTEND_URL}/?error=${errorMessage}`);
    }
  });
})

app.get('/auth/token', (req, res) => {
  res.json({ 
    access_token: req.query.access_token || '',
    status: 'success'
  });
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    port: port,
    client_id_loaded: !!spotify_client_id,
    client_secret_loaded: !!spotify_client_secret,
    frontend_url: FRONTEND_URL
  });
})

// Debug endpoint to check environment
app.get('/debug', (req, res) => {
  res.json({
    spotify_client_id: spotify_client_id ? '✓ Loaded' : '✗ Missing',
    spotify_client_secret: spotify_client_secret ? '✓ Loaded' : '✗ Missing',
    frontend_url: FRONTEND_URL,
    backend_port: port
  });
})

app.listen(port, () => {
  console.log(`🎯 Backend server listening at http://127.0.0.1:${port}`);
  console.log(`🔑 Spotify Client ID: ${spotify_client_id ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🔐 Spotify Client Secret: ${spotify_client_secret ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🏥 Health check: http://127.0.0.1:${port}/health`);
  console.log(`🐛 Debug info: http://127.0.0.1:${port}/debug`);
})