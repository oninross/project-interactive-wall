// Main javascript entry point
// Should handle bootstrapping/starting application

'use strict';

import $ from 'jquery';
import 'lazyload';
import 'TweenLite';
import 'EasePack';
import 'AttrPlugin';
import 'CSSPlugin';
import 'doT';
import * as firebase from 'firebase/app';

import Photowall from '../../../_modules/organisms/photowall/photowall';
import Photoapp from '../../../_modules/organisms/photoapp/photoapp';

$(() => {
  // Initialize Firebase
  const config = {
    apiKey: "AIzaSyADJcqOiKoPbvk6vXruLrYwZeOufnpzQD0",
    authDomain: "interactivewalll.firebaseapp.com",
    databaseURL: "https://interactivewalll.firebaseio.com",
    projectId: "interactivewalll",
    storageBucket: "interactivewalll.appspot.com",
    messagingSenderId: "1029257900991",
    appId: "1:1029257900991:web:fcf0365c9e2cf5a16d670a"
  };

  firebase.initializeApp(config);

  new Photowall();
  new Photoapp();

  ////////////////////////////
  // Set framerate to 60fps //
  ////////////////////////////
  TweenLite.ticker.fps(60);

  console.log("I'm a firestarter!");
});


// Simple Service Worker to make App Install work (OPTIONAL)
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', function () {
//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker.register('/service-worker.js', { scope: './' })
//         .then(function (registration) {
//           console.log('registered service worker');

//           registration.onupdatefound = function () {
//             // The updatefound event implies that registration.installing is set; see
//             // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
//             const installingWorker = registration.installing;

//             installingWorker.onstatechange = function () {
//               switch (installingWorker.state) {
//                 case 'installed':
//                   if (!navigator.serviceWorker.controller) {
//                     toaster('Caching complete!');
//                   }
//                   break;

//                 case 'redundant':
//                   throw Error('The installing service worker became redundant.');
//               }
//             };
//           };
//         })
//         .catch(function (whut) {
//           console.error('uh oh... ');
//           console.error(whut);
//         });
//     }
//   });

//   window.addEventListener('beforeinstallprompt', function (e) {
//     // e.userChoice will return a Promise. For more details read: http://www.html5rocks.com/en/tutorials/es6/promises/
//     e.userChoice.then(function (choiceResult) {
//       console.log(choiceResult.outcome);

//       if (choiceResult.outcome == 'dismissed') {
//         console.log('User cancelled homescreen install');
//       } else {
//         console.log('User added to homescreen');
//       }
//     });
//   });

//   // Check to see if the service worker controlling the page at initial load
//   // has become redundant, since this implies there's a new service worker with fresh content.
//   if (navigator.serviceWorker && navigator.serviceWorker.controller) {
//     console.log("navigator.serviceWorker.controller.onstatechange:: " + navigator.serviceWorker.controller.onstatechange)
//     navigator.serviceWorker.controller.onstatechange = function (event) {
//       if (event.target.state === 'redundant') {
//         toaster('A new version of this app is available.'); // duration 0 indications shows the toast indefinitely.
//         window.location.reload();
//       }
//     };
//   }
// }
