var Handlebars = require('handlebars');
var S = require('string');

Handlebars.registerHelper('string', function() {
    var ctn = arguments[0];
    var method = arguments[1];
    var args = [].slice.call(arguments, 2, arguments.length-1);
    var opts = arguments[arguments.length -1];
    var sObj = S(ctn || "");
    var sFn = sObj[method];
    var ret;
    if(typeof sFn === 'function') {
        ret = sFn.apply(sObj, args);
        if(ret && ret.s) {
            return ret.s;
        }
    }

    return sFn;//length ... 
});

module.exports = Handlebars;