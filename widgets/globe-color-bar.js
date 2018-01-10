var globeColorBarWidget = angular.module('globeColorBarWidget', []);

globeColorBarWidget.controller('GlobeColorBarWidgetController', function ($scope) {
    $scope.input = {};
    $scope.$on('from-parent', function(e, message) {
        if (message && message.colorbarFilename) {
            $scope.input.colorbarSrc = "/esrl/output/" + message.colorbarFilename;
        }
    });
});