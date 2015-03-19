'use strict';

angular.module('myApp.views', ['ngRoute', 'highcharts-ng', 'ui.bootstrap'])

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
* Underscore library
*
******************************************************************/
.constant('_', window._)
.run(function ($rootScope) {
   $rootScope._ = window._;
})

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
    store: {
      releases: []
    },
    data: {},
    versions: [
      'default', '5.2', '5.3', '5.4', '5.5', '5.6'
    ],
    getReleases: function() {
      // @todo Rewrite to use {cache:true}
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
    releases: function(key) {
      // if(this.store.releases.length >= 1) {
        return this.store.releases[key]
      // }
      // else {
        // this.getReleases().then(function(data){
          // console.log(data)
          // this.store.releases = data 
          // return data[key]
        // })
      // }
    },
    getThreats: function() {
      return $http.get('https://cdn.rawgit.com/psecio/versionscan/master/src/Psecio/Versionscan/checks.json', {cache: true})

    },
    threats: function(key, callback) {

      this.getThreats().then(function(res) {

        var threats = []

        // Loop through the threats
        _.each(res.data.checks, function(check, index, list) {          
          // Find if key is vulnerable to threat 
          var threat = _.find(check.fixVersions.base, function(fix_version) {
            // verion will be a string with the version number in which a threat is fixed
            // example: '5.4.2'
            fix_version = fix_version.split('.')
            var version = key.split('.')

            // Check to see if our version key is below the fix_version 
            if(fix_version[0] == version[0] && 
               fix_version[1] == version[1] && 
               parseInt(fix_version[2]) > parseInt(version[2]) ) {
              return true
            }
          })

          // If key is vulnerable to this threat then report it
          if(threat !== undefined) {
            threats.push(check)
          }
        })

        callback(null, threats)
      })
    },
    info: function(key, callback) {

      var release = this.releases(key)

      if(release !== undefined)
        var output = '<p>Released: ' + release.date + '</p>'
      else {
        callback(null, 'No data available')
      }

      return this.threats(key, function(err, threats) {
        if(err) {
          console.error('Error calling Version.threats()')
          callback(err, output)
        }
        else if(threats.length > 1) {
          output += '<p>' + threats.length + ' threats</p>'
        }
        else if(threats.length === 1) {
          output += '<p>' + threats.length + ' threat</p>'
        }
        else {
          output += '<p>No threats</p>'
        }
        
        callback(null, output)
      })
    },
    format: function(ver, patch) {
      if(ver === 'default' && (patch === undefined || patch === 'flatten')) {
        return 'default'
      }
      else if(ver === 'default') {
        return patch
      }
      else if(patch === 'flatten') {
        return 'php' + ver.replace('.', '')
      }
      else if(patch === undefined) {
        return ver
      }
      else {
        return ver + '.' + patch
      }
    },
    getVersionsFromHost: function(hosts) {
      var parent = this
      
      // Create a key for each version in the data object
      this.versions.forEach(function(ver) {
        parent.data[ver] = {}
      })

      // Go through the list of hosts and add the host versions into the data object
      hosts.forEach(function(host) {
        parent.versions.forEach(function(ver) {

          // ver = '5.2'
          // verKey = php52
          var verKey = parent.format(ver, 'flatten')

          // Access the host object and get key which should be a version patch number
          var hostVer = host[verKey]

          var verFull = parent.format(ver, hostVer)

          // If the version if unknown do nothing
          if(hostVer === undefined || hostVer === '??') { }
          // If a key entry already exists then we append the host name and and ++ the count
          else if(parent.data[ver][hostVer]) {
            parent.data[ver][hostVer].name += ', ' + host.name      
            parent.data[ver][hostVer].y ++
          }
          // If we don't have any relase information
          else if(parent.releases(verFull) === undefined) {
            console.debug('No release information for version ' + verFull)
          }
          // If we don't have a relase date
          else if(parent.releases(verFull)['date'] === undefined) {
            console.debug('No release date for version ' + verFull)
            // No release dates for 5.5.22, 5.6.6
            // No release information for 5.2.6
            // @todo manual override of release date
          }
          // If this is the first entry for this version then set some defaults
          // If we do have a release date create an entry in the data object
          else {
            // Release date
            // Due to timezones this information may be a day out. This shouldn't be an issue.
            var rDate = new Date(parent.releases(verFull)['date'])
            var monthsSince = (Date.now() - rDate.valueOf()) / (1000*60*60*24*30)

            // @todo Style tooltips
            parent.data[ver][hostVer] = {
              name: host.name,
              version: verFull,
              releaseDate: rDate.toISOString().substr(0,10),
              x: rDate.valueOf(),
              y: 1
            }
          }
        })
      })
      return parent.data
    },
    getSeriesFromVersions: function() {
      var parent = this
      var series = []

      // Create a series array from our data object
      this.versions.forEach(function(ver){
          var color = false
          var vis = true
        if(ver == '5.2') {
          color = '#BFA365'
          vis = false
        }
        else if(ver == '5.3') {
          color = '#2C3E50'
          vis = false
        }
        else if(ver == '5.4') {
          color = '#349872'
        }
        else if(ver == '5.5') {
          color = '#8E70DB'
        }
        else if(ver == '5.6') {
          color = '#2980B9'
        }
        else if(ver == 'default') {
          color = '#E74C3C'
        }

        series.push({
          name: parent.format(ver),
          data: Object.keys(parent.data[ver]).map(function (key) {
            return parent.data[ver][key]
          }),
          visible: vis,
          color: color
        })
      })

      return series
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
    config: {
      //This is not a highcharts object. It just looks a little like one!
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
      series: [],
      title: {
         text: ''
      },
      loading: false
    },
    create: function(hosts) {
      var parent = this

      // Fill the releases array
      return Version.getReleases().then(function(releases) {
        Version.store.releases = releases

        // Sort the hosts into an object of versions
        var data = Version.getVersionsFromHost(hosts)

        // Convert the Versions object into a series array
        parent.config.series = Version.getSeriesFromVersions(data)

        // @todo Insert a mechanism to sort data. Not necessary for Highcharts column chart.

        return parent.config
      })
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
.controller('SharedCtrl', ['$scope', 'YamlService', 'ChartService', 'Version', function($scope, YamlService, ChartService, Version) {

  YamlService.get('shared_hosts').then(function(data){
    $scope.hosts = data
    ChartService.create(data).then(function(data){
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
.controller('CustomCtrl', ['$scope', 'YamlService', 'ChartService', 'Version', function($scope, YamlService, ChartService, Version) {

  // @todo Add version release dates to table tooltips
  YamlService.get('custom_hosts').then(function(data){
    $scope.hosts = data
    ChartService.create(data).then(function(data){
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
.controller('LinuxCtrl', ['$scope', 'YamlService', 'ChartService', 'Version', function($scope, YamlService, ChartService, Version) {

  // @todo Add version release dates to table tooltips
  YamlService.get('linux_distros').then(function(data){
    $scope.distros = data
    ChartService.create(data).then(function(data){
      $scope.chartConfig = data
    })
  })

  $scope.versionInfo = function(key) {
    Version.info(key, function(err, output) {
      console.log(output)
    })
  }

}])