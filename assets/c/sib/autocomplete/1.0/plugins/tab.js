define(function(require, exports, module){
    var $   = require('jquery+'),
        SIB = require('sib.sib');

    var plugin = {
        options : {
            itemWidth : 'auto',
            tabTitle : 'title',
            resultsLocation : 'results',
            tabName : 'tabname',
            tabData : 'tabdata',
            groupName : 'groupname',
            groupData : 'groupdata',
            labelName : 'label',
            valueName : 'value'
        },
        init : function(oAc, content, opts) {
            var state = oAc.state,
                $hot = state.$hot;

            if ( content ) {
                content = this.parseData(oAc, content, opts);
                state.hotResults = content;
                this.render(oAc, content, $hot, opts);
            }
            this.bindEvents(oAc);
            $hot.find('ul.hot-tab-nav>li').eq(0).click();
        },
        parseData : function(oAc, inContent, opts){
            var state = oAc.state,
                content = inContent,
                data = {},
                results = [];

            data.tabTitle = SIB.getLocationValue(opts.tabTitle, content);
            if(opts.resultsLocation) {
                content = SIB.getLocationValue(opts.resultsLocation, content);
            }
            if(!content || !content.length) {
                return null;
            }
            
            for(var i = 0; i < content.length; i++) {
                var tab = content[i];
                var tabName = SIB.getLocationValue(opts.tabName, tab);
                var tabData = SIB.getLocationValue(opts.tabData, tab);
                results[i] = {
                    tabName : tabName,
                    tabData : getTabData(tabData)
                };
            }
            data.results = results;
            return data;

            /**
             * {'groupName' : 'aaa', 'groupData' : [{label : 'aaa', value : 'bbb'}]} or
             * {label : 'aaa', value : 'bbb'}
             */
            function getTabData(orig) {
                if(!orig || !orig.length) {
                    return null;
                }
                var tabData = [];
                if(opts.groupData) {
                    for(var i = 0; i < orig.length; i++) {
                        var o = orig[i];
                        var item = {};
                        var gd = SIB.getLocationValue(opts.groupData, o);
                        var gn = SIB.getLocationValue(opts.groupName, o);
                        item['groupName'] = gn;
                        item['groupData'] = getItemFormatter(gd);
                        tabData[i] = item;
                    }
                } else {
                    tabData = getItemFormatter(orig);
                }
                return tabData;
            }

            function getItemFormatter(orig) {
                return oAc.resultsFormatter(orig, opts.labelName, opts.valueName);
            }
        },
        render : function (oAc, data, $hot, options) {
            var results = data.results,
                tabTitle = data.tabTitle,
                //生成html
                tmpl =  '<div class="sib-ac-hot-tabs">'+
                            '<div class="hot-tab-tit"></div>' +
                            '<ul class="hot-tab-nav"></ul>' +
                            '<div class="hot-tab-content"></div>' +
                        '</div>';
            
            var $tabs = $(tmpl);
            var $nav = $tabs.find('ul.hot-tab-nav');
            var $body = $tabs.find('.hot-tab-content');
            $tabs.find('.hot-tab-tit').text(tabTitle);
            $.each(results, function(i, item){
                var $hd = $('<li></li>').text(item.tabName).attr('data-nav-index', i).appendTo($nav);
                var $bd = $('<div class="hot-tab-panel"></div>').attr('data-panel-index', i).appendTo($body);
                var tabData = item.tabData;
                
                //所有有分组
                var groupList = $.grep(tabData, function(it, idx){
                    return it.groupData && it.groupData.length;
                });
                //所有没有分组的
                var sigleList = $.grep(tabData, function(it, idx){
                    return it.label || it.value;
                });
                
                renderTabBodyItem('', sigleList, $bd);
                $.each(groupList, function(idx, it){
                    renderTabBodyItem(it.groupName, it.groupData, $bd);
                });
                $bd.hide();
            });
            
            function renderTabBodyItem(title, list, $container) {
                title = title || '';
                var $dl = $('<dl><dt></dt><dd></dd></dl>');
                var $dd = $dl.find('dd');
                $dl.find('dt').text(title);
                $.each(list, function(i, item){
                    var $it = $('<span><a class="hot-tab-item" href="javascript:void(0)"></a></span>');
                    $it.find('a').text(item.label).data('sib-autocomplete-item', item);
                    $dd.append($it);
                });
                $container.append($dl);
            }
            
            $hot.append($tabs);
        },
        bindEvents : function(oAc){
            var state = oAc.state,
                $hot = state.$hot;

            oAc._on($hot, {
                'click .hot-tab-item' : function( ev ){
                    var $this = $(ev.currentTarget);
                    var data = $this.data('sib-autocomplete-item');
                    oAc._trigger('select', event, {
                        node : $this,
                        selected : data
                    });
                }
            });
            
            oAc._on($hot, {
                'click ul.hot-tab-nav>li' : function( ev ){
                    var $this = $(ev.currentTarget);
                    var index = $this.attr('data-nav-index');
                    $hot.find('.hot-tab-nav li').removeClass('hot-tab-selected');
                    $this.addClass('hot-tab-selected');
                    $hot.find('.hot-tab-panel').hide();
                    $hot.find('.hot-tab-panel[data-panel-index='+index+']').show();
                }
            });
        }
    };

    return plugin;
});
