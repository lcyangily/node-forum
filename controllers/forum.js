var forumSvc  = loadService('forum');
var replySvc  = loadService('reply');
var topicSvc = loadService('topic');
var _ = require('lodash');

module.exports = {
    "/": {
        get: {
            filters : ['blocks/hotForums'],
            controller : function(req, res, next) {
                //res.render('forum/index');
                topicSvc.getList(function(err, topics){
                    res.locals.topics = topics;
                    next();
                });
            }
        }
    },
    '/block' : {
        get : {
            filters : ['blocks/hotForums'],
            controller : function(req, res, next){
                forumSvc.getAll(function(err, forums){
                    //console.log('-----> count : ' + count);
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