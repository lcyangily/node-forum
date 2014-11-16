/**   
 * @Title: StepBar.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-10-10
 */
define(function(require, exports, module){

    //导入依赖样式资源
    require('css!./calendar.css');
    
    var $ = require('../../core/1.0/jQuery+'),
        Widget = require('../../core/1.0/Widget'),
        SIB = require('../../core/1.0/Sib'),
        moment = require('./moment/moment'), 
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        lang: 'en',
        date: null, //moment()初始化日期
        range: null, //array | function
        format: 'YYYY-MM-DD',
        //callback event
        select : null,
        selectDisable : null
    };

    var MONTHS = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    var A, ABaseCalendar;
    A = ABaseCalendar = Widget.extend({
        static : {
            widgetName : 'SIBABaseCalendar',
            require : require,
            optionFilter : 'target',
            defaults : defaults,
            template : '<div></div>'
        },
        private : {
            
        },
        public : {
            _getMoment : function(val) {
                var state = this.state,
                    opts = state.options;
                var cDate = moment();
                if (!val) {
                    return cDate;
                }
                if (moment.isMoment(val)) {
                    return val.clone();//一定要是副本,不然可能导致多个组件公用一个Moment
                }
                return moment(val, opts.format);
            },
            _parseRange : function(){
                var state = this.state,
                    opts = state.options;
                if ($.isArray(opts.range)) {
                    var format = opts.format;
                    var range = [];
                    $.each(opts.range, function(i, date) {
                        date = date === null ? null : moment(date, format);
                        range.push(date);
                    });
                    return range;
                }
                return opts.range;
            }
        }
    });
    return A;
});
