var async  = require('async');
var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc = loadService('user');

module.exports = {
    "/": {
        get: {
            filters : ['blocks/hotForums'],
            template : 'forum/index',
            controller : function(req, res, next) {
                async.parallel([
                    function(cb){
                        forumSvc.getStat(function(error, forum){
                            res.locals.forum = forum;
                            cb(error);
                        });
                    },
                    function(cb){
                        topicSvc.getList(function(err, topics, page){
                            res.locals.topics = topics;
                            res.locals.page = page;
                            cb(err);
                        }, {
                            page : req.query.page
                        });
                    },
                    function(cb){
                        userSvc.getLastRegUser(function(err, user){
                            res.locals.lastRegUser = user;
                            cb();//失败忽略
                        });
                    }
                ], function(err, results){
                    next(err);
                });
            }
        }
    },
    '/:fid' : {
        get : {
            filters : ['blocks/hotForums'],
            template : 'forum/index',
            controller : function(req, res, next){
                var fid = req.params.fid;
                var ftypeid = req.query.ftype;
                async.waterfall([
                    function(cb){
                        forumSvc.getById(fid, function(error, forum){
                            res.locals.forum = forum;
                            cb(error || ((!forum || forum.type < 0 )? '论坛版块不存在或已删除！' : null), forum);
                        });
                    },
                    function(forum, cb){   //版主
                        if(forum.type > 0) {
                            forumSvc.getMasters(fid, function(error, masters){
                                res.locals.masters = masters;
                                cb(null, forum);   //忽略错误
                            });
                        } else {
                            cb(null, forum);
                        }
                    },
                    function(forum, cb){ //帖子分类 | 子版块
                        forumSvc.getByParent(fid, function(error, forums){
                            res.locals.ftypes = forums;
                            res.locals.subs = forums;
                            cb(error, forum);
                        });
                    },
                    function(forum, cb){
                        if(forum.type == 1 && ftypeid) {
                            topicSvc.getListByFtypeid(ftypeid, function(err, topics, page){
                                res.locals.topics = topics;
                                res.locals.page = page;
                                cb(err, forum);
                            }, {
                                pageSize : req.query.pageSize,
                                page : req.query.page
                            });
                        } else if(forum.type == 1) {
                            topicSvc.getListByFid(fid, function(err, topics, page){
                                res.locals.topics = topics;
                                res.locals.page = page;
                                cb(err, forum);
                            }, {
                                pageSize : req.query.pageSize,
                                page : req.query.page
                            });
                        } else if(forum.type == 0) {    //分类
                            topicSvc.getListByGid(forum.id, function(err, topics, page){
                                res.locals.topics = topics;
                                res.locals.page = page;
                                cb(err, forum);
                            }, {
                                pageSize : req.query.pageSize,
                                page : req.query.page
                            });
                        } else {
                            cb('论坛版块不存在或已关闭！');
                        }
                    }
                ], function(err, forum){
                    if(!err && forum && forum.type == 0){
                        return res.render('forum/group');
                    }
                    next(err);
                });
            }
        }
    }
}