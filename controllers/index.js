var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc  = loadService('user');
var config   = require('../config');
var md5      = require('MD5');

module.exports = {
    "/": {
        get: {
            filters : ['blocks/hotForums'],
            template : 'index/index',
            controller : function(req, res, next) {
                console.log('-----> user : ' + req.session.user);
                next();
            }
        }
    },
    '/hy' : {
        get : {
            filters : ['blocks/hotForums'], 
            controller : function(req, res, next){
                next();
            }
        }
    },
    '/block' : {
        get : {
            filters : ['blocks/hotForums'],
            controller : function(req, res, next){
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

                    res.render('forum/block', {
                        groups : groups
                    });
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

                userSvc.register({
                    loginname : uname,
                    signature : passwd
                }, function(err, user){
                    next(err || '注册成功!');                 
                });
            }
        }
    },
    '/login' : {
        get : {
            filters : [],
            template : 'login/login',
            controller : function(req, res, next){
                if(req.session.user) {
                    console.log('用户已登录！');
                }
                next();
            }
        },
        post : {
            filters : [],
            //template : '',
            controller : function(req, res, next){
                userSvc.login({
                    loginname : req.body.loginname,
                    passwd : req.body.passwd
                },function(err, user){

                    if(err) {
                        return res.render('login/login', {
                            error : err
                        });
                    } else {
                        req.session.user = user;
                        console.log('---> weibo token : ' + user.weibo_token);
                        var alToken = user.id + ':' + md5(user.weibo_token); // 以后可能会存储更多信息，用 $$$$ 来分隔
                        res.cookie(config.auth_cookie_name, alToken, {
                            path: '/', 
                            maxAge: 1000 * 60 * 60 * 24 * 30, 
                            //signed: true, 
                            httpOnly: true
                        }); //cookie 有效期30天

                        return res.redirect('/');
                    }
                });

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
    }
}