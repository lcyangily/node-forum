var _      = require('lodash');
var userSvc  = loadService('user');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');

module.exports = {
    "/:uid": {
        get: { 
            template : 'user/index',
            controller : function(req, res, next) {
                next();
            }
        }
    },
    '/:uid/topic' : {
        get : {
            template : 'user/topic',
            controller : function(req, res, next) {
                next();
            }
        }
    },
    '/:uid/posts' : {
        get : {
            template : 'user/posts',
            controller : function(req, res, next) {
                next();
            }
        }
    },
    '/:uid/friends' : {
        get : {
            template : 'user/friends',
            controller : function(req, res, next) {
                next();
            }
        }
    },
    '/home/info' : {
        get : {
            template : 'user/home/info',
            controller : function(req, res, next){
                next();
            }
        }
    },
    '/home/msg' : {
        get : {
            template : 'user/home/msg',
            controller : function(req, res, next){
                next();
            }
        }
    }
}