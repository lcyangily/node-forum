var _        = require('lodash');
var async    = require('async');
var fs       = require('fs');
var config   = require('../config');
var userSvc  = loadService('user');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');

module.exports = {
    '/avatar' : {
        get : {
            template : 'user/home/avatar',
            controller : function(req, res, next){
                res.locals.action = 'avatar';
                next();
            }
        }
    },
    '/avatar_dialog' : {
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
    '/info' : {
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
                    res.redirect('/home/info?code='+1);
                });
            }
        }
    },
    '/msg' : {
        get : {
            template : 'user/home/msg',
            controller : function(req, res, next){
                res.locals.action = 'msg';
                next();
            }
        }
    },
    '/topic' : {
        get : {
            template : 'user/home/topic',
            controller : function(req, res, next){
                res.locals.action = 'topic';
                async.parallel([
                    function(cb){
                        topicSvc.getListByUid(req.session.user.id, function(err, topics, page){
                            cb(err, {
                                list : topics,
                                page : page
                            });
                        });
                    },
                    function(cb){
                        replySvc.getListByUid(req.session.user.id, function(err, replys, page){
                            cb(err, {
                                list : replys,
                                page : page
                            });
                        });
                    }
                ], function(err, results){
                    res.locals.topic = results && results[0];
                    res.locals.reply = results && results[1];
                    next(err);
                });
            }
        }
    },
    '/topic/tdata' : {
        get : {
            controller : function(req, res, next){
                topicSvc.getListByUid(req.session.user.id, function(err, topics, page){
                    if(err) return next(err);
                    return res.send({
                        page : page,
                        list : topics
                    });
                }, {
                    page : req.query.page
                });
            }
        }
    },
    '/topic/rdata' : {
        get : {
            controller : function(req, res, next){
                replySvc.getListByUid(req.session.user.id, function(err, replys, page){
                    if(err) return next(err);
                    return res.send({
                        page : page,
                        list : replys
                    });
                }, {
                    page : req.query.page
                });
            }
        }
    },
    '/fav' : {
        get : {
            template : 'user/home/fav',
            controller : function(req, res, next){
                res.locals.action = 'fav';
                next();
            }
        }
    },
    '/friend' : {
        get : {
            template : 'user/home/friend',
            controller : function(req, res, next){
                res.locals.action = 'friend';
                next();
            }
        }
    },
    '/follow' : {
        get : {
            template : 'user/home/follow',
            controller : function(req, res, next){
                res.locals.action = 'follow';
                next();
            }
        }
    },
    '/verify' : {
        get : {
            template : 'user/home/verify',
            controller : function(req, res, next){
                res.locals.action = 'verify';
                next();
            }
        }
    }
}