var async  = require('async');
var Topic  = new BaseModel('forum_topic');
var User   = new BaseModel('users');
var Reply  = new BaseModel('forum_reply');
var replySvc = loadService('reply');
var forumSvc = loadService('forum');

exports.getById = function (id, cb) {
    cb();
}

exports.getListByTopicId = function(tid, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Reply.findAll().where({
        tid : tid
    }).page({
        page : p.page,
        pageSize : p.pageSize
    }).done(cb);
}
exports.add = function(kv, cb){
    cb();
}
exports.delete = function(replyId, cb){
    cb();
}