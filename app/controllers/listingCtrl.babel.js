angular
	.module('ngRoRMessages')
	.controller('listingCtrl', ['$scope', 'messagesService', ($scope, $messagesService) => {
		$scope.gettingMessages = false;
		
		 let getMessages = () => {
			if(!$scope.gettingMessages) {
				$scope.gettingMessages = true;

				$messagesService.list((data) => {
					$scope.gettingMessages = false;
					$scope.messages = data;

					setTimeout(getMessages, 3000);
				});
			}
		}

		$scope.getMessages = getMessages;

		getMessages();
	}]);