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
var database = firebase.database(),
    fbDB = firebase.database().ref(),
    storage = firebase.storage(),
    storageRef = storage.ref(),
    imgRef;

// First we sign in the user anonymously
firebase.auth().signInAnonymously().then(function () {
    // first load
    fbDB.once('value').then(function (snapshot) {
        var imagesObj = snapshot.val();

        $.each(imagesObj.image, function (i, v) {
            imgRef = storageRef.child(v.src);

            // Once the sign in completed, we get the download URL of the image
            imgRef.getDownloadURL().then(function (url) {
                // Once we have the download URL, we set it to our img element
                // document.querySelector('img').src = url;
                $('.photowall').append($('<img src="' + url + '"/>'));
            }).catch(function (error) {
                // If anything goes wrong while getting the download URL, log the error
                console.error(error);
            });
        });
    });
});



// Device Camera
if ($('.camera').length) {
    Webcam.set({
        width: $(window).width(),
        height: $(window).height(),
        image_format: 'jpeg',
        jpeg_quality: 90,
        constraints: {
            width: { exact: 500 }
        },
        flip_horiz: true
    });

    Webcam.attach('.camera');

    $('.clicker--btn').on('click', take_snapshot);
}

function take_snapshot() {

    // take snapshot and get image data
    Webcam.snap(function (data_uri) {
        document.getElementById('photo').innerHTML = '<img src="' + data_uri + '"/>';
        Webcam.reset();
    });
}




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