'use strict';
require('./cardshifter.css');
var angular = require('angular')
var ngRoute = require('angular-route');
var lobby = require('./lobby/module');
var login = require('./login/module');
var deckBuilder = require('./deck_builder/module');
var topNavbar = require('./top_navbar/module');

angular.module("CardshifterApp", [ngRoute,
  topNavbar.name,
  deckBuilder.name, 
  lobby.name, 
  login.name
]);
 
