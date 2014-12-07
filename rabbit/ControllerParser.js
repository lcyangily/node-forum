var config = require('./../config.js')
var Path = require('path')
var filtersConfig = require('./../filters.config.js')
var _ = require('underscore')

var parser = function(orig, path, method){
    
    var filters = [];

    //检查全局的filter配置
    /*for (var route in filtersConfig) {
        var reg = new RegExp(route);
        var routeConfig = filtersConfig[route];
        for (var _method in routeConfig) {
            if (_method == method) {
                if (reg.test('/' + path)) {
                    filters = filters.concat(loadFilters(routeConfig[_method]));
                }
            }
        }
    }*/

    if(_.isFunction(orig)) {
        filters.push(orig);
    } else if(orig) {
        filters = filters.concat(loadFilters(orig.filters));
        if(_.isFunction(orig.controller)){
            filters.push(orig.controller);
        }
        filters = filters.concat(loadFilters(orig.afterFilters));

        //配置了默认模板
        if(orig.template) {
            filters.push(function(req, res, next){
                res.render(orig.template)
            });
        }
    }

    //如果都没有则进入约定的模板（文件路径）
    filters.push(function(req, res, next){
        var viewPath = path;
        if('/' == path) {
            viewPath = 'index';
        }
        res.render(viewPath)
    });
    //console.log('-----> ControllerParser.filters : ' + filters);
    return filters.length ? filters : null;
}

module.exports = parser;