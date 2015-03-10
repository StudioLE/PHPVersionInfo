'use strict';

angular.module('myApp.views', ['ngRoute', 'highcharts-ng'])

// https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/shared_hosts.yml

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/intro.html',
    controller: 'IntroCtrl'
  });
  $routeProvider.when('/shared-hosts/:type?', {
    templateUrl: 'views/shared-hosts.html',
    controller: 'SharedCtrl'
  });
  $routeProvider.when('/custom-hosts/:type?', {
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

.controller('SharedCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {
  
  // Get yaml
  $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/shared_hosts.yml')
    .success(function(yaml, status, headers, config) {
      $scope.hosts = jsyaml.safeLoad(yaml)
      //console.log(hosts)
      if($routeParams.type === 'chart') {
        populateChart($scope.hosts)
      }
    })
    .error(function(data, status, headers, config) {
      console.error(status)
      console.error(data)
    });

  if($routeParams.type !== 'chart') {
    $scope.partial = 'table'
  }
  else { 
    $scope.partial = 'chart'
  }

  function populateChart(hosts) {

    var data = {
      php52: {},
      php53: {},
      php54: {},
      php55: {},
      php56: {}
    }

    var versions = ['php52', 'php53', 'php54', 'php55', 'php56']

    function formatVersion(ver, patch) {
      if(patch === undefined) {
        return '5.' + ver.substr(-1)
      }
      else {
        return '5.' + ver.substr(-1) + '.' + patch
      }
    }

    hosts.forEach(function(host) {
      versions.forEach(function(ver) {
        if(host[ver] === undefined || host[ver] === '??') {
          // If unknown do nothing
        }
        else if( ! data[ver]['v' + host[ver]]) {
          // @todo unserialize http://php.net/releases/index.php?serialize=1 and get age of releases
          // @todo Style tooltips
          data[ver]['v' + host[ver]] = {
            name: formatVersion(ver, host[ver]) + ': ' + host.name,
            version: formatVersion(ver, host[ver]),
            x: host[ver],
            y: 1
          }
        }
        else {
          data[ver]['v' + host[ver]].name += ', ' + host.name      
          data[ver]['v' + host[ver]].y ++
        }       
      })
    })

    var hostsData = []

    versions.forEach(function(ver){
      hostsData.push({
        name: formatVersion(ver),
        data: Object.keys(data[ver]).map(function (key) {
          return data[ver][key]
        })
      })
    })

    // @todo sort data

    var splergh = [{
      name: 'SiteGround, Aruba, Heart, Hetzner, HostGator',
      //color: '#00FF00',
      y: 5,
      x: 100
    }, {
      name: 'VidaHost',
      //color: '#FF00FF',
      y: 1,
      x: 500
    }, {
      name: 'Another, Thing, With, Options',
      //color: '#FF00FF',
      y: 4,
      x: 400
    }]

    // Age of release against number of hosts

    //This is not a highcharts object. It just looks a little like one!
    var chartConfig = {

      options: {
          //This is the Main Highcharts chart config. Any Highchart options are valid here.
          //will be overriden by values specified below.
          chart: {
              type: 'column'
          },
          tooltip: {
              style: {
                  padding: 10,
                  fontWeight: 'bold'
              }
          }
      },
      //The below properties are watched separately for changes.

      //Series object (optional) - a list of series using normal highcharts series options.
      series: hostsData,
      //Title configuration (optional)
      title: {
         text: ''
      },
      //Boolean to control showng loading status on chart (optional)
      //Could be a string if you want to show specific loading text.
      loading: false,
      //Configuration for the xAxis (optional). Currently only one x axis can be dynamically controlled.
      //properties currentMin and currentMax provied 2-way binding to the chart's maximimum and minimum
      xAxis: {
        //currentMin: 0,
        //currentMax: 20,
        title: {
          text: 'Days since release of version',
        }
      },
      yAxis: {
        //currentMin: 0,
        //currentMax: 20,
        title: {
          text: 'Count',
        }
      },
      //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
      useHighStocks: false,
      //size (optional) if left out the chart will default to size of the div or something sensible.
      // size: {
      //  width: 400,
      //  height: 300
      // },
      //function (optional)
      // func: function (chart) {
      //  //setup some logic for the chart
      // }
    };



    $scope.chartConfig = chartConfig;
  }


   

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