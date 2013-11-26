'use strict';

angular.module('todoApp')
    .directive('screenshot', function () {
        return {
            template:
                '<img id="screenshot"  src="">'+
                '<canvas style="display:none;"></canvas>',
            restrict: 'E',
            scope:{
                for:'@'
            },
            require: 'ngModel',
            controller : function($scope) {


                var videoElement = document.querySelector('#'+ $scope.for);
                var videoSelect = document.querySelector("select#videoSource");
                var canvas = document.querySelector('canvas');
                var ctx = canvas.getContext('2d');
                var streaming = false;
                var width = 320,
                    height = 0;




                navigator.getUserMedia = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


                function convertDataUrlToBlob(dataURL){
                    var data = atob( dataURL.substring( "data:image/png;base64,".length ) ),
                        asArray = new Uint8Array(data.length);

                    for( var i = 0, len = data.length; i < len; ++i ) {
                        asArray[i] = data.charCodeAt(i);
                    }

                    return  new Blob( [ asArray.buffer ], {type: "image/png"} );
                }

                function snapshot() {
                    if (window.stream) {

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(videoElement, 0, 0,width,height);
                        // "image/webp" works in Chrome.
                        // Other browsers will fall back to image/png.
                        var dataUrl = canvas.toDataURL('image/png');
                        document.querySelector('#screenshot').src = dataUrl
                        var blob = convertDataUrlToBlob(dataUrl);
                        $scope.screenshot = blob;
                        $scope.$apply();
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

                $scope.start = this.start;


            },
            link: function postLink(scope, element, attrs,ngModelCtrl) {

                scope.start();

                scope.$watch('screenshot',function(item){
                    if(item){
                        console.log(item);
                        ngModelCtrl.$setViewValue(item);
                    }
                });


            }
        };
    });



