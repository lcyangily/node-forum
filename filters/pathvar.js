var userSvc  = loadService('user');
var md5 = require('MD5');
var config = require('../config');

module.exports = function(req, res, next) {
    res.locals._pathvar = req.query;
    next();
}