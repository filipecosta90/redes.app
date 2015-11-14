/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('networkManagmentWebApp', [
		'ngRoute'
		]);


/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
		// Home
		.when("/", {templateUrl: "partials/home.html", controller: "PageCtrl"})
		// Pages
		.when("/about", {templateUrl: "partials/about.html", controller: "PageCtrl"})
		.when("/chart", {templateUrl: "partials/chart.html", controller: "PageCtrl"})
		.when("/snmp", {templateUrl: "partials/snmp.html", controller: "PageCtrl"})
		.when("/services", {templateUrl: "partials/services.html", controller: "PageCtrl"})
		.when("/contact", {templateUrl: "partials/contact.html", controller: "PageCtrl"})
		// Blog
		.when("/blog", {templateUrl: "partials/blog.html", controller: "BlogCtrl"})
		.when("/blog/post", {templateUrl: "partials/blog_item.html", controller: "BlogCtrl"})
		// else 404
		.otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
		}]);

/**
 * Controls the SNMP PHP REQUEST
 */
app.controller('SNMP', function($scope, $http) {	
		console.log(" SNMP Controller reporting for duty.");
		$scope.url = 'php/snmp_redes.php'; // The url of our search

		// The function that will be executed on button click (ng-click="search()")
		$scope.search = function() {

		// Create the http post request
		// the data holds the keywords
		// The request is a JSON request.
		$http.post($scope.url, { "data" : $scope.keywords}).
		success(function(data, status) {
			$scope.status = status;
			$scope.data = data;
			$scope.result = data; // Show result from server in our <pre></pre> element
			})
		.
		error(function(data, status) {
			$scope.data = data || "Request failed";
			$scope.status = status;			
			});
		};
});

app.controller('SNMP_FORM', function($scope, $http){
		console.log(" Formulario SNMP Controller reporting for duty.");
		$scope.submission = false;

		$scope.formData = {};
		// submission message doesn't show when page loads

		// Updated code thanks to Yotam
		var param = function(data) {
		var returnString = '';
		for (d in data){
		if (data.hasOwnProperty(d))
		returnString += d + '=' + data[d] + '&';
		}
		// Remove last ampersand and return
		return returnString.slice( 0, returnString.length - 1 );
		};
		$scope.submitForm = function() {
		console.log(" Form submited.");
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
                        $scope.data = data;
                        $scope.submission_result = data; // Show result from server in our <pre></pre> element
		
$scope.submissionMessage = data.messageSuccess;
		$scope.formData = {}; // form fields are emptied with this line
		$scope.submission = true; //shows the success message
		}
		});
};
});

  app.controller('TicksCtrl', ['$scope' , '$interval', function ($scope, $interval) {
    
                console.log("Ticks Controller reporting for duty.");
var maximum = document.getElementById('container').clientWidth / 2 || 300;
    $scope.data = [[]];
    $scope.labels = [];
    $scope.options = {
      animation: false,
      showScale: false,
      showTooltips: false,
      pointDot: false,
      datasetStrokeWidth: 0.5
    };

    // Update the dataset at 25FPS for a smoothly-animating chart
    $interval(function () {
      getLiveChartData();
    }, 40);

    function getLiveChartData () {
      if ($scope.data[0].length) {
        $scope.labels = $scope.labels.slice(1);
        $scope.data[0] = $scope.data[0].slice(1);
      }

      while ($scope.data[0].length < maximum) {
        $scope.labels.push('');
        $scope.data[0].push(getRandomValue($scope.data[0]));
      }
    }

  function getRandomValue (data) {
    var l = data.length, previous = l ? data[l - 1] : 50;
    var y = previous + Math.random() * 10 - 5;
    return y < 0 ? 0 : y > 100 ? 100 : y;
  }

  }]);

app.controller('TabsCtrl', function ($scope) {
    $scope.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.active = true;
    $scope.data = [
      [65, 59, 90, 81, 56, 55, 40],
      [28, 48, 40, 19, 96, 27, 100]
    ];
  });

  app.controller('DataTablesCtrl', function ($scope) {
                console.log("DataTables Controller reporting for duty.");
    $scope.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    $scope.data = [
      [65, 59, 80, 81, 56, 55, 40],
      [28, 48, 40, 19, 86, 27, 90]
    ];
    $scope.colours = [
      { // grey
        fillColor: 'rgba(148,159,177,0.2)',
        strokeColor: 'rgba(148,159,177,1)',
        pointColor: 'rgba(148,159,177,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(148,159,177,0.8)'
      },
      { // dark grey
        fillColor: 'rgba(77,83,96,0.2)',
        strokeColor: 'rgba(77,83,96,1)',
        pointColor: 'rgba(77,83,96,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(77,83,96,1)'
      }
    ];
    $scope.randomize = function () {
      $scope.data = $scope.data.map(function (data) {
        return data.map(function (y) {
          y = y + Math.random() * 10 - 5;
          return parseInt(y < 0 ? 0 : y > 100 ? 100 : y);
        });
      });
    };
  });


/**
 * Controls the Blog
 */
app.controller('BlogCtrl', function (/* $scope, $location, $http */) {
		console.log("Blog Controller reporting for duty.");
		});

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function (/* $scope, $location, $http */) {
		console.log("Page Controller reporting for duty.");

		// Activates the Carousel
		$('.carousel').carousel({
interval: 5000
});

		// Activates Tooltips for Social Links
		$('.tooltip-social').tooltip({
selector: "a[data-toggle=tooltip]"
})
		});



