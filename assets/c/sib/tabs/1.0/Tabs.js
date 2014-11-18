/**   
 * @Title: Tabs.js 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-4-8
 * @version V1.0
 */
define(function(require, exports, module){
    //导入依赖样式资源
    //require('css!./tabs.css');

    var $      = require('jquery+'),
        Slide  = require('sib.slide'),
        SIB    = require('sib.sib'),
        w      = (function(){return this})(), 
        d      = w.document;

    var defaults = {
        triggers : '.tabs-nav li', //string|array 触发器列表, 支持直接传入选择器，也可以是元素数组
        hasTriggers: true,  //没有传入 triggers 时，是否自动生成trigger
        panels  : '.tabs-panel', //string|array
        triggerType : 'click',  //click hover 
        effect : null,       //切换类型, null scroll-x scroll-y fade
        autoPlay: false,         //是否自动切换
        activeIndex : 0, //默认定位在某个帧，默认为0，即第一帧
        colspan : 1,    //滑块窗口的跨度，比如滑块中包含2帧，则指定为2
        circulate : false,   //是否以跑马灯模式，默认为false
        bodyAutoSize : true,
        prevBtn : null, //'.prev-btn' 
        nextBtn : null, //'.next-btn'

        change : function(event, param){}, //切换发生时的事件，特指切换动作必然发生时的时刻，回调上下文和参数同上
        beforeChange: function(event, param){return true;},  //切换至”的事件，回调返回false可以阻止切换事件的发生
        afterChange : function(event, param){}     //切换完成的动作
    };
    
    var T, Tabs;
    T = Tabs = Slide.extend({
        static : {
            require : require,
            widgetName : 'SIBTabs',
            defaults : defaults,
            clsPrefix : 'sib-tabs'
        },
        private : {},
        public : {
            _init : function() {
                this._super();
                this.state.$triggers.parent().addClass('sib-clearfix');
            }
        }
    });

    return T;
});