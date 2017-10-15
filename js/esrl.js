// http://plnkr.co/edit/EYpEATLGd0B54WpEr7II?p=preview
var esrl = angular.module('app-esrl', ['ngResource', 'app-esrl.services']);
esrl.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

esrl.controller('EsrlChildController', function ($scope, $parentScope, EsrlResource) {
    $scope.esrl = {};
    $scope.esrl.input = {};
    $scope.esrl.flags = {};
    $scope.esrl.flags.moviePlay = true;

    $scope.esrl.input.time = "Jan";
    $scope.esrl.input.press = "1000";
    $scope.esrl.input.field = 'pottmp';
    $scope.esrl.input.lat = 30;
    $scope.esrl.input.lon = 0;
    $scope.esrl.flags.delay = 1000;

    $scope.esrl.submit = function () {
        $scope.esrl.flags.showNow = false;
        $scope.submitForm()
            .then(function () {
                $scope.esrl.flags.showNow = true;
            });

    };

    $scope.submitForm = function () {
        console.log("=== submit form ===");
        var res = new EsrlResource();
        res.time = $scope.esrl.input.time;
        res.press = $scope.esrl.input.press;
        res.field = $scope.esrl.input.field;
        res.lat= $scope.esrl.input.lat;
        res.lon = $scope.esrl.input.lon || 0;
        res.field2 = "none";
        res.flatr = "0, 90";
        res.flon = "zonal av";
        res.fpress = "1000, 200";
        res.fcontour = 5;
        res.model = "clim2.py";
        $scope.isLoading = true;

        return res.$submitForm().then(function (results) {
            $parentScope.$apply(function () {
                if ($scope.esrl.flags.showNow)
                    results.bypassOrient = true;

                if ($scope.esrl.input.time === "year") {
                    results.movie = true;
                    $scope.esrl.flags.movie = true;
                    $scope.esrl.flags.moviePlay = true;
                }


                $parentScope.iframeMessage = results;
                $scope.isLoading = false;
            });

            return;
        });

    };

    $scope.toggleMoviePause = function () {
        $scope.esrl.flags.moviePlay = !$scope.esrl.flags.moviePlay;
        $scope.message({
            action: $scope.esrl.flags.moviePlay ? 'play' : 'pause'
        });
    };

    $scope.stepBack = function () {
        $scope.message({
            action: 'stepBack'
        });
    };

    $scope.stepForward = function () {
        $scope.message({
            action: 'stepForward'
        });
    };

    $scope.setDelay = function () {
        $scope.message({
            action: "setDelay",
            value: $scope.esrl.flags.delay
        });
    };

    /*------ Watches ----*/
    $scope.$watchCollection('esrl.input', function () {
        console.log("=== inputs updated ==", $scope.esrl.input);
        if ($scope.esrl.flags.showNow) {
            // trigger a refresh
            // restart movie if false;
            $scope.esrl.flags.movie = false;
            $scope.esrl.flags.moviePlay = true;

            // pause the main view
            $scope.message({
                action: 'pause'
            });
            $scope.submitForm();
        }
    });

    $scope.$on('from-parent', function(e, message) {
        if (message && message.frame) {
            $scope.loop = message.frame;
        }
    });

    $scope.message = function (data) {
        $parentScope.$apply(function () {
            $parentScope.iframeMessage = data;
        });
    };

    $parentScope.esrlScope = $scope;

});

angular.module('app-esrl.services', []).factory('EsrlResource', function($resource) {
    return $resource('/esrl.php', {}, {
        submitForm: {
            method: 'POST',
            isArray: false,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: function (data, headersGetter) {
                var str = [];
                for (var d in data)
                    str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
                return str.join("&");
            }
        }
    });
});