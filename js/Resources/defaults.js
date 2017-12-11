angular.module('app-esrl.defaults', []).factory('defaults', function() {
    var service = {};
    service.getEsrlDefaults = function (input) {
        switch(input) {
            case "pottmp":
                return {
                    contour: 5,
                    min: 260,
                    max: 450
                };
                break;
            case "hgt":
                return {
                    contour: 1000,
                    min: 0,
                    max: 16000
                };
                break;
            case "uwnd":
                return {
                    contour: 3,
                    min: -9,
                    max: 48
                };
                break;
            case "vwnd":
                return {
                    contour: 0.5,
                    min: -4,
                    max: 4
                };
                break;
            case "omega":
                return {
                    contour: 0.005,
                    min: -0.03,
                    max: 0.04
                };
                break;
            default:
                return {};
        }
    };

    return service;
});