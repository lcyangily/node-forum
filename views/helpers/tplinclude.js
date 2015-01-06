var Handlebars = require('handlebars');
var fs = require('fs');

Handlebars.registerHelper('tplinclude', function(id, file, options){

    var source = Handlebars.partials[file];
    var tpl = '';
    if(source == null) {
        var source = fs.readFileSync('views/' + file + '.html', 'utf8');
        if(!source) {
            new Eror('file is not found : ' + file);
        }
    }

    tpl += '<script id="' + id + '" type="text/x-handlebars" data-file="'+file+'">';
    tpl += source;
    tpl += '</script>';
    return new Handlebars.SafeString(tpl);
});

module.exports = Handlebars;