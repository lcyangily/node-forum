module.exports = function(req, res, next) {
    if (req.session.user && req.session.user.is_block) {
        return res.send('您被屏蔽了。');
    }
    next();
};