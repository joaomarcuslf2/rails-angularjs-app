angular
	.module('ngRoRMessages')
	.controller('creatingCtrl', ['$scope', 'messagesService', '$location', ($scope, $messagesService, $location) => {
		$scope.sendingMessage = false;
		$scope.sendMessage = (post) => {
			$scope.sendingMessage = true;
			
			$messagesService.send(post, (data) => {
				$location.path('/list')
			});
		};
	}])