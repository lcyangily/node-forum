var _ = require('lodash');
var moment = require('moment');
var forumSvc  = loadService('forum');
var topicSvc  = loadService('topic');
var userSvc   = loadService('user');
var newsSvc   = loadService('news');
var News      = new BaseModel('news_topic');
var async     = require('async');
var config    = require('../config');
var fs        = require('fs');
var sanitize  = require('html-css-sanitizer').sanitize;
var validator = require('validator');

function trimxss( str ) {
    return sanitize(validator.trim(str));
}

module.exports = {
    "/create": {
        get: {
            filters : ['checkLogin', 'blocks/hotForums'],
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
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var title = trimxss(req.body.title);
                var content = req.body.content;
                var fid = req.body.fid;
                var ftype_id = req.body.ftype_id;
                var vote = req.body.vote;
                var multiple = req.body.multiple;
                var overt = req.body.overt || 0;
                var visible = req.body.visible || 0;
                var options = req.body.option;
                var maxchoices = req.body.maxchoices || 2;
                var expiration = (req.body.expiration && Number(req.body.expiration)) || 7;

                var edit_error;
                if(title === '') {
                    edit_error = '标题不能是空的。';
                }
                
                if(!validator.isLength(title, 10, 300)) {
                    edit_error = '标题字数太多或太少';
                }

                if(!ftype_id) {
                    edit_error = '请先选择论坛模块';
                }

                if(vote == 1) {
                    if(!options || !options.length || options.length < 2) {
                        edit_error = '投票选项必须是两个以上！';
                    }
                }

                if (edit_error) {
                    return res.send(502, edit_error);
                } else {
                    async.waterfall([
                        function(callback){
                            forumSvc.getById(ftype_id, function(err, forum){
                                if(err || !forum) {
                                    return callback(err || new Error('此话题不存在或已被删除。'));
                                }
                                callback(err, forum);
                            })
                        },
                        function(forum, callback){
                            if(vote == 1) {
                                topicSvc.addVote({
                                    title : title,
                                    content : content,
                                    fid : fid,
                                    ftype_id : ftype_id,
                                    author_id : req.session.user.id,
                                    author_nick : req.session.user.nickname,
                                    vote : vote,
                                    multiple : multiple,
                                    overt : overt,
                                    visible : visible,
                                    options : options,
                                    maxchoices : maxchoices,
                                    expiration : moment(new Date()).add(expiration, 'days').toDate()
                                }, function(error){
                                    callback(error);
                                });
                            } else {
                                topicSvc.add({
                                    title : title,
                                    content : content,
                                    fid : fid,
                                    ftype_id : ftype_id,
                                    author_id : req.session.user.id,
                                    author_nick : req.session.user.nickname
                                }, function(error){
                                    callback(error);
                                });
                            }
                        }
                    ], function(error, forum){
                        if(error) {
                            return next(error);
                        }

                        res.send(200, {
                            code : 1,
                            msg  : '发布成功!'
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
                async.waterfall([
                    function(cb){
                        topicSvc.getFullTopic(tid, function(error, info){
                            res.locals.topic = info.topic;
                            res.locals.author = info.author;
                            res.locals.replys = info.replys;
                            res.locals.replyPage = info.replyPage;
                            res.locals.zaners = info.zaners;
                            res.locals.forum = info.forum;
                            res.locals.ftype = info.ftype;
                            res.locals.ext = info.ext;

                            //投票，判断是展示投票选项还是投票结果
                            if(info.topic.type == 1 && info.ext && info.ext.poll) {
                                info.ext.showResult = false;
                                if(info.ext.poll.expiration.getTime() < new Date().getTime()) {
                                    info.ext.showResult = true;
                                    info.ext.voteEnd = true;
                                    cb(error, info.topic);
                                } else if(req.session.user) {   //用户已经投过票
                                    topicSvc.isVote(info.topic.id, req.session.user.id, function(err, isVote){
                                        if(isVote) {
                                            info.ext.showResult = true;
                                            info.ext.alreadyVote = true;
                                        }
                                        cb(error, info.topic);
                                    });
                                } else {
                                    cb(error, info.topic);
                                }
                            } else {
                                cb(error, info.topic);
                            }
                            //cb(error, info.topic);
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
    },
    '/:tid/vote' : {
        post : {
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var tid = req.params.tid;
                var options = req.body.option;
                topicSvc.vote(tid, req.session.user, options, function(err, poll){
                    if(err) return next(err);
                    return res.send(200, {
                        code : 1,
                        msg : '投票成功！'
                    });
                });
            }
        }
    },
    '/:tid/tonews' : {
        get : {
            filters : ['checkLogin'],
            template : 'topic/tonews',
            controller : function(req, res, next){
                var tid = req.params.tid;
                topicSvc.getById(tid, function(error, topic){
                    res.locals.topic = topic;
                    News.find().where({
                        id : tid
                    }).done(function(err, news){
                        if(err || news) {
                            return res.render('notify/notify_pop', {
                                error : news ? '已经推荐到首页，请勿重复操作！' : err
                            });
                        }
                        next();
                    });
                });
            }
        },
        post : {
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var tid = req.params.tid;
                var title = req.body.title;
                var content = req.body.content;

                var iinfo = req.files.img;
                var origName= iinfo.originalFilename;
                var extName = origName.substring(origName.lastIndexOf('.'));
                var tmpPath = iinfo.path;
                var newName = new Date().getTime() + extName;
                var newPath = config.base_path + '/uploads/' + newName;
                var webPath = '/uploads/' + newName;

                fs.rename(tmpPath, newPath, function(err){
                    if(err) {
                        return res.render('notify/notify_pop', {
                            error : '图片上传失败！:' + err
                        });
                    }
                    newsSvc.add({
                        id : tid,
                        img : webPath,
                        title : null, //title,
                        content : null, //content
                    }, req.session.user, function(err, news){
                        if(err) return res.render('notify/notify_pop', {
                            error : err
                        });

                        return res.render('notify/notify_pop', {
                            success : '操作成功！'
                        });
                    });
                });
            }
        }
    },
    '/:tid/:type' : {
        post : {
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var tid = req.params.tid;
                var type = req.params.type;
                //支持的操作类型
                var all = [ 'top', 'untop', 'hot', 'unhot', 'digest', 
                            'undigest', 'highlight', 'unhighlight', 
                            'closed', 'unclosed', 'delete', 'topall', 'untopall'];

                if(_.contains(all, type) && _.isFunction(topicSvc[type])){
                    topicSvc[type](tid, req.session.user, function(err, ret){
                        if(err) return next(err);
                        return res.send(200, {
                            code : 1,
                            msg : '操作成功！'
                        });
                    });
                }
            }
        }
    }
}