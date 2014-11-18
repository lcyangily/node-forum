/**   
 * @Title: Countdown.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-10-17
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./countdown.css');

    var $      = require('jquery+'),
        Sib    = require('sib.sib'),
        Widget = require('sib.widget'),
        JSON   = require('json'),
        Effect = require('sib.countdown.effect'),
        Timer  = require('sib.countdown.timer'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        varReg : /\$\{([\-\w]+)\}/g,
        effect : null,
        clock: ['d', 100, 2, 'h', 24, 2, 'm', 60, 2, 's', 60, 2, 'u', 10, 1],
        leftTime : 0
    };
    var EVENT_AFTER_PAINT = 'afterPaint',
        itemTpl  = '<s data-cd-role="{role}" class="{clsExt} {clsPrefix}-{role}">{content}</s>';
        //digitTpl = '<s data-cd-role="digit" class="{clsPrefix}-digit {clsPrefix}-{role}">{content}</s>';

    var C, Countdown;
    C = Countdown = Widget.extend({
        static : {
            widgetName : 'SIBCountdown',
            require  : require,
            defaults : defaults,
            clsPrefix : 'sib-cd'
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    clock = opts.clock,
                    self  = this,
                    hands = [];
                /**
                 * 指针结构
                 * hand: {
                 *   type: string,
                 *   value: number,
                 *   lastValue: number,
                 *   base: number,
                 *   radix: number,
                 *   bits: number,
                 *   node: S.Node
                 * }
                 */
                state.hands = hands;
                state.frequency = 1000;
                state._notify = [];

                var tpl = $el.html();
                var varReg = opts.varReg;
                varReg.lastIndex = 0;
                $el.html(tpl.replace(varReg, function(str, type){
                    // 时钟频率校正.
                    if (type === 'u' || type === 's-ext') {
                        state.frequency = 100;
                    }

                    // 生成hand的markup
                    var content = '';
                    if (type === 's-ext') {
                        hands.push({type: 's'});
                        hands.push({type: 'u'});
                        content = [self._html('s',     '',  'item-inner'), 
                                   self._html('point', '.', 'item-inner'), 
                                   self._html('u',     '',  'item-inner')];
                    } else {
                        hands.push({type: type});
                    }

                    return self._html(type, content, 'item');
                }));

                $.each(hands, function(idx, hand){
                    var type = hand.type,
                        base = 100, i;
                    hand.node = $el.find('[data-cd-role=' + type + ']').eq(0);

                    for(i = clock.length - 3; i > -1; i -= 3) {
                        if(type == clock[i]) {
                            break;
                        }
                        base *= clock[i+1];
                    }
                    hand.base = base;
                    hand.radix = clock[i + 1];
                    hand.bits = clock[i + 2];
                });

                this._getLeft();
                this._reflow();

                state._reflow = $.proxy(this._reflow, this);
                Timer.add(state._reflow, state.frequency);

                if(opts.effect) {
                    $el.addClass(/*state.mconst.clsPrefix*/'sib-cd-' + opts.effect);
                }
                // 显示时钟.
                $el.show();
            },
            _buildHTML : function() {
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element;
                
            },
            _bindEvent : function(){
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options;
                
                
            },
            /**
             * role-角色, content-内容, isItem-是否是顶层元素,顶层有item样式
             */
            _html: function (role, content, extCss) {
                if ($.isArray(content)) {
                    content = content.join('');
                }

                return Sib.unite(itemTpl, {
                    content   : Sib.isInvalidValue(content) ? '' : content,
                    clsPrefix : 'sib-cd', //state.mconst.clsPrefix
                    clsExt    : extCss ? ('sib-cd' + '-' + extCss) : '',
                    role      : role
                });
            },
            /**
             * 获取倒计时剩余帧数
             */
            _getLeft: function () {
                var state = this.state,
                    opts  = state.options,
                    left = opts.leftTime * 1000,
                    end  = opts.stopPoint;        // 这个是UNIX时间戳，毫秒级
                if (!left && end) {
                    left = end - new Date().getTime();
                }

                state.left = left - left % state.frequency;
            },
            /**
             * 重绘时钟
             * @private
             */
            _repaint: function () {
                var state = this.state,
                    opts  = state.options;
                Effect[opts.effect || 'normal'].paint.apply(this);

                this._trigger(EVENT_AFTER_PAINT);
            },
            /**
             * 把值转换为独立的数字形式
             * @private
             * @param {number} value
             * @param {number} bits
             */
            _toDigitals: function (value, bits) {
                value = value < 0 ? 0 : value;

                var digitals = [];

                // 把时、分、秒等换算成数字.
                while (bits--) {
                    digitals[bits] = value % 10;
                    value = Math.floor(value / 10);
                }

                return digitals;
            },
            /**
             * 倒计时事件
             * @param {number} time unit: second
             * @param {Function} callback
             */
            notify: function (time, callback) {
                var state = this.state;
                time = time * 1000;
                time = time - time % state.frequency;

                var notifies = state._notify[time] || [];
                notifies.push(callback);
                state._notify[time] = notifies;

                return this;
            }
        },
        public : {
            init : function(options){
                var opts = options;
                if(opts && opts.target) {
                    var $el = $(opts.target);
                    var cfg = $el.attr('data-config');
                    if(cfg) {
                        cfg = JSON.parse(cfg.replace(/'/g, '"'));
                    }
                    opts = $.extend(true, cfg, opts);
                }

                this._super(opts);
            },
            _init : function(){
                var state = this.state,
                    $el = this.$element;

                this._prepareOption();
                this._buildHTML();
                this._bindEvent();
            },
            /**
             * 更新时钟
             */
            _reflow: function (count) {
                var state = this.state,
                    self  = this;
                count = count || 0;

                state.left = state.left - state.frequency * count;

                // 更新hands
                $.each(state.hands, function (idx, hand) {
                    hand.lastValue = hand.value;
                    hand.value = Math.floor(state.left / hand.base) % hand.radix;
                });

                // 更新时钟.
                this._repaint();

                // notify
                if (state._notify[state.left]) {
                    $.each(state._notify[state.left], function (callback) {
                        callback.call(self);
                    });
                }

                // notify 可能更新me.left
                if (state.left < 1) {
                    Timer.remove(state._reflow);
                    this._trigger('stop');
                }

                return self;
            }
        }
    });
    return C;
});
