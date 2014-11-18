define(function(require, exports, module){
    var $ = require('jquery+'),
        scrollx = require('sib.slide.scrollx');

    var scrolly = $.extend({}, scrollx, {
        options : {
            fixHeight : true //高度会自动设置，防止panel高度是100%的情况，如果设置了panel的高度为具体数指，而不是百分比，可设置成false
        },
        initScroll : function(  oChoose ){
            var state = oChoose.state,
                $panels = state.$panels,
                $body = state.$body,
                opts = state.options,
                eOpts = state.effectOptions;

            if(eOpts.fixHeight) {
                $panels.outerHeight($body.parent().height()/opts.colspan);
                $body.parent().resize(function(){
                    $panels.outerHeight($body.parent().height()/opts.colspan);
                });
            }
            //设置高度
            $body.css('height', '10000000px');
        },
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
        },
        fixPreCarousel : function( oSlide ){
            var state = oSlide.state,
                $body = state.$body, 
                $panels = state.$panels,
                opts = state.options;

            $body.css('top', -1*$panels.eq(state.activeIndex).position().left);
        },
        fixNextCarousel : function( oSlide ){
            var state = oSlide.state,
                $body = state.$body, 
                $panels = state.$panels,
                opts = state.options;

            $body.css('top', -1*$panels.eq(state.activeIndex).position().top);
        }
    });

    return scrolly;
});
