angular
	.module('ngRoRMessages')
	.factory('messagesService',['$http', ($http) => {
				
			let url = {
				prefix: 'http://localhost:3000',
				sufix: '.json'
			};
	
	
			let _list = (successCalback) => {
				$http({
					method: 'get',
					url: url.prefix + '/posts' + url.sufix
				}).success(successCalback);
			}
	
			let _send = (post, successCalback) => {
				let postFormated = { post: post };
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
		}]);