var _      = require('lodash');
var async    = require('async');
var userSvc  = loadService('user');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');

module.exports = {
    "/:uid": {
        get: { 
            template : 'user/index',
            filters : ['getUserInHome'],
            controller : function(req, res, next) {
                next();
            }
        }
    },
    '/:uid/topic' : {
        get : {
            template : 'user/topic',
            filters : ['getUserInHome'],
            controller : function(req, res, next) {
                var uid = req.params.uid;
                var page = req.query.page;
                topicSvc.getListByUid(uid, function(err, topics, page){
                    res.locals.topics = topics;
                    res.locals.pageinfo = page;
                    next(err);
                }, {
                    page : page
                });
            }
        }
    },
    '/:uid/posts' : {
        get : {
            template : 'user/posts',
            filters : ['getUserInHome'],
            controller : function(req, res, next) {
                var uid = req.params.uid;
                replySvc.getListByUid(uid, function(err, replys, page){
                    res.locals.replys = replys;
                    res.locals.pageinfo = page;
                    next(err);
                });
            }
        }
    },
    '/:uid/friends' : {
        get : {
            template : 'user/friends',
            filters : ['getUserInHome'],
            controller : function(req, res, next) {
                var uid = req.params.uid;
                userSvc.getFriends(uid, function(err, friends){
                    res.locals.friends = friends;
                    next(err);
                });
            }
        }
    },
    '/collect' : {  //收藏
        
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