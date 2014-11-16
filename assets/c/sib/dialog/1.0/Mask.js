/**   
 * @Title: Dialog.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-2-11
 */
define(function(require, exports, module){

    //导入依赖样式资源
    require('css!./dialog.css');
    
    var $      = require('../../core/1.0/jQuery+'),
        SIB    = require('../../core/1.0/Sib'),
        Widget = require('../../core/1.0/Widget'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        width: isIE6 ? $(d).outerWidth(true) : "100%",
        height: isIE6 ? $(d).outerHeight(true) : "100%",
        className: "sib-mask",
        opacity: .2,
        backgroundColor: "#000",
        position: isIE6 ? "absolute" : "fixed",
        top: 0,
        left: 0
    };
    var ua = (window.navigator.userAgent || "").toLowerCase(), 
        isIE6 = ua.indexOf("msie 6") !== -1;

    var Mask = Widget.extend({
        static : {
            widgetName : 'SIBMask',
            require : require,
            optionFilter : 'target',
            defaults : defaults,
            template : '<div></div>'
        },
        private : {
            _buildHtml : function(){
                var state = this.state,
                    $el = this.$element,
                    opts = state.options;

                $el.css({
                    height : opts.height,
                    width : opts.width,
                    opacity: opts.opacity,
                    backgroundColor : opts.backgroundColor,
                    position: opts.position,
                    top: 0,
                    left: 0
                });
                $el.addClass('sib-mask');
            },
            _bindEvents : function(){
                this._on({
                    'click' : function(e){
                        this._trigger('maskfoucs', e,  {
                            $dialog : this.state.$dialog
                        });
                    }
                });
            }
        },
        public : {
            _init : function(){
                this._buildHtml();
                this._bindEvents();
            },
            zIndex : function(zIndex){
                var zi = +zIndex || 1;
                this.$element.css({
                    zIndex : zi
                });
            },
            show: function() {
                var state = this.state;
                if(!state.rendered) {
                    this.render();
                }
                this.$element.show();
            },
            showAfter : function(item){
                item && this.$element.insertAfter(item).show();
            },
            showBefore : function(item){
                item && this.$element.insertBefore(item).show();
            },
            maskTo : function(item, zIndex){
                this.state.$dialog = $(item);
                var zIndex = zIndex || $(item).css('z-index');
                this.showBefore(item);
                this.zIndex(zIndex);
            },
            hide : function(){
                this.$element.hide();
            }
        }
    });

    return Mask;
});
