var fs = require('fs');
var Handlebars  = require('handlebars');
var config = require('./../config');
var Path = require('path');
var glob = require('glob');

var partialsDir = Path.join(config.base_path, config.view_dir, 'partials');
var helpersDir  = Path.join(config.base_path, config.view_dir, 'helpers');

//reigster Partial
/*fs.readdirSync(partials).forEach(function (file) {
  var source = fs.readFileSync(partials + file, "utf8"),
    partial = /(.+)\.html/.exec(file).pop();
    Handlebars.registerPartial(partial, source);
});*/

glob.sync(helpersDir + '/**/*.+(js|coffee)').forEach(function(file) {
    require(file);
})

var jsonHelper = require('hbs-json');
Handlebars.registerHelper('json', jsonHelper);