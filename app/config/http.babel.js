angular
	.module('ngRoRMessages')
	.config(['$httpProvider', ($httpProvider) => {
	        $httpProvider.defaults.useXDomain = true;
		}]);