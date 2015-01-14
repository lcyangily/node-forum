var _ = require('lodash');
var Weibo = require('./weibo');
var Weixin = require('./weixin');
var QQ = require('./qq');

var Auth = {
    Weibo : Weibo,
    Weixin : Weixin,
    QQ : QQ,

    get : function(type){
        type = (""+type).toLowerCase();
        var ret = null;
        _.each(Auth, function(val, key){
            key = (""+key).toLowerCase();
            if((key == type) && _.isFunction(val) && key != 'get') {
                ret = val;
                return false;
            }
        });
        return ret;
    }
};

module.exports = Auth;