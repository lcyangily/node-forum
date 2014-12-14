var forumSvc = loadService('forum');
var userSvc  = loadService('user');
var async = require('async');

module.exports = {
    "/": {
        get: {
            template : 'mgr/forum/list',
            controller : function(req, res, next){
                next();
                //res.render('mgr/forum/list');
            }
        }
    },
    '/alldata' : {
        get : {
            controller : function(req, res, next){
                userSvc.getList(function(err, users, page){
                    res.send({
                        rows : users,
                        total : page.total
                    });
                }, {
                    page : req.param.page
                });
            }
        }
    }
}