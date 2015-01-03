var _      = require('lodash');
var async  = require('async');
var forumSvc = loadService('forum');
var replySvc = loadService('reply');
var topicSvc = loadService('topic');
var userSvc  = loadService('user');
var hySvc    = loadService('hy');
var config   = require('../config');
var fs       = require('fs');

module.exports = {
    "/": {
        get : {
            filters : ['blocks/hotForums'], 
            template : 'hy/index',
            controller : function(req, res, next){
                res.locals.type = 1;
                hySvc.getByType(1, function(err, infos){
                    res.locals.infos = infos;
                    next(err);
                });
            }
        }
    },
    '/join' : {
        get : {
            filters : ['blocks/hotForums', 'checkLogin'], 
            template : 'hy/index',
            controller : function(req, res, next){
                res.locals.type = 'join';
                next();
            }
        },
        post : {
            filters : ['checkLogin'], 
            controller : function(req, res, next){
                var type = req.body.type;
                var name = req.body.name;
                var desc = req.body.desc;
                var phone = req.body.phone;
                var addr = req.body.addr;
                //var file = req.body.files.img;
                var user = req.session.user;

                var arg0 = req.body.arg0;
                var arg1 = req.body.arg1;
                var arg2 = req.body.arg2;
                var arg3 = req.body.arg3;
                var arg4 = req.body.arg4;
                var arg5 = req.body.arg5;
                var arg6 = req.body.arg6;
                var arg7 = req.body.arg7;
                var arg8 = req.body.arg8;
                var arg9 = req.body.arg9;
                var arg10 = req.body.arg10;
                var arg = req.body.arg;//预留数组，其他里的

                //图片
                var iinfo = req.files.img;
                var origName= iinfo.originalFilename;
                var extName = origName.substring(origName.lastIndexOf('.'));
                var tmpPath = iinfo.path;
                var newName = new Date().getTime() + extName;
                var newPath = config.base_path + '/uploads/' + newName;
                var webPath = '/uploads/' + newName;

                fs.rename(tmpPath, newPath, function(err){
                    if(err) {
                        return next('图片上传失败！:' + err);
                    }

                    hySvc.joinRequest({
                        name : name,
                        img : webPath,
                        desc : desc,
                        phone : phone,
                        type : type,
                        addr : addr,
                        //fid : fid,
                        //tid : tid,
                        uid : user.id,
                        arg0 : arg0,
                        arg1 : arg1,
                        arg2 : arg2,
                        arg3 : arg3,
                        arg4 : arg4,
                        arg5 : arg5,
                        arg6 : arg6,
                        arg7 : arg7,
                        arg8 : arg8,
                        arg9 : arg9,
                        arg10 : arg10
                    }, function(err, linfo){
                        if(err) return next(err);
                        return res.render('notify/notify', {
                            success : '申请成功，等待管理员审核！'
                        });
                    });
                });
            }
        }
    },
    '/:type' : {
        get : {
            filters : ['blocks/hotForums'], 
            template : 'hy/index',
            controller : function(req, res, next){
                var type = req.params.type;
                res.locals.type = type;
                hySvc.getByType(type, function(err, infos){
                    res.locals.infos = infos;
                    next(err);
                });
            }
        }
    }
}