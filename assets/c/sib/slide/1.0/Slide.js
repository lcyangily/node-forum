/**   
 * @Title: Slide.js 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-2-18
 * @version V1.0
 */
define(function(require, exports, module){
    //导入依赖样式资源
    //require('css!./slide.css');

    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        SIB    = require('sib.sib'),
        fade   = require('sib.slide.fade'),
        scrollx= require('sib.slide.scrollx'),
        scrolly= require('sib.slide.scrolly'),
        w      = (function(){return this})(), 
        d      = w.document;

    var defaults = {
        triggers : '.slide-nav li', //string|array 触发器列表, 支持直接传入选择器，也可以是元素数组
        hasTriggers: true,  //没有传入 triggers 时，是否自动生成trigger
        panels  : '.slide-panel', //string|array
        triggerType : 'click',  //click hover 
        effect : null,       //切换类型, null scroll-x scroll-y fade
        effectOptions : {},
        autoPlay: false,         //是否自动切换
        interval  : 2000,       //停顿时间(autoPlay为true有效)
        duration  : 500,    //动画持续时间
        easing : 'swing',
        hoverStop : true,       //鼠标悬停在面板上是否停止自动播放，默认为true
        triggerActiveCls : '{clsPrefix}-trigger-active',    //导航选中时的className
        activeIndex : 0, //默认定位在某个帧，默认为0，即第一帧
        colspan : 1,    //滑块窗口的跨度，比如滑块中包含2帧，则指定为2
        circulate : false,   //是否以跑马灯模式，默认为false
        bodyAutoSize : false,
        prevBtn : null, //'.prev-btn' 
        nextBtn : null, //'.next-btn'
        disabledBtnCls : '.sib-disabled',   //prevBtn/nextBtn不可用的状态
        addDefaultCls : true,   //会将各个块样式增加上{clsPrefix}-content,{clsPrefix}-panel,{clsPrefix}-nav等

        change : function(event, param){}, //切换发生时的事件，特指切换动作必然发生时的时刻，回调上下文和参数同上
        beforeChange: function(event, param){return true;},  //切换至”的事件，回调返回false可以阻止切换事件的发生
        afterChange : function(event, param){}     //切换完成的动作
    };
    
    var S, Slide;
    S = Slide = Widget.extend({
        static : {
            require : require,
            widgetName : 'SIBSlide',
            defaults : defaults,
            plugins : {
                scrollx : scrollx,
                scrolly : scrolly,
                fade : fade
            },
            clsPrefix : 'sib-slide'
        },
        private : {
            /**
             * 初始化变量,组织修改数据。Slide组件标准格式：
             * <div> --Slide
             *     <ul><li></li>...</ul>  --trigger
             *     <div> --body
             *         <div></div> --panel
             *         <div></div>
             *         ...
             *     </div>
             * </div>
             * 如果panel层上一次为Slide，则生成body层
             */
            _prepareOption : function() {
                var state = this.state,
                    opts = state.options,
                    $el = this.$element,
                    bodyTmpl = '<div class="{clsPrefix}-content"></div>';

                state.circulate = opts.circulate;
                state.effect = (typeof opts.effect === 'string' ? this.constructor.plugins[opts.effect] : opts.effect) || this.constructor.plugins['default'];
                state.effectOptions = $.extend(true, {}, state.effect.options||{}, opts.effectOptions);
                //当前效果是否支持循环播放,只有scrollx/scrolly才支持循环播放
                if(!state.effect.supportCirculate) {
                    state.circulate = false;
                }
                state.$triggers = $el.find(opts.triggers);
                var $panels = state.$panels = $el.find(opts.panels);
                state.length = $panels.size();
                state.$body = $panels.parent();
                if($el[0] == state.$body[0]) { //panel层与Slide间没有body
                    state.$body = $panels.wrapAll(SIB.unite(bodyTmpl, this.constructor)).parent();
                }

                state.activeIndex = +Number(opts.activeIndex);
                // 如果是跑马灯，则不考虑默认选中的功能，一律定位在第一页
                if(state.circulate){
                    state.activeIndex = opts.colspan;
                }
                
                //用户设置动画效果不存在或动画plugin为载入,则使用默认的swing效果
                if(typeof $.easing[opts.easing] !== 'function') {
                    opts.easing = 'swing';
                }
            },
            //构造html(对nav,Slide和跑马灯做html结构的处理)
            _buildHTML : function(){
                var state = this.state,
                    $el   = this.$element,
                    self  = this,
                    opts  = state.options,
                    $triggers = state.$triggers, 
                    $panels   = state.$panels;
                //没有nav 默认生成一个
                if((!$triggers || $triggers.size() === 0) && opts.hasTriggers) {
                    var itemTpl = '<li>{idx}</li>',
                        $ul = $('<ul><ul>'),
                        triggerHtml = '';
                    for (var i = 0; i < state.length; i++) {
                        triggerHtml += SIB.unite(itemTpl, {
                            'idx' : i+1
                        });
                    }
                    $ul.html(triggerHtml).prependTo($el);
                    state.$triggers = $ul.find('li');
                }
                
                //对所有元素增加默认样式
                if(opts.addDefaultCls) {
                    if(state.$triggers && state.$triggers.length) {
                        state.$triggers.parent().addClass(this._getCls('{clsPrefix}-nav'));
                        state.$triggers.addClass(this._getCls('{clsPrefix}-trigger'));
                    }
                    this.$element.addClass(this._getCls('{clsPrefix}'));
                    state.$body.addClass(this._getCls('{clsPrefix}-content'));
                    state.$panels.addClass(this._getCls('{clsPrefix}-panel'));
                }

                this._hightlightTrigger(this._getTriggerIndex(state.activeIndex));

                //跑马灯需要对元素前后增加
                if(state.circulate){
                    this._exHTMLbyCarousel();
                }
            },
            //private
            _exHTMLbyCarousel : function(){
                var state = this.state,
                    $panels = state.$panels,
                    $body = state.$body, 
                    opts = state.options,
                    fronts = [],
                    behinds = [];

                for(var i = 0; i < opts.colspan; i++) {
                    var f = $panels.eq(i).clone(true)[0];
                    var b = $panels.eq($panels.size()-1 -i).clone(true)[0];
                    behinds.push(f);
                    fronts.unshift(b);
                    $body.append(f);
                    $body.prepend(b);
                }

                //重新获取重组之后的panels
                var panels = fronts.concat($panels.toArray()).concat(behinds);
                
                $panels = $(panels);
                state.$panels = $panels;
                state.length = $panels.size();
            },
            //绑定事件
            _bindEvent : function() {
                var state = this.state,
                    $el = this.$element, 
                    $triggers = state.$triggers,
                    $panels = state.$panels,
                    opts = state.options,
                    self = this;
                if( $.inArray(opts.triggerType, ['click','hover'] ) != -1 ) {
                    $triggers.bind(opts.triggerType, function(e){
                        e.stopPropagation();
                        var ti = Number($triggers.index(e.currentTarget));
                        if(state.circulate){
                            ti = (ti + 1) % state.length;
                        }
                        self.go(ti);
                        if(opts.autoPlay){
                            self.stop().play();
                        }
                    });
                }

                // 是否支持鼠标悬停停止播放
                if(opts.hoverStop){
                    $panels.hover(function(){
                        if(opts.autoPlay)self.stop();
                    }, function(){
                        if(opts.autoPlay)self.play();
                    });
                }

                if(opts.nextBtn) {
                    $el.find(opts.nextBtn).click(function(){
                        self.next();
                    });
                }
                if(opts.prevBtn) {
                    $el.find(opts.prevBtn).click(function(){
                        self.previous();
                    });
                }
                return this;
            },
            //自动播放
            _play : function(){
                var state = this.state,
                    opts = state.options, 
                    self = this;
                
                if(state.timer){
                    clearTimeout(state.timer);
                }
                state.timer = setTimeout(function(){
                    self.next().play();
                }, Number(opts.interval + opts.duration));
                
                return this;
            },
            //停止自动播放
            _stop : function(){
                var state = this.state;
                clearTimeout(state.timer);
                state.timer = null;
                return this;
            },
            //下一个
            _next : function(callback){
                var state = this.state,
                    opts = state.options;
                
                var _index = state.activeIndex + 1;
                if(_index >= (state.length - opts.colspan + 1)){
                    _index = _index % (state.length - opts.colspan + 1);
                }

                if(state.circulate && this.isLast()){
                    this._fix_next_carousel();
                    this.next(callback);
                    return this;
                }
                
                this.go(_index, callback);
                return this;
            },
            //上一个
            _previous : function(callback){
                var state = this.state,
                    opts = state.options;

                var _index = state.activeIndex + state.length - 1 - (opts.colspan - 1);
                if(_index >= (state.length - opts.colspan + 1)){
                    _index = _index % (state.length - opts.colspan + 1);
                }
                
                if(state.circulate && this.isFirst()){
                    this._fix_pre_carousel();
                    this.previous(callback);
                    return this;
                }
                
                this.go(_index, callback);
                return this;
            },
            _isFirst : function(){
                return this.state.activeIndex === 0;
            },
            _isLast : function(){
                var state = this.state,
                    opts = state.options;
                return state.activeIndex === (state.length - opts.colspan);
            },
            // 修正跑马灯开始的滚动位置
            _fix_pre_carousel : function(){
                var state = this.state,
                    $body = state.$body, 
                    $panels = state.$panels,
                    opts = state.options;

                state.activeIndex = state.length - opts.colspan * 2;
                if($.isFunction(state.effect.fixPreCarousel)) {
                    state.effect.fixPreCarousel(this);
                }
                return;
            },
            // 修正跑马灯结尾的滚动位置
            _fix_next_carousel : function(){
                var state = this.state,
                    $body = state.$body, 
                    $panels = state.$panels,
                    opts = state.options;

                state.activeIndex = opts.colspan;
                if($.isFunction(state.effect.fixNextCarousel)) {
                    state.effect.fixPreCarousel(this);
                }
                return;
            },
            _go : function(index, callback) {
                var state = this.state,
                    $panels = state.$panels,
                    $triggers = state.$triggers,
                    opts = state.options;

                if(index + opts.colspan > $panels.size()){
                    index = $panels.size() - opts.colspan;
                }

                var ret = this._trigger('beforeChange', null, {
                    oldVal : {
                        triggerIndex : this._getTriggerIndex(state.activeIndex),
                        panelIndex : state.activeIndex,
                        trigger : $triggers.eq(this._getTriggerIndex(state.activeIndex))[0], 
                        panel : $panels.eq(state.activeIndex)[0]
                    },
                    newVal : {
                        triggerIndex : this._getTriggerIndex(index),
                        panelIndex : index,
                        trigger : $triggers.eq(this._getTriggerIndex(index))[0], 
                        panel : $panels.eq(index)[0]
                    }
                });

                if(ret) {
                    this._switchTo(index, callback);
                }
                
                return this;
            },
            _switchTo : function(index, callback){
                var state = this.state,
                    $panels = state.$panels,
                    $triggers = state.$triggers,
                    opts = state.options,
                    $body = state.$body,
                    self = this,
                    _getTriggerIndex = self._getTriggerIndex;
                //首先高亮显示tab
                this._hightlightTrigger(this._getTriggerIndex(index));
                if(opts.autoPlay){
                    this.stop().play();
                }
                if (index >= state.length) {
                    index = index % state.length;
                }
                if (index == state.activeIndex) {
                    return this;
                }

                //切换
                state.effect.switchPanel(this, index);

                this._trigger('change', null, {
                    oldVal : {
                        triggerIndex : this._getTriggerIndex(state.activeIndex),
                        panelIndex : state.activeIndex,
                        trigger : $triggers.eq(this._getTriggerIndex(state.activeIndex))[0], 
                        panel : $panels.eq(state.activeIndex)[0]
                    },
                    newVal : {
                        triggerIndex : this._getTriggerIndex(index),
                        panelIndex : index,
                        trigger : $triggers.eq(this._getTriggerIndex(index))[0], 
                        panel : $panels.eq(index)[0]
                    }
                });
                state.activeIndex = index;
            },
            _hightlightTrigger : function(index){
                var state = this.state,
                    $triggers = state.$triggers,
                    opts = state.options;

                // 同时是跑马灯，且一帧多元素，则不允许存在Nav
                if(state.circulate && opts.colspan > 1){
                    return;
                }
                if($triggers.eq(index)){
                    $triggers.removeClass( this._getCls(opts.triggerActiveCls));
                    $triggers.eq(index).addClass(this._getCls(opts.triggerActiveCls));
                }
            },
            _getCls : function(cls) {
                return SIB.unite(cls, this.constructor);
            }
        },
        public : {
            init : function( opts ) {
                var self = this,
                    effect = opts.effect || defaults.effect;

                if(typeof effect === 'string' && !this.constructor.plugins[effect]) {
                    require(['./plugins/effect.' + effect], function( plugin ){
                        //如果加载失败,防止递归死循环，设置默认值。
                        self.constructor.plugins[effect] = plugin || self.constructor.plugins['default'];
                        self.init(opts);
                    });
                } else {
                    self._super(opts);
                }
            },
            _init : function () {
                var state = this.state,
                    opts = state.options;

                //如果没有panels 则直接返回
                var $el = this.$element;
                var $panels = $el.find(opts.panels);
                if($panels.length <= 0) {
                    return null;
                }

                this._prepareOption();
                this._buildHTML();
                //绑定事件
                this._bindEvent();
                //this._fixSize(state.activeIndex);
                state.effect.init(this);
                //初始化起始位置,调用go, _switchTo 都有校验。
                this._hightlightTrigger(this._getTriggerIndex(state.activeIndex));
                state.effect.switchPanel(this, state.activeIndex);
                //是否自动播放
                if (opts.autoPlay === true) {
                    this.play();
                }
            },
            //公用，不建议外面调用
            // 得到trigger应当显示的当前index索引，0,1,2,3...跑马灯效果不一样
            _getTriggerIndex : function(index){
                var state = this.state,
                    opts = state.options, 
                    wrappedIndex = 0;

                if(state.circulate){
                    if(index < opts.colspan){
                        wrappedIndex = state.length - opts.colspan * 3 + index; 
                    } else if(index >= state.length - opts.colspan) {
                        wrappedIndex = index - (state.length - opts.colspan);
                    } else {
                        wrappedIndex = index - opts.colspan;
                    }
                } else {
                    wrappedIndex = index;
                }
                return wrappedIndex;
            },
            previous : function(callback){//切换到上一个，可以传入callback，执行切换完毕后的回调
                return this._previous();
            },
            next : function(callback){  //切换到下一个，可以传入callback，执行切换完毕后的回调
                return this._next();
            },
            go : function(index,callback){ //跳转到指定索引的帧，参数为index:0,1,2,3...，callback为切换完毕后的回调
                return this._go(index, callback);
            }, 
            play : function() { //开始自动播放
                return this._play();
            }, 
            stop : function() { //停止自动播放
                return this._stop();
            }, 
            isFirst : function() {
                return this._isFirst();
            }, 
            isLast : function() {
                return this._isLast();
            },
            triggers : function(index) {
                var state = this.state;
                if(typeof index !== 'number' || index < 0) {
                    return state && state.$triggers && state.$triggers.toArray();
                }
                return state && state.$triggers && state.$triggers[index];
            },
            panels : function(index) {
                var state = this.state;
                if(typeof index !== 'number' || index < 0){
                    return state && state.$panels && state.$panels.toArray();
                }
                return state && state.$panels && state.$panels[index];
            }, 
            activeIndex : function(){
                return this.state.activeIndex;
            }
        }
    });

    S.plugins['default'] = S.plugins['none'] = {
        init : function( oSlide ){
            var state   = oSlide.state,
                $panels = state.$panels;

            $panels.hide();
        },
        switchPanel : function( oSlide, index ){
            var state = oSlide.state,
                $panels = state.$panels,
                $to = $panels.eq(index),
                $from = $panels.eq(state.activeIndex);

            $from.hide();
            $to.show();
        },
        supportCirculate : false
    };
    return S;
});