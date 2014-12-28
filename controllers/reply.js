var _ = require('lodash');
var forumSvc  = loadService('forum');
var topicSvc  = loadService('topic');
var replySvc = loadService('reply');
var async     = require('async');
var sanitize  = require('html-css-sanitizer').sanitize;
var validator = require('validator');

function trimxss( str ) {
    return sanitize(validator.trim(str));
}

module.exports = {
    "/add/:tid": {
        post: {
            //filters : ['blocks/hotForums'],
            controller : function(req, res, next) {
                var tid = req.params.tid;
                var cnt = req.body.content;
                var user = req.session.user;

                if(!tid) {
                    return next('回复主题不存在！');
                }
                if(!cnt) {
                    return next('内容不能为空！');
                }
                if(!user) {
                    return next('请先登录！');
                }

                replySvc.add({
                    tid : tid,
                    content : cnt,
                    author_id : user.id,
                    author_nick : user.name,
                    author_pic : user.head_pic
                },function(err, reply){
                    return res.render('notify/notify', {
                        success : '回复成功！'
                    });
                });
            }
        }
    },
    '/:rid/zan' : {
        post : {
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var rid = req.params.rid;
                replySvc.zan(rid, req.session.user.id, function(err, zan){
                    if(err) {
                        return next(err);
                    }
                    return res.send(200, {
                        code : 1,
                        msg : '点赞成功！'
                    });
                });
            }
        }
    }
}