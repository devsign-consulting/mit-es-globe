// http://plnkr.co/edit/EYpEATLGd0B54WpEr7II?p=preview
var esrl = angular.module('app-esrl', ['ngResource', 'app-esrl.services','ui.bootstrap','ngAnimate','ui.toggle']);
esrl.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

esrl.controller('EsrlChildController', function ($scope, $parentScope, $timeout, $uibModal, EsrlResource) {
    $scope.data = {};
    $scope.data.fields = {
        pottmp: "Potential Temperature",
        hgt: "Geopotential Height",
        uwnd: "U-wind",
        vwnd: "V-wind",
        omega: "Omega",
    };

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
    });

    $scope.section.submit = function () {
        $scope.submitSectionForm()
            .then(function () {
                $scope.section.flags.showNow = true;
            });
    };

    $scope.submitSectionForm = function () {
        var res = new EsrlResource();
        res.action = "section";
        res.time = $scope.section.input.time;
        res.press = $scope.section.input.press;
        res.field = $scope.section.input.field;
        res.logScale = $scope.section.input.logScale ? 'True' : 'False';
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

    $scope.downloadSection = function (){
        $scope.toJSON = '';
        $scope.toJSON = angular.toJson($scope.data);
        var blob = new Blob([$scope.toJSON], { type:"application/json;charset=utf-8;" });
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href',window.URL.createObjectURL(blob));
        downloadLink.attr('download', 'fileName.json');
        downloadLink[0].click();
    };

    /*------ Watches ----*/
    $scope.$watchCollection('section.input', function (newVal, oldVal) {
        // console.log("===section.input===", newVal, oldVal);
        if (oldVal && newVal) {
            if (oldVal.field && newVal.field && oldVal.field !== newVal.field) {
                $scope.section.input.min = null;
                $scope.section.input.max = null;
            }

            if (oldVal.field2 && newVal.field2 && oldVal.field2 !== newVal.field2) {
                $scope.section.input.min2 = null;
                $scope.section.input.max2 = null;
            }

            if (!oldVal.field2 && newVal.field2) {
                $scope.section.input.min2 = null;
                $scope.section.input.max2 = null;
            }
        }

        if (!$scope.esrlForm.$invalid) {
            if ($scope.section.input.time) {
                $scope.message({
                    action: "sectionTimeChanged",
                    time: $scope.section.input.time
                });
            }

            if ($scope.section.input.field) {
                $scope.message({
                    action: "sectionFieldChanged",
                    field: $scope.section.input.field
                });
            }
            $scope.submitSectionForm();
        }
    });

    $scope.$on('from-parent', function(e, message) {
        console.log("== esrl from parent ==", message);

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
                }
            }
        });

        modalInstance.result.then(function (result) {});
    };

    $parentScope.esrlScope = $scope;

});

esrl.controller("SectionSettingsModalCtrl", function ($uibModalInstance, input) {
    this.input = input;
    this.ok = function () {
        $uibModalInstance.close();
    };

    this.cancel = function () {
        $uibModalInstance.dismiss();
    };
});