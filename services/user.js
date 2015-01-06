var _ = require('lodash');
var async  = require('async');

var User       = new BaseModel('users');
var UserCount  = new BaseModel('user_count');
var UserProfile= new BaseModel('user_profile');
var UserFriend = new BaseModel('user_friend');
var UserFollow = new BaseModel('user_follow');
var UserFav    = new BaseModel('user_favorite');
var UserFriendRequest = new BaseModel('user_friend_request');
var ForumModerator = new BaseModel('forum_moderator');
var Forum      = new BaseModel('forum');
var Topic      = new BaseModel('forum_topic');
/*
var Reply  = new BaseModel('forum_reply');
var Forum  = new BaseModel('forum');
var replySvc = loadService('reply');
var forumSvc = loadService('forum');*/


exports.register = function (user, cb){
    this.getByName(user.loginname, function(err, u){
        if(err || u) {
            return cb && cb(err || '用户已经存在！');
        }
        user.weibo_token = 'test';
        User.add(user).done(function(err, user){

            if(err) {
                return cb && cb(err);
            }
            UserCount.add({
                uid : user.id
            }).done(function(err, uc){
                if(err) return cb && cb(err);

                UserProfile.add({
                    uid : user.id
                }).done(function(err, up){
                    cb && cb(err, user);
                });
            });
        });
    });
}

exports.login = function(user, cb){
    User.find().where({
        loginname : user.loginname
    }).include([
        UserCount.Model,
        UserProfile.Model
    ]).done(function(err, u){
        if(err) {
            cb(err);
        } else if(!u) {
            cb('用户名不存在！');
        } else if(user.password != u.password){
            cb('密码不正确！');
        } else {
            cb(null, u);
        }
    });
}

exports.getById = function (id, cb){
    User.find().where({
        id : id
    }).include([
        UserCount.Model,
        UserProfile.Model
    ]).done(function(err, u){
        cb && cb(err, u);
    });
}

//得到所有版主是当前用户的所有版块
exports.getMgrForums = function(uid, cb){
    ForumModerator.findAll().where({
        uid : uid
    }).include([
        Forum.Model
    ]).done(cb);
}

/*exports.getFullById = function (id, cb){
    User.find().where({
        id : id
    }).done(function(err, u){
        cb(err, u);
    });
}*/

exports.getByName = function (name, cb){
    User.find().where({
        loginname : name
    }).include([
        UserCount.Model,
        UserProfile.Model
    ]).done(cb);
}

exports.getList = function(cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    User.findAll().include([
        UserCount.Model,
        UserProfile.Model
    ]).page(p).done(cb);
}

exports.getLastRegUser = function(cb){
    User.find().order({
        create_time : 'desc'
    }).include([
        UserCount.Model,
        UserProfile.Model
    ]).done(cb);
}

/** 得到用户的所有好友 **/
exports.getFriends = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    UserFriend.findAll().where({
        uid : uid
    }).include([{
        model : User.Model,
        include : [
            UserCount.Model,
            UserProfile.Model
        ]
    }]).page(p).done(cb);
}

/** 得到用户接受到的好友请求 **/
exports.getReceiveFriendsRequest = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    UserFriendRequest.findAll().where({
        fuid : uid
    }).include([{
        model : User.Model,
        as : 'send',
        include : [
            UserCount.Model,
            UserProfile.Model
        ]
    }]).page(p).done(cb);
}

/** 得到用户接收到的好友请求 **/
exports.getSendFriendsRequest = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    UserFriendRequest.findAll().where({
        uid : uid
    }).include([{
        model : User.Model,
        as : 'receive',
        include : [
            UserCount.Model,
            UserProfile.Model
        ]
    }]).page(p).done(cb);
}

//添加好友请求
exports.addFriendRequest = function(myid, fuid, note, cb){
    this.getById(fuid, function(err, fuser){
        if(err || !fuser) {
            return cb && cb(!fuser ? '请求用户不存在！' : err);
        }

        UserFriendRequest.find().where({
            uid : myid,
            fuid : fuid
        }).done(function(err, r){

            if(err || r) {
                return cb && cb(r ? '好友请求已发送，请勿重复操作！' : err);
            }

            UserFriendRequest.add({
                uid : myid,
                fuid : fuser.id,
                friend_name : fuser.nickname,
                note : note
            }).done(cb);
        });
    });
}

