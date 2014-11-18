/**   
 * @Title: Pin.js 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-4-10
 * @version V1.0
 * update 2014-09-20 对在外层加占位块换成在元素前加占位块,
 *      在外层加占位块，会将块里元素重新加入DOM，则里面的JS会重复执行
 *      并支持是否需要占位块，和激活和恢复自定义事件操作
 * 
 */
define(function(require, exports, module){
    //导入依赖样式资源
    //require('css!./pin.css');

    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        SIB    = require('sib.sib'),
        w      = (function(){return this})(), 
        d      = w.document;

    var defaults = {
        target : null,
        minWidth : -1, //pin效果生效的最小宽度
        minHeight : -1,
        activeCls : 'sib-pin-active', //激活样式
        container : '', //指定pin的容器
        padding : {     //指定距离容器边框多少以内
            top: 0,
            bottom: 0,
            left : 0,
            right : 0
        },
        placeholder : true, //如果为false则没有占位DIV
        scrollType : 'y', //x | y
        animate  : false,    //有动画
        delay    : 100, //页面滚动/容器尺寸改变延迟执行动画
        duration : 80,  //动画执行时间
        easing : 'swing',
        active : $.noop,
        resume : $.noop
    };
    
    var P, Pin;
    P = Pin = Widget.extend({
        static : {
            require : require,
            widgetName : 'SIBPin',
            defaults : defaults,
            optionFilter : 'scrollType' //暂只支持 y
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    pad   = opts.padding,
                    $c    = state.$container;

                state.disabled = false;
                if (opts.minWidth && opts.minWidth > 0 && $(w).width() <= opts.minWidth) {
                    this.destroy();
                    return;
                }

                var offset  = $el.offset();
                var cOffset = $c.offset();
                var pOffset = $el.offsetParent().offset();

                state.from = {
                    top  : cOffset.top - pad.top,
                    left : cOffset.left - pad.left
                };
                state.to = {
                    top  : cOffset.top + $c.height() - $el.outerHeight(true) - pad.bottom,
                    left : cOffset.left + $c.width() - $el.outerWidth(true) - pad.right
                };
                state.end = {
                    top  : cOffset.top + $c.height(),
                    left : cOffset.left + $c.width()
                }
                state.pOffset = pOffset;
                
                if(typeof $.easing[opts.easing] !== 'function') {
                    opts.easing = 'swing';
                }
            },
            _buildHTML : function() {
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element;

                //创建一个等大的元素占位
                if(!state.$placeholder && opts.placeholder) {
                    state.$placeholder = $('<div style="display:none;"></div>').insertBefore($el);
                }
                this.resizePlaceholder();
            },
            _bindEvent : function() {
                var state = this.state,
                    $el   = this.$element,
                    $ph   = state.$placeholder,
                    self  = this,
                    opts  = state.options,
                    pad   = opts.padding,
                    $w    = $(w),
                    //_refresh后state.from将被更新，如果这里使用闭包，更新后计算将无法获取新的from
                    //from  = state.from, 
                    //to    = state.to,
                    //end   = state.end,
                    isAfter  = false,
                    isBefore = false;

                if(opts.animate) {
                    $w.on('scroll', SIB.buffer(onScroll, opts.delay, this));
                } else {
                    $w.on('scroll', onScroll);
                }
                /*$w.resize(function(){
                    self._refresh();
                });*/
                //$w.resize 莫名经常不触发，改为body resize
                $('body').resize(SIB.fixInterval(function(){
                    self._refresh();
                }, 500));
                
                $w.load(function(){
                    self._refresh();
                    onScroll();
                });

                function active() {
                    if (opts.activeCls) { $el.addClass(opts.activeCls); }
                    $ph && $ph.show();
                    self._trigger('active', null, {
                        element : $el,
                        placeholder : $ph
                    });
                }

                function resume(){
                    if (opts.activeCls) { $el.removeClass(opts.activeCls); }
                    $ph && $ph.hide();
                    self._trigger('resume', null, {
                        element : $el,
                        placeholder : $ph
                    });
                }

                function onScroll () {
                    if (state.disabled) { return; }

                    var rule = allRule[opts.scrollType];
                    if (rule.isBeyondContainer()) {//超出滚动范围,不用滚动
                        $el.attr('style', state.origStyle);
                        return;
                    }

                    if (rule.isInView()) {   //容器在可见视图中
                        isAfter = isBefore = false;

                        if(opts.animate) { //如果支持动画只会是absolute的
                            $el.css('position', 'absolute');
                            $el.stop(true, true).animate(rule.inViewProp(), opts.duration, opts.easing);
                        } else {
                            if(SIB.supportFixed()) {
                                if(!($el.css('position') == 'fixed')) {
                                    $el.css(rule.inViewFixedProp());
                                    $el.css('position', 'fixed');
                                }
                            } else {
                                $el.css('position', 'absolute');
                                $el.css(rule.inViewProp());
                            }
                        }

                        active();
                    } else if (rule.isBeforeView()) { //容器在可见视图的上面/左边
                        if(isAfter) return;
                        isAfter = true;
                        isBefore = false;
                        $el.css('position', 'absolute');
                        var bfvp = rule.beforeViewProp();
                        if(opts.animate) {
                            $el.stop(true, true).animate(bfvp, opts.duration, opts.easing);
                        } else {
                            $el.css(bfvp);
                        }
                        active();
                    } else {    //容器在可见视图的下面/右边 或者容器顶部还在可是范围内
                        if(isBefore) return;
                        isBefore = true;
                        isAfter = false;
                        $el.attr('style', state.origStyle);
                        resume();
                        //重新计算尺寸.如果返回原来位置,wrapper需要重新计算尺寸,
                        //可能在悬浮时候改变浏览器尺寸,导致改变,此处还原,必须在移除activeCls后
                        self.resizePlaceholder();
                    }
                };

                var allRule = {
                    'x' : {
                        isBeyondContainer : function(){ //元素大小超出容器范围
                            return state.from.left + $el.outerWidth() > state.end.left;
                        },
                        isInView : function() {
                            var scrollX = $w.scrollLeft();
                            return state.from.left < scrollX && state.to.left > scrollX
                        }, 
                        isBeforeView : function() { //容器在当前可视范围的左边
                            return $w.scrollLeft() >= state.to.left
                        },
                        beforeViewProp : function(){
                            return {
                                left : state.to.left - state.pOffset.left + pad.left
                            }
                        },
                        inViewProp : function() {
                            return {
                                left  : $w.scrollLeft() - state.pOffset.left + pad.left
                            }
                        },
                        inViewFixedProp : function() {
                            return {
                                top : $el.offset().top - $w.scrollTop(),
                                left : pad.left
                            }
                        }
                    },
                    'y' : {
                        isBeyondContainer : function(){ //元素大小超出容器范围
                            return state.from.top + $el.outerHeight() > state.end.top;
                        },
                        isInView : function() {
                            var scrollY = $w.scrollTop();
                            return state.from.top < scrollY && state.to.top > scrollY;
                        }, 
                        isBeforeView : function() { 
                            var scrollY = $w.scrollTop();
                            return scrollY >= state.to.top;
                        },
                        beforeViewProp : function(){
                            return {
                                top : state.to.top - state.pOffset.top + pad.top,
                                left : state.from.left - state.pOffset.left
                            }
                        },
                        inViewProp : function() {
                            return {
                                top  : $w.scrollTop() - state.pOffset.top + pad.top,
                                left : state.from.left - state.pOffset.left
                            }
                        },
                        inViewFixedProp : function() {
                            return {
                                left: state.from.left,
                                top : pad.top
                            }
                        }
                    },
                    'xy' : {
                        isBeyondContainer : function(){ //元素大小超出容器范围
                            return allRule.x.isBeyondContainer() && allRule.y.isBeyondContainer();
                        },
                        isInView : function() {
                            return allRule.x.isInView() || allRule.y.isInView();
                        }, 
                        isBeforeView : function() { 
                            return allRule.x.isBeforeView() || allRule.y.isBeforeView();
                        },
                        beforeViewProp : function(){
                            if(allRule.x.isBeforeView()) {
                                return allRule.x.beforeViewProp();
                            } else {
                                return allRule.y.beforeViewProp();
                            }
                        },
                        inViewProp : function() {
                            return $.extend({}, allRule.x.inViewProp(), allRule.y.inViewProp());
                        },
                        inViewFixedProp : function() {
                            return {
                                top : allRule.y.inViewFixedProp().top,
                                left : allRule.x.inViewFixedProp().left
                            }
                        }
                    }
                }
            }
        },
        public : {
            _init : function() {
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    $c;
                //就算refresh也不改变的值放init里初始化,如origStyle
                //如果父级节点没有匹配的,则搜索所有的(不一定是父级元素)
                $c = state.$container = opts.container ? $($el.closest(opts.container)[0] || $(opts.container)) : $(d.body);
                if(!$c || !$c.length) {
                    $c = state.$container = $(d.body);
                }
                state.origStyle = $el.attr('style') || '';//保存style

                this._prepareOption();
                this._buildHTML();
                this._bindEvent();
            },
            _refresh : function(){
                var state = this.state;
                //this.destroy();
                this._prepareOption();
                if(!state.disabled) {
                    this._buildHTML();
                }
            },
            //重新计算wrapper尺寸
            resizePlaceholder : function(){
                var $el   = this.$element,
                    state = this.state,
                    $ph   = state.$placeholder;

                if($ph) {
                    $ph.css({
                        width : 'auto',
                        height : 'auto'
                    });
                    //不能直接干掉style, display不能替换
                    //$ph.attr('style', '');//重新计算尺寸时,先将原先尺寸移除,不然不准确
                    $ph.outerWidth($el.outerWidth());
                    $ph.outerHeight($el.outerHeight());
                }
            },
            destroy : function() {
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    $ph   = state.$placeholder;

                $ph && $ph.remove();
                $el.attr('style', state.origStyle);
                if (opts.activeCls) { 
                    $el.removeClass(opts.activeCls); 
                }
                state.disabled = true;
            }
        }
    });

    return P;
});