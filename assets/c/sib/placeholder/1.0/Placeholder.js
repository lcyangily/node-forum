/**   
 * @Title: Pin.js 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-4-10
 * @version V1.0
 */
define(function(require, exports, module){
    //导入依赖样式资源
    require('css!./placeholder.css');

    var $      = require('../../core/1.0/jQuery+'),
        Widget = require('../../core/1.0/Widget'),
        SIB    = require('../../core/1.0/Sib'),
        w      = (function(){return this})(), 
        d      = w.document;

    var defaults = {
        target : null,
        labelTmpl : '<label class="{clsPrefix}-text">&nbsp;</label>',
        wrapTmpl : '<span class="{clsPrefix}-wrap"></span>',
        width : 'auto',
        height : 'auto',
        position : {}
    };
    
    var support = 'placeholder' in d.createElement('input');

    var P, Placeholder;
    P = Placeholder = Widget.extend({
        static : {
            require : require,
            widgetName : 'SIBPlaceholder',
            defaults : defaults,
            clsPrefix : 'sib-placeholder'
        },
        private : {
            _prepareOption : function() {},
            _buildHTML : function() {
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    iptId,
                    $label;

                $label = state.$label = $(SIB.unite(opts.labelTmpl, this.constructor));
                iptId  = $el.attr('id');
                if(!iptId) {
                    iptId = 'Sib_ph_' + new Date().getTime();
                    $el.attr(iptId);
                }

                var $wrap;
                if(opts.wrapTmpl) {
                    $el.wrap(SIB.unite(opts.wrapTmpl, this.constructor));
                }
                $wrap = $el.parent();
                if($.inArray($wrap.css('position'), ['absolute', 'relative']) == -1) {
                    $wrap.css('position', 'relative');
                }
                $label.attr('for', iptId);
                $label.insertAfter($el);
            },
            _bindEvent : function() {
                var state = this.state,
                    $el   = this.$element;

                this._on({
                    //'input' : evtChk, //IE貌似不能识别input,用keyup代替
                    'blur'  : evtChk,
                    'focus' : evtChk,
                    'keyup' : evtChk
                });

                function evtChk() {
                    SIB.later(this.check, 0, false, this);
                }
            },
            _resize : function(){
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    $label= state.$label;

                $label.outerWidth((opts.width != 'auto' && opts.width > 0) ? opts.width : $el.width());
                $label.outerHeight((opts.height != 'auto' && opts.height > 0) ? opts.height : $el.height());
            },
            _syncPosition : function(){
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    $label= state.$label,
                    mt = parseInt($el.css('marginTop'), 10) || 0,
                    ml = parseInt($el.css('marginLeft'), 10) || 0,
                    bt = parseInt($el.css('borderTopWidth'), 10) || 0,
                    bl = parseInt($el.css('borderLeftWidth'), 10) || 0,
                    at = 'left+' + (ml+bl) + ' top+' + (mt+bt);

                $label.position($.extend({
                    of : $el,
                    at : at,
                    my : 'left top'
                }, opts.position));
            }
        },
        public : {
            _init : function() {
                if(support) return;
                this._prepareOption();
                this._buildHTML();
                this._bindEvent();
                this.check();
            },
            _refresh : function(){
                
            },
            check : function() {
                var state = this.state,
                    $el   = this.$element;

                if ($el.val() === '') {
                    this.show();
                } else {
                    this.hide();
                }
            }, 
            show : function(){
                var state = this.state,
                    $el   = this.$element,
                    $label= state.$label;
                    
                $label.html($el.attr('placeholder'));
                $label.show();
                this._resize();
                this._syncPosition();
            },
            hide : function(){
                this.state.$label.hide();
            }
        }
    });

    return P;
});