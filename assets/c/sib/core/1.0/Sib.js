/**   
 * @Title: Sib.js 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-8-1 下午8:17:48 
 * @version V1.0   
 */
define(function(require, exports, module){
    var $ = require('jquery'),
        w = (function(){this})(), d = document,
        SIB = {},
        subscriptions = {},
        slice = [].slice;

    $.fn.addBack = $.fn.addBack || $.fn.andSelf;
    /**
     * 获取元素尺寸,如width, height, outerWidth ... 等。
     * 解决隐藏元素或者元素的父级元素隐藏,或者JS动态生成元素父亲级元素是隐藏的,
     * 则获取该元素的尺寸(如width,height)为0.
     * <div id="a"><div ></div></div>
     */
    function _sizeInner($this, $p, func) {
        
        if($this.is(':visible')){
            return func.call($this);
        }

        if(!$p || $p.length <= 0 || $p.is(':visible')) {
            return func.call($this);//$this.width();
        }

        //更改样式前先备份样式
        var old = {};
        $.each("display visibility position".split(" "), function(i, name) {
            old[name] = $p.css(name);//.style[i];//elem.style[i]本来没有这个样式，所有都为空
        });
        $p.css({
            display:'',
            visibility:'hidden',
            position:'absolute'
        });

        var width = _sizeInner($this, $p.parent(), func);
        $p.css(old);
        return width;
    }

    //参考自 : http://dreamerslab.com/blog/tw/get-hidden-elements-width-and-height-with-jquery/
    //将_sizeInner 的递归改成for each, 使用 style属性而不是.css,还原更准确!
    function realSize(el, name, includeMargin) {
        var $el = $(el),
            origs = [],
            style = 'visibility: hidden !important; display: block !important; position: absolute !important; ',
            $hidden = $el.parents().addBack().filter(':hidden');

        function fix(){
            $hidden.each(function(){
                var $this     = $(this),
                    thisStyle = $this.attr('style');

                origs.push(thisStyle);
                $this.attr('style', thisStyle ? thisStyle + ';' + style : style);
            });
        }
        
        function reset(){
            $hidden.each(function(i, el){
                var $this = $(this),
                    orig  = origs[i];

                if(SIB.isInvalidValue(orig)) {
                    $this.removeAttr('style');
                } else {
                    $this.attr('style', orig);
                }
            });
        }

        fix();
        var real = /(outer)/.test( name ) ?
                    $el[ name ]( !!includeMargin ) :
                    $el[ name ]();
        reset();

        return real;
    }

    $.extend(SIB, {
        /**
         * 通过模板,和json对象,返回拼装后的字符串
         * var str = "{name}, world!";
         * SIB.unite(str, {name : 'hello'}); //返回 "hello,world"
         */
        unite : function(tmp, data) {
            return tmp.replace(/{(.*?)}/igm, function($, $1) {     
                return (typeof data[$1] != 'undefined') ? data[$1] : '';
            });
        },
        /** 去空格 **/
        trim : function(str){
            return str ? str.replace(/^\s+|\s+$/g, '') : str;
        },
        //高版本的jQuery.support.boxModel 是在$.ready里判断,ready前使用为undefined.
        boxModel : !$.browser.msie || document.compatMode == "CSS1Compat", //低级版本jQuery判断方式
        keyCode : {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        },
        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later. Executes the function a
         * single time unless periodic is set to true.
         *
         * @param fn {Function|String} the function to execute or the name of the method in
         * the 'o' object to execute.
         *
         * @param [when=0] {Number} the number of milliseconds to wait until the fn is executed.
         *
         * @param {Boolean} [periodic] if true, executes continuously at supplied interval
         * until canceled.
         *
         * @param {Object} [context] the context object.
         *
         * @param [data] that is provided to the function. This accepts either a single
         * item or an array. If an array is provided, the function is executed with
         * one parameter for each array item. If you need to pass a single array
         * parameter, it needs to be wrapped in an array [myarray].
         *
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         * the timer.
         *
         */
        later: function (fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn,
                d = $.makeArray(data),
                f,
                r;

            if (typeof fn == 'string') {
                m = context[fn];
            }

            if (!m) {
                //S.error('method undefined');
                alert('method undefined');
                return null;
            }

            f = function () {
                m.apply(context, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function () {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },
        /**
         * buffers a call between a fixed time
         * @param {Function} fn
         * @param {Number} ms
         * @param {Object} [context]
         * @return {Function} Returns a wrapped function that calls fn buffered.
         */
        buffer: function (fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return function () {
                    fn.apply(context || this, arguments);
                };
            }
            var bufferTimer = null;

            function f() {
                f.stop();
                bufferTimer = SIB.later(fn, ms, 0, context || this, arguments);
            }

            f.stop = function () {
                if (bufferTimer) {
                    bufferTimer.cancel();
                    bufferTimer = 0;
                }
            };

            return f;
        },
        /**
         * 返回一个函数，这个函数在连续多次触发执行时，会按照指定的ms（毫秒）来循环执行。
         * 如：配置了ms = 100, 在1000ms内触发了 10000次，函数最多只会执行 10次。
         * 停止触发后则会停止循环执行。
         */
        fixInterval : function(fn, ms, context){
            ms = ms || 150;
            
            if(ms === -1) {
                return function(){
                    fn.apply(context || this, arguments);
                }
            }
            
            var going = false,
                bufferTimer = null;

            function f() {
                if(!going) {
                    going = true;
                    bufferTimer = SIB.later(function(){
                        going = false;
                        fn.apply(this, arguments);
                    }, ms, 0, context || this, arguments);
                }
            }
            
            f.stop = function(){
                if(bufferTimer) {
                    bufferTimer.cancel();
                    going = false;
                    bufferTimer = 0;
                }
            }
            
            return f;
        },
        //eg: key = 'a.b'  obj = {'a' : {'b' : 'hello'}}; return 'hello'
        getLocationValue : function(key, obj) {
            var tmp = obj,
                props = key.split('.');
            for(var i = 0; i < props.length; i++){
                tmp = tmp ? tmp[props[i]] : null;
            }
            return tmp;
        },
        /**
         * 判断是否在区域外的点击
         * @param target_node
         * @param region_nodes
         * @returns {boolean}
         * @private
         */
        isOutSide : function (target_node, region_nodes) {
            var $regionNodes = $(region_nodes);
            var ret = true;

            if(!region_nodes) {
                return true;
            }

            $regionNodes.each(function(i, item){
                var $item = $(item);
                if(!$item[0]) {
                    return true;
                }
                if(isChild(target_node, $item[0])) {
                    ret = false;
                    return false;
                }
            });

            return ret;

            function isChild(target, ele) {
                var t = $(target);
                while(t && t.length) {
                    if(t[0] === ele) {
                        return true;
                    } else {
                        t = t.parent();
                    }
                }
                return false;
            }
        },
        /** 判断变量是否是有效的
         * 不是简单的true/false
         * 0, ''为false 但是是有效的值
         */
        isInvalidValue : function( val ){
            return val === undefined || val === null || val === NaN;
        },
        getScrollBarWidth : (function(){
            var _scrollBarWidth = 0;//保存滚动条宽度,只计算一次

            return function () {
                if(_scrollBarWidth) return _scrollBarWidth;
                var inner = document.createElement('p');
                var style = inner.style;
                style.width = "100%";
                style.height = "200px";
                style.padding = "0px";
                
                var outer = document.createElement('div');
                style = outer.style;
                style.position = "absolute";
                style.top = "0px";
                style.left = "0px";
                style.visibility = "hidden";
                style.width = "200px";
                style.height = "150px";
                style.padding = "0px";
                style.overflow = "hidden";
                outer.appendChild(inner);
                
                document.body.appendChild(outer);
                var w1 = inner.offsetWidth;
                outer.style.overflow = 'scroll';
                var w2 = inner.offsetWidth;
                if ( w1 == w2 ) {
                    w2 = outer.clientWidth;
                }
                
                document.body.removeChild(outer);
                _scrollBarWidth = w1 - w2;
                return _scrollBarWidth;
            }
        })(),
        supportFixed : (function(){
            var isSupport = undefined;
            return function() {
                if(isSupport !== undefined) return isSupport;

                var outer = d.createElement('div'),
                    inner = d.createElement('div');

                isSupport = true;

                outer.style.position = 'absolute';
                outer.style.top = '200px';

                inner.style.position = 'fixed';
                inner.style.top = '100px';

                outer.appendChild(inner);
                d.body.appendChild(outer);

                //只有IE 支持 getBoundingClientRect
                if (inner.getBoundingClientRect && inner.getBoundingClientRect().top == outer.getBoundingClientRect().top) {
                    isSupport = false;
                }
                return isSupport;
            }
        })(),
        //消息发布/订阅模式
        publish: function( topic ) {
            if ( typeof topic !== "string" ) {
                throw new Error( "You must provide a valid topic to publish." );
            }

            var args = slice.call( arguments, 1 ),
                topicSubscriptions,
                subscription,
                length,
                i = 0,
                ret;

            if ( !subscriptions[ topic ] ) {
                return true;
            }

            topicSubscriptions = subscriptions[ topic ].slice();
            for ( length = topicSubscriptions.length; i < length; i++ ) {
                subscription = topicSubscriptions[ i ];
                ret = subscription.callback.apply( subscription.context, args );
                if ( ret === false ) {
                    break;
                }
            }
            return ret !== false;
        },
        subscribe: function( topic, context, callback, priority ) {
            if ( typeof topic !== "string" ) {
                throw new Error( "You must provide a valid topic to create a subscription." );
            }

            if ( arguments.length === 3 && typeof callback === "number" ) {
                priority = callback;
                callback = context;
                context = null;
            }
            if ( arguments.length === 2 ) {
                callback = context;
                context = null;
            }
            priority = priority || 10;

            var topicIndex = 0,
                topics = topic.split( /\s/ ),
                topicLength = topics.length,
                added;
            for ( ; topicIndex < topicLength; topicIndex++ ) {
                topic = topics[ topicIndex ];
                added = false;
                if ( !subscriptions[ topic ] ) {
                    subscriptions[ topic ] = [];
                }

                var i = subscriptions[ topic ].length - 1,
                    subscriptionInfo = {
                        callback: callback,
                        context: context,
                        priority: priority
                    };

                for ( ; i >= 0; i-- ) {
                    if ( subscriptions[ topic ][ i ].priority <= priority ) {
                        subscriptions[ topic ].splice( i + 1, 0, subscriptionInfo );
                        added = true;
                        break;
                    }
                }

                if ( !added ) {
                    subscriptions[ topic ].unshift( subscriptionInfo );
                }
            }

            return callback;
        },
        unsubscribe: function( topic, context, callback ) {
            if ( typeof topic !== "string" ) {
                throw new Error( "You must provide a valid topic to remove a subscription." );
            }

            if ( arguments.length === 2 ) {
                callback = context;
                context = null;
            }

            if ( !subscriptions[ topic ] ) {
                return;
            }

            var length = subscriptions[ topic ].length,
                i = 0;

            for ( ; i < length; i++ ) {
                if ( subscriptions[ topic ][ i ].callback === callback ) {
                    if ( !context || subscriptions[ topic ][ i ].context === context ) {
                        subscriptions[ topic ].splice( i, 1 );

                        // Adjust counter and length for removed item
                        i--;
                        length--;
                    }
                }
            }
        },
        form2json : function(form){
            var $form = $(form);
            var o = {};
            if($form && $form.length > 0) {
                var formArr = $form.serializeArray();
                $.each(formArr, function(){
                    if(!SIB.isInvalidValue(this.value)) {
                        if(o[this.name]) {
                            if(!o[this.name].push) {
                                o[this.name] = [ o[this.name] ];
                            }
                            o[this.name].push(this.value);
                        } else {
                            o[this.name] = this.value;
                        }
                    } else {
                        if($('[name=' + this.name + ']:checkbox', $form).length) {
                            o[this.name] = [this.value];
                        } else {
                            o[this.name] = this.value;
                        }
                    }
                });
            }
            return o;
        }
    });

    //ready后修改boxModel为高版本jQuery.support.boxModel值
    $.ready(function(){
        SIB.boxModel = $.support.boxModel;
    });
    
    $.each('width height outerWidth outerHeight innerWidth innerHeight'.split(' '), function(i, name){
        SIB[name] = function(target, includeMargin) {
            var args = [].slice.call(arguments, 1);
            return realSize(target, name, includeMargin);
        };
    });
    
    /*$.each('width height outerWidth outerHeight'.split(' '), function(i, name){
        SIB[name] = function(target) {
            var $this = $(target);
            return _sizeInner($this, $this, $.prototype[name]);
        };
    });*/
    
    return SIB;
});