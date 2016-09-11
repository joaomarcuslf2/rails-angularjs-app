angular
	.module('ngRoRMessages')
	.config(function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
	});