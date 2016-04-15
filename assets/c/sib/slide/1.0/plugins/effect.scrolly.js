define(function(require, exports, module){
    var $ = require('jquery+'),
        scrollx = require('sib.slide.scrollx');

    var scrolly = $.extend({}, scrollx, {
        options : {
            fixHeight : true //高度会自动设置，防止panel高度是100%的情况，如果设置了panel的高度为具体数指，而不是百分比，可设置成false
        },
        initScroll : function(  oSlide ){
            var state = oSlide.state,
                $panels = state.$panels,
                $body = state.$body,
                opts = state.options,
                eOpts = state.effectOptions;
            if(eOpts.fixHeight) {
                $panels.outerHeight($body.parent().height()/opts.colspan);
                $body.parent().resize(function(){
                    var $bp = $body.parent();
                    if($bp.length && $bp.is(':visible')) {
                        $panels.outerHeight($body.parent().height()/opts.colspan);
                    }
                });
            }
        },
        touchSupport : function( oSlide ){
            var state = oSlide.state,
                $panels = state.$panels,
                $body = state.$body,
                opts = state.options,
                self = this;

            //移动端支持
            if (opts.touchSupport) {
                $panels.on('touchstart',function(e){
                    oSlide.stop();
                    state.touching = true;
                    state.startX = e.originalEvent.changedTouches[0].clientX;
                    state.startY = e.originalEvent.changedTouches[0].clientY;
                    state.startT = Number(new Date());//如果快速手滑，则掠过touchmove，因此需要计算时间
                });

                $panels.on('touchend',function(e){
                    state.touching = false;
                    var endY   = e.originalEvent.changedTouches[0].clientY;
                    var height = $panels.eq(state.activeIndex).height();
                    state.deltaY  = Math.abs(endY - state.startY);//滑过的距离
                    var swipeUp   = (Math.abs(endY) < Math.abs(state.startY));//是否是向左滑动
                    var swipeDown = !swipeUp;
                    //判断是否在边界反滑动，true，出现了反滑动，false，正常滑动
                    var anti = opts.circulate ? false : ( oSlide.isLast() && swipeUp || oSlide.isFirst() && swipeDown );

                    //复位
                    var reset = function(){
                        self.switchPanel(oSlide, state.activeIndex);
                    };

                    //根据手势走向上一个或下一个
                    var goswipe = function(){
                        var colHeight = height; /*/ opts.colspan;*/
                        var span = parseInt( (state.deltaY - colHeight * opts.colspan / 2) / colHeight , 10);
                        // 滑动距离超过一帧
                        if(swipeUp){//下一帧
                            if(span >= 1 && $panels.length >2){
                                //  +1 是为了在向右滑动时，始终保持前进一档，不会出现后退一格
                                state.activeIndex += span + 1;
                                if(state.activeIndex >= ($panels.length - opts.colspan)){
                                    state.activeIndex  = $panels.length - opts.colspan - 1;
                                }
                            }
                            oSlide.next();
                        } else {//上一帧
                            if(span >= 1 && $panels.length > 2){
                                //  -1 是为了在向左滑动时，始终保持向左划，不会出现回弹
                                state.activeIndex += -1 * span -1;
                                // 如果滑动到起始位置，就不需要再减一了
                                if(state.activeIndex <= 0){
                                    state.activeIndex = 1;
                                }
                            }
                            oSlide.previous();
                        }
                    };

                    //如果检测到是上下滑动，则复位并return
                    
                    //if(oSlide.isScrolling){
                    //   reset();
                    //    return;
                    //}

                    //如果滑动物理距离太小，则复位并return
                    //这个是避免将不精确的点击误认为是滑动
                    if(opts.touchSupport && state.deltaY < 30){
                        reset();
                        return;
                    }

                    //快速手滑
                    // 支持touchSupport，跑马灯效果，任意帧，touchSupport足够的距离
                    if(!anti && ((state.deltaY > height / 3) || (Number(new Date()) - state.startT < 550))){
                        //根据根据手滑方向翻到上一页和下一页
                        goswipe();
                    } else {
                        //复位
                        reset();
                    }

                    if(opts.autoPlay){
                        oSlide.play();
                    }
                });

                //处理手指滑动事件相关
                // TODO 网页放大缩小时，距离计算有误差
                $panels.on('touchmove',function(e){

                    var height = $panels.eq(state.activeIndex).height();
                    // 确保单手指滑动，而不是多点触碰
                    if(e.originalEvent.touches.length > 1 ) return;

                    //deltaX > 0 ，右移，deltaX < 0 左移
                    state.deltaY = e.originalEvent.touches[0].clientY- state.startY; 

                    //判断是否在边界反滑动，true，出现了反滑动，false，正常滑动
                    var anti = ( oSlide.isLast() && state.deltaY < 0 || oSlide.isFirst() && state.deltaY > 0 );

                    // 判断是否需要上下滑动页面
                    state.isScrolling = ( Math.abs(state.deltaY) < Math.abs(e.originalEvent.touches[0].clientX- state.startX) ) ? true: false;

                    if(!state.isScrolling){
                        // 阻止默认上下滑动事件
                        //e.halt();
                        e.preventDefault();
                        oSlide.stop();
                        var dic = state.deltaY - state.activeIndex * height;

                        $body.css({
                            top : dic
                        });
                    }
                });
            }
        },
        switchEffect : function(oSlide, index){
            var state = oSlide.state,
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
                self.afterChange(oSlide, index);
            });
        },
        fixPreCarousel : function( oSlide ){
            var state = oSlide.state,
                $body = state.$body, 
                $panels = state.$panels,
                opts = state.options;

            $body.css('top', -1*$panels.eq(state.activeIndex).position().top);
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
