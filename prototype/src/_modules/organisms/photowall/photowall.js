'use strict';

import firebase from 'firebase';
import masonry from 'masonry';
import imagesloaded from 'imagesloaded';

export default class Photowall {
    constructor() {
        const that = this,
            $photoWall = $('.photowall ul');

        if ($photoWall.length) {
            const fbDB = firebase.database(),
                socket = io(),
                $window = $(window),
                $polaroid = $('.photoapp__polaroid');

            TweenLite.to($polaroid, 1, {
                x: Math.floor((Math.random() * ($window.width() - $polaroid.width())) + 0),
                y: $window.height() / 2 - $polaroid.height() / 2,
                rotation: that.randomAngle(),
                ease: Expo.easeInOut
            });

            TweenLite.to($polaroid, 1, {
                x: $window.width() / 2 - $polaroid.width() / 2,
                y: $window.height() + 25,
                rotation: that.randomAngle(),
                ease: Expo.easeInOut,
                delay: 2
            });

            socket.on('photo flick', function (data) {
                // Do something funky
                $polaroid.find('img').attr('src', data);
            });

            $photoWall.masonry({
                itemSelector: ".photowall li",
                columnWidth: ".photowall__sample"
            });


            // fbDB.ref('/image').on("child_added", function (snapshot) {
            //     var v = snapshot.val(),
            //         $items = $('<li><img src="' + v.src + '"/></li>');

            //     $photoWall.prepend($items).masonry('prepended', $items).imagesLoaded().done(function (instance) {
            //         $photoWall.masonry({
            //             itemSelector: ".photowall li",
            //             columnWidth: ".photowall__sample"
            //         })
            //     });
            // });
        }
    }

    randomAngle() {
        var negNumber = Math.random() < 0.5 ? -1 : 1,
            randomNumber = Math.floor((Math.random() * 10) + 1),
            angle = 0;

        angle = negNumber * randomNumber;

        return angle;
    }
}
