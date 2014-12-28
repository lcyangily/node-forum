var userSvc  = loadService('user');
var md5 = require('MD5');
var config = require('../config');

module.exports = function(req, res, next) {
    if(req.session.user) {
        dealNext(req.session);
    } else {

        if(!req.cookies) {
            return next();
        }

        //var autologinToken = req.signedCookies[config.auth_cookie_name];
        var autologinToken = req.cookies[config.auth_cookie_name];
        if (!autologinToken) {
            return next();
        }

        var cInfos = autologinToken.split(':');
        var uid   = cInfos[0];
        var token = cInfos[1];
        userSvc.getById(uid, function(err, user){
            if(user && md5(user.weibo_token) == token) {
                userSvc.getMgrForums(uid, function(err, moderators){
                    req.session.user = user;
                    req.session.mgrForums = moderators;
                    dealNext(req.session);
                });
            }
        });
    }

    function dealNext(session) {
        res.locals._s = session || {};
        next();
    }
}