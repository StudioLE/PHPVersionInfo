'use strict';

angular.module('phpVersionInfo.chart', ['highcharts-ng'])

/*****************************************************************
*
* Chart factory
*
******************************************************************/
.factory('Chart', function(Version) {
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