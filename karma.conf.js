'use strict';

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    files: [
      'src/**/*.spec.js'
    ],
    processors: {
      '*.spec.js': 'webpack'
    },
    webpack: {

    },
    singleRun: true
  });
};