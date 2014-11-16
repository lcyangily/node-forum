define(function(require, exports, module){
    var $ = require('../../../core/1.0/jQuery+'),
        DataGrid = require('../DataGrid'),
        defaultPlugin = DataGrid.plugins['default'];

    DataGrid.plugins['detail'] = $.extend({}, defaultPlugin, {
        render : function(oGrid, $container, frozen) {
            var state = oGrid.state,
                opts = state.options,
                rows = state.data.rows;

            var $tbody = $('<tbody></tbody>');
            for(var i = 0; i < rows.length; i++) {
                this.renderRow(oGrid, $tbody, i, rows[i], frozen);
            }
            $container.append($tbody);
            return $tbody;
        },
        renderRow : function(oGrid, $container, rowIndex, rowData, frozen){
            var state = oGrid.state,
                opts = state.options,
                uniqueColumns = frozen ? state.uniqueFrozenCols : state.uniqueColumns,
                rownumber = rowIndex + 1,
                selected = oGrid.isSelected(rowData),
                $tr = $('<tr class="a-datagrid-row"></tr>');

            if (opts.pagination){
                rownumber += (opts.pageNumber-1) * opts.pageSize;
            }

            $tr.attr('a-datagrid-row-index', rowIndex);
            if (selected == true){
                $tr.addClass('a-datagrid-row-selected');
            }
            for(var j = 0; j < uniqueColumns.length; j++){
                var col = uniqueColumns[j];
                if (col){
                    var $td = $('<td></td>'),
                        tdClass = 'a-datagrid-column-' + col.field + ' ',
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
                    } else if (col.formatter){
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
                    }
                    $tr.append($td);
                }
            }
            $container.append($tr);

            //detail内容
            var detailColspan,
                detailContent,
                $detailTr = $('<tr class="a-datagrid-row-detail" style="display:none;">'+
                                '<td>'+
                                    '<div class="a-datagrid-detail"></div>'+
                                '</td>'+
                              '</tr>');
            if (frozen){
                detailColspan = uniqueColumns.length + 2;
                //detailContent = '&nbsp;';
                $detailTr.find('td').css({
                    'borderRight':'0px',
                    'position' : 'relative',
                    'overflow' : 'visible'
                });
                $detailTr.find('div.a-datagrid-detail').addClass('a-datagrid-detail-trigon');
                $('<span class="bor"></span>' +
                  '<span class="blo"></span>').appendTo($detailTr.find('div.a-datagrid-detail'));
            } else {
                detailColspan = uniqueColumns.length;
                //detailContent = 'hello,world';//
                detailContent= '';
                if(typeof opts.detailFormatter === 'function') {
                    detailContent = opts.detailFormatter.call(oGrid.$element[0], 
                                        rowIndex, 
                                        rowData, 
                                        $detailTr.find('div.a-datagrid-detail'));
                }
                
                $detailTr.find('div.a-datagrid-detail').html(detailContent);
            }

            $container.append($detailTr);
            $detailTr.attr('a-datagrid-parent-index', rowIndex);
            $detailTr.find('td').attr('colspan', detailColspan);
        },
        bindEvents : function(oGrid){
            oGrid._on(oGrid.state.$view, {
                'click .a-datagrid-row-expander' : function( ev ){
                    var $t = $(ev.currentTarget),
                        rowIndex = $t.closest('tr.a-datagrid-row').attr('a-datagrid-row-index');
                    if($t.hasClass('a-datagrid-row-expand')) {
                        oGrid.expandRow(rowIndex);
                    } else {
                        oGrid.collapseRow(rowIndex);
                    }
                    ev.stopPropagation();
                } 
            });
        },
        onBeforeInitOption : function(oGrid){
            var state = oGrid.state;
            if(!state.frozenColumns || state.frozenColumns.length <= 0) {
                state.frozenColumns = [];
            }
            if(!state.frozenColumns[0] || state.frozenColumns[0].length <= 0) {
                state.frozenColumns[0] = [];
            }
            state.frozenColumns[0].unshift({
                rowspan : state.frozenColumns.length,
                //expander : true,
                headerFormatter : function(col, td){
                    
                },
                formatter : function(val, row, td){
                    /*var $chk = $('<input type="checkbox" name="hello_abc" />').click(function(e){
                        e.stopPropagation();
                    });
                    $chk.data('state', row);*/
                    var $expander = $('<div class="a-datagrid-row-expander a-datagrid-row-expand" />');
                    $(td).append($expander);
                }
            });
        },
        onAfterRender : function(oGrid){
            
        }
    });

    $.extend(DataGrid.prototype, {
        expandRow : function(rowIndex) {
            //console.debug('expandRow');
            var state = this.state,
                opts = state.options,
                selector = 'tr[a-datagrid-row-index=' + rowIndex + '] .a-datagrid-row-expander',
                dselector = 'tr.a-datagrid-row-detail[a-datagrid-parent-index=' + rowIndex + ']',
                $expander = state.$view.find(selector);
            $expander.removeClass('a-datagrid-row-expand').addClass('a-datagrid-row-collapse');
            state.$view.find(dselector).show();
            
            if (opts.onExpandRow){
                var row = this.getRow(rowIndex);
                opts.onExpandRow.call(this, rowIndex, row);
            }
            //this.resize();
        },
        collapseRow : function(rowIndex) {
            //alert('关闭' + rowIndex);
            var state = this.state,
                opts = state.options,
                selector = 'tr[a-datagrid-row-index=' + rowIndex + '] .a-datagrid-row-expander',
                dselector = 'tr.a-datagrid-row-detail[a-datagrid-parent-index=' + rowIndex + ']',
                $expander = state.$view.find(selector);
            
            $expander.removeClass('a-datagrid-row-collapse').addClass('a-datagrid-row-expand');
            state.$view.find(dselector).hide();
            
            if (opts.onCollapseRow){
                var row = this.getRow(rowIndex);
                opts.onCollapseRow.call(this, rowIndex, row);
            }
            //this.resize();
        },
        fixDetailHeight : function(rowIndex){
            //console.debug('fixDetailHeight ...');
            var state = this.state,
                dselector = 'tr.a-datagrid-row-detail[a-datagrid-parent-index=' + rowIndex + ']';

            if(!(state.uniqueFrozenCols  && state.uniqueFrozenCols.length)) {
                return;
            }
            var maxOuterH = 0,
                isVisible = false;
            state.$view.find(dselector).each(function(i, item){
                if($(item).outerHeight() > maxOuterH){
                    maxOuterH = $(item).outerHeight();
                }
                if($(item).is(':visible')) {
                    isVisible = true;
                }
            });
            isVisible && state.$view.find(dselector).outerHeight(maxOuterH);
            this.resize();
        },
        getRowDetail: function(rowIndex){
            var dselector = 'tr.a-datagrid-row-detail[a-datagrid-parent-index=' + rowIndex + ']';
            return this.state.$view.find(dselector);
        }
    });
    return DataGrid.plugins['detail'];
});
