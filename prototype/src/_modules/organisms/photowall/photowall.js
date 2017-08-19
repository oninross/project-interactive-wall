'use strict';

import firebase from 'firebase';

export default class Photowall {
    constructor() {
        const fbDB = firebase.database();

        if ($('.photowall').length) {
            fbDB.ref('/image').on("child_added", function (snapshot) {
                var v = snapshot.val();

                $('.photowall').prepend($('<li><img src="' + v.src + '"/></li>'));
            });
        }
    }
}
