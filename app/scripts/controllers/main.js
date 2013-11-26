'use strict';

angular.module('todoApp')
    .controller('MainCtrl', function ($scope, FileService) {



        function init(){
            var file_id = 1;
            FileService.load_file(file_id,function(file)
            {

                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    console.log("read success");
                    console.log(evt.target.result);
                };
                reader.readAsDataURL(file);


                $scope.$flow.addFile(file);


            });
        }



        $scope.$watch('data.blob',function(blob){
            if(blob) {
                console.log('ctrl ');
                FileService.persist({id:1 ,payload : blob});
            }

        },true);

        $scope.$watch('$flow',function(flow){
            if(flow) {
                init();
            }

        });


    });
