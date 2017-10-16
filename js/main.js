var app = angular.module('app', ['ui.bootstrap']);
app.controller('MainCtrl', function ($scope, $log, $window, $timeout) {
    $scope.loop = {};
    $scope.input = {};
    $scope.input.delay = 1000;

    $scope.message = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("esrl2").contentWindow.angular.element('body').scope();
        $childScope.$apply(function () {
            $childScope.$emit('from-parent', data);
        });
    };

    $scope.timeoutLoop = function (filename) {
        $scope.input.movieLoop = setTimeout(function() {
            if (!$scope.pause) {
                $scope.getFrame(filename, $scope.loop.i);
                $scope.loop.i++;
            }

            if ($scope.loop.i === 12)
                $scope.loop.i = 0;

            if (!$scope.pause)
                $scope.timeoutLoop(filename);
            else {
                clearTimeout($scope.input.movieLoop);
            }
        }, $scope.input.delay);
    };

    $scope.getFrame = function (filename, frame) {
        var filename_frame = filename+"-"+frame+".png";
        var sph = parent.parent.sph;
        sph.show(filename_frame);
        $timeout(function () {
            $scope.message({ frame: frame+1 });
        });
    };

    $scope.$watch('iframeMessage', function (newVal, oldVal) {
        if (newVal && newVal.filename) {
            // if it's a movie
            if(newVal.movie) {
                var filename = newVal.filename.split("-")[0];
                $scope.input.filename = filename;
                $scope.loop.i = 0;
                $scope.pause = false;
                clearTimeout($scope.input && $scope.input.movieLoop);
                $scope.timeoutLoop(filename, $scope.input.delay)
            } else {
                var sph = parent.parent.sph;
                sph.show(newVal.filename);
                if (!newVal.bypassOrient)
                    sph.orient(newVal.lat, newVal.lon);
            }
        }

        if (newVal && newVal.action) {
            switch(newVal.action) {
                case "stepBack":
                    $scope.loop.i--;
                    if ($scope.loop.i < 0)
                        $scope.loop.i = 11;
                    $scope.getFrame($scope.input.filename, $scope.loop.i);
                    break;
                case "stepForward":
                    $scope.loop.i++;
                    if ($scope.loop.i === 12)
                        $scope.loop.i = 0;
                    $scope.getFrame($scope.input.filename, $scope.loop.i);
                    break;
                case "play":
                    $scope.pause = false;
                    $scope.timeoutLoop($scope.input.filename, $scope.input.delay);
                    break;
                case "pause":
                    $scope.pause = true;
                    $scope.loop.i--;
                    break;
                case "setDelay":
                    if (!_.isNaN(newVal.value) && newVal.value >=100 && newVal.value <=2000) {
                        $scope.input.delay = newVal.value;
                    }
                    break;
            }
        }

    });
});