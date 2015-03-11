'use strict';

angular.module('myApp.views', ['ngRoute', 'highcharts-ng'])

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

.controller('SharedCtrl', ['$scope', '$http', function($scope, $http) {
  
  // Get yaml
  // @todo Move $get into Hosts factory
  $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/shared_hosts.yml')
    .success(function(yaml, status, headers, config) {
      $scope.hosts = jsyaml.safeLoad(yaml)
        getReleases()
    })
    .error(function(data, status, headers, config) {
      console.error(status)
      console.error(data)
    });

  function getReleases() {
    
    // Get php releases
    // @todo mechanism to fetch latest php releases from php.net
    // http://php.net/releases/index.php?serialize=1&version=5&max=100
    // 'Access-Control-Allow-Origin' not present for php.net so use local JSON
    // @todo Move $get into Releases factory
    $http.get('data/releases.json')
      .success(function(phpReleases, status, headers, config) {
        populateChart(phpReleases)
      })
      .error(function(data, status, headers, config) {
        console.error(status)
        console.error(data)
      });
  }

  function populateChart(phpReleases) {

    var hosts = $scope.hosts

    var data = {
      php52: {},
      php53: {},
      php54: {},
      php55: {},
      php56: {},
      default: {}
    }

    var versions = ['php52', 'php53', 'php54', 'php55', 'php56', 'default']

    // @todo convert into Service
    function formatVersion(ver, patch) {
      if(ver === 'default' && patch === undefined) {
        return 'default'
      }
      else if(ver === 'default') {
        return patch
      }
      else if(patch === undefined) {
        return '5.' + ver.substr(-1)
      }
      else {
        return '5.' + ver.substr(-1) + '.' + patch
      }
    }


    hosts.forEach(function(host) {
      versions.forEach(function(ver) {
        if(host[ver] === undefined ||
            host[ver] === '??') {
          // If unknown do nothing
        }
        else if( ! data[ver]['v' + host[ver]]) {
          if(phpReleases[formatVersion(ver, host[ver])] === undefined) {
            console.debug('No release information for version ' + formatVersion(ver, host[ver]))
          }
          else if(phpReleases[formatVersion(ver, host[ver])]['date'] === undefined) {
            console.debug('No release date for version ' + formatVersion(ver, host[ver]))
            // No release dates for 5.5.22, 5.6.6
            // No release information for 5.2.6
            // @todo manual override of release date
          }
          else {
            // Release date
            // Due to timezones this information may be a day out. This shouldn't be an issue.
            var rDate = new Date(phpReleases[formatVersion(ver, host[ver])]['date'])
            var monthsSince = (Date.now() - rDate.valueOf()) / (1000*60*60*24*30)

            // @todo Style tooltips
            data[ver]['v' + host[ver]] = {
              name: host.name,
              version: formatVersion(ver, host[ver]),
              releaseDate: rDate.toISOString().substr(0,10),
              x: rDate.valueOf(),
              y: 1
            }
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
        var color = false
        var vis = true
      if(ver == 'php52') {
        color = '#BFA365'
        vis = false
      }
      else if(ver == 'php53') {
        color = '#2C3E50'
        vis = false
      }
      else if(ver == 'php54') {
        color = '#349872'
      }
      else if(ver == 'php55') {
        color = '#8E70DB'
      }
      else if(ver == 'php56') {
        color = '#2980B9'
      }
      else if(ver == 'default') {
        color = '#E74C3C'
        vis = false
      }
      hostsData.push({
        name: formatVersion(ver),
        data: Object.keys(data[ver]).map(function (key) {
          return data[ver][key]
        }),
        visible: vis,
        color: color
      })
    })

    // @todo sort data

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
              //fontWeight: 'bold'
          },
          useHTML: true,
          headerFormat: '',
          pointFormat: '<h3>{point.version}</h3><p class="text-muted">Released {point.x:%b %Y}, used by {point.y} hosts</p><p>{point.key}</p>',
          footerFormat: '<p>{point.key}</p>'
        },
        xAxis: {
          //currentMin: 0,
          //currentMax: 20,
          title: {
            text: 'Version release date',
          },
          type: 'datetime',
          dateTimeLabelFormats: {
            month: '%b %Y'
          },
          reversed: true          
        },
        yAxis: {
          //currentMin: 0,
          //currentMax: 20,
          title: {
            text: 'Number of hosts using version',
          }
        }
      },
      series: hostsData,
      title: {
         text: ''
      },
      loading: false
    };



    $scope.chartConfig = chartConfig;
  }


   

}])

/*****************************************************************
*
* CustomCtrl controller
*
******************************************************************/

.controller('CustomCtrl', ['$scope', '$http', function($scope, $http) {
  // Default partial
  $scope.partial = 'table'
  // @todo Add version release dates to table tooltips
  
  // Get yaml
  $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/custom_hosts.yml')
    .success(function(yaml, status, headers, config) {
      $scope.hosts = jsyaml.safeLoad(yaml)
    })
    .error(function(data, status, headers, config) {
      console.error(status)
      console.error(data)
    });

}])

/*****************************************************************
*
* LinuxCtrl controller
*
******************************************************************/

.controller('LinuxCtrl', ['$scope', '$http', function($scope, $http) {
  // Default partial
  $scope.partial = 'table'
  
  // Get yaml
  $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/linux_distros.yml')
    .success(function(yaml, status, headers, config) {
      $scope.distros = jsyaml.safeLoad(yaml)
    })
    .error(function(data, status, headers, config) {
      console.error(status)
      console.error(data)
    });
}])