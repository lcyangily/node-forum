/**   
 * @Title: Pager.js 
 * @Description: 分页组件
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-9-2
 * @version V1.0   
 */

define(function(require, exports, module) {

    //require('css!./pager.css');
    
    var $ = require('jquery+'),
        Widget = require('sib.widget'),
        Sib    = require('sib.sib'),
        w = (function(){return this;})(), d = w.document;

    var defaults = {
        appendTo : null,
        type : '',  //min
        totalPages: 0,  //总页数
        totalRecords : 0,   //总记录数
        current: 1,
        pageSize: 10,   //每页显示条数
        pageList: [10,20,30,50],
        loading: false,
        showPageNumber : 10,//每次显示页码数量
        showPageList: true,
        showRefresh: true,
        clsPrefix : 'sib-page',
        prevLabel : '上一页',
        nextLabel : '下一页',
        firstLabel : '首页',
        lastLabel : '末页',

        threme : null,
        beforePageText: '跳转到：',
        //afterPageText: 'of {pages}',
        //afterPageText: '页', //
        gotoLabel : '跳转',
        //displayMsg: 'Displaying {from} to {to} of {total} items'
        //displayMsg: '共{total}条/{pages}页,当前{from}~{to}'
        displayMsg: '共{total}条/{pages}页',

        selectPage: function(evt, opts){}
    };

    var tmpl =  '<div class="{clsPrefix}"></div>';
    var itemTmpl = '<a href="javascript:;" class="{cls}" value={value}>{label}</a>';
    var itTmpl   = '<a href="javascript:;" class="{cls}"><i></i></a>';
    var infoTmpl = '<span class="{cls}"></span>';
    var textTmpl = '<span class="{cls}"><input value="{value}" type="text"></span>';

    var Pager = Widget.extend({
        static : {
            widgetName : 'SIBPager',
            require : require,
            defaults : defaults,
            optionFilter : 'target',
            optionRequire : 'appendTo',
            template : tmpl,
            clsPrefix : 'sib-page',
            plugins : []
        },
        private : {
            _buildPage : function() {
                var state = this.state,
                    opts  = state.options,
                    $page = state.$page,
                    self  = this;

                $page.empty();
                /** 分页展示页码个数begin 规则：展示最靠近当前页的指定个数 **/
                var pageCount = state.totalPages;
                var pageShowMax = opts.showPageNumber % 2 == 0 ? opts.current - 1 : opts.current;
                var pageShowMin = opts.current;

                for(var i = 0; i < Math.floor(opts.showPageNumber/2); i++) {
                    pageShowMax++;
                    pageShowMin--;
                    if(pageShowMax > pageCount) {
                        pageShowMax = pageCount;
                        if(pageShowMin > 1) {
                            pageShowMin--;
                        }
                    }
                    if(pageShowMin < 1) {
                        pageShowMin = 1;
                        if(pageShowMax < pageCount) {
                            pageShowMax++;
                        }
                    }
                }

                //first
                var $first = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.FIRST})).appendTo($page).append(opts.firstLabel);
                var $prev  = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.PREV })).appendTo($page).append(opts.prevLabel);

                /** 分页展示页码个数end **/
                for(var i = pageShowMin; i <= pageShowMax; i++) {
                    var cls = state.ALL_CLASS.ITEM + ' ' + (i == opts.current ? state.ALL_CLASS.CURRENT : '');
                    var itemData = {
                        value : i, 
                        label : i,
                        cls : cls
                    };
                    $(Sib.unite(itemTmpl, itemData)).appendTo($page);
                }
                var $next = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.NEXT})).appendTo($page).append(opts.nextLabel);
                var $last = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.LAST})).appendTo($page).append(opts.lastLabel);

                $(Sib.unite(infoTmpl, {cls : state.ALL_CLASS.INFO}))
                    .html(Sib.unite(opts.displayMsg, {
                        total : opts.totalRecords || (pageCount * opts.pageSize),
                        pages : pageCount,
                        from : (opts.current-1) * opts.pageSize,
                        to : opts.current * opts.pageSize
                    }))
                    .appendTo($page);
                //跳转到输入开始 begin
                //input 
                var $inWrap = $(Sib.unite(textTmpl, {
                    value : opts.current,
                    cls : state.ALL_CLASS.WHICH
                })).appendTo($page);
                //goto btn
                var $goto = $(Sib.unite(itTmpl, {
                    cls : state.ALL_CLASS.GOTO
                })).html(opts.gotoLabel).appendTo($page);
                //跳转到输入开始 end

                var $fp = $([]).pushStack([$first[0], $prev[0]]);
                $fp.off('.page');

                if(opts.current == 1) {
                    $fp.addClass(state.ALL_CLASS.DISABLED);
                } else {
                    $first.on('click.page', function(){
                        if (opts.current > 1) self.selectPage(1);
                    });
                    $prev.on('click.page', function(){
                        if (opts.current > 1) self.selectPage(opts.current - 1);
                    });
                }

                var itemSelector = '.'+ state.ALL_CLASS.ITEM + '[value!=' + opts.current + ']';
                $page.find(itemSelector).off('.page').on('click.page', function(){
                    self.selectPage(parseInt($(this).attr('value')) || 1);
                });
                var $nl = $([]).pushStack([$next[0], $last[0]]);
                if(opts.current == pageCount) {
                    $nl.addClass(state.ALL_CLASS.DISABLED);
                } else {
                    $next.off('.page').on('click.page', function(){
                        if (opts.current < state.totalPages) self.selectPage(opts.current + 1);
                    });
                    $last.off('.page').on('click.page', function(){
                        if (opts.current < state.totalPages) self.selectPage(state.totalPages);
                    });
                }

                $inWrap.find('input:text').off('.page').on('keydown.page', function(e){
                    if (e.keyCode == 13){
                        var val = parseInt($(this).val()) || 1;
                        self.selectPage(val);
                    }
                });
                $goto.off('.page').on('click.page', function(e){
                    var val = parseInt($inWrap.find('input:text').val()) || 1;
                    self.selectPage(val);
                });
            }
        },
        public : {
            //初始化
            _init : function() {
                var state = this.state,
                    opts  = state.options,
                    $page = state.$page = this.$element,
                    clsPrefix = state.mconst.clsPrefix;

                state.$parentNode = $(opts.appendTo);
                state.ALL_CLASS = {
                    INFO  : clsPrefix + '-info',
                    ITEM  : clsPrefix + '-item',
                    FIRST : clsPrefix + '-first',
                    PREV  : clsPrefix + '-prev',
                    NEXT  : clsPrefix + '-next',
                    LAST  : clsPrefix + '-last',
                    ELLIPSIS : clsPrefix + '-ellipsis',
                    WHICH : clsPrefix + '-which',
                    GOTO  : clsPrefix + '-goto',
                    CURRENT : clsPrefix + '-current',
                    DISABLED : clsPrefix + '-disabled'
                }
                if(opts.threme && typeof opts.threme === 'string') {
                    $page.addClass(opts.threme);
                }
                state.totalPages = parseInt(opts.totalPages);
                if(state.totalPages <= 0) {
                    state.totalPages = Math.ceil(opts.totalRecords/opts.pageSize) || 0;
                }

                this._buildPage();
                this.render();
            },
            selectPage : function(page){
                var state = this.state,
                    opts  = state.options,
                    totalPages = state.totalPages,
                    current = parseInt(page);
                if (current < 1) current = 1;
                if (current > totalPages) current = totalPages;

                this.refresh({
                    current : current
                });

                this._trigger('selectPage', null, $.extend(true, {}, state.options));
            },
            refresh : function(opts) {
                var state = this.state;
                $.extend(true, state.options, opts);
                this._init();
            }
        }
    });
    
    return Pager;
});