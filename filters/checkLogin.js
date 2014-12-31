module.exports = function(req, res, next) {
    console.log('checklogin filter');
    if (!req.session || !req.session.user) {
        if(req.xhr){
            return res.send(403, '__requiredLogin-noLogin');
        } else {
            return res.render('login/login', {
                originalUrl : req.originalUrl,
                error : '您尚未登录'
            });
        }
        //return res.send(403, 'forbidden!');
    }
    next();
};