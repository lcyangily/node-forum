var cheerio = require('cheerio');
var request = require('request');
var async   = require('async');
//var he      = require('he');
var moment  = require('moment');
var parseString  = require('xml2js').parseString;
var topicSvc  = loadService('topic');
var Topic  = new BaseModel('forum_topic');
var Commpara  = new BaseModel('commpara');
var commparaSvc  = loadService('commpara');

exports.getAllSource = function(cb){
    commparaSvc.getByAttr(1040, function(err, list){
        return cb && cb(err, list);
    });
}

//同步今天的数据
exports.syncToday = function(key, callback){
    var begin = moment().startOf('day');
    var end = moment().endOf('day');

    this.syncTimeInterval(key, begin, end, callback);
}

//同步所有数据（全量）
exports.syncAll = function(key, callback){
    var self = this;
    commparaSvc.getByAttrCode(1040, key, function(err, paras){
        if(err) return callback && callback(err);
        var p = paras && paras[0];
        if(p && p.param_value) {
            self._syncAll(p.param_value, 1, key, function(err){
                callback && callback(err);
            });
        }
    });
}

exports._syncAll = function(url, page, key, callback){
    var self = this;
    this.getArticleList(url, page, function(err, results, pageInfo){
        if(err) return callback && callback(err);
        
        //console.log('---------------------> pageInfo : ' + JSON.stringify(pageInfo) );
        //if(pageInfo.page < 2){
        self._db(key, results, function(err, rs){
            if(pageInfo.page < pageInfo.total) {
                self._syncAll(url, page + 1, key, callback);
            } else {
                return callback && callback();
            }
        });
    });
}

//同步offset 天内的数据
exports.syncOffset = function(key, offset, callback){
    offset = offset > 0 ? offset * -1 : offset;
    var begin = moment().add(offset, 'day').startOf('day');
    var end = moment().endOf('day');

    this.syncTimeInterval(key, begin, end, callback);
}

//同步时间区间内的数据
exports.syncTimeInterval = function(key, begin, end, callback){

    begin = getMoment(begin);
    end = getMoment(end);
//console.log('----> begin : ' + begin.format('YYYY-MM-DD HH:mm:ss'));
//console.log('----> end : ' + end.format('YYYY-MM-DD HH:mm:ss'));

    var self = this;
    commparaSvc.getByAttrCode(1040, key, function(err, paras){
        if(err) return callback && callback(err);
        var p = paras && paras[0];
        if(p && p.param_value) {
            self._refreshUpdateTime(key);
            self._syncTimeInterval(p.param_value, 1, key, begin, end, false, callback);
        } else {
            return callback && callback('抓取页面url未配置。');
        }
    });
    
    function getMoment(m){
        if(moment.isMoment(m)) return m;
        return moment(m);
    }
}

//检查时间，不管本次有没有同步到数据，每次检查的时间
exports._refreshUpdateTime = function(key, callback){
    Commpara.clean().update({
        update_time : new Date()
    }).where({
        sys_code : 'SYS',
        param_attr : 1040,
        param_code : key
    }).done(function(err, c){
        callback && callback(err, c);
    });
}

//已经同步到数据的时间
exports._refreshSyncTime = function(key, callback){
    Commpara.clean().update({
        param_20 : moment().format('YYYY-MM-DD HH:mm:ss')
    }).where({
        sys_code : 'SYS',
        param_attr : 1040,
        param_code : key
    }).done(function(err, c){
        callback && callback(err, c);
    });
}

exports._syncTimeInterval = function(url, page, key, begin, end, hasData, callback){
    var self = this;
    this.getArticleList(url, page, function(err, results, pageInfo){
        if(err) return callback && callback(err);

        var stop = false;
        results = _.filter(results, function(item){
            if(item && item.time) {
                var time = moment(item.time, 'YYYY-MM-DD');
                if(time.isAfter(end)) {
                    return false;
                } else if(time.isBefore(begin)) {
                    stop = true;
                    return false;
                } else {
                    return true;
                }
            }
            return false;
        });

        if(results && results.length){
            hasData = true;
        }
        // if(!results || !results.length) {
        //     return callback && callback();
        // }
        self._db(key, results, function(err, rs){
            if(pageInfo.page < pageInfo.total && !stop) {
                self._syncTimeInterval(url, page + 1, key, begin, end, hasData, callback);
            } else {
                //本次检查完成，可能今天的数据还未发布所有未同步数据，也可能本次同步了今天数据
                if(hasData){
                    self._refreshSyncTime(key);
                }
                return callback && callback();
            }
        });
    });
}

