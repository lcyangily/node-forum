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
            filter : [],
            template : 'login/reg',
            controller : function(req, res, next){
                next();
            }
        },
        post : {
            filter : [],
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
    }
}