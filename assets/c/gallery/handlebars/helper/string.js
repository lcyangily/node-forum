define(function(require, exports, module) {
    var Handlebars = require('handlebars');

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
        }
    });

    return Handlebars;
});