'use strict';

angular.module('myApp.views', ['ngRoute'])

// https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/shared_hosts.yml

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/intro.html',
    controller: 'IntroCtrl'
  });
  $routeProvider.when('/shared-hosts', {
    templateUrl: 'views/shared-hosts.html',
    controller: 'SharedCtrl'
  });
  $routeProvider.when('/custom-hosts', {
    templateUrl: 'views/custom-hosts.html',
    controller: 'CustomCtrl'
  });
  $routeProvider.when('/linux-distros', {
    templateUrl: 'views/linux-distros.html',
    controller: 'LinuxCtrl'
  });
}])

.controller('IntroCtrl', [function() {

}])

.controller('CustomCtrl', [function() {

}])

.controller('LinuxCtrl', [function() {

}])