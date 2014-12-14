var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc  = loadService('user');
var config   = require('../config');
var md5      = require('MD5');

module.exports = {
    '/forum/add/:id' : {
        post : {
            controller : function(req, res, next){
                var id = req.params.id;
                userSvc.addFav(req.session.user.id, id, 1, function(err){
                    if(err) {
                        return next(err.msg || '收藏失败！');
                    }
                    return res.send(200, {
                        code : 1,
                        msg : '收藏成功！'
                    });
                });
            }
        }
    },
    '/topic/add/:id' : {
        post : {
            controller : function(req, res, next){
                var id = req.params.id;
                userSvc.addFav(req.session.user.id, id, 2, function(err){
                    if(err) {
                        return next(err.msg || '收藏失败！');
                    }
                    return res.send(200, {
                        code : 1,
                        msg : '收藏成功！'
                    });
                });
            }
        }
    },
    '/delete/:id' : {
        post : {
            controller : function(req, res, next){
                var id = req.params.id;
                var type = req.query.type;
                userSvc.removeFav(req.session.user.id, id, type, function(err){
                    next(err || '删除好友成功！');
                });
            }
        }
    }
}