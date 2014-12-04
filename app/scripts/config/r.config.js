'use strict';

require.config({
  // make components more sensible
  // expose jquery 
  baseUrl: '/',
  urlArgs: (new Date).getTime(), // Todo: just for testing
  paths: {
    'bower_components': '../bower_components',
    'text': '../bower_components/requirejs-text/text',
    'zepto': '../bower_components/zeptojs/dist/zepto',
    'backbone': '../bower_components/backbone/backbone',
    'underscore': '../bower_components/underscore/underscore',
    'iscroll': '../bower_components/iscroll/build/iscroll-lite',
    'queryString': '../bower_components/query-string/query-string',
    'widgets': 'scripts/widgets',
    'modules': 'scripts/modules',
  },
  shim:{
    zepto: {
      exports: '$'
    },
    iscroll: {
      exports: 'IScroll'
    }
  },
  map:{
    '*': {
      jquery: 'zepto'
    }
  }
});
