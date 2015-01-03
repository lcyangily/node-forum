define(function(require, exports, module){
    var Handlebars = require('hbs');
    var moment = require('moment');

    Handlebars.registerHelper({
        moment : function(dateOrig) {
            var m;
            var opts = arguments[arguments.length - 1];
            if(dateOrig === 'now' || dateOrig === '') {
                m = moment();
            } else {
                m = moment(dateOrig);
            }

            if('format' in opts.hash) {
                return m.format(opts.hash.format);
            } else if('fromNow' in opts.hash) {
                return m.fromNow(opts.hash.fromNow);
            } else if('calendar' in opts.hash) {
                return m.calendar(opts.hash.calendar);
            }

            return m.format();
        }
    });
    return Handlebars;
});