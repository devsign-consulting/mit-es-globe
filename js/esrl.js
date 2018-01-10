// http://plnkr.co/edit/EYpEATLGd0B54WpEr7II?p=preview
var esrl = angular.module('app-esrl', ['ngResource', 'app-esrl.services', 'app-esrl.defaults', 'ui.bootstrap','ngAnimate','ui.toggle']);
esrl.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

esrl.controller('EsrlChildController', function ($scope, $parentScope, $timeout, $uibModal, EsrlResource, defaults) {
    $scope.data = {};
    $scope.data.fields = {
        pottmp: "Potential Temperature",
        hgt: "Geopotential Height",
        uwnd: "U-wind",
        vwnd: "V-wind",
        omega: "Omega"
    };

    $scope.data.levelArr = [1000, 925, 800, 700, 600, 500, 400, 300, 250, 200];
    $scope.data.timeArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    $scope.section = {};
    $scope.section.input = {};
    $scope.section.input.levelIndicatorIdx = 0;
    $scope.section.input.time = "Jan";
    $scope.section.input.press = 200;
    $scope.section.input.field = "pottmp";
    $scope.section.input.lon = 0;

    $scope.section.input.logScale = true;
    $scope.section.input.zonalAverage = true;
    $scope.section.flags = {};
    $scope.section.flags.keyboardControl = false;
    $scope.section.flags.showNow = true;

    $scope.sectionInputWatchCount = 0;

    // Functions to execute on load
    $timeout(function () {
        $scope.setDefaults($scope.section.input.field);
        // $scope.submitSectionForm();

        /*------ Watches ----*/
        $scope.$watchCollection('section.input', function (newVal, oldVal) {
            console.log("===$watchCollection section.input===", newVal);
            var submitForm = true;
            if (oldVal && newVal) {
                if (oldVal.field && newVal.field && oldVal.field !== newVal.field) {
                    $scope.setDefaults(newVal.field, "field1");
                }

                if (oldVal.field2 && newVal.field2 && oldVal.field2 !== newVal.field2) {
                    $scope.setDefaults(newVal.field2, "field2");
                }

                if (!oldVal.field2 && newVal.field2) {
                    $scope.setDefaults(newVal.field2, "field2");
                }
            }
            if (!$scope.esrlForm.$invalid) {
                if ($scope.section.input.time) {
                    $timeout.cancel($scope.section.flags.timeTimeout);
                    $scope.section.flags.timeTimeout= $timeout(function () {
                        $scope.message({
                            action: "sectionTimeChanged",
                            time: $scope.section.input.time
                        });
                    }, 500);
                }

                if ($scope.section.input.field) {
                    $scope.message({
                        action: "sectionFieldChanged",
                        field: $scope.section.input.field
                    });
                }

                if (newVal && oldVal && (newVal.min !== oldVal.min || newVal.max !== oldVal.max)) {
                    console.log("== 001 min max ==", newVal);
                    $scope.message({
                        action: "sectionMinMaxChanged",
                        min: newVal.min,
                        max: newVal.max
                    })
                }

                // don't submit if we are only changing the sectionidx
                if (typeof newVal.levelIndicatorIdx !== 'undefined' && oldVal.levelIndicatorIdx !== newVal.levelIndicatorIdx) {
                    $timeout.cancel($scope.section.flags.levelTimeout);
                    $scope.section.flags.levelTimeout = $timeout(function () {
                        $scope.message({
                            action: "sectionLevelChanged",
                            level: $scope.data.levelArr[newVal.levelIndicatorIdx]
                        });
                        $scope.globeLoading = true;
                    }, 500);

                    submitForm = false;
                }

                // don't submit form if the lon changes and we are in zonal average
                if (oldVal.lon && newVal.lon && oldVal.lon !== newVal.lon) {
                    if ($scope.section.input.zonalAverage) {
                        submitForm = false;
                    }
                }

                if (submitForm && oldVal) {
                    if ($scope.sectionInputWatchCount === 0) {
                        $scope.sectionInputWatchCount++;
                        $scope.submitSectionForm().then(function () {
                            $scope.sectionInputWatchCount--;
                        });
                    }
                }
            }
        });
    });

    $scope.timePrev = function () {
        if ($scope.isLoading)
            return;
        let idx = $scope.data.timeArr.indexOf($scope.section.input.time);
        if (idx > 0) {
            idx--;
            $scope.section.input.time = $scope.data.timeArr[idx];
        }
    };

    $scope.timeNext = function () {
        if ($scope.isLoading)
            return;
        let idx = $scope.data.timeArr.indexOf($scope.section.input.time);
        if (idx < $scope.data.timeArr.length - 1) {
            idx++;
            $scope.section.input.time = $scope.data.timeArr[idx];
        }
    };

    $scope.levelUp = function () {
        if ($scope.isLoading || $scope.globeLoading)
            return;
        if ($scope.section.input.levelIndicatorIdx < $scope.data.levelArr.length - 1)
            $scope.section.input.levelIndicatorIdx++;
    };

    $scope.levelDown = function () {
        if ($scope.isLoading || $scope.globeLoading)
            return;
        if ($scope.section.input.levelIndicatorIdx > 0)
            $scope.section.input.levelIndicatorIdx--;
    };

    $scope.toggleKeyboardControl = function () {
        $scope.section.flags.keyboardControl = !$scope.section.flags.keyboardControl

        if ($scope.section.flags.keyboardControl) {
            angular.element(document).bind('keyup', function (e) {
                console.log('=== keyup===', e.keyCode);
                if (e.keyCode === 38) { // up arrow
                    $scope.levelUp();
                    $scope.$digest();
                }

                if (e.keyCode === 40) { // down arrow
                    $scope.levelDown();
                    $scope.$digest();
                }

                if (e.keyCode === 37) { // left arrow
                    $scope.timePrev();
                    $scope.$digest();
                }

                if (e.keyCode === 39) { // right arrow
                    $scope.timeNext();
                    $scope.$digest();
                }
            });
        } else {
            angular.element(document).unbind('keyup');
        }
    };

    $scope.getLevelIndicatorClass = function (levelIdx) {
        const indicatorClass = {};
        const level = $scope.data.levelArr[levelIdx];
        indicatorClass[`level${level}`] = true;
        indicatorClass['log'] = true;

        return indicatorClass;
    };

    $scope.section.submit = function () {
        $scope.submitSectionForm()
            .then(function () {
                $scope.section.flags.showNow = true;
            });
    };


    $scope.setDefaults = function (input, field) {
        var defaultRes = defaults.getEsrlDefaults(input);
        if (field && field === "field1") {
            $scope.section.input.contour = defaultRes.contour;
            $scope.section.input.min = defaultRes.min;
            $scope.section.input.max = defaultRes.max;
        } else if (field && field === "field2") {
            $scope.section.input.contour2 = defaultRes.contour;
            $scope.section.input.min2 = defaultRes.min;
            $scope.section.input.max2 = defaultRes.max;
        } else {
            $scope.section.input.contour = defaultRes.contour;
            $scope.section.input.min = defaultRes.min;
            $scope.section.input.max = defaultRes.max;

            $scope.section.input.contour2 = defaultRes.contour;
            $scope.section.input.min2 = defaultRes.min;
            $scope.section.input.max2 = defaultRes.max;
        }

        console.log("=== esrl set deaults ===", {input, field}, defaultRes, $scope.section.input);
    };

    $scope.submitSectionForm = function () {
        var res = new EsrlResource();
        console.log("=== submit section form ===", $scope.section.input);
        res.action = "section";
        res.time = $scope.section.input.time;
        res.press = $scope.section.input.press;
        res.field = $scope.section.input.field;
        res.logScale = $scope.section.input.logScale ? 'True' : 'False';
        res.zonalAverage = $scope.section.input.zonalAverage ? 'True' : 'False';
        res.fillContour = true;

        if ($scope.section.input.field2) {
            res.field2 = $scope.section.input.field2;
            if ($scope.section.input.max2) {
                res.max2 = $scope.section.input.max2
            }
            if ($scope.section.input.min2) {
                res.min2 = $scope.section.input.min2
            }
            if ($scope.section.input.contour2) {
                res.contour2 = $scope.section.input.contour2;
            }

        } else {
            res.fillContour = true;
            res.field2 = $scope.section.input.field;
            if ($scope.section.input.min)
                res.min2 = $scope.section.input.min;
            if ($scope.section.input.max)
                res.max2 = $scope.section.input.max;

            res.contour2 = $scope.section.input.contour;
        }

        res.lon = $scope.section.input.lon;
        res.contour = $scope.section.input.contour;

        if ($scope.section.input.max) {
            res.max = $scope.section.input.max
        }
        if ($scope.section.input.min) {
            res.min = $scope.section.input.min
        }

        if ($scope.section.input.fillContour) {
            res.fillContour = $scope.section.input.fillContour
        }

        $scope.isLoading = true;

        return res.$submitForm().then(function (results) {
            $scope.section.filename = "./esrl/output/" + results.filename;
            $scope.isLoading = false;
            $scope.section.flags.showNow = true;
            return;
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
    };

    $scope.$on('from-parent', function(e, message) {
        if (message && message.frame) {
            $scope.loop = message.frame;
        }

        if (message && message.latlon) {
            // set the lat and lon to where the user clicked
            var latlon = message.latlon.latlon;
            $scope.section.input.lon = Math.round(latlon[1]);
        }

        if (message && message.time) {
            $timeout(function () {
                $scope.section.input.time = message.time;
            });
        }

        if (message && message.field) {
            $timeout(function () {
                $scope.section.input.field = message.field;
            });
        }

        if (message && message.input) {
            _.merge($scope.section.input, message.input);
        }

        if (message && message.globeInput) {
            $scope.openGlobeSettingsModal(message.globeInput)
        }

        if (message && message.press) {
            $timeout(function () {
                const idx = $scope.data.levelArr.indexOf(message.press);
                if (idx)
                    $scope.section.input.levelIndicatorIdx = idx;
            });
        }

        if (message && message.globeDoneLoading) {
            $scope.globeLoading = false;
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

    $scope.openSettingsModal = function () {
        var input = $scope.section.input;
        var field1 = $scope.section.input.field;
        var field2 = $scope.section.input.field2;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'sectionSettingsModal.html',
            controller: 'SectionSettingsModalCtrl',
            controllerAs: 'ctrl',
            size: "md",
            appendTo: angular.element(".modal-parent"),
            resolve: {
                input: function () {
                    return input;
                },
                field1: function () {
                    return field1;
                },
                field2: function () {
                    return field2;
                }
            }
        });

        modalInstance.result.then(function (result) {
            console.log("== section merge result ==", result)
            _.merge($scope.section.input, result);
        });
    };

    $scope.openGlobeSettingsModal = function (input) {
        var field = input.field;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'globeSettingsModal.html',
            controller: 'GlobeSettingsModalCtrl',
            controllerAs: 'ctrl',
            size: "md",
            appendTo: angular.element(".modal-parent"),
            resolve: {
                input: function () {
                    return input;
                },
                field: function () {
                    return field;
                }
            }
        });

        modalInstance.result.then(function (result) {
            $scope.message({
                action: "saveGlobeSettings",
                input: result
            })
        });
    };

    $parentScope.esrlScope = $scope;

});

esrl.controller("SectionSettingsModalCtrl", function ($uibModalInstance, input, field1, field2, defaults) {
    this.input = angular.copy(input);
    this.input.globe = {};
    this.resetDefaults = function () {
        if (field1) {
            var defaultRes = defaults.getEsrlDefaults(field1);
            this.input.contour = defaultRes.contour;
            this.input.min = defaultRes.min;
            this.input.max = defaultRes.max;
        }

        if (field2) {
            var defaultRes = defaults.getEsrlDefaults(field2);
            this.input.contour2 = defaultRes.contour;
            this.input.min2 = defaultRes.min;
            this.input.max2 = defaultRes.max;
        }
    };

    this.ok = function () {
        $uibModalInstance.close(this.input);
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };
});

esrl.controller("GlobeSettingsModalCtrl", function ($uibModalInstance, input, field, defaults) {
    this.input = {};
    this.input.globe = angular.copy(input);
    console.log("==== this.input ===", this.input);
    this.resetDefaults = function () {
        if (field) {
            var defaultRes = defaults.getEsrlDefaults(field);
            this.input.globe.contourStep = defaultRes.contour;
            this.input.globe.min = defaultRes.min;
            this.input.globe.max = defaultRes.max;
        }
    };

    this.ok = function () {
        $uibModalInstance.close(this.input.globe);
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };
});

esrl.directive('errSrc', function() {
    return {
        link: function(scope, element, attrs) {
            element.bind('error', function() {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});