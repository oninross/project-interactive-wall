'use strict';

import firebase from 'firebase';
import Croppie from '../../../../node_modules/croppie/croppie';
import { toaster } from '../../../_assets/interactive-wall/js/_material';
import Hammer from '../../../../node_modules/hammerjs/hammer.min';

export default class Photoapp {
    constructor() {
        if ($('.photoapp').length) {
            const that = this,
                $window = $(window),
                square = $window.width() - 50,
                socket = io();

            var rotation = 0,
                fbDB = firebase.database(),
                fbDBref = fbDB.ref(),
                storage = firebase.storage(),
                storageRef = storage.ref(),
                polaroid = document.querySelector('.photoapp__polaroid'),
                photoAppImg = document.querySelector('.photoapp__img'),
                hiddenBtn = document.querySelector('.photoapp__hidden'),
                date,
                newPostRef,
                blob,
                url,
                name,
                f,
                task;

            that.$loader = $('.photoapp__loader');
            that.$polaroid = $('.photoapp__polaroid');
            that.$viewer = $('.photoapp__viewer');
            that.$controls = $('.photoapp__controls');
            that.$camera = $('.photoapp__btn.-camera');
            that.photoAppView;

            $('.js-take-photo').on('click', function () {
                $('.js-open-photo').trigger('click');
            });

            var hammertime = new Hammer(polaroid);

            hammertime.get('swipe').set({
                direction: Hammer.DIRECTION_VERTICAL
            });

            hammertime.on('swipe', function (e) {
                if (e.angle < 0) {
                    toaster('Uploading image');


                    that.$loader.removeClass('-hide');
                    that.$viewer.addClass('-disabled');
                    that.$controls.addClass('-disabled');
                    that.$polaroid.addClass('-throw');

                    that.photoAppView.result({
                        type: 'base64',
                        size: {
                            width: 500,
                            height: 500
                        }
                    }).then(function (base64) {
                        socket.emit('photo flick', base64);
                    });

                    newPostRef = fbDBref.child('image');
                    date = new Date();

                    that.photoAppView.result({
                        type: 'blob',
                        size: {
                            width: 500,
                            height: 500
                        }
                    }).then(function (blob) {
                        name = "/" + date.getTime() + ".jpg";
                        f = storageRef.child(name);
                        task = f.put(blob);

                        task.on('state_changed', function (snapshot) {
                            console.log(snapshot);
                        }, function (error) {
                            toaster("Unable to save image. -_-");
                            toaster(JSON.stringify(error));
                            that.$viewer.addClass('-disabled');
                            that.$controls.removeClass('-disabled');
                            that.$loader.addClass('-hide');
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
                }
            });

            $('.js-open-photo').on('change', function (e) {
                var tgt = e.target || window.event.srcElement,
                    files = tgt.files;

                that.$controls.removeClass('-disabled');
                that.$camera.addClass('-hide');

                $('body').animate({
                    scrollTop: $(document).height(),
                }, {
                    duration: 500,
                    easing: 'easeOutExpo'
                });

                // FileReader support
                if (FileReader && files && files.length) {
                    var fr = new FileReader();

                    fr.onload = function (e) {
                        photoAppImg.src = fr.result;

                        photoAppImg.onload = function () {
                            if ($('.croppie-container').length) {
                                that.photoAppView.bind({
                                    url: photoAppImg.src
                                });
                            } else {
                                that.photoAppView = new Croppie(photoAppImg, {
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
                                that.photoAppView.rotate(rotation);
                            }, 17);
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
                that.$polaroid.removeClass('-hide');

                that.photoAppView.result({
                    type: 'base64',
                    size: {
                        width: 500,
                        height: 500
                    }
                }).then(function (base64) {
                    that.$polaroid.find('img').attr('src', base64);
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
        const that = this;

        that.photoAppView.destroy();
        that.$viewer.removeClass('-disabled');
        that.$controls.addClass('-disabled');
        that.$camera.removeClass('-hide');
        that.$loader.addClass('-hide');
        that.$polaroid.addClass('-hide').removeClass('-throw');
        $('.photoapp__img').unwrap().attr('src', '');
    }
}
