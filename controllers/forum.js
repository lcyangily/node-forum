var async  = require('async');
var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');

module.exports = {
    "/": {
        get: {
            filters : ['blocks/hotForums'],
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
                            //console.log('page : ' + page.current + ';page.total : ' + page.total);
                            cb(err);
                        }, {
                            pageSize : req.query.pageSize,
                            page : req.query.page
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
                async.parallel([
                    function(cb){
                        forumSvc.getById(fid, function(error, forum){
                            res.locals.forum = forum;
                            cb(error || (!forum ? '论坛版块不存在或已删除！' : null));
                        });
                    },
                    function(cb){
                        topicSvc.getListByFid(fid, function(err, topics, page){
                            res.locals.topics = topics;
                            res.locals.page = page;
                            //console.log('page : ' + page.current + ';page.total : ' + page.total);
                            cb(err);
                        }, {
                            pageSize : req.query.pageSize,
                            page : req.query.page
                        });
                    }
                ], function(err, results){
                    next(err);
                });
            }
        }
    }
}