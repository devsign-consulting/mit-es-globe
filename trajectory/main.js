var app = angular.module('app', ['p5globe', 'ui.bootstrap']);
app.controller('MainCtrl', function ($scope, $rootScope, $log, $window, $timeout, $uibModal, p5globe) {
    $scope.loop = {};
    $scope.input = {};
    $scope.input.delay = 1000;

    // todo, implement preloader: https://medium.com/@dabit3/easily-preload-images-in-your-angular-app-9659640efa74

    $scope.message = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("esrl2").contentWindow.angular.element('body').scope();
        if ($childScope) {
            $childScope.$apply(function () {
                $childScope.$emit('from-parent', data);
            });
        }
    };

    $scope.clickedTrajectory = function () {
        p5globe.sph.drawTrajectory();
    }

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

    $scope.$watch('iframeMessage', function (newVal, oldVal) {

    });
});

app.controller("LightboxModalCtrl", function ($uibModalInstance, input, filename) {
    this.filename = filename;
    this.input = input;
});
