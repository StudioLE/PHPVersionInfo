# PHP Versions Info

An Angular.js frontend for [phpversions.info](http://phpversions.info).

The PHP version data is drawn from the [phpversions.info](https://github.com/philsturgeon/phpversions.info) repository using an `$http` call to [RawGit](http://rawgit.com), release dates of each version are then drawn from a cached version of [php.net's releases](http://php.net/releases/index.php?serialize=1&version=5&max=100) to plot the chart.

The code needs refactoring into Angular factories so currently only the Shared Hosting chart is functional. The [main application controller](https://github.com/StudioLE/PHPVersionInfo/blob/master/app/views/views.js) contains the majority of the code.

The design still needs a lot of work. Initial focus has been on functionality.

## Demo

[Demo website](https://phpversions.studiole.uk)

## Install

This project is based upon angular-seed, you can find installation instructions in the following [README.md](https://github.com/angular/angular-seed/blob/master/README.md).

## phpversions.info

- [Website](http://phpversions.info)
- [GitHub](https://github.com/philsturgeon/phpversions.info)
