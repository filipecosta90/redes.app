/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('tutorialWebApp', [
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



