define(function(require, exports, module){
    var $ = require('../../../core/1.0/jQuery+'),
        A = require('../Autocomplete'),
        defaultPlugin = A.hotPlugins['default'];

    A.hotPlugins['table'] = {
        options : {
            colNum : 4,
            itemWidth : 'auto',
            resultsLocation : null,
            labelName : 'label',
            valueName : 'value'
        },
        init : function(oAc, content, opts) {
            var state = oAc.state,
                $hot = state.$hot;

            if ( content ) {
                content = oAc._parseResponse(content, opts.resultsLocation, opts.labelName, opts.valueName);
                state.hotResults = content;
                this.render(oAc, content, $hot, opts);
            }
            this.bindEvents(oAc);
        },
        render : function (oAc, results, $hot, options) {
            //生成html
            var $table = $('<table></table>');
            var $tr,
                opts = options || {},
                colNum = opts.colNum || 4,
                itemWidth = opts.itemWidth || 'auto',
                self = this;
            $.each(results, function(i, item){
                if(i % colNum == 0) {
                    $tr = $('<tr></tr>').appendTo($table);
                }
                var $td = $('<td><a href="javascript:void(0)"></a></td>').appendTo($tr);
                var $a = $td.find('a').addClass('sib-ac-hot-item');
                $td.outerWidth(itemWidth);
                $a.data('sib-autocomplete-item', item);
                
                if(typeof opts.itemFormatter === 'function') {
                    var node = opts.itemFormatter.call($a[0], item, $a);
                    if(node && typeof node === 'string') {
                        $a.html(node);
                    } else if(node) {
                        $a.append(node);
                    }
                } else {
                    $a.text(item.label);
                }
            });
            $hot.append($table);
            $hot.addClass('sib-ac-hot-table');
            $hot.find('table tr:even').addClass('sib-ac-hot-table-even');
            var leave = colNum - results.length % colNum;
            $('<td></td>').appendTo($tr).attr('colspan', leave);
            
        },
        bindEvents : function(oAc){
            var state = oAc.state,
                $hot = state.$hot;

            $hot.find('.sib-ac-hot-item').click(function(event){
                var data = $(this).data('sib-autocomplete-item');
                oAc._trigger('select', event, {
                    node : $(this),
                    selected : data
                });
            });
        }
    };

    return A.hotPlugins['table'];
});
