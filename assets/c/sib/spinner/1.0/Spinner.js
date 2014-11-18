/**   
 * @Title: Spinner.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-8-14
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./spinner.css');

    var $      = require('jquery+'),
        SIB    = require('sib.sib'),
        Widget = require('sib.widget'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        target : null, //
        
        culture : null, //string 显示那个国家的格式
        disabled : false,   //boolean
        //icons : ,
        incremental : true, //boolean | function 按住按钮不放是否自动增长,支持自定义函数
        max : null, //
        min : null, //
        value : null,
        //numberFormat : ,
        page : 10,  //按住pageUp/pageDown 增长的单位
        step : 1,   //
        theme : 'default',
        btns : {
            up : null,  //selector | dom | jquery instance
            down : null
        },
        
        //event
        change : null,
        create : null,
        spin : null,
        /** 
         * start 事件改成 changestart IE下input元素trigger会自动有个属性值为fileopen的start属性，
         * 导致报错，参见 jquery1.8.3 2973行 trigger 函数
         */
        changestart : null,
        stop : null
    };

    var tmpl =  '<span">'+
                    '<a href="javascript:;"></a>'+
                    '<a href="javascript:;"></a>'+
                '</span>';
    var proxyFunc = function( fn ){
        return function() {
            var previous = this.$element.val();
            fn.apply( this, arguments );
            this._refresh();
            if ( previous !== this.$element.val() ) {
                this._trigger( "change", null, {
                    oldVal : previous,
                    newVal : this.$element.val()
                });
            }
        };
    };
    var S, Spinner;
    S = Spinner = Widget.extend({
        static : {
            widgetName : 'SIBSpinner',
            require  : require,
            defaults : defaults,
            clsPrefix : 'sib-spin'
        },
        private : {
            _prepareOption : function() {
                var clsPrefix = this.state.mconst.clsPrefix;
                this.state.ALL_CLASS = {
                    WRAP : clsPrefix,
                    BTN_UP : clsPrefix + '-up',
                    BTN_DOWN : clsPrefix + '-down',
                    INPUT : clsPrefix + '-input'
                }
            },
            _buildHTML : function() {
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element,
                    $w, $upBtn, $downBtn;

                $el.attr( "autocomplete", "off" );

                if(opts.btns && opts.btns.down && opts.btns.up) {
                    state.$downBtn = $(opts.btns.down);
                    state.$upBtn   = $(opts.btns.up);
                    $w = state.$wrap = $el.parent();
                } else {
                    $w = state.$wrap = $(SIB.unite(tmpl, state.mconst));
                    $w.insertBefore($el);
                    $w.prepend($el);
                    var $as = $w.find('>a');
                    state.$downBtn = $as.eq(0);
                    state.$upBtn = $as.eq(1);
                    state.$upBtn.addClass(state.ALL_CLASS.BTN_UP);
                    state.$downBtn.addClass(state.ALL_CLASS.BTN_DOWN);
                    $el.addClass(state.ALL_CLASS.INPUT);
                    $w.addClass(state.ALL_CLASS.WRAP);
                    //btn都是高度50%， IE6需要设置外面高度为定值 IE6 bug
                    $w.outerHeight($w.outerHeight());
                }

                $w.addClass(opts.theme);

                if(opts.disabled) {
                    this.disable();
                }
            },
            _bindEvent : function(){
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    $downBtn = state.$downBtn,
                    $upBtn= state.$upBtn;
                
                var mousewheelTimer = state.mousewheelTimer = SIB.buffer(function(){
                    if ( state.spinning ) {
                        this._stop( event );
                    }
                }, 100, this);

                this._on({
                    keydown: function( event ) {
                        if ( this._start( event ) && this._isActionKeydown( event ) ) {
                            event.preventDefault();
                        }
                    },
                    keyup: function( event ){
                        this._stop();
                        var keyCode = SIB.keyCode;
                        switch( event.keyCode ) {
                        case keyCode.PAGE_UP:
                        case keyCode.PAGE_DOWN:
                        case keyCode.UP:
                        case keyCode.DOWN:
                        case keyCode.ENTER:
                        case keyCode.NUMPAD_ENTER:
                        case keyCode.TAB:
                        case keyCode.ESCAPE:
                        case keyCode.LEFT:
                        case keyCode.RIGHT:
                        case keyCode.END:
                            break;
                        default:
                            this._trigger('inputchange');
                            break;
                        }
                    },
                    input : function( event ){
                        this._trigger('inputchange');
                    },
                    //避免input 和 keyup 同时出发，每次都出发两次，但也不能用SIB.buffer，因为需要实时校验
                    inputchange : SIB.fixInterval(function(){
                        //this._value(this.$element.val(), false);
                        this.value(this.$element.val());
                    }),
                    focus: function() {
                        state.previous = $el.val();
                    },
                    blur: function( event ) {
                        if ( state.cancelBlur ) {
                            delete state.cancelBlur;
                            return;
                        }

                        this._stop();
                        this._refresh();
                        if ( state.previous !== $el.val() ) {
                            this._trigger( "change", event, {
                                newVal : $el.val(),
                                oldVal : state.previous
                            });
                        }
                    },
                    mousewheel: function( event, delta ) {
                        if ( !delta ) {
                            return;
                        }
                        if ( !state.spinning && !this._start( event ) ) {
                            return false;
                        }

                        this._spin( (delta > 0 ? 1 : -1) * opts.step, event );
                        state.mousewheelTimer();
                        event.preventDefault();
                    }
                });

                var $btns = $($upBtn[0]).add($downBtn);
                this._on($btns, {
                    'mouseleave' : '_stop',
                    'mouseup' : '_stop',
                    'mousedown' : function( event ) {
                        var previous;

                        //点击按钮时，让input获取焦点,this.previous应该为input第一次focus的值，
                        //再次点击btn，inout再次获取焦点，这时候this.previous不能是input的val,而是第一次focus的值
                        previous = $el[0] === d.activeElement ? state.previous : $el.val();
                        function checkFocus() {
                            var isActive = $el[0] === d.activeElement;
                            if ( !isActive ) {
                                $el.focus();
                                state.previous = previous;
                                // support: IE
                                // IE sets focus asynchronously, so we need to check if focus
                                // moved off of the input because the user clicked on the button.
                                setTimeout(function() {
                                    state.previous = previous;
                                },0);
                            }
                        }

                        // 确保输入焦点在input上
                        event.preventDefault();
                        checkFocus.call( this );

                        // support: IE
                        // IE doesn't prevent moving focus even with event.preventDefault()
                        // so we set a flag to know when we should ignore the blur event
                        // and check (again) if focus moved off of the input.
                        state.cancelBlur = true;
                        setTimeout(function() {
                            delete state.cancelBlur;
                            checkFocus.call( this );
                        }, 0);

                        if ( this._start( event ) === false ) {
                            return;
                        }

                        this._repeat( null, event.currentTarget == $upBtn[0] ? 1 : -1, event );
                    },
                    "mouseenter": function( event ) {
                        // button will add ui-state-active if mouse was down while mouseleave and kept down
                        if ( !$( event.currentTarget ).hasClass( "ui-state-active" ) ) {
                            return;
                        }

                        if ( this._start( event ) === false ) {
                            return false;
                        }
                        this._repeat( null, event.currentTarget == $upBtn[0] ? 1 : -1, event );
                    }
                });
            },
            _parse: function( val ) {
                if(typeof val === 'string' && val !== '') {
                    val = parseFloat(val, 10);
                }
                return val === "" || isNaN( val ) ? null : val;
            },
            _adjustValue: function( value ) {
                var base, aboveMin,
                    state = this.state,
                    opts  = state.options;

                // make sure we're at a valid step
                // - find out where we are relative to the base (min or 0)
                base = opts.min !== null ? opts.min : 0;
                aboveMin = value - base;
                // - round to the nearest step
                aboveMin = Math.round(aboveMin / opts.step) * opts.step;
                // - rounding is based on 0, so adjust back to our base
                value = base + aboveMin;

                // fix precision from bad JS floating point math
                value = parseFloat( value.toFixed( this._precision() ) );

                // clamp the value
                if ( opts.max !== null && value > opts.max) {
                    return opts.max;
                }
                if ( opts.min !== null && value < opts.min ) {
                    return opts.min;
                }

                return value;
            },
            _precision: function() {
                var state = this.state,
                    opts  = state.options;
                var precision = this._precisionOf( opts.step );
                if ( opts.min !== null ) {
                    precision = Math.max( precision, this._precisionOf( opts.min ) );
                }
                return precision;
            },
            _precisionOf: function( num ) {
                var str = num.toString(),
                    decimal = str.indexOf( "." );
                return decimal === -1 ? 0 : str.length - decimal - 1;
            },
            _increment: function( i ) {
                var state = this.state,
                    opts  = state.options;
                var incremental = opts.incremental;

                if ( incremental ) {
                    return $.isFunction( incremental ) ?
                        incremental( i ) :
                        Math.floor( i*i*i/50000 - i*i/500 + 17*i/200 + 1 );
                }

                return 1;
            }
        },
        public : {
            _init : function(){
                var state = this.state,
                    $el = this.$element;

                this._value($el.val());
                this._prepareOption();
                this._buildHTML();
                this._bindEvent();
            },
            _start: function( event ) {
                var state = this.state;
                if ( !state.spinning && this._trigger( "changestart", event ) === false ) {
                    return false;
                }

                if ( !state.counter ) {
                    state.counter = 1;
                }
                state.spinning = true;
                return true;
            },
            _stop : function() {
                var state = this.state;
                
                if ( !state.spinning ) {
                    return;
                }

                state.timerLater && state.timerLater.cancel();
                state.mousewheelTimer.stop && state.mousewheelTimer.stop();
                
                state.counter = 0;
                state.spinning = false;
                this._trigger( "stop", event );
            },
            //是否是触发Spinner行为的按键
            _isActionKeydown: function( event ) {
                var state = this.state,
                    opts  = state.options;

                switch ( event.keyCode ) {
                case SIB.keyCode.UP:
                    this._repeat( null, 1, event );
                    return true;
                case SIB.keyCode.DOWN:
                    this._repeat( null, -1, event );
                    return true;
                case SIB.keyCode.PAGE_UP:
                    this._repeat( null, opts.page, event );
                    return true;
                case SIB.keyCode.PAGE_DOWN:
                    this._repeat( null, -opts.page, event );
                    return true;
                }

                return false;
            },
            _repeat: function( i, steps, event ) {
                var state = this.state,
                    opts  = state.options;
                i = i || 500;

                state.timerLater && state.timerLater.cancel();
                state.timerLater = SIB.later(function() {
                    this._repeat( 40, steps, event );
                }, i , 0,  this);

                this._spin( steps * opts.step, event );
            },
            _spin: function( step, event ) {
                var state = this.state,
                    value = this.value() || 0;

                if ( !state.counter ) {
                    state.counter = 1;
                }

                value = this._adjustValue( value + step * this._increment( state.counter ) );

                if ( !state.spinning || this._trigger( "spin", event, { value: value } ) !== false) {
                    this._value( value );
                    state.counter++;
                }
            },
            //没有触发change 事件改变值
            _value: function( value, allowAny ) {
                var parsed,
                    $el  = this.$element,
                    opts = this.state.options;
                if ( value !== "" ) {
                    parsed = this._parse( value );
                    if ( parsed !== null ) {
                        if ( !allowAny ) {
                            parsed = this._adjustValue( parsed );
                        }
                        //value = this._format( parsed );
                        //value = parsed;
                    }
                    value = parsed;
                }
                if(value === '' || value === null) {
                    var del = !SIB.isInvalidValue(opts.value) ? opts.value : (!SIB.isInvalidValue(opts.min) ? opts.min : 0);
                    $el.val(del);
                } else {
                    $el.val( value );
                }
            },
            _stepUp: function( steps ) {
                if ( this._start() ) {
                    this._spin( (steps || 1) * this.state.options.step );
                    this._stop();
                }
            },
            _stepDown: function( steps ) {
                if ( this._start() ) {
                    this._spin( (steps || 1) * -this.state.options.step );
                    this._stop();
                }
            },
            _refresh : function(){},
            destroy : function(){},
            disable : function(){},
            enable : function(){},
            pageDown : proxyFunc(function( pages ){
                this._stepDown( (pages || 1) * this.options.page );
            }),
            pageUp : proxyFunc(function( pages ){
                this._stepUp( (pages || 1) * this.options.page );
            }),
            stepDown : proxyFunc(function(){
                this._stepDown( steps );
            }),
            stepUp : proxyFunc(function( steps ){
                this._stepUp( steps );
            }),
            value : function( newVal ){
                if ( !arguments.length ) {
                    return this._parse( this.$element.val() );
                }
                proxyFunc( this._value ).call( this, newVal );
            }
        }
    });
    return S;
});
