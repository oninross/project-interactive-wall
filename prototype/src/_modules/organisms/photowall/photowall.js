'use strict';

import firebase from 'firebase';

export default class Photowall {
    constructor() {
        const fbDB = firebase.database(),
            $photoWall = $('.photowall');

        if ($photoWall.length) {
            fbDB.ref('/image').on("child_added", function (snapshot) {
                var v = snapshot.val();

                $photoWall.prepend($('<li><img src="' + v.src + '"/></li>'));
            });
        }
    }
}
