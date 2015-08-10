'use strict';
var webpack = require('webpack');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

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
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js'),
    new ngAnnotatePlugin()
  ],
  devServer: {
    port: 8080,
    contentBase: './www',
    historyApiFallback: true
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      { test: /\.html/, loader: 'html' },
      { test: /\.css/, loaders: ['style', 'css'] }
    ]
  }
};
