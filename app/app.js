'use strict';

// Declare app level module which depends on views, and components
angular.module('phpVersionInfo', [
  'ngRoute',
  'phpVersionInfo.views',
  'phpVersionInfo.yaml',
  'phpVersionInfo.chart',
  'phpVersionInfo.version',
  'navList'
])

/*****************************************************************
*
* 404 route
*
******************************************************************/
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/404'});
}])

/*****************************************************************
*
* Underscore library
*
******************************************************************/
.constant('_', window._)
.run(function ($rootScope) {
   $rootScope._ = window._;
})
