var config = require('./../config.js')
var Path = require('path')
var filtersConfig = require('./../filters.config.js')
var _ = require('underscore')

var parser = function(orig, path, method){
    
    var filters = [];

    //检查全局的filter配置
    for (var route in filtersConfig) {
        var reg = new RegExp(route);
        var routeConfig = filtersConfig[route];
        for (var _method in routeConfig) {
            if (_method == method) {
                if (reg.test('/' + path)) {
                    filters = filters.concat(getFilters(routeConfig[_method]));
                }
            }
        }
    }

    if(_.isFunction(orig)) {
        filters.push(orig);
    } else if(orig) {
        filters = filters.concat(getFilters(orig.filters));
        if(_.isFunction(orig.controller)){
            filters.push(orig.controller);
        }
        filters = filters.concat(getFilters(orig.afterFilters));

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

function getFilters(filters) {
    var f = [];
    if(!filters) {
        return f;
    }
    if(_.isString(filters)) {
        filters = [filters];
    }

    filters.forEach(function(filter_path) {
        f.push(require(Path.join(config.base_path, config.rainbow.filters, filter_path)))
    });

    return f;
}

module.exports = parser;