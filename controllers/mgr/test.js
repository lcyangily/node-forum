var spiderSvc = loadService('spider');
var S = require('string');
var request = require('request');
var topicSvc = loadService('topic');

module.exports = {
    "/": {
        get: {
            template : 'notify/notify',
            controller : function(req, res, next){
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
    "/auto": {
        get: {
            template : 'notify/notify',
            controller : function(req, res, next){
                /*spiderSvc.auto(1, function(err, results){
                    console.log('==========>>>> err : ' + err);
                    next();
                });*/

                /*spiderSvc.syncAll('NJQBSHQ', function(err, datas){
                    console.log('all end err : ' + err);
                    next();
                });*/

                /*spiderSvc.syncToday('NJQBSHQ', function(err, datas){
                    console.log('all end err : ' + err);
                    next();
                });*/

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

                spiderSvc.
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