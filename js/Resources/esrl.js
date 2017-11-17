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