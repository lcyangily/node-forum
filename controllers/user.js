var _      = require('lodash');
var userSvc  = loadService('user');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');

module.exports = {
    "/": {
        get: {
            template : 'index/index',
            controller : function(req, res, next) {
                next();
            }
        }
    },
    '/block' : {
        get : {
            filters : ['blocks/hotForums'],
            controller : function(req, res, next){
                forumSvc.getAll(function(err, forums){
                    var groups = _.filter(forums, function(f){
                        return f.type == 0;
                    });
                    groups = _.map(groups, function(g, index){
                        //var ga = _.clone(g);
                        g.children = _.filter(forums, function(f){
                            return g.id === f.parent_id;
                        });
                        return g;
                    });

                    res.render('forum/block', {
                        groups : groups
                    });
                });
            }
        }
    }
}