'use strict';
var Handlebars = require('handlebars');
var fs = require('fs');
var getBlocks = function (context, name) {
    var blocks = context._blocks;
    return blocks[name] || (blocks[name] = []);
};

Handlebars.registerHelper({
	extend: function (partial, options) {

		var context = this;
		if(!this._blocks) {
			context = Object.create(this);
			context._blocks = {};
		}
		var template = Handlebars.partials[partial];
		if(!template) {
			var tmplSource = fs.readFileSync("./views/" + partial + '.html', "utf8");
			if(tmplSource) {
				Handlebars.registerPartial(partial, tmplSource);
				template = Handlebars.partials[partial];
			}
		}

		// Partial template required
		if (template == null) {
			throw new Error('Missing layout partial: \'' + partial + '\'');
		}

		// New block context
		//context._blocks = {};

		// Parse blocks and discard output
		options.fn(context);

		// Render final layout partial with revised blocks
		if (typeof template !== 'function') {
			template = Handlebars.compile(template);
		}

		// Compile, then render
		return template(context);
	},

	append: function (name, options) {
		getBlocks(this, name).unshift({
			should: 'append',
			fn: options.fn
		});
	},

	prepend: function (name, options) {
		getBlocks(this, name).unshift({
			should: 'prepend',
			fn: options.fn
		});
	},

	replace: function (name, options) {
		getBlocks(this, name).unshift({
			should: 'replace',
			fn: options.fn
		});
	},

	block: function (name, options) {
		var block = null;
		var retval = options.fn(this);
		var blocks = getBlocks(this, name);
		var length = blocks.length;
		var i = 0;

		var append  = '';
		var prepend = '';
		for (; i < length; i++) {
			block = blocks[i];
			switch (block && block.fn && block.should) {
				case 'append':
					append = append + block.fn(this);
					//retval = retval + block.fn(this);
					break;

				case 'prepend':
					prepend = block.fn(this) + prepend;
					//retval = block.fn(this) + retval;
					break;

				case 'replace':
					retval = block.fn(this);
					break;
				case 'replaceAll' : 
					retval = block.fn(this);
					append = '';
					prepend = '';
					break;
			}
		}

		return prepend + retval + append;
	}
});