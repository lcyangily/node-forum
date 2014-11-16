/**   
 * @Title: Pagination.js 
 * @Description: Choose组件,适合多个按钮或者菜单,选择其中一个,样式自定义
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-8-2
 * @version V1.0   
 */

define(function(require, exports, module) {

    require('css!./Pagination.css');
    
    var $ = require('../../core/1.0/jQuery+'),
        Widget = require('../../core/1.0/Widget'),
        w = (function(){return this;})(), d = w.document;
    
    var defaults = {
        total: 1,
        pageSize: 10,
        pageNumber: 1,
        pageList: [10,20,30,50],
        loading: false,
        //buttons: null,
        showPageList: true,
        showRefresh: true,
        showPageNumber : 10,//每次显示页码数量
        
        onSelectPage: function(pageNumber, pageSize){},
        onBeforeRefresh: function(pageNumber, pageSize){},
        onRefresh: function(pageNumber, pageSize){},
        onChangePageSize: function(pageSize){},
        
        toolbarTarget : null,
        beforePageText: '跳转到：',
        //afterPageText: 'of {pages}',
        afterPageText: '页',
        //displayMsg: 'Displaying {from} to {to} of {total} items'
        //displayMsg: '共{total}条/{pages}页,当前{from}~{to}'
        displayMsg: '共{total}条/{pages}页'
    };

    var Pagination = Widget.extend({
        static : {
            widgetName : 'SIBPagination',
            require : require,
            defaults : defaults,
            optionFilter : '',
            plugins : []
        },
        private : {
            _buildPagetable : function() {
                var state = this.state,
                    opts  = state.options,
                    $pagetable = state.$pagetable,
                    $page = state.$page,
                    self  = this;

                var $tr = $('tr', $pagetable);
                $tr.empty();

                /*if (opts.showPageList){
                    var $ps = $('<select class="a-page-list"></select>');
                    for(var i=0; i<opts.pageList.length; i++) {
                        $('<option></option>')
                                .text(opts.pageList[i])
                                .attr('selected', opts.pageList[i]==opts.pageSize ? 'selected' : '')
                                .appendTo($ps);
                    }
                    $('<td></td>').append($ps).appendTo($tr);

                    opts.pageSize = parseInt($ps.val());

                    $('<td><div class="a-page-separator"></div></td>').appendTo($tr);
                }*/

                $('<td><a href="javascript:void(0)" class="a-page-first"></a></td>').appendTo($tr);
                $('<td><a href="javascript:void(0)" class="a-page-prev"></a></td>').appendTo($tr);
                /*$('<td><div class="a-page-separator"></div></td>').appendTo($tr);*/
                /** 分页展示页码个数begin 规则：展示最靠近当前页的指定个数 **/
                var pageCount = Math.ceil(opts.total/opts.pageSize);
                var pageShowMax = opts.showPageNumber % 2 == 0 ? opts.pageNumber - 1 : opts.pageNumber;
                var pageShowMin = opts.pageNumber;

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
                /** 分页展示页码个数end **/
                for(var i = pageShowMin; i <= pageShowMax; i++) {
                    $('<td><a href="javascript:void(0)" class="a-page-n" value=' + i + '>' + i + '</a></td>').appendTo($tr);
                }
                $('<td><a href="javascript:void(0)" class="a-page-next"></a></td>').appendTo($tr);
                $('<td><a href="javascript:void(0)" class="a-page-last"></a></td>').appendTo($tr);

                //跳转到输入开始 begin
                $('<span style="padding-left:6px;"></span>')
                        .html(opts.beforePageText)
                        .wrap('<td></td>')
                        .parent().appendTo($tr);
                $('<td><input class="a-page-num" type="text" value="1" size="2"></td>').appendTo($tr);
                $('<span style="padding-left:2px;"></span>')
                        .html(opts.afterPageText)
                        .wrap('<td></td>')
                        .parent().appendTo($tr);
                //跳转到输入开始 end

                /*if (opts.showRefresh){
                    $('<td><div class="a-page-separator"></div></td>').appendTo($tr);
                    $('<td><a href="javascript:void(0)" class="a-page-load"></a></td>').appendTo($tr);

        //          if (opts.loading) {
        //              $('<td><a class="pagination-refresh" href="javascript:void(0)" icon="pagination-loading"></a></td>').appendTo(tr);
        //          } else {
        //              $('<td><a class="pagination-refresh" href="javascript:void(0)" icon="pagination-load"></a></td>').appendTo(tr);
        //          }
                }*/

                $tr.find('a[value=' + opts.pageNumber + ']').addClass('a-page-current');

                $pagetable.find('a.a-page-first,a.a-page-prev').unbind('.page');
                if(opts.pageNumber == 1) {
                    $pagetable.find('a.a-page-first, a.a-page-prev').addClass('a-page-disabled');
                } else {
                    $pagetable.find('a.a-page-first').bind('click.page', function(){
                        if (opts.pageNumber > 1) self.selectPage(1);
                    });
                    $pagetable.find('a.a-page-prev').bind('click.page', function(){
                        if (opts.pageNumber > 1) self.selectPage(opts.pageNumber - 1);
                    });
                }

                $pagetable.find('a.a-page-n[value!=' + opts.pageNumber + ']').unbind('.page').bind('click.page', function(){
                    self.selectPage(parseInt($(this).attr('value')) || 1);
                });
                if(opts.pageNumber == pageCount) {
                    $pagetable.find('a.a-page-next, a.a-page-last').addClass('a-page-disabled');
                } else {
                    $pagetable.find('a.a-page-next').unbind('.page').bind('click.page', function(){
                        var pageCount = Math.ceil(opts.total/opts.pageSize);
                        if (opts.pageNumber < pageCount) self.selectPage(opts.pageNumber + 1);
                    });
                    $pagetable.find('a.a-page-last').unbind('.page').bind('click.page', function(){
                        var pageCount = Math.ceil(opts.total/opts.pageSize);
                        if (opts.pageNumber < pageCount) self.selectPage(pageCount);
                    });
                }

                $pagetable.find('input.a-page-num').unbind('.page').bind('keydown.page', function(e){
                    if (e.keyCode == 13){
                        var pageNumber = parseInt($(this).val()) || 1;
                        self.selectPage(pageNumber);
                    }
                });
            }
        },
        public : {
            //初始化
            _init : function() {
                var state = this.state,
                    opts  = state.options,
                    $page = state.$page = this.$element,
                    tmpl  = '<table cellspacing="0" cellpadding="0" border="0"><tr></tr></table>'+
                            '<div class="a-page-toolbar"></div>'+
                            '<div class="a-page-info"></div>'+
                            '<div style="clear:both;"></div>';

                $page.addClass('a-page').empty().append($(tmpl));
                var $toolbar   = state.$toolbar = $page.find('.a-page-toolbar');
                var $pagetable = state.$pagetable = $page.find('table');
                var $pageinfo  = state.$pageinfo = $page.find('.a-page-info');

                this._buildPagetable();

                /*$el.find('.a-page-list').unbind('.page').bind('change.page', function(){
                    opts.pageSize = $(this).val();
                    opts.onChangePageSize.call(target, opts.pageSize);

                    var pageCount = Math.ceil(opts.total/opts.pageSize);
                    selectPage(target, opts.pageNumber);
                });*/

                this.showInfo();

                if(opts.toolbarTarget) {
                    var $tbContent =  $(opts.toolbarTarget);
                    if(!$tbContent[0] && typeof opts.toolbarTarget === 'string') {
                        $tbContent = $('#' + opts.toolbarTarget);
                    }
                    $toolbar.append($tbContent);
                }
            },
            showInfo : function (){
                var state = this.state,
                    opts  = state.options,
                    $page = state.$page,
                    $pageinfo = state.$pageinfo,
                    pageCount = Math.ceil(opts.total/opts.pageSize),
                    num = $page.find('input.a-page-num');
                num.val(opts.pageNumber);
                num.parent().next().find('span').html(opts.afterPageText.replace(/{pages}/, pageCount));

                var pinfo = opts.displayMsg;
                pinfo = pinfo.replace(/{from}/, opts.pageSize*(opts.pageNumber-1)+1);
                pinfo = pinfo.replace(/{to}/, Math.min(opts.pageSize*(opts.pageNumber), opts.total));
                pinfo = pinfo.replace(/{total}/, opts.total);
                pinfo = pinfo.replace(/{pages}/, pageCount);

                $pageinfo.html(pinfo);

                /*$('a.a-page-first,a.a-page-prev]', target).linkbutton({
                    disabled: (opts.pageNumber == 1)
                });*/
                /*$('a.a-page-next,a.a-page-last', target).linkbutton({
                    disabled: (opts.pageNumber == pageCount)
                });*/

                this.setLoadStatus();
            },
            setLoadStatus : function (loading){
                var opts = this.state.options,
                    $el  = this.$element;
                loading && (opts.loading = loading);
                if (opts.loading){
                    $el.find('a.a-page-load').find('.a-page-load').addClass('a-page-loading');
                } else {
                    $el.find('a.a-page-load').find('.a-page-load').removeClass('a-page-loading');
                }
            },
            selectPage : function(page){
                var opts = this.state.options,
                    pageCount = Math.ceil(opts.total/opts.pageSize),
                    pageNumber = parseInt(page);
                if (pageNumber < 1) pageNumber = 1;
                if (pageNumber > pageCount) pageNumber = pageCount;
                opts.pageNumber = pageNumber;
                opts.onSelectPage.call(this.$element[0], pageNumber, opts.pageSize);
                this.refresh();
            },
            refresh : function() {
                this._buildPagetable();
                this.showInfo();
            }
        }
    });
    
    return Pagination;
});