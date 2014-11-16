var Handlebars = require('handlebars');

Handlebars.registerHelper('calc', function(){
    var slice = [].slice;
    var args = slice.call(arguments, 0, arguments.length - 1);
    var opts = arguments[arguments.length - 1];
    
    var evalStr = args.join('');
    var val = (new Function('return ' + evalStr))();

    //block helper
    if(opts.fn) {
        if(val) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    } else { //normal helper
        return val;
    }
});