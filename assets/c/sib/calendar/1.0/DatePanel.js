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
        startDay : 0, //一周从哪一天开始，默认周日是一周的开始 
        lang: 'en',
        date: null, //moment()初始化日期
        format: 'YYYY-MM-DD',
        range : null, //array | function
        showWeek : false,
        showOtherMonths: true,
        selectOtherMonths: true,
        
        //callback event
        select : null,
        selectDisable : null
    };
    var DAYS = [
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday'
    ];
    var DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Wk'];
    var template = '<table class="sib-calendar-date" data-role="date-column"></table>';

    var D, DateCalendar;
    D = DateCalendar = BaseCalendar.extend({
        static : {
            widgetName : 'SIBDateCalendar',
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
                
                var date = this._getDateModel();
                var day  = this._getDayModel();
                state.model = {
                    date : date,
                    day  : day
                };
            },
            _getDateModel : function(){
                var state = this.state,
                    opts = state.options,
                    items = [], 
                    delta, 
                    d, 
                    daysInMonth,
                    startDay = this._parseStartDay(opts.startDay),
                    current = state.date,
                    //range = opts.range,
                    self = this;

                var pushData = function(d, className, flag) {
                    var item = {
                        value: d.format('YYYY-MM-DD'),
                        label: d.date(),
                        day: d.day(),
                        className: className,
                        available: self._isInRange(d),
                        isPrevMonth : flag === 1,
                        isNextMonth : flag === 2
                    };
                    items.push(item);
                };

                // reset to the first date of the month
                var currentMonth = current.clone().date(1);
                var previousMonth = currentMonth.clone().add('months', -1);
                var nextMonth = currentMonth.clone().add('months', 1);

                // Calculate days of previous month
                // that should be on current month's sheet
                delta = currentMonth.day() - startDay;
                if (delta < 0) delta += 7;
                if (delta != 0) {
                    daysInMonth = previousMonth.daysInMonth();

                    // *delta - 1**: we need decrease it first
                    for (i = delta - 1; i >= 0; i--) {
                        d = previousMonth.date(daysInMonth - i);
                        pushData(d, 'sib-calendar-prev-month', 1);
                    }
                }

                daysInMonth = currentMonth.daysInMonth();
                for (i = 1; i <= daysInMonth; i++) {
                    d = currentMonth.date(i);
                    pushData(d, 'sib-calendar-current-month');
                }

                // Calculate days of next month
                // that should be on current month's sheet
                delta = 35 - items.length;
                if (delta != 0) {
                    if (delta < 0) delta += 7;
                    for (i = 1; i <= delta; i++) {
                        d = nextMonth.date(i);
                        pushData(d, 'sib-calendar-next-month', 2);
                    }
                }
                var list = [];
                for (var i = 0; i < items.length / 7; i++) {
                    list.push(items.slice(i * 7, i * 7 + 7));
                }

                var _current = {
                    value: current.format('YYYY-MM-DD'),
                    label: current.date()
                };

                return {current: _current, items: list};
            },
            _getDayModel : function(){
                var state = this.state,
                    opts = state.options;
                // Translate startDay to number. 0 is Sunday, 6 is Saturday.
                var startDay = this._parseStartDay(opts.startDay);
                var items = [];
                for (var i = startDay; i < 7; i++) {
                    items.push({label: DAY_LABELS[i], value: i});
                }
                for (i = 0; i < startDay; i++) {
                    items.push({label: DAY_LABELS[i], value: i});
                }

                var current = {
                    value: startDay,
                    label: DAY_LABELS[startDay]
                };
                return {current: current, items: items};
            },
            //构造HTML
            _buildHTML : function() {
                var state = this.state, 
                    opts = state.options,
                    model = state.model,
                    $el = this.$element, 
                    self = this,
                    dayTmpl = '<th class="sib-calendar-day {cls}" '+
                                   ' data-role="day" '+
                                   ' data-value="{itemValue}" >{itemLabel}</th>',
                    cellTmpl = '<td data-role="date" ' +
                                ' class="{itemCls}" ' +
                                ' data-value="{itemValue}">{itemLabel}</td>';
                    
                //var $html = $('<table class="sib-calendar-date" data-role="date-column"></table>');
                $el.empty();

                //day column
                var $dayTH = $('<tr class="sib-calendar-day-row"></tr>');
                if(opts.showWeek) $dayTH.append(getWeekHeader());

                $.each(model.day.items, function(i, item){
                    var cls = 'sib-calendar-day-' + DAY_LABELS[item.value];
                    var tdStr = SIB.unite(dayTmpl, {
                        cls : cls,
                        itemValue : item.value,
                        itemLabel : item.label
                    });
                    
                    var $td = $(tdStr);
                    self.i18nHtml($td, item.label);
                    $dayTH.append($td);
                });
                $el.append($dayTH);
                
                //date column
                $.each(model.date.items, function(i, items) {
                    var $tr = $('<tr class="sib-calendar-date-row"></tr>');
                    if(opts.showWeek) $tr.append(getWeekNo(items[0].value));
                    $.each(items, function(i, item) {
                        var cls = ['sib-calendar-date-item', 'sib-calendar-date-item-'+DAY_LABELS[item.day]],
                            label = item.label;
                        if(!item.available) {
                            cls.push('sib-item-disabled');
                        }
                        if(item.className) {
                            cls.push(item.className);
                        }
                        if(item.isPrevMonth || item.isNextMonth) {
                            
                            if(!opts.selectOtherMonths) {
                                cls.shift();
                            }
                            if(!opts.showOtherMonths) {
                                label = '';
                                cls = [];
                            }
                        }
                        var tdStr = SIB.unite(cellTmpl, {
                            //itemRole : item.role,
                            itemCls  : cls.join(' '),
                            itemValue : item.value,
                            itemLabel : label//opts.showOtherMonths ? item.label : ''
                        });
                        var $item = $(tdStr);
                        $item.data('date', item.value);
                        $tr.append($item);
                    });
                    $el.append($tr);
                });

                function getWeekHeader() {
                    var tmpStr = SIB.unite(dayTmpl, {
                        cls : 'sib-calendar-week',
                        //itemValue : item.value,
                        itemLabel : DAY_LABELS[7]
                    });
                    var $td = $(tmpStr);
                    self.i18nHtml($td, DAY_LABELS[7]);
                    return $td;
                }

                function getWeekNo(str) {
                    var w = moment(str, opts.format).week();
                    var tdStr = SIB.unite(cellTmpl, {
                        //itemRole : item.role,
                        itemCls  : '',
                        itemValue : w,
                        itemLabel : w
                    });
                    var $item = $(tdStr);
                    $item.data('date', w);
                    return $item;
                }
                //$el.empty();
                //$el.append($html);
            },
            _sync : function(date, el){
                var state = this.state,
                    oldDate = state.date;
                
                state.date = date;
                if(oldDate.format('YYYY-MM') !== date.format('YYYY-MM')) {
                    this.refresh();
                }
                this.focus(date);
                if (el) {
                    this._trigger('select', null, {
                        date : date, 
                        el : el === true ? null : el
                    });
                }
                return date;
            },
            _bindEvents : function(){
                this._on({
                    'click .sib-calendar-date-item[data-role=date]' : function(ev) {
                        var $item = $(ev.target);
                        var value = $item.data('date');
                        this.select(value, $item);
                    }
                });
            },
            _isInRange : function(date) {
                var state = this.state,
                    range = state.range;
                if (range == null) {
                    return true;
                }
                if ($.isArray(range)) {
                    var start = range[0];
                    var end = range[1];
                    var result = true;
                    if (start) {
                        result = result && date >= start;
                    }
                    if (end) {
                        result = result && date <= end;
                    }
                    return result;
                }
                return true;
            },
            /**
             * 得到显示的第一列
             */
            _parseStartDay : function(startDay) {
                startDay = (startDay || 0).toString().toLowerCase();
                if ($.isNumeric(startDay)) {
                    startDay = parseInt(startDay, 10);
                    return startDay;
                }
            
                for (var i = 0; i < DAYS.length; i++) {
                    if (DAYS[i].indexOf(startDay) === 0) {
                        startDay = i;
                        break;
                    }
                }
                return startDay;
            }
        },
        public : {
            _init : function(){
                this._prepareOption();
                this._buildHTML();
                this._bindEvents();
            },
            refresh : function(){
                var state = this.state;
                state.range = this._parseRange();
                this._initModel();
                this._buildHTML();//this.element.html($(this.compileTemplate()).html());
            },
            prev : function(){
                var state = this.state,
                    date = state.date;
                var nc = date.add('days', -1);
                return this._sync(nc);
            },
            next : function(){
                var state = this.state,
                    date = state.date;
                var nc = date.add('days', 1);
                return this._sync(nc);
            },
            select : function(value, el){
                var state = this.state,
                    date = state.date;
                
                value = this._getMoment(value);
                if (el && $(el).hasClass('sib-item-disabled')) {
                    this._trigger('selectDisable', null, {
                        date : value, 
                        el : el
                    });
                    return value;
                }
                return this._sync(value, el);
            },
            focus : function(focus){
                var state = this.state,
                    $el = this.$element;
                focus = focus || state.date;
                var selector = '[data-value=' + focus.format('YYYY-MM-DD') + ']';
                $el.find('.sib-item-focused').removeClass('sib-item-focused');
                if(!$el.find(selector).hasClass('sib-item-disabled')) {
                    $el.find(selector).addClass('sib-item-focused');
                }
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
    return D;
});
