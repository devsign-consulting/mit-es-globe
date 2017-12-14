var app = angular.module('app', ['p5globe', 'ui.bootstrap']);
app.controller('MainCtrl', function ($scope, $rootScope, $log, $window, $timeout, $uibModal, p5globe) {
    $scope.loop = {};
    $scope.input = {};
    $scope.input.delay = 1000;

    $scope.message = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("esrl2").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }
    };

    $scope.messageTitleWidget = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("title-widget").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }

    };

    $scope.messageGlobeControlsWidget = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("globe-controls-widget").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }
    };

    $scope.messageGlobeColorBarWidget = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("globe-colorbar-widget").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }
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

    $scope.showGlobeImage = function (filename) {
        p5globe.sph.show(filename, "/graphics");
    };

    $scope.getFrame = function (filename, frame) {
        var filename_frame = filename+"-"+frame+".png";
        p5globe.sph.show(filename_frame);
        $timeout(function () {
            $scope.messageGlobeControlsWidget({ frame: frame+1 });
        });
    };


    $scope.openLightboxModal = function (input, filename) {
        console.log("===openLightboxModal ", {input, filename });
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'lightboxModal.html',
            controller: 'LightboxModalCtrl',
            controllerAs: 'ctrl',
            size: "lg",
            appendTo: angular.element(".modal-parent"),
            resolve: {
                input: function () {
                    return input;
                },
                filename: function () {
                    return filename;
                }
            }
        });

        modalInstance.result.then(function () {
            $ctrl.selected = selectedItem;
        });
    };

    $rootScope.$on('latlon', function(event, data) {
        // console.log("===latlon angular data===", data);
        $scope.message({ latlon: data});
    });

    $scope.$watch('iframeMessage', function (newVal, oldVal) {
        if (newVal && newVal.form === 'esrl' && newVal.filename) {
            console.log("===iframeMessage esrl ===", newVal);
            $scope.messageGlobeColorBarWidget({ colorbarFilename: newVal.colorbarFilename });

            // if it's a movie
            if(newVal.movie) {
                var filename = newVal.filename.split("-")[0];
                $scope.input.filename = filename;
                $scope.loop.i = 0;
                $scope.pause = false;
                clearTimeout($scope.input && $scope.input.movieLoop);
                $scope.timeoutLoop(filename, $scope.input.delay)
            } else {
                // updates from globe-controls
                if (newVal.time) {
                    // sync the time w/ section plot
                    $scope.message({ time: newVal.time });
                }

                if (newVal.field) {
                    // sync the time w/ section plot
                    $scope.message({ field: newVal.field });
                }

                p5globe.sph.show(newVal.filename);
                if (!newVal.bypassOrient)
                    p5globe.sph.orient(newVal.lat, newVal.lon);
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
                case "lightboxModal":
                    $scope.openLightboxModal(newVal.input, newVal.filename);
                    break;
                case "sectionTimeChanged":
                    $scope.messageGlobeControlsWidget({ time: newVal.time });
                    break;
                case "sectionFieldChanged":
                    $scope.messageGlobeControlsWidget({ field: newVal.field });
                    break;
                case "sectionMinMaxChanged":
                    console.log("== 002 min max ==", newVal);
                    $scope.messageGlobeControlsWidget({ min: newVal.min, max: newVal.max });
                    break;
                case "showGlobeSettings":
                    $scope.message({ globeInput: newVal.input });
                    break;
                case "saveGlobeSettings":
                    $scope.messageGlobeControlsWidget(newVal.input);
                    break;
                case "loadColorbar":
                    console.log("=== loadcolorbar===", newVal);
                    $scope.messageGlobeColorBarWidget({ colorbarFilename: newVal.colorbarFilename });
                    break;
            }
        }

        if (newVal && newVal.titleWidget) {
            $scope.messageTitleWidget(newVal.titleWidget);
        }

    });
});

app.controller("LightboxModalCtrl", function ($uibModalInstance, input, filename) {
    console.log("=== LightboxModalCtrl input ==", input, filename);
    this.filename = filename;
    this.input = input;
});
