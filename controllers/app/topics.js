var async  = require('async');
var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc = loadService('user');
var newsSvc  = loadService('news');

module.exports = {
    '/tj' : {
        get : function(req, res, next){
            newsSvc.getList(function(err, topics, page){
                res.locals.topics = topics;
                res.locals.page = page;
                res.json({
                    topics : topics,
                    page : page
                });
            }, {
                page : req.query.page
            });
        }
    },
    'tj_news' : {
        get : function(req, res, next){
            var timetamp = req.query.timetamp;
            newsSvc.getListCommon({
                create_time : {
                    gt : timetamp
                }
            }, null, function(err, topics, page){
                res.locals.topics = topics;
                res.locals.page = page;
                res.json({
                    topics : topics,
                    page : page
                });
            }, {
                page : req.query.page
            });
        }
    },
    "/all": {
        get: function(req, res, next) {
            topicSvc.getList(function(err, topics, page){
                res.json({
                    topics : topics,
                    page : page
                });
            }, {
                page : req.query.page
            });
        }
    },
    '/:fid' : {
        get : {
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