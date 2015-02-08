var config = require('../config');

// 发帖时间间隔，为毫秒
var POST_INTERVAL = config.post_interval;
if (!(POST_INTERVAL > 0)) POST_INTERVAL = 0;
var DISABLE_POST_INTERVAL = POST_INTERVAL > 0 ? false : true;

/**
 * 表单提交时间间隔限制
 */
module.exports = function(req, res, next) {
    if (DISABLE_POST_INTERVAL) return next();

    if (!isNaN(req.session.lastPostTimestamp) && 
        (Date.now() - req.session.lastPostTimestamp < POST_INTERVAL)) {
        var ERROR_MSG = '重复提交或操作太频繁，请稍后再试。';
        return res.render('notify/notify', {
            error: ERROR_MSG
        });
    }

    req.session.lastPostTimestamp = Date.now();
    next();
};