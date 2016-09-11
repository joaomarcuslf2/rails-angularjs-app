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

		function _send(post, successCalback) {
			var postFormated = { post: post };
			$http({
				method: 'post',
				crossDomain: true,
				url: url.prefix + '/posts' + url.sufix,
				type: 'json',
				params: post
			})
			.success(successCalback)
			.error(function(data) {
			});
		}
	
		return {
			list: _list,
			send: _send
		};
	});