/**   
 * @Title: ComboBox.js 
 * @Description: sib ui
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-3-21
 * @version V1.0
 */
define(function(require, exports, module){
    
    //导入依赖样式资源
    require('css!./combobox.css');
    
    //depends
    var $   = require('../../core/1.0/jQuery+'),
        SIB = require('../../core/1.0/Sib'),
        Autocomplete  = require('../../autocomplete/1.0/Autocomplete'),
        w = (function(){return this;})(), d = w.document;

    //config
    var defaults = {
        autoFocus : true,
        //在输入框失去焦点时有推联想搜索结果，启用自动回填当前被激活的数据项
        enableAutoFill : true,
        //启用当无推荐结果时展示提示信息功能
        enableNoResultsMessage : true,
        //没有查询结果时的提示模板
        noResultsMessage : '没有"<span class="sib-ac-message-hightlight">{query}</span>"相关内容',
        selectMode : true, //只能选择已有的,不能输入不存在的内容
        //hot config
        showHot : false,
        searchable : true,  //是否只能选择,不能输入搜索
        
        allowEmpty : true,  //是否允许有空值
        emptyLabel : '',
        //待实现ing
        //multiple: false,      //是否支持多选
        //groupName : 'group',  //分组属性名
        listWidth : 'auto',     //列表宽度值：auto | fix(跟输入框保持一致) | number
        listMinHeight : 0,  //结果显示最小高度 0-不限
        listMaxHeight : 0   //结果显示最大高度
    };

    var ComboBox, CB;

    CB = ComboBox = Autocomplete.extend({
        static : {
            widgetName : 'SIBComboBox',
            require : require,
            optionFilter : 'selectMode',
            defaults : defaults
        },
        private : {
            /**
             * 将$element 重置成输入框,而不是最初的select.
             */
            _prepareOption : function(){
                var state = this.state,
                    opts = state.options,
                    self = this,
                    $el  = this.$element,
                    nodeName    = this.$element[0].nodeName.toLowerCase(),//$el 可能的参数 select input textarea
                    isTextarea  = nodeName === 'textarea',
                    isSelect    = nodeName === 'select',
                    isInput     = nodeName === 'input' || isSelect,
                    $ac,
                    $combo,
                    $valueField;

                state.origWidth = SIB.outerWidth($el);//.outerWidth();
                if(isSelect) {
                    $combo = $('<span class="sib-combo">'+
                                  '<input type="text" class="sib-combo-text" autocomplete="off">'+
                                  '<span>'+
                                      '<span class="sib-combo-arrow"></span>'+
                                  '</span>'+
                                  '<input type="hidden" class="sib-combo-value">'+
                              '</span>');
                    var name = $el.attr('name');
                    $el.removeAttr('name');
                    $el.attr('sib-combo-name', name);
                    $ac = $combo.find('>input.sib-combo-text');
                    $valueField = $combo.find('>input[type=hidden].sib-combo-value');
                    $valueField.attr('name', name);
                    $combo.insertBefore($el);
                    $el.hide();
                    state.$origElement = this.$element;
                    this.$element = $ac;
                    var sdata = this._transformSelect(state.$origElement);
                    if(sdata && sdata.length) {
                        opts.source = sdata;
                        //对于默认取select里的值，防止默认属性被重置,后面使用会有影响
                        $.extend(true, opts, {
                            resultsLocation : CB.defaults.resultsLocation,
                            labelName : CB.defaults.labelName,
                            valueName : CB.defaults.valueName
                        });
                    }
                } else {
                    $combo = $('<span class="sib-combo">'+
                                    //'<input type="text" class="sib-combo-text autocomplete="off">'+
                                    '<span>'+
                                        '<span class="sib-combo-arrow"></span>'+
                                    '</span>'+
                                    '<input type="hidden" class="sib-combo-value">'+
                                '</span>');
                    $ac = state.$origElement = this.$element;
                    var name = $ac.attr('name');
                    $ac.removeAttr('name');
                    $ac.attr('sib-combo-name', name);
                    $ac.addClass('sib-combo-text');
                    $combo.insertBefore($ac);
                    $combo.prepend($ac);
                    $valueField = $combo.find('>input[type=hidden].sib-combo-value');
                    $valueField.attr('name', name);
                }

                state.$ac       = $ac;
                state.$combo    = $combo;
                state.$arrow    = $combo.find('.sib-combo-arrow');
                state.$valueField = $valueField;
                state.isMultiLine = isTextarea ? true : isInput ? false : $ac.prop('isContentEditable');
                state.valueMethod = $ac[ isTextarea || isInput ? "val" : "text" ];
                
                state.isNewMenu   = true;
                if(opts.selectMode) {
                    opts.enableNoResultsMessage = true;
                }
                if(!opts.searchable) {
                    state.$ac.prop('readonly', true);
                }
                this.state = $.data(this.$element[0], CB.WN, state);
                $.data($valueField[0], CB.WN, state);

                /**
                 * 在selectdataready事件发出前绑定，否则不能执行
                 * 第一次加载数据或者重新定义数据源,如reload等
                 */
                this._on({
                    'selectdataready' : function(event) {
                        var state = this.state,
                            opts  = state.options,
                            all = state.allResults;
                        if($.isArray(all) && opts.allowEmpty) {
                            all.unshift({
                                label : opts.emptyLabel || '',
                                value : null
                            });
                        }
                        this._selectDefault();
                    }
                });
            },
            //解析select选择框，获取数据
            _transformSelect : function($el){
                var state = this.state,
                    data  = [];

                var $options = $el.find('option');
                $options.each(function(i, o){
                    var $o = $(o),
                        val = $o.attr('value'),
                        txt = $o.text(),
                        selected = $o.attr('selected'),
                        obj = {};

                    obj[CB.defaults.valueName] = val || txt;
                    obj[CB.defaults.labelName] = txt;
                    obj['selected'] = selected == 'selected';
                    data.push(obj);
                });

                return data;
            },
            _suggest : function() {     //显示搜索结果
                var state = this.state,
                    opts  = state.options,
                    menu  = state.menu;

                if(opts.allowEmpty && !state.term && $.isArray(state.results)) { //列出所有且可以有空值
                    state.results.unshift({
                        label : '',
                        value : null
                    });
                }
                this._renderMenu(state.results);
                menu._refresh();
                this.showResultsPanel();

                if ( opts.autoFocus && !this.value() ) {
                    menu.next();
                }
            },
            _renderMenuItem : function(item, $itemBody, $item) {
                var opts = this.state.options,
                    val  = this.value(),
                    itemInner;
                if($.isFunction(opts.listItemFormatter)) {
                    itemInner = opts.listItemFormatter.call(this, item, $itemBody);
                    if(itemInner && typeof itemInner === 'string') {
                        $itemBody.html(itemInner);
                    } else if( itemInner ) {
                        $itemBody.append(itemInner);
                    }
                } else {
                    $itemBody.html( item.label || '&nbsp;' );
                }
                if(val == item.value) {
                    $item.addClass('sib-combo-item-selected');
                }
            },
            _syncPosition : function(){
                var state = this.state,
                    opts = state.options,
                    $overlay = state.$overlay;

                var pos = $.extend({
                    of: state.$combo[0]
                }, opts.position );
                $overlay.position( pos );
            },
            _resizeMsg : function() {
                var state    = this.state,
                    $message = state.$message,
                    $combo   = state.$combo;

                $message.outerWidth( Math.max(
                    $message.width( "" ).outerWidth(),
                    $combo.outerWidth()
                ));
            },
            _resizeHot : function(){
                var state   = this.state,
                    opts    = state.options,
                    $hot    = state.$hot,
                    $combo  = state.$combo;

                $hot.width('auto');//reset
                var min = $combo.outerWidth();
                if(opts.hotWidth != 'auto' && opts.hotWidth > 0) {
                    $hot.outerWidth(opts.hotWidth);
                    return;
                }

                $hot.outerWidth(Math.min(
                    opts.hotMaxWidth,
                    Math.max(min, $hot.outerWidth())
                ));
            },
            _resizeMenu : function () {
                var state = this.state, 
                    opts  = state.options,
                    $combo= state.$combo, 
                    $results = state.$results,
                    $menu = state.menu.data().$menu;
                
                //reset
                $menu.width('');
                $menu.height('');
                
                var width = $menu.outerWidth() + 1;
                    height = $menu.height(),
                    comboW = $combo.outerWidth(),
                    hasScroll = opts.listMaxHeight > 0 && height > opts.listMaxHeight;
                
                if(hasScroll) {
                    $menu.outerHeight(opts.listMaxHeight);
                    width = width + SIB.getScrollBarWidth();
                } else {
                    if(height < opts.listMinHeight) {
                        $menu.outerHeight(opts.listMinHeight);
                    }
                }
                if(opts.listWidth == 'fix') {
                    $menu.outerWidth(comboW);
                } else if($.isNumeric(opts.listWidth)) {
                    $menu.outerWidth(opts.listWidth);
                } else {
                    $menu.outerWidth(Math.max(width,comboW));
                }
            },
            _hideOverlayByClickOut : function(){
                var state = this.state;
                $(d).click(function( event ){
                    if(SIB.isOutSide(event.target, [state.$combo, state.$overlay])) {
                        state.$overlay.hide();
                    }
                });
            },
            //autocomplete 中已经判断了selectMode 这里不用再判断值是否有效，只要判断值是否为无效,再判断是否支持empty
            _valueChangeHandler : function( event ) {
                var state = this.state,
                    opts  = state.options,
                    val   = this.value();
                    //all   = [].concat(state.allResults || [], state.results || []);
                //if(!all || all.length <= 0) return;

                //值为无效而且不支持为空则设置default
                if(SIB.isInvalidValue(val) && !opts.allowEmpty) {
                    this._selectDefault();
                }

                this.state.$valueField.val(this.value());
                this._trigger('valuechangeafter', event);
            },
            _fixCBHtml : function(){
                var state = this.state,
                    $combo= state.$combo,
                    $ac   = state.$ac,
                    $arrow= state.$arrow,
                    width = state.origWidth,
                    fw = SIB.outerWidth($combo) - SIB.width($combo),
                    aw = SIB.outerWidth($arrow, true),
                    w  = width - fw - SIB.outerWidth($arrow, true);

                //console.debug('width : ' + width + '; fw : ' + fw + '; w : ' + w);
                //console.debug('ac.outerWidth : ' + $ac.outerWidth() + '; ac.width : ' + $ac.width());
                $ac.outerWidth(w);
                this.state.$overlay.addClass('sib-combobox');
                
            },
            _bindCBEvent : function() {
                var state  = this.state,
                    opts   = state.options,
                    $arrow = state.$arrow,
                    $ac    = state.$ac,
                    $valueField = state.$valueField,
                    self   = this;

                $arrow.hover(function( ev ){
                    $(this).addClass('sib-combo-arrow-hover');
                }, function( ev ){
                    $(this).removeClass('sib-combo-arrow-hover');
                });
                $arrow.click(function( ev ){
                    //disabled状态不支持点击
                    if(!$ac.prop('disabled')) {
                        self._trigger('focus', ev);
                        ev.stopPropagation();
                    }
                });
                
                if(!opts.showHot) {
                    this._on({
                        'focus' : function( event ){
                            if(!state.forceHiddenCBResult) {
                                this._searchRequest('');
                            }
                        },
                        'click' : function( event ) {
                            /**不阻止传播,事件会将menu失去焦点,autoFocus自动选中第一个效果会消失
                             * 导致一个问题：两个combobox，第一个显示overlay,点击第二个combobox，则第一个overlay不会消失
                             */
                            //event.stopPropagation();
                        },
                        /**
                         * IE下,触发input的select事件会连带触发focus事件,
                         * 这种情况不显示结果集列表,导致无法关闭结果集
                         */
                        'select' : function( event ) {
                            state.forceHiddenCBResult = true;
                            SIB.later(function(){
                                state.forceHiddenCBResult = false;
                            }, 50);
                        }
                    });
                }
            },
            _selectDefault : function() {
                var state = this.state,
                    self  = this,
                    opts  = state.options,
                    all   = [].concat(state.allResults || [], state.results || []);

                if(!all || all.length <= 0) return;

                var defaultObj = all[0];
                for(var i = 0; i < all.length; i++) {
                    var item = all[i];
                    if(item.selected) {
                        defaultObj = item;
                        break;
                    }
                }

                if(defaultObj && !SIB.isInvalidValue(defaultObj.value)) {
                    this.value(defaultObj.value);
                } else if(opts.allowEmpty) {
                    this.labelValue(opts.emptyLabel);
                }
            }
        },
        public : {
            _init : function() {
                this._super();
                this._fixCBHtml();
                this._bindCBEvent();
                this._selectDefault();
            },
            _refresh : function() {
                this.$element = this.state.$ac;
                return this._super();
            },
            //重新加载 arg : array | url | function
            reload : function(source) {
                this.setOptions({
                    source : source
                });
            },
            close : function(){
                this._super();
                this.state.$combo.removeClass('sib-combo-active');
            },
            showResultsPanel : function(){
                this._super();
                this.state.$combo.addClass('sib-combo-active');
            },
            showHotPanel : function(){
                this._super();
                this.state.$combo.addClass('sib-combo-active');
            },
            value : function(val){
                var ret = this._super(val);
                if(val === null || (val && val.value === null)) {
                    this._selectDefault();
                }
                return ret;
            }
        }
    });

    return CB;
});