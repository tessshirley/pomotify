# Pomotify App Documentation
pomotify is a pomodoro timer that uses spotify to provide study and break music in the browser!
https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback

This project utilizes Spotify's open source development platform and web playback API. 
In order to run it, you will need to create a development account and create a .env file with the 
client secret, redirect uri, and client id. You will also need to add the redirect uri to the Spotify project. Then you will be able to run the software using the following commands. 

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Running the App

In the project directory, you can run:

### `npm run start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

In order to run the server, the command: 

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Testing

In order to test this project, we used a combination of manual button presses and automatic logging functions in both the browser and console. The following is the general flow of testing: \

1. Run the app using the commands above
2. Select the "use without login" button to test the timer functionality separate from the spotify functionality
3. Run both the study and break timers to completetion, pausing and resetting once to ensure they are working correctly
4. Exit to main page
5. Login with Spotify to test the music functionality
### Note: you must have a valid Spotify premium subscription and have added the user to the list of users in the Spotify developer backend
6. Repeat the same testing as before, this time paying attention to make sure the music pauses and plays on command and that the playlist switches over when it should between break and study time
7. Logout



