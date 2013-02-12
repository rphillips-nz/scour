angular.module('scout', ['ngResource'])

.factory('GooglePlus', ['$resource', function($resource) {
	return $resource('https://www.googleapis.com/plus/v1/activities', {}, {get: {method: 'JSONP', params: {key: 'AIzaSyDfmmrGRX43dlB9jMiCjyN2Zv1toEq-ZXk', callback: 'JSON_CALLBACK'}}});
}])

.factory('Twitter', ['$resource', function($resource) {
	return $resource('http://search.twitter.com/search.json', {}, {get: {method: 'JSONP', params: {callback: 'JSON_CALLBACK'}}});
}])

.factory('Facebook', ['$resource', function($resource) {
	return $resource('https://graph.facebook.com/search', {}, {get: {method: 'JSONP', params: {q: '@q', type: 'post', callback: 'JSON_CALLBACK'}}});
}]);

function ScoutCtrl($scope, Facebook, Twitter, GooglePlus) {

	$scope.search = function() { if ($scope.query !== '') {
		Twitter.get({q: $scope.query}, function onSuccess(result) {
			$scope.twitterItems = result.results;
		});

		Facebook.get({q: $scope.query}, function onSuccess(result) {
			$scope.facebookItems = result.data;
		});

		GooglePlus.get({query: $scope.query}, function onSuccess(result) {
			$scope.googlePlus = result.items;
		});
	}};

	$scope.getGooglePlusActorImage = function(url) {
		return url.replace(/\?sz=50/i, '?sz=20');
	};
}
