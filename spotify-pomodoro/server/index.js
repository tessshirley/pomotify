const express = require('express')
const request = require('request')
const cors = require('cors')
const dotenv = require('dotenv');

const port = 5001

dotenv.config()

var spotify_client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET

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
  var scope = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state"
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: "http://127.0.0.1:5001/auth/callback",  // Points to backend
    state: state
  })

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
})

app.get('/auth/callback', (req, res) => {
  var code = req.query.code;
  console.log('✅ Received authorization code from Spotify');

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: "http://127.0.0.1:5001/auth/callback",  // Points to backend
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
      // Redirect back to React app with token
      res.redirect('http://127.0.0.1:3001/?access_token=' + access_token);
    } else {
      console.error('❌ Error getting token:', error || body);
      res.redirect('http://127.0.0.1:3001/?error=auth_failed');
    }
  });
})

app.get('/auth/token', (req, res) => {
  // Simple token endpoint
  res.json({ 
    access_token: req.query.access_token || '',
    status: 'success'
  });
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: port });
})

app.listen(port, () => {
  console.log(`🎯 Backend server listening at http://127.0.0.1:${port}`);
  console.log(`🔑 Spotify Client ID: ${spotify_client_id ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🌐 Health check: http://127.0.0.1:${port}/health`);
})