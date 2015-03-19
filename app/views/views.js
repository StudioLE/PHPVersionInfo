'use strict';

angular.module('phpVersionInfo.views', ['ngRoute', 'highcharts-ng', 'ui.bootstrap'])

/*****************************************************************
*
* Route provider
*
******************************************************************/
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

/*****************************************************************
*
* IntroCtrl controller
*
******************************************************************/
.controller('IntroCtrl', [function() {

}])

/*****************************************************************
*
* SharedCtrl controller
*
******************************************************************/
.controller('SharedCtrl', ['$scope', 'Yaml', 'Chart', 'Version', function($scope, Yaml, Chart, Version) {

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
* CustomCtrl controller
*
******************************************************************/
.controller('CustomCtrl', ['$scope', 'Yaml', 'Chart', 'Version', function($scope, Yaml, Chart, Version) {

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
* LinuxCtrl controller
*
******************************************************************/
.controller('LinuxCtrl', ['$scope', 'Yaml', 'Chart', 'Version', function($scope, Yaml, Chart, Version) {

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