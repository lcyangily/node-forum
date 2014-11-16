define(function(require, exports, module){
    var Handlebars = require('handlebars');

    Handlebars.registerHelper({
        calc : function() {
            var slice = [].slice;
            var args = slice.call(arguments, 0, arguments.length - 1);
            var opts = arguments[arguments.length - 1];
            
            var evalStr = args.join('');
            var val = (new Function('return ' + evalStr))();
        
            var fixed = opts.hash.fixed || 0;
        
            return val.toFixed(fixed);
        },
        'if-calc' : function(){
            var slice = [].slice;
            var args = slice.call(arguments, 0, arguments.length - 1);
            var opts = arguments[arguments.length - 1];
            
            var evalStr = args.join('');
            var val = (new Function('return ' + evalStr))();

            if(val) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        'eq' : function(v1, v2, options){
            if(v1 == v2){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        },
        'gt' : function(v1, v2, options) {
            if(v1 > v2){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        },
        'ge' : function(v1, v2, options){
            if(v1 >= v2){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        },
        'le': function(v1, v2, options) {
            if(v1 <= v2){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        },
        'lt' : function(v1, v2, options){
            if(v1 < v2){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        },
        'ne' : function(v1, v2, options){
            if(v1 != v2){
                return options.fn(this);
            } else {
                //不满足条件执行{{else}}部分
                return options.inverse(this);
            }
        }
    });

    return Handlebars;
});