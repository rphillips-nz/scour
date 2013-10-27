angular.module('scour', ['ngResource', 'ngSanitize'])

.factory('GooglePlus', ['$resource', function($resource) {
	return $resource('https://www.googleapis.com/plus/v1/activities', {}, {get: {method: 'JSONP', params: {key: 'AIzaSyDfmmrGRX43dlB9jMiCjyN2Zv1toEq-ZXk', callback: 'JSON_CALLBACK'}}});
}])

.factory('Reddit', ['$resource', function($resource) {
	return $resource('http://www.reddit.com/search.json', {}, {get: {method: 'JSONP', params: {jsonp: 'JSON_CALLBACK', sort: 'hot', limit: 10}}});
}])

.controller('ScourCtrl', ['$scope', '$timeout', 'Reddit', 'GooglePlus', function($scope, $timeout, Reddit, GooglePlus) {
	$scope.unescape = _.unescape;

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
			if (!$scope.googlePlus.searching && currentQuery !== '') {
				$scope.googlePlus.searching = true;

				var request = {query: currentQuery};
				if ($scope.googlePlus.nextToken) request.pageToken = $scope.googlePlus.nextToken;

				GooglePlus.get(request, function onSuccess(result) {
					$scope.googlePlus.nextToken = result.nextPageToken;
					$scope.googlePlus.items = $scope.googlePlus.items.concat(result.items);

					$timeout(function() { console.log('wtf');$scope.googlePlus.searching = false; }, 1000);
				});
			}
		}
	};

	$scope.reddit = {
		items: [],
		searching: false,
		clear: function() {
			$scope.reddit.items = [];
			$scope.reddit.searching = false;
			$scope.reddit.maxId = undefined;
			$scope.reddit.page = undefined;
		},
		feed: function() {
			if (!$scope.reddit.searching && currentQuery !== '') {
				$scope.reddit.searching = true;

				var request = {q: currentQuery};
				if ($scope.reddit.after) request.after = $scope.reddit.after;

				Reddit.get(request, function onSuccess(result) {
					$scope.reddit.after = result.data.after;
					$scope.reddit.items = $scope.reddit.items.concat(result.data.children);

					$timeout(function() { $scope.reddit.searching = false; }, 1000);
				});
			}
		}
	};

	$scope.search = function() {
		if ($scope.query !== '') {
			currentQuery = $scope.query;

			$scope.reddit.clear();
			$scope.googlePlus.clear();

			$scope.reddit.feed();
			$scope.googlePlus.feed();
		}
	};

	$("#google-plus-end").appear();
	$("#reddit-end").appear();
	$(document.body).on('appear', '#google-plus-end', $scope.googlePlus.feed);
	$(document.body).on('appear', '#reddit-end', $scope.reddit.feed);

	$scope.getGooglePlusActorImage = function(url) {
		return url.replace(/\?sz=50/i, '?sz=20');
	};

	$scope.has = function(key, object) {
		return typeof object[key] !== 'undefined';
	};

	$scope.query = 'travel stories';
	$scope.search();
}]);
