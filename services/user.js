var _ = require('lodash');
var async  = require('async');

var User   = new BaseModel('users');
/*var Topic  = new BaseModel('forum_topic');
var Reply  = new BaseModel('forum_reply');
var Forum  = new BaseModel('forum');
var replySvc = loadService('reply');
var forumSvc = loadService('forum');*/

exports.getById = function (id, cb){
    User.find().where({
        id : id
    }).done(function(err, u){
        cb(err, u);
    });
}

exports.getByName = function (name, cb){

}

exports.register = function (user, cb){
    User.add(user).done(cb);
}

exports.login = function(user, cb){
    User.find().where({
        loginname : user.loginname
    }).done(function(err, u){
        if(err) {
            cb(err);
        } else if(!u) {
            cb('用户名不存在！');
        } else if(user.passwd != u.signature){
            cb('密码不正确！');
        } else {
            cb(null, u);
        }
    });
}

exports.update = function(){

}

//修改积分数
exports.updateScoreCount = function(uid, modVal, cb){
    cb();
}

//增加用户帖子数量
exports.increaseTopicCount = function(){

}

//减少用户帖子数量
exports.reduceTopicCount = function(){
    
}

//增加用户回复数量
exports.increaseReplyCount = function(){

}

//减少用户回复数量
exports.reduceReplyCount = function(){

}

//增加关注数
//增加被关注数
//增加收藏数