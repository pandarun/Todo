'use strict';

angular.module('todoApp')
    .directive('screenshot', function () {
        return {
            template:
                '<img id="screenshot"  src="">'+
                '<canvas style="display:none;"></canvas>',
            restrict: 'E',
            controller : function( $scope, $element, $attrs, $transclude) {


                var videoElement = document.querySelector("video");
                var videoSelect = document.querySelector("select#videoSource");
                var canvas = document.querySelector('canvas');
                var ctx = canvas.getContext('2d');
                var streaming = false;
                var width = 320,
                    height = 0;

                navigator.getUserMedia = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                function snapshot() {
                    if (window.stream) {

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(videoElement, 0, 0,width,height);
                        // "image/webp" works in Chrome.
                        // Other browsers will fall back to image/png.
                        document.querySelector('#screenshot').src = canvas.toDataURL('image/webp');
                    }
                }

                videoElement.addEventListener('click', function(ev){
                    snapshot();
                    ev.preventDefault();
                }, false);

                function gotSources(sourceInfos) {
                    for (var i = 0; i != sourceInfos.length; ++i) {
                        var sourceInfo = sourceInfos[i];
                        var option = document.createElement("option");
                        option.value = sourceInfo.id;
                        if (sourceInfo.kind === 'video') {
                            option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);
                            videoSelect.appendChild(option);
                        } else {
                            console.log('Some other kind of source: ', sourceInfo);
                        }
                    }
                }

                if (typeof MediaStreamTrack === 'undefined'){
                    alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
                } else {
                    MediaStreamTrack.getSources(gotSources);
                }


                function successCallback(stream) {
                    
                    window.stream = stream; // make stream available to console
                    videoElement.src = window.URL.createObjectURL(stream);
                    videoElement.play();
                }

                function errorCallback(error){
                    console.log("navigator.getUserMedia error: ", error);
                }

                this.start = function(){
                    if (!!window.stream) {
                        videoElement.src = null;
                        window.stream.stop();
                    }

                    var videoSource = videoSelect.value;
                    var constraints = {
                        video: {
                            optional: [{sourceId: videoSource}]
                        }
                    };
                    navigator.getUserMedia(constraints, successCallback, errorCallback);
                };

                videoElement.addEventListener('canplay',function(ev){
                    if(!streaming){
                        height = videoElement.videoHeight / (videoElement.videoWidth/width);
                        videoElement.setAttribute('width', width);
                        videoElement.setAttribute('height', height);
                        canvas.setAttribute('width', width);
                        canvas.setAttribute('height', height);
                    }
                    streaming = true;

                });

                videoSelect.onchange = this.start;


            },
            link: function postLink(scope, element, attrs,controller) {

                controller.start();

            }
        };
    });