//同意添加好友请求
exports.agreeFriendRequest = function(myid, fuid, cb) {

    UserFriend.find().where({
        uid : myid,
        fuid : fuid
    }).done(function(err, friend){
        if(err || !fuser) {
            cb && cb(!fuser ? '已是好友！' : err);
            return;
        }

        UserFriend.add({
            uid : myid,
            fuid : fuid
        }).done(cb);
    });
}

//删除好友
exports.removeFriend = function(myid, fuid, cb) {
    UserFriend.delete().where({
        uid : myid,
        fuid : fuid
    }).done(cb);
}

/* 得到我关注的人 */
exports.getFollowers = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    UserFollow.findAll().where({
        uid : uid,
        status : 0
    }).include([
        {model : User.Model, as : 'follow'}
    ]).page(p).done(cb);
}

/* 得到关注我的人 */
exports.getFollowersMe = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    UserFollow.findAll().where({
        follow_uid : uid,
        status : 0
    }).include([
        {model : User.Model, as : 'fans'}
    ]).page(p).done(cb);
}


//关注
exports.follow = function(myid, fuid, cb) {

    async.waterfall([
        function(callback){
            UserFollow.find().where({
                uid : myid,
                follow_uid : fuid
            }).done(function(err, follow){
                callback(follow ? '已关注！' : err);
            });
        },
        function(callback){ //是否已被对方关注
            UserFollow.find().where({
                uid : fuid,
                follow_uid : myid
            }).done(function(err, follow){
                callback(err, follow);
            });
        },
        function(follow, callback){
            if(follow) {//互相关注
                UserFollow.clean().update({
                    mutual : 1
                }).where({
                    uid : fuid,
                    follow_uid : myid
                }).done();
            }

            UserFollow.clean().add({
                uid : myid,
                follow_uid : fuid,
                mutual : follow ? 1 : 0
            }).done(callback);
        }
    ], function(err, results){
        cb && cb(err);
    });
}

//取消关注
exports.unfollow = function(uid, fuid, cb){
    cb && cb();
}

//增加收藏
exports.addFav = function(uid, id, type, cb){
    var self = this;
    UserFav.find().where({
        uid : uid,
        id : id,
        type : type
    }).done(function(err, fav){
        if(err || fav) {
            return cb && cb(fav ? {msg : '您已经收藏，不能重复收藏！'} : err);
        }

        UserFav.add({
            uid : uid,
            id : id,
            type : type
        }).done(function(err, rfav){
            cb && cb(err, rfav);

            //增加数量
            try{
                self.increaseFavCount(rfav, function(err){
                    if(err) {
                        console.error(err);
                    }
                });
            } catch(e) {
                console.error(e);
            }
        });
    });
}

//得到
exports.getFavForums = function(uid, cb){
    UserFav.findAll().where({
        uid : uid,
        type : 1
    }).include([
        Forum.Model
    ]).done(cb);
}

exports.getFavTopics = function(uid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    UserFav.findAll().where({
        uid : uid,
        type : 2
    }).include([{
        model : Topic.Model,
        include : [
            Forum.Model, 
            {model : User.Model, as : 'reply_author'},
            {model : Forum.Model, as : 'forum_type'}
        ]
    }]).page(p).done(cb);
}

