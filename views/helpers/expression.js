var Handlebars = require('handlebars');

Handlebars.registerHelper({
    eq: function(v1, v2, options){
        if(v1 == v2){
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    },
    ge: function(v1, v2, options){
        if(v1 >= v2){
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    },
    gt: function(v1, v2, options){
        if(v1 > v2){
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    },
    le: function(v1, v2, options){
        if(v1 <= v2){
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    },
    lt: function(v1, v2, options){
        if(v1 < v2){
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    },
    ne: function(v1, v2, options){
        if(v1 != v2){
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    }
})