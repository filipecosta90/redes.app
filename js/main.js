/**
 * AngularJS Network Managment Assignment1
 * @author Filipe Oliveira <a57816@alunos.uminho.pt>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('networkManagmentWebApp', ['ngRoute', 'nvd3ChartDirectives']);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
  // Home
  .when("/", {templateUrl: "partials/home.html", controller: "PageCtrl"})
  // Pages
  .when("/about", {templateUrl: "partials/about.html", controller: "PageCtrl"})
  .when("/contact", {templateUrl: "partials/contact.html", controller: "PageCtrl"})
  // else 404
  .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);


/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function (/* $scope, $location, $http */) {
		console.log("Page Controller reporting for duty.");

		// Activates the Carousel
		$('.carousel').carousel({
interval: 5000
}); 
});


/**
 * Controls the SNMP PHP REQUEST
 */
app.controller('snmp_controller', function($scope,  $http,  $log, $interval){
  console.log(" Formulario SNMP Controller reporting for duty.");
  $scope.submission = false;
  $scope.formData = {};
  $scope.dataCounter = 0;
  $scope.keys = [];
  $scope.graphData = [];
  $scope.initial_measured = false;
  $scope.measured_time = 0;
  $scope.measured_value = 0;
  $scope.dataCounter = 0;

  $scope.calculateKeys = function () {
    $scope.keys.push("foo");
    $scope.keys.push("bar");
    $scope.graphData.push({ "key": "foo", "values": [] });
    $scope.graphData.push({ "key": "bar", "values": [] });
  };

  $scope.graphs = [
{
  "name": "Foos Only",
    "height": 300,
    "series": [ { label: 'Foo', key: 'foo', enabled: true } ]
},
{
  "name": "Bars Only",
  "height": 300,
  "series": [ { label: 'Bar', key: 'bar', enabled: true } ]
}
];

var param = function(data) {
  var returnString = '';
  for (d in data){
    if (data.hasOwnProperty(d))
      returnString += d + '=' + data[d] + '&';
  }
  // Remove last ampersand and return
  return returnString.slice( 0, returnString.length - 1 );
};

$scope.fetchSNMP = function() {
  $http({
    method : 'POST',
    url : 'php/snmpv2.php',
    data : param($scope.formData), // pass in data as strings
    headers : { 'Content-Type': 'application/x-www-form-urlencoded' } // set the headers so angular passing info as form data (not request payload)
  })
  .success(function(data) {
    if (!data.success) {
      // if not successful, bind errors to error variables
      $scope.error_ip_address = data.errors.ip_address;
      $scope.error_snmp_key = data.errors.snmp_key;
      $scope.error_snmp_mib = data.errors.snmp_mib;
      $scope.submissionMessage = data.messageError;
      $scope.submission = true; //shows the error message
    } else {
      // if successful, bind success message to message

      if ($scope.keys.length === 0) {
        $scope.calculateKeys();
      }
      if ($scope.initial_measured == true) {
        $scope.measured_time = angular.fromJson(data.time);;
      }

      $scope.data = data;
      var tempo = angular.fromJson(data.time);
      var snmp_packets = angular.fromJson (data.snmp_packets);
      console.log(" Tempo: "+tempo + " snmp packets: " + snmp_packets );
      var timeDiff = tempo - $scope.measured_time;
      $scope.dataCounter = $scope.dataCounter + timeDiff;
      $scope.measured_time = tempo;
      console.log('setInterval counter is now at : ' + $scope.dataCounter);
      $scope.graphData[0].values.push([$scope.dataCounter, snmp_packets])
        $scope.submission_result = data; // Show result from server in our <pre></pre> element
      $scope.submissionMessage = data.messageSuccess;
      $scope.submission = true; //shows the success message
    }
  });
};

var stop;

$scope.clear = function(){
  $scope.dataCounter = 0;
  $scope.keys = [];
  $scope.graphData = [];

  $scope.calculateKeys();
};

$scope.start = function() {
  // Don't start again
  if ( angular.isDefined(stop) ) return;
  $scope.fetchSNMP();
  if ( $scope.submission == true ){
    stop = $interval(function() {
      $scope.fetchSNMP();
    }, 1000);
  }
};

$scope.stop = function() {
  if (angular.isDefined(stop)) {
    $interval.cancel(stop);
    stop = undefined;
  }
};

$scope.$on('$destroy', function() {
  // Make sure that the interval is destroyed too
  $scope.stop();
});

});

app.filter('graphDataFilter', function () {
  return function (data, series) {
    var r = [];

    for (var s = 0; s < series.length; s++) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].key == series[s].key) {
          r.push({ key: series[s].label, values: data[i].values, disabled: !series[s].enabled });
        }
      }
    }

    return r;
  };
});

app.directive('extendedChart', function () {
  return {
    restrict: 'E',
  link: function ($scope) {
    $scope.d3Call = function (data, chart) {
      var svg = d3.select('#' + $scope.id + ' svg').datum(data);

      var path = svg.selectAll('path');

      path.data(data)
  .transition()
  .ease("linear")
  .duration(300);

return svg.transition()
  .duration(300)
  .call(chart);
    };
  }
  };

});


