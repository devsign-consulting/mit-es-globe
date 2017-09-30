// http://plnkr.co/edit/EYpEATLGd0B54WpEr7II?p=preview
var esrl = angular.module('app-esrl', ['ngResource', 'app-esrl.services']);
esrl.factory('$parentScope', function ($window) {
    return $window.parent.angular.element($window.frameElement).scope();
});

esrl.controller('EsrlChildController', function ($scope, $parentScope, EsrlResource) {
    $scope.esrl = {};
    $scope.esrl.input = {};

    $scope.esrl.input.time = "Jan";
    $scope.esrl.input.press = "1000";
    $scope.esrl.input.field = 'pottmp';
    $scope.esrl.input.lat = 30;
    $scope.esrl.input.lon = 0;

    $scope.esrl.submit = function () {
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
        $scope.isLoading = true;
        res.$submitForm().then(function (results) {
            $parentScope.$apply(function () {
                $parentScope.iframeMessage = results;
                $scope.isLoading = false;
            });
        });

        $scope.esrl.input.showNow = true;
    };

    $scope.$watchCollection('')

    $scope.message = function () {
        $parentScope.$apply(function () {
            $parentScope.iframeMessage = "Hello World";
        });
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