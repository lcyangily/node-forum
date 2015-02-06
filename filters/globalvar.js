var commparaSvc  = loadService('commpara');

module.exports = function(req, res, next) {
    commparaSvc.getByCode('MAIN_MENU', function(err, lists){
        if(!res.locals._globalvar){
            res.locals._globalvar = {};
        }
        res.locals._globalvar.mainmenus = lists;
        next();
    });
}