define(function(require, exports, module){
    var $ = require('../../core/1.0/jQuery+');
    /**
     * Static attributes
     */
    var Effect = {
        // 普通的数字效果
        normal: {
            paint: function () {
                var state = this.state,
                    self  = this,
                    content;

                // 找到值发生改变的hand
                $.each(state.hands, function (idx, hand) {
                    if (hand.lastValue !== hand.value) {
                        // 生成新的markup
                        content = '';

                        $.each(self._toDigitals(hand.value, hand.bits), function (idx, digital) {
                            content += self._html('digit', digital);
                        });

                        // 并更新
                        hand.node.html(content);
                    }
                });
            }
        },
        // 滑动效果
        slide: {
            paint: function () {
                var state = this.state,
                    self = this,
                    content, bits,
                    digitals, oldDigitals;

                // 找到值发生改变的hand
                $.each(state.hands, function (idx, hand) {
                    if (hand.lastValue !== hand.value) {
                        // 生成新的markup
                        content = '';
                        bits = hand.bits;
                        digitals = self._toDigitals(hand.value, bits);
                        if (hand.lastValue === undefined) {
                            oldDigitals = digitals;
                        } else {
                            oldDigitals = self._toDigitals(hand.lastValue, bits);
                        }

                        while (bits--) {
                            if (oldDigitals[bits] !== digitals[bits]) {
                                content = self._html('slide-wrap', [self._html('digit', digitals[bits]), self._html('digit', oldDigitals[bits])]) + content;
                            } else {
                                content = self._html('digit', digitals[bits]) + content;
                            }
                        }

                        // 并更新
                        hand.node.html(content);
                    }
                });
                
                Effect.slide.afterPaint.apply(self);
            },
            afterPaint: function () {
                // 找到值发生改变的hand
                $.each(this.state.hands, function (idx, hand) {
                    if (hand.lastValue !== hand.value && hand.lastValue !== undefined) {
                        var node = hand.node,
                            height = node.find('[data-cd-role=digit]').eq(0).height();

                        node.css('height', height);
                        var $wraps = node.find('[data-cd-role=slide-wrap]');
                        $wraps.css('top', -height);
                        $wraps.animate({
                            top : 0
                        }, 500);
                    }
                });
            }
        }
        // 翻牌效果，
        // 逼真的话需要实现DOM节点的缩放效果，性价比不高
/*
// 只翻数字
<s class="flip-wrap">
    to be update...
</s>
// 翻指针
<s class="hand">
    <s class="handlet new">
        <s class="digital digital-1"></s>
        <s class="digital digital-9"></s>
    </s>
    <s class="handlet old">
        <s class="digital digital-2"></s>
        <s class="digital digital-0"></s>
    </s>
    <s class="handlet mask">
        <s class="digital digital-2"></s>
        <s class="digital digital-0"></s>
    </s>
</s>
*/
        /*flip: {
            paint: function () {
                var me = this,
                    m_mask, m_new, m_old;

                // 找到值发生改变的hand
                S.each(me.hands, function (hand) {
                    if (hand.lastValue !== hand.value) {
                        // 生成新的markup
                        m_mask = '';
                        m_new = '';
                        m_old = '';

                        S.each(me._toDigitals(hand.value, hand.bits), function (digital) {
                            m_new += me._html(digital, '', 'digital');
                        });
                        if (hand.lastValue === undefined) {
                            // 更新
                            hand.node.html(m_new);
                        } else {
                            m_new = me._html(m_new, 'handlet');
                            S.each(me._toDigitals(hand.lastValue, hand.bits), function (digital) {
                                m_old += me._html(digital, '', 'digital');
                            });
                            m_mask = me._html(m_old, 'handlet mask');
                            m_old = me._html(m_old, 'handlet');

                            // 更新
                            hand.node.html(m_new + m_old + m_mask);
                        }
                    }
                });
                
                Effect.flip.afterPaint.apply(me);
            },
            afterPaint: function () {
                // 找到值发生改变的hand
                S.each(this.hands, function (hand) {
                    if (hand.lastValue !== hand.value && hand.lastValue !== undefined) {
                        // 然后给它们添加动画效果
                        var node = hand.node,
                            ns = node.all('.handlet'),
                            n_new = ns.item(0),
                            n_old = ns.item(1),
                            n_mask = ns.item(2),
                            width = node.width(),
                            height = node.height(),
                            h_top = Math.floor(height / 2),
                            h_bottom = height - h_top;

                        // prepare
                        n_old.css({
                            clip: 'rect(' + h_top + 'px, ' + width + 'px, ' + height + 'px, 0)'
                        });

                        // 动画一，上半部分
                        n_mask.css({
                            overflow: 'hidden',
                            height: h_top + 'px'
                        });
                        n_mask.animate({
                            top: h_top + 'px',
                            height: 0
                        }, 0.15, 'easeNone', function () {
                            // 动画二，下半部分
                            n_mask.html(n_new.html());
                            n_mask.css({
                                top: 0,
                                height: h_top + 'px',
                                clip: 'rect(' + h_top + 'px, ' + width + 'px, ' + height + 'px, 0)'
                            });
                            n_mask.animate('height: ' + height + 'px', 0.3, 'bounceOut');
                        });
                    }
                });
            }
        }*/
    };

    return Effect;
});
