'use strict';

import firebase from 'firebase';
import { toaster } from '../../../_assets/interactive-wall/js/_material';
import { iOS } from '../../../_assets/interactive-wall/js/_helper';
import Hammer from '../../../../node_modules/hammerjs/hammer.min';

export default class Photoapp {
  constructor() {
    if ($('.photoapp').length) {
      const that = this;
      const pixelRatio = window.devicePixelRatio || 1;
      const polaroid = document.querySelector('.photoapp__polaroid');

      that.socket = io();
      that.$window = $(window);
      that.$message = $('.photoapp__message');
      that.$polaroid = $('.photoapp__polaroid');
      that.$viewer = $('.photoapp__viewer');
      that.$camera = $('.photoapp__btn.-camera');
      that.$loader = $('.photoapp__loader');
      that.$percent = that.$loader.find('.percent');
      that.isFlicked = false;
      that.rotation = 0;
      that.base64;

      this.CANVAS = document.createElement('canvas');
      this.CONTEXT = this.CANVAS.getContext('2d');
      this.CONTEXT.scale(pixelRatio, pixelRatio);
      this.VIDEO = document.getElementById('video');
      this.VIDEO.setAttribute('playsinline', '');
      this.VIDEO.setAttribute('muted', '');

      this.IMAGE = document.createElement('img');
      this.IMAGE.setAttribute('id', 'image');
      document.body.appendChild(this.IMAGE);

      $('.js-take-photo').on('click', function () {
        that.CONTEXT.drawImage(that.VIDEO, 0, 0, that.VIDEO.width, that.VIDEO.height);

        let imgDataURL = that.CANVAS.toDataURL('image/png');

        that.$camera.addClass('-hide');
        that.$polaroid.removeClass('-hide').css({
          'background-image': `url(${imgDataURL})`
        });

        that.IMAGE.onload = () => {
          that.base64 = imgDataURL;
        };

        that.IMAGE.src = imgDataURL;
      });

      $('.js-delete-photo').on('click', function (e) {
        e.preventDefault();

        that.$polaroid.addClass('-hide');
        that.$camera.removeClass('-hide');
      });

      var hammertime = new Hammer(polaroid);

      hammertime.get('swipe').set({
        direction: Hammer.DIRECTION_VERTICAL
      });

      hammertime.on('swipe', function (e) {
        if (e.angle < 0) {
          toaster('Uploading image');

          that.$message.text('');
          that.$viewer.removeClass('-preview');
          that.$window.off('devicemotion');
          that.isFlicked = true;
          that.flickPhoto();
        }
      });

      this.initCamera();
    }
  }

  async initCamera() {
    const that = this;

    return new Promise((resolve, reject) => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: 'environment'
            },
            audio: false
          })
          .then(stream => {
            that.VIDEO.srcObject = stream;
            that.VIDEO.addEventListener('loadeddata', async () => {
              that.VIDEO.width = that.VIDEO.videoWidth;
              that.VIDEO.height = that.VIDEO.videoHeight;

              that.CANVAS.width = that.VIDEO.videoWidth;
              that.CANVAS.height = that.VIDEO.videoHeight;

              resolve();
            }, false);
          })
          .catch(error => {
            console.error(error);
            that.MESSAGE.textContent = 'I need a camera to identify the hotdog';
          });
      } else {
        reject();
      }
    });
  }

  getLikelihood(likelihood) {
    switch (likelihood) {
      case 'UNKNOWN':
        return 0;
        break;
      case 'VERY_UNLIKELY':
        return 1;
        break;
      case 'UNLIKELY':
        return 2;
        break;
      case 'POSSIBLE':
        return 3;
        break;
      case 'LIKELY':
        return 4;
        break;
      case 'VERY_LIKELY':
        return 5;
        break;
    }
  }

  deviceMotion(e, that) {
    if (iOS() && e.originalEvent.acceleration.y > 15 && !that.isFlicked) {
      that.isFlicked = true;
      console.log('flick')
      that.flickPhoto();
    } else if (!iOS() && e.originalEvent.acceleration.y < -15 && !that.isFlicked) {
      that.isFlicked = true;
      console.log('flick')
      that.flickPhoto();
    }
  }

  flickPhoto() {
    const that = this,
      fbDB = firebase.database(),
      storage = firebase.storage(),
      fbDBref = fbDB.ref(),
      storageRef = storage.ref(),
      date = new Date();

    var progress = 0,
      newPostRef,
      task;

    that.$window.off('devicemotion');
    that.$loader.removeClass('-hide');
    that.$viewer.addClass('-disabled');
    that.$polaroid.addClass('-throw');

    var blob = that.b64toBlob(that.base64);
    task = storageRef.child(`/${date.getTime()}.jpg`).put(blob);

    task.on('state_changed', function (snapshot) {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      console.log('Upload is ' + progress + '% done');
      that.$percent.text(progress + '%');
    }, function (error) {
      toaster("Unable to save image. -_-");
      toaster(JSON.stringify(error));
      that.$viewer.addClass('-disabled');
      that.$loader.addClass('-hide');
    }, function () {
      task.snapshot.ref.getDownloadURL().then(function (url) {
        newPostRef = fbDBref.child('image/');
        newPostRef.push({
          "src": url
        }).then(function () {
          toaster('Upload successful! ^_^');

          that.reset();
        });
      }).catch(function (error) {
        console.log(error);
      });
    });
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

    that.isFlicked = false;
    that.$message.text('tap to snap a photo');
    that.$viewer.removeClass('-disabled -preview');
    that.$camera.removeClass('-hide').blur();
    that.$loader.addClass('-hide');
    that.$polaroid.addClass('-hide').removeClass('-throw');
    that.$percent.text('0%');
    $('.photoapp__img').unwrap().attr('src', '');
  }

  b64toBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: 'image/jpeg' });
  }
}
