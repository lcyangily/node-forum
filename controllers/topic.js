var _ = require('lodash');
var forumSvc  = loadService('forum');
var topicSvc  = loadService('topic');
var userSvc   = loadService('user');
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

                    async.parallel([
                        function(cb){
                            if(req.session.user) {
                                userSvc.getFavForums(req.session.user.id, function(err, favs){
                                    res.locals.favs = favs;
                                    cb(); //忽略错误
                                });
                            } else {
                                cb();
                            }
                        },
                        function(cb){
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

                                res.locals.groups = groups;
                                cb(err);
                            });
                        }
                    ], function(err, results){
                        res.render('topic/block-select');
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
                
                if(!validator.isLength(title, 10, 300)) {
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
                                author_id : req.session.user.id,
                                author_nick : req.session.user.name
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
                var page = req.query.page || 1;
console.log('---------> topic controller page : ' + page);
                async.waterfall([
                    function(cb){
                        topicSvc.getFullTopic(tid, function(error, topic, author, replysInfo, forum, ftype, zans){
                            res.locals.topic = topic;
                            res.locals.author = author;
                            res.locals.replys = replysInfo && replysInfo[0];
                            res.locals.replyPage = replysInfo && replysInfo[1];
                            res.locals.zaners = zans;
console.log('--------> zans : ' + JSON.stringify(zans));
                            res.locals.forum = forum;
                            res.locals.ftype = ftype;
                            cb(error, topic);
                        }, {
                            page : page
                        });
                    },
                    function(topic, cb){
                        forumSvc.getForumPath(topic.fid, function(err, forumPath){
                            res.locals.forumPath = forumPath;
                            cb(err);
                        });
                    }
                ], function(err){
                    next(err);
                });

                //更新访问数量
                topicSvc.increaseVisitCount(tid);
            }
        }
    },
    '/:tid/zan' : {
        post : {
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var tid = req.params.tid;
                topicSvc.zan(tid, req.session.user.id, function(err, zan){
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