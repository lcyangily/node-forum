var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc  = loadService('user');

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
                console.log('---> name : ' + req.body.loginname);
                userSvc.login({
                    loginname : req.body.loginname,
                    passwd : req.body.passwd
                },function(err, user){

                    if(err) {
                        console.log('------> err : ' + err);
                        return res.render('login/login', {
                            error : err
                        });
                    } else {
                        req.session.user = user;
                        console.log('------> user : ' + user);
                        return res.render('index/index');
                    }
                });

            }
        }
    }
}