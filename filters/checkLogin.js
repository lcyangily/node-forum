module.exports = function(req, res, next) {
    console.log('checklogin filter');
    if (!req.session || !req.session.user) {
        if(req.xhr()){
            return res.send(403, 'forbidden!');
        } else {
            return res.render('login', {error : '您尚未登录'});
        }
        //return res.send(403, 'forbidden!');
    }
    next();
};