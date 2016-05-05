var todoApp = angular.module('todoApp', ['firebase']);

todoApp.factory('PersistenceFirebase', ['$firebaseArray', function($firebaseArray) {

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

todoApp.factory('PersistenceLocal', [function() {
  var todoList = [];
  return {
    getTodo: function(callback) {
      todoList = JSON.parse(localStorage.getItem('todoLocal'));
      todoList.map(function(obj, index) {
        obj.id = index;
        return obj;
      });
      callback(todoList);
    },
    add: function(todo) {
      console.log(todo);
      if (typeof todo.id !== 'undefined') {
        console.log(todoList[todo.id]);
        todoList[todo.id] = todo;
      } else {
        todoList.push(todo);
      }
      localStorage.setItem('todoLocal',  JSON.stringify(todoList));
    },
    remove: function(todo) {
      todoList = todoList.filter(function(obj) {
        return obj.id !== todo.id;
      });
      localStorage.setItem('todoLocal',  JSON.stringify(todoList));
    }
  }
}]);

todoApp.factory('PersistenceIndexed', function() {
  window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

  open();

  var defaultError = function(e) {
    console.log(e);
  };

  var datastore;

  function open(callback){
    var version = 2;
    var request = indexedDB.open('todos', version);
    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = defaultError;

      if (db.objectStoreNames.contains('todo')) {
        db.deleteObjectStore('todo');
      }

      var store = db.createObjectStore('todo', {
        keyPath: 'id'
      });
    };

    request.onsuccess = function(e) {
      datastore = e.target.result;
      if (typeof callback !== 'undefined') {
        callback();
      }
    };
    request.onerror = defaultError;
  }

  function getTransaction(callback) {
    var db;
    if (datastore) {
      transObj(datastore);
    } else {
      open(function() {
        transObj(datastore);
      })
    }

    function transObj(db) {
      var transaction = db.transaction(['todo'], 'readwrite');
      callback(transaction);
    }
  }

  return {
    getTodo: function(callback) {
      var todos = [];
      getTransaction(function(transaction) {
        var objStore = transaction.objectStore('todo');
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = objStore.openCursor(keyRange);
        transaction.oncomplete = function(e) {
          callback(todos);

        };
        cursorRequest.onsuccess = function(e) {
          var result = e.target.result;
          if (!!result == false) {
            return;
          }
          todos.push(result.value);
          result.continue();
        }
        cursorRequest.onerror = defaultError;
      });
    },
    add: function(todo) {
      getTransaction(function(transaction) {
        var objStore = transaction.objectStore('todo');
        if (!todo.id) {
          todo.id = new Date().getTime();
          var request = objStore.put(todo);
          request.onsuccess = function(e) {
            console.log('insert - ' + todo.name);
          };
          request.onerror = defaultError;
        }
      });
    },
    remove: function(todo) {
      getTransaction(function(transaction) {
        var objStore = transaction.objectStore('todo');
        var request = objStore.delete(todo.id);

        request.onsuccess = function(e) {
          console.log('remove - ' + todo.id);
        }
        request.onerror = defaultError;
      });

    }
  }
});


todoApp.controller('MainCtrl', ['$scope', '$timeout', 'PersistenceIndexed', function($scope, $timeout, Persistence) {

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
