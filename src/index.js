import angular from 'angular';
import angularizeCore from './core';
import angularizeComponents from './components';
import "./core/app.templates";

let requires = [
  angularizeCore,
  angularizeComponents,
  'templates',
];
let MODULE_NAME = 'angularize';
let angularize = angular.module(MODULE_NAME, requires);

// make module available on window object
window.angularize = angularize;
console.log("angularize_server: ", window.angularize_server);  

export default MODULE_NAME;