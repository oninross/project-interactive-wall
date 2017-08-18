$(() => {
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
    var fbDB = firebase.database(),
        fbDBref = fbDB.ref(),
        storage = firebase.storage(),
        storageRef = storage.ref(),
        d,
        imgRef,
        newPostRef,
        file,
        blob;

    // First we sign in the user anonymously
    if ($('.photowall').length) {
        fbDB.ref('/image').on("child_added", function (snapshot) {
            var v = snapshot.val();

            $('.photowall').prepend($('<img src="' + v.src + '"/>'));
        });
    }



    // Device Camera
    if ($('.app').length) {
        var video = document.querySelector('#camera-stream'),
            start_camera = document.querySelector('#start-camera'),
            image = document.querySelector('#snap'),
            controls = document.querySelector('.controls'),
            take_photo_btn = document.querySelector('#take-photo'),
            delete_photo_btn = document.querySelector('#delete-photo'),
            upload_photo_btn = document.querySelector('#upload-photo'),
            hidden_photo_btn = document.querySelector('#hidden-photo'),
            error_message = document.querySelector('#error-message'),
            canvas = document.querySelector('#canvas');

        controls.classList.add("visible");

        take_photo_btn.addEventListener("click", function (e) {
            e.preventDefault();

            hidden_photo_btn.click();
        })

        hidden_photo_btn.addEventListener("change", function (e) {
            // Show image.
            var tgt = e.target || window.event.srcElement,
                files = tgt.files;

            // FileReader support
            if (FileReader && files && files.length) {
                var fr = new FileReader(),
                    context = canvas.getContext('2d');

                fr.onload = function (e) {
                    image.src = fr.result;
                    image.classList.add("visible");

                    image.onload = function () {
                        // draw cropped image
                        var scale = image.naturalWidth / $(window).width(),
                            // sx = 0,
                            // sy = 0,
                            // swidth = image.naturalWidth,
                            // sheight = image.naturalHeight,
                            // width = image.naturalWidth / scale,
                            // height = image.naturalHeight / scale,
                            // x = 0,
                            // y = 0;
                            sx = $('#crop-viewer').offset().left * scale,
                            sy = $('#crop-viewer').offset().top * scale,
                            swidth = $('#crop-viewer').width() * scale,
                            sheight = $('#crop-viewer').height() * scale,
                            width = 1000,
                            height = 1000,
                            x = 0,
                            y = 0;

                        // img         Specifies the image, canvas, or video element to use
                        // sx          Optional. The x coordinate where to start clipping
                        // sy          Optional. The y coordinate where to start clipping
                        // swidth      Optional. The width of the clipped image
                        // sheight     Optional. The height of the clipped image
                        // x           The x coordinate where to place the image on the canvas
                        // y           The y coordinate where to place the image on the canvas
                        // width       Optional. The width of the image to use (stretch or reduce the image)
                        // height      Optional. The height of the image to use (stretch or reduce the image)
                        // canvas.width = image.naturalWidth / scale;
                        // canvas.height = image.naturalHeight / scale;
                        canvas.width = 1000;
                        canvas.height = 1000;
                        context.drawImage(image, sx, sy, swidth, sheight, x, y, width, height);
                    };
                };

                fr.readAsDataURL(files[0]);
            } else {
                // fallback -- perhaps submit the input to an iframe and temporarily store
                // them on the server until the user's session ends.
            }


            // Enable delete and save buttons
            delete_photo_btn.classList.remove("disabled");
            upload_photo_btn.classList.remove("disabled");
        });

        upload_photo_btn.addEventListener("click", function (e) {
            e.preventDefault();

            newPostRef = fbDBref.child('image');
            d = new Date();

            canvas.toBlob(function (blob) {
                var name = "/" + d.getTime() + ".jpg",
                    f = storageRef.child(name),
                    task = f.put(blob);

                task.on('state_changed', function (snapshot) {
                }, function (error) {
                    alert("Unable to save image.");
                    alert(JSON.stringify(error));
                }, function () {
                    var url = task.snapshot.downloadURL;
                    console.log("Saved to " + url);

                    newPostRef.push({
                        "src": url
                    }).then(function () {
                        alert('upload successful')
                    });
                });
            });
        });

        delete_photo_btn.addEventListener("click", function (e) {

            e.preventDefault();

            // Disable delete and save buttons
            delete_photo_btn.classList.add("disabled");
            upload_photo_btn.classList.add("disabled");
        });

        function dataURLtoBlob(dataurl) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        function displayErrorMessage(error_msg, error) {
            error = error || "";
            if (error) {
                console.log(error);
            }

            error_message.innerText = error_msg;

            hideUI();
            error_message.classList.add("visible");
        }


        function hideUI() {
            // Helper function for clearing the app UI.

            controls.classList.remove("visible");
            // start_camera.classList.remove("visible");
            // video.classList.remove("visible");
            snap.classList.remove("visible");
            error_message.classList.remove("visible");
        }
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
});