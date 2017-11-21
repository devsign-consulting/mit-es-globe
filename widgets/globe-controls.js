var globeControlsWidget = angular.module('globeControlsWidget', ['ngResource', 'app-esrl.services']);

globeControlsWidget.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

globeControlsWidget.controller('GlobeControlsWidgetController', function ($scope, $parentScope, $timeout, EsrlResource) {
    $scope.title = "Potential Temperature";

    $scope.data = {};
    $scope.data.fields = {
        pottmp: "Potential Temperature",
        hgt: "Geopotential Height",
        uwnd: "U-wind",
        vwnd: "V-wind",
        omega: "Omega",
    };

    $scope.esrl = {};
    $scope.esrl.input = {};
    $scope.esrl.flags = {};
    $scope.esrl.flags.moviePlay = true;

    $scope.esrl.input.time = "Jan";
    $scope.esrl.input.press = "1000";
    $scope.esrl.input.field = 'pottmp';
    $scope.esrl.input.lat = 30;
    $scope.esrl.input.lon = 0;
    $scope.esrl.input.contour = true;
    $scope.esrl.input.contourDensity = 20;

    $scope.esrl.flags.delay = "1";
    $scope.esrl.flags.showNow = true;

    // Functions to execute on load
    $timeout(function () {
        $scope.submitEsrlForm();
    });

    $scope.esrl.submit = function () {
        $scope.esrl.flags.showNow = false;
        $scope.submitEsrlForm()
            .then(function () {
                $scope.esrl.flags.showNow = true;
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

        res.contour = true;
        res.contourDensity = $scope.esrl.input.contourDensity;

        res.action = "esrl";
        $scope.isLoading = true;

        $scope.message({
            titleWidget: {
                title: $scope.data.fields[res.field]
            }
        });

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
            value: 1 / $scope.esrl.flags.delay * 1000
        });
    };

    /*------ Watches ----*/
    $scope.$watchCollection('esrl.input', function (newVal, oldVal) {
        console.log("=== globeControls inputs updated ==", newVal);
        if ($scope.esrl.flags.showNow) {
            // trigger a refresh
            // restart movie if false;
            $scope.esrl.flags.movie = false;
            $scope.esrl.flags.moviePlay = true;

            // pause the main view
            $scope.message({
                action: 'pause'
            });

            // do not update if lat lon changes for ESRL
            if (newVal.lat !== oldVal.lat || newVal.lon !== oldVal.lon) {
                // do nothing
            } else {
                if (!$scope.esrlForm.$invalid)
                    $scope.submitEsrlForm();
            }
        }
    });

    $scope.$on('from-parent', function(e, message) {
        console.log("==== globe-controls from-parent===", message);
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

        if (message && message.time) {
            $timeout(function () {
                $scope.esrl.input.time = message.time;
            });
        }

        if (message && message.field) {
            $timeout(function () {
                $scope.esrl.input.field = message.field;
            });
        }
    });

    $scope.message = function (data) {
        $parentScope.$apply(function () {
            $parentScope.iframeMessage = data;
        });
    };

    $scope.openLightboxModal = function (filename) {
        $scope.message({ action: "lightboxModal", input: $scope.section.input, filename });
    };

    $parentScope.esrlScope = $scope;
});