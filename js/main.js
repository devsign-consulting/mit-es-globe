var app = angular.module('app', ['ui.bootstrap']);
app.controller('MainCtrl', function ($scope, $log) {
    $scope.$watch('iframeMessage', function (newVal, oldVal) {
        if (newVal) {
            var sph = parent.parent.sph;
            sph.show("image"+ newVal.filename);
            sph.orient(newVal.lat, newVal.lon);
        }
    });
});