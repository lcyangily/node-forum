var _        = require('lodash');
var async    = require('async');
var fs       = require('fs');
var config   = require('../config');
var userSvc  = loadService('user');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var newsSvc  = loadService('news');
var livingSvc= loadService('living');

module.exports = {
    '/audit' : {
        get : {
            filters : ['checkAdmin'], 
            template : 'user/home/audit',
            controller : function(req, res, next){
                res.locals.action = 'audit';
                async.parallel([
                    function(cb){
                        newsSvc.getAuditRequests(function(err, news, page){
                            cb(err, {
                                list : news,
                                page : page
                            });
                        });
                    },
                    function(cb){
                        livingSvc.getAuditRequests(function(err, living, page){
                            cb(err, {
                                list : living,
                                page : page
                            });
                        });
                    }
                ], function(err, results){
                    res.locals.news = results && results[0];
                    res.locals.living = results && results[1];
                    next(err);
                });
            }
        }
    },
    '/audit/data/:type' : {  //获取分页信息
        get : {
            filters : ['checkAdmin'], 
            controller : function(req, res, next){
                var type = req.params.type;
                if(type == 'living') {
                    livingSvc.getAuditRequests(function(err, living, page){
                        res.send({
                            list : living,
                            page : page
                        });
                    }, {
                        page : req.query.page
                    });
                } else if(type == 'news') {
                    newsSvc.getAuditRequests(function(err, news, page){
                        res.send({
                            list : news,
                            page : page
                        });
                    }, {
                        page : req.query.page
                    });
                } else {
                    return res.send(502, '获取数据失败，请指定获取哪种类型数据');
                }
            }
        }
    },
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
                async.parallel([
                    function(cb){
                        userSvc.getFavForums(req.session.user.id, function(err, favs){
                            cb(err, {
                                list : favs
                            });
                        });
                    },
                    function(cb){
                        userSvc.getFavTopics(req.session.user.id, function(err, favs, page){
                            cb(err, {
                                list : favs,
                                page : page
                            });
                        });
                    }
                ], function(err, results){
                    res.locals.forum = results && results[0];
                    res.locals.topic = results && results[1];
                    next(err);
                });
            }
        }
    },
    '/fav/tdata' : {    //获取分页数据
        get : {
            controller : function(req, res, next){
                userSvc.getFavTopics(req.session.user.id, function(err, favs, page){
                    if(err) return next(err);
                    return res.send({
                        page : page,
                        list : favs
                    });
                }, {
                    page : req.query.page
                });
            }
        }
    },
    '/friend' : {
        get : {
            template : 'user/home/friend',
            controller : function(req, res, next){
                res.locals.action = 'friend';
                async.parallel([
                    function(cb){
                        userSvc.getFriends(req.session.user.id, function(err, friends, page){
                            cb(err, {
                                list : friends,
                                page : page
                            });
                        });
                    },
                    function(cb){
                        userSvc.getReceiveFriendsRequest(req.session.user.id, function(err, friends, page){
                            cb(err, {
                                list : friends,
                                page : page
                            });
                        });
                    },
                    function(cb){
                        userSvc.getSendFriendsRequest(req.session.user.id, function(err, friends, page){
                            cb(err, {
                                list : friends,
                                page : page
                            });
                        });
                    }
                ], function(err, results){
                    res.locals.friend = results && results[0];
                    res.locals.receive = results && results[1];
                    res.locals.send = results && results[2];
                    next(err);
                });
            }
        }
    },
    '/friend/data/:type' : {    //获取分页数据
        get : {
            controller : function(req, res, next){
                var type = req.params.type;
                if(type == 'friend') {
                    userSvc.getFriends(req.session.user.id, function(err, friends, page){
                        if(err) return next(err);
                        return res.send({
                            page : page,
                            list : friends
                        });
                    }, {
                        page : req.query.page
                    });
                } else if(type == 'receive'){
                    userSvc.getReceiveFriendsRequest(req.session.user.id, function(err, friends, page){
                        if(err) return next(err);
                        return res.send({
                            page : page,
                            list : friends
                        });
                    }, {
                        page : req.query.page
                    });
                } else if(type == 'send'){
                    userSvc.getSendFriendsRequest(req.session.user.id, function(err, friends, page){
                        if(err) return next(err);
                        return res.send({
                            page : page,
                            list : friends
                        });
                    }, {
                        page : req.query.page
                    });
                } else {
                    return res.send(502, '获取数据失败，请指定获取哪种类型数据');
                }
            }
        }
    },
    '/follow' : {
        get : {
            template : 'user/home/follow',
            controller : function(req, res, next){
                res.locals.action = 'follow';
                async.parallel([
                    function(cb){
                        userSvc.getFollowers(req.session.user.id, function(err, follows, page){
                            cb(err, {
                                list : follows,
                                page : page
                            });
                        });
                    },
                    function(cb){
                        userSvc.getFollowersMe(req.session.user.id, function(err, fans, page){
                            cb(err, {
                                list : fans,
                                page : page
                            });
                        });
                    }
                ], function(err, results){
                    res.locals.follow = results && results[0];
                    res.locals.fans = results && results[1];
                    next(err);
                });
            }
        }
    },
    '/follow/data/:type' : {    //获取分页数据
        get : {
            controller : function(req, res, next){
                var type = req.params.type;
                if(type == 'follow') {
                    userSvc.getFollowers(req.session.user.id, function(err, follows, page){
                        if(err) return next(err);
                        return res.send({
                            page : page,
                            list : follows
                        });
                    }, {
                        page : req.query.page
                    });
                } else if(type == 'fans'){
                    userSvc.getFollowersMe(req.session.user.id, function(err, fans, page){
                        if(err) return next(err);
                        return res.send({
                            page : page,
                            list : fans
                        });
                    }, {
                        page : req.query.page
                    });
                } else {
                    return res.send(502, '获取数据失败，请指定获取哪种类型数据');
                }
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