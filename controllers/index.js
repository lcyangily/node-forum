/*module.exports = {
    "/": {
        get: function() {
            return function(req, res, next) {
                res.render('index');
            }
        }
    }
}*/

module.exports = {
    "/": {
        get: {
            template : 'index/index',
            controller : function(req, res, next) {
                next();
            }
        }
    }
}