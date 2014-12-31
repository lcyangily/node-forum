var _ = require('lodash');
var async  = require('async');
var News   = new BaseModel('news_topic');
var User   = new BaseModel('users');
var Forum  = new BaseModel('forum');
var Topic  = new BaseModel('forum_topic');
var UserCount = new BaseModel('user_count');
var forumSvc = loadService('forum');
var topicSvc = loadService('topic');

exports.getList = function(cb, page){

    var p = _.extend({page : 1, pageSize : 20}, page);

    News.findAll().include([
        {
            model : Topic.Model,
            include : [
                User.Model, 
                Forum.Model, 
                {model : User.Model, as : 'reply_author'},
                {model : Forum.Model, as : 'forum_type'}
            ]
        }
    ]).order({
        create_time : 'desc'
    }).page(p).done(cb);
    /*Topic.findAll()
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
        }).page(p).done(function(err, topics, page){
//console.log('======> topics : ' + JSON.stringify(topics));
console.log('======> page : ' + JSON.stringify(page));
            cb(err, topics, page);
        });*/
}

//发布帖子
exports.add = function (kv, user, callback) {
    var self = this;

    async.waterfall([
        function(cb){
            News.find().where({
                id : kv.id
            }).done(function(err, news){
                if(err || news) {
                    return cb(news ? '已经推荐到首页，请勿重复操作！' : err);
                }
                cb();
            });
        },
        function(cb){
            topicSvc.getById(kv.id, function(err, topic){
                if(err || !topic) return callback && callback(!topic ? '主题不存在！' : err);

                var nobj = {
                    id : kv.id,
                    img : kv.img,
                    title : kv.title,
                    content : kv.content,
                    fid : topic.fid,
                    ftype_id : topic.ftype_id,
                    author_id : topic.author_id,
                    create_uid : user.id,
                    status : 3
                };

                if(user.is_admin) {
                    nobj.status = 0;
                    nobj.audit_uid = user.id;
                    nobj.audit_time = new Date();
                }
                News.add(nobj).done(cb);
            });
        }
    ], callback);
};