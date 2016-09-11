angular
	.module('ngRoRMessages')
	.config(function($routeProvider) {
	    $routeProvider
	    .when("/list", {
	        templateUrl : '/assets/views/listing.html',
	        controller  : 'listingCtrl'
	    })
	    .when("/create", {
	        templateUrl : '/assets/views/creating.html',
	        controller  : 'creatingCtrl'
	    })
	    .otherwise({ redirectTo: '/list' });
	});