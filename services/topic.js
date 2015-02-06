var _ = require('lodash');
var async  = require('async');
var Topic  = new BaseModel('forum_topic');
var User   = new BaseModel('users');
var Reply  = new BaseModel('forum_reply');
var Forum  = new BaseModel('forum');
var TopicPoll = new BaseModel('topic_poll');
var TopicPolloption = new BaseModel('topic_polloption');
var TopicPollvoter = new BaseModel('topic_pollvoter');
var UserCount    = new BaseModel('user_count');
var TopicZanLogs = new BaseModel('topic_zan_logs');
var UserFollow   = new BaseModel('user_follow');
var UserFollowFeed = new BaseModel('user_follow_feed');
var replySvc = loadService('reply');
var forumSvc = loadService('forum');
var userSvc  = loadService('user');

// mergeInto = { a: 1}
// toMerge = {a : undefined, b:undefined}
// lodash.extend({}, mergeInto, toMerge) // => {a: undefined, b:undefined}
// lodash.merge({}, mergeInto, toMerge)  // => {a: 1, b:undefined}
var getPageWithDef = function(p){
    return _.merge({page : 1, pageSize : 20}, p);
}

exports.getById = function (id, cb) {
    async.waterfall([
        //得到帖子内容
        function(callback){
            Topic.findById(id).done(function(error, topic) {
                //console.log('topic ... ');
                callback(error, topic);
            });
        },
        //得到帖子其他信息：用户信息、回复信息
        function(topic, callback){
            if(!topic) callback('主题不存在');

            async.parallel([
                function(callback){
                    userSvc.getById(topic.author_id, callback);
                },
                function(callback){
                    if (topic.last_reply) {
                        Reply.findById(topic.last_reply).done(callback);
                    } else {
                        callback();
                    }
                }
            ], function(err, results){
                //console.log('----------topic callback ... ');
                callback(err, topic, results && results[0], results && results[1]);
            });
        }
    ], function(err, topic, author, last_reply){
        //console.log('----------topic hello callback ... ');
        cb && cb(err, topic, author, last_reply);
    });
};

