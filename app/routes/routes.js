'use strict';

angular.module('phpVersionInfo.routes', ['ngRoute', 'highcharts-ng', 'ui.bootstrap'])

/*****************************************************************
*
* Route provider
*
******************************************************************/
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'routes/intro.html',
    controller: 'IntroController'
  });
  $routeProvider.when('/shared-hosts', {
    templateUrl: 'routes/shared-hosts.html',
    controller: 'SharedController'
  });
  $routeProvider.when('/custom-hosts', {
    templateUrl: 'routes/custom-hosts.html',
    controller: 'CustomController'
  });
  $routeProvider.when('/linux-distros', {
    templateUrl: 'routes/linux-distros.html',
    controller: 'LinuxController'
  });
}])

/*****************************************************************
*
* IntroController
*
******************************************************************/
.controller('IntroController', [function() {

}])

/*****************************************************************
*
* SharedController
*
******************************************************************/
.controller('SharedController', ['$scope', 'Yaml', 'Chart', 'Version', function($scope, Yaml, Chart, Version) {

  Yaml.get('shared_hosts').then(function(data){
    $scope.hosts = data
    Chart.create(data).then(function(data){
      $scope.chartConfig = data
      $scope.chartConfig.series[0].visible = false
    })
  })

  $scope.versionInfo = function(key) {
    Version.info(key, function(err, output) {
      console.log(output)
    })
  }

}])

/*****************************************************************
*
* CustomController
*
******************************************************************/
.controller('CustomController', ['$scope', 'Yaml', 'Chart', 'Version', function($scope, Yaml, Chart, Version) {

  // @todo Add version release dates to table tooltips
  Yaml.get('custom_hosts').then(function(data){
    $scope.hosts = data
    Chart.create(data).then(function(data){
      $scope.chartConfig = data
    })
  })

  $scope.versionInfo = function(key) {
    Version.info(key, function(err, output) {
      console.log(output)
    })
  }

}])

/*****************************************************************
*
* LinuxController
*
******************************************************************/
.controller('LinuxController', ['$scope', 'Yaml', 'Chart', 'Version', function($scope, Yaml, Chart, Version) {

  // @todo Add version release dates to table tooltips
  Yaml.get('linux_distros').then(function(data){
    $scope.distros = data
    Chart.create(data).then(function(data){
      $scope.chartConfig = data
    })
  })

  $scope.versionInfo = function(key) {
    Version.info(key, function(err, output) {
      console.log(output)
    })
  }

}])