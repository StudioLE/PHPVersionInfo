angular.module('navList', [])

.controller('navCtrl', ['$scope', '$location', function ($scope, $location) {
  $scope.navClass = function (href) {
    return href === '#' + $location.path() ? 'active' : '';
  };

  $scope.nav = [{
    url: '#/shared-hosts',
    title: 'Shared Hosting',
    icon: 'server'
  }, {
    url: '#/custom-hosts',
    title: 'Custom Hosting',
    icon: 'cloud'
  }, {
    url: '#/linux-distros',
    title: 'Linux Distributions',
    icon: 'linux'
  }]
  
}]);
