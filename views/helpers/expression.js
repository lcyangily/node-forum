var Handlebars = require('handlebars');

Handlebars.registerHelper({
    eq: function(v1, v2, options){
        var ret = v1 == v2;
        if(options.fn) {
            if(ret){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    },
    ge: function(v1, v2, options){
        var ret = v1 >= v2;
        if(options.fn) {
            if(ret){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    },
    gt: function(v1, v2, options){
        var ret = v1 > v2;
        if(options.fn) {
            if(ret){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    },
    le: function(v1, v2, options){
        var ret = v1 <= v2;
        if(options.fn) {
            if(ret){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    },
    lt: function(v1, v2, options){
        var ret = v1 < v2;
        if(options.fn) {
            if(ret){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    },
    ne: function(v1, v2, options){
        var ret = v1 != v2;
        if(options.fn) {
            if(ret){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    },
    and : function(){
        var options = arguments[arguments.length - 1];
        var ret;
        var len = arguments.length -1;
        var i = 1;
        if(len > 0) {
            ret = arguments[0];
            while(i < len) {
                ret = ret && arguments[i];
                i++;
            }
        } else {
            ret = false;
        }

        if(options.fn) {
            if(ret) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    },
    or : function(){
        var options = arguments[arguments.length - 1];
        var ret;
        var len = arguments.length -1;
        var i = 1;
        if(len > 0) {
            ret = arguments[0];
            while(i < len) {
                ret = ret || arguments[i];
                i++;
            }
        } else {
            ret = false;
        }

        if(options.fn) {
            if(ret) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        } else {
            return ret;
        }
    }
})