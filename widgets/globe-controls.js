var globeControlsWidget = angular.module('globeControlsWidget', ['ngResource', 'app-esrl.services', 'app-esrl.defaults']);

globeControlsWidget.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

globeControlsWidget.controller('GlobeControlsWidgetController', function ($scope, $parentScope, $timeout, EsrlResource, defaults) {
    $scope.title = "Potential Temperature";

    $scope.data = {};
    $scope.data.fields = {
        pottmp: "Potential Temperature",
        hgt: "Geopotential Height",
        uwnd: "U-wind",
        vwnd: "V-wind",
        omega: "Omega"
    };

    $scope.data.timeDropdown = [
        "Movie",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

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

    $scope.esrl.flags.delay = "1";
    $scope.esrl.flags.showNow = true;



    $scope.esrlInputWatchCount = 0;

    // Functions to execute on load
    $timeout(function () {
        $scope.setDefaults($scope.esrl.input.field);
        /*------ Watches ----*/
        $scope.$watchCollection('esrl.input', function (newVal, oldVal) {
            if (!oldVal)
                return;
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
                    if (oldVal.field !== newVal.field || oldVal.press !== newVal.press) {
                        $scope.setDefaults(newVal.field);
                    }
                    if (!$scope.esrlForm.$invalid) {
                        if ($scope.esrlInputWatchCount === 0) {
                            $scope.esrlInputWatchCount++;
                            $scope.submitEsrlForm().then(function () {
                                $scope.esrlInputWatchCount--;
                            });
                        }
                    }

                }
            }
        });
    });

    $scope.esrl.submit = function () {
        $scope.esrl.flags.showNow = false;
        $scope.submitEsrlForm()
            .then(function () {
                $scope.esrl.flags.showNow = true;
            });

    };

    $scope.setDefaults = function (input) {
        // console.log("=== 001 esrl set defaults ==", { input: input });
        var defaultRes = defaults.getEsrlDefaultsByLevel(input, $scope.esrl.input.press);
        $scope.esrl.input.contourStep = defaultRes.contour;
        $scope.esrl.input.min = defaultRes.min;
        $scope.esrl.input.max = defaultRes.max;
    };

    $scope.submitEsrlForm = function () {
        console.log("=== submit esrl form ===");
        var res = new EsrlResource();

        if ($scope.esrl.input.time === "Movie")
            res.time = "year";
        else {
            res.time = $scope.esrl.input.time;
        }

        res.press = $scope.esrl.input.press;
        res.field = $scope.esrl.input.field;
        res.lat= $scope.esrl.input.lat;
        res.lon = $scope.esrl.input.lon || 0;
        res.field2 = "none";
        res.flatr = "0, 90";
        res.flon = "zonal av";
        res.fpress = "1000, 200";
        res.model = "clim2.py";
        res.action = "esrl";
        res.min = $scope.esrl.input.min;
        res.max = $scope.esrl.input.max;

        res.contour = true;
        res.contourStep = $scope.esrl.input.contourStep;

        res.action = "esrl";
        $scope.isLoading = true;

        $scope.message({
            titleWidget: {
                title: $scope.data.fields[res.field],
                level: res.press,
                timepoint: res.time
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

            $scope.message({ action: "loadColorbar", colorbarFilename: results.colorbarFilename});
            
            return;
        });

    };

    $scope.globeSetup = function () {
        $scope.message({
            action: "showGlobeSettings",
            input: $scope.esrl.input
        })
    };

    $scope.toggleMoviePause = function () {
        $scope.esrl.flags.moviePlay = !$scope.esrl.flags.moviePlay;
        $scope.message({
            action: $scope.esrl.flags.moviePlay ? 'play' : 'pause'
        });
    };

    $scope.stepBack = function () {
        if ($scope.esrl.flags.movie) {
            $scope.message({
                action: 'stepBack'
            });
        } else {
            var idx = $scope.data.timeDropdown.indexOf($scope.esrl.input.time);
            idx--;
            if (idx < 1)
                idx = $scope.data.timeDropdown.length - 1;
            $scope.esrl.input.time = $scope.data.timeDropdown[idx];
        }
    };

    $scope.stepForward = function () {
        if ($scope.esrl.flags.movie) {
            $scope.message({
                action: 'stepForward'
            });
        } else {
            var idx = $scope.data.timeDropdown.indexOf($scope.esrl.input.time);
            idx++;
            if (idx > $scope.data.timeDropdown.length - 1)
                idx = 1;
            $scope.esrl.input.time = $scope.data.timeDropdown[idx];
        }
    };

    $scope.setDelay = function () {
        $scope.message({
            action: "setDelay",
            value: 1 / $scope.esrl.flags.delay * 1000
        });
    };

    $scope.$on('from-parent', function(e, message) {
        if (message && message.frame) {
            $scope.loop = message.frame;
        }

        if (message && message.latlon) {
            // set the lat and lon to where the user clicked
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

        if (message && (message.min || message.max)) {
            $timeout(function () {
                $scope.esrl.input.min = parseFloat(message.min);
                $scope.esrl.input.max = parseFloat(message.max);
                if (message.contourStep)
                    $scope.esrl.input.contourStep = parseFloat(message.contourStep);
            });
        }
    });

    $scope.message = function (data) {
        $parentScope.$apply(function () {
            $parentScope.iframeMessage = data;
        });
    };

    $scope.openLightboxModal = function (filename) {
        $scope.message({ action: "lightboxModal", input: $scope.section.input, filename: filename });
    };

    $parentScope.esrlScope = $scope;
});