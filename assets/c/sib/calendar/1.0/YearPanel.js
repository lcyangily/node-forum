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

    var BTN_LABEL = ['Prev', 'Next']
    //默认值
    var defaults = {
        inlineNode : null,
        lang: 'en',
        date: null, //moment()初始化日期
        format: 'YYYY-MM-DD',
        range : null,
        inlineNode : null, //inline模式,指定的节点
        //callback event
        select : null,
        selectDisable : null
    };
    var template = '<table class="sib-calendar-year" data-role="year-column"></table>';

    var Y, YearCalendar;
    Y = YearCalendar = BaseCalendar.extend({
        static : {
            widgetName : 'SIBYearCalendar',
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
                var year = state.date.year();

                var items = [{
                    value: year - 10,
                    label: BTN_LABEL[0],//'Prev10Year',//'. . .',
                    available: true,
                    role: 'previous-10-year'
                }];

                for (var i = year - 6; i < year + 4; i++) {
                    items.push({
                        value: i,
                        label: i,
                        available: this._isInRange(i),
                        role: 'year'
                    });
                }

                items.push({
                    value: year + 10,
                    label: BTN_LABEL[1],//'Next10Year',//'. . .',
                    available: true,
                    role: 'next-10-year'
                });

                var list = [];
                for (i = 0; i < items.length / 3; i++) {
                    list.push(items.slice(i * 3, i * 3 + 3));
                }

                var current = {
                    value: year,
                    label: year
                };

                state.model = {current: current, items: list};
            },
            //构造HTML
            _buildHTML : function() {
                var state = this.state, 
                    model = state.model,
                    $el = this.$element, 
                    self = this,
                    cellTmpl = '<td data-role="{itemRole}" ' +
                                ' class="sib-calendar-year-item {itemCls}" ' +
                                ' data-value="{itemValue}">{itemLabel}</td>';
                    
                //var $html = $('<table class="sib-calendar-year" data-role="year-column"></table>');

                $el.empty();
                $.each(model.items, function(i, items) {
                    var $tr = $('<tr class="sib-calendar-year-row"></tr>');
                    $.each(items, function(i, item) {
                        var tdStr = SIB.unite(cellTmpl, {
                            itemRole : item.role,
                            itemCls  : !item.available ? 'sib-item-disabled' : '',
                            itemValue : item.value,
                            itemLabel : item.label
                        });
                        var $item = $(tdStr);
                        $item.data('year', item.value);
                        if(item.role != 'year') {
                            self.i18nHtml($item, item.label);
                        }
                        $tr.append($item);
                    });
                    //$html.append($tr);
                    $el.append($tr);
                });

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
                        year : date.year(), 
                        el : el === true ? null : el
                    });
                }
                return date;
            },
            _bindEvents : function(){
                this._on({
                    'click .sib-calendar-year-item' : function(ev) {
                        var $item = $(ev.target);
                        var value = $item.data('year');
                        this.select(value, $item);
                        ev.stopPropagation();
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
            _init : function(){
                this._prepareOption();
                this._buildHTML();
                this._bindEvents();
            },
            prev : function(){
                var state = this.state,
                    date = state.date;
                var nc = date.add('years', -1);
                return this._sync(nc);
            },
            next : function(){
                var state = this.state,
                    date = state.date;
                var nc = date.add('years', 1);
                return this._sync(nc);
            },
            select : function(value, el){
                var state = this.state,
                    date = state.date;
                if (el && $(el).hasClass('sib-item-disabled')) {
                    this._trigger('selectDisable', null, {
                        year : value.year ? value.year() : value, 
                        el : el
                    });
                    return value;
                }
                var focus;
                if (value.year) {
                    focus = value;
                } else {
                    focus = date.year(value);
                }
                return this._sync(focus, el);
            },
            focus : function(focus){
                var state = this.state,
                    $el = this.$element;
                focus = focus || state.date;
                var selector = '[data-value=' + focus.year() + ']';
                $el.find('.sib-item-focused').removeClass('sib-item-focused');
                if(!$el.find(selector).hasClass('sib-item-disabled')) {
                    $el.find(selector).addClass('sib-item-focused');
                }
            },
            refresh : function(){
                var state = this.state,
                    $el = this.$element,
                    date = state.date;

                state.range = this._parseRange();
                //var year = date.year();
                //var $years = $el.find('[data-role=year]');
                //if (year < $years.first().data('year') || year > $years.last().data('year')) {
                    this._initModel();
                    this._buildHTML();//this.element.html($(this.compileTemplate()).html());
                //}
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
    return Y;
});
