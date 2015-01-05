define(function(require, exports, module) {
    var Handlebars = require('hbs');

    Handlebars.registerHelper({
        'abbreviate' : function(v1, v2, options) {
            v2 = v2 - 0;
            var ellipsis = '...';
            if (v1.length > v2) {
                return v1.slice(0, v2 - ellipsis.length) + ellipsis;
            } else {
                return v1;
            }
        },
        // 功能同StringHelpers里的stripTags，处理HTML标签
        'stripTags' : function(v1, options) {
            return v1.replace(/<(?:.|\s)*?>/g, "");
        },
        // 功能同StringHelpers里的replace_，用于替换
        'replace_' : function(v1, v2, v3, options) {
            return v1.replace(new RegExp(v2, 'g'), v3);
        },
        'byteSub' : function(str, len){
            var strlen = 0;
            var s = "";
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 128) {
                    strlen += 2;
                } else {
                    strlen++;
                }
                s += str.charAt(i);
                if (strlen >= len) {
                    if(i+1 != str.length) {
                        str += '...';
                    }
                    break;
                }
            }
            return s;
        }
    });

    return Handlebars;
});