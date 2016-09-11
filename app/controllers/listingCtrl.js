angular
	.module('ngRoRMessages')
	.controller('listingCtrl', ['$scope', 'messagesService', function ($scope, $messagesService) {
		$scope.gettingMessages = false;
		
		function getMessages() {
			if(!$scope.gettingMessages) {
				$scope.gettingMessages = true;

				$messagesService.list(function(data) {
					$scope.gettingMessages = false;
					$scope.messages = data;

					setTimeout(getMessages, 3000);
				});
			}
		}

		$scope.getMessages = getMessages;

		getMessages();
	}]);