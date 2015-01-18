var forumSvc = loadService('forum');
var async = require('async');

module.exports = {
    "/": {
        get: {
            controller : function(req, res, next){
                forumSvc.getAll(function(err, forums){
                    res.locals.forums = forums;
                    next();
                }, true);
            }
        }
    },
    /*'/getdata' : {
        get : {
            controller : function(req, res, next){
                console.log('----> getdata;');
                forumSvc.getAll(function(err, forums){
                    res.send({
                        rows : forums,
                        total : forums.length
                    });
                });
            }
        }
    },*/
    '/delete' : {
        post : {
            controller : function(req, res, next){
                var id = req.body.id;
                forumSvc.remove(id, function(){
                    res.send({
                        success : true
                    });
                });
            }
        }
    },
    '/create' : {
        get : function (req, res, next) {
            forumSvc.getAll(function(err, forums){
                res.locals.forums = forums;
                next();
            }, true);
        },
        post : function (req, res, next) {
            forumSvc.add({
                parent_id : req.body.parent_id || 0,
                type : req.body.type,
                name : req.body.name,
                desc : req.body.desc,
                pic  : req.body.pic
            }, function(err, t){
                if(err) {
                    return next(err);
                }
                res.render('notify/notify_pop', {
                    success : '添加成功!'
                });
            });
        }
    },
    '/update' : {
        post : function (req, res, next) {
            if(!req.body.id) {
                res.render('notify/notify', {
                    error : '请选择一条记录修改!'
                });
            }
            Forum.saveForum(req.body.id,
                            req.body.parent_id || null, 
                            req.body.type, req.body.name, 
                            req.body.desc, 
                            function(err){
                                if(err) {
                                    res.render('notify/notify', {
                                        error : err
                                    });
                                } else {
                                    res.redirect('/mgr/forum/create');
                                }
                            });
        }
    },
    '/master' :  {
        get : {
            controller : function(req, res, next){
                var fid = req.query.fid;
                forumSvc.getById(fid, function(err, forum){
                    if(err || (!forum || forum.type != 1)) {
                        return next((!forum || forum.type != 1) ? '版块不存在！': err);
                    }
                    res.locals.forum = forum;
                    forumSvc.getMasters(fid, function(err, masters){
                        res.locals.masters = masters;
                        next(err);
                    });
                });
            }
        },
        post : {
            controller : function(req, res, next){
                console.log('----> ' + JSON.stringify(req.body.masters));
                var fid = req.body.fid;
                var masters = req.body.masters;
                if(fid && masters && masters.length) {
                    forumSvc.addMasters(fid, masters, function(err){
                        return res.send(200, {code : 'success'});
                    });
                } else {
                    next('参数不对！');
                }
            }
        }
    }
}