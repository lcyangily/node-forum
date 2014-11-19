var async  = require('async');
var Topic  = new BaseModel('forum_topic');
var User   = new BaseModel('users');
var Reply  = new BaseModel('forum_reply');
var replySvc = loadService('reply');
var forumSvc = loadService('forum');

exports.getById = function (id, cb) {
    cb();
}

exports.getByTopicId = function(tid, page, cb){
    cb();
}
exports.add = function(kv, cb){
    cb();
}
exports.delete = function(replyId, cb){
    cb();
}