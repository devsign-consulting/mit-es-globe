var globeControlsWidget = angular.module('globeControlsWidget', ['ngResource']);

globeControlsWidget.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

globeControlsWidget.controller('GlobeControlsWidgetController', function ($scope, $parentScope, $timeout) {
    $scope.title = "Potential Temperature";

    $scope.$on('from-parent', function(e, message) {
        console.log("=== globeControlsWidget: from parent ===", message);
        if(message && message.title) {
            $scope.title = message.title;
        }
    });

    $scope.message = function (data) {
        $parentScope.$apply(function () {
            $parentScope.iframeMessage = data;
        });
    };
});