exports._db = function(key, results, callback){
    if(!results || !results.length) {
        return callback && callback();
    }
    commparaSvc.getByAttrCode(1040, key, function(err, paras){
        if(err) return callback && callback(err);
        if(!paras || !paras.length) return callback && callback('配置不存在！');
        var cfg = {};
        var p = paras && paras[0];

        cfg.fid = p.param_3;
        cfg.ftype_id = p.param_4 || -1;
        cfg.author_id = p.param_2;
        cfg.source = p.param_name;

        if(!cfg || !cfg.author_id || !cfg.fid) {
            return callback('缺少必要参数：作者或者论坛id');
        }

        var seriesArr = [];
        _.each(results, function(result){
            seriesArr.push(function(cb){
                var $cnt = result.$cnt;

                for(var i = 5; i <= 20; i++) {
                    var script = p['param_'+i];
                    if(script) {
                        try {
                            var func = new Function('return ' + script);
                            func.call($cnt);
                        } catch(e) {
                            console.log('-------> error : ' + e);
                        }
                    } else {
                        break;
                    }
                }
                var cnt = $cnt.html();
                Topic.find().where({
                    source_url : result.url
                }).done(function(err, topic){
                    if(!err && !topic) {
                        var createTime = moment(result.time, 'YYYY-MM-DD').toDate();
                        topicSvc.add({
                            title : result.title,
                            content : cnt,
                            fid : cfg.fid,
                            ftype_id : cfg.ftype_id,
                            author_id : cfg.author_id,
                            create_time : createTime,
                            last_reply_time : createTime,
                            source : cfg.source,
                            source_url : result.url
                        }, function(err, topic){
                            cb(null);
                        });
                    } else {
                        console.log('已存在，直接忽略。。。 ');
                        cb(null);
                    }
                });
            });
        });

        async.series(seriesArr, function(err, results){
            callback && callback(err, results);
        });
    });
}

exports.getArticleList = function(url, page, callback){
    var self = this;
    var furl = url + page + '&t=' + Date.now();
console.log('--------------> furl : ' + furl);
    request({
        url: furl,
        method: 'GET'//,
        //headers: headers,
        //body: ((options.method == "GET") ? "" : post_body)
    }, function(e, r, body) {
        console.log('--------------> e : ' + e);
        console.log('--------------> body : ' + body);
        console.log('========================================');
        console.log('========================================');
        console.log('========================================');
        console.log('========================================');
        var hello = new Function('return this.' + body);
        var data = hello.apply(self);
        self.parseArticleList(data, callback);
    })
}

exports.hello = function(data, callback){
    return data;
}


exports.parseArticleList = function(data, callback){
    var items = data.items,
        page = data.page,
        total = data.totalPages,
        pageObj = {
            page : page,
            total : total
        };
    var self = this;
    if(items && items.length>0){
        var arr = [];
        for(var i=0;i<items.length;i++){
            //if(i > 0) continue;
            var $ = cheerio.load(items[i], {
                xmlMode : true
            });

            var url = $('item display url').text();
            if(url) {
                arr.push(url);
            }
        }

        if(arr && arr.length > 0) {
            var seriesArr = [];
            _.each(arr, function(url){
                seriesArr.push(function(cb){
                    self.getArticle(url, function(e, data){
                        cb(null, data);
                    });
                });
            });

            async.series(seriesArr, function(err, results){
                callback && callback(err, results, pageObj);
            });
        } else {
            callback && callback(null, null, pageObj);
        }
    } else {
        //console.log('没有数据。。。');
        return callback && callback(null, null, pageObj);
    }
}


exports.getArticle = function(url, cb){

    request.get(url, function(e, r, body){
        if(e) {
            return cb && cb(e);
        }
        var $ = cheerio.load(body, {
            decodeEntities: false
        });
        var title = $('#activity-name').eq(0).text();
        var $cnt = $('#js_content');
        var time = $('#post-date').text();

        return cb && cb(null, {
            title : title,
            time : time,
            $cnt : $cnt,
            url : url
        });
    });
}
