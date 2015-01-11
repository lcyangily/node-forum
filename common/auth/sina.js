var querystring = require('querystring');
var https = require('https');
var path = require("path");
var fs = require('fs');
var _ = require("lodash");
var request = require('request');
var FormData = require('form-data');
var snserror = require("snserror");
var config = require('../../config');

//一些API特殊属性
var apisParam = {
    'statuses/upload' : {
        multi : true
    },
    'oauth2/authorize' : {
        API_URI_PREFIX: '',
        API_URI_SUFFIX : ''
    },
    'oauth2/access_token' : {
        API_URI_PREFIX: '',
        API_URI_SUFFIX : ''
    }
};

var Weibo = function(options) {
    this.options = {
        app_key: null,
        app_secret: null,
        access_token: null,
        user_id: 0,
        refresh_token: null,
        redirect_uri: "",
        api_group: [],
        scope: ""
    };
    _.extend(this.options, config.auth.sina, options);
}

//static attr
_.extend(Weibo, {
    API_BASE_URL: 'https://api.weibo.com/',
    API_URI_PREFIX: '2/',
    API_URI_SUFFIX : '.json'
});

//获取登录URL
Weibo.prototype.getAuthUrl = function(){
    var options = {
        client_id: this.options.app_key,
        redirect_uri: this.options.redirect_uri,
        response_type: 'code',
        state: null,
        display: 'default',
        forcelogin: this.options.forcelogin || "false"
    };
    return Weibo.API_BASE_URL + 'oauth2/authorize?' + querystring.stringify(options);
}

//直接重定向到登录URL
Weibo.prototype.authorize = function(cb){
    this.post('oauth2/authorize', {
        client_id: this.options.app_key,
        redirect_uri: this.options.redirect_uri,
        response_type: 'code',
        state: null,
        display: 'default',
        forcelogin: this.options.forcelogin || "false"
    }, cb);
}

//用authorize的回调code 获取 accesstoken
Weibo.prototype.accesstoken = function(code, cb){
    var options = {
        grant_type: "authorization_code",
        code: code,
        client_id: this.options.app_key,
        client_secret: this.options.app_secret,
        redirect_uri: this.options.redirect_uri
    };

    this.post('oauth2/access_token', options, cb);
}

/** api 通用调用方法 **/
Weibo.prototype.post = function(url, options, callback) {
    /*if(_.indexOf(apis, url) <= 0){
        return callback('请求URL : ' + url + ' 不可用！');
    }*/
    var apiParam = apisParam && apisParam[url];
    var param = _.extend({}, Weibo, apiParam || {});
    var nurl = param.API_BASE_URL + param.API_URI_PREFIX + url + param.API_URI_SUFFIX;//+ '.json';

    //POST表单内容上传
    if(apiParam && apiParam.multi) {
        var form = new FormData();
        for (var i in options) {
            if (i == "pic") {
                try {
                    form.append('pic', fs.createReadStream(options[i]));
                } catch (e) {
                    callback(e)
                }

            } else {
                form.append(i, options[i].replace(/__multi__/g, ""));
            }
        };
        console.log(options)
        form.submit(nurl, function(err, res) {
            var chunks = [];
            var size = 0;
            res.on("data", function(chunk) {
                chunks.push(chunk);
                size += chunk.length;
            })
            res.on("end", function() {
                switch (chunks.length) {
                    case 0:
                        data = new Buffer(0);
                        break;
                    case 1:
                        data = chunks[0];
                        break;
                    default:
                        data = new Buffer(size);
                        for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                            chunks[i].copy(data, pos);
                            pos += chunks[i].length;
                        }
                        break;
                }
                var e = null;
                var body = data.toString();
                try {
                    body = JSON.parse(body)
                    if (body.error) {
                        e = new Error(snserror.sina[body.error_code] ? snserror.sina[body.error_code].cn : body.error)
                    }
                } catch (error) {
                    e = error;
                }
                callback && callback(e, body);
            })
            res.on("close", function(data) {
                callback(new Error("connetion closed"), data.toString())
            })
        });
    } else {
        var post_body = querystring.stringify(options);
        var headers = {};
        headers["Content-Type"] = 'application/x-www-form-urlencoded';

        if (options.method) {
            options.method = options.method.toUpperCase()
        }
console.log('url : ' + nurl + ((options.method == "GET") ? ("?" + post_body) : ""));
console.log('body : ' + post_body);
console.log('method : ' + options.method);
        request({
            url: nurl + ((options.method == "GET") ? ("?" + post_body) : ""),
            method: options.method || "POST",
            headers: headers,
            body: ((options.method == "GET") ? "" : post_body)
        }, function(e, r, body) {
console.log('-----> e : ' + e); 
console.log('-----> r : ' + JSON.stringify(r)); 
console.log('-----> body : ' + body); 
            if (!e) {
                try {
                    body = JSON.parse(body)
                    if (body.error) {
                        e = new Error(snserror.sina[body.error_code] ? snserror.sina[body.error_code].cn : body.error)
                    }
                } catch (error) {
                    e = error;
                }
            }
            callback && callback(e, body)
        })
    }
};

module.exports = Weibo;