/**
 * 获取所有信息的主题
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - topic, 主题
 * - author, 主题作者
 * - replies, 主题的回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullTopic = function (id, cb, replyPage) {
    self = this;
    async.waterfall([
        //得到帖子内容
        function(callback){
            Topic.findById(id).done(function(error, topic) {
                callback(error, topic);
            });
        },
        //得到帖子其他信息：用户信息、回复信息
        function(topic, callback){
            if(!topic) return callback('内容不存在');

            async.parallel([
                function(callback){
                    userSvc.getById(topic.author_id, callback);
                },
                function(callback){
                    replySvc.getListByTopicId(id, callback, replyPage);
                },
                function(callback){
                    forumSvc.getById(topic.fid, callback);
                },
                function(callback){
                    forumSvc.getById(topic.ftype_id, callback);
                },
                function(callback) {
                    self.getTopicZaners(id, callback);
                }
            ], function(err, results){
                callback(err, topic, results && results[0], results && results[1],
                         results && results[2], results && results[3], results && results[4]);
            });
        },
        //获取扩展信息:如类型投票，获取投票信息
        function(topic, author, reply, forum, ftype, zaners, callback){
            if(topic.type == 1) {
                TopicPoll.find().where({
                    tid : topic.id
                }).done(function(err, poll){
                    if(err || !poll) return callback(!poll ? '投票信息不存在！' : err);

                    TopicPolloption.findAll().where({
                        tid : topic.id
                    }).done(function(err, options){
                        callback(err, topic, author, reply, forum, ftype, zaners, {
                            poll : poll,
                            options : options
                        });
                    });
                });
            } else {
                callback(null, topic, author, reply, forum, ftype, zaners);
            }
        }
    ], function(err, topic, author, reply, forum, ftype, zaners, ext){
        cb && cb(err, {
            topic : topic,
            author : author,
            replys : reply && reply[0],
            replyPage : reply && reply[1],
            forum : forum,
            ftype : ftype,
            zaners : zaners,
            ext : ext
        });
    });
};

//面向公众的通用查询
exports.getListCommon = function(where, order, cb, page){
    //var p = _.extend({page : 1, pageSize : 20}, page);
    var p = getPageWithDef(page);
    //var o = _.extend({create_time : 'desc'}, order);
    var o = order || {last_reply_time : 'desc'};
    var w = _.extend({
        status : 0, //0-正常
        'forum.status' : {
            ne : 0  //0-删除
        },
        'forum.forum.status' : {
            ne : 0
        }
    }, where);
    //指定fields 去掉conent 速度更快
    Topic.findAll()
        .fields([
            'id',
            'title',
            'fid',
            'ftype_id',
            'author_id',
            'type',
            'closed',
            'status',
            'status_chg_uid',
            'status_chg_time',
            'highlight',
            'digest',
            'top_all',
            'top',
            'is_hot',
            'reply_count',
            'visit_count',
            'collect_count',
            'zan_count',
            'create_time',
            'update_time',
            'last_reply',
            'last_reply_user_id',
            'last_reply_time'
        ])
        .include([
            User.Model, 
            {model : Forum.Model, include : [Forum.Model]}, 
            {model : User.Model, as : 'reply_author'},
            {model : Forum.Model, as : 'forum_type'}
        ]).where(w).order(o).page(p).done(cb);
}

//论坛首页列表
exports.getList = function(cb, page){
    this.getListCommon({
        'forum.forum.status' : 1,
        'forum.status' : 1
    }, [
        ['top_all', 'desc'],
        ['create_time', 'DESC']
    ], cb, page);
}

//分版列表
exports.getListByFid = function(fid, cb, page){
    this.getListCommon({
        fid : fid
    }, [
        ['top_all', 'desc'],
        ['top', 'desc'],
        ['create_time', 'DESC']
    ], cb, page);
}

exports.getListByFtypeid = function(ftypeid, cb, page){
    this.getListCommon({
        ftype_id : ftypeid
    }, null, cb, page);
}

exports.getListByUid = function(uid, cb, page){
    this.getListCommon({
        author_id : uid
    }, null, cb, page);
}

exports.getListByGid = function(gid, cb, page){
    this.getListCommon({
        'forum.parent_id' : gid
    }, null, cb, page);
}

//查询当前主题点赞人列表
exports.getTopicZaners = function(tid, cb){
    TopicZanLogs.findAll().include([
        User.Model
    ]).where({
        tid : tid
    }).done(cb);
}

//对主题点赞
exports.zan = function(tid, uid, cb){
    async.waterfall([
        function(callback){
            TopicZanLogs.find().where({
                tid : tid,
                uid : uid
            }).done(function(err, zlog){
                callback(zlog ?  '您已赞过，不能重复赞。' : null);
            });
        },
        function(callback){
            Topic.find().where({
                id : tid
            }).done(function(err, topic){
                callback(!topic ? '帖子不存在或被删除！' : err, topic);
            });
        },
        function(topic, callback) {
            TopicZanLogs.add({
                tid : tid,
                uid : uid
            }).done(function(err, zlog){
                callback(err);

                //更新数量
                try{
                    Topic.clean().update({
                        zan_count : 1 + topic.zan_count || 0
                    }).where({
                        id : tid
                    }).done(function(err, t){
                        if(err) console.error(err);
                    });
                } catch(e) {
                    console.error(e);
                }
            });
        }
    ], function(err){
        return cb && cb(err);
    });
}

//增加访问数
exports.increaseVisitCount = function(tid, cb){

    Topic.find().where({
        id : tid
    }).done(function(err, topic){
        if(err) return callback(!topic ? '帖子不存在或被删除！' : err);

        Topic.clean().update({
            visit_count : 1 + topic.visit_count || 0
        }).where({
            id : tid
        }).done(function(err, t){
            cb && cb(err, t);
        });
    });
}

/** 增加主题数量 **/
exports.increaseCount = function(topic, callback){

    async.parallel([
        //user count
        function(cb){
            UserCount.find().where({
                uid : topic.author_id
            }).done(function(err, uc){
                if(err || !uc){
                    return cb(err || '帖子作者不存在！');
                }
                UserCount.clean().update({
                    topics : uc.topics + 1
                }).where({
                    uid : topic.author_id
                }).done(cb);
            });
        },
        //forum count
        function(cb){
            Forum.find().where({
                id : topic.fid
            }).done(function(err, forum){
                if(err || !forum) {
                    cb(err || '论坛版块不存在！');
                    return;
                }
                Forum.update({
                    topics : forum.topics + 1
                }).where({
                    id : topic.fid
                }).done(cb);
            });
        },
        //forum_type count
        function(cb){
            Forum.find().where({
                id : topic.ftype_id
            }).done(function(err, forum){
                if(err || !forum) {
                    cb(err || '论坛版块分类不存在！');
                    return;
                }
                Forum.update({
                    topics : forum.topics + 1
                }).where({
                    id : topic.ftype_id
                }).done(cb);
            });
        },
        //total count
        function(cb){
            forumSvc.getStat(function(err, stat){
                if(err || !stat) {
                    //cb(err || '统计不存在！');
                    return cb();
                }
                Forum.update({
                    topics : stat.topics + 1
                }).where({
                    id : stat.id
                }).done(function(err, forum){
                    cb(err);
                });
            });
        }
    ], function(err, results){
        callback && callback(err);
    });
}

