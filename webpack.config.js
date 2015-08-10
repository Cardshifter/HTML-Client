'use strict';
var webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/cardshifter.js',
    vendor: ['angular', 'angular-route']
  },
  output: {
    path: './dist/',
    filename: 'cardshifter.js',
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
  ]
};
