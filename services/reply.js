var async  = require('async');
var Topic  = new BaseModel('forum_topic');
var User   = new BaseModel('users');
var Reply  = new BaseModel('forum_reply');
var Forum  = new BaseModel('forum');
var UserCount = new BaseModel('user_count');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var forumSvc = loadService('forum');

exports.getById = function (id, cb) {
    Reply.find().where({
        id : id
    }).done(cb);
}

exports.getListByTopicId = function(tid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Reply.findAll().where({
        tid : tid
    }).include([User.Model]).page(p).done(cb);
}

exports.getListByUid = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Reply.findAll().where({
        author_id : uid
    }).include([Topic.Model]).page(p).done(cb);
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
        //topic count
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
        //forum count
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
        //forum_type count
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
        //total count
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

exports.add = function(reply, cb){
    var self = this;
    //判断主题是否存在
    //增加回复
    topicSvc.getById(reply.tid, function(err, topic, tUser, lastReply){
        if(!topic) {
            cb && cb('回复的主题不存在！');
            return;
        }

        Reply.add({
            content : reply.content,
            tid : topic.id,
            fid : topic.fid,
            ftype_id : topic.ftype_id,
            author_id : reply.author_id,
            author_nick : reply.author_nick,
            author_pic : reply.author_pic
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
            
            /*topicSvc.updateLastReply(reply, function(err, topic){
                if(err) {
                    console.error(err);
                }
            });
            forumSvc.updateLastPost(reply, function(err, forum){
                if(err) {
                    console.error(err);
                }
            });*/
        });
    });
}

exports.delete = function(replyId, cb){
    cb();
}