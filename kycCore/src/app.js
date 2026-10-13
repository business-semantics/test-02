(function (angular, $, d3) {
    'use strict';

    angular.module('test02', ['ngRoute', 'ngCookies', 'ngSanitize', 'ui.bootstrap'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/libraries', {
                    templateUrl: 'kycCore/libraries.html',
                    controller: 'LibrariesController',
                    controllerAs: 'vm'
                })
                .otherwise({ redirectTo: '/libraries' });
        }])
        .controller('LibrariesController', ['$cookies', '$sce', function ($cookies, $sce) {
            var vm = this;

            vm.libraries = ['angular', 'jquery', 'd3', 'bootstrap'];
            vm.visits = parseInt($cookies.get('test02-visits') || '0', 10) + 1;
            vm.banner = $sce.trustAsHtml('<strong>test-02</strong>');
            $cookies.put('test02-visits', String(vm.visits));

            vm.drawChart = function (selector) {
                var values = vm.libraries.map(function (name) { return name.length; });
                $(selector).sparkline(values, { type: 'bar' });
                return d3.scale.linear().domain([0, d3.max(values)]).range([0, 100]);
            };
        }]);
})(window.angular, window.jQuery, window.d3);
