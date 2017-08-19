'use strict';

import firebase from 'firebase';
import masonry from 'masonry';
import imagesloaded from 'imagesloaded';

export default class Photowall {
    constructor() {
        const $photoWall = $('.photowall ul');

        if ($photoWall.length) {
            const fbDB = firebase.database(),
                socket = io();

            socket.on('photo flick', function (data) {
                // Do something funky
            });

            $photoWall.masonry({
                itemSelector: ".photowall li",
                columnWidth: ".photowall__sample"
            });


            fbDB.ref('/image').on("child_added", function (snapshot) {
                var v = snapshot.val(),
                    $items = $('<li><img src="' + v.src + '"/></li>');

                $photoWall.prepend($items).masonry('prepended', $items).imagesLoaded().done(function (instance) {
                    $photoWall.masonry({
                        itemSelector: ".photowall li",
                        columnWidth: ".photowall__sample"
                    })
                });
            });
        }
    }
}
