/**   
 * @Title: ProgressBar.js 
 * @Description: ProgressBar
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-8-1 下午1:11:16 
 * @version V1.2
 */

define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./ProgressBar.css');
    
    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        SIB    = require('sib.sib'),
        w = (function(){return this;})(), d = w.document;

    var defaults = {
        cssRule : {
            "0-30"  : 'orange', //0%-30% 颜色为 orange
            "30-50" : 'yellow',
            "50-90" : 'green',
            "90-100": 'red',
            "100"   : 'red'
        },
        easing : 'swing',
        
        //callback
        onChange : function(){}  //当进度发生改变时触发的事件
    };

    var P, ProgressBar;
    P = ProgressBar = Widget.extend({
        static : {
            widgetName : 'SIB.ProgressBar',
            require : require,
            defaults : defaults
        },
        private : {
            _prepareOption : function(){
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element;

                state.cssRuleArray = [];
                //获取事件
                if(!opts.onChange && $el.attr('onChange')) {
                    var codeStr = $el.attr('onChange').replace(/\(.*\)/igm, "");
                    codeStr = "return " + codeStr;
                    try{
                        opts.onChange = (new Function(codeStr))();
                    } catch(err){}
                }

                /*** 获取记录样式规则 begin ***/
                //var arr = [{start: 10, end : 20, css : ''}, ...]
                if($el.attr('cssRule')) opts.cssRule = $el.attr('cssRule');
                
                if(typeof opts.cssRule === 'string') {
                    try {
                        opts.cssRule = (new Function("return " + opts.cssRule))();
                    }catch(e) {
                        opts.cssRule = defaults.cssRule;
                    }
                }
                if(opts.cssRule) {
                    var start,
                        end, 
                        css;
                    for(var i in opts.cssRule) {
                       var arr = ("" + i).split("-");
                       start = end = SIB.trim(arr[0]);
                       css = opts.cssRule[i];
                       if(arr) {
                           start = end = parseInt(arr[0]);
                           if(arr.length > 1) {
                               end = parseInt(arr[1]);
                           }
                           //交换start和end
                           if(start > end) {
                               start = start + end;
                               end = start - end;
                               start = start - end;
                           }
                       }
                       state.cssRuleArray.push({
                           start : start, 
                           end : end, 
                           css : css
                       });
                    }
                }
                /*** 获取记录样式规则 end ***/
                opts.value && (state.value = parseInt(''+opts.value));
                if(!opts.value && $el.attr("data-value")) 
                    state.value = $el.attr("data-value");
                state.value = state.value || 0;
            },
            _buildHtml : function() {
                var state = this.state,
                    $el   = this.$element,
                    tmpl = $("<div class='a-progress-outer'>" + 
                                "<div class='a-progress-shade'>" +
                                    "<div class='a-progress-shade-l'></div>" +
                                    "<div class='a-progress-shade-r'></div>" +
                                "</div>" +
                                "<div class='a-progress'>" +
                                    "<div class='a-progress-txt'>0</div>" +
                                    "<div class='a-progress-l'></div>" +
                                    "<div class='a-progress-r'></div>" +
                                "</div>" +
                            "</div>");
    
                var $progress = state.$progress = $(tmpl);
                state.$txt   = $progress.find(">.a-progress>.a-progress-txt"),
                state.$inner = $progress.find(">.a-progress"),
                $el.append($progress);
            },
            _setValue : function(val) {
                var state = this.state,
                    opts = state.options,
                    $progress = state.$progress,
                    $txt = state.$txt,
                    $inner = state.$inner,
                    cssRuleArray = state.cssRuleArray, 
                    self = this,
                    _showRuleCss = self._showRuleCss;
                
                if(val < 0) {
                    val = 0;
                } else if(val > 100) {
                    val = 100;
                }
                var oldValue = state.value;
                state.value = val;
                if(oldValue != val) {
                    this._trigger('onChange', null, {
                        oldValue : oldValue,
                        newValue : val
                    });
                }

                $inner.stop();
                $inner.animate({
                    width : val + "%"
                },{ 
                    speed: 'slow',
                    step: function(now,fx) {
                        //txt.html(("" + now).replace(/([0-9]*\.[0-9]{2})[0-9]*/, RegExp.$1));
                        $txt.html(parseInt(now) + "%");
                        $(this).css("overflow", "visible");//jquery在改变大小的时候,会将overflow设置为hidden
                        _showRuleCss.call(self, now);//jquery动画是setTimeout实现,公共方法执行完了,私有方法已经被删除了
                    },
                    complete : function(){
                        if(val == 0) {
                            $progress.addClass("a-progress-null");
                        } else {
                            $progress.removeClass("a-progress-null");
                        }
                    }
                });
            },
            _showRuleCss : function(val) {
                var state = this.state,
                    opts = state.options,
                    $progress = state.$progress,
                    cssRuleArray = state.cssRuleArray;
                
                if(state.cssRuleCurCss) {
                    $progress.removeClass(state.cssRuleCurCss);
                }
                for(var i in cssRuleArray) {
                    var rule = cssRuleArray[i];
                    if(rule) {
                        if((val > rule.start && val <= rule.end) || (val == rule.end)) {
                            state.cssRuleCurCss = rule.css;
                            break;
                        }
                    }
                }
                $progress.addClass(state.cssRuleCurCss);
            }
        },
        public : {
            //初始化
            _init : function() {
                var state = this.state;

                this._prepareOption();
                this._buildHtml();
                this.setValue(state.value);
            },
            setValue : function(value) {
                this._setValue(value);
            },
            getValue : function() {
                return this.state.value;
            }
        }
    });

    return P;
});
