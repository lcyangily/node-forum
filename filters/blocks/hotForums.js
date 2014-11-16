var forumSvc = loadService('forum');

module.exports = function(req, res, next) {
    /* 板块推荐 */
    forumSvc.getForum(function(err, forums){
        if(!err) {
            res.locals.hotForums = forums;
        }
        return next();
    });
};