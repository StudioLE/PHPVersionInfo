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
* YamlService factory
*
******************************************************************/
.factory('YamlService', function($http) {
  return {
    get: function(date_type) {
      return $http.get('https://cdn.rawgit.com/philsturgeon/phpversions.info/gh-pages/_data/' + date_type + '.yml')
        .then(function(response) {
          if(response.status === 200) {
            return jsyaml.safeLoad(response.data)
          }
          else {
            console.error(response)
          }
        });
    }
  }
})

/*****************************************************************
*
* Version factory
*
******************************************************************/
.factory('Version', function($http) {
  return {
    versions: [
      'php52', 'php53', 'php54', 'php55', 'php56', 'default'
    ],
    getReleases: function() {
      return $http.get('data/releases.json')
        .then(function(response) {
          if(response.status === 200) {
            return response.data
          }
          else {
            console.error(response)
          }
        })
    },
    format: function(ver, patch) {
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
  }
})

/*****************************************************************
*
* Chart factory
*
******************************************************************/
.factory('ChartService', function(Version) {
  return {
    create: function(hosts, phpReleases) {

      // Initialise our data object. Create a key for each version
      var data = {}
      var versions = Version.versions
      versions.forEach(function(ver) { data[ver] = {} })

      // Go through the list of hosts and add the host versions into the data object
      hosts.forEach(function(host) {
        versions.forEach(function(ver) {
          if(host[ver] === undefined ||
              host[ver] === '??') {
            // If the version if unknown do nothing
          }
          // If this is the first entry for this version then set some defaults
          else if( ! data[ver]['v' + host[ver]]) {
            // If we don't have any relase information
            if(phpReleases[Version.format(ver, host[ver])] === undefined) {
              console.debug('No release information for version ' + Version.format(ver, host[ver]))
            }
            // If we don't have a relase date
            else if(phpReleases[Version.format(ver, host[ver])]['date'] === undefined) {
              console.debug('No release date for version ' + Version.format(ver, host[ver]))
              // No release dates for 5.5.22, 5.6.6
              // No release information for 5.2.6
              // @todo manual override of release date
            }
            // If we do have a release date create an entry in the data object
            else {
              // Release date
              // Due to timezones this information may be a day out. This shouldn't be an issue.
              var rDate = new Date(phpReleases[Version.format(ver, host[ver])]['date'])
              var monthsSince = (Date.now() - rDate.valueOf()) / (1000*60*60*24*30)

              // @todo Style tooltips
              data[ver]['v' + host[ver]] = {
                name: host.name,
                version: Version.format(ver, host[ver]),
                releaseDate: rDate.toISOString().substr(0,10),
                x: rDate.valueOf(),
                y: 1
              }
            }
          }
          // If this is not the first entry for this version then we append the host name and and ++ the count
          else {
            data[ver]['v' + host[ver]].name += ', ' + host.name      
            data[ver]['v' + host[ver]].y ++
          }
        })
      })

      var hostsData = []

      // Create a series array from our data object
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
          name: Version.format(ver),
          data: Object.keys(data[ver]).map(function (key) {
            return data[ver][key]
          }),
          visible: vis,
          color: color
        })
      })

      // @todo sort data

      //This is not a highcharts object. It just looks a little like one!
      return {
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
    }
  }
})

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

.controller('SharedCtrl', ['$scope', 'YamlService', 'Version', 'ChartService', function($scope, YamlService, Version, ChartService) {

  YamlService.get('shared_hosts').then(function(data){
    $scope.hosts = data
    Version.getReleases().then(function(data){
      $scope.chartConfig = ChartService.create($scope.hosts, data)
    })
  })

}])

/*****************************************************************
*
* CustomCtrl controller
*
******************************************************************/

.controller('CustomCtrl', ['$scope', 'YamlService', function($scope, YamlService) {

  // @todo Add version release dates to table tooltips
  YamlService.get('custom_hosts').then(function(data){
    $scope.hosts = data
  })

}])

/*****************************************************************
*
* LinuxCtrl controller
*
******************************************************************/

.controller('LinuxCtrl', ['$scope', 'YamlService', function($scope, YamlService) {

  // @todo Add version release dates to table tooltips
  YamlService.get('linux_distros').then(function(data){
    $scope.distros = data
  })

}])