//增加收藏数量
exports.increaseFavCount = function(fav, callback){

    async.parallel([
        //user count
        function(cb){
            UserCount.find().where({
                uid : fav.uid
            }).done(function(err, uc){
                if(err || !uc){
                    return cb(err || '帖子作者不存在！');
                }

                var uObj = {};
                if(fav.type == 2) { //主题
                    uObj.collect_topic = 1 + uc.collect_topic || 0;
                } else if(fav.type == 1) {  //版块
                    uObj.collect_forum = 1 + uc.collect_forum || 0;
                } else {
                    return cb();
                }
                UserCount.clean().update(uObj).where({
                    uid : fav.uid
                }).done(cb);
            });
        },
        //forum count
        function(cb){
            if(fav.type == 1) {
                Forum.find().where({
                    id : fav.id
                }).done(function(err, forum){
                    if(err || !forum) {
                        cb(err || '论坛版块不存在！');
                        return;
                    }
                    Forum.clean().update({
                        collect_count : 1 + forum.collect_count || 0
                    }).where({
                        id : fav.id
                    }).done(cb);
                });
            } else {
                cb();
            }
        },
        //topic count
        function(cb){
            if(fav.type == 2) {
                Topic.find().where({
                    id : fav.id
                }).done(function(err, topic){
                    if(err || !topic) {
                        cb(err || '主题不存在！');
                        return;
                    }
                    Topic.clean().update({
                        collect_count : 1 + topic.collect_count || 0
                    }).where({
                        id : fav.id
                    }).done(cb);
                });
            } else {
                cb();
            }
        }
    ], function(err, results){
        callback && callback(err);
    });
}

exports.update = function(){

}

//修改积分数
exports.updateScoreCount = function(uid, modVal, cb){
    cb();
}

//增加关注数
//增加被关注数
//增加收藏数

//只有微博，QQ登录，暂无修改密码
exports.chgPwd = function(user, oldpwd, newpwd, callback){

}
//修改用户信息
exports.chgInfo = function(user, info, callback){
    //这些字段可以修改，防止前端传入不能修改的字段，如id, loginname, weibo_id 等
    var canChgFields = ['nickname', 'avatar', 'update_time'];
    var nInfo = {};
    _.map(canChgFields, function(name){
        if(!_.isUndefined(info[name])){
            nInfo[name] = info[name];
        }
    });

    if(_.isEmpty(nInfo)) {
        return callback('没有需要修改的数据。');
    }
    this.chgInfoCommon(user.id, user, info, {
        user : true
    }, callback);
}

//修改头像
exports.chgAvatar = function(user, picUrl, callback){
    this.chgInfoCommon(user.id, user, {
        'avatar' : picUrl
    }, {
        user : true
    }, callback);
}

/** 修改用户详细信息 **/
exports.chgProfile = function(user, prop, callback){

    async.waterfall([
        function(cb){
            User.findById(user.id).done(function(error, user) {
                cb(error, user);
            });
        },
        function(user, cb){

            if(_.isEmpty(prop)){
                return cb('没有需要修改的数据！');
            } else {
                prop = prop || {};
                if(_.has(prop, 'id')){
                    delete prop.id;
                }
                prop.update_time = new Date();
                UserProfile.clean().update(prop).where({
                    uid : user.id
                }).done(cb);
            }
        }
    ], callback);
}

//修改用户资料后处理：刷新session等
exports.chgInfoAfterDeal = function(session, uid, cb) {
    //如果是管理员操作则不修改session
    if(session && session.user && session.user.id === uid) {
        this.getById(uid, function(err, user){
            if(!err && user) {
                session.user = user;
            }
            cb && cb(err, user);
        });
    } else {
        cb && cb();
    }
}

/** private **/
/** 修改用户通用方法 **/
exports.chgInfoCommon = function(uid, oper, prop, limit, callback){

    async.waterfall([
        function(cb){
            User.findById(uid).done(function(error, user) {
                cb(error, user);
            });
        },
        function(user, cb) {   //权限判断

            if(limit.mgr && oper.is_admin == 1) {    //管理员
                cb(null, user);
            } else if(limit.user && oper.id == user.id) { //自己
                cb(null, user);
            } else {
                cb(null, user);
            }
        },
        function(user, cb){

            if(_.isEmpty(prop)){
                return cb('没有需要修改的数据！');
            } else {
                prop.update_time = new Date();
                User.clean().update(prop).where({
                    id : uid
                }).done(cb);
            }
        }
    ], callback);
}