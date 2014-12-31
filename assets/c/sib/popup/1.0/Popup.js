/**   
 * @Title: Popup.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-4-1
 */
define(function(require, exports, module){

    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        SIB    = require('sib.sib'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        target : null, //pop弹出框
        trigger : '',
        triggerType : 'hover',  //hover | click
        content : null,     //string | element | function
        position : {
            at : 'right top',
            my : 'left top'
        },
        delay : 80,
        disabled : false,
        effect : 'none',    //none | fade | slide
        speed : 'normal',
        //duration : 250,
        triggerActiveCls : 'sib-popup-active',
        clsPrefix : 'sib-popup',
        
        //event
        beforeshow : $.noop,
        aftershow : $.noop,
        show : $.noop,//显示时回调 evt data
        hide : $.noop //隐藏时回调 evt data
    };

    var template =  '<div class="{clsPrefix}">' +
                        '<div class="{clsPrefix}-content"></div>' +
                    '</div>';

    var P, Popup;
    P = Popup = Widget.extend({
        static : {
            widgetName : 'SIBPopup',
            widgetEventPrefix : 'popup',
            require : require,
            defaults : defaults,
            template : template,
            clsPrefix : 'sib-popup'
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts  = state.options;

                state.$trigger = $(opts.trigger);
                state.$popup = this.$element;
            },
            //构造HTML
            _buildHTML : function() {},
            _bindEvents : function(){
                var state = this.state,
                    opts  = state.options,
                    self  = this,
                    triggerType = opts.triggerType;

                if(!triggerType || triggerType === 'none') {
                    return;
                } else if (triggerType === 'click') {
                    this._bindClick();
                } else {
                    // 默认是 hover
                    this._bindHover();
                }
                this._hideByClickOut();
            },
            _bindClick : function() {
                var state = this.state,
                    opts  = state.options,
                    $trigger = state.$trigger;

                this._on($trigger, {
                    'click' : function( event ){
                        var $ct = $(event.currentTarget),
                            dataName = state.mconst.clsPrefix + '-trigger-active',
                            active = $ct.data(dataName);
                        if(active === true) {
                            this.hide();
                        } else {
                            this.show($ct);
                        }
                    }
                });
            },
            _bindHover : function(){
                var state = this.state,
                    opts  = state.options,
                    self  = this,
                    $trigger = state.$trigger,
                    showTimer, 
                    hideTimer,
                    delay = opts.delay >=0 ? opts.delay : 0;//延时时间如果是负数在IE下不执行，点击才执行！

                this._on($trigger, {
                    'mouseenter' : function( event ) {
                        clearTimeout(hideTimer);
                        hideTimer = null;

                        //var $ct = $(event.target),
                        var $ct = $(event.currentTarget),
                            dataName = state.mconst.clsPrefix + '-trigger-active',
                            active = $ct.data(dataName);

                        if(!active) {
                            showTimer = setTimeout(function(){
                                self.show($ct);
                            }, delay );
                        }
                    },
                    'mouseleave' : leaveFunc
                });

                //delay < 0 则为tip效果,只能查看,不能移入弹出框
                if(opts.delay >= 0) {
                    this._on({
                        'mouseenter' : function( event ){
                            clearTimeout(hideTimer);
                            hideTimer = null;
                        },
                        'mouseleave' : leaveFunc
                    });
                }
                
                function leaveFunc( event ) {
                    clearTimeout(showTimer);
                    showTimer = null;

                    if(this.$element.is(':visible')) {
                        hideTimer = setTimeout(function(){
                            self.hide();
                        }, delay);
                        
                    }
                }
            },
            _makeActive : function( active ) {
                var state = this.state,
                    opts  = state.options,
                    $trigger = state.$trigger,
                    dataName = state.mconst.clsPrefix + '-trigger-active';

                if(opts.disabled) {
                    return;
                }
                $trigger.each(function( i, item ){
                    $(item).data(dataName, false).removeClass(opts.triggerActiveCls)
                });
                if(active) {
                    var $active = $(active);
                    $active.data(dataName, true).addClass(opts.triggerActiveCls);
                    state.$activeTrigger = $active;
                } else {
                    state.$activeTrigger = null;
                }
            },
            _hideByClickOut : function(){
                var state = this.state,
                    self  = this;
                $(d).click(function( event ){
                    if(SIB.isOutSide(event.target, [state.$activeTrigger, self.$element])) {
                        if(state.$activeTrigger){
                            self.hide();
                        }
                    }
                });
            },
            _syncPosition : function() {
                var state = this.state,
                    opts  = state.options;
                this.$element.position($.extend({
                    of : state.$activeTrigger
                }, opts.position));
            }
        },
        public : {
            /*init : function( opts ) {
                if(opts && typeof opts !== 'string' && !opts.target && opts.content) {
                    if(!$.isFunction(opts.content)) {
                        opts.target = opts.target || opts.content;
                    }
                }
                this._super(opts);
            },*/
            _init : function() {
                this._prepareOption();
                this._buildHTML();
                this._bindEvents();
            },
            _refresh : function(){
                
            },
            setOptions : function(opts){
                var state = this.state;
                var ret = this._super(opts);

                if(opts['content']) {
                    state._hasBuild = false;
                }
                return ret;
            },
            //参数,激活那个触发元素(一个Popup可能有多个触发元素)
            show : function( active ) {
                var state = this.state,
                    $el   = this.$element,
                    that  = this,
                    opts  = state.options,
                    $trigger = state.$trigger;

                if(opts.disabled) {
                    return;
                }
                if(this._trigger( "beforeshow", null ) === false) {
                    return;
                }
                //默认第一个
                if(!active || $(active).length <= 0) {
                    active = $trigger.eq(0);
                }
                this._makeActive(active);
                //第一次初始化
                if(!opts.target && !state._hasBuild) {
                    state._hasBuild = true;
                    var content = opts.content,
                        contentCls = '.' + state.mconst.clsPrefix + '-content',
                        $content = this.$element.find(contentCls);
                    if($.isFunction(opts.content)) {
                        content = opts.content.call($trigger[0]);
                    }
                    
                    if(typeof content === 'string') {
                        $content.html(content);
                    } else if(content) {
                        var $cntInner = $(content).show();
                        $cntInner.appendTo($content);
                        $content.append(content);
                    }
                    this.render();
                }
                //this.$element.show();
                var eventParam = {
                    triggers : $trigger, //可能多个trigger，如果一个则triggers === active
                    activeTrigger : active,
                    popup  : $el
                };
                var fn = function(){
                    that._trigger('showafter', null, eventParam);
                };
                if('slide' == opts.effect) {
                    $el.slideDown(opts.speed || 'normal', fn);
                } else if('fade' == opts.effect) {
                    $el.fadeIn(opts.speed || 'normal', fn);
                } else {
                    $el.show(0, fn);
                    //$el.show(fn);
                }

                this._trigger('show', null, eventParam);
                if(state.$activeTrigger) {
                    this._syncPosition();
                }
            },
            hide : function(){
                var $el   = this.$element,
                    that  = this,
                    state = this.state,
                    opts = state.options;
                var $trigger = this.state.$trigger;
                this._makeActive();
                //this.$element.hide();
                
                var eventParam = {
                    triggers : $trigger,
                    popup  : this.$element
                };
                var fn = function(){
                    that._trigger('showafter', null, eventParam);
                };
                
                if('slide' == opts.effect) {
                    $el.slideUp(opts.speed || 'normal', fn);
                } else if('fade' == opts.effect) {
                    $el.fadeOut(opts.speed || 'normal', fn);
                } else {
                    $el.hide(0, fn);
                }
                this._trigger('hide', null, eventParam);
            }
        }
    });
    return P;
});
