var app = angular.module('app', ['ui.bootstrap']);
app.controller('MainCtrl', function ($scope, $log, $window) {
    $scope.loop = {};

    $scope.message = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = $window.frames[0].angular.element($window.frames[0].frameElement).scope();

        $childScope.$apply(function () {
            $childScope.$emit('from-parent', data);
        });
    };

    $scope.timeoutLoop = function (filename, delay) {
        setTimeout(function() {
            $scope.getFrame(filename, $scope.loop.i);
            $scope.loop.i++;
            if ($scope.loop.i === 12)
                $scope.loop.i = 0;

            $scope.timeoutLoop(filename, delay);
        }, delay);
    };

    $scope.getFrame = function (filename, frame) {
        var filename_frame = filename+"-"+frame+".png";
        var sph = parent.parent.sph;
        sph.show("image/tmp/"+ filename_frame);
    };

    $scope.$watch('iframeMessage', function (newVal, oldVal) {
        if (newVal) {
            // if it's a movie
            if(newVal.movie) {
                var i = 0;
                var count = 0;
                var filename = newVal.filename.slice(0,7);
                $scope.loop.i = 0;
                $scope.timeoutLoop(filename, 1000)
            } else {
                var sph = parent.parent.sph;
                sph.show("image/tmp/"+ newVal.filename);
                if (!newVal.bypassOrient)
                    sph.orient(newVal.lat, newVal.lon);
            }
        }
    });

    $scope.$watchCollection("loop", function () {
        console.log("=== watch colleciton loop ===", $scope.loop);
        if (typeof $scope.loop.i !== "undefined")
            $scope.message($scope.loop);
    });
});