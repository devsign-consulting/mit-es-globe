// http://plnkr.co/edit/EYpEATLGd0B54WpEr7II?p=preview
var esrl = angular.module('app-esrl', ['ngResource', 'app-esrl.services','ui.bootstrap','ngAnimate','ui.toggle']);
esrl.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

esrl.controller('EsrlChildController', function ($scope, $parentScope, $timeout, $uibModal, EsrlResource) {
    $scope.esrl = {};
    $scope.esrl.input = {};
    $scope.esrl.flags = {};
    $scope.esrl.flags.moviePlay = true;

    $scope.esrl.input.time = "Jan";
    $scope.esrl.input.press = "1000";
    $scope.esrl.input.field = 'pottmp';
    $scope.esrl.input.lat = 30;
    $scope.esrl.input.lon = 0;
    $scope.esrl.input.contour = false;
    $scope.esrl.input.contourDensity = 20;

    $scope.esrl.flags.delay = 1;
    $scope.esrl.flags.showNow = true;

    $scope.section = {};
    $scope.section.input = {};
    $scope.section.input.time = "Jan";
    $scope.section.input.press = 200;
    $scope.section.input.field = "pottmp";
    $scope.section.input.lon = 0;
    $scope.section.input.contour = 10;
    $scope.section.input.contour2 = 10;
    $scope.section.input.logScale = true;
    $scope.section.flags = {};
    $scope.section.flags.showNow = true;

    // Functions to execute on load
    $timeout(function () {
        $scope.submitSectionForm();
        $scope.submitEsrlForm();
    });

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
        if ($scope.esrl.input.contour) {
            res.contour = $scope.esrl.input.contour;
            res.contourDensity = $scope.esrl.input.contourDensity;
        }

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
                $scope.section.flags.showNow = true;
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
        res.logScale = $scope.section.input.logScale ? 'True' : 'False';

        if ($scope.section.input.field2)
            res.field2 = $scope.section.input.field2;

        res.lon = $scope.section.input.lon;
        res.contour = $scope.section.input.contour;

        if ($scope.section.input.contour2)
            res.contour2 = $scope.section.input.contour2;

        if ($scope.section.input.max) {
            res.max = $scope.section.input.max
        }
        if ($scope.section.input.min) {
            res.min = $scope.section.input.min
        }

        if ($scope.section.input.max2) {
            res.max2 = $scope.section.input.max2
        }
        if ($scope.section.input.min2) {
            res.min2 = $scope.section.input.min2
        }

        if ($scope.section.input.fillContour) {
            res.fillContour = $scope.section.input.fillContour
        }

        $scope.isLoading = true;

        return res.$submitForm().then(function (results) {
            $scope.section.filename = "./esrl/output/" + results.filename;
            $scope.isLoading = false;
            $scope.section.flags.showNow = true;

            console.log("==== results ===", results);
            if (results.output && results.output.field) {
                if (results.output.field.min) {
                    $scope.section.input.min = results.output.field.min
                }

                if (results.output.field.max) {
                    $scope.section.input.max = results.output.field.max
                }

                if (results.output.field2 && results.output.field2.min) {
                    $scope.section.input.min2 = results.output.field2.min
                }

                if (results.output.field2 && results.output.field2.max) {
                    $scope.section.input.max2 = results.output.field2.max
                }

            }
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

    $scope.downloadSection = function (){
        $scope.toJSON = '';
        $scope.toJSON = angular.toJson($scope.data);
        var blob = new Blob([$scope.toJSON], { type:"application/json;charset=utf-8;" });
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href',window.URL.createObjectURL(blob));
        downloadLink.attr('download', 'fileName.json');
        downloadLink[0].click();
    }

    /*------ Watches ----*/
    $scope.$watchCollection('esrl.input', function (newVal, oldVal) {
        console.log("=== inputs updated ==", newVal);
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

    $scope.$watchCollection('section.input', function (newVal, oldVal) {
        if (oldVal && newVal) {
            if (oldVal.field && newVal.field && oldVal.field !== newVal.field) {
                $scope.section.input.min = null;
                $scope.section.input.max = null;
            }

            if (oldVal.field2 && newVal.field2 && oldVal.field2 !== newVal.field2) {
                $scope.section.input.min2 = null;
                $scope.section.input.max2 = null;
            }
        }
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

    $scope.openLightboxModal = function (filename) {
        $scope.message({ action: "lightboxModal", input: $scope.section.input, filename });
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