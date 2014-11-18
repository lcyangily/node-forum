/**   
 * @Title: LazyLoad.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-4-17
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./lazyload.css');

    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        Sib    = require('sib.sib'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        target : null,
        threshold : 0,  //number 设置后可以提前加载视窗以外的内容，提升体验
        //event : 'scroll touchmove resize',     //响应的事件
        event : 'scroll',
        container : w,
        attrName  : 'data-sib-lazyload', //需要lazyload的属性名
        duration : 300,     //延迟触发事件
        skipHidden : true,  //忽略隐藏的
        placeholder : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC",
        //callback
        load : null,    //function  每加载一个元素就会触发一次这个回调
        complete : null //function  所有元素加载完成后会触发此回调
    };

    var LL, LazyLoad;
    LL = LazyLoad = Widget.extend({
        static : {
            widgetName : 'SIBLazyLoad',
            require  : require,
            defaults : defaults
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts  = state.options,
                    $container;

                $container = state.$container = $(opts.container);
                //获取所有需要lazyload的节点
                state.$lazyElements = this._getLazyElements();
                state.$lazyElements.each(function(i, it){
                    var $it = $(it);
                    if ($it.attr("src") === undefined || $it.attr("src") === false) {
                        if ($it.is("img")) {
                            $it.attr("src", opts.placeholder);
                        }
                    }
                });
                this.resume();
                this.checkout();
            },
            _getLazyElements : function(){
                var state  = this.state,
                    opts   = state.options,
                    $container = state.$container;

                //var $els = $container.find('[' + opts.attrName + ']');
                var $els = this.$element;
                return $els;
                //return Array.prototype.slice.call($els);
            },
            _inViewport : function($e) {
                var self  = this,
                    state = this.state,
                    opts  = state.options,
                    $container = state.$container,
                    elOffset   = $e.offset(),
                    threshold  = opts.threshold,
                    below,  //判断元素是否在视窗之下
                    right,  //元素是否在视窗的右边以内
                    above,  //元素是否在视窗之上
                    left,   //元素是否在视窗左边以内
                    x = $container.scrollLeft(),
                    y = $container.scrollTop(),
                    w,h;

                //默认window
                if ($.isWindow($container[0])) {
                    w = $container.innerWidth();
                    h = $container.innerHeight();

                    below = h + y <= elOffset.top - threshold;
                    right = w + x <= elOffset.left - threshold;
                    above = y >= elOffset.top + $e.outerHeight() + threshold;
                    left  = x > elOffset.left + $e.outerWidth() + threshold;
                } else {
                    w = $container.width();
                    h = $container.height();
                    var boxOffset  = $container.offset();
    
                    below = boxOffset.top  + h <= elOffset.top  - threshold;//    y + h <= y + elOffset.top - boxOffset.top + threshold;
                    right = boxOffset.left + w <= elOffset.left - threshold;
                    above = boxOffset.top  >= elOffset.top  + $e.outerHeight() + threshold;
                    left  = boxOffset.left >= elOffset.left + $e.outerHeight() + hereshold;
                }

                return !below && !right && !above && !left;
            },
            _renderElement: function ($el) {
                var self = this,
                    state = this.state,
                    opts  = state.options,
                    nodeName = $el[0].nodeName.toUpperCase();
                    //load = config.load;


                if (nodeName == "IMG") {
                    var src = $el.attr(opts.attrName);
                    $el.attr("src", src);
                } else if (nodeName == "TEXTAREA") {    //html
                    var html = $el.val(),
                        content = $("<div/>");

                    content.html(html).insertBefore($el);
                    $el.hide();
                } else {
                    var eventName = $el.attr(opts.attrName);
                    Sib.publish(eventName, {
                        element : $el
                    });
                    $el.trigger(eventName);
                    return;
                }

                this._trigger('load', null, {
                    element : $el
                });
                /*if (typeof(load) == "function") {
                    load.call(this, el);
                }*/

            }
        },
        public : {
            _init : function(){
                this._prepareOption();
            },
            _refresh : function() {
                state.$lazyElements = this._getLazyElements();
            }, 
            //加载满足加载规则的数据
            checkout : function() {
                var self  = this,
                    state = this.state,
                    opts  = state.options,
                    $container    = state.$container,
                    $lazyElements = state.$lazyElements;

                // container is display none
                /*if (self._containerIsNotDocument && !$container.offset().width) {
                    return;
                }*/

                //for(var i = 0; i < $lazyElements.length; i++) {
                $.each($lazyElements, function(i, item){
                    var $el = $(item);
                    if(opts.skipHidden && !$el.is(':visible')) {
                        return;
                    }
                    if (self._inViewport($el)) {
                        self._renderElement($el);
                        $lazyElements = state.$lazyElements = $lazyElements.not($el[0]);
                    }
                });

                if ($lazyElements.length < 1) {
                    if ($.isFunction(opts.complete)) {
                        opts.complete.call(this);
                    }
                    this.destroy();
                }
            },
            //暂停监听
            pause : function() {
                var self = this,
                    state = this.state,
                    opts  = state.options,
                    $container = state.$container;

                if (state._destroyed) {
                    return;
                }

                this._off($container, opts.events);
            },
            //继续监控懒加载元素
            resume : function() {
                var self  = this,
                    state = this.state,
                    opts  = state.options,
                    $container = state.$container;

                if (state._destroyed) {
                    return;
                }

                var evtObj = {};
                evtObj[opts.event] = this.checkout;
                this._on($container, evtObj);
            },
            destroy : function(){
                this.pause();
            }
        }
    });

    return LL;
});
