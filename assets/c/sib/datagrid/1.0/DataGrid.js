/**   
 * @Title: DataGrid.js 
 * @Description: DataGrid 组件
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-8-2
 * @version V1.2
 */

define(function(require, exports, module) {

    //require('css!./DataGrid.css');

    var $ = require('jquery+'),
        Widget = require('sib.widget'),
        SIB = require('sib.sib'),
        Pagination = require('sib.pagination'),
        JSON = require('json'),
        //i18n = require('./i18n/en'),
        //viewDefault = require('./plugins/default.js'),
        w = (function(){return this;})(), d = w.document;

    var defaults = {
        /*title: null,
        iconCls: null,*/
        border: true,
        width: 'auto',
        height: 'auto',
        minHeight : 200, //height为'auto'时, 此值生效,有个最低高度(当数据很少或者没有数据时)
        minWidth : 300, //暂没实现
        frozenColumns: null,
        columns: null,
        striped: true,
        method: 'post',
        /*nowrap: true,*/
        idField: null,
        url: null,
        loadMsg: 'Processing, please wait ...',
        noDataMsg : '暂无数据',
        pagination: false,
        rownumbers: false,
        singleSelect: true,
        pageNumber: 1,
        pageSize: 10,
        pageList: [10,20,30,40,50],
        pageToolbar : null,
        showPageNumber : 10, //每次显示页码数量
        pageDisplayMsg : '共{total}条/{pages}页',
        queryParams: {},
        paramType : null, //'json'
        sortName: null,
        sortOrder: 'asc',
        /*fullWidthRows : false,*/
        remoteSort : true,
        contentType : null,
        data : null,
        hasBackboard : true,    //是否支持列显示控制面板

        //表格生成渲染模式,可自定义,默认是default模式,还有detail模式(可实现Sub Grid)
        viewMode : 'default',      //null | 'default' | 'detail' | Object

        //指定Server 返回数据
        resultsLocation : 'rows',
        totalLocation : 'total',
        
        //Server 端接受数据的属性名
        remotePageCurrentLabel : 'current',
        remotePageSizeLabel    : 'pageSize',
        remoteSortNameLabel    : 'sortName',
        remoteSortOrderLabel   : 'sortOrder',

        onLoadSuccess: function(){},
        onLoadError: function(){},
        onClickRow: function(rowIndex, rowData){},
        onDblClickRow: function(rowIndex, rowData){},
        onSortColumn: function(sort, order){},
        onSelect: function(rowIndex, rowData){},
        onUnselect: function(rowIndex, rowData){},
        onResize : function(){}
    };

    //列属性
    var models = {
        column : {
            //"searchable": null, //Flag to indicate if the column is searchable
            "sortable": null, //Flag to indicate if the column is sortable or not.
            "visible": true, //列是否可见
            "defaultContent": null, //Allows a default value to be given for a column's data,
            
            /**
             * Name for the column, allowing reference to the column by name as well as
             * by index (needs a lookup to work by name).
             *  @type string
             */
            //"name": null,
            "field": null,
            "title": null, //Title of the column - what is seen in the TH element (nTh).
            "dataType": "string"//,  //Column sorting and filtering type
            //"sWidth": "auto" //Width of the column
        }
    };
    
    var gridTempl = 
        '<div class="a-datagrid-view">' +
            '<div class="a-datagrid-view1">' +
                '<div class="a-datagrid-header">' +
                    '<div class="a-datagrid-header-inner">' + 
                        '<table border="0" cellspacing="0" cellpadding="0"><tbody></tbody></table>' +
                    '</div>' +
                '</div>' +
                '<div class="a-datagrid-body">' +
                    /*'<div class="a-datagrid-body-inner">' +*/
                        '<table border="0" cellspacing="0" cellpadding="0">' +
                            '<thead></thead>' +
                            '<tbody></tbody>' +
                        '</table>' +
                    /*'</div>' +*/
                '</div>' +
            '</div>' +
            '<div class="a-datagrid-view2">' +
                '<div class="a-datagrid-header">' +
                    '<div class="a-datagrid-header-inner">' +
                        '<table border="0" cellspacing="0" cellpadding="0">' +
                            '<tbody></tbody>' + //头部用tbody 可以自适应!!
                        '</table>' +
                    '</div>' +
                '</div>' +
                /*'<a class="a-datagrid-btnBackboardDn"></a>' +*/
                '<div class="a-datagrid-body">' +
                    '<table border="0" cellspacing="0" cellpadding="0">' +
                        '<thead></thead>' +
                        '<tbody></tbody>' +
                    '</table>' +
                '</div>' +
            '</div>' +
            /*'<div class="a-datagrid-backboard">' + 
                '<a class="a-datagrid-btnBackboardUp"></a>' + 
            '</div>' +*/
            '<div class="a-datagrid-resize-proxy"></div>' +
        '</div>'
        //'<div class="a-datagrid-pager"><!----></div>'
    ;

    /**
     * 判断两行记录是否相等
     */
    function _isEqualRow(row1, row2, keys) {
        if(typeof keys === 'string'){
            return !SIB.isInvalidValue(row1[keys]) && (row1[keys] == row2[keys]); //都是undefined的bug!!
        } else if($.isArray(keys)) {
            for(var i = 0; i < keys.length; i++){
                if(SIB.isInvalidValue(row1[keys[i]]) || (row1[keys[i]] != row2[keys[i]])) return false;
            }
        } else {
            return false;
        }
        return true;
    }

    var DataGrid, D;
    DataGrid = D = Widget.extend({
        static : {
            widgetName : 'SIBDataGrid',
            require : require,
            defaults : defaults,
            //template : calTmpl,
            //i18n : i18n,
            optionFilter : '',
            plugins : []
        },
        private : {
            //解析&准备初始化参数
            _prepareOption : function() {
                var state = this.state,
                    $el = this.$element,
                    opts = state.options,
                    $grid = state.$grid,
                    self = this,
                    viewPlugin = state.viewPlugin;

                if($.isArray(opts.idField)){
                    state.idField = opts.idField;
                } else if(opts.idField) {
                    state.idField = [opts.idField];
                }
                //定义的函数有可能是string,在此转换
                $.each(('onLoadSuccess onLoadError onClickRow' +
                       ' onDblClickRow onSortColumn onSelect onUnselect').split(' '), function(i, name){
                    if(typeof opts[name] === 'string') {
                        opts[name] = 'return ' + opts[name].replace(/\(.*\)/igm, "");
                        try{
                            var func = (new Function(opts[name]))();
                            opts[name] = func;
                        } catch(err){
                            opts[name] = function(){};
                        }
                    }
                });
                
                if(!opts.frozenColumns) {
                    opts.frozenColumns = getColumns($el.find('thead[frozen=true]'));
                }
                $el.find('thead[frozen=true]').remove();
                if(!opts.columns) {
                    opts.columns = getColumns();
                }
                $el.find('thead').remove();

                state.frozenColumns = $.extend(true, [], opts.frozenColumns);
                state.columns       = $.extend(true, [], opts.columns);
                //如果有显示列号,在此添加列
                if(opts.rownumbers){
                    if(!state.frozenColumns[0]) {
                        state.frozenColumns[0] = [];
                    }
                    state.frozenColumns[0].unshift({
                        rowspan : state.frozenColumns.length,
                        rownumbers : true
                    });
                }

                if(typeof viewPlugin.onBeforeInitOption === 'function') {
                    viewPlugin.onBeforeInitOption.call(viewPlugin, self);
                }

                //初始化state.frozenColumns列属性,并填上默认值
                for(var i = 0; i < state.frozenColumns.length; i++){
                    //state.frozenColumns[i] = [];
                    for(var j = 0; j < state.frozenColumns[i].length; j++) {
                        state.frozenColumns[i][j] = $.extend(true, {}, models.column, state.frozenColumns[i][j]);
                    }
                }
                //初始化state.columns列属性,并填上默认值
                for(var i = 0; i < state.columns.length; i++){
                    //state.columns[i] = [];
                    for(var j = 0; j < state.columns[i].length; j++) {
                        state.columns[i][j] = $.extend(true, {}, models.column, state.columns[i][j]);
                    }
                }

                //对列进行扩充,自动增加,parent 和 children属性,给group列(非field列)自动生成ID
                extensionColumns(state.frozenColumns, state.uniqueFrozenCols);
                extensionColumns(state.columns, state.uniqueColumns);

                //隐藏原table,重新生成表格
                $el.attr({
                    cellspacing: 0,
                    cellpadding: 0,
                    border: 0
                }).removeAttr('width').removeAttr('height');//.appendTo($('.a-datagrid-view2 .a-datagrid-body', $grid));

                if (opts.border == true){
                    $grid.removeClass('a-datagrid-noborder');
                } else {
                    $grid.addClass('a-datagrid-noborder');
                }

                //有分页,则生成分页html
                if (opts.pagination) {
                    state.$pager = $('<div class="a-datagrid-pager"></div>').appendTo($grid);
                    new Pagination({
                        target : state.$pager[0],
                        pageNumber : opts.pageNumber,
                        pageSize : opts.pageSize,
                        pageList : opts.pageList,
                        showPageNumber : opts.showPageNumber,
                        toolbarTarget : opts.pageToolbar,
                        displayMsg : opts.pageDisplayMsg,
                        onSelectPage : function(pageNum, pageSize){
                            // save the page state
                            opts.pageNumber = pageNum;
                            opts.pageSize = pageSize;
                            self._loadData();    // request new page data
                        }
                    });
                }
                
                /**
                 * 解析html的table头部得到列数组
                 */
                function getColumns(thead){
                    //alert(thead.length);
                    var columns = [];
                    $('tr', thead).each(function(){
                        var cols = [];
                        $('th', this).each(function(){
                            var th = $(this);
                            var col = {
                                title: th.html(),
                                align: th.attr('align') || 'left',
                                sortable: th.attr('sortable')=='true' || false,
                                checkbox: th.attr('checkbox')=='true' || false
                            };
                            if (th.attr('field')) {
                                col.field = th.attr('field');
                            }
                            if (th.attr('formatter')){
                                col.formatter = eval(th.attr('formatter'));
                            }
                            if (th.attr('rowspan')) col.rowspan = parseInt(th.attr('rowspan'));
                            if (th.attr('colspan')) col.colspan = parseInt(th.attr('colspan'));
                            if (th.attr('width')) col.width = parseInt(th.attr('width'));
                            
                            cols.push(col);
                        });
                        columns.push(cols);
                    });
                    return columns;
                }
                
                /**
                 * 对列数组进行完善,列元素自动增加parent 和 children属性,
                 * 原理：colArray为临时二维数组. 
                 * [{title: 'a', colspan : 3},{title: 'b', colspan: 2}] -> 
                 * [{title: 'a'}, {title: 'a'}, {title: 'a'}, {title : 'b'}, {title : 'b'}]
                 * 给group列(非field列)自动生成ID
                 */
                function extensionColumns(columns, uniqueColumns) {
                    var colArray = [];
                    for(var i = 0; i < columns.length; i++) {
                        var rows = columns[i];
                        var yy = 0;
                        if(typeof colArray[i] == 'undefined'){
                            colArray[i] = [];
                        }
                        for(var j = 0; j < rows.length; j++ ) {
                            var col = rows[j];
                            colArray[i][yy] = col;
                            yy++;
                            if(col.colspan) {
                                //alert("col.colspan :" + col.colspan + "; columns[i].length :" + columns[i].length);
                                for(var tmp = 1; tmp < col.colspan; tmp++) {
                                    colArray[i][yy] = col;
                                    yy++;
                                }
                            }
                            if(col.rowspan) {
                                for(var tmp = 1; tmp < col.rowspan; tmp++){
                                    if(typeof colArray[i+tmp] == 'undefined') {
                                        colArray[i+tmp] = [];
                                    }
                                    colArray[i+tmp][colArray[i].length -1] = col;
                                }
                            }
                        }
                    }
                    
                    for(var i = colArray.length - 1; i >= 1; i--) {
                        for(var j = colArray[i].length - 1; j >= 0; j--) {
                            
                            var parent = colArray[i-1][j];
                            if(colArray[i][j] && colArray[i-1][j] && colArray[i][j] != colArray[i-1][j]) {
                                colArray[i][j].parent = colArray[i-1][j];
                                if(typeof colArray[i-1][j].children == 'undefined') {
                                    colArray[i-1][j].children = [];
                                }
                                colArray[i-1][j].children.push(colArray[i][j]);
                            }
                        }
                    }
                    
                    for(var i = 0; i < columns.length; i++) {
                        for(var j = 0; j < columns[i].length; j++) {
                            if(columns[i][j] && !columns[i][j].field) {
                                //自动生成groupId
                                columns[i][j].cellGroupId = ('cellGroupId' + i + j);
                                if(!columns[i][j].align) {
                                    columns[i][j].align = 'center';
                                }
                            }
                            //列没有设置对齐方式,设置数字默认右对齐
                            if(!columns[i][j].align) {
                                if(columns[i][j].dataType == 'number') {
                                    columns[i][j].align = 'right';
                                }
                            }
                            var formatter = columns[i][j].formatter;
                            if(typeof formatter === 'string') {
                                formatter = "return " + formatter.replace(/\(.*\)/igm, "");
                                try{
                                    var func = (new Function(formatter))();
                                    columns[i][j].formatter = func;
                                } catch(err){
                                    columns[i][j].formatter = null;
                                }
                            }
                        }
                    }
                    
                    if(colArray.length && colArray[0].length) {

                        for(var j = 0; j < colArray[0].length; j++){
                            var i = colArray.length - 1;
                            while(i >= 0) {
                                var c = colArray[i][j];
                                if (c && (!c.colspan || parseInt(c.colspan) <= 1) 
                                      /*&& (c.field || c.checkbox || c.rownumbers)*/) {
                                    uniqueColumns.push(c);
                                    break;
                                }
                                i--;
                            }
                        }
                    }
                }
            },
            _createHeader : function (){
                var state = this.state,
                    opts  = state.options,
                    $view1header = state.$view1header,
                    $view1body   = state.$view1body,
                    $view2header = state.$view2header,
                    $view2body   = state.$view2body,
                    columns       = state.columns,
                    frozenColumns = state.frozenColumns;

                createHeaderInner($view1header, $view1body, frozenColumns, opts.rownumbers);
                createHeaderInner($view2header, $view2body, columns);
                
                function createHeaderInner($c, $cClone, columns, rownumbers){

                    for(var i=0; i<columns.length; i++) {
                        var $tr = $('<tr></tr>').appendTo($('tbody', $c)), //$view2header  注意是tbody
                            $trClone = $tr.clone().appendTo($('thead', $cClone)); //$view2body  //副本

                        $trClone.css('height', '0px');
                        var cols = columns[i];
                        for(var j=0; j<cols.length; j++){
                            var col = cols[j];
                            var attr = '';
                            if (col.rowspan) attr += 'rowspan="' + col.rowspan + '" ';
                            if (col.colspan) attr += 'colspan="' + col.colspan + '" ';
                            var $th = $('<th ' + attr + '></th>').appendTo($tr);
                            col.$th = $th; //col属性中保存$th, $th对象中保存col属性
                            $th.data({
                                'option' : col
                            });
                            
                            //th副本,不要任何内容
                            var $thClone = $th.clone().appendTo($trClone);
                            col.$thClone = $thClone;
                            $thClone.empty();
                            $thClone.css({
                                'height':'0px',
                                'padding' : '0px',
                                'borderWidth': '0px'
                            });

                            if (col.rownumbers) {
                                $th.attr('field', col.field).addClass('a-datagrid-header-nopadding');
                            } else if (col.checkbox){
                                $th.attr('field', col.field).addClass('a-datagrid-header-nopadding');

                                $('<div class="a-datagrid-header-check"></div>')
                                        .html('<input type="checkbox"/>')
                                        .appendTo($th);
                            } else if (col.field){
                                var titleCell = $('<div class="a-datagrid-cell"><span></span></div>').appendTo($th);
                                $th.attr('field', col.field);
                                
                                var title = '';
                                if(col.headerFormatter) {
                                    title = col.headerFormatter(col, $('span', $th)[0]);
                                    if( title || typeof title === 'number' ) {
                                        $('span', $th).html(title);
                                    }
                                } else {
                                    $('span', $th).html(col.title);
                                }

                                if(col.sortable) {
                                    //$('<span class="a-datagrid-sort-icon">&nbsp;</span>').appendTo(titleCell);
                                    titleCell.addClass('a-datagrid-sortable');
                                }

                                if(col.resizable==false){
                                    titleCell.attr("resizable","false");
                                }
                                titleCell.css("text-align",(col.align||"left"));
                            } else {
                                $th.append('<div class="a-datagrid-cell-group"></div>');
                                if(col.cellGroupId) {
                                    $th.attr('cellGroupId', col.cellGroupId);
                                }
                                
                                var title = '';
                                if(col.headerFormatter) {
                                    title = col.headerFormatter(col, $('span', $th)[0]);
                                    if( title || typeof title === 'number' ) {
                                        $('.a-datagrid-cell-group', $th).html(title);
                                    }
                                } else {
                                    $('.a-datagrid-cell-group', $th).html(col.title);
                                }
                            }

                            col.minOuterW = col.$th.outerWidth();
                            if(!col.visible){
                                $th.hide();
                            }
                        }
                    }
                }
            },
            /**
             * 设置Grid的尺寸,包括列尺寸
             */
            _setSize : function () {
                //console.debug('_setSize.' + this.$element.attr('id'));
                var state  = this.state,
                    opts   = state.options,
                    ucs    = state.uniqueColumns,
                    ufcs   = state.uniqueFrozenCols,
                    $grid  = state.$grid,
                    $view = state.$view,
                    $view1 = state.$view1,
                    $view2 = state.$view2,
                    $view1header = state.$view1header,
                    $view2header = state.$view2header,
                    $view1body = state.$view1body,
                    $view2body = state.$view2body,
                    hasXscroll = false, //是否有x轴滚动条
                    hasYscroll = false; //是否有y轴滚动条

                //reset begin 非首次时,宽度都有值,先reset
                $view1header.find('table').width('auto');
                $view2header.find('table').width('auto');
                $view1body.find('table').width('auto');
                $view2body.find('table').width('auto');
                var mixCol = ucs.concat(ufcs);
                for(var i = 0; i < mixCol.length; i++){
                    mixCol[i].$th.width('auto');
                    mixCol[i].$thClone.width('auto');
                    mixCol[i].$th.outerWidth('auto');
                    mixCol[i].$thClone.outerWidth('auto');
                    mixCol[i].outerW = null;
                }
                $view1body.find('>table').css('margin-bottom', '0px');
                
                $view1header.height('auto');
                $view2header.height('auto');
                $view1header.find('table').height('auto');
                $view2header.find('table').height('auto');
                //reset end

                //先调整head Clone的元素宽度,最后将设置好的宽度赋值给设置header的每个th
                //set width begin
                if(opts.width != 'auto' && opts.width > 0){
                    $grid.outerWidth(opts.width);
                } else {
                    $grid.width('auto');
                    //$grid.outerWidth('100%');
                }
                
                //调整frozen块宽度 begin
                for(var i = 0; i < ufcs.length; i++) {
                    //每一列都取 outerWidth, minOuterW, width的最大值
                    var fcw = Math.max(ufcs[i].$thClone.outerWidth(), ufcs[i].minOuterW);
                    if(ufcs[i].width && ufcs[i].width > 0) {
                        fcw = Math.max(fcw, ufcs[i].width);
                    }
                    ufcs[i].$thClone.outerWidth(fcw);
                    ufcs[i].$th.outerWidth(fcw);
                }
                //调整frozen块宽度 end
                $view1.width($('>table', $view1body).outerWidth());
                $view1header.outerWidth($view1.outerWidth());
                $view1body.outerWidth($view1.outerWidth());
                
                $view2.outerWidth($grid.width() - $view1.outerWidth());
                $view2header.outerWidth($view2.width());
                $view2body.outerWidth($view2.width());
                //set width end

                //先将view2body宽度设置无限大,太窄行容易换行导致高度计算不准确。
                var view2bodyWidth = $view2body.width();
                $view2body.css('width', '100000');//将table外的body宽度设成无限大,不然里面的table设置无效

                //set height begin
                var hh = Math.max($view1header.outerHeight(), $view2header.outerHeight());
                $view1header.outerHeight(hh);
                $view2header.outerHeight(hh);
                $view1header.find('table').outerHeight($view1header.height());
                $view2header.find('table').outerHeight($view2header.height());

                fixRowHeight();
                
                if (opts.height == 'auto') {
                    var v2tableH = $view2body.find('table').outerHeight();
                    var v2bodyH = Math.max(v2tableH, opts.minHeight);
                    $view2body.height(v2bodyH);
                    $view1body.height(v2bodyH);
                    //用样式选择,嵌套表格有BUG
                    //$('.a-datagrid-body', $grid).height($view2body.outerHeight());
                    //var gh = $view2body.outerHeight() + $view2header.outerHeight() + $('.a-datagrid-pager', $grid).outerHeight(true);
                    //$grid.height(gh);
                } else {
                    $grid.outerHeight(opts.height);
                    $('.a-datagrid-body', $grid).outerHeight(
                            /*opts.height
                            - ($grid.outerHeight()*/ 
                            $grid.height()
                            - $('.a-datagrid-header', $grid).outerHeight(true)
                            /*- $('.a-datagrid-title', $grid).outerHeight(true)
                            - $('.a-datagrid-toolbar', $grid).outerHeight(true)*/
                            - $('.a-datagrid-pager', $grid).outerHeight(true)
                    );
                }
                var viewHeight = $view2.outerHeight();
                $view.height(viewHeight);
                $view1.height(viewHeight);
                $view2.css('left', $view1.outerWidth());
                //set height end

                //先设置用户定义的宽度
                for(var i = 0; i < ucs.length; i++){
                    //ucs[i].$thClone.html(ucs[i].$th.html()); //将clone的头部内容填充
                    if(ucs[i].width && ucs[i].width > 0) {
                        //ucs[i].$th.outerWidth(ucs[i].width)
                        ucs[i].$thClone.outerWidth(ucs[i].width)
                    }
                }
                
                //thClone的宽度比表头最小宽度还小,则设置成最小宽度(minOuterW在createHeader里初始化)
                //目的：为了在后续判断是否有滚动条
                for(var i = 0; i < ucs.length; i++){
                    if(ucs[i].minOuterW > ucs[i].$thClone.outerWidth()){
                        ucs[i].$thClone.outerWidth(ucs[i].minOuterW);
                    }
                }

                $view2body.find('table').outerWidth($view2body.find('table').outerWidth());
                //$view2body.css('width', 'auto');
                $view2body.width(view2bodyWidth);
                //$view2body.outerWidth($view2.width());

                var $view2Table = $view2body.find('table tbody');//.outerHeight()
                if((opts.height == 'auto') || ($view2Table.outerHeight() <= $view2body.height())){
                    hasYscroll = false;
                } else {
                    hasYscroll = true;
                }
                
                if($view2Table.outerWidth() > $view2body.width()){
                    hasXscroll = true;
                }
                //当X或Y,只有一边有滚动条则需要再次确认,实际产生滚动条后是否会导致另一个轴产生滚动条
                if(hasXscroll && !hasYscroll){
                    //alert('X方向有滚动条');
                    if(opts.height != 'auto' && ($view2Table.outerHeight() + SIB.getScrollBarWidth() > $view2body.height())){
                        hasYscroll = true;
                    }
                } else if(hasYscroll && !hasXscroll){
                    //alert('Y方向有滚动条');
                    if($view2Table.outerWidth() + SIB.getScrollBarWidth() > $view2body.width()){
                        hasXscroll = true;
                    }
                }
                
                //再将表头没有设置宽宽（包括设置了minOuterW）重置为Auto
                //目的：让没有设置的列宽的自动列宽
                for(var i = 0; i < ucs.length; i++){
                    //ucs[i].$thClone.html(ucs[i].$th.html()); //将clone的头部内容填充
                    if(!ucs[i].width || ucs[i].width <= 0) {
                        //ucs[i].$th.outerWidth(ucs[i].width)
                        ucs[i].$th.width('auto');
                        ucs[i].$thClone.width('auto');
                        ucs[i].$th.outerWidth('auto');
                        ucs[i].$thClone.outerWidth('auto');
                    }
                }

                //var heightFixOldIE = false;
                if(hasYscroll && hasXscroll){ //x,y都有滚动条
                    //view1body 里的table高度要比实际的多加个滚动条的高度
                    $view1body.find('>table').css('margin-bottom', SIB.getScrollBarWidth());
                } else if(!hasYscroll && hasXscroll) {  //仅X有滚动条
                    //if(_fnBrowserDetect() && opts.height == 'auto') { //fixed IE67 BUG
                    if(opts.height == 'auto') { //fixed IE67 BUG !!! 其他浏览器高度也要加个滚动条的宽度
                        $view2body.height($view2body.height() + SIB.getScrollBarWidth());
                        $grid.find('.a-datagrid-view').height($grid.find('.a-datagrid-view').height() + SIB.getScrollBarWidth());
                    }
                } else if(hasYscroll && !hasXscroll){   //仅Y有滚动条
                    $view2body.find('>table').outerWidth($view2body.width() - SIB.getScrollBarWidth());
                } else {    //X,Y 都没有
                    $view2body.find('>table').width('100%');
                }

                var view2bodyTableW = $view2body.find('>table').outerWidth(true);
                var view1bodyTableH = $view1body.find('>table').outerHeight(true);
                $view2header.find('table').outerWidth(view2bodyTableW);
                $view2header.find('.a-datagrid-header-inner').outerWidth(view2bodyTableW);

                //body 有X滚动条, view2 > header 宽度要多个滚动条的宽度
                if(hasXscroll){
                    $view2header.find('.a-datagrid-header-inner').outerWidth(view2bodyTableW + SIB.getScrollBarWidth());
                }

                //赋值到column.outerW begin
                /**
                 * 先将宽度小于minOuterW的设置成minOuterW
                 * 每一个宽度的设置,可能会导致后面一个的宽度小于minOuterW(宽度在不断变化),
                 * 搞个无限循环,直到所有列宽大于等于minOuterW的时,才退出循环,
                 * 再设置宽度大于minOuterW的宽度
                 */
                var hasLessMinOuterW = true;
                while(hasLessMinOuterW) {
                    hasLessMinOuterW = false;
                    for(var i = 0; i < ucs.length; i++) {
                        var outerW = ucs[i].outerW;
                        if(!outerW) {
                            outerW = ucs[i].$thClone.outerWidth();
                            if(outerW < ucs[i].minOuterW) {
                                outerW = ucs[i].outerW = ucs[i].minOuterW;
                                ucs[i].$th.outerWidth(outerW);
                                ucs[i].$thClone.outerWidth(outerW);
                                hasLessMinOuterW = true;
                            } else {
                                ucs[i].outerW = null;
                            }
                        }
                    }
                    
                }

                //将宽度大于minOuterW的直接赋值
                for(var i = 0; i < ucs.length; i++){
                    if(!ucs[i].outerW) {
                        var outerW = ucs[i].outerW = ucs[i].$thClone.outerWidth();
                        ucs[i].$th.outerWidth(outerW);
                        ucs[i].$thClone.outerWidth(outerW);
                    }
                }
                //赋值到column.outerW end

                /**
                 * 再调一次设置行高度,如果设置了 word-wrap:break-word; word-break:break-all;属性
                 * 可能会导致换行，计算滚动条和宽高前不会，在设置完后可能会换行。
                 * 注意：在兼容视图&&文档模式为杂项(Quirks)时有BUG
                 * 表格暂不支持文本自动换行
                 */
                //fixRowHeight();

                if(opts.onResize) {
                    opts.onResize.call(self);
                }

                function fixRowHeight() {
                    $view2body.find('>table>tbody>tr').each(function(i, tr){
                        var $tr = $(tr);
                        var idx = $tr.attr('a-datagrid-row-index');
                        if(idx) {
                            var $v1tr = $view1body.find('table>tbody>tr[a-datagrid-row-index=' + idx + ']');
                            var maxH = Math.max($v1tr.outerHeight(), $tr.outerHeight());
                            $tr.outerHeight(maxH);
                            $v1tr.outerHeight(maxH);
                        }
                    });
                }
                //计算完后,将clone的头部内容清空
                /*for(var i = 0; i < ucs.length; i++){
                    ucs[i].$thClone.empty();
                }*/

                //$view2body.find('thead').hide();
                //$view2body.find('thead tr').height(0);
            },
            /**
             * request remote data
             */
            _request : function(){
                var state = this.state,
                    $grid = state.$grid,
                    $backboards = state.$backboards,
                    opts = state.options,
                    self = this;

                if (!opts.url) return;
                
                //刷新数据前,先隐藏列显示面板
                if(opts.hasBackboard && $backboards && $backboards.is(':visible')){
                    $grid.find('a.a-datagrid-btnBackboardUp').trigger('click');
                }
                var param = $.extend({}, opts.queryParams);
                if (opts.pagination){
                    var paramObj = {};
                    paramObj[opts.remotePageCurrentLabel] = opts.pageNumber;
                    paramObj[opts.remotePageSizeLabel] = opts.pageSize;

                    $.extend(param, paramObj);
                }
                if (opts.sortName){
                    var sortParamObj = {};
                    sortParamObj[opts.remoteSortNameLabel] = opts.sortName;
                    sortParamObj[opts.remoteSortOrderLabel] = opts.sortOrder;
                    $.extend(param, sortParamObj);
                }

                $('<div class="a-datagrid-mask"></div>').css({
                    display:'block',
                    width: $grid.width(),
                    height: $grid.height()
                }).appendTo($grid);
                $('<div class="a-datagrid-mask-msg"></div>')
                        .html(opts.loadMsg)
                        .appendTo($grid)
                        .css({
                            display:'block',
                            left:($grid.width()-$('.a-datagrid-mask-msg',$grid).outerWidth())/2,
                            top:($grid.height()-$('.a-datagrid-mask-msg',$grid).outerHeight())/2
                        });

                self._removeNoDataMask();
                $.ajax({
                    type: opts.method,
                    url: opts.url,
                    contentType : opts.contentType || 'application/x-www-form-urlencoded; charset=UTF-8',
                    data: self._queryParamTransform(param), //param,
                    dataType: 'json',
                    success: function(sdata){
                        var data = {total : 0, rows : []};
                        var rows = SIB.getLocationValue(opts.resultsLocation, sdata);
                        var total = SIB.getLocationValue(opts.totalLocation, sdata);
                        if(rows && $.isArray(rows)) {
                            data.rows = rows;
                        }
                        
                        if(total && total > 0) {
                            data.total = total;
                        } else {
                            data.total = data.rows.length;
                        }

                        self._showData(data);
                        if(data && data.total == 0 && 
                                (!data.rows || (data.rows && data.rows.length == 0))) {
                            self._showNoDataMask();
                        }
                        if (opts.onLoadSuccess){
                            opts.onLoadSuccess.apply(self, arguments);
                        }
                    },
                    error: function(){
                        
                        if (opts.onLoadError){
                            opts.onLoadError.apply(self, arguments);
                        }
                    },
                    complete : function(){
                        $('.a-datagrid-mask', $grid).remove();
                        $('.a-datagrid-mask-msg', $grid).remove();
                        //$('.a-datagrid-pager', $grid).pagination({loading:false});
                    }
                });
            },
            _removeNoDataMask : function () {
                var state = this.state,
                    $grid = state.$grid;

                $('.a-datagrid-nodata', $grid).remove();
                $('.a-datagrid-nodata-msg', $grid).remove();
            },
            /**
             * 显示上的一些属性,如行交替显示颜色,隐藏visible为false的列
             */
            _setProperties : function (){
                var state = this.state,
                    $view1body = state.$view1body,
                    $view2body = state.$view2body,
                    opts = state.options;

                if (opts.striped) {
                    $view1body.find('tbody tr.a-datagrid-row:odd').addClass('a-datagrid-row-alt');
                    $view2body.find('tbody tr.a-datagrid-row:odd').addClass('a-datagrid-row-alt');
                }
            },
            /**
             * 绑定事件
             */
            _bindEvents : function () {
                var state = this.state,
                    self = this,
                    $grid = state.$grid,
                    $view1body = state.$view1body,
                    $view2body = state.$view2body,
                    $view1header = state.$view1header,
                    $view2header = state.$view2header,
                    uniqueColumns = state.uniqueColumns,
                    uniqueFrozenCols = state.uniqueFrozenCols,
                    opts = state.options,
                    viewPlugin = state.viewPlugin;
                    //data = state.data; //ajax 加载未完成,data此值为null,在后面必须从state.data !!!

                //表头hover效果
                $('.a-datagrid-header th:has(.a-datagrid-cell)', $grid).hover(
                    function(){$(this).addClass('a-datagrid-header-over');},
                    function(){$(this).removeClass('a-datagrid-header-over');}
                );
                
                //滚动条滚动效果
                $view2body.scroll(function(){
                    $view2header.scrollLeft($view2body.scrollLeft());
                    $view1body.scrollTop($view2body.scrollTop());
                });

                //数据行鼠标经过事件、点击事件、双击事件
                var evt = {};
                evt['click tr.a-datagrid-row[sib-grid-oid='+state.oid+']'] = function( ev ){
                        var $target = $(ev.currentTarget),
                        index = $target.attr('a-datagrid-row-index');
                    if ($target.hasClass('a-datagrid-row-selected')){
                        this.unselectRow(index);
                    } else {
                        this.selectRow(index);
                    }
                    if (opts.onClickRow){
                        opts.onClickRow.call($target[0], index, state.data.rows[index]);
                    }
                };
                evt['dblclick tr.a-datagrid-row[sib-grid-oid='+state.oid+']'] = function( ev ){
                        var $target = $(ev.currentTarget),
                        index = $target.attr('a-datagrid-row-index');
                    if (opts.onDblClickRow){
                        opts.onDblClickRow.call($target[0], index, state.data.rows[index]);
                    }
                };
                evt['mouseover tr.a-datagrid-row[sib-grid-oid='+state.oid+']'] = function( ev ){
                    var $target = $(ev.currentTarget),
                        index = $target.attr('a-datagrid-row-index'),
                        selector = 'tr.a-datagrid-row[a-datagrid-row-index='+index+'][sib-grid-oid='+state.oid+']';
                    $(selector,$grid).addClass('a-datagrid-row-over');
                };
                evt['mouseout tr.a-datagrid-row[sib-grid-oid='+state.oid+']'] = function( ev ){
                    var $target = $(ev.currentTarget),
                        index = $target.attr('a-datagrid-row-index'),
                        selector = 'tr.a-datagrid-row[a-datagrid-row-index='+index+'][sib-grid-oid='+state.oid+']';
                    $(selector,$grid).removeClass('a-datagrid-row-over');
                };
                
                this._on(state.$grid, evt);

                //点击表头事件
                $.each(uniqueColumns.concat(uniqueFrozenCols), function(i, col){
                    if(col.checkbox){ //checkbox列
                        col.$th.find('input[type=checkbox]')
                                    .off(DataGrid.ENS)
                                    .on('click' + DataGrid.ENS, {column : col}, onHeaderCheckboxClick);
                    } else {
                        col.$th.off(DataGrid.ENS)
                               .on('click' + DataGrid.ENS, {column : col}, onHeaderCellClick);
                    }
                });

                /** resize 
                $grid.find('.a-datagrid-header .a-datagrid-cell').resizable({
                    handles:'e',
                    minWidth:50,
                    onStartResize: function(e){
                        $grid.find('.a-datagrid-resize-proxy').css({
                            left:e.pageX - $grid.offset().left - 1
                        });
                        $grid.find('.a-datagrid-resize-proxy').css('display', 'block');
                    },
                    onResize: function(e){
                        $grid.find('.a-datagrid-resize-proxy').css({
                            left:e.pageX - $grid.offset().left - 1
                        });
                        return false;
                    },
                    onStopResize: function(e){
                        fixColumnSize(target, this);
                        $grid.find('.a-datagrid-view2 .a-datagrid-header').scrollLeft($grid.find('.a-datagrid-view2 .a-datagrid-body').scrollLeft());
                        $grid.find('.a-datagrid-resize-proxy').css('display', 'none');
                    }
                });
                $grid.find('.a-datagrid-view1 .a-datagrid-header .a-datagrid-cell').resizable({
                    onStopResize: function(e){
                        fixColumnSize(target, this);
                        $grid.find('.a-datagrid-view2 .a-datagrid-header').scrollLeft($grid.find('.a-datagrid-view2 .a-datagrid-body').scrollLeft());
                        $grid.find('.a-datagrid-resize-proxy').css('display', 'none');
                        setSize(target);
                    }
                });*/
                
                //监听窗口改变
                if(opts.width == 'auto' || opts.width == '100%') {
                    $grid.resize((function(e){
                        var windowWidth = $(window).width(),
                            gridWidth = $grid.width();
                        return SIB.fixInterval(function() { //提高效率
                            var wWidth = $(window).width(),
                                gWidth = $grid.width();
                            if($grid.is(':visible') && (wWidth != windowWidth || gridWidth != gWidth)) {
                                windowWidth = wWidth;
                                gridWidth = gWidth;
                                self.resize();
                            }
                        });
                    })());
                }
                
                if(typeof viewPlugin.bindEvents === 'function'){
                    viewPlugin.bindEvents.call(viewPlugin, self);
                }

                function onHeaderCellClick(event){
                    var col = event.data.column,
                        $th = col.$th,
                        $thCell = $th.find('.a-datagrid-cell');
                    
                    if(!col.sortable) return;
                    
                    opts.sortName = col.field;
                    opts.sortOrder = 'asc';
                    
                    var sortClass = 'a-datagrid-sort-asc';
                    if($thCell.hasClass('a-datagrid-sort-asc')) {
                        opts.sortOrder = 'desc';
                        sortClass = 'a-datagrid-sort-desc';
                    }

                    $('.a-datagrid-header .a-datagrid-cell', $grid)
                            .removeClass('a-datagrid-sort-asc a-datagrid-sort-desc');

                    $thCell.addClass(sortClass);

                    if (opts.onSortColumn){
                        opts.onSortColumn.call(this, opts.sortName, opts.sortOrder);
                    }
                    //远程排序还是本页排序
                    if(opts.url && opts.remoteSort){
                        self._loadData();//request(target);
                    } else {
                        self._nativeSorter(col);
                    }
                }
                
                function onHeaderCheckboxClick(){
                    if ($(this).attr('checked')){
                        $view2body.find('tbody tr').each(function(){
                            if (!$(this).hasClass('a-datagrid-row-selected')){
                                $(this).trigger('click');
                            }
                        });
                    } else {
                        $view2body.find('tbody tr').each(function(){
                            if ($(this).hasClass('a-datagrid-row-selected')){
                                $(this).trigger('click');
                            }
                        });
                    }
                }
            },
            //构建选择列的面板
            _buildBackboard : function (){
                var state = this.state,
                    self = this,
                    opts  = state.options,
                    $grid = state.$grid,
                    $view        = state.$view,
                    $view2header = state.$view2header,
                    $view2body   = state.$view2body,
                    uniqueColumns    = state.uniqueColumns,
                    uniqueFrozenCols = state.uniqueFrozenCols;

                var $backboards = $('<div class="a-datagrid-backboard">' + 
                                        '<a class="a-datagrid-btnBackboardUp"></a>' + 
                                    '</div>').appendTo($view);
                $view2header.after('<a class="a-datagrid-btnBackboardDn"></a>');
                state.$backboards = $backboards;

                $grid.find('a.a-datagrid-btnBackboardDn').css({
                    'top': $view2header.outerHeight(true)
                }).slideUp('fast');

                var mixColumns = uniqueColumns;
                if(uniqueFrozenCols && uniqueFrozenCols.length > 0) {
                    mixColumns = uniqueFrozenCols.concat(uniqueColumns);
                }

                var bbHtml = ['<h1>显示列</h1>'];
                for(var i = 0; i < mixColumns.length; i++) {
                    var col = mixColumns[i];
                    var label = '<label><input type="checkbox" {isHidden} sib-datagrid-col-name="{fieldName}" /><span>{colTitle}</span></label>';
                    var isHidden = '';
                    var colTitle = '';
                    if(col['field'] && !col.checkbox && !col.rownumbers) {
                        //bbHtml.push('<label><input type="checkbox" name="{fieldName}"  ');
                        if(col.visible) {
                            isHidden = 'checked="checked"';
                        }
                        //if(col.lockDisplay) bbHtml.push(' disabled="disabled"');
                        if(col.title){
                            colTitle = col.title;
                        }else{
                            colTitle = '未命名';
                        }
                        
                        label = SIB.unite(label, {
                            'isHidden' : isHidden,
                            'colTitle' : colTitle,
                            'fieldName' : col['field']
                        });
                        bbHtml.push(label);
                    }
                }
                $backboards.append($(bbHtml.join('')));
                
                //event begin
                //向下按钮
                var $btnBackboardDn = $grid.find('a.a-datagrid-btnBackboardDn').on('click', function(){
                    var hh = $view2header.outerHeight();
                    $backboards.outerWidth($view.outerWidth());
                    $backboards.outerHeight($view.outerHeight() - hh);
                    $backboards.css('top', hh);

                    $backboards.slideDown();
                    $btnBackboardDn.slideUp('fast');
                    //_hideNoData(target);
                });
                $view2body.on('mouseenter', function(){
                    $btnBackboardDn.slideUp('fast');
                });
                $grid.on('mouseleave', function(){
                    $btnBackboardDn.slideUp('fast');
                });
                
                $view2header.on('mouseenter',function(){
                    if($backboards.is(':hidden')){
                        $btnBackboardDn.slideDown('fast');
                    }
                });

                //向上按钮
                $grid.find('a.a-datagrid-btnBackboardUp').on('click', function(){
                    $backboards.slideUp();
                });
                
                //隐藏列
                //$backboards.on('click', ':checkbox', {'target' : target}, adjustColumns);
                $backboards.on('click', ':checkbox', /*{'target' : target},*/ $.proxy(adjustColumns, self));
                
                //调整列：隐藏显示列
                function adjustColumns(event){

                    var target = (event && event.target) || null;
                    if(!target) return;
                    //最后一个不隐藏
                    var last = 1,
                        field = $(target).attr('sib-datagrid-col-name'),
                        col = this._getColumnOption(field);

                    if($backboards.find('input:checked').length < last){
                        target.checked = true;
                        return;
                    }
                    
                    if(col) {
                        if(target.checked){
                            col.visible = true;
                        }else{
                            col.visible = false;
                        }
                    }
                    
                    var colClass = 'tr[sib-grid-oid='+state.oid+']>.a-datagrid-column-' + (col['field'] || '').replace(/\./g, state.oid);
                    if(col.visible){
                        col.$th.show();
                        col.$thClone.show();
                        $(colClass).show();
                    } else {
                        col.$th.hide();
                        col.$thClone.hide();
                        $(colClass).hide();
                    }
                    
                    var parentCol = col.parent;
                    while(parentCol) {
                        if(parentCol.children) {
                            parentCol.visible = false;
                            var colspan = 0;
                            for(var i = 0; i < parentCol.children.length; i++) {
                                if(parentCol.children[i].visible != false) {
                                    parentCol.visible = true;
                                    colspan += 1;
                                    //break;
                                }
                            }
                            
                            colspan = colspan > 0 ? colspan : 1;
                            if(parentCol.visible){
                                parentCol.$th.show();
                                parentCol.$thClone.show();
                                parentCol.$th.attr('colspan', colspan);
                                parentCol.$thClone.attr('colspan', colspan);
                            } else {
                                parentCol.$th.hide();
                                parentCol.$thClone.hide();
                            }
                        }
                        parentCol = parentCol.parent;
                    }

                    this.resize();
                }
            },
            //查询参数转换
            _queryParamTransform : function (param) {
                var state = this.state,
                    opts = state.options;

                var query = {};
                if(opts.paramType === 'json' && typeof param === 'object') {
                    for(var name in param) {
                        $.extend(true, query, paramProp(name, param));
                    }
                    return JSON.stringify(query);
                }
                
                return param;
                
                function paramProp(key, obj) {
                    var tmp = prop = {},
                        props = key.split('.');
                    for(var i = 0; i < props.length; i++){
                        if(i == props.length - 1) {
                            tmp = tmp[props[i]]  = obj[key];
                        } else {
                            tmp = tmp[props[i]]  = {};
                        }
                    }
                    return prop;
                }
            },
            /**
             * load data to the grid
             */
            _showViewData : function (data){
                var state = this.state,
                    self = this,
                    $grid = state.$grid,
                    $pager = state.$pager,
                    $view1body = state.$view1body,
                    $view2body = state.$view2body,
                    opts = state.options,
                    selectedRows = state.selectedRows,
                    rows = data.rows,
                    uniqueColumns    = state.uniqueColumns,
                    uniqueFrozenCols = state.uniqueFrozenCols,
                    viewPlugin = state.viewPlugin;

                $grid.find('.a-datagrid-body, .a-datagrid-header').scrollLeft(0).scrollTop(0);

                //生成body体内容
                $view1body.find('table tbody').remove();
                $view2body.find('table tbody').remove();
                //$view2body.find('table').append(getTBody(uniqueColumns));
                //if (opts.rownumbers || (uniqueFrozenCols && uniqueFrozenCols.length > 0)){
                    
                    //$view1body.find('table').append(getTBody(uniqueFrozenCols, opts.rownumbers));
                //}
                viewPlugin.onBeforeRender.call(viewPlugin, self);
                viewPlugin.render.call(viewPlugin, self, $view2body.find('table'), (data && data.rows) || [], false );
                if (opts.rownumbers || (uniqueFrozenCols && uniqueFrozenCols.length > 0)){
                    viewPlugin.render.call(viewPlugin, self, $view1body.find('table'), (data && data.rows) || [], true );
                }
                viewPlugin.onAfterRender.call(viewPlugin, self);
                //render : function(oGrid, container, uniqueColumns, rownumbers){

                //添加sib-grid-oid属性
                $view1body.find('>table>tbody>tr').attr('sib-grid-oid', state.oid);
                $view2body.find('>table>tbody>tr').attr('sib-grid-oid', state.oid);
                if(opts.pagination) {
                    new Pagination({
                        target : $pager[0],
                        total : data.total,
                        pageNumber : opts.pageNumber
                    });
                }

                this._setSize();
                this._setProperties();
            }
        },
        public : {
            _nativeSorter : function (col) {
                var state = this.state,
                    $grid = state.$grid,
                    opts = state.options,
                    data = state.data,
                    rows = data && data.rows ? data.rows : undefined,
                    sortName = opts.sortName,
                    sortOrder = opts.sortOrder,
                    sort = [].sort;
                
                if(!sortName || !sortOrder || !data || !rows) {
                    return;
                }
                //var col = getColumnOption(target, opts.sortName);
                sort.call(rows, function(a, b){
                    try {
                        var av = a[sortName];
                        var bv = b[sortName];
                        if(typeof av === 'undefined' || typeof bv === 'undefined') {
                            return 0;
                        }
                        //排序前转换
                        if(col.dataType === 'number'){
                            av = parseFloat(av);
                            bv = parseFloat(bv);
                        } else {
                            //各个浏览器localeCompare的结果不一致
                            return sortOrder === 'desc' ? -av.localeCompare(bv)  : av.localeCompare(bv);
                        }
                        return av > bv ? (sortOrder === 'desc' ? -1 : 1) : (sortOrder === 'desc' ? 1 : -1);
                    } catch (err){
                        return 0;
                    }
                });
                
                this._showData(data);
            },
            _showNoDataMask : function () {
                var state = this.state,
                    $grid = state.$grid,
                    opts = state.options;
                
                $('<div class="a-datagrid-nodata"></div>').css({
                    display:'block',
                    width: $grid.width(),
                    height: $grid.height()
                }).appendTo($grid);
                $('<div class="a-datagrid-nodata-msg"></div>')
                    .html(opts.noDataMsg)
                    .appendTo($grid)
                    .css({
                        display:'block',
                        left:($grid.width()-$('.a-datagrid-nodata-msg',$grid).outerWidth())/2,
                        top:($grid.height()-$('.a-datagrid-nodata-msg',$grid).outerHeight())/2
                    });
            },
            _loadData : function (){ //加载数据
                var state = this.state,
                    opts = state.options;
                if (opts.url) {
                    this._request();
                } else if(opts.data != null) {
                    this._showData( opts.data );
                }
            },
            _showData : function(data){
                var state = this.state,
                    opts  = state.options;

                this.clearSelections();//先将之前选择的清空
                state.data = data;
                state.showStartIndex = 0; //显示数据开始坐标在所有数据中的位置

                //本地数据且分页
                if( !opts.url && opts.pagination ) {

                    var total = (data.rows && data.rows.length) || data.total || 0;
                    var pn = opts.pageNumber || 1;
                    var start = (pn - 1) * opts.pageSize;
                    var end   = (start + opts.pageSize > total ) ? total : start + opts.pageSize;
                    var pdata = {total : total, rows : []};
                    if($.isArray(data.rows)) {
                        pdata.rows = data.rows.slice(start, end);
                    }
                    state.showStartIndex = start;
                    this._showViewData(pdata);
                } else {
                    this._showViewData(data);
                }
            },
            _getColumnOption : function (field){
                var state = this.state;
                if (state.columns){
                    for(var i=0; i<state.columns.length; i++){
                        var cols = state.columns[i];
                        for(var j=0; j<cols.length; j++){
                            var col = cols[j];
                            if (col.field == field){
                                return col;
                            }
                        }
                    }
                }
                if (state.frozenColumns){
                    for(var i=0; i<state.frozenColumns.length; i++){
                        var cols = state.frozenColumns[i];
                        for(var j=0; j<cols.length; j++){
                            var col = cols[j];
                            if (col.field == field){
                                return col;
                            }
                        }
                    }
                }
                return null;
            },
            init : function( opts ) {
                var self = this,
                    viewMode = opts.viewMode || defaults.viewMode;

                if(typeof viewMode === 'string' && !D.plugins[viewMode]) {
                    require(['./plugins/' + viewMode], function(){
                        if(!D.plugins[viewMode]){ //如果加载失败,防止递归死循环。
                            D.plugins[viewMode] = D.plugins['default'];
                        }
                        self.init(opts);
                    });
                } else {
                    self._super(opts);
                }
            },
            _init : function(opts) {
                var state = this.state,
                    $el = this.$element,
                    opts = state.options;

                $el.css('width', 'auto').css('height', 'auto');
                var $grid = state.$grid = $el.wrap('<div class="a-datagrid-wrap"></div>').parent();

                //定义变量 begin
                state.viewPlugin = (typeof opts.viewMode === 'string' ? D.plugins[opts.viewMode] : opts.viewMode) || D.plugins['default'];
                state.selectedRows     = [];
                state.columns          = [];   //二维列数组
                state.frozenColumns    = [];   //
                state.uniqueColumns    = [];   //每一个属性列(展示数据的列) init in function extensionColumns
                state.uniqueFrozenCols = [];

                $grid.append(gridTempl);
                state.$view           = $grid.find('>.a-datagrid-view');
                //state.$backboards     = state.$view.find('>.a-datagrid-backboard');
                state.$view1          = state.$view.find('>.a-datagrid-view1');
                state.$view2          = state.$view.find('>.a-datagrid-view2');
                state.$view1header    = state.$view1.find('>.a-datagrid-header');
                state.$view2header    = state.$view2.find('>.a-datagrid-header');
                state.$view1body      = state.$view1.find('>.a-datagrid-body');
                state.$view2body      = state.$view2.find('>.a-datagrid-body');
                //定义变量 end

                this._prepareOption();
                this._createHeader();
                this._bindEvents();
                if (opts.hasBackboard) this._buildBackboard();
                this._setSize(); //加载数据前先设置下尺寸,等数据加载完后再重新调整尺寸
                this._loadData();
                //this._setProperties();
            },
            resize : function(){
                this._setSize();
            }, 
            reload : function(param){
                var state = this.state,
                    opts = state.options;
                this.option('pageNumber', 1);//初始化到第一页
                $.extend(opts.queryParams, param);
                this._loadData();
            }, 
            /*fixColumnSize : function(){
                fixColumnSize(this.element);
            }, */
            getSelected : function(){
                var rows = this.getSelections();
                return rows.length > 0 ? rows[0] : null;
            },
            //获的第一个选择的坐标,没有返回 -1
            getSelectedIndex : function(){
                var state = this.state,
                    data = state.data,
                    $v2b = state.$view2body;
                var $sel = $v2b.find('tr.a-datagrid-row-selected[sib-grid-oid='+state.oid+']:eq(0)');
                if($sel.length > 0){
                    var index = parseInt($sel.attr('a-datagrid-row-index'));
                    if (index >=0 && index < data.rows.length){
                        return index;
                    }
                }
                return -1;
            },
            //通过行记录获得坐标,需要设置idField, 没有idField或找不到值返回-1
            getRowIndex : function(row){ 
                var state = this.state,
                    opts = state.options,
                    data = state.data,
                    index = -1;

                var r = row;
                if(!state.idField || state.idField.length <= 0) {
                    return -1;
                }
                if(state.idField.length == 1){
                    if(!r[state.idField[0]]){
                        r = {};
                        r[state.idField[0]] = row;
                    }
                }

                if (data.rows){
                    for(var i=0; i<data.rows.length; i++){
                        if(_isEqualRow(r, data.rows[i], state.idField)){
                            index = i;
                            break;
                        }
                    }
                }

                index = index - state.showStartIndex;
                return index >= -1 ? index : -1;
            },
            getSelections : function() {
                var state = this.state,
                    opts = state.options,
                    $grid = state.$grid,
                    data = state.data,
                    selectedRows = state.selectedRows;

                if (state.idField){
                    return selectedRows;
                }

                var rows = [];
                $('.a-datagrid-view2 .a-datagrid-body tr.a-datagrid-row-selected', $grid).each(function(){
                    var index = parseInt($(this).attr('a-datagrid-row-index'));
                    if (data.rows[index]){
                        rows.push(data.rows[index]);
                    }
                });
                return rows;
            },
            /**
             * clear all the selection records
             */
            clearSelections : function() {
                var state = this.state,
                    $grid = state.$grid,
                    $view = state.$view,
                    uniqueColumns = state.uniqueColumns,
                    uniqueFrozenCols = state.uniqueFrozenCols,
                    selectedRows = state.selectedRows;

                //将全选去掉
                $.each(uniqueColumns.concat(uniqueFrozenCols), function(i, col){
                    if(col.checkbox){ //checkbox列
                        col.$th.find('input[type=checkbox]').prop('checked', false);
                    }
                });

                var $ss = $view.find('tr.a-datagrid-row-selected[sib-grid-oid='+state.oid+']');
                $ss.removeClass('a-datagrid-row-selected');
                $ss.find('>td.a-datagrid-cell-check input[type=checkbox]').attr('checked', false);
                while(selectedRows.length > 0){
                    selectedRows.pop();
                }
            },
            /**
             * select a row with specified row index which start with 0.
             */
            selectRow : function(index) {
                var state = this.state,
                    $grid = state.$grid,
                    opts = state.options,
                    data = state.data,
                    selectedRows = state.selectedRows;
                var tr = $('.a-datagrid-body tr[a-datagrid-row-index='+index+'][sib-grid-oid='+state.oid+']',$grid);
                var ck = tr.find('.a-datagrid-cell-check input[type=checkbox]');
                if (opts.singleSelect == true){
                    this.clearSelections();
                }
                tr.addClass('a-datagrid-row-selected');
                ck.attr('checked', true);
                if (state.idField){
                    var row = data.rows[index];
                    for(var i=0; i<selectedRows.length; i++){
                        if(_isEqualRow(selectedRows[i], row, state.idField)) {
                            return;
                        }
                    }
                    selectedRows.push(row);
                }
                opts.onSelect.call(this.$element[0], index, data.rows[index]);
            }, 
            /**
             * select record by idField.
             */
            selectRecord : function(idValues){
                var index = this.getRowIndex(idValues);
                if (index >= 0){
                    this.selectRow(index);
                }
            }, 
            unselectRecord : function(row){
                var index = this.getRowIndex(row);
                if (index >= 0){
                    this.unselectRow(index);
                }
            },
            /**
             * unselect a row.
             */
            unselectRow : function(index){
                var state = this.state,
                    $grid = state.$grid,
                    opts = state.options,
                    data = state.data,
                    selectedRows = state.selectedRows,
                    $el = this.$element;

                var tr = $('.a-datagrid-body tr[a-datagrid-row-index='+index+'][sib-grid-oid='+state.oid+']', $grid);
                var ck = tr.find('.a-datagrid-cell-check input[type=checkbox]');
                tr.removeClass('a-datagrid-row-selected');
                ck.attr('checked', false);
                
                var row = data.rows[index];
                if (state.idField){
                    for(var i=0; i<selectedRows.length; i++){
                        var row1 = selectedRows[i];
                        if (_isEqualRow(row1, row, state.idField)){
                            selectedRows.splice(i,1);
                            break;
                        }
                    }
                }
                opts.onUnselect.call($el[0], index, row);
            }, 
            isSelected : function (row) {
                var state = this.state,
                    opts = state.options,
                    selectedRows = state.selectedRows;

                var r = row;
                if (!state.idField || state.idField.length <= 0) return false;
                if(state.idField.length == 1){
                    if(!r[state.idField[0]]){
                        r = {};
                        r[state.idField[0]] = row;
                    }
                }

                for(var i = 0; i < selectedRows.length; i++){
                    if(_isEqualRow(selectedRows[i], r, state.idField)) {
                        return true;
                    }
                }
                return false;
            },
            getRow : function(index){
                return this.state.data.rows[index];
            },
            getRows : function(){
                return this.state.data.rows;
            },
            refresh : function() {
                var state = this.state,
                    data = state.data;
                this._showData(data);
                if(data && data.total == 0 && 
                        (!data.rows || (data.rows && data.rows.length == 0))) {
                    this._showNoDataMask(this.element);
                } else {
                    this._removeNoDataMask(this.element);
                }
            },
            /*fixRowHeight : function() {
                
            },*/
            updateRow : function(index, row){
                var state = this.state,
                    viewPlugin = state.viewPlugin;
                viewPlugin.updateRow.call(viewPlugin, this, index, row);
            },
            updateRowByIdField : function(idFields, row) {
                var index = this.getRowIndex(idFields);
                this.updateRow(index, row);
            },
            deleteRowByIdField : function(idFields, row) {
                var state = this.state,
                    viewPlugin = state.viewPlugin;
                var index = this.getRowIndex(idFields);
                viewPlugin.deleteRow.call(viewPlugin, this, index);
            }
        }
    });

    //Grid默认构造html代码
    D.plugins['default'] = {
        render : function(oGrid, $container, rows, forzen) {
            var state = oGrid.state,
                opts = state.options;
                //rows = state.data.rows;

            var $tbody = $('<tbody></tbody>');
            for(var i = 0; i < rows.length; i++) {
                var $tr = $('<tr class="a-datagrid-row"></tr>');
                var selected = oGrid.isSelected(rows[i]);
                $tr.attr('a-datagrid-row-index', i);
                if (selected == true){
                    $tr.addClass('a-datagrid-row-selected');
                }
                this.renderRow(oGrid, $tr, i, rows[i], forzen);
                $tbody.append($tr);
            }
            $container.append($tbody);
            return $tbody;
        },
        renderRow : function(oGrid, $container, rowIndex, rowData, forzen){
            var state = oGrid.state,
                opts = state.options,
                uniqueColumns = forzen ? state.uniqueFrozenCols : state.uniqueColumns,
                rownumber = rowIndex + 1,
                selected = oGrid.isSelected(rowData);

            if (opts.pagination){
                rownumber += (opts.pageNumber-1) * opts.pageSize;
            }

            for(var j = 0; j < uniqueColumns.length; j++){
                var col = uniqueColumns[j];
                if (col){
                    var $td = $('<td></td>'),
                        //先将[.]字符过滤掉 如 a.b
                        tdClass = 'a-datagrid-column-' + (col.field || '').replace(/\./g, state.oid) + ' ',
                        styleObj = {'textAlign' : col.align || 'left'},
                        content = '',
                        tip = '';

                    //rownumbers列
                    if(col.rownumbers){
                        tdClass = '';
                        content = rownumber;
                    } else if (col.checkbox){ //checkbox 列
                        if (selected){
                            content = '<input type="checkbox" checked="checked"/>';
                        } else {
                            content = '<input type="checkbox"/>';
                        }
                        tdClass += ' a-datagrid-cell-check ';
                    } else if ($.isFunction(col.formatter)){
                        content = tip = col.formatter(SIB.getLocationValue(col.field, rowData), rowData, $td[0]);
                    } else {
                        content = tip = SIB.getLocationValue(col.field, rowData);
                    }
                    if(tip && typeof tip === 'string') {
                        tip = tip.replace(/<\/?[^>]*>/g, '');
                        $td.attr('title', tip);
                    }

                    if(!col.visible) {
                        styleObj['display'] = 'none';
                    }
                    
                    $td.css(styleObj);
                    $td.addClass(tdClass);
                    
                    if( content || typeof content === 'number' ) {
                        $td.html(content);
                    } else if(!col.formatter) { //IE6为空的td不显示边框BUG!!! 如果定义了formatter直接填充值，不返回内容的情况
                        $td.html('&nbsp;');
                    }
                    $container.append($td);
                }
            }
        },
        onBeforeRender : $.noop,
        onAfterRender : $.noop,
        onBeforeInitOption : $.noop,
        updateRow : function(oGrid, index, row){
            var state = oGrid.state,
                opts = state.options,
                rows = state.data.rows,
                $view1body = state.$view1body,
                $view2body = state.$view2body,
                selector = 'tr[a-datagrid-row-index='+index+'][sib-grid-oid='+state.oid+']';

            if(!(rows && rows.length && index >= 0 && index < rows.length)) {
                return;
            }
            $.extend(rows[state.showStartIndex + index], row);

            var $tr1 = $view1body.find(selector);
            var $tr2 = $view2body.find(selector);
            $tr1.empty();
            $tr2.empty();
            this.renderRow(oGrid, $tr1, index, rows[index], true);
            this.renderRow(oGrid, $tr2, index, rows[index], false);
            oGrid.resize();
        },
        deleteRow : function(oGrid, index){
            var state = oGrid.state,
                opts = state.options,
                rows = state.data.rows;

            rows.splice(state.showStartIndex + index, 1);
            oGrid._showData({total : rows.length, rows : rows});
        }
    }
    return D;
});