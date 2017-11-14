var titleWidget = angular.module('titleWidget', ['ngResource']);

titleWidget.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

titleWidget.controller('TitleWidgetController', function ($scope, $parentScope, $timeout) {
    $scope.title = "Potential Temperature";

    $scope.$on('from-parent', function(e, message) {
        console.log("=== titleWidget: from parent ===", message);
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