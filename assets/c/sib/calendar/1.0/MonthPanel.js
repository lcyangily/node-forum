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
        BaseCalendar = require('./BaseCalendar'), 
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        inlineNode : null,
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
    var template = '<table class="sib-calendar-month" data-role="month-column"><tbody></tbody></table>';

    var M, MonthCalendar;
    M = MonthCalendar = BaseCalendar.extend({
        static : {
            widgetName : 'SIBMonthCalendar',
            require : require,
            defaults : defaults,
            template : template
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts = state.options,
                    $el = this.$element;

                //inline mode
                if(opts.inlineNode) {
                    state.$parentNode = $(opts.inlineNode);
                }
                //prepare model, date
                state.date = this._getMoment(opts.date);
                state.range = this._parseRange();
                this._initModel();
            },
            _initModel : function(){
                var state = this.state;
                var month = state.date.month();
                var items = [];

                for (var i = 0; i < MONTHS.length; i++) {
                    items.push({
                        value: i,
                        label: MONTHS[i],
                        available: this._isInRange(i),
                        role: 'month'
                    });
                }

                var list = [];
                for (i = 0; i < items.length / 3; i++) {
                    list.push(items.slice(i * 3, i * 3 + 3));
                }

                var current = {
                    year : state.date.year(),
                    value: month,
                    label: MONTHS[month]
                };

                state.model = {current: current, items: list, year : state.date.year()};
            },
            //构造HTML
            _buildHTML : function() {
                var state = this.state, 
                    self = this,
                    model = state.model,
                    $el = this.$element, 
                    cellTmpl = '<td data-role="{itemRole}" ' +
                                ' class="sib-calendar-month-item {itemCls}" ' +
                                ' data-value="{itemValue}">{itemLabel}</td>';
                    
                //var $html = $('<table class="sib-calendar-month" data-role="month-column"></table>');
                $el.find('>tbody').empty();

                $.each(model.items, function(i, items) {
                    var $tr = $('<tr class="sib-calendar-month-row"></tr>');
                    $.each(items, function(i, item) {
                        var tdStr = SIB.unite(cellTmpl, {
                            itemRole : item.role,
                            itemCls  : !item.available ? 'sib-item-disabled' : '',
                            itemValue : item.value,
                            itemLabel : item.label
                        });
                        var $item = $(tdStr);
                        self.i18nHtml($item, item.label);
                        $item.data({
                            'month': item.value,
                            'year' : item.year
                        });
                        $tr.append($item);
                    });
                    //$html.append($tr);
                    $el.find('>tbody').append($tr);
                });
                $el.data('year', model.year);

                //$el.empty();
                //$el.append($html);
            },
            _sync : function(date, el){
                var state = this.state;
                state.date = date;
                this.refresh();
                this.focus(date);
                if (el) {
                    this._trigger('select', null, {
                        month : date.month(), 
                        el : el === true ? null : el
                    });
                }
                return date;
            },
            _bindEvents : function(){
                this._on({
                    'click .sib-calendar-month-item' : function(ev) {
                        var $item = $(ev.target);
                        var value = $item.data('month');
                        this.select(value, $item);
                        ev.stopPropagation();
                    }
                });
            },
            _isInRange : function(d) {
                var state = this.state,
                    range = state.range,
                    date;
                if (range == null) {
                    return true;
                }
                if(d.month) {
                    date = d;
                } else if(d.toString().length < 3) {
                    date = state.date.clone().month(d);
                } else {
                    date = this._getMoment(d);
                }
                if ($.isArray(range)) {
                    var start = range[0];
                    var end = range[1];
                    var result = true;
                    if (start && start.month) {
                        var lastDate = date.clone().date(date.daysInMonth());
                        lastDate.hour(23).minute(59).second(59).millisecond(999);
                        result = result && lastDate >= start;
                    } else if (start) {
                        result = result && (date + 1) >= start;
                    }
                    if (end && end.month) {
                        var firstDate = date.clone().date(1);
                        firstDate.hour(0).minute(0).second(0).millisecond(0);
                        result = result && firstDate <= end;
                    } else if (end) {
                        result = result && (date + 1) <= end;
                    }
                    return result;
                }
                return true;
            }
        },
        public : {
            _init : function(){
                this._prepareOption();
                this._buildHTML();
                this._bindEvents();
            },
            refresh : function(){
                var state = this.state,
                    $el = this.$element,
                    date = state.date;

                state.range = this._parseRange();
                var year = date.year();
                //var cyear = $el.find('.sib-calendar-month').data('year');
                //if (parseInt(cyear, 10) !== year) {
                this._initModel();
                this._buildHTML();
                //}
            },
            prev : function(){
                var state = this.state,
                    date = state.date;
                var nc = date.add('month', -1);
                return this._sync(nc);
            },
            next : function(){
                var state = this.state,
                    date = state.date;
                var nc = date.add('month', 1);
                return this._sync(nc);
            },
            select : function(value, el){
                var state = this.state,
                    date = state.date;
                if (el && $(el).hasClass('sib-item-disabled')) {
                    this._trigger('selectDisable', null, {
                        month : value.month ? value.month() : value, 
                        el : el
                    });
                    return value;
                }
                var focus;
                if (value.month) {
                    focus = value;
                } else {
                    focus = date.month(value);
                }
                return this._sync(focus, el);
            },
            focus : function(focus){
                var state = this.state,
                    $el = this.$element;
                focus = focus || state.date;
                var selector = '[data-value=' + focus.month() + ']';
                $el.find('.sib-item-focused').removeClass('sib-item-focused');
                $el.find(selector).addClass('sib-item-focused');
            },
            show : function(){
                this.render();
                this.$element.show();
            },
            hide: function() {
                this.$element.hide();
            }//,
            //inRange : function(){}
        }
    });
    return M;
});
