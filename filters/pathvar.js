module.exports = function(req, res, next) {
    res.locals._pathvar = req.query;
    next();
}