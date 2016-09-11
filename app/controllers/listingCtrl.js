angular
	.module('ngRoRMessages')
	.controller('listingCtrl', ['$scope', 'messagesService', function ($scope, $messagesService) {
		function getMessages() {
			$messagesService.list(function(data) {
				$scope.messages = data;

				setTimeout(getMessages, 3000);
			});
		}

		getMessages();
	}]);