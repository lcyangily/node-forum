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
                async.parallel([
                    function(cb){
                        forumSvc.getById(fid, function(error, forum){
                            res.locals.forum = forum;
                            cb(error || ((!forum || forum.type !=1 )? '论坛版块不存在或已删除！' : null));
                        });
                    },
                    function(cb){   //版主
                        forumSvc.getMasters(fid, function(error, masters){
                            res.locals.masters = masters;
                            cb();   //忽略错误
                        });
                    },
                    function(cb){ //帖子分类
                        forumSvc.getSub(fid, function(error, forums){
                            res.locals.ftypes = forums;
                            cb(error);
                        });
                    },
                    function(cb){
                        if(ftypeid) {
                            topicSvc.getListByFtypeid(ftypeid, function(err, topics, page){
                                res.locals.topics = topics;
                                res.locals.page = page;
                                cb(err);
                            }, {
                                pageSize : req.query.pageSize,
                                page : req.query.page
                            });
                        } else {
                            topicSvc.getListByFid(fid, function(err, topics, page){
                                res.locals.topics = topics;
                                res.locals.page = page;
                                cb(err);
                            }, {
                                pageSize : req.query.pageSize,
                                page : req.query.page
                            });
                        }
                    }
                ], function(err, results){
                    next(err);
                });
            }
        }
    }
}