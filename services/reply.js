var _ = require('lodash');
var async  = require('async');
var Topic  = new BaseModel('forum_topic');
var User   = new BaseModel('users');
var Reply  = new BaseModel('forum_reply');
var Forum  = new BaseModel('forum');
var UserCount = new BaseModel('user_count');
var ReplyZanLogs = new BaseModel('reply_zan_logs');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var forumSvc = loadService('forum');

var getPageWithDef = function(p){
    return _.merge({page : 1, pageSize : 20}, p);
}

exports.getById = function (id, cb) {
    Reply.find().where({
        id : id
    }).done(cb);
}

exports.getListByTopicId = function(tid, cb, page){
    var p = getPageWithDef(page);
    Reply.findAll().where({
        tid : tid
    }).include([User.Model]).page(p).done(cb);
}

exports.getListByUid = function(uid, cb, page){
    var p = getPageWithDef(page);
    Reply.findAll().where({
        author_id : uid
    }).include([
        {
            model : Topic.Model,
            include : [
                Forum.Model,
                User.Model
            ]
        }
    ]).page(p).done(cb);
}

/** 增加回复数量 **/
exports.increaseCount = function(reply, callback){

    async.parallel([
        //user count
        function(cb){
            UserCount.find().where({
                uid : reply.author_id
            }).done(function(err, uc){
                if(err || !uc){
                    return cb(err || '帖子作者不存在！');
                }

                UserCount.clean().update({
                    replys : uc.replys + 1
                }).where({
                    uid : reply.author_id
                }).done(cb);
            });
        },
        //topic count & last reply
        function(cb){
            Topic.findById(reply.tid).done(function(error, topic) {

                if (error || !topic) {
                    return cb && cb(error || new Error('该主题不存在'));
                }

                Topic.clean().update({
                    last_reply : reply.id,
                    last_reply_time : new Date(),
                    reply_count : topic.reply_count + 1,
                    last_reply_user_id : reply.author_id,
                    last_reply_user_nick : reply.author_nick
                }).where({
                    id : reply.tid
                }).done(cb);
            });
        },
        //forum count & last reply
        function(cb){
            Forum.findById(reply.fid).done(function(error, forum) {

                if (error || !forum) {
                    return cb(err || '论坛版块不存在！');
                }

                Forum.clean().update({
                    posts : forum.posts + 1,
                    last_reply : reply.id,
                    last_reply_time : new Date(),
                    last_reply_user_id : reply.author_id,
                    last_reply_user_nick : reply.author_nick
                }).where({
                    id : reply.fid
                }).done(cb);
            });
        },
        //forum_type count & last reply
        function(cb){
            Forum.findById(reply.ftype_id).done(function(error, forum) {

                if (error || !forum) {
                    return cb(error || '论坛版块不存在！');
                }

                Forum.clean().update({
                    posts : forum.posts + 1,
                    last_reply : reply.id,
                    last_reply_time : new Date(),
                    last_reply_user_id : reply.author_id,
                    last_reply_user_nick : reply.author_nick
                }).where({
                    id : reply.ftype_id
                }).done(cb);
            });
        },
        //total count & last reply
        function(cb){
            forumSvc.getStat(function(err, stat){
                if(err || !stat) {
                    //cb(err || '统计不存在！');
                    return cb();
                }
                Forum.clean().update({
                    posts : stat.posts + 1,
                    last_reply : reply.id,
                    last_reply_time : new Date(),
                    last_reply_user_id : reply.author_id,
                    last_reply_user_nick : reply.author_nick
                }).where({
                    id : stat.id
                }).done(cb);
            });
        }
    ], function(err, results){
        callback && callback(err);
    });
}

/** 增加一个回复 **/
exports.add = function(reply, cb){
    var self = this;
    //判断主题是否存在
    //增加回复
    topicSvc.getById(reply.tid, function(err, topic, tUser, lastReply){
        if(!topic) {
            cb && cb('回复的主题不存在！');
            return;
        }

        Reply.max('position').where({
            tid : reply.tid
        }).done(function(err, max){
            if(err && !max) max = 'ERR';

            Reply.add({
                content : reply.content,
                tid : topic.id,
                fid : topic.fid,
                ftype_id : topic.ftype_id,
                author_id : reply.author_id,
                author_nick : reply.author_nick,
                author_pic : reply.author_pic,
                position : max != 'ERR' ? (1 + max || 0) : null
            }).done(function(err, reply){
                cb && cb(err, reply);
                //增加数量-主题回复数
                try{
                    self.increaseCount(reply, function(err){
                        if(err) {
                            console.error(err);
                        }
                    });
                } catch(e) {
                    console.error(e);
                }
            });
        });
    });
}

//对回复点赞
exports.zan = function(rid, uid, cb){
    async.waterfall([
        function(callback){
            ReplyZanLogs.find().where({
                rid : rid,
                uid : uid
            }).done(function(err, zlog){
                callback(zlog ?  '您已赞过，不能重复赞。' : null);
            });
        },
        function(callback){
            Reply.find().where({
                id : rid
            }).done(function(err, reply){
                callback(!reply ? '回复不存在或被删除！' : err, reply);
            });
        },
        function(reply, callback) {
            ReplyZanLogs.add({
                rid : rid,
                uid : uid
            }).done(function(err, zlog){
                callback(err)
            });

            //更新数量
            try{
                Reply.clean().update({
                    zan_count : 1 + reply.zan_count || 0
                }).where({
                    id : reply.id
                }).done(function(err, t){
                    console.log('--------------> topic update err : ' + err);
                    //callback(err);
                });
            } catch(e) {
                console.error(e);
            }
        }
    ], function(err){
        return cb && cb(err);
    });
}

exports.delete = function(replyId, cb){
    cb();
}