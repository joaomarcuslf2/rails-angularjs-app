angular
	.module('ngRoRMessages')
	.controller('creatingCtrl', ['$scope', 'messagesService', '$location', function ($scope, $messagesService, $location) {
		$scope.sendingMessage = false;
		$scope.sendMessage = function(post) {
			$scope.sendingMessage = true;
			
			$messagesService.send(post, function(data) {
				$location.path('/list')
			});
		};
	}])