angular.module('scour', ['ngResource'])

.factory('GooglePlus', ['$resource', function($resource) {
	return $resource('https://www.googleapis.com/plus/v1/activities', {}, {get: {method: 'JSONP', params: {key: 'AIzaSyDfmmrGRX43dlB9jMiCjyN2Zv1toEq-ZXk', callback: 'JSON_CALLBACK'}}});
}])

.factory('Twitter', ['$resource', function($resource) {
	return $resource('http://search.twitter.com/search.json', {}, {get: {method: 'JSONP', params: {lang: 'en', callback: 'JSON_CALLBACK'}}});
}])

.factory('Facebook', ['$resource', function($resource) {
	return $resource('https://graph.facebook.com/search', {}, {get: {method: 'JSONP', params: {q: '@q', type: 'post', limit: 10, callback: 'JSON_CALLBACK'}}});
}])

.controller('ScourCtrl', ['$scope', 'Facebook', 'Twitter', 'GooglePlus', function($scope, Facebook, Twitter, GooglePlus) {

	var currentQuery = '';

	$scope.googlePlus = {
		items: [],
		searching: false,
		clear: function() {
			$scope.googlePlus.items = [];
			$scope.googlePlus.searching = false;
			$scope.googlePlus.nextToken = undefined;
		},
		feed: function () {
			if (!$scope.googlePlus.searching && currentQuery != '') {
				$scope.googlePlus.searching = true;

				var request = {query: currentQuery}
				if ($scope.googlePlus.nextToken) request.pageToken = $scope.googlePlus.nextToken;

				GooglePlus.get(request, function onSuccess(result) {
					$scope.googlePlus.nextToken = result.nextPageToken;
					$scope.googlePlus.items = $scope.googlePlus.items.concat(result.items);

					window.setTimeout(function() { $scope.googlePlus.searching = false; }, 1000);
				});
			}
		}
	};

	$scope.twitter = {
		items: [],
		searching: false,
		clear: function() {
			$scope.twitter.items = [];
			$scope.twitter.searching = false;
			$scope.twitter.maxId = undefined;
			$scope.twitter.page = undefined;
		},
		feed: function() {
			if (!$scope.twitter.searching && currentQuery != '') {
				$scope.twitter.searching = true;

				var request = {q: currentQuery};
				if ($scope.twitter.page) request.page = $scope.twitter.page + 1;
				if ($scope.twitter.maxId) request.max_id = $scope.twitter.maxId;

				Twitter.get(request, function onSuccess(result) {
					$scope.twitter.page = result.page;
					$scope.twitter.maxId = result.max_id;
					$scope.twitter.items = $scope.twitter.items.concat(result.results);

					window.setTimeout(function() { $scope.twitter.searching = false; }, 1000);
				});
			}
		}
	};

	$scope.facebook = {
		items: [],
		searching: false,
		clear: function() {
			$scope.facebook.items = [];
			$scope.facebook.searching = false;
			$scope.facebook.until = undefined;
		},
		feed: function() {
			if (!$scope.facebook.searching && currentQuery != '') {
				$scope.facebook.searching = true;

				var request = {q: currentQuery}
				if ($scope.facebook.until) request.until = $scope.facebook.until;

				Facebook.get(request, function onSuccess(result) {
					$scope.facebook.until = result.paging ? result.paging.next.match(/&until=(\d+)/)[1] : undefined;
					$scope.facebook.items = $scope.facebook.items.concat(result.data);

					window.setTimeout(function() { $scope.facebook.searching = false; }, 1000);
				});
			}
		}
	};

	$scope.search = function() {
		if ($scope.query !== '') {
			currentQuery = $scope.query;

			$scope.twitter.clear();
			$scope.googlePlus.clear();
			$scope.facebook.clear();

			$scope.twitter.feed();
			$scope.googlePlus.feed();
			$scope.facebook.feed();
		}
	};

	$("#google-plus-end").appear();
	$("#twitter-end").appear();
	$("#facebook-end").appear();
	$(document.body).on('appear', '#google-plus-end', $scope.googlePlus.feed);
	$(document.body).on('appear', '#twitter-end', $scope.twitter.feed);
	$(document.body).on('appear', '#facebook-end', $scope.facebook.feed);

	$scope.getGooglePlusActorImage = function(url) {
		return url.replace(/\?sz=50/i, '?sz=20');
	};

	$scope.has = function(key, object) {
		return typeof object[key] != 'undefined';
	};

}]);
