'use strict';

angular.module('phpVersionInfo.yaml', [])

/*****************************************************************
*
* Yaml factory
*
******************************************************************/
.factory('Yaml', function($http) {
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