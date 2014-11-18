/**   
 * @Title: Tip.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-4-3
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./tip.css');

    var $      = require('jquery+'),
        Popup  = require('sib.popup'),
        SIB    = require('sib.sib'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        target : null, //pop弹出框
        trigger : '',
        triggerType : 'hover',  //hover | click
        content : null,     //string | element | function
        position : {
            my: "left top",
            at: "left bottom",
            collision: "flipfit flip"
        },
        theme : 'default',  //blur|red|orange|green|pink|gray
        delay : -1,
        disabled : false,
        effect : 'none',    //none | fade | slide
        duration : 250,
        arrowWidth : 6,     //箭头的宽度
        radiusSize : 6,     //tip的圆角半径
        clsPrefix : 'sib-tip',
        
        ///待实现,可用content代替
        ajax : false, //是否ajax加载数据  {type : 'post', url : '..' , ...}
        closeButton : false, //关闭提示框的关闭按钮
        hideOnClickOutside : true
    };

    var arrowTmpl = '<div class="{clsPrefix}-arrow">' + 
                        '<span class="{clsPrefix}-under"></span>' +
                        '<span class="{clsPrefix}-above"></span>' +
                    '</div>';
    var T, Tip;
    T = Tip = Popup.extend({
        static : {
            widgetName : 'SIBTip',
            require  : require,
            defaults : defaults,
            clsPrefix : 'sib-tip',
            optionFilter : 'target'
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts  = state.options,
                    arrowSelector = '.' + state.mconst.clsPrefix + '-arrow';

                state.$trigger = $(opts.trigger);
                state.$tip     = this.$element;
            },
            _buildHTML : function() {
                var state = this.state,
                    $tip  = state.$tip,
                    opts  = state.options,
                    aTmpl = SIB.unite(arrowTmpl, state.mconst);

                state.$arrow = $(aTmpl).appendTo($tip);
                this.$element.addClass(opts.theme);
            },
            _syncPosition : function() {
                var state = this.state,
                    opts  = state.options,
                    $arrow= state.$arrow,
                    allCls= '{clsPrefix}-left {clsPrefix}-right {clsPrefix}-top {clsPrefix}-bottom',
                    allCls= SIB.unite(allCls, state.mconst),
                    self  = this,
                    size  = opts.arrowWidth,
                    dist  = opts.arrowWidth + opts.radiusSize;//箭头离边的最小距离(宽度6 + 圆角6)

                $arrow.removeClass(allCls);
                $arrow.hide();
                this.$element.position($.extend({
                    of : state.$activeTrigger,
                    using : function(position, feedback) {
                        var t       = feedback.target,
                            tip     = feedback.element,
                            tr      = getRange(t),
                            tipr    = getRange(tip),
                            h       = feedback.horizontal,
                            v       = feedback.vertical,
                            ip      = feedback.important,
                            pos     = $.extend({}, position),
                            cls     = '',//箭头方向
                            isVertical = false, //箭头是垂直方向还是水平方向
                            tRange,
                            tipRange;

                        if(tr.left > tipr.right && tr.top > tipr.bottom) {//左上
                            
                        } else if(tr.right < tipr.left && tr.top > tipr.bottom) { //右上
                            
                        } else if(tr.bottom < tipr.top && tr.right < tipr.left) { //右下
                            
                        } else if(tr.left > tipr.right && tr.bottom < tipr.top) {   //左下
                            
                        } else if(tr.top >= tipr.bottom) {   //上
                            cls = 'bottom';
                        } else if(tr.right <= tipr.left) {   //右
                            cls = 'left';
                        } else if(tr.bottom <= tipr.top) {   //下
                            cls = 'top';
                        } else if(tr.left >= tipr.right) {   //左
                            cls = 'right';
                        } else { //tip与trigger相交
                            var crossRange = getCrossRange(tr, tipr);
                            if(crossRange.width > crossRange.height) { //相交区域比较宽,箭头优先设置在上/下,其次左右
                                if(tipr.top > tr.top && tipr.top < tr.bottom) {//箭头向上
                                    cls = 'top';
                                } else if(tipr.bottom > tr.top && tipr.bottom < tr.bottom) {
                                    cls = 'bottom';
                                } else if(tipr.left > tr.left && tipr.left < tr.right) {
                                    cls = 'left';
                                } else if(tipr.right > tr.left && tipr.right < tr.right) {
                                    cls = 'right';
                                }
                            } else {
                                if(tipr.left > tr.left && tipr.left < tr.right) {
                                    cls = 'left'
                                } else if(tipr.right > tr.left && tipr.right < tr.right) {
                                    cls = 'right';
                                } else if(tipr.top > tr.top && tipr.top < tr.bottom) {//箭头向上
                                    cls = 'top';
                                } else if(tipr.bottom > tr.top && tipr.bottom < tr.bottom) {
                                    cls = 'bottom';
                                }
                            }
                            
                            if(cls == 'left' || cls == 'right') {
                                tipRange = {
                                    min : crossRange.top,
                                    max : crossRange.bottom
                                }
                            } else if(cls == 'top' || cls == 'bottom') {
                                tipRange = {
                                    min : crossRange.left,
                                    max : crossRange.right
                                }
                            }
                        }

                        //调整tip的位置
                        if(cls == 'left') {
                            pos.left += size;
                        } else if(cls == 'right') {
                            pos.left -= size;
                        } else if(cls == 'top') {
                            pos.top += size;
                        } else if(cls == 'bottom') {
                            pos.top -= size;
                        }
                        $( this ).css( pos );

                        //计算arrow的位置
                        if(cls) {
                            $arrow.addClass(SIB.unite('{clsPrefix}-' + cls, state.mconst)).show();
                            if(cls == 'left' || cls == 'right') {
                                tRange = {
                                    min : tr.top,
                                    max : tr.bottom
                                };
                                tipRange = $.extend({
                                    min : tip.top,
                                    max : tipr.bottom
                                }, tipRange ||{});
                                var top = getPointV(tRange, tipRange);
                                top -= tipr.top;//tipRange.min;
                                if(top < dist) {
                                    top = dist;
                                } else if(top > (tipr.height - dist)) {
                                    top = tipr.height - dist;
                                }
                                $arrow.css('top', top);
                            } else {
                                tRange = {
                                    min : tr.left,
                                    max : tr.right
                                };
                                tipRange = $.extend({
                                    min : tipr.left,
                                    max : tipr.right
                                }, tipRange || {});
                                var left = getPointV(tRange, tipRange);
                                left -= tipr.left;//tipRange.min;
                                if(left < dist) {
                                    left = dist;
                                } else if(left > tipr.width - dist) {
                                    left = tipr.width - dist;
                                }
                                $arrow.css('left', left);
                            }
                        }
                    }
                }, opts.position));

                //得到元素的范围
                function getRange(obj) {
                    return $.extend({}, {
                        width : obj.width,
                        height : obj.height,
                        left : obj.left,
                        top : obj.top,
                        right : obj.left + obj.width,
                        bottom : obj.top + obj.height
                    });
                }
                //得到两个矩形相交区域
                function getCrossRange(rect1, rect2) {
                    var ha = [rect1.left, rect1.right, rect2.left, rect2.right];
                    var va = [rect1.top, rect1.bottom, rect2.top, rect2.bottom];
                    ha = ha.sort();
                    va = va.sort();
                    return {
                        left : ha[1],
                        right : ha[2],
                        top : va[1],
                        bottom : va[2],
                        width : ha[2] - ha[1],
                        height : va[2] - va[1]
                    };
                }

                function getPointV(tRange, tipRange) {
                    var value = tRange.min + (tRange.max - tRange.min)/2;
                    var range = {
                        max : Math.min(tRange.max, tipRange.max),
                        min : Math.max(tRange.min, tipRange.min)
                    };
                    if(range.max < range.min) {
                        //没有交叉
                        if(tRange.min > tipRange.max) {
                            value = tipRange.max;
                        } else {
                            value = tipRange.min;
                        }
                    } else if(range.min > value || range.max < value) {
                        //有交叉,但非最佳点,找离中心最近的
                        if(Math.abs(range.max - value) > Math.abs(range.min - value)) {
                            value = range.min;
                        } else {
                            value = range.max;
                        }
                    }
                    return value;
                }
            }
        },
        public : {
            
        }
    });
    return T;
});
