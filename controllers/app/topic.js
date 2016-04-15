var async  = require('async');
var _      = require('lodash');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc = loadService('user');
var newsSvc  = loadService('news');

module.exports = {
    '/:id' : {
        get : function(req, res, next){
            var id = req.params.id;
            topicSvc.getById(id, function(err, topic, author, last_reply){
                res.json({
                    topic : topic,
                    author : author
                });
            });
        }
    }
}