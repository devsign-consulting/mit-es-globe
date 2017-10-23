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

    $scope.section = {};
    $scope.section.input = {};
    $scope.section.input.time = "Jan";
    $scope.section.input.press = 200;
    $scope.section.input.field = "pottmp";
    $scope.section.input.lon = 0;
    $scope.section.input.contour = 5;
    $scope.section.flags = {};
    $scope.section.flags.showNow = false;

    $scope.esrl.submit = function () {
        $scope.esrl.flags.showNow = false;
        $scope.submitEsrlForm()
            .then(function () {
                $scope.esrl.flags.showNow = true;
            });

    };

    $scope.section.submit = function () {
        $scope.esrl.flags.showNow = false;
        $scope.submitSectionForm()
            .then(function () {
                $scope.section.flags.showNow = true;
            });

    };

    $scope.submitEsrlForm = function () {
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
        res.action = "esrl";
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

    $scope.submitSectionForm = function () {
        var res = new EsrlResource();
        res.action = "section";
        res.time = $scope.section.input.time;
        res.press = $scope.section.input.press;
        res.field = $scope.section.input.field;
        res.lon = $scope.section.input.lon;
        res.contour = $scope.section.input.contour;

        $scope.isLoading = true;

        return res.$submitForm().then(function (results) {
            $scope.section.filename = "./esrl/output/" + results.filename;
            $scope.isLoading = false;
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
            $scope.submitEsrlForm();
        }
    });

    $scope.$watchCollection('section.input', function () {
        if ($scope.section.flags.showNow) {
            $scope.submitSectionForm();
        }
    });

    $scope.$on('from-parent', function(e, message) {
        if (message && message.frame) {
            $scope.loop = message.frame;
        }

        if (message && message.latlon) {
            // set the lat and lon to where the user clicked
            console.log("== esrl message ==", message);
            var latlon = message.latlon.latlon;
            $scope.esrl.input.lat = latlon[0];
            $scope.esrl.input.lon = latlon[1];
            $scope.section.input.lon = Math.round(latlon[1]);
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