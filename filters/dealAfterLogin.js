/** 处理登录之后的操作：写cookie等 **/
var md5 = require('MD5');
var config = require('../config');
var userSvc = loadService('user');

module.exports = function(req, res, next) {

    var originalUrl = req.body.originalUrl || res.locals.originalUrl || '/';
    var user = res.locals.auth_success_user;

    userSvc.getMgrForums(user.id, function(err, moderators){
        req.session.user = user;
        req.session.mgrForums = moderators;

        console.log('---> weibo token : ' + user.auth_token);
        var alToken = user.id + ':' + md5(user.auth_token); // 以后可能会存储更多信息，用 $$$$ 来分隔
        res.cookie(config.auth_cookie_name, alToken, {
            path: '/', 
            maxAge: 1000 * 60 * 60 * 24 * 30, 
            //signed: true, 
            httpOnly: true
        }); //cookie 有效期30天

        if(req.xhr) {
            return res.send(200, {
                success : true,
                user : user
            });
        } else {
            return res.redirect(originalUrl || '/');
        }
    });
};