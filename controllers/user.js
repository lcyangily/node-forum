var _        = require('lodash');
var async    = require('async');
var fs       = require('fs');
var config   = require('../config');
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
                var uid = req.params.uid;
                if(req.session && req.session.user && req.session.user.id == uid) {
                    res.redirect('/user/' + uid + '/follow');
                } else {
                    next();
                }
            }
        }
    },
    "/:uid/follow": {
        get: { 
            template : 'user/follow',
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
                }, {
                    page : req.query.page
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
    }/*,
    '/home/avatar' : {
        get : {
            template : 'user/home/avatar',
            controller : function(req, res, next){
                res.locals.action = 'avatar';
                next();
            }
        }
    },
    '/home/avatar_dialog' : {
        get : {
            template : 'user/home/avatar_dialog',
            controller : function(req, res, next){
                next();
            }
        },
        post : {
            template : 'notify/notify_pop',
            controller : function(req, res, next){
                var finfo = req.files.avatar;
                var origName= finfo.originalFilename;
                var extName = origName.substring(origName.lastIndexOf('.'));
                var tmpPath = finfo.path;
                var newName = new Date().getTime() + extName;
                var newPath = config.base_path + '/uploads/' + newName;
                var webPath = '/uploads/' + newName;

                fs.rename(tmpPath, newPath, function(err){
                    if(err) {
                        res.locals.error = '上传失败！';
                        next();
                    } else {
                        userSvc.chgAvatar(req.session.user, webPath, function(err){
                            if(err) {
                                res.locals.error = '修改资料失败！' + err;
                            } else {
                                res.locals.success = '修改成功！';
                                userSvc.chgInfoAfterDeal(req.session, req.session.user.id, function(err){
                                    next();
                                });
                            }
                        });
                    }
                });
            }
        }
    },
    '/home/info' : {
        get : {
            template : 'user/home/info',
            controller : function(req, res, next){
                res.locals.action = 'info';
                userSvc.getById(req.session.user.id, function(err, user){
                    res.locals.user = user;
                    next(err);
                });
            }
        },
        post : {
            template : 'user/home/info',
            controller : function(req, res, next){
                res.locals.action = 'info';
                userSvc.chgProfile(req.session.user, {
                    realname: req.body.realname,
                    gender : req.body.gender || 0,
                    telephone : req.body.telephone,
                    mobile : req.body.mobile,
                    signature : req.body.signature,
                    address : req.body.address,
                    qq : req.body.qq,
                    email : req.body.email
                }, function(err){
                    res.redirect('/user/home/info?code='+1);
                });
            }
        }
    },
    '/home/msg' : {
        get : {
            template : 'user/home/msg',
            controller : function(req, res, next){
                res.locals.action = 'msg';
                next();
            }
        }
    },
    '/home/topic' : {
        get : {
            template : 'user/home/topic',
            controller : function(req, res, next){
                res.locals.action = 'topic';
                next();
            }
        }
    },
    '/home/fav' : {
        get : {
            template : 'user/home/fav',
            controller : function(req, res, next){
                res.locals.action = 'fav';
                next();
            }
        }
    },
    '/home/friend' : {
        get : {
            template : 'user/home/friend',
            controller : function(req, res, next){
                res.locals.action = 'friend';
                next();
            }
        }
    },
    '/home/follow' : {
        get : {
            template : 'user/home/follow',
            controller : function(req, res, next){
                res.locals.action = 'follow';
                next();
            }
        }
    },
    '/home/verify' : {
        get : {
            template : 'user/home/verify',
            controller : function(req, res, next){
                res.locals.action = 'verify';
                next();
            }
        }
    }*/
}