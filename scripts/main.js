angular.module('scour', ['ngResource'])

.factory('GooglePlus', ['$resource', function($resource) {
	return $resource('https://www.googleapis.com/plus/v1/activities', {}, {get: {method: 'JSONP', params: {key: 'AIzaSyDfmmrGRX43dlB9jMiCjyN2Zv1toEq-ZXk', callback: 'JSON_CALLBACK'}}});
}])

.factory('Twitter', ['$resource', function($resource) {
	return $resource('http://search.twitter.com/search.json', {}, {get: {method: 'JSONP', params: {lang: 'en', callback: 'JSON_CALLBACK'}}});
}])

.factory('Facebook', ['$resource', function($resource) {
	return $resource('https://graph.facebook.com/search', {}, {get: {method: 'JSONP', params: {q: '@q', type: 'post', limit: 10, callback: 'JSON_CALLBACK'}}});
}]);

function ScoutCtrl($scope, Facebook, Twitter, GooglePlus) {

	var currentQuery = '';

	$scope.googlePlus = {searching: false};
	$scope.twitter = {searching: false};
	$scope.facebook = {searching: false};

	$("#google-plus-end").appear();
	$("#twitter-end").appear();
	$("#facebook-end").appear();

	$scope.search = function() { if ($scope.query !== '') {
		currentQuery = $scope.query;

		Twitter.get({q: currentQuery}, function onSuccess(result) {
			$scope.twitter.items = result.results;
			$scope.twitter.page = result.page;
			$scope.twitter.maxId = result.max_id_str;
		});

		Facebook.get({q: currentQuery}, function onSuccess(result) {
			$scope.facebook.items = result.data;
			$scope.facebook.until = result.paging.next.match(/&until=(\d+)/)[1];
		});

		GooglePlus.get({query: currentQuery}, function onSuccess(result) {
			$scope.googlePlus.items = result.items;
			$scope.googlePlus.nextToken = result.nextPageToken;
		});
	}};

	$scope.getGooglePlusActorImage = function(url) {
		return url.replace(/\?sz=50/i, '?sz=20');
	};

	$(document.body).on('appear', '#google-plus-end', function(e, $affected) {
		if (!$scope.googlePlus.searching) {
			$scope.googlePlus.searching = true;

			var request = {query: currentQuery, pageToken: $scope.googlePlus.nextToken}

			GooglePlus.get(request, function onSuccess(result) {
				$scope.googlePlus.nextToken = result.nextPageToken;
				$scope.googlePlus.items = $scope.googlePlus.items.concat(result.items);

				window.setTimeout(function() { $scope.googlePlus.searching = false; }, 1000);
			});
		}
	});

	$(document.body).on('appear', '#twitter-end', function(e, $affected) {
		if (!$scope.twitter.searching) {
			$scope.twitter.searching = true;

			Twitter.get({q: currentQuery, page: $scope.twitter.page + 1, max_id: $scope.twitter.maxId}, function onSuccess(result) {
				$scope.twitter.page = result.page;
				$scope.twitter.maxId = result.max_id;
				$scope.twitter.items = $scope.twitter.items.concat(result.results);

				window.setTimeout(function() { $scope.twitter.searching = false; }, 1000);
			});
		}
	});

	$(document.body).on('appear', '#facebook-end', function(e, $affected) {
		if (!$scope.facebook.searching) {
			$scope.facebook.searching = true;

			Facebook.get({q: currentQuery, until: $scope.facebook.until}, function onSuccess(result) {
				$scope.facebook.until = result.paging.next.match(/&until=(\d+)/)[1];
				$scope.facebook.items = $scope.facebook.items.concat(result.data);

				window.setTimeout(function() { $scope.facebook.searching = false; }, 1000);
			});
		}
	});
}
