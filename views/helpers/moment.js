var Handlebars = require('handlebars');
var moment = require('moment');

Handlebars.moment = moment;

Handlebars.registerHelper('moment', function(dateOrig) {
    var m;
    var opts = arguments[arguments.length - 1];
    if(dateOrig === 'now' || dateOrig === '') {
        m = moment();
    } else {
        m = moment(dateOrig);
    }

    if('mix' in opts.hash){
        var mNow = moment();
        var mix = opts.hash.mix || 4;
        mNow.add(mix * -1, 'd'); 
        if(mNow.isBefore(m)){
            return m.fromNow();
        } else { 
            return m.format(opts.hash.format || 'YYYY-MM-DD');
        }
    } else if('format' in opts.hash) {
        return m.format(opts.hash.format);
    } else if('fromNow' in opts.hash) {
        return m.fromNow(opts.hash.fromNow);
    } else if('calendar' in opts.hash) {
        return m.calendar(opts.hash.calendar);
    }

    return m.format();
});

module.exports = Handlebars;