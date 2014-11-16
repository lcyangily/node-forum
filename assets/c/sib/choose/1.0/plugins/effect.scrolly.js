define(function(require, exports, module){
    var $ = require('../../../core/1.0/jQuery+'),
        scrollx = require('./effect.scrollx');

    var scrolly = $.extend({}, scrollx, {

        initScroll : function(  oChoose ){},
        switchEffect : function(oChoose, index){
            var state = oChoose.state,
                opts = state.options,
                $panels = state.$panels,
                $body = state.$body,
                $to = $panels.eq(index),
                self = this;

            state.anim = $body.animate({
                top : -1*$to.position().top + 'px'
            }, opts.duration, opts.easing, function () {
                state.anim = null;
                if(opts.bodyAutoSize) $body.parent().width($to.outerWidth());
                self.afterChange(oChoose, index);
            });
        }
    });

    return scrolly;
});
