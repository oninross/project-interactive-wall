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
        var image = document.querySelector('#snap'),
            controls = document.querySelector('.controls'),
            take_photo_btn = document.querySelector('#take-photo'),
            delete_photo_btn = document.querySelector('#delete-photo'),
            upload_photo_btn = document.querySelector('#upload-photo'),
            hidden_photo_btn = document.querySelector('#hidden-photo'),
            error_message = document.querySelector('#error-message'),
            canvas = document.querySelector('#canvas'),
            rotation = 0,
            vanilla;

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
                    square = $(window).width() - 50;

                fr.onload = function (e) {
                    image.src = fr.result;

                    image.onload = function () {
                        if ($('.croppie-container').length) {
                            vanilla.bind({
                                url: image.src
                            });
                        } else {
                            vanilla = new Croppie(image, {
                                enableOrientation: true,
                                viewport: {
                                    height: square,
                                    width: square
                                },
                                showZoomer: false
                            });
                        }

                        getOrientation(hidden_photo_btn.files[0], function (orientation) {
                            switch (orientation) {
                                case 8:
                                    rotation = -90;
                                    break;
                                case 3:
                                    rotation = 180;
                                    break;
                                case 6:
                                    rotation = 90;
                                    break;
                            }
                        });

                        setTimeout(function() {
                            vanilla.rotate(rotation);
                        }, 14);
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

            alert('Uploading image');

            newPostRef = fbDBref.child('image');
            d = new Date();

            vanilla.result('blob').then(function (blob) {
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

            if ($('.croppie-container').length) {
                vanilla.destroy();
                $('#snap').unwrap();
            }

            // Disable delete and save buttons
            delete_photo_btn.classList.add("disabled");
            upload_photo_btn.classList.add("disabled");
        });

        function getOrientation(file, callback) {
            var reader = new FileReader();

            reader.onload = function (event) {
                var view = new DataView(event.target.result);

                if (view.getUint16(0, false) != 0xFFD8) return callback(-2);

                var length = view.byteLength,
                    offset = 2;

                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;

                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) {
                            return callback(-1);
                        }
                        var little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;

                        for (var i = 0; i < tags; i++)
                            if (view.getUint16(offset + (i * 12), little) == 0x0112)
                                return callback(view.getUint16(offset + (i * 12) + 8, little));
                    }
                    else if ((marker & 0xFF00) != 0xFF00) break;
                    else offset += view.getUint16(offset, false);
                }
                return callback(-1);
            };

            reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
        };

        function displayErrorMessage(error_msg, error) {
            error = error || "";
            if (error) {
                console.log(error);
            }

            error_message.innerText = error_msg;

            hideUI();
            error_message.classList.add("visible");
        };

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