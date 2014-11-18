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
                    return res.render('notify/notify', {
                        error: '请先选择论坛模块!'
                    });
                }

                async.waterfall([
                    function(callback){
                        forumSvc.getById(fid, function(err, forum){
                            if(!forum) {
                                res.render('notify/notify', {error: '此话题不存在或已被删除。'});
                                return;
                            }
                            callback(err, forum);
                        })
                    },
                    function(forum, callback){
                        forumSvc.getSub(function(error, forums){
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
                            topicSvc.add({}, function(error){

                            });
                            Topic.newAndSave(title, content, req.session.user._id, forum.parent_id, forum._id, function (err, topic) {
                                if (err) {
                                    return next(err);
                                }

                                var proxy = new EventProxy();
                                var render = function () {
                                    res.redirect('/topic/' + topic._id);
                                };

                                proxy.assign('tags_saved', 'score_saved', render);
                                proxy.fail(next);
                                // 话题可以没有标签
                                if (topic_tags.length === 0) {
                                    proxy.emit('tags_saved');
                                }
                                var tags_saved_done = function () {
                                    proxy.emit('tags_saved');
                                };
                                proxy.after('tag_saved', topic_tags.length, tags_saved_done);
                                //save topic tags
                                topic_tags.forEach(function (tag) {
                                    TopicTag.newAndSave(topic._id, tag, proxy.done('tag_saved'));
                                    Tag.getTagById(tag, proxy.done(function (tag) {
                                        tag.topic_count += 1;
                                        tag.save();
                                    }));
                                });
                                User.getUserById(req.session.user._id, proxy.done(function (user) {
                                    user.score += 5;
                                    user.topic_count += 1;
                                    user.save();
                                    req.session.user = user;
                                    proxy.emit('score_saved');
                                }));

                                //发送at消息
                                at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
                            });
                        }
                    ], function(error, forum, forums){
                        if(error) {
                            return next(error);
                        }

                        res.render('topic/edit', {
                            forum : forum,
                            forums : forums
                        });
                    });


















                    ForumModel.findById(ftype_id, function(error, forum){
                        

                        
                    });
                }
            }
        }
    }
}