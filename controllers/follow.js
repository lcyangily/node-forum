var _      = require('lodash');
var userSvc  = loadService('user');
var config   = require('../config');
var md5      = require('MD5');

module.exports = {
    '/add/:uid' : {
        post : {
            controller : function(req, res, next){
                var uid = req.params.uid;
                var note = req.body.note;
                userSvc.follow(req.session.user.id, uid, function(err){

                    if(err) {
                        next('操作失败！');
                    }
                    if(req.xhr) {
                        return res.send(200, {
                            result : 1
                        });
                    } else {
                        next(err || '关注成功!');
                    }
                });
            }
        }
    },
    '/delete/:uid' : {
        post : {
            controller : function(req, res, next){
                var uid = req.params.uid;
                userSvc.unfollow(req.session.user.id, uid, function(err){
                    next(err || '取消关注成功！');
                });
            }
        }
    }
}