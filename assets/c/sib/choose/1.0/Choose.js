/**   
 * @Title: Choose.js 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-2-24
 * @version V1.0   
 */
define(function(require, exports, module){
    //导入依赖样式资源
    require('css!./choose.css');

    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        SIB    = require('sib.sib'),
        w      = (function(){return this})(), 
        d      = w.document;

    var defaults = {
        target : null,
        items : 'li', //string|array 触发器列表, 支持直接传入选择器，也可以是元素数组
        eventType : 'click',  //click hover 
        activeCls : 'sib-choose-selected',    //导航选中时的className，默认为'selected'
        valueName  : 'data-value',          //选项值的属性名,如自定义成abc,则li元素的abc属性为值
        autoChoose : false,    //组件初始化(用户未点击)是否执行onChoose方法
        multiple : false,      //是否是多选类似checkbox,否则 radio

        choose : function(ev, param){}
    };
    
    var C, Choose;
    C = Choose = Widget.extend({
        static : {
            require : require,
            widgetName : 'SIBChoose',
            defaults : defaults
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts = state.options;

                if(typeof opts.items === 'string') {
                    state.$items = this.$element.find(opts.items);
                } else {
                    state.$items = $(opts.items);
                }
            },
            //构造html(对nav,Slide和跑马灯做html结构的处理)
            _buildHTML : function(){
                var state = this.state,
                    $el = this.$element,
                    opts = state.options;
            },
            _hightlight : function(){
                
            },
            //绑定事件
            _bindEvent : function() {
                var state = this.state,
                    $el = this.$element, 
                    $items = state.$items,
                    opts = state.options;
                
                if( $.inArray(opts.eventType, ['click','hover'] ) != -1 ) {
                    evtObj = {};
                    evtObj[opts.eventType] = function(e){
                        e.stopPropagation();
                        this._toggle(e);
                    }
                    this._on($items, evtObj);
                }
            },
            _toggleSingle : function( ev ) {
                var state = this.state,
                    opts = state.options,
                    $items = state.$items,
                    $this = $(ev.currentTarget);

                if($this.hasClass(opts.activeCls)) return;

                $items.removeClass(opts.activeCls);
                $this.addClass(opts.activeCls);
                var val = $this.attr(opts.valueName);
                this._trigger('choose', ev, {
                    node : $this[0],
                    value : val
                });
            },
            _toggleMultiple : function( ev ) {
                var state = this.state,
                    opts = state.options,
                    $items = state.$items,
                    $this = $(ev.currentTarget);

                var val = $this.attr(opts.valueName);
                $this.toggleClass(opts.activeCls);
                this._trigger('choose', ev, {
                    node : $this[0],
                    type : $this.hasClass(opts.activeCls) ? 'add' : 'del', //'add'/'del',
                    modValue : val,
                    value : this.getValue()
                });
            }
        },
        public : {
            init : function( opts ){
                if(!opts.target) {
                    this.$element = $(opts.items).parent();
                }
                return this._super( opts );
            },
            _init : function () {
                var state = this.state,
                    opts = state.options;

                this._prepareOption();
                //this._buildHTML();
                //绑定事件
                this._bindEvent();
            },
            _toggle : function( ev ){
                var state = this.state,
                    opts = state.options;

                if(!ev || !ev.currentTarget) return;
                //支持多选
                if(opts.multiple) {
                    this._toggleMultiple( ev );
                } else {
                    this._toggleSingle( ev );
                }
            },
            //单选为一个值，多选为数组
            getValue : function() {
                var state = this.state,
                    opts = state.options,
                    $items = state.$items;

                var vals = $items.map(function(i, dom) {
                    var $this = $(this);
                    if($this.hasClass(opts.activeCls)) {
                        return $this.attr(opts.valueName);
                    }
                }).get();

                if(opts.multiple) {
                    return vals.length ? vals : null;
                } else {
                    return vals[0];
                }
            },
            //forbiddenEvent是否禁止触发choose事件
            setValue : function(val, forbiddenEvent){
                
            },
            setIndex : function(index, forbiddenEvent) {
                
            }
        }
    });
    return C;
});