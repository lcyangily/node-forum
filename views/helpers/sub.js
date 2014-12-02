var fs = require('fs');
var Handlebars = require('handlebars');

Handlebars.registerHelper("sub", function(partial, options){
    var tmpl = Handlebars.partials[partial];
    if(tmpl == null) {
        var source = fs.readFileSync('views/' + partial + '.html', 'utf8');
        if(source != null) {
            Handlebars.registerPartial(partial, source);
            tmpl = Handlebars.partials[partial];
        } else {
            new Eror('partial is not found : ' + partial);
        }
    }
    //options.fn(this);
    var ctx = Object.create(this);
    for(var i in options.hash) {
        ctx[i] = options.hash[i];
    }
    if (typeof tmpl !== 'function') {
        tmpl = Handlebars.compile(tmpl);
    }
    return new Handlebars.SafeString(tmpl(ctx, options));
});

exports = Handlebars;