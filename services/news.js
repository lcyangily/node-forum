var _ = require('lodash');
var async  = require('async');
var News   = new BaseModel('news_topic');
var User   = new BaseModel('users');
var Forum  = new BaseModel('forum');
var Topic  = new BaseModel('forum_topic');
var UserCount = new BaseModel('user_count');
var forumSvc = loadService('forum');
var topicSvc = loadService('topic');

var getPageWithDef = function(p){
    return _.merge({page : 1, pageSize : 20}, p);
}

//面向公众的通用查询
exports.getListCommon = function(where, order, cb, page){
    //var p = _.extend({page : 1, pageSize : 20}, page);
    var p = getPageWithDef(page);
    //var o = _.extend({create_time : 'desc'}, order);
    var o = order || [['create_time', 'desc']];
    var w = _.extend({
        status : 0, //0-正常
        // 'forum_topic.status' : 0
    }, where);
    //指定fields 去掉conent 速度更快
    News.findAll().include([
        {
            model : Topic.Model,
            attributes : [  //除去content 
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
            ],
            include : [
                User.Model, 
                Forum.Model, 
                {model : User.Model, as : 'reply_author'},
                {model : Forum.Model, as : 'forum_type'}
            ]
        }
    ]).where(w).order(o).page(p).done(cb);
}

exports.getList = function(cb, page){

    return this.getListCommon({}, null, cb, page);
    /*var p = getPageWithDef(page);

    News.findAll().include([
        {
            model : Topic.Model,
            attributes : [  //除去content 
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
            ],
            include : [
                User.Model, 
                Forum.Model, 
                {model : User.Model, as : 'reply_author'},
                {model : Forum.Model, as : 'forum_type'}
            ]
        }
    ]).where({
        status : 0,
        'forum_topic.status' : 0
    }).order({
        create_time : 'desc'
    }).page(p).done(cb);*/
}

exports.getAuditRequests = function(cb, page){
    var p = getPageWithDef(page);
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
    ]).where({
        status : 3
    }).order({
        create_time : 'desc'
    }).page(p).done(cb);
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