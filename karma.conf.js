'use strict';
var webpackConfiguration = require('./webpack.config');

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
    webpack: webpackConfiguration,
    singleRun: true
  });
};
