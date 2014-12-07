//var approot = process.env.PWD;
var config = require('./../config.js');
var glob = require('glob');
var methods = require('methods');
var fs = require('fs');
var Path = require('path');
var _ = require('lodash');
//var BaseController = require('./BaseController.js')
var ControllerParser = require('./ControllerParser');
var filtersConfig = require('./../filters.config.js');

function initFilters(app, filtersConfig){
    //检查全局的filter配置
    for (var route in filtersConfig) {
        var routeConfig = filtersConfig[route];

        if(_.isArray(routeConfig)) {
            app.all(route, loadFilters(routeConfig));
        } else {
            methods.forEach(function(method) {
                if(routeConfig[method]) {
                    var filters = loadFilters(routeConfig[method]);
                    app[method].apply(app, [route].concat(filters));
                }
            });
        }
    }
}

/**
 * Main function to initialize routers of a Express app.
 *
 * @param  {Express} app  Express app instance
 * @param  {Object} paths (optional) For configure relative paths of
 *                        controllers and filters rather than defaults.
 */
exports.route = function(app, paths) {

    //初始化全局filter
    initFilters(app, filtersConfig.filters);

    paths = paths || {};
    //app.set('views', approot + paths.template);

    var ctrlDir = Path.normalize(config.base_path + (paths.controllers || '/controllers'));
    var fltrDir = Path.normalize(config.base_path + (paths.filters || '/filters'));
    var tplDir  = Path.normalize(config.base_path + (paths.template || '/templates'));

    glob.sync(ctrlDir + '/**/*.+(js|coffee)').forEach(function(file) {

        file = Path.normalize(file);
        //替换掉以/index.js结尾
        file = file.replace(new RegExp('\\' + Path.sep +'index\.(js|coffee)$'), '');
        var router = require(file);
        //var single = typeof router == 'function';
        //替换掉ctrlDir路径,身下类似 /a/b
        var fpath = file.replace(ctrlDir.replace(new RegExp('\\' + Path.sep + '$'), ''), '').replace(/\.(js|coffee)$/, '');
        //var tplPath = tplDir + fpath + '.html';
        /*var isTplExist = fs.existsSync(tplPath);
        var setup = function(req, res, next) {
            req.rb_path = fpath;
        };*/
        for (var i in router) {
            var p = fpath + i;
            if (p != '/') {
                //p = p.replace(ctrlDir, '').replace(new RegExp('\\' + Path.sep + 'index$'), '/');
                p = p.replace(/\/$/, '');
            }
            var r = router[i];
            methods.forEach(function(method) {
                var eachRouter = r[method];
                if (eachRouter) {
                    //var controller = new BaseController(app, eachRouter, p.replace(/^\//, ''), method);
                    //window Path.sep 是 \ 全部替换成 /
                    var routerPath = p.replace(new RegExp('\\' + Path.sep, 'g'), '/');
                    var tplPath = routerPath.replace(/^\//, '');
                    var routers = ControllerParser(eachRouter, tplPath, method);
                    if (eachRouter.rename) {
                        //p = p.replace(controller.name, controller.newName);
                        routerPath = eachRouter.rename;
                    }

                    console.log("route:" + method + ':' + routerPath);
                    app[method].apply(app, [routerPath].concat(routers));
                }
            });
        }

    });

    //初始化全局filters
    initFilters(app, filtersConfig.afterFilters);
};