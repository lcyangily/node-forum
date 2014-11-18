/**   
 * @Title: StepBar.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-10-10
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./calendar.css');
    
    var $      = require('jquery+'),
        SIB    = require('sib.sib'),
        i18n   = require('sib.calendar.i18n.en'),
        moment = require('moment'), 
        BaseCalendar  = require('sib.calendar.base'),
        YearCalendar  = require('sib.calendar.year'),
        MonthCalendar = require('sib.calendar.month'),
        DateCalendar  = require('sib.calendar.date'),
        w = (function(){return this})(), d = w.document;

    var calTmpl = [
        '<div class="sib-calendar">',
            '<div class="sib-calendar-pannel" data-role="pannel">',
                '<span class="sib-calendar-control sib-calendar-c-prevyear" data-role="prev-year"></span>',
                '<span class="sib-calendar-control sib-calendar-c-prevmonth" data-role="prev-month"></span>',
                '<div class="sib-calendar-currenttime">',
                    '<span class="sib-calendar-cur-month" data-role="current-month"></span>&nbsp;',
                    '<span class="sib-calendar-cur-year" data-role="current-year"></span>',
                '</div>',
                '<span class="sib-calendar-control sib-calendar-c-nextmonth" data-role="next-month"></span>',
                '<span class="sib-calendar-control sib-calendar-c-nextyear" data-role="next-year"></span>',
            '</div>',
            '<div class="sib-calendar-container" data-role="container">',
                //'<div class="sib-calendar-year-wrap"></div>',
                //'<div class="sib-calendar-month-wrap"></div>',
                //'<div class="sib-calendar-date-wrap"></div>',
            '</div>',
        '</div>'].join(''),
        MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ];

    //默认值
    var defaults = {
        //trigger : '', //element
        inlineNode : null, //element
        trigger : null, //element
        triggerType : 'click', //click | mouseover ...
        lang: 'en',
        date: null, //moment()初始化日期
        format: 'YYYY-MM-DD',
        range : null,
        startDay : 0,
        hideOnSelect : true,
        output : null, //element 默认同trigger
        
        showOtherMonths: true,
        selectOtherMonths: true,
        showButtonPanel: false,
        numberOfMonths : 1, //暂没实现
        showWeek: false, //显示周

        //callback event
        show : null,
        hide : null,
        selectDate : null,
        selectMonth : null,
        selectYear : null
        
    };

    var C, Calendar;
    C = Calendar = BaseCalendar.extend({
        static : {
            widgetName : 'SIBCalendar',
            require : require,
            optionFilter : 'target',
            defaults : defaults,
            i18n : i18n,
            template : calTmpl,
            Year : YearCalendar,
            Month : MonthCalendar,
            Date : DateCalendar
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts = state.options,
                    $el = this.$element,
                    self = this;

                state.inlineMode = false;
                var $seed = null;
                if(opts.inlineNode) {
                    state.$parentNode = $(opts.inlineNode);
                    $seed = state.$parentNode;
                    state.inlineMode = true;
                } else if(opts.trigger) {
                    state.$trigger = $(opts.trigger);
                    $seed = state.$trigger;
                } else {
                    //error
                    throw "Missing options paramter";
                }
                //在页面触发节点保存当前$element对象,非首次new时直接获取$element
                $seed.data(C.WN, {
                    $element : this.$element
                });
                //prepare model, date
                state.date = this._getMoment(opts.date);
                //var $cal = state.$calendar = $(calTmpl);
                state.$container = $el.find('.sib-calendar-container');
                state.years  = new YearCalendar(
                    $.extend(true, {}, opts, {
                        inlineNode : state.$container
                    })
                );
                state.months = new MonthCalendar(
                    $.extend(true, {}, opts, {
                        inlineNode : state.$container
                    })
                );
                state.dates  = new DateCalendar(
                    $.extend(true, {}, opts, {
                        inlineNode : state.$container
                    })
                );
            },
            _initModel : function(){
                
            },
            //构造HTML
            _buildHTML : function() {
                var state = this.state, 
                    $el = this.$element,
                    //$cal = state.$calendar,
                    $container = state.$container,
                    opts = state.options;

                if(state.inlineMode) {
                    $el.addClass('sib-calendar-inline');
                }
                var monthPannel = $el.find('[data-role=current-month]');
                var yearPannel = $el.find('[data-role=current-year]');

                this.i18nText(monthPannel, MONTHS[state.date.month()]);
                yearPannel.text(state.date.year());

                this._renderContainer('DATES');
                //button panel
                if(opts.showButtonPanel) {
                    $('<div class="sib-calendar-buttonpanel">'+
                          '<button>当前时间</button>'+
                          '<button>清空</button>'+
                      '</div>').appendTo($el);
                }
            },
            _sync : function(date, el){
                var state = this.state;
                state.date = date;
                this.refresh();
                this.focus(date);
                if (el) {
                    this._trigger('select', null, {
                        year : date.year(), 
                        el : el === true ? null : el
                    });
                }
                return date;
            },
            _bindEvents : function(){
                var state = this.state,
                    opts = state.options,
                    self = this;
                this._on({
                    'click [data-role=current-month]' : function(ev) {
                        
                        var mode = this.state.mode;
                        if('MONTHS' === mode) {
                            this._renderContainer('DATES');
                        } else {
                            this._renderContainer('MONTHS');
                        }
                    },
                    'click [data-role=current-year]' : function( ev ) {
                        var mode = this.state.mode;
                        if('YEARS' === mode) {
                            this._renderContainer('DATES');
                        } else {
                            this._renderContainer('YEARS');
                        }
                    },
                    'click [data-role=prev-year]': function( ev ) {
                        var state = this.state;
                        var d = state.years.prev();
                        state.dates.select(d);
                        state.months.select(d, true);
                    },
                    'click [data-role=next-year]': function( ev ) {
                        var state = this.state;
                        var d = state.years.next();
                        state.dates.select(d);
                        state.months.select(d, true);
                    },
                    'click [data-role=prev-month]': function( ev ) {
                        var state = this.state;
                        var d = state.months.prev();
                        state.dates.select(d);
                        state.years.select(d, true);
                    },
                    'click [data-role=next-month]': function( ev ) {
                        var state = this.state;
                        var d = state.months.next();
                        state.dates.select(d);
                        state.years.select(d, true);
                    }
                });
                
                state.dates._on({
                    'select' : function( evt, param) {
                        var date = param.date, 
                            el = param.el,
                            d = state.date = this._getMoment(date);
                        state.months.select(d);
                        state.years.select(d);
                        
                        if(el) {
                            this._trigger('selectDate', null, d);
                            //if(moment.isMoment(d)) {
                            var dateStr = d.format(opts.format);
                            //}
                            self.output(dateStr);
                        }
                    }
                });
                
                state.years._on({
                    'select' : function(ev, param){
                        var year = param.year,
                            el = param.el,
                            d = state.date;
                            //d = this._getMoment(state.date);//state.date;// = this._getMoment(value);
                        d.year(year);
                        state.months.select(d);
                        self.renderPannel();
                        if(el && el.data('role') === 'year') {
                            self._renderContainer('DATES');
                            self._trigger('selectYear', null, d);
                        }
                    }
                });
                
                state.months._on({
                    'select' : function(ev, param) {
                        var month = param.month,
                            el = param.el,
                            d = state.date;
                        d.month(month);
                        self.renderPannel();
                        if(el) {
                            self._renderContainer('DATES');
                            self._trigger('selectMonth', null, d);
                        }
                    }
                });
                
                $(d).off('click', hideCal);
                if(!state.inlineMode) {
                    $(d).on('click', hideCal);
                }
                
                function hideCal( ev ){
                    if(SIB.isOutSide(ev.target, [self.$element, state.$trigger])) {
                        self.hide();
                    }
                }
            },
            _isInRan : function(date) {
                var state = this.state,
                    range = state.options.range;
                if (range == null) {
                    return true;
                }
                if ($.isArray(range)) {
                    var start = range[0];
                    if (start && start.year) {
                        start = start.year();
                    }
                    var end = range[1];
                    if (end && end.year) {
                        end = end.year();
                    }
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
            }
        },
        public : {
            init : function(opts) {
                //非首次new,直接获取$element
                var cache = $(opts.inlineNode || opts.trigger).data(C.WN);
                cache && (this.$element = cache.$element);
                return this._super(opts);
            },
            _init : function(){
                this._prepareOption();
                this._buildHTML();
                this._bindEvents();
                this.enable();
            },
            //公共方法，但不建议调用
            _renderContainer : function(mode, date){
                var state = this.state,
                    opts = state.options,
                    date = state.date,
                    years = state.years,
                    months = state.months,
                    dates = state.dates;

                if(!mode || $.inArray(mode, ['DATES','MONTHS','YEARS']) < 0) return; 
                state.mode = mode;
                years.hide();
                months.hide();
                dates.hide();
                years.select(date.clone());
                months.select(date.clone());
                dates.select(date.clone());

                if(mode === 'DATES') {
                    dates.show();
                } else if(mode === 'MONTHS') {
                    months.show();
                } else if(mode === 'YEARS') {
                    years.show();
                }
                return this;
            },
            focus : function(focus){
                /*var state = this.state,
                    $el = this.$element;
                focus = focus || state.date;
                var selector = '[data-value=' + focus.year() + ']';
                $el.find('.sib-item-focused').removeClass('sib-item-focused');
                if(!$el.find(selector).hasClass('sib-item-disabled')) {
                    $el.find(selector).addClass('sib-item-focused');
                }*/
            },
            refresh : function(){
                var state = this.state,
                    opts = state.options;

                state.years.setOptions(opts);
                state.months.setOptions(opts);
                state.dates.setOptions(opts);
            },
            renderPannel : function() {
                var state = this.state,
                    opts = state.options,
                    d = state.date,
                    $el = this.$element;

                var monthPannel = $el.find('[data-role=current-month]');
                var yearPannel = $el.find('[data-role=current-year]');

                this.i18nText(monthPannel, MONTHS[d.month()]);
                //var i18nKey = MONTHS[d.month()];
                //var month = state.lang[i18nKey] || i18nKey;
                //monthPannel.attr('sib-i18n', i18nKey);
                //monthPannel.text(month);
                yearPannel.text(d.year());
            },
            range : function(range){
                
            },
            show : function(){
                this.render();
                this.$element.show();
                if(this.state.$trigger) {
                    this.$element.position({
                        of : this.state.$trigger,
                        //within : element.parent(),
                        my : 'left top', 
                        at : 'left bottom'
                    });
                }
            },
            hide : function(){
                this._trigger('hide');
                this.$element.hide();
            },
            output : function( value ){
                var state = this.state;
                    opts = state.options;
                // send value to output
                var $output = $(opts.output);
                if (!$output.length) {
                    return;
                }
                value = value || state.date;
                var tagName = $output[0].tagName.toLowerCase();
                if (tagName === 'input' || tagName === 'textarea') {
                    $output.val(value);
                } else {
                    $output.text(value);
                }
                if (opts.hideOnSelect && !state.inlineMode) {
                    this.hide();
                }
            },
            enable : function(){
                var state = this.state,
                    $trigger = state.$trigger,
                    opts = state.options,
                    self = this;
                
                if(!$trigger) {
                    return;
                }
                if($trigger.attr('type') === 'date') {
                    try {
                        // remove default style for type date
                        $trigger.attr('type', 'text');
                      } catch (e) {}
                }
                var event = opts.triggerType;
                $trigger.on(event, function( ev ){
                    self.show();
                });

                /*$trigger.on('blur', function( ev ){
                    self.hide();
                });*/
            },
            disable : function(){
                var state = this.state,
                    opts = state.options,
                    $trigger = state.$trigger;
                if($trigger && $trigger[0]) {
                    $trigger.off(opts.triggerType);
                }
            },
            destroy : function(){
                
            }
            //inRange : function(){}
        }
    });
    return C;
});
