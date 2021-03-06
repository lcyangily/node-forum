var _      = require('lodash');
var async  = require('async');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc  = loadService('user');
var newsSvc  = loadService('news');
var config   = require('../config');
var md5      = require('MD5');

module.exports = {
    "/": {
        get: {
            filters : ['blocks/hotForums'],
            template : 'index/index',
            controller : function(req, res, next) {
                console.log('-----> user : ' + req.session.user);
                newsSvc.getList(function(err, topics, page){
                    //console.log('-----------> topics : ' + topics);
                    //console.log('-----------> topics.length : ' + topics.length);
                    res.locals.topics = topics;
                    res.locals.page = page;
                    next();
                }, {
                    page : req.query.page
                });
            }
        }
    },
    '/block' : {
        get : {
            filters : ['blocks/hotForums'],
            template : 'forum/block',
            controller : function(req, res, next){
                async.parallel([
                    function(cb){
                        if(req.session.user) {
                            userSvc.getFavForums(req.session.user.id, function(err, favs){
                                res.locals.favs = favs;
                                cb(); //忽略错误
                            });
                        } else {
                            cb();
                        }
                    },
                    function(cb){
                        forumSvc.getAll(function(err, forums){
                            var groups = _.filter(forums, function(f){
                                return f.type == 0;
                            });
                            groups = _.map(groups, function(g, index){
                                //var ga = _.clone(g);
                                g.children = _.filter(forums, function(f){
                                    return g.id === f.parent_id;
                                });
                                return g;
                            });

                            res.locals.groups = groups;
                            cb(err);
                        });
                    }
                ], function(err, results){
                    next(err);
                });
            }
        }
    },
    '/reg' : {
        get : {
            filters : [],
            template : 'login/reg',
            controller : function(req, res, next){
                next();
            }
        },
        post : {
            filters : [],
            template : 'notify/notify',
            controller : function(req, res, next){
                var uname = req.body.loginname;
                var passwd = req.body.passwd;
                var nickname = req.body.nickname;
                var errorMsg;

                if(!uname) {
                    errorMsg = '用户名不能为空！';
                } else if(!passwd){
                    errorMsg = '密码不能为空！';
                }

                if(errorMsg) {
                    return res.render('notify/notify', {
                        error : errorMsg
                    });
                }
                userSvc.register({
                    loginname : uname,
                    password : md5(passwd),
                    nickname : nickname
                }, 0, function(err, user){
                    next(err || '注册成功!');                 
                });
            }
        }
    },
    'islogin' : {
        get : {
            controller : function(req, res, next){
                var ret = {};
                if(req.session && req.session.user) {
                    ret.login = true;
                } else {
                    ret.nologin = true;
                }

                return res.send(200, ret);
            }
        }
    },
    '/login-lcy' : {
        get : {
            template : 'login/login_old',
            controller : function(req, res, next){
                if(req.session.user) {
                    return res.render('notify/notify', {
                        success : '您已登录，请勿重复操作！'
                    })
                }
                next();
            }
        }
    },
    '/login' : {
        get : {
            template : 'login/login',
            controller : function(req, res, next){
                if(req.session.user) {
                    return res.render('notify/notify', {
                        success : '您已登录，请勿重复操作！'
                    })
                }
                next();
            }
        },
        post : {
            filters : [],
            //template : '',
            controller : function(req, res, next){
                var originalUrl = req.body.originalUrl;
                userSvc.login({
                    loginname : req.body.loginname,
                    password : md5(req.body.passwd)
                },function(err, user){

                    if(err) {
                        if(req.xhr) {
                            return res.send(200, {
                                errorMsg : '登录失败！'
                            });
                        } else {
                            return res.render('login/login', {
                                originalUrl : originalUrl,
                                error : err
                            });
                        }
                    } else {
                        //req.session.user = user;
                        userSvc.getMgrForums(user.id, function(err, moderators){
                            req.session.user = user;
                            req.session.mgrForums = moderators;

                            console.log('---> weibo token : ' + user.auth_token);
                            var alToken = user.id + ':' + md5(user.auth_token); // 以后可能会存储更多信息，用 $$$$ 来分隔
                            res.cookie(config.auth_cookie_name, alToken, {
                                path: '/', 
                                maxAge: 1000 * 60 * 60 * 24 * 30, 
                                //signed: true, 
                                httpOnly: true
                            }); //cookie 有效期30天

                            if(req.xhr) {
                                return res.send(200, {
                                    success : true,
                                    user : user
                                });
                            } else {
                                return res.redirect(originalUrl || '/');
                            }
                        });
                    }
                });

            }
        }
    },
    '/loginpop' : {
        get : {
            template : 'login/loginpop',
            controller : function(req, res, next){
                next();
            }
        }
    },
    '/logout' : {
        get : {
            controller : function (req, res, next) {
                //req.session.destroy();
                req.session = null;
                res.clearCookie(config.auth_cookie_name, { path: '/' });
                res.redirect('/');
            }
        }
    },
    '/update-browser' : {
        get : {
            template : 'notify/update-browser',
            controller : function (req, res, next) {
                next();
            }
        }
    }
}