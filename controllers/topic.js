var _ = require('lodash');
var moment = require('moment');
var cheerio = require('cheerio');
var forumSvc  = loadService('forum');
var topicSvc  = loadService('topic');
var userSvc   = loadService('user');
var newsSvc   = loadService('news');
var uploadSvc = loadService('upload');
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
            filters : ['checkLogin', 'limitInterval'],
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
                
                if(!validator.isLength(title, 5, 300)) {
                    edit_error = '标题字数太多或太少';
                }

                /*if(!ftype_id) {
                    edit_error = '请先选择论坛模块';
                }*/

                if(vote == 1) {
                    if(!options || !options.length || options.length < 2) {
                        edit_error = '投票选项必须是两个以上！';
                    }
                }

                if (edit_error) {
                    return res.send(502, edit_error);
                } else {
                    async.waterfall([
                        //forum
                        function(callback){
                            forumSvc.getById(fid, function(err, forum){
                                if(err || !forum) {
                                    return callback(err || new Error('此话题不存在或已被删除。'));
                                }

                                if(forum.status != 1){
                                    return callback('板块已被删除！');
                                }

                                callback(err, forum);
                            })
                        },
                        //forum_type
                        function(forum, callback){
                            if(ftype_id && ftype_id > 0){
                                forumSvc.getById(ftype_id, function(err, forumType){
                                    if(err || !forumType) {
                                        return callback(err || new Error('此话题不存在或已被删除。'));
                                    }
                                    callback(err, ftype_id);
                                })
                            } else {
                                callback(null, -1);
                            }
                        },
                        function(ftype_id, callback){
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
                                }, function(error, topic){
                                    callback(error, topic);
                                });
                            } else {
                                topicSvc.add({
                                    title : title,
                                    content : content,
                                    fid : fid,
                                    ftype_id : ftype_id,
                                    author_id : req.session.user.id,
                                    author_nick : req.session.user.nickname
                                }, function(error, topic){
                                    callback(error, topic);
                                });
                            }
                        }
                    ], function(error, topic){
                        if(error) {
                            return next(error);
                        }

                        res.send(200, {
                            code : 1,
                            msg  : '发布成功!',
                            tid : topic.id
                        });
                    });
                }
            }
        }
    },
    '/:tid/edit' : {
        get : {
            filters : ['checkLogin', 'blocks/hotForums'],
            template : 'topic/create',
            controller : function(req, res, next){
                var tid = req.params.tid;
                res.locals.action = 'edit';
                res.locals.edit_error = '注意：修改话题暂只能修改主题、内容和分类。如需修改投票等信息请重新发帖。';
                async.waterfall([
                    function(cb){
                        topicSvc.getById(tid, function(error, topic){
                            if(error) return cb(error);
                            if(!topic) return cb('帖子不存在！');
                            if(topic.status != 0) return cb('帖子已被删除');
                            //res.locals.forum = info.forum;
                            //res.locals.ftype = info.ftype;

                            cb(error, topic);
                        });
                    },
                    //forum
                    function(topic, cb){
                        forumSvc.getById(topic.fid, function(err, forum){
                            cb(err, topic, forum);
                        })
                    },
                    //forum_type
                    function(topic, forum, cb){
                        forumSvc.getSub(forum.id, function(error, forums){
                            cb(error, topic, forum, forums);
                        });
                    }
                ], function(err, topic, forum, forums){
                    res.locals.topic = topic;
                    res.locals.forum = forum;
                    res.locals.forums = forums;
                    next(err);
                });
            }
        },
        post : {
            filters : ['checkLogin', 'limitInterval'],
            controller : function(req, res, next){
                var tid = req.params.tid;
                var title = trimxss(req.body.title);
                var content = req.body.content;
                var fid = req.body.fid;
                var ftype_id = req.body.ftype_id;

                var edit_error;
                if(title === '') {
                    edit_error = '标题不能是空的。';
                }
                
                if(!validator.isLength(title, 5, 300)) {
                    edit_error = '标题字数太多或太少';
                }

                if (edit_error) {
                    return res.send(502, edit_error);
                }

                async.waterfall([
                    //forum
                    function(callback){
                        forumSvc.getById(fid, function(err, forum){
                            if(err || !forum) {
                                return callback(err || new Error('此话题不存在或已被删除。'));
                            }

                            if(forum.status != 1){
                                return callback('板块已被删除！');
                            }

                            callback(err, forum);
                        })
                    },
                    //forum_type
                    function(forum, callback){
                        if(ftype_id && ftype_id > 0){
                            forumSvc.getById(ftype_id, function(err, forumType){
                                if(err || !forumType) {
                                    return callback(err || new Error('此话题不存在或已被删除。'));
                                }
                                callback(err, ftype_id);
                            })
                        } else {
                            callback(null, -1);
                        }
                    },
                    function(ftype_id, callback){
                        topicSvc.update({
                            id : tid,
                            title : title,
                            content : content,
                            fid : fid,
                            ftype_id : ftype_id
                        }, req.session.user, function(error, topic){
                            callback(error, topic);
                        });
                    }
                ], function(error){
                    if(error) {
                        return next(error);
                    }

                    res.send(200, {
                        code : 1,
                        msg  : '修改成功!',
                        tid : tid
                    });
                });
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
                            if(error) return cb(error);
                            if(!info || !info.topic) return cb('帖子不存在！');
                            if(info.topic.status != 0) return cb('帖子已被删除');

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

                        //获取图片供选择
                        if(topic.content) {
                            var $ = cheerio.load(topic.content);
                            var images = [];
                            $('img').each(function(){
                                var $t = $(this);
                                var src = $t.attr('src') || $t.attr('data-src');
                                images.push(src);
                            });
                        }

                        res.locals.images = images;
                        next();
                    });
                });
            }
        },
        post : {
            filters : ['checkLogin'],
            template : 'notify/notify_pop',
            controller : function(req, res, next){
                var tid = req.params.tid;
                var title = req.body.title;
                var content = req.body.content;
                var picUrl = req.body.picUrl;
                var iinfo = req.files.img;

                if(!content) {
                    return next('内容不能为空！');
                }

                async.waterfall([
                    function(cb){
                        if(iinfo && iinfo.originalFilename && iinfo.size > 0) {
                            uploadSvc.up2qn(iinfo, {prefix : 'index/news/'}, function(err, url, data){
                                cb(err ? ('图片上传失败！:' + err) : null, url);
                            });
                        } else {
                            cb(null, picUrl);
                        }
                    },
                    function(picUrl, cb){
                        // if(iinfo && iinfo.path) fs.unlink(iinfo.path);
                        newsSvc.add({
                            id : tid,
                            img : picUrl,
                            title : title || null, //title,
                            content : content, //content
                        }, req.session.user, function(err, news){
                            cb(err);
                        });
                    }
                ], function(err){
                    if(err){
                        res.locals.error = err;
                    } else {
                        res.locals.success = '操作成功！';
                    }
                    next();
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