define(function(require, exports, module){
    var $ = require('jquery+');

    var fade = {
        init : function( oChoose ){
            var state = oChoose.state,
                opts = state.options,
                $panels = state.$panels,
                colspan = opts.colspan,
                min = state.activeIndex * colspan,
                max = min + colspan - 1;

            $panels.show();
            $panels.each(function (i, panel) {
                var isActivePanel = i >= min && i <= max;
                $(panel).css({
                    opacity: isActivePanel ? 1 : 0,
                    position: 'absolute',
                    zIndex: isActivePanel ? 9 : 1
                });
            });
        },
        switchPanel : function( oChoose, index ){
            var state = oChoose.state,
                opts = state.options,
                $panels = state.$panels,
                $to = $panels.eq(index),
                $from = (state.activeIndex != index) ? $panels.eq(state.activeIndex) : null;

            // 简单起见，目前不支持 step > 1 的情景。若需要此效果时，可修改结构来达成。
            if (opts.colspan > 1) {
                throw new Error('Effect "fade" only supports colspan === 1');
            }

            if (state.anim) {
                // 立刻停止，以开始新的
                state.anim.stop(false, true);
            }

            // 首先显示下一张
            $to.css({
                'opacity' : 0,
                'zIndex' : 9
            });
            $to.show();
            $from && $from.css('zIndex', 1);
            // 动画切换
            state.anim = $to.animate({ 
                opacity: 1 
            }, opts.duration, opts.easing, function () {
                state.anim = null; // free
                // 切换 z-index
                $to.css('zIndex', 9);
                if($from) {
                    $from.css('zIndex', 1);
                    $from.css('display', 'none');
                }
            });
        }
    };

    return fade;
});
