var _ = require('lodash');
var async  = require('async');
var Topic  = new BaseModel('forum_topic');
var User   = new BaseModel('users');
var Reply  = new BaseModel('forum_reply');
var Forum  = new BaseModel('forum');
var TopicPoll = new BaseModel('topic_poll');
var TopicPolloption = new BaseModel('Topic_polloption');
var UserCount    = new BaseModel('user_count');
var TopicZanLogs = new BaseModel('topic_zan_logs');
var replySvc = loadService('reply');
var forumSvc = loadService('forum');

exports.getById = function (id, cb) {
    console.log('topic getbyid ... ');
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
                    User.findById(topic.author_id).done(callback);
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
                    User.findById(topic.author_id).done(callback);
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
            
            callback(err, topic, author, reply, forum, ftype, zaners);
        }
    ], function(err, topic, author, reply, forum, ftype, zaners){
        cb && cb(err, {
            topic : topic,
            author : author,
            replys : reply[0],
            replyPage : reply[1],
            forum : forum,
            ftype : ftype,
            zaners : zaners
        });
    });
};

exports.getList = function(cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Topic.findAll()
        .include([
            User.Model, 
            Forum.Model, 
            {model : User.Model, as : 'reply_author'},
            {model : Forum.Model, as : 'forum_type'}
        ]).page(p).done(cb);
}

exports.getListByFid = function(fid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Topic.findAll()
        .include([
            User.Model, 
            Forum.Model,
            {model : User.Model, as : 'reply_author'},
            {model : Forum.Model, as : 'forum_type'}])
        .where({
            fid : fid
        }).page(p).done(cb);
}

exports.getListByFtypeid = function(ftypeid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Topic.findAll()
        .include([
            User.Model, 
            Forum.Model,
            {model : User.Model, as : 'reply_author'},
            {model : Forum.Model, as : 'forum_type'}])
        .where({
            ftype_id : ftypeid
        }).page(p).done(cb);
}

exports.getListByUid = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Topic.findAll()
        .include([
            User.Model, 
            Forum.Model,
            {model : User.Model, as : 'reply_author'},
            {model : Forum.Model, as : 'forum_type'}])
        .where({
            author_id : uid
        }).page(p).done(cb);
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
                callback(err)
            });

            //更新数量
            Topic.clean().update({
                zan_count : topic.zan_count + 1
            }).where({
                id : topic.id
            }).done(function(err, t){
                console.log('--------------> topic update err : ' + err);
                //callback(err);
            });
        }
    ], function(err){
        return cb && cb(err);
    });

}

//增加回复数
exports.increaseReplyCount = function(tid, cb){
    cb && cb();
}
//减少回复数
exports.reduceReplyCount = function(tid, cb){
    cb();
}

//增加访问数
exports.increaseVisitCount = function(tid, cb){
    cb && cb();
}
exports.reduceVisitCount = function(tid, cb){
    cb();
}
//增加收藏数
exports.increaseCollectCount = function(tid, cb){
    cb();
}
exports.reduceCollectCount = function(tid, cb){
    cb();
}
//增加赞数
exports.increaseZanCount = function(tid, cb){
    cb();
}
exports.reduceZanCount = function(tid, cb){
    cb();
}


/**
 * 将当前主题的回复计数减1，删除回复时用到
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
/*exports.reduceCount = function (id, callback) {

    Topic.findById(id).done(function(error, topic) {
        
        if(error) {
            return callback(error);
        }
        if (!topic) {
            return callback(new Error('该主题不存在'));
        }
        topic.reply_count -= 1;
        Topic.update(topic).done(function(err, topic){
            callback(err, topic);
        });
    });
};*/

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

/** 减少主题数量 **/
exports.reduceCount = function(topic, cb){
    //forum
    //forum_type
    //total
    //user
}

exports.add = function (kv, callback) {
    var self = this;
    Topic.add(kv).done(function(err, topic){
        callback && callback(err, topic);
        try{
            self.increaseCount(topic);
        } catch(e) {
            console.error(e);
        }
    });
};
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
                    votes : 0,
                    option : kv.options[i]
                });
            }

            TopicPolloption.addBat(options).done(function(err){
                callback && callback(err, topic, poll);
            });
        });
    });
}

/**
 * 更新主题的最后回复信息
 * @param {String} topicId 主题ID
 * @param {String} replyId 回复ID
 * @param {Function} callback 回调函数
 */
/*exports.updateLastReply = function (reply, callback) {
    Topic.findById(reply.tid).done(function(error, topic) {

        if (error || !topic) {
            callback && callback(error || new Error('该主题不存在'));
            return;
        }

        Topic.update({
            last_reply : reply.id,
            last_reply_time : new Date(),
            reply_count : topic.reply_count + 1,
            last_reply_user_id : reply.author_id,
            last_reply_user_nick : reply.author_nick
        }).done(function(err, topic){
            callback && callback(err, topic);
        });
    });
};*/