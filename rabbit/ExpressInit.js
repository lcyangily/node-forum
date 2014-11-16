var app, config, express, http, less, lessmiddle, log4js, path, rainbow;
http = require('http');
path = require('path');
config = require('./../config.js');
rainbow = require('./rainbow.js');

var consolidate = require('consolidate');
var Handlebars  = require('handlebars');
require('./registerHbsInfo');


log4js = require('log4js');
express = require('express');
module.exports = function(app) {
    app.configure(function() {
        var logger;
        app.set('port', config.run_port);
        //模板所在路径
        app.engine('html', consolidate.handlebars);
        app.set('views', path.join(config.base_path, config.view_dir));
        app.set('view engine', 'html');

        app.use(express.favicon());


        app.use('/assets', express['static'](config.base_path + '/assets'));
        app.use('/uploads', express['static'](config.base_path + '/uploads'));
        //日志支持
        log4js.configure({
            appenders: [{
                type: 'console'
            }]
        });
        logger = log4js.getLogger('normal');
        logger.setLevel('INFO');
        app.use(log4js.connectLogger(logger, {
            level: log4js.levels.INFO
        }));

        //cookie session postbody支持
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.cookieSession({
            secret: config.session_secret
        }));
        app.use(express.methodOverride());

        //rainbow配置
        rainbow.route(app, config.rainbow);
        //404处理
        app.all('*', function(req, res, next) {
            return res.render('404');
        });
        //所有错误的集中处理，在任何route中调用next(error)即可进入此逻辑
        app.use(function(err, req, res, next) {
            console.trace(err);
            return res.render('502', {
                error: err
            });
        });
        //给模板引擎设置默认函数，例如时间显示moment
        app.locals.moment = require('moment');
        app.locals.moment.lang('zh-cn');
        //静态资源头，本地开发用本地，线上可以用cdn
        app.locals.assets_head = config.assets_head;
    });

    app.configure('development', function() {
        app.use(express.errorHandler());
        app.use(express.logger('dev'));
    });
}