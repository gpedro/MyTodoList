var todoApp = angular.module('todoApp', ['firebase']);

todoApp.factory('Persistence', ['$firebaseArray', function($firebaseArray) {

  var ref = new Firebase("https://scorching-fire-9077.firebaseio.com/todo");

  return {
    getTodo: function(callback) {
      ref.on("value", function(snapshot) {
        var target = snapshot.val();
        var list = [];
        for (var k in target){
          if (target.hasOwnProperty(k)) {
            list.push({id: k, name: target[k].name, completed: target[k].completed});
          }
        }
        callback(list);
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    },
    add: function(todo) {
      if(todo.id){
        ref.child(todo.id).update({
          completed: todo.completed
        });
      } else {
        ref.push().set({
          name: todo.name,
          completed: todo.completed
        });
      }
    },
    remove: function(todo) {
      if (todo.id) {
        ref.child(todo.id).remove();
      }
    }
  };

}]);


todoApp.controller('MainCtrl', ['$scope', '$timeout', 'Persistence', function($scope, $timeout, Persistence) {

  $scope.footerHidden = true;

  $scope.count;

  $scope.todo;

  $scope.todoList = [];

  Persistence.getTodo(function(arr) {
    $timeout(function() {
      console.log(arr);
      $scope.todoList = arr;
    }, 0);
  });

  $scope.complete = function(pos) {
    $scope.todoList[pos].completed = !$scope.todoList[pos].completed;
    updateCount($scope.todoList);
    Persistence.add($scope.todoList[pos]);
  }

  $scope.delete = function(pos) {
    Persistence.remove($scope.todoList[pos]);
    $scope.todoList = $scope.todoList.filter(function(todo, index) {
      return index !== pos;
    });
    if ($scope.todoList.length === 0) {
      $scope.footerHidden = true;
    }
    updateCount($scope.todoList);
  }

  $scope.add = function(e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
      var todo = {name: $scope.todo, completed: false};
      $scope.todoList.unshift(todo);
      $scope.todo = '';
      $scope.footerHidden = false;
      updateCount($scope.todoList);
      Persistence.add(todo);
    }
  };

  $scope.clearCompleted = function() {
    $scope.todoList = $scope.todoList.filter(function(obj) {
      return !obj.completed;
    });
  }

  var updateCount = function(list) {
    $scope.count = list.filter(function(obj) {
      return !obj.completed;
    }).length;
    if ($scope.count > 1) {
      $scope.count += ' items left';
    } else {
      $scope.count += ' item left';
    }
  }

}]);
