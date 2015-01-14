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
    'oauth2.0/token' : {
        backDataType : 'querystring'
    }
};

var QQ = function(options) {
    this.options = {
        app_id: null,
        app_secret: null,
        access_token: null,
        user_id: 0,
        refresh_token: null,
        redirect_uri: "",
        api_group: [],
        scope: ""
    };
    _.extend(this.options, config.auth.qq, options);
}

//static attr
_.extend(QQ, {
    API_BASE_URL: 'https://graph.qq.com/',
    API_URI_PREFIX: '',
    API_URI_SUFFIX : ''
});

//获取登录URL
QQ.prototype.getAuthUrl = function(){
    var options = {
        client_id: this.options.app_id,
        redirect_uri: this.options.redirect_uri,
        response_type: 'code',
        state: null,
        display: 'default',
        forcelogin: this.options.forcelogin || "false"
    };
    return QQ.API_BASE_URL + 'oauth2.0/authorize?' + querystring.stringify(options);
}

//直接重定向到登录URL
QQ.prototype.authorize = function(cb){
    this.post('oauth2.0/authorize', {
        client_id: this.options.app_id,
        redirect_uri: this.options.redirect_uri,
        response_type: 'code',
        state: null,
        display: 'default',
        forcelogin: this.options.forcelogin || "false"
    }, cb);
}

//将获取access_token 和 openid(uid) 打包一起获取
QQ.prototype.getAccessToken = function(code, cb) {
    var self = this;
    self._getAccessToken(code, function(err, data){
        if(err) return cb(err);
        self._getOpenId(data.access_token, function(err, d){
            cb(err, data);
        });
    });
}

//用authorize的回调code 获取 accesstoken
QQ.prototype._getAccessToken = function(code, cb){
    var self = this;
    var options = {
        method : 'get',
        grant_type: "authorization_code",
        code: code,
        client_id: this.options.app_id,
        client_secret: this.options.app_secret,
        redirect_uri: this.options.redirect_uri
    };

    this.post('oauth2.0/token', options, function(err, data){
        self.options.access_token = data.access_token;
        self.options.expires_in = data.expires_in;
        self.options.refresh_token = data.refresh_token;
        self.options.uid = data.uid = data.openid;

        if(data.code) {
            err = new Error(data.msg || ('错误编码：' + data.code));
        }
        cb(err, data);
    });
}

QQ.prototype._getOpenId = function(accesstoken, cb){
    var self = this;
    var options = {
        method : 'get',
        access_token : accesstoken
    };

    this.post('oauth2.0/me', options, function(err, data){
        self.options.openid = data.openid;
        if(data.code) {
            err = new Error(data.msg || ('错误编码：' + data.code));
        }
        cb(err, data);
    });
}

/** api 通用调用方法 **/
QQ.prototype.post = function(url, options, callback) {
    /*if(_.indexOf(apis, url) <= 0){
        return callback('请求URL : ' + url + ' 不可用！');
    }*/
    var apiParam = apisParam && apisParam[url];
    var param = _.extend({}, QQ, apiParam || {});
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
                    if(body.indexOf('callback') === 0){
                        var findex = body.indexOf('(');
                        var lindex = body.lastIndexOf(')');
                        body = body.substring(findex+1, lindex);
                    }
console.log('-----> body : ' + body); 
                    if(param.backDataType == 'querystring') {
                        body = querystring.parse(body)
                    } else {
                        body = JSON.parse(body);
                    }
                    
                    if (body.ret) {
                        e = new Error(body.msg || ('错误编码：' + body.ret));
                    }
                    if(body.error) {
                        e = new Error(body.error_description || ('错误编码：' + body.error));
                    }
                } catch (error) {
                    e = error;
                }
            }
            callback && callback(e, body)
        })
    }
};

module.exports = QQ;