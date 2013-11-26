'use strict';

angular.module('todoApp')
  .service('FileService', function FileService() {
    // AngularJS will instantiate a singleton by calling "new" on this function

        function errorHandler(e) {
            var msg = '';

            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
            };

            console.log('Error: ' + msg);
        }

        this.load_file = function(file_id, onload)
        {


            function onInitFs(fs) {

                fs.root.getFile(file_id, {}, function(fileEntry) {

                    // Get a File object representing the file,
                    // then use FileReader to read its contents.
                    fileEntry.file(onload, errorHandler);

                }, errorHandler);

            }

            var type = window.PERSISTENT;
            var size = 300 * 1024 * 1024 ; // 300 MB
            window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(type, size, onInitFs, errorHandler);
        }


        this.persist = function(file){
            // Note: The file system has been prefixed as of Google Chrome 12:
            window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
            var type = window.PERSISTENT;
            var size = 300 * 1024 * 1024 ; // 300 MB
//            window.requestFileSystem(type, size, successCallback, errorHandler)

            function onInitFs(fs) {

                fs.root.getFile(file.id, {create: true, exclusive: true}, function(fileEntry) {

                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function(fileWriter) {

                        fileWriter.onwriteend = function(e) {
                            console.log('Write completed.');
                        };

                        fileWriter.onerror = function(e) {
                            console.log('Write failed: ' + e.toString());
                        };

                        fileWriter.write(file.payload);

                    }, errorHandler);

                }, errorHandler);

            }


            navigator.webkitPersistentStorage.requestQuota(size, function(grantedBytes) {
                window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
            }, function(e) {
                console.log('Error', e);
            });
        }
  });
