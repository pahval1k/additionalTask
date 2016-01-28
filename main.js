'use strict';

var myApp = angular.module('myApp', []);

myApp.controller('svgController', ['$scope', function ($scope) {
    var lines = [];
    $scope.lines = lines;
    $scope.XOffset = 40; // space between top and horizontal line 
    $scope.YOffset = 20; // space between left and vertical line
    $scope.points = 5; // how many markers should be on vertical and horizontal lines
    $scope.lengthX = 500; // length of horizontal line
    $scope.lengthY = 300; // length of vertical line
    $scope.blockX = ($scope.lengthX) / $scope.points;
    $scope.blockY = ($scope.lengthY) / $scope.points;
    $scope.pointsOffsetX = 0; // start point to calculate x markers
    $scope.getPointsArray = function (num) {
        return new Array(num);
    }

}]);


myApp.service('coordinatesService', ['$http', function ($http) {
    return function (x0, y0, x1min, capacityY) {
        return $http({
            method: "POST",
            url: "/getGraphData",
            data: {
                x0: x0,
                y0: y0,
                x1min: x1min,
                capacityY: capacityY
            }
        });
    }
}]);

myApp.directive('svgGraph', ['coordinatesService', '$interval', '$document', function (coordinatesService, $interval, $document) {
    return {
        restrict: 'E', // allowed to use only as a element
        replace: true,
        templateUrl: "svgGraph.html",
        link: function (scope, element, attrs, ctrl) {

            // god, don't even try to understand this bunch of code. even author of this doesn't fully understand what's going on here 

            var x0 = 0,
                y0 = 0,
                x1 = 0,
                y1 = 0; // coordinates of lines
            var requestFailed = false; // state represents whether request to the server has been falled

            var distance = 0; // distance between x0:0 and x1 of the first line of the graph


            function shiftLines() { // shifts all lines back. 

                var lineLength = scope.lines.length;
                for (var i = 0; i < lineLength; i++) {
                    if (i == 0) {
                        distance = scope.lines[i].x1 - scope.lines[i].x0;
                        scope.pointsOffsetX += distance;
                        //pointsOffsetX = Infinity; // for infinity case
                    }
                    scope.lines[i].x0 -= distance;
                    scope.lines[i].x1 -= distance;

                }
                scope.lines.shift(); // remove first element
                x0 = scope.lines[scope.lines.length - 1].x0 - scope.XOffset;
                x1 = scope.lines[scope.lines.length - 1].x1 - scope.XOffset; // last x point of line

            }

            function resetGraph() {
                x0 = scope.XOffset;
                y0 = scope.YOffset;
                x1 = scope.XOffset;
                y1 = scope.YOffset;
                scope.pointsOffsetX = 0;
                scope.lines = [];
            }

            $interval(function () {

                // if request to the server has not been falled and if there are lines on graph. 
                if (scope.lines.length && !requestFailed) {
                    x0 = x1;
                    y0 = y1;
                }

                if (x1 > scope.lengthX) { // if there are no space to add new line on the graph
                    shiftLines();
                    //shiftPointsX(pointsOffsetX);
                    if (scope.pointsOffsetX == Infinity) {
                        alert("Your values reached Infinity");
                        resetGraph();
                    }
                } else { // else we get data from the server and display it on the graph
                    coordinatesService(x0, y0, x1, scope.lengthY).then(function successCallback(response) {
                        x1 = response.data.x1;
                        y1 = response.data.y1;
                        var line = addOffsetsIntoLine(response.data);
                        scope.lines.push(line);
                        requestFailed && (requestFailed = false);
                    }, function errorCallback(response) {
                        requestFailed = true;
                        throw "request failed";
                    });
                }

            }, 2000);

            function addOffsetsIntoLine(line) { // adds appropriate offsets to every point of the line
                line.x0 += scope.XOffset;
                line.y0 += scope.YOffset;
                line.x1 += scope.XOffset;
                line.y1 += scope.YOffset;
                return line;

            }

        }
    };
}]);


