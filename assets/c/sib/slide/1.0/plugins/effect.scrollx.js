define(function(require, exports, module){
    var $ = require('jquery+');

    var scrollx = {
        options : {
            fixWidth : true //宽度会自动设置
        },
        init : function( oSlide ){
            var state = oSlide.state,
                $panels = state.$panels,
                $body = state.$body,
                opts = state.options,
                self = this;

            $panels.show();
            // 设置定位信息，为滚动效果做铺垫
            $body.css('position', 'relative');

            // 注：content 的父级不一定是 container
            if ($body.parent().css('position') === 'static') {
                $body.parent().css('position', 'relative');
            }
            this.initScroll( oSlide );
            this.touchSupport( oSlide );
        },
        initScroll : function( oSlide ){
            var state = oSlide.state,
                $panels = state.$panels,
                $body = state.$body,
                opts = state.options,
                eOpts = state.effectOptions;
            $panels.css('float', 'left');
            if(eOpts.fixWidth) {
                $panels.outerWidth($body.parent().width()/opts.colspan);
                $body.parent().resize(function(){   //元素隐藏也会改变尺寸
                    var $bp = $body.parent();
                    if($bp.length && $bp.is(':visible')) {
                        $panels.outerWidth($body.parent().width()/opts.colspan);
                    }
                });
            }
            // 设置最大宽度，以保证有空间让 panels 水平排布
            $body.width('10000000px');
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
                    var endX  = e.originalEvent.changedTouches[0].clientX;
                    var width = $panels.eq(0).width();
                    state.deltaX = Math.abs(endX - state.startX);//滑过的距离
                    var swipeleft = (Math.abs(endX) < Math.abs(state.startX));//是否是向左滑动
                    var swiperight = !swipeleft;
                    //判断是否在边界反滑动，true，出现了反滑动，false，正常滑动
                    var anti = opts.circulate ? false : ( oSlide.isLast() && swipeleft || oSlide.isFirst() && swiperight );

                    //复位
                    var reset = function(){
                        self.switchPanel(oSlide, state.activeIndex);
                    };

                    //根据手势走向上一个或下一个
                    var goswipe = function(){
                        var colwidth = width; /*/ opts.colspan;*/
                        var span = parseInt( (state.deltaX - colwidth * opts.colspan / 2) / colwidth , 10);
                        // 滑动距离超过一帧
                        if(swipeleft){//下一帧
                            if(span >= 1 && $panels.length >2){
                                //  +1 是为了在向右滑动时，始终保持前进一档，不会出现后退一格
                                state.activeIndex += span + 1;
                                if(state.activeIndex >= ($panels.length - opts.colspan)){
                                    state.activeIndex  = $panels.length - opts.colspan - 1;
                                }
                            }
                            oSlide.next();
                        }else{//上一帧
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
                    if(opts.touchSupport && state.deltaX < 30){
                        reset();
                        return;
                    }

                    if(!anti && (
                                // 支持touchSupport，跑马灯效果，任意帧，touchSupport足够的距离
                                ( opts.touchSupport && (state.deltaX > width / 3) ) ||
                                // 不支持touchSupport，跑马灯
                                ( !opts.touchSupport && opts.circulate ) ||
                                // 正常tab，支持touchSupport，横向切换
                                ( !opts.circulate && opts.touchSupport && opts.effect == 'scrolly' ) || 
                                // 不支持touchSupport，不支持跑马灯
                                ( !opts.touchSupport && !opts.circulate) ||
                                //快速手滑
                                ( Number(new Date()) - state.startT < 550 )
                            )
                        ){
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

                    var width = $panels.eq(0).width();
                    // 确保单手指滑动，而不是多点触碰
                    if(e.originalEvent.touches.length > 1 ) return;

                    //deltaX > 0 ，右移，deltaX < 0 左移
                    state.deltaX = e.originalEvent.touches[0].clientX- state.startX; 

                    //判断是否在边界反滑动，true，出现了反滑动，false，正常滑动
                    var anti = ( oSlide.isLast() && state.deltaX < 0 || oSlide.isFirst() && state.deltaX > 0 );

                    //if(!opts.circulate && opts.effect == 'scrolly' && anti){
                    //    state.deltaX = state.deltaX / 3; //如果是边界反滑动，则增加阻尼效果
                    //}

                    // 判断是否需要上下滑动页面
                    state.isScrolling = ( Math.abs(state.deltaX) < Math.abs(e.originalEvent.touches[0].clientY- state.startY) ) ? true: false;

                    if(!state.isScrolling){
                        // 阻止默认上下滑动事件
                        //e.halt();
                        e.preventDefault();
                        oSlide.stop();
                        var dic = state.deltaX - state.activeIndex * width;

                        $body.css({
                            left : dic
                        });
                    }
                });
            }
        },
        switchPanel : function( oSlide, index ){
            var state = oSlide.state;
            if (state.anim) {
                state.anim.stop();
            }
            this.switchEffect(oSlide, index);
        },
        switchEffect : function(oSlide, index){
            var state = oSlide.state,
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
                self.afterChange(oSlide, index);
            });
        },
        afterChange : function(oSlide, index){
            var state = oSlide.state,
                opts = state.options,
                $triggers = state.$triggers,
                $panels = state.$panels;

            oSlide._trigger('afterChange', null, {
                oldVal : {
                    triggerIndex : oSlide._getTriggerIndex(state.activeIndex),
                    panelIndex : state.activeIndex,
                    trigger : $triggers.eq(oSlide._getTriggerIndex(state.activeIndex))[0], 
                    panel : $panels.eq(state.activeIndex)[0]
                },
                newVal : {
                    triggerIndex : oSlide._getTriggerIndex(index),
                    panelIndex : index,
                    trigger : $triggers.eq(oSlide._getTriggerIndex(index))[0], 
                    panel : $panels.eq(index)[0]
                }
            });
        },
        supportCirculate : true,
        fixPreCarousel : function(oSlide){
            var state = oSlide.state,
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
