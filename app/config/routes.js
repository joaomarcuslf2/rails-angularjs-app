angular
	.module('ngRoRMessages')
	.config(function($routeProvider) {
    $routeProvider
    .when("/list", {
        templateUrl : '/assets/views/listing.html',
        controller  : 'listingCtrl'
    })
    .otherwise({ redirectTo: '/list' });
	});