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

.controller('SharedCtrl', ['$scope', '$http', function($scope, $http) {
  // Default partial
  $scope.partial = 'table'
  
  // Get yaml
  $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/shared_hosts.yml')
    .success(function(yaml, status, headers, config) {
      $scope.hosts = jsyaml.safeLoad(yaml)
      //console.log(hosts)
    })
    .error(function(data, status, headers, config) {
      console.error(status)
      console.error(data)
    });

}])

.controller('CustomCtrl', ['$scope', '$http', function($scope, $http) {
  // Default partial
  $scope.partial = 'table'
  
  // Get yaml
  $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/custom_hosts.yml')
    .success(function(yaml, status, headers, config) {
      $scope.hosts = jsyaml.safeLoad(yaml)
      //console.log(hosts)
    })
    .error(function(data, status, headers, config) {
      console.error(status)
      console.error(data)
    });

}])

.controller('LinuxCtrl', ['$scope', '$http', function($scope, $http) {
  // Default partial
  $scope.partial = 'table'
  
  // Get yaml
  $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/linux_distros.yml')
    .success(function(yaml, status, headers, config) {
      $scope.distros = jsyaml.safeLoad(yaml)
      //console.log(hosts)
    })
    .error(function(data, status, headers, config) {
      console.error(status)
      console.error(data)
    });
}])