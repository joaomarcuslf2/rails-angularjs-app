angular
	.module('ngRoRMessages')
	.factory('messagesService', function ($http) {
			
		var url = {
			prefix: 'http://localhost:3000',
			sufix: '.json'
		};


		function _list(successCalback) {
			$http({
				method: 'get',
				url: url.prefix + '/posts' + url.sufix
			}).success(successCalback);
		}
	
		return {
			list: _list
		};
	});