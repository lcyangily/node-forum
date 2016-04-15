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
        totalPages: 0,  //总页数
        totalRecords : 0,   //总记录数
        current: 1,
        pageSize: 10,   //每页显示条数
        pageList: [10,20,30,50],
        loading: false,
        showPageNumber : 10,//每次显示页码数量
        //showPageList: true,
        //showRefresh: true,
        clsPrefix : 'sib-page',
        prevTpl : '上一页',
        nextTpl : '下一页',
        firstTpl : '首页',
        lastTpl : '末页',

        theme : null,  //样式主题
        //类型：min full stand ellipsis
        //f-首页, p-上一页, page-页码，n-下一页，l-最后一页，info-displayMsg，inout输入框，gobtn-goto Btn
        type : 'stand', 
        //items : null,//'f-p-page-n-l-info-input-gobtn',
        showPageType : 'list',
        //beforePageText: '跳转到：',
        //afterPageText: 'of {pages}',
        //afterPageText: '页', //
        gotoLabel : '跳转',
        //displayMsg: 'Displaying {from} to {to} of {total} items'
        //displayMsg: '共{total}条/{pages}页,当前{from}~{to}'
        displayMsg: '共{total}条/{pages}页',

        selectPage: function(evt, opts){}
    };

    var tmpl =  '<div class="{clsPrefix}"></div>';
    var itemTmpl = '<a href="javascript:void(0);" class="{cls}" value={value}>{label}</a>';
    var itTmpl   = '<a href="javascript:void(0);" class="{cls}"><i></i></a>';
    var infoTmpl = '<span class="{cls}"></span>';
    var textTmpl = '<span class="{cls}"><input value="{value}" type="text"></span>';

    var ALL_TYPES= {
        'stand' : 'p-page-n',
        'min' : 'p-n',
        'full' : 'f-p-page-n-l-info-input-gobtn', 
        'fullellipsis' : 'f-p-pe-n-l-info-input-gobtn',
        'ellipsis' : 'p-pe-n'
    };

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
                    pageCount = state.totalPages,
                    self  = this,
                    $first, $prev, $next, $last, $inWrap, $goBtn;

                $page.empty();

                var items = ALL_TYPES[opts.type] ? ALL_TYPES[opts.type] : opts.type;
                items = $.isArray(items) ? items : (items || ALL_TYPES.stand).split('-');

                var hasPage = false; //配置中如果配置了多次 page/pe 则将忽略，只第一次有效
                $(items).each(function(i, it){
                    switch(it) {
                        case 'f' : 
                            $first = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.FIRST})).appendTo($page).append(opts.firstTpl);
                            break;
                        case 'p' : 
                            $prev  = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.PREV })).appendTo($page).append(opts.prevTpl);
                            break;
                        case 'n' : 
                            $next = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.NEXT})).appendTo($page).append(opts.nextTpl);
                            break;
                        case 'l' : 
                            $last = $(Sib.unite(itTmpl, {cls : state.ALL_CLASS.LAST})).appendTo($page).append(opts.lastTpl);
                            break;
                        case 'info' : 
                            $(Sib.unite(infoTmpl, {cls : state.ALL_CLASS.INFO}))
                                .html(Sib.unite(opts.displayMsg, {
                                    total : opts.totalRecords || (pageCount * opts.pageSize),
                                    pages : pageCount,
                                    from : (opts.current-1) * opts.pageSize,
                                    to : opts.current * opts.pageSize
                                }))
                                .appendTo($page);
                            break;
                        case 'input' : 
                            //input 
                            $inWrap = $(Sib.unite(textTmpl, {
                                value : opts.current,
                                cls : state.ALL_CLASS.WHICH
                            })).appendTo($page);
                            break;
                        case 'gobtn' : 
                            //goto btn
                            $goBtn = $(Sib.unite(itTmpl, {
                                cls : state.ALL_CLASS.GOTO
                            })).html(opts.gotoLabel).appendTo($page);
                            break;
                        case 'page' : 
                            !hasPage && createStandItems();
                            hasPage = true;
                            break;
                        case 'pe' : 
                            !hasPage && createEllipsisItems();
                            hasPage = true;
                            break;
                    }
                });

                //bind event begin
                var $fp = $([]);
                if($first && $first[0]) $fp.pushStack($first[0]);
                if($prev && $prev[0]) $fp.pushStack($prev[0]);

                $fp.off('.page');

                if(opts.current == 1) {
                    $fp.addClass(state.ALL_CLASS.DISABLED);
                } else {
                    $first && $first.on('click.page', function(){
                        if (opts.current > 1) self.selectPage(1);
                    });
                    $prev && $prev.on('click.page', function(){
                        if (opts.current > 1) self.selectPage(opts.current - 1);
                    });
                }

                var itemSelector = '.'+ state.ALL_CLASS.ITEM + '[value!=' + opts.current + ']';
                $page.find(itemSelector).off('.page').on('click.page', function(){
                    self.selectPage(parseInt($(this).attr('value')) || 1);
                });

                var $nl = $([]);
                $next && $next[0] && $nl.pushStack($next[0]);
                $last && $last[0] && $nl.pushStack($last[0]);
                if(opts.current == pageCount) {
                    $nl.addClass(state.ALL_CLASS.DISABLED);
                } else {
                    $next && $next.off('.page').on('click.page', function(){
                        if (opts.current < state.totalPages) self.selectPage(opts.current + 1);
                    });
                    $last && $last.off('.page').on('click.page', function(){
                        if (opts.current < state.totalPages) self.selectPage(state.totalPages);
                    });
                }

                $inWrap && $inWrap.find('input:text').off('.page').on('keydown.page', function(e){
                    if (e.keyCode == 13){
                        var val = parseInt($(this).val()) || 1;
                        self.selectPage(val);
                    }
                });
                $goBtn && $inWrap && $goBtn.off('.page').on('click.page', function(e){
                    var val = parseInt($inWrap.find('input:text').val()) || 1;
                    self.selectPage(val);
                });


                function createStandItems(){
                    renderItem(getPageNums());
                }

                function createEllipsisItems(){
                    renderItem(getPageNums('e'));
                }

                function getPageNums(type){
                    var pageNums = [];
                    var num = opts.showPageNumber;
                    if(type == 'e') {
                        var num = num - 2;
                        num = num > 2 ? num : 2;
                    }

                    /** 分页展示页码个数begin 规则：展示最靠近当前页的指定个数 **/
                    var pageShowMax = num % 2 == 0 ? opts.current - 1 : opts.current;
                    var pageShowMin = opts.current;

                    for(var i = 0; i < Math.floor(num/2); i++) {
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

                    for(var n = pageShowMin; n <= pageShowMax; n++) {
                        pageNums.push(n);
                    }

                    if(type == 'e') {
                        if(pageShowMin > 3) {
                            pageNums.unshift(1, '.');
                        } else if(pageShowMin == 2){
                            pageNums.unshift(1);
                        } else if(pageShowMin == 3) {
                            pageNums.unshift(1, 2);
                        }

                        if(pageShowMax < pageCount - 2) {
                            pageNums.push('.', pageCount);
                        } else {
                            for(var x = pageShowMax + 1; x <= pageCount; x++) {
                                pageNums.push(x);
                            }
                        }
                    }

                    return pageNums;
                }

                function renderItem(arr) {
                    /** 分页展示页码个数end **/
                    if(arr && arr.length) {
                        for(var i = 0; i < arr.length; i++) {
                            if('.' == arr[i]) {
                                $(Sib.unite(infoTmpl, {cls : state.ALL_CLASS.ELLIPSIS})).html('...').appendTo($page);
                            } else {
                                var cls = state.ALL_CLASS.ITEM + ' ' + (arr[i] == opts.current ? state.ALL_CLASS.CURRENT : '');
                                var itemData = {
                                    value : arr[i], 
                                    label : arr[i],
                                    cls : cls
                                };
                                $(Sib.unite(itemTmpl, itemData)).appendTo($page);
                            }
                        }
                    }
                }
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
                if(opts.theme && typeof opts.theme === 'string') {
                    $page.addClass(opts.theme);
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