exports.addFollowFeed = function(topic, cb){
    if(topic && topic.author_id){
        UserFollow.find().where({
            follow_uid : topic.author_id
        }).done(function(err, userFollow){
            if(err || !userFollow) return cb && cb(err || '没有被关注');
            UserFollowFeed.add({
                uid : topic.author_id,
                username : topic.author_nick,
                tid : topic.id
            }).done(function(err, feed){
                cb && cb(err, feed);
            });
        });
    } else {
        cb && cb();
    }
}

/** 减少主题数量 **/
exports.reduceCount = function(topic, cb){
    //forum
    //forum_type
    //total
    //user
}

//发布帖子
exports.add = function (kv, callback) {
    var self = this;
    Topic.add(kv).done(function(err, topic){
        callback && callback(err, topic);
        try{
            self.increaseCount(topic);
            self.addFollowFeed(topic);
        } catch(e) {
            console.error(e);
        }
    });
};

//发布投票帖子
exports.addVote = function(kv, callback){
    kv.type = 1;
    this.add(kv, function(err, topic){
        if(err) return callback && callback(err, topic);
        TopicPoll.add(_.extend({tid : topic.id}, kv)).done(function(err, poll){
            if(err) return callback && callback(err, topic);
            var options = [];
            for(var i = 0; i < kv.options.length; i++) {
                options.push({
                    tid : topic.id,
                    voters : 0,
                    option : kv.options[i]
                });
            }

            TopicPolloption.addBat(options).done(function(err){
                callback && callback(err, topic, poll);
            });
        });
    });
}

exports.update = function(t, user, callback){
    var self = this;
    var tt = {};
    var tid = t.id;
    tt.title = t.title;
    tt.content = t.content;
    tt.fid = t.fid;
    tt.ftype_id = t.ftype_id;
    tt.update_time = new Date();

    async.waterfall([
        function(cb){
            Topic.findById(tid).done(function(error, topic) {
                cb(error, topic);
            });
        },
        function(topic, cb) {   //权限判断
            self._permission(topic, user, {
                admin : true,
                author : true,
                master : true
            }, function(ret){
                if(ret){
                    cb(null, topic);
                } else {
                    cb('您无操作权限！');
                }
            });
        },
        function(topic, cb){
            Topic.clean().update(tt).where({
                id : tid
            }).done(function(err, num, datas){
                cb(err, datas && datas[0]);
            });
        }
    ], callback);
}

//判断是否已经投过票
exports.isVote = function(tid, uid, callback) {
    TopicPollvoter.find().where({
        tid : tid,
        uid : uid
    }).done(function(err, voter){
        callback && callback(err, !!voter);
    });
}

//投票
exports.vote = function(tid, user, poids, callback){

    if(!_.isArray(poids)) {
        poids = [poids];
    }
    TopicPolloption.findAll().where({
        tid : tid,
        poid : {
            in : poids
        }
    }).done(function(err, options){
        if(err) {
            return callback && callback(err);
        }
        if(poids.length != options.length) {
            return callback && callback('投票选项不存在或投票已经被修改，请刷新页面！');
        }

        callback && callback(err);

        TopicPollvoter.add({
            tid : tid,
            uid : user.id,
            username : user.nickname,
            options : poids.join(',')
        }).done(function(err, pvoter){
            TopicPolloption.findAll().where({
                poid : {
                    in : poids
                }
            }).done(function(err, polloptions){
                //if(err) return callback && callback('更新投票人数失败！');
                if(err) console.error(err);
                var i = 0;
                var len = polloptions && polloptions.length;
                while(i < len) {
                    TopicPolloption.clean().update({
                        voters : 1 + polloptions[i].voters || 0
                    }).where({
                        poid : polloptions[i].poid
                    }).done(function(err, p){

                    });
                    i++;
                }
            });

            TopicPoll.find().where({
                tid : tid
            }).done(function(err, poll){
                TopicPoll.clean().update({
                    voters : 1 + poll.voters || 0
                }).where({
                    tid : tid
                }).done(function(err, p){

                });
            });
        });
    });
}

