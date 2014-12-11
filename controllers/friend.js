var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc  = loadService('user');
var config   = require('../config');
var md5      = require('MD5');

module.exports = {
    '/add/:uid' : {
        post : {
            controller : function(req, res, next){
                var uid = req.params.uid;
                var note = req.body.note;
                userSvc.addFriendRequest(req.session.user.id, uid, note, function(err){
                    next(err || '添加请求发送成功!');
                });
            }
        }
    },
    '/agree/:uid' : {
        post : {
            controller : function(req, res, next){
                var uid = req.params.uid;
                userSvc.agreeFriendRequest(req.session.user.id, uid, function(err){
                    next(err || '已同意!');
                })
            }
        }
    },
    '/delete/:uid' : {
        post : {
            controller : function(req, res, next){
                var uid = req.params.uid;
                userSvc.removeFriend(req.session.user.id, uid, function(err){
                    next(err || '删除好友成功！');
                });
            }
        }
    }
}