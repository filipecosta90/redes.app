
/* ------------------------------------------------------- 

* Filename:     AngularJS Dynamic Form Fields
* Website:      http://www.shanidkv.com
* Description:  Shanidkv AngularJS blog
* Author:       Shanid KV shanidkannur@gmail.com

---------------------------------------------------------*/

var app = angular.module('shanidkvApp', []);

  app.controller('MibCtrl', function($scope) {

  $scope.mibs = [{id: 0}, {id: 1}];
  
  $scope.addNewMib = function() {
    var newMibNo = $scope.mibs.length;
    $scope.mibs.push({'id': newMibNo});
  };
    
  $scope.removeMib = function() {
    var lastMib = $scope.mibs.length-1;
    $scope.mibs.splice(lastMib);
  };
  
});
