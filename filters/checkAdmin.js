module.exports = function(req, res, next) {
    console.log('checkAdmin filter');
    if (!req.session.user) {
        return res.render('notify/notify', {error: '你还没有登录。'});
    }
    if (!req.session.user.is_admin) {
        return res.render('notify/notify', {error: '管理员才能编辑标签。'});
    }
    next();
};