exports.chgState = function(tid, user, key, value, prop, limit, callback){
    var self = this;
    async.waterfall([
        function(cb){
            Topic.findById(tid).done(function(error, topic) {
                cb(error, topic);
            });
        },
        function(topic, cb) {   //权限判断

            // if(limit.admin && user.is_admin == 1) {    //管理员
            //     cb(null, topic);
            // } else if(limit.author && user.id == topic.author_id) { //作者
            //     cb(null, topic);
            // } else if(limit.master) {    //版主
            //     forumSvc.getMasters(topic.fid, function(err, masters){
            //         if(masters && masters.length) {
            //             for(var i = 0; i < masters.length; i++) {
            //                 if(masters[i].uid == user.id) {
            //                     return cb(null, topic);
            //                 }
            //             }
            //         }
            //         cb('您无操作权限！');
            //     });
            // } else {
            //     cb(null, topic);
            // }
            self._permission(topic, user, limit, function(ret){
                if(ret){
                    cb(null, topic);
                } else {
                    cb('您无操作权限！');
                }
            });
        },
        function(topic, cb){

            if(topic[key] == value){
                return cb('已经更改，请勿重复操作！');
            } else {
                var kv = prop || {};
                kv[key] = value;
                Topic.clean().update(kv).where({
                    id : tid
                }).done(cb);
            }
        }
    ], callback);
}

exports.top = function(tid, user, callback){
    this.chgState(tid, user, 'top', 1, null, {
        admin : true,
        master : true
    }, callback);
}

exports.untop = function(tid, user, callback){
    this.chgState(tid, user, 'top', 0, null, {
        admin : true,
        master : true
    }, callback);
}

exports.topall = function(tid, user, callback){
    this.chgState(tid, user, 'top_all', 1, null, {
        admin : true
    }, callback);
}

exports.untopall = function(tid, user, callback){
    this.chgState(tid, user, 'top_all', 0, null, {
        admin : true
    }, callback);
}

exports.hot = function(tid, user, callback){
    this.chgState(tid, user, 'is_hot', 1, null, {
        admin : true,
        master : true
    }, callback);
}

exports.unhot = function(tid, user, callback){
    this.chgState(tid, user, 'is_hot', 0, null, {
        admin : true,
        master : true
    }, callback);
}

exports.digest = function(tid, user, callback){
    this.chgState(tid, user, 'digest', 1, null, {
        admin : true,
        master : true
    }, callback);
}

exports.undigest = function(tid, user, callback){
    this.chgState(tid, user, 'digest', 0, null, {
        admin : true,
        master : true
    }, callback);
}

exports.highlight = function(tid, user, callback){
    this.chgState(tid, user, 'highlight', 1, null, {
        admin : true,
        master : true
    }, callback);
}

exports.unhighlight = function(tid, user, callback){
    this.chgState(tid, user, 'highlight', 0, null, {
        admin : true,
        master : true
    }, callback);
}

exports.closed = function(tid, user, callback){

    this.chgState(tid, user, 'closed', 1, null, {
        admin : true,
        master : true,
        author : true
    }, callback);
}

exports.unclosed = function(tid, user, callback){
    //this.chgState(tid, user, 'unclosed', callback);
    this.chgState(tid, user, 'closed', 0, null, {
        admin : true,
        master : true,
        author : true
    }, callback);
}

exports.delete = function(tid, user, callback){
    this.chgState(tid, user, 'status', user.is_admin == 1 ? 2 : 1, {
        status_chg_uid : user.id,
        status_chg_time : new Date()
    }, {
        admin : true,
        master : true,
        author : true
    }, callback);
    //this.chgState(tid, user, 'delete', callback);
}

/** 对帖子操作的权限判断 
 * topic - 帖子
 * user - 操作者
 * limit - 可以操作的角色 author-本人, master-版主，admin-管理员
 **/
exports._permission = function(topic, user, limit, cb){
    if(limit.admin && user.is_admin == 1) {    //管理员
        cb && cb(true);
    } else if(limit.author && user.id == topic.author_id) { //作者
        cb && cb(true);
    } else if(limit.master) {    //版主
        forumSvc.getMasters(topic.fid, function(err, masters){
            if(masters && masters.length) {
                for(var i = 0; i < masters.length; i++) {
                    if(masters[i].uid == user.id) {
                        return cb && cb(true);
                    }
                }
            }
            cb(false);
        });
    } else {
        cb(false);
    }
}