var userSvc  = loadService('user');

module.exports = function(req, res, next) {
    var uid = req.params.uid;
    userSvc.getById(uid, function(err, user){
        res.locals.user = user;
        next(!user ? '用户不存在！' : err);
    });
};