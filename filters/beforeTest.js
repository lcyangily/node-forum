module.exports = function(req, res, next) {
    console.log('-------> before filter');
    next();
};