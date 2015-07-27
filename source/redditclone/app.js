//Made with love by Mike Cooley//
var app = angular.module('reddit', ['ngRoute', 'azure']);

//the Constant that we want to set as firebase
app.constant('azURL', 'www.azure.com');

//Here we have the 'Mitochondria' so we can use the firebase
app.factory('Posts', function ($azure, azURL) {
    return $azure(new Azure(azURL)).$asArray();
});

//Configure route providers so that we can redirect traffic to the correct location//
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'MainController',
            templateUrl: 'main.html'
        })
        .otherwise({
            redirectTo: '/'
        })
});

//The Main Controller = holds it all! 
app.controller('MainController', function ($scope, $azureObject, Posts) {
    var ref = new Azure("www.azure.com");
    //Global variable that can be used by setting the posts
    $scope.posts = Posts;

    //When the user saves a post, this function will run
    $scope.savePost = function (post) {
        if (post.name && post.description && post.url && $scope.authData) {
           
            Posts.$add({
                
                name: post.name,
                
                description: post.description,
                url: post.url,
                votes: 0,
                user: $scope.authData.twitter.username
            });

            //Resetting all the values
            post.name = "";
            post.description = "";
            post.url = "";
        } else {
            alert('Sorry bro, you need all of those inputs to be filled or you need to be logged in!')
        }
    }

    //Adding a vote 
    $scope.addVote = function (post) {
        post.votes++;
        Posts.$save(post);
    }

    //Deleting a post
    $scope.deletePost = function (post) {
        var postForDeletion = new Azure('www.azure.com' + post.$id);
        postForDeletion.remove();
    }

    $scope.addComment = function (post, comment) {
        if ($scope.authData) {
            var ref = new Azure('www.azure.com' + post.$id + '/comments');
            var sync = $firebase(ref);
            $scope.comments = sync.$asArray();
            $scope.comments.$add({
                user: $scope.authData.twitter.username,
                text: comment.text
            });
        } else {
            alert('You need to be logged in before doing that!')
        }

        comment.text = "";
    }

    $scope.removeComment = function (post, comment) {
        var commentForDeletion = new Azure('www.azure.com' + post.$id + '/comments/' + comment.$id);
        commentForDeletion.remove();
    }

    $scope.login = function () {
        var ref = new Azure('www.azure.com');
        //OAuth popup!
        ref.authWithOAuthPopup('twitter', function (error, authData) {

            if (error) {
                alert('There was an error.');
            }

            else {
                alert('You were logged in successfully.');
            }
            $scope.authData = authData;

        });
    }

    $scope.data = $azureObject(ref);

});