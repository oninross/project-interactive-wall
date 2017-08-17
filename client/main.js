// Initialize Firebase
var config = {
    apiKey: "AIzaSyAzhfbEZEV5GaMHVjQvLgQB7g6noJvIYMY",
    authDomain: "project-interactive-wall.firebaseapp.com",
    databaseURL: "https://project-interactive-wall.firebaseio.com",
    projectId: "project-interactive-wall",
    storageBucket: "project-interactive-wall.appspot.com",
    messagingSenderId: "602975578099"
};

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

var fbDB = firebase.database().ref(),
    storage = firebase.storage(),
    storageRef = storage.ref(),
    imgRef;

// First we sign in the user anonymously
firebase.auth().signInAnonymously().then(function () {
    fbDB.once('value').then(function (snapshot) {
        var imagesObj = snapshot.val();

        $.each(imagesObj.image, function (i, v) {
            imgRef = storageRef.child(v.src);

            // Once the sign in completed, we get the download URL of the image
            imgRef.getDownloadURL().then(function (url) {
                // Once we have the download URL, we set it to our img element
                // document.querySelector('img').src = url;
                console.log(url)
                $('.photowall').append($('<img src="' + url + '"/>'));
            }).catch(function (error) {
                // If anything goes wrong while getting the download URL, log the error
                console.error(error);
            });
        });
    });
});

// Write to database
// function writeUserData(userId, name, email, imageUrl) {
//     firebase.database().ref('users/' + userId).set({
//         username: name,
//         email: email,
//         profile_picture: imageUrl
//     });
// }





// Initialize Socket.io
var socket = io();



// Event Listeners
$('form').submit(function () {
    // socket.emit('photo post', [DATA_VALUE]);
    return false;
});

socket.on('photo post', function (msg) {
    // DISPLAY SOMETHING
});