myApp.controller("dropdownDemo", function($scope) {
	$scope.colours = [{
		name: "Red",
		hex: "#F21B1B"
	}, {
		name: "Blue",
		hex: "#1B66F2"
	}, {
		name: "Green",
		hex: "#07BA16"
	}];
	$scope.colour = "";
});

myApp.run(function($rootScope) {
	angular.element(document).on("click", function(e) {
		$rootScope.$broadcast("documentClicked", angular.element(e.target));
	});
});

myApp.directive("dropdown", function($rootScope) {
	return {
		restrict: "E",
		templateUrl: "dropDownTemplate.html",
		scope: {
			placeholder: "@",
			list: "=",
			selected: "=",
			property: "@"
		},
		link: function(scope) {
			scope.listVisible = false;
			scope.isPlaceholder = true;

			scope.select = function(item) {
				scope.isPlaceholder = false;
				scope.selected = item;
			};

			scope.isSelected = function(item) {
				return item[scope.property] === scope.selected[scope.property];
			};

			scope.show = function() {
				scope.listVisible = true;
			};

			$rootScope.$on("documentClicked", function(inner, target) {
				/*console.log(angular.element(target[0]).is(".dropdown-display.clicked") || angular.element(target[0]).parents(".dropdown-display.clicked").length > 0);
                console.log(target[0]);*/
                //console.log(angular.element(target[0]).parent()[0].className == "dropdown-display clicked");
				if (angular.element(target[0]).parent()[0].className != "dropdown-display clicked") {
                    //console.log("asdf");
                    scope.$apply(function() {
                        scope.listVisible = false;
                    });
                }
					
			});

			scope.$watch("selected", function(value) {
				scope.isPlaceholder = scope.selected[scope.property] === undefined;
				scope.display = scope.selected[scope.property];
			});
		}
	}
});

myApp.service('menuRequestService', ['$http', function ($http) {
    return function () {
        return $http({
            method: "POST",
            url: "/getMenuRequestData"
        });
    }
}]);

myApp.controller("drpdownController",['$scope', 'menuRequestService', function($scope, menuRequestService) {
	$scope.menu = [{
		menuLabel: "menu item 1",
        menuId: "menuId1",
	}, {
		menuLabel: "menu item 2",
        menuId: "menuId2",
	}, {
		menuLabel: "menu item 3",
        menuId: "menuId3"
	}];
    $scope.openDropdown = false;
    $scope.dropdownToggle = function() { 
        if ($scope.openDropdown) {
            $scope.openDropdown = false;  
        } else { 
            $scope.openDropdown = true;
        }

    }
    
}]);



myApp.directive("drpdown",['$rootScope', 'menuRequestService', function($rootScope, menuRequestService) {
    
    return {
		restrict: "E",
		templateUrl: "drpdownTemplate.html",
		link: function(scope, element, attrs, ctrl) {
            $rootScope.$on("documentClicked", function(inner, target) {

                var notDrpdownButtonIcon = angular.element(target[0])[0].className != "caret";
                var notMenuItem = angular.element(target[0])[0].className != "menuItem ng-binding"
                var notDrpdownButton = angular.element(target[0]).parent()[0].className != "btn-group open";
				if (notDrpdownButton && notMenuItem && notDrpdownButtonIcon) {
                    scope.$apply(function() {
                        scope.openDropdown = false;
                    });
                }	
			});
            scope.sendRequest = function(item) { 
               var menuItemElement = angular.element(document.getElementById(item.menuId));
               var classMarkers = ["glyphicon-ok green", "glyphicon-loading-mask" , "glyphicon-remove red"];
               classMarkers.forEach(function(item, i, arr) {
                  if (menuItemElement.hasClass(item)) { 
                      menuItemElement.removeClass(item);
                  }
               });
               menuItemElement.addClass("glyphicon-loading-mask");
               menuRequestService().then(function successCallback(response) {
                    menuItemElement.removeClass("glyphicon-loading-mask");  
                    if (response.data) { 
                         menuItemElement.addClass("glyphicon-ok green");  
                    } else {
                         menuItemElement.addClass("glyphicon-remove red");  
                    }
               }, function errorCallback(response) {
                    throw "request failed";
               });
            }
            
		}
	}
    
}]);