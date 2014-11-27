var _ = require('lodash');
var forumSvc  = loadService('forum');
var topicSvc  = loadService('topic');
var async     = require('async');
var sanitize  = require('html-css-sanitizer').sanitize;
var validator = require('validator');

function trimxss( str ) {
    return sanitize(validator.trim(str));
}

module.exports = {
    "/create": {
        get: {
            filters : ['blocks/hotForums'],
            controller : function(req, res, next) {
                var fid = req.query.fid;
                if(!fid) {
                    //return res.render('topic/block-select');
                    return selectBlock(req, res, next);
                }

                async.waterfall([
                    function(callback){
                        forumSvc.getById(fid, function(err, forum){
                            if(!forum || !forumSvc.isForum(forum)) {
                                return selectBlock(req, res, next);
                            }
                            callback(err, forum);
                        })
                    },
                    function(forum, callback){
                        forumSvc.getSub(forum.id, function(error, forums){
                            callback(error, forum, forums);
                        });
                    }
                ], function(error, forum, forums){
                    if(error) {
                        return next(error);
                    }

                    res.locals.forum = forum;
                    res.locals.forums = forums;
                    next();
                    /*res.render('topic/edit', {
                        forum : forum,
                        forums : forums
                    });*/
                });
                
                function selectBlock(req, res, next){
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

                        res.render('topic/block-select', {
                            groups : groups
                        });
                    });
                }
            }
        },
        post : {
            filters : [],
            controller : function(req, res, next){
                var title = trimxss(req.body.title);
                var content = req.body.content;
                var fid = req.body.fid;
                var ftype_id = req.body.ftype_id;
                /*var tags = [];
                if (req.body.tags !== '') {
                    tags = req.body.tags.split(',');
                }*/

                var edit_error;
                if(title === '') {
                    edit_error = '标题不能是空的。';
                }
                
                if(validator.isLength(title, 10, 100)) {
                    edit_error = '标题字数太多或太少';
                }

                if(!ftype_id) {
                    return res.render('notify/notify', {
                        error : '请先选择论坛模块'
                    });
                }

                if (edit_error) {
                    /*Tag.getAllTags(function (err, tags) {
                        if (err) {
                            return next(err);
                        }
                        for (var i = 0; i < topic_tags.length; i++) {
                            for (var j = 0; j < tags.length; j++) {
                                if (topic_tags[i] === tags[j]._id) {
                                    tags[j].is_selected = true;
                                }
                            }
                        }
                        res.render('topic/edit', {tags: tags, edit_error: edit_error, title: title, content: content});
                    });*/
                    res.render('topic/create', {
                        edit_error: edit_error, 
                        title: title, 
                        content: content
                    });
                } else {
                    async.waterfall([
                        function(callback){
                            forumSvc.getById(ftype_id, function(err, forum){
                                if(err || !forum) {
                                    return callback(err || new Error('此话题不存在或已被删除。'));
                                    //return res.render('notify/notify', {error: '此话题不存在或已被删除。'});
                                }
                                callback(err, forum);
                            })
                        },
                        function(forum, callback){
                            topicSvc.add({
                                title : title,
                                content : content,
                                fid : fid,
                                ftype_id : ftype_id,
                                author_id : 1,
                                author_nick : 'test'
                            }, function(error){
                                callback(error);
                            });
                        }
                    ], function(error, forum){
                        if(error) {
                            return next(error);
                        }

                        res.render('notify/notify', {
                            success : '发布成功!'
                        });
                    });
                }
            }
        }
    },
    'edit' : {
        get : {
            filters : [],
            controller : function(req, res, next){

            }
        }
    },
    '/:tid' : {
        get : {
            filters : ['blocks/hotForums'],
            template : 'topic/index',
            controller : function(req, res, next){
                var tid = req.params.tid;
                async.waterfall([
                    function(cb){
                        topicSvc.getFullTopic(tid, function(error, topic, author, replys, forum, ftype){
                            res.locals.topic = topic;
                            res.locals.author = author;
                            res.locals.replys = replys;
                            res.locals.forum = forum;
                            res.locals.ftype = ftype;
                            cb(error, topic);
                        });
                    },
                    function(topic, cb){
                        forumSvc.getForumPath(topic.fid, function(err, forumPath){
console.log('--------------> forumPath : ' + forumPath.length);
                            res.locals.forumPath = forumPath;
                            cb(err);
                        });
                    }
                ], function(err){
                    next(err);
                });
            }
        }
    }
}