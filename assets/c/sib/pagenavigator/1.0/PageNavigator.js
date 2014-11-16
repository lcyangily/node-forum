/**   
 * @Title: PageNavigator 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-8-18
 * @version V1.0
 */
define(function(require, exports, module){
    //导入依赖样式资源
    require('css!./PageNavigator.css');

    var $      = require('../../core/1.0/jQuery+'),
        Widget = require('../../core/1.0/Widget'),
        SIB    = require('../../core/1.0/Sib'),
        w = (function(){return this;})(), d = w.document;

    var defaults = {
        target : null,  //导航条根节点
        navSelector : 'li a', //导航条子节点选择器
        navSelectedClass : 'selected', //高亮导航节点样式
        enableReverse : true,  //反向控制,滚动页面时，自动高亮选中对应的导航链接
        interval : 400, //页面滚动延迟计算时间
        threshold : 0,  //显示导航的临界高度
        //minTopShow : 0, //
        duration : 800,
        easing : 'swing', //滚动动画
        
        //callback
        scrollbegin : $.noop,
        scrollend   : $.noop
    };

    var P, PageNavigator;
    P = PageNavigator = Widget.extend({
        static : {
            widgetName : 'SIBPageNavigator',
            defaults : defaults,
            require : require,
            /**
             * 获取可视区域的region
             */
            viewportRegion : function (){
                var $w = $(w),
                    _left = $w.scrollLeft(),
                    _top = $w.scrollTop(),
                    _w = $w.width(),
                    _h = $w.height();

                return {
                    left  : _left,
                    top   : _top,
                    right : _left + _w,
                    bottom: _top + _h,
                    width : _w,
                    height: _h
                };
            },
            /**
             * 获取指定DOM的region
             */
            region : function (node){
                var offset = node.offset();
                var _w = node.outerWidth();
                var _h = node.outerHeight();
                return {
                    left: offset.left,
                    top : offset.top,
                    right : offset.left + _w,
                    bottom : offset.top + _h,
                    width : _w,
                    height : _h
                };
            },
            /**
             * 检测iRegion是否包含在oRegion里
             * @param allInRegion {Boolean} 是否要完全包含
             * @return Boolean
             */
            inRegion : function (iRegion, oRegion, allInRegion){

                function inRange(num, min, max) {
                    return (num >= min) && (num <= max);
                }
                var tIn = inRange(iRegion.top, oRegion.top, oRegion.bottom);
                var bIn = inRange(iRegion.bottom, oRegion.top, oRegion.bottom);
                var lIn = inRange(iRegion.left, oRegion.left, oRegion.right);
                var rIn = inRange(iRegion.right, oRegion.left, oRegion.right);

                if(allInRegion) {
                    return tIn && bIn && lIn && rIn;
                } else {
                    return iRegion.top <= oRegion.bottom && 
                           iRegion.bottom >= oRegion.top &&
                           iRegion.left <= oRegion.right &&
                           iRegion.right >= oRegion.left;
                }
            },
            /**
             * 获取两个region的相交region
             * @param region1
             * @param region2
             * @returns {{left: number, top: number, right: number, bottom: number, width: number, height: number}}
             */
            overlap : function (region1,region2){
                var _l = Math.max(region1.left,region2.left);
                var _r = Math.min(region1.right , region2.right);
                var _t = Math.max(region1.top , region2.top);
                var _b = Math.min(region1.bottom , region2.bottom);
                return {
                    left  : _l,
                    top   : _t,
                    right : _r,
                    bottom: _b,
                    width : _r - _l,
                    height: _b - _t
                }
            }
        },
        private : {
            /**
             * 分析html结构和配置转换为json
             * 注意：优先取a标签的href属性配置的id去取节点,如果没有找到id对应的节点，
             * 则data-navigator属性的scrollTo配置
             */
            _prepareOption : function() {
                var state = this.state,
                    opts = state.options,
                    $el  = this.$element,
                    navs = [];

                $el.find(opts.navSelector).each(function(idx, item){
                    var $item = $(item),
                        cfg = {},
                        nav = {},
                        _href = /#[\d\D_]*/gi.exec($item.attr('href')),
                        toNode = (_href.length > 0 && $(_href[0])[0]) || null;
                    if (typeof $item.attr('data-navigator') != undefined) {
                        try{
                            cfg = $.parseJSON($item.attr('data-navigator'));
                        }catch(e){ cfg ={};}
                    }
                    cfg = $.extend({threshold:0}, cfg);
                    toNode && (cfg.to = $(toNode));
                    nav = {
                        srcNode : $item,
                        scrollTo : cfg
                    };
                    navs.push(nav);
                    $item.data('sib-nav-data', nav);
                });
                state.navs = state.navs ? state.navs.concat(navs) : navs;
            },
            /**
             * 获取指定节点的top值，如果传入数字，以此为准
             */
            _getTop : function (val) {
                if($.isNumeric(val)) {
                    return val;
                } else {
                    return $(val)[0] && $(val).offset().top;
                }
            },
            _clickNavHandler : function(e){
                var state = this.state,
                    that = this, 
                    $srcNode = $(e.currentTarget), 
                    opts = state.options;
                
                e.preventDefault();
                $.each(state.navs, function(idx, nav){
                    nav.srcNode && $(nav.srcNode).removeClass(opts.navSelectedClass); 
                });
                $srcNode.addClass(opts.navSelectedClass);
                var nav = $srcNode.data('sib-nav-data');
                state.clickedNav = nav;
                this.scrollTo(nav);
            },
            _scrollHandler : function (){
                var state = this.state,
                    $el   = this.$element, 
                    opts  = state.options,
                    threshold = opts.threshold;
                
                if (threshold > 0 ) {
                    state.visible = $(w).scrollTop() > threshold;
                } else {
                    state.visible = true;
                }
                state.visible ? $el.show() : $el.hide();
                opts.enableReverse && this.reverseCheck();
            }
        },
        public : {
            /**
             * 通过判断Element在视窗可视区域内所占的大小判断哪一个导航点处于高亮.
             * 用户点击的导航点权重最高
             * 通过afterActiveNavigatorChange可以监听到变化
             */
            reverseCheck : function(){
                var state = this.state,
                    opts = state.options,
                    navs = state.navs,
                    viewportRegion = P.viewportRegion(),
                    inRegionNavs = [],
                    activeNav = null;

                //获取在显示区的导航并计算重叠区域
                $.each(navs, function(i, nav){
                    var $toNode = nav.scrollTo.to;
                    if($toNode && ($toNode instanceof $) && $toNode.length) {
                        region = P.region($toNode);
                        if (P.inRegion(region, viewportRegion)) {
                            nav.overlapRegion = P.overlap(region, viewportRegion);
                            inRegionNavs.push(nav);
                        }
                    }
                });

                if (inRegionNavs.length > 0) {
                    inRegionNavs.sort(function (a, b){
                        return a.top - b.top;
                    });
                    activeNav = inRegionNavs[0];
                    //在所有在可视区域中，找到top离可视top最近的一个
                    $.each(inRegionNavs, function(i, nav){
                        if(nav.top >= viewportRegion.top) {
                            activeNav = nav;
                            return false;
                        } else { //如果全小于可是top,则找离最近的
                            activeNav = nav;
                        }
                    });
                    if (state.clickedNav && $.inArray(state.clickedNav, inRegionNavs)) {
                        activeNav = state.clickedNav;
                    }
                    state.activeNav = activeNav;
                }
                
                $.each(state.navs, function(idx, nav){
                    nav.srcNode && $(nav.srcNode).removeClass(opts.navSelectedClass); 
                });
                state.activeNav && state.activeNav.srcNode.addClass(opts.navSelectedClass);
                //console.debug('reverseCheck is end ... ');
            },
            _init : function() {
                this._prepareOption();
                this.setNavsTop();
                this.bindEvents();
            },
            /**
             * 重新获取每一个navigator的值，在window.scroll时需要根据这个值来监测当前处于最顶端的navigator
             * 当页面的模块高度发生变化时，建议重新调用此方法
             * @method setNavigatorsTop
             * @param navigators
             */
            setNavsTop : function (){
                var state = this.state,
                    self = this;
                $.each(state.navs , function (idx, nav){
                    nav.top = self._getTop(nav.scrollTo.to) + parseInt(nav.scrollTo.threshold);
                });
            },
            bindEvents : function(){
                var state = this.state,
                    $el = this.$element, 
                    opts = state.options;

                //在滚动结束后再清空
                var cleanclickedNav = SIB.buffer(function(){
                    state.clickedNav = null;
                    //console.debug('scrollend ...');
                }, opts.interval + 50, this);

                var evtHandler = {
                    'scrollend' : cleanclickedNav
                };
                evtHandler['click ' + opts.navSelector] = this._clickNavHandler;
                this._on(evtHandler);
                $(w).on('scroll',  SIB.fixInterval(this._scrollHandler , opts.interval, this));
            },
            /**
             * 滚动到指定navigator的位置
             * @param item
             */
            scrollTo : function (item) {
                var state = this.state,
                    $el   = this.$element, 
                    that  = this,
                    opts  = state.options;

                item.top = this._getTop(item.scrollTo.to) + parseInt(item.scrollTo.threshold);
                /**
                 * 滚动开始和结束发送自定义事件
                 **/
                this._trigger('scrollbegin', null, {
                    data : item
                });

                $('body,html').stop().animate({
                    scrollTop: item.top 
                }, {
                    duration : opts.duration,
                    easing   : opts.easing,
                    complete : function(){
                        that._trigger('scrollend', null, {
                            data : item
                        });
                    }
                });
            }
        }
    });

    return P;
});