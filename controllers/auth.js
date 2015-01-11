var _      = require('lodash');
var async  = require('async');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc  = loadService('user');
var newsSvc  = loadService('news');
var config   = require('../config');
var md5      = require('MD5');
var Sina     = require('../common/auth/Sina');

module.exports = {
    '/': {
        get: {
            template : 'login/logintype',
            controller : function(req, res, next) {
                if(req.session.user) {
                    return res.render('notify/notify_pop', {
                        error : '您已经登录'
                    });
                }
                next();
            }
        }
    },
    '/:type' : {
        get : {
            controller : function(req, res, next) {
                var type = req.params.type;
                if(type == 'weibo') {
                    var sina = new Sina()
                    return res.redirect(sina.getAuthUrl());
                }
            }
        }
    },
    '/cb/weibo' : {   //新浪微博登录回调
        get : {
            afterFilters : ['dealAfterLogin'],
            controller : function(req, res, next){
                var code = req.query.code;
                if(!code) return next(getErrorStr('回调参数错误！'));
                userSvc.sinaAuthCallback(code, function(error, user){
                    if(error || !user) return next(getErrorStr(error ? error : '用户不存在！'));
                    //注册/登录成功 进行写cookie 和 session 操作
                    res.locals.auth_success_user = user;
                    next();
                });

                function getErrorStr(msg){
                    var sina = new Sina();
                    return '绑定错误: '+msg+'，请<a href='+ sina.getAuthUrl() +'>重新绑定</a>';
                }
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