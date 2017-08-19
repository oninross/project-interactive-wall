'use strict';

import firebase from 'firebase';
import Croppie from '../../../../node_modules/croppie/croppie.js';
import { toaster } from '../../../_assets/interactive-wall/js/_material';

const $window = $(window),
    $loader = $('.photoapp__loader'),
    $viewer = $('.photoapp__viewer'),
    $controls = $('.photoapp__controls'),
    $camera = $('.photoapp__btn.-camera'),
    photoAppImg = document.querySelector('.photoapp__img'),
    hiddenBtn = document.querySelector('.photoapp__hidden'),
    square = $window.width() - 50;

var photoAppView;

export default class Photoapp {
    constructor() {
        const that = this;

        var rotation = 0,
            fbDB = firebase.database(),
            fbDBref = fbDB.ref(),
            storage = firebase.storage(),
            storageRef = storage.ref(),
            date,
            newPostRef,
            blob,
            url,
            name,
            f,
            task;

        if ($('.photoapp')) {
            $('.js-take-photo').on('click', function () {
                $('.js-open-photo').trigger('click');
            });

            $('.js-open-photo').on('change', function (e) {
                var tgt = e.target || window.event.srcElement,
                    files = tgt.files;

                $controls.removeClass('-disabled');
                $camera.addClass('-hide');

                // FileReader support
                if (FileReader && files && files.length) {
                    var fr = new FileReader();

                    fr.onload = function (e) {
                        photoAppImg.src = fr.result;

                        photoAppImg.onload = function () {
                            if ($('.croppie-container').length) {
                                photoAppView.bind({
                                    url: photoAppImg.src
                                });
                            } else {
                                photoAppView = new Croppie(photoAppImg, {
                                    enableOrientation: true,
                                    viewport: {
                                        height: square,
                                        width: square
                                    },
                                    showZoomer: false
                                });
                            }

                            that.getOrientation(hiddenBtn.files[0], function (orientation) {
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

                            setTimeout(function () {
                                photoAppView.rotate(rotation);
                            }, 14);
                        };
                    };

                    fr.readAsDataURL(files[0]);
                } else {
                    // fallback -- perhaps submit the input to an iframe and temporarily store
                    // them on the server until the user's session ends.
                }
            });

            $('.js-delete-photo').on('click', function () {
                if ($('.croppie-container').length) {
                    that.reset();
                }
            });

            $('.js-crop-photo').on('click', function () {
                toaster('Uploading image');

                $viewer.addClass('-disabled');
                $controls.addClass('-disabled');
                $loader.removeClass('-hide');

                newPostRef = fbDBref.child('image');
                date = new Date();

                photoAppView.result('blob').then(function (blob) {
                    name = "/" + date.getTime() + ".jpg";
                    f = storageRef.child(name);
                    task = f.put(blob);

                    task.on('state_changed', function (snapshot) {
                        console.log(snapshot);
                    }, function (error) {
                        toaster("Unable to save image. -_-");
                        toaster(JSON.stringify(error));
                        $viewer.addClass('-disabled');
                        $controls.removeClass('-disabled');
                        $loader.addClass('-hide');
                    }, function () {
                        url = task.snapshot.downloadURL;

                        newPostRef.push({
                            "src": url
                        }).then(function () {
                            toaster('Upload successful! ^_^');

                            that.reset();
                        });
                    });
                });
            });
        }
    }

    getOrientation(file, callback) {
        const reader = new FileReader();

        reader.onload = function (event) {
            var view = new DataView(event.target.result);

            if (view.getUint16(0, false) != 0xFFD8) {
                return callback(-2)
            };

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

                    for (var i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                } else if ((marker & 0xFF00) != 0xFF00) {
                    break;
                } else {
                    offset += view.getUint16(offset, false);
                }
            }

            return callback(-1);
        };

        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    }

    reset() {
        photoAppView.destroy();
        $viewer.removeClass('-disabled');
        $controls.addClass('-disabled');
        $camera.removeClass('-hide');
        $loader.addClass('-hide');
        $('.photoapp__img').unwrap().attr('src', '');
    }
}
