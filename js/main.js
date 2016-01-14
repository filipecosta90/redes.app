/**
 * AngularJS Network Managment Assignment2
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
	$scope.measured_value = [];
	$scope.dataCounter = 0;
	$scope.formData.ip_address = 'localhost';
	$scope.formData.snmp_key = 'public';
	$scope.formData.snmp_oids = ['1.3.6.1.2.1.4.1','1.3.6.1.2.1.4.3'];
	$scope.graphs = [ { "name" : "SNMP Graph", "height": 300, "series" : [] }];

	$scope.addNewMib = function() {
		$scope.formData.snmp_oids.push("");
	};

	$scope.removeMib = function() {
		var lastMib = $scope.formData.snmp_oids.length-1;
		$scope.formData.snmp_oids.splice(lastMib);
	};

	$scope.initControlls = function(){
		console.log($scope.formData.snmp_oids.length);
		for ( var pos = 0; pos < $scope.formData.snmp_oids.length ; pos++ ){
			$scope.measured_value.push(0);
		} 
	};

	$scope.calculateKeys = function () {
		for ( var pos = 0; pos < $scope.formData.snmp_oids.length ; pos++ ){
			$scope.measured_value.push(0);
			var key_graph = $scope.formData.snmp_oids[pos];
			$scope.keys.push( key_graph );
			$scope.graphs[0].series.push({ label:'oid:' + key_graph, enabled: true, key:  key_graph });
			console.log($scope.graphs.series);
			$scope.graphData.push({ "key":  key_graph, "values": [] });
		}
	};

	var param = function(data) {
		var returnString = '';
		for (d in data){
			if (data.hasOwnProperty(d))
				returnString += d + '=' + data[d] + '&';
		}
		// Remove last ampersand and return
		return returnString.slice( 0, returnString.length - 1 );
	};

	$scope.calculateCorrectKey = function (key) {
		var key_size = key.length;
		var cutted_key = key.substr(0, key_size - 2);
		return cutted_key;
	};

	$scope.calculateKeyPosition = function (key) {
		var key_size = key.length;
		var cutted_key = key.substr(0, key_size - 2);
		var index_key = $scope.formData.snmp_oids.indexOf(cutted_key);
		return index_key;
	};

	$scope.fetchSNMP = function() {
		console.log('1abdb1abdbss');
		$http({
			method : 'POST',
			url : 'cgi-bin/snmp.pl',
			data : param($scope.formData), // pass in data as strings
			headers : { 'Content-Type': 'application/x-www-form-urlencoded' } // set the headers so angular passing info as form data (not request payload)
		})
		.success(function(data) {
			if (data != null ){
				if (!data.success) {
					// if not successful, bind errors to error variables
					$scope.error_ip_address = data.errors.ip_address;
					$scope.error_snmp_key = data.errors.snmp_key;
					$scope.error_snmp_mib = data.errors.snmp_mib;
					$scope.submissionMessage = data.messageError;
					$scope.submission = true; //shows the error message
				} else {
					$scope.submission_result = data; // Show result from server in our <pre></pre> element
					// if successful, bind success message to message
					if ($scope.keys.length === 0) {
						console.log('\t$scope.keys length is 0. going to calculate keys() ');
						$scope.calculateKeys();
					}
					if ($scope.initial_measured == false) {
						console.log('\t$scope.initial_measured = false ');
						$scope.measured_time = angular.fromJson(data.snmp_time);
					}
		//			$scope.data = data;
					var snmp_time = angular.fromJson(data.snmp_time);
					var timeDiff = snmp_time - $scope.measured_time;
					$scope.dataCounter = $scope.dataCounter + timeDiff;
					$scope.measured_time = snmp_time;
					console.log('setInterval counter is now at : ' + $scope.dataCounter);
					var snmp_data = angular.fromJson (data.snmp_time); 
					console.log( "time : "+snmp_time );
					angular.forEach(data.snmp_data, function(value, key) {
						var $graph_pos = $scope.calculateKeyPosition(key);
						console.log ('inside for each :: ' + $graph_pos );
						if ( $graph_pos >= 0 ){
							if ( $scope.initial_measured == false ){
								$scope.measured_value[$graph_pos]= value;
							}
							var $difference_values = value - $scope.measured_value[$graph_pos];
							console.log ( 'difference: ' + $difference_values + 'value: ' + value + ' measured:' + $scope.measured_value[$graph_pos] );
							$scope.graphData[$graph_pos].values.push([$scope.dataCounter, $difference_values]);

							//$scope.graphData[0].series[$scope.calculateCorrectKey(key)].values.push([$scope.dataCounter, $difference_values]);
							console.log (key + ':['+ $graph_pos +'] ' + value + ' diff ' + $difference_values );
						}
					}, $);
					$scope.submissionMessage = data.messageSuccess;
					$scope.initial_measured = true;
					$scope.submission = true; //shows the success message
					console.log('out');
				}

				console.log('out2');
			}
		console.log('out 3');
		});
	console.log('out 4');
	};
	var stop;
	$scope.clear = function(){
		$scope.initControlls();
		$scope.dataCounter = 0;
		$scope.keys = [];
		$scope.graphData = [];

		$scope.calculateKeys();
	};

	$scope.start = function() {
		// Don't start again
		if ( angular.isDefined(stop) ) return;
		$scope.initControlls();
		$scope.fetchSNMP();
		$scope.submission = true;
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

