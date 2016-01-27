(function(){
  'use strict'

  var app = angular.module('app', []).config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptor')
  });

  app.constant('API_URL', 'http://localhost:3000')

  app.controller('MainCtrl', function MainCtrl(RandomUserFactory, UserFactory, AuthTokenFactory, AuthInterceptor){
    var vm = this;
    vm.getRandomUser = getRandomUser;
    vm.login = login;
    vm.logout = logout;

    UserFactory.getUser().then(function success (response){
      vm.user = response.data;
    })

    function getRandomUser(){
      RandomUserFactory.getUser().then(function(response){
        vm.randomUser = response.data;
      }, handlerError)
    }
    function login(username, password){
      UserFactory.login(username, password).then(function(response){
        vm.user = response.data.user;
        alert(response.data.token)
      }, handlerError)
    };
    function logout(){
      UserFactory.logout();
      vm.user = null;
    }
    function handlerError(response){
      alert('Error: ' + response.data)
    }
  })
  app.factory('RandomUserFactory', function RandomUserFactory($http, API_URL){
    return {
      getUser : getUser
    }
    function getUser(){
      return $http.get(API_URL + '/random-user')
    }
  })
  app.factory('UserFactory', function UserFactory($http, API_URL, AuthTokenFactory, $q){
    return{
      login : login,
      logout: logout,
      getUser: getUser
    };

    function getUser(){
      if(AuthTokenFactory.getToken()){
        return $http.get(API_URL + '/me')
      }else{
        return $q.reject({data: 'User has no auth token'})
      }
    }

    function login(username, password){
      return $http.post(API_URL + '/login', {
        username: username,
        password: password
      }).then(function success(response){
        AuthTokenFactory.setToken(response.data.token);
        return response;
      })
    }
    function logout(){
      AuthTokenFactory.setToken();

    }
  });
  app.factory('AuthTokenFactory', function AuthTokenFactory($window){
    var store = $window.localStorage;
    var key = 'auth-token';
    return {
      getToken: getToken,
      setToken: setToken
    }
    function getToken(){
      return store.getItem(key);
    };
    function setToken(token){
      if(token){
        store.setItem(key, token)
      }else{
        store.removeItem(key)
      }
    }
  })

  app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory){
    return{
      request: addToken
    }

    function addToken(config){
      var token = AuthTokenFactory.getToken();
      if(token){
        config.headers = config.headers || {};
        config.headers.authorization = 'Bearer ' + token
      }
      return config;
    }
  })
})();
