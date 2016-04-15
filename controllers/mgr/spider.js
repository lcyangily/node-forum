var spiderSvc = loadService('spider');
var S = require('string');
var moment = require('moment');
var request = require('request');
var topicSvc = loadService('topic');
var commparaSvc = loadService('commpara');

module.exports = {
    "/": {
        get: {
            controller : function(req, res, next){
                spiderSvc.getAllSource(function(err, list){
                    res.locals.list = list;
                    next();
                });
            }
        }
    },
    "/sync/:id": {
        get : {
            template : 'mgr/spider/sync',
            controller : function(req, res, next){
                var id = req.params.id;
                res.locals.id = id;

                if(!id) {
                    return errorTip('同步id不正确!');
                }

                commparaSvc.getByAttrCode(1040, id, function(err, paras){
                    if(!paras || paras.length < 1){
                        return errorTip('同步id不存在！');
                    }

                    var p = paras[0];
                    var now = moment().add(-1, 'h');
                    if(p.update_time){
                        var ut = moment(p.update_time);
                        if(now.isBefore(ut)){
                            return errorTip('已经同步，同步间隔时间内，不能再次同步！');
                        }
                    }

                    next();
                });

                function errorTip(msg){
                    return res.render('notify/notify_pop', {
                        error : msg
                    });
                }
            }
        },
        post: {
            template : 'notify/notify_pop',
            controller : function(req, res, next){
                var id = req.params.id;
                var type = req.body.type;
                var offset = req.body.offset;
                var begin = req.body.begin;
                var end = req.body.end;

                if(!id) {
                    return errorTip('同步id不正确!');
                }

                if(type == 2 && Number(offset) < 1){
                    return errorTip('偏移量不正确!');
                }

                if(type == 3 && (!begin || !end)){
                    return errorTip('时间日期不能为空!');
                }

                commparaSvc.getByAttrCode(1040, id, function(err, paras){
                    if(!paras || paras.length < 1){
                        return errorTip('同步id不存在！');
                    }

                    var p = paras[0];
                    var now = moment().add(-15, 'm');
                    if(p.update_time){
                        var ut = moment(p.update_time);
                        if(now.isBefore(ut)){
                            return errorTip('距离上次同步检查时间不能小于15分钟!');
                        }
                    }

                    if(type == 2){
                        spiderSvc.syncOffset(id, offset, function(err, datas){
                            return successTip();
                        });
                    } else if(type == 3) {
                        spiderSvc.syncTimeInterval(id, begin, end, function(err, datas){
                            return successTip();
                        });
                    } else {
                        spiderSvc.syncToday(id, function(){
                            return successTip();
                        });
                    }
                });

                function errorTip(msg){
                    return res.render('notify/notify_pop', {
                        error : msg
                    });
                }

                function successTip(msg){
                    msg = msg ? msg : '同步成功！';
                    return res.render('notify/notify_pop', {
                        success : msg
                    });
                }
            }
        }
    },
    "/auto": {
        get: {
            template : 'notify/notify',
            controller : function(req, res, next){
                spiderSvc.syncOffset('xiandaikuaibao', 30, function(err, datas){
                    console.log('all end err : ' + err);
                    next();
                });
            }
        }
    },
    '/article' : {
        post : {
            template : '',
            controller : function(req, res, next){
                var url = req.body.url;
                var type = req.body.type;

                spiderSvc.test(1, function(err, results){
                    if(results && results.length > 0){
                        for(var i = 0; i < results.length; i++) {
                            console.log('------------> ' + results[i].title + ' time : ' + results[i].time);
                        }
                    }
                    next();
                });
                
            }
        }
    },
    '/string' : {
        get: {
            template : 'notify/notify',
            controller : function(req, res, next){
                topicSvc.getById(40, function(err, topic){
                    var cnt = S(topic.content).stripTags();
                    console.log('-------------> ' + cnt.s);
                    cnt = cnt.truncate(250);
                    console.log('-------------> ' + cnt.s);
                    next();
                });
            }
        }
    },
    '/spider' : {
        get : {
            controller : function(req, res, next){
                var url = req.query.url;
                request({
                    url: url,
                    method: 'GET'//,
                    //headers: headers,
                    //body: ((options.method == "GET") ? "" : post_body)
                }, function(e, r, body) {
                    res.send(body);
                })
            }
        }
    },
    'captcha' : {
        get : {
            controller : function(req, res, next){
                var url = req.query.url;
                request({
                    url: url,
                    method: 'GET'//,
                    //headers: headers,
                    //body: ((options.method == "GET") ? "" : post_body)
                }, function(e, r, body) {
                    res.send(body);
                })
            }
        }
    }
}   