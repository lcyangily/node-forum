define(function(require, exports, module){
    var $ = require('jquery+');

    var scrollx = {
        options : {
            fixWidth : true //宽度会自动设置
        },
        init : function( oChoose ){
            var state = oChoose.state,
                $panels = state.$panels,
                $body = state.$body;

            $panels.show();
            // 设置定位信息，为滚动效果做铺垫
            $body.css('position', 'relative');

            // 注：content 的父级不一定是 container
            if ($body.parent().css('position') === 'static') {
                $body.parent().css('position', 'relative');
            }
            this.initScroll( oChoose );
        },
        initScroll : function( oChoose ){
            var state = oChoose.state,
                $panels = state.$panels,
                $body = state.$body,
                opts = state.options,
                eOpts = state.effectOptions;
            $panels.css('float', 'left');
            if(eOpts.fixWidth) {
                $panels.outerWidth($body.parent().width()/opts.colspan);
                $body.parent().resize(function(){
                    $panels.outerWidth($body.parent().width()/opts.colspan);
                });
            }
            // 设置最大宽度，以保证有空间让 panels 水平排布
            $body.width('10000000px');
        },
        switchPanel : function( oChoose, index ){
            var state = oChoose.state;
            if (state.anim) {
                state.anim.stop();
            }
            this.switchEffect(oChoose, index);
        },
        switchEffect : function(oChoose, index){
            var state = oChoose.state,
                opts = state.options,
                $panels = state.$panels,
                $body = state.$body,
                $to = $panels.eq(index),
                self = this;

            state.anim = $body.animate({
                left : -1*$to.position().left + 'px'
            }, opts.duration, opts.easing, function () {
                state.anim = null;
                if(opts.bodyAutoSize) $body.parent().height($to.outerHeight());
                self.afterChange(oChoose, index);
            });
        },
        afterChange : function(oChoose, index){
            var state = oChoose.state,
                opts = state.options,
                $triggers = state.$triggers,
                $panels = state.$panels;

            oChoose._trigger('afterChange', null, {
                oldVal : {
                    triggerIndex : oChoose._getTriggerIndex(state.activeIndex),
                    panelIndex : state.activeIndex,
                    trigger : $triggers.eq(oChoose._getTriggerIndex(state.activeIndex))[0], 
                    panel : $panels.eq(state.activeIndex)[0]
                },
                newVal : {
                    triggerIndex : oChoose._getTriggerIndex(index),
                    panelIndex : index,
                    trigger : $triggers.eq(oChoose._getTriggerIndex(index))[0], 
                    panel : $panels.eq(index)[0]
                }
            });
        },
        supportCirculate : true,
        fixPreCarousel : function(oChoose){
            var state = oChoose.state,
                $body = state.$body, 
                $panels = state.$panels,
                opts = state.options;

            $body.css('left', -1*$panels.eq(state.activeIndex).position().left);
        },
        fixNextCarousel : function(oSlide){
            var state = oSlide.state,
                $body = state.$body, 
                $panels = state.$panels,
                opts = state.options;

            $body.css('left', -1*$panels.eq(state.activeIndex).position().left);
        }
    };

    return scrollx;
});
