var _ = require('lodash');
var async  = require('async');
var Topic  = new BaseModel('forum_topic');
var User   = new BaseModel('users');
var Reply  = new BaseModel('forum_reply');
var Forum  = new BaseModel('forum');
var replySvc = loadService('reply');
var forumSvc = loadService('forum');

exports.getById = function (id, cb) {
    async.waterfall([
        //得到帖子内容
        function(callback){
            Topic.findById(id).done(function(error, topic) {
                callback(error, topic);
            });
        },
        //得到帖子其他信息：用户信息、回复信息
        function(topic, callback){
            if(!topic) callback();

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
                callback(err, topic, results && results[0], results && results[1]);
            });
        }
    ], function(err, topic, author, last_reply){
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
exports.getFullTopic = function (id, cb) {

    async.waterfall([
        //得到帖子内容
        function(callback){
            Topic.findById(id).done(function(error, topic) {
                callback(error, topic);
            });
        },
        //得到帖子其他信息：用户信息、回复信息
        function(topic, callback){
            if(!topic) callback();

            async.parallel([
                function(callback){
                    User.findById(topic.author_id).done(callback);
                },
                function(callback){
                    replySvc.getByTopicId(id, {
                        page : 1,
                        pageSize : 10
                    }, callback);
                },
                function(callback){
                    forumSvc.getById(topic.fid, callback);
                },
                function(callback){
                    forumSvc.getById(topic.ftype_id, callback);
                }
            ], function(err, results){
                callback(err, topic, results && results[0], results && results[1],
                         results && results[2], results && results[3]);
            });
        }
    ], function(err, topic, author, replys, forum, froumTypes){
        cb && cb(err, topic, author, replys, forum, froumTypes);
    });
};

exports.getList = function(cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Topic.findAll().include([User.Model, Forum.Model]).page(p.page, p.pageSize).done(cb);
}
exports.getListByFid = function(forumId, cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    Topic.findAll()
         .include([User.Model, Forum.Model])
         .where({
            fid : forumId
         }).page(p.page, p.pageSize).done(cb);
}

//增加回复数
exports.increaseReplyCount = function(tid, cb){
    cb();
}
//减少回复数
exports.reduceReplyCount = function(tid, cb){
    cb();
}

//增加访问数
exports.increaseVisitCount = function(tid, cb){
    cb();
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
exports.reduceCount = function (id, callback) {

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
};

exports.add = function (kv, callback) {
    Topic.add(kv).done(callback);
};

/**
 * 更新主题的最后回复信息
 * @param {String} topicId 主题ID
 * @param {String} replyId 回复ID
 * @param {Function} callback 回调函数
 */
exports.updateLastReply = function (topicId, replyId, callback) {
    Topic.findById(id).done(function(error, topic) {

        if (error || !topic) {
            return callback(error || new Error('该主题不存在'));
        }
        topic.last_reply = replyId;
        topic.last_reply_time = new Date();
        topic.reply_count += 1;

        Topic.update(topic).done(function(err, topic){
            callback(error, topic);
        });
    });
};

/*******======= 还未修改 ======******/


/**
 * 根据关键词，获取主题列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getTopicsByQuery = function (query, opt, callback) {
  Topic.find(query, '', opt, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(null, []);
    }

    var topics_id = [];
    for (var i = 0; i < docs.length; i++) {
      topics_id.push(docs[i]._id);
    }

    var proxy = new EventProxy();
    proxy.after('topic_ready', topics_id.length, function (topics) {
      // 过滤掉空值
      var filtered = topics.filter(function (item) {
        return !!item;
      });
      return callback(null, filtered);
    });
    proxy.fail(callback);

    topics_id.forEach(function (id, i) {
      exports.getTopicById(id, proxy.group('topic_ready', function (topic, author, last_reply) {
        // 当id查询出来之后，进一步查询列表时，文章可能已经被删除了
        // 所以这里有可能是null
        if (topic) {
          topic.author = author;
          topic.reply = last_reply;
          topic.friendly_create_at = Util.format_date(topic.create_at, true);
        }
        return topic;
      }));
    });
  });
};
