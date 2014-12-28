var _ = require('lodash');
var async  = require('async');
var News   = new BaseModel('news_topic');
var User   = new BaseModel('users');
var Forum  = new BaseModel('forum');
var Topic  = new BaseModel('forum_topic');
var UserCount = new BaseModel('user_count');
var forumSvc = loadService('forum');

exports.getList = function(cb, page){

    var p = _.extend({page : 1, pageSize : 20}, page);
    Topic.findAll()
        .include([
            News.Model,
            User.Model, 
            Forum.Model, 
            {model : User.Model, as : 'reply_author'},
            {model : Forum.Model, as : 'forum_type'}
        ]).where({
            'news_topic.id' : {
                ne : null
            }
        }).order({
            'news_topic.create_time' : 'desc'
        }).page(p).done(cb);
}

//发布帖子
exports.add = function (kv, callback) {
    var self = this;
    News.add(kv).done(function(err, news){
        callback && callback(err, news);
    });
};