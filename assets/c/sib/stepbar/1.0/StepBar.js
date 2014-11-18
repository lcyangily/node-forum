/**   
 * @Title: StepBar.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-10-25
 * @desc 原先sib-step 步骤是由ul>li结构，li为inline-block,里面有元素margin:0px auto;时候IE6,7有bug.
 *       BUG：li宽度不设置, 里面元素有margin:0px auto;属性则li宽度撑成100%;导致变形
 *       现将ul>li 结构改成table>tr>td结构。
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./StepBar.css');
    
    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        SIB    = require('sib.sib'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        threme : 'default', //主题样式default, point 对应具体样式为sib-stepbar-default,sib-stepbar-point 
        allColors : ['orange','blue','green','red','pink','gray'],
        color : 'blue', //主题颜色风格
        stepsSelector : '>li',
        nodes : null,
        labelName : 'label',
        valueName : 'value',
        border : true,
        width : 'auto',
        minWidth : 300,
        stepWidth : 'auto',
        stepMinWidth : 50,
        height : 'auto',
        minHeight : 200,
        act : 0, //当前第几步, 从1开始。 1,2,3...  0未开始,nodes.length + 1 结束
        
        //callback
        renderAfter : null, //function(evt, param)
        //onActionBefore : null, //function
        //onActionAfter : null,  //function
        onStepClick : null  //function(node, nodes){}
    };

    var S, StepBar;
    S = StepBar = Widget.extend({
        static : {
            widgetName : 'SIBStepBar',
            require : require,
            defaults : defaults
        },
        private : {
            _prepareOption : function() {
                var state = this.state, 
                    opts = state.options, 
                    $el = this.$element;

                //初始化nodes
                if(!opts.nodes) {
                    opts.nodes = [];
                    var $steps = $el.find(opts.stepsSelector); //此处的原始$steps将隐藏，会重新生成HTML
                    for(var i = 0; i < $steps.length; i++) {
                        var $step = $steps.eq(i);
                        opts.nodes.push({
                            //index : i,
                            value : i,
                            //title : $step.html(),
                            label : $step.html()//,
                            //zIndex : $steps.length - i
                        });
                    }
                }
                
                //在所有可选色里没有当前颜色,则将当前颜色纳入所有可选色
                if($.inArray(opts.color, opts.allColors) == -1){
                    opts.allColors.push(opts.color);
                }

                state.nodes = [];
                //克隆nodes到state. opts中的nodes保持不变,保证用户原始入参数据不改变
                for(var i = 0; i < opts.nodes.length; i++) {
                    state.nodes.push({
                        index : i,
                        isFormatter : true,
                        value : SIB.getLocationValue(opts.valueName, opts.nodes[i]),
                        label : SIB.getLocationValue(opts.labelName, opts.nodes[i]),
                        orig : $.extend(true, {}, opts.nodes[i])
                    });
                }

                //初始化当前第几步
                state.act = opts.act || Number($el.attr('data-act')) || 0;
                state.COMPLETE = state.nodes.length + 1;
            },
            //构造HTML
            _buildHTML : function() {
                var state = this.state, 
                    opts = state.options, 
                    $el = this.$element, 
                    wraptmpl = '<div class="sib-stepbar-container">' + 
                                   '<p class="sib-stepbar-leftbtn"></p>' +
                                   '<div class="sib-stepbar-wrap">' +
                                       '<table class="sib-stepbar" border="0" cellspacing="0" cellpadding="0"><tr></tr></table>' +
                                   '</div>' +
                                   '<p class="sib-stepbar-rightbtn"></p>' +
                               '</div>';

                var $container = state.$container = $(wraptmpl),
                    $wrap = state.$wrap = $container.find('>.sib-stepbar-wrap'),
                    $stepbar = state.$stepbar = $wrap.find('>table.sib-stepbar'),
                    $leftBtn = state.$leftBtn = $container.find('>.sib-stepbar-leftbtn'),
                    $rightBtn = state.$rightBtn = $container.find('>.sib-stepbar-rightbtn');

                this._showData();

                if(!opts.border) {
                    $container.addClass('sib-stepbar-noborder');
                }

                this.setThreme(opts.threme);
                $el.before($container);
                $el.hide();
            }, 
            _showData : function(){ //显示数据
                var state = this.state, 
                    $stepbar = state.$stepbar, 
                    steptmpl = '<td class="sib-step">' +
                                   '<span class="sib-step-txt"></span>' +
                                   '<span class="sib-step-ext"></span>' +
                                   '<div class="sib-step-trigon">'+
                                       '<span class="sib-trigon-under"></span>' +
                                       '<span class="sib-trigon-above"></span>' +
                                   '</div>' +
                               '</td>';
                
                $stepbar.find('tr').empty();
                var len = state.nodes.length;
                for(var i = 0; i < len; i++) {
                    var node = state.nodes[i];
                    var $step = node.$step = $(steptmpl);
                    $step.css('zIndex', len - node.index).find('>span.sib-step-txt').html(node.label);
                    $step.appendTo($stepbar.find('tr'));
                    $step.data('state', node); //$step保存 node[i]
                }
                $stepbar.find('td:first').addClass('sib-step-first');
                $stepbar.find('td:last').addClass('sib-step-last');
            },
            _bindEvents : function(){
                var state = this.state,
                    $container = state.$container,
                    $stepbar   = state.$stepbar,
                    $wrap      = state.$wrap,
                    $leftBtn   = state.$leftBtn,
                    $rightBtn  = state.$rightBtn, 
                    opts       = state.options,
                    self       = this;

                //if(state.hasXscroll) {
                //添加鼠标移上去显示改变左右按钮样式
                this._on($container, {
                    'mouseenter' : function(e){
                        $leftBtn.addClass('sib-stepbar-leftbtn-hover');
                        $rightBtn.addClass('sib-stepbar-rightbtn-hover');
                    },
                    'mouseleave' : function(e){
                        $leftBtn.removeClass('sib-stepbar-leftbtn-hover');
                        $rightBtn.removeClass('sib-stepbar-rightbtn-hover');
                    },
                    'mousedown .sib-stepbar-rightbtn' : function(e){
                        clearTimer();
                        var i = 0;
                        state.timer = setInterval(function(){
                            $wrap.scrollLeft($wrap.scrollLeft() + i+5);
                        }, 2);
                    },
                    'mousedown .sib-stepbar-leftbtn' : function(e){
                        clearTimer();
                        var i = 0;
                        state.timer = setInterval(function(){
                            $wrap.scrollLeft($wrap.scrollLeft() - (i+5));
                        }, 2);
                    },
                    'mouseup .sib-stepbar-rightbtn' : clearTimer,
                    'mouseout .sib-stepbar-rightbtn' : clearTimer,
                    'mouseup .sib-stepbar-leftbtn' : clearTimer,
                    'mouseout .sib-stepbar-leftbtn' : clearTimer 
                });

                this._on($stepbar, {
                    'click .sib-step' : function( evt ){
                        var $this = $(evt.currentTarget);
                        if(typeof opts.onStepClick === 'function') {
                            var cr = opts.onStepClick.call(this, $this.data('state'), state.nodes);
                            if(cr === false) { //返回false,则操作终止
                                return;
                            }
                        }
                        
                        $stepbar.find('.sib-step').removeClass('sib-step-selected');
                        $this.addClass('sib-step-selected');
                        state.selectedNode = $this.data('state');
                    }
                });

                //resize
                if(opts.width == 'auto' || opts.width == '100%') {
                    $(w).resize((function(){
                        var windowWidth = $(window).width();
                        return function(){
                            var wWidth = $(window).width();
                            if($container.is(':visible') && wWidth != windowWidth) {
                                windowWidth = wWidth;
                                self.resize();
                            }
                        }
                    })());
                }

                function clearTimer() {
                    if(state.timer) {
                        clearInterval(state.timer);
                    }
                }
            },
            //刷新步骤条样式
            _refreshView : function () {
                var state = this.state, 
                    opts  = state.options, 
                    $stepbar = state.$stepbar, 
                    nodes    = state.nodes, 
                    itemLen  = nodes.length, 
                    cls = opts.statusCls, 
                    act = state.act;

                if(!itemLen) return false;
                
                $stepbar.removeClass(opts.allColors.join(' '));
                $stepbar.addClass(opts.color);
                
                if(act == '' || act > itemLen+1 || act < 1){
                    return 0;
                }
                act --;
                
                for(var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    node.$step.removeClass('sib-step-current sib-step-done');

                    if(i < act) {
                        node.$step.addClass('sib-step-done');
                    } else if(act == i) {
                        node.$step.addClass('sib-step-current');
                    }
                }
            },
            _triggerRenderAfter : function(){
                var self = this;
                SIB.later(function(){
                    self._trigger('renderAfter', null, {
                        nodes : self.state.nodes
                    });
                }, 1);
            }
        },
        public : {
            _init : function(){

                this._prepareOption();
                this._buildHTML();
                this.setCurrentIndex(this.state.act);
                this.setSize();
                this._bindEvents();
                this._triggerRenderAfter();
            }, 
            refresh : function(){
                this.reload();
            }, 
            setSize : function() {
                var state = this.state, 
                    opts  = state.options, 
                    $container = state.$container,
                    $wrap = state.$wrap,
                    $stepbar  = state.$stepbar, 
                    $leftBtn  = state.$leftBtn, 
                    $rightBtn = state.$rightBtn, 
                    nodes   = state.nodes, 
                    itemLen = nodes.length, 
                    width = opts.width || $stepbar.width(), 
                    iw;

                //reset begin
                $.each(nodes, function(i, node) {
                    node.$step.width('auto');
                });
                $stepbar.width('auto');
                //reset end
                if(opts.width != 'auto' && Number(opts.width) > 0) {
                    $container.outerWidth(Math.max(opts.width, opts.minWidth));
                } else {
                    if($container.outerWidth() < opts.minWidth) {
                        $container.outerWidth(opts.minWidth);
                    } else {
                        //$container.outerWidth('auto');
                        $container.width('auto');
                    }
                }
                
                $.each(nodes, function(i, node) {
                    if(opts.stepWidth != 'auto' && Number(opts.stepWidth) > 0) {
                        node.$step.outerWidth(Math.max(opts.stepWidth, opts.stepMinWidth));
                    } else { //width auto
                        if(node.$step.outerWidth() < opts.stepMinWidth) {
                            node.$step.outerWidth(opts.stepMinWidth);
                        }
                    }
                });
                
                $wrap.width('auto');
                var innerW = $wrap.innerWidth();
                $wrap.width(10000);

                //无滚动，宽度撑满100%
                if($stepbar.outerWidth() < innerW) {
                    state.hasXscroll = false;
                    var unitW =  Math.floor(innerW / nodes.length);
                    $.each(nodes, function(i, node) {
                        node.$step.outerWidth(unitW);
                    });
                    
                    $leftBtn.hide();
                    $rightBtn.hide();
                } else {
                    state.hasXscroll = true;
                    $leftBtn.show();
                    $rightBtn.show();
                }
                
                $stepbar.outerWidth($stepbar.outerWidth());
                $wrap.width('auto');
            }, 
            resize : function(){
                this.setSize();  
            }, 
            reload : function(nodes){
                var state = this.state,
                    opts = state.options;

                if(nodes) {
                    opts.nodes = nodes;
                }
                
                this._prepareOption();
                this._showData();

                this.setCurrentIndex(state.act);
                this.setSize();
                this._triggerRenderAfter();
                //this._bindEvents();
            }, 
            setCurrentIndex : function(act){
                var state = this.state, 
                    opts = state.options, 
                    $stepbar = state.$stepbar, 
                    nodes = state.nodes;            

                //0未开始, nodes.length + 1 代表已全部完成
                if(act < 0 || act > nodes.length + 1){
                    return false;
                }
                
                state.act = act;
                this._refreshView(act);
                return act;
            }, 
            setCurrentValue : function(val){
                var state = this.state, 
                    opts = state.options, 
                    nodes = state.nodes, 
                    current = -1;

                if(!val) return false;

                for(var i = 0; i < nodes.length; i++) {
                    if(val == nodes[i].value) {
                        current = i;
                        break;
                    }
                }
                if(current >= 0) {
                    this.setCurrentIndex(current + 1);
                    return val;
                }
                return null;
            }, 
            setStyle : function(style) {
                var state = this.state,
                    opts = state.options;
                
                opts.color = style;
                //在所有可选色里没有当前颜色,则将当前颜色纳入所有可选色
                if($.inArray(opts.color, opts.allColors) == -1){
                    opts.allColors.push(opts.color);
                }
                this._refreshView();
            }, 
            setThreme : function( threme ) {
                var state = this.state,
                    $container = state.$container,
                    opts = state.options;
                
                if(!threme) return;
                $container.removeClass('stepbar-' + opts.threme);
                opts.threme = threme;
                $container.addClass('stepbar-' + opts.threme);
            },
            prev : function(){
                var state = this.state, 
                    act = state.act;

                act--;
                this.setCurrentIndex(act);
                return this;
            }, 
            next : function(){
                var state = this.state, 
                    act = state.act;

                act++;
                this.setCurrentIndex(act);
                return this;
            }, 
            complete : function(){
                this.setCurrentIndex(this.state.COMPLETE);
            },
            getCurrent : function(){
                var state = this.state;
                return state.nodes[state.act-1].orig;
            }, 
            getCurrentIndex : function(){
                var state = this.state;
                return state.act;
            }, 
            getNodes : function(){
                return this.state.nodes;
            }
        }
    });
    return StepBar;
});
