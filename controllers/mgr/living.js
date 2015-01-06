var _        = require('lodash');
var async    = require('async');
var fs       = require('fs');
var config   = require('../../config');
var userSvc  = loadService('user');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var newsSvc  = loadService('news');
var livingSvc= loadService('living');

module.exports = {
    '/' : {
        get : {
            //template : '',
            controller : function(req, res, next){
                res.locals.action = 'living';
                async.parallel([
                    function(cb){
                        livingSvc.getRequestList(function(err, living, page){
                            cb(err, {
                                list : living,
                                page : page
                            });
                        });
                    },
                    function(cb){
                        livingSvc.getAuditedList(function(err, living, page){
                            cb(err, {
                                list : living,
                                page : page
                            });
                        });
                    }
                ], function(err, results){
                    res.locals.request = results && results[0];
                    res.locals.audit = results && results[1];
                    next(err);
                });
            }
        }
    },
    '/audit' : {
        post : {
            filters : ['checkAdmin'],
            controller : function(req, res, next){
                var id = req.body.id;
                livingSvc.audit(id, function(err, info){
                    if(err) next(err);
                    return res.send(200, {
                        code : 1,
                        msg : '审核成功！'
                    });
                });
            }
        }
    }
}