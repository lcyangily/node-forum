/**   
 * @Title: Autocomplete.js 
 * @Description: Autocomplete.js
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-8-12
 * @version V1.2
 * 将输入框值改变触发事件由valuechange 调整为inputchange
 * autocomplete值改变事件有change 调整为valuechange
 * 解决在IE下选择下拉框，会莫名触发 input的 change事件,导致selectMode为true时,
 * 选择值总是提示不存在！对IE只想说一个字：X
 */
define(function(require, exports, module){

    //depends
    var $ = require('jquery+'),
        Widget = require('sib.widget'),
        SIB  = require('sib.sib'),
        JSON = require('json'),
        Menu = require('sib.menu'),
        tab  = require('sib.autocomplete.tab'),
        table = require('sib.autocomplete.table'),
        w = (function(){return this;})(), d = w.document;

    //config
    var defaults = {
        defaultElement : '<input>',
        appendTo : null,
        autoFocus : false,  //是否自动选中第一条数据
        delay : 300,
        minLength : 1,
        source : null,     //源
        sourceParam: {},   //如果源是url，此处可以配置参数(查询时也将此参数传递过去)
        method : 'get',    //get post
        paramType : null, //'json' = 提交的参数是json格式,将对象转成json格式的串
        contentType : null, //'application/json' = 提交的数据是json格式
        width : 'smart',    //smart-最小宽度是输入框, auto-自动, number-固定的
        zIndex : 1000,
        position : {    //位置
            my : 'left top-1', 
            at : 'left bottom'
        },

        listItemFormatter : null, //list显示每条 function
        listItemFilter : null, //function 过滤结果集
        //在输入框失去焦点时有推联想搜索结果，启用自动回填当前被激活的数据项
        enableAutoFill : true,
        //启用当无推荐结果时展示提示信息功能
        enableNoResultsMessage : false,
        //没有查询结果时的提示模板
        noResultsMessage : '没有"<span class="sib-ac-message-hightlight">{query}</span>"相关内容',
        selectMode : false, //只能选择已有的,不能输入不存在的内容
        resultsLocation : null,
        labelName : 'label',
        valueName : 'value',
        hideByClickOut : true,  //点击overlay外是否隐藏overlay

        //hot config
        showHot : true,
        hotSource : null,
        hotWidth : 'auto',
        hotMaxWidth : 320,
        hotMode : 'table',   //  list/table/grid/tab or function(results, $hot)
        hotOptions : {}, 
        
        //callback
        resultchangeshowbefore : null, //resultchange 后 show 之前触发,返回false 不显示渲染结果集
        inputchange : null, //输入框值改变
        querychange : null, //查询值改变(如果输入框值改变且达到最小查询长度且本次值与上一次查询值不同)
        resultchange : null, //查询结果集改变
        valuechange : null,  //值发生改变
        selectdataready : null,  //选择模式如果配置url则加载一次数据,加载完触发事件
        close : null,
        /*focus : null,*/
        /*open : null,*/
        response : null,
        search : null,
        select : null,
        showResult : null,
        showHot : null
    };
    
    var requestIndex = 0,
        //层的基础HTML模板结构
        acTmpl = '<div class="sib-autocomplete">' + 
                    '<div class="sib-ac-header"></div>' +
                    '<div class="sib-ac-body">' +
                    '   <div class="sib-ac-message">暂无数据</div>' +
                    '   <div class="sib-ac-content">' +
                    '       <div class="sib-ac-hotlist"></div>' +
                    '       <div class="sib-ac-resultlist"></div>' +
                    '   </div>' +
                    '</div>' +
                    '<div class="sib-ac-footer"><span></span></div>'+
                '</div>';

    //查询参数转换
    var queryParamTransform = function(param, type) {

        var query = {};
        if (type === 'json' && typeof param === 'object') {
            for (var name in param) {
                $.extend(true, query, paramProp(name, param));
            }
            return JSON.stringify(query);
        }
        return param;
        function paramProp(key, obj) {
            var tmp = prop = {},
            props = key.split('.');
            for (var i = 0; i < props.length; i++) {
                if (i == props.length - 1) {
                    tmp = tmp[props[i]] = obj[key];
                } else {
                    tmp = tmp[props[i]] = {};
                }
            }
            return prop;
        }
    }
    var isDigits = function(val){
        return /^\d+$/.test( val );
    }

    var Autocomplete,A;

    A = Autocomplete = Widget.extend({
        static : {
            widgetName : 'SIBAutocomplete',
            require : require,
            defaults : defaults,
            hotPlugins : {
                tab   : tab,
                table : table
            }
        },
        private : {
            _prepareOption : function(){
                var state = this.state,
                    opts  = state.options,
                    self  = this,
                    nodeName    = this.$element[0].nodeName.toLowerCase(),
                    isSelect    = nodeName === 'select',
                    isTextarea  = nodeName === 'textarea',
                    isInput     = isSelect || nodeName === 'input';

                var $ac = state.$ac = this.$element;
                state.isMultiLine = isTextarea ? true : isInput ? false : $ac.prop('isContentEditable');
                state.valueMethod = $ac[ isTextarea || isInput ? "val" : "text" ];
                //state.isNewMenu   = true;

                if(opts.selectMode) {
                    opts.enableNoResultsMessage = true;
                }
            },
            _buildHTML : function(){
                var state = this.state,
                    opts = state.options,
                    $ac = state.$ac;

                var $overlay   = state.$overlay = $(acTmpl);
                state.$content = $overlay.find('.sib-ac-content');
                state.$header  = $overlay.find('.sib-ac-header');
                state.$results = $overlay.find('.sib-ac-resultlist');
                state.$message = $overlay.find('.sib-ac-message');
                state.$hot     = $overlay.find('.sib-ac-hotlist');
                state.$footer  = $overlay.find('.sib-ac-footer');

                $ac.addClass('sib-autocomplete-input').attr('autocomplete', 'off'); //关闭浏览器默认的自动完成功能
                $overlay.appendTo(this._getOverlayWrap());
                $overlay.hide();
                $overlay.css('zIndex', opts.zIndex);
                state.$liveRegion = $( "<span>", {
                    role: "status",
                    "aria-live": "polite"
                })
                .addClass( "sib-helper-hidden-accessible" )
                .insertBefore( $ac );
            },
            _initSource : function(){
                var state = this.state,
                    opts = state.options,
                    self = this;

                var source = this._getSource(opts.source, opts.resultsLocation);
                state.allResults = null;
                if(source && opts.selectMode) {
                    source( $.extend({}, opts.sourceParam), function( cb ){
                    //    var content = cb;
                    //    if( content ) { //解析
                    //        content = self.resultsFormatter(content);
                        state.allResults = self._parseResponse(cb);
                        state.results = null;//重新加载所有数据时,将之前搜索结果置空
                        state.source = self._getSource(cb);
                        //解决在_refresh后到数据加载完前,显示hot，则_hasBuildHot为true，新数据再也不会被显示BUG
                        state._hasBuildHot = false;
                        if(state.$hot.is(':visible')) { //如果当前显示,立即渲染hot
                            self.showHotPanel();
                        }
                        self._trigger('selectdataready', null, {
                            allResults : state.allResults
                        });
                    //    }
                    });
                } else {
                    state.source = source;
                }
            },
            _listFilter : function(array, term) {  //对数组过滤出与输入匹配的数据(数组)
                var regStr = (term || '').replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"),
                    matcher = new RegExp( regStr, "i" );
                return $.grep( array, function(value) {
                    //如果 value 是一个Object，正则会转成 "object" 则导致输入o-b-j-e-c-t 字符总是匹配的bug
                    if(value.label || value.value) {
                        return matcher.test( value.label ) || matcher.test( value.value );
                    } else {
                        if(typeof value === 'string' || typeof value === 'number') {
                            return matcher.test( value );
                        }
                        return false;
                    }
                });
            },
            _bindEvent : function(){
                var state = this.state,
                    opts = state.options,
                    $ac = state.$ac, 
                    self = this;

                //输入框值被改变后的操作, 根据情况做相应操作或触发查询事件
                var inputChange = SIB.buffer(function() {
                    if( !self.labelValue() || self.labelValue().length < opts.minLength ) {
                        self.showHotPanel();
                    } else if ( state.term !== self.labelValue() ) {
                        state.selectedItem = null;
                        self.showResultsPanel();
                        //self.search( null, event );
                        self._trigger('querychange');
                    }
                }, opts.delay);

                //防止一次改变触发多次change事件
                state.__triggerChangeFunc = SIB.buffer(function( event ){
                    self._trigger('valuechange', event);
                }, 100);//需要大于blur 延迟的时间

                //查询条件改变
                this._on({
                    'inputchange' : inputChange, //输入框值改变
                    'querychange' : function(event){ //触发查询事件
                        // always save the actual value, not the one passed as an argument
                        var val = this.labelValue();
                        state.term = val;
                        this._searchRequest(val);
                    },
                    /**
                     * blur/select event | value/labelValue method 会触发valuechange
                     * valuechange前值已经改过,在valuechange中不能再调用以上方法,不然递归死循环
                     */
                    'valuechange' : function( event ){ //离开组件且输入框值改变
                        
                        this._valueChangeHandler( event );
                    }
                });

                //绑定input,keydown事件,触发inputchange
                this._on({
                    'input' : function( event ){
                        this._trigger('inputchange');
                    },
                    'focus' : function( event ){
                        //this._trigger('valuechange');
                        //if( !self.labelValue() ) {
                        if(!state.forceHiddenHot) {
                            self.showHotPanel();
                        }
                        //}
                    },
                    'blur' : SIB.buffer(function( event ) {
                        var state    = this.state,
                            $results = state.$results,
                            $hot     = state.$hot;

                        if(!$hot.is(':visible') && !$results.is(':visible')) {
                            //this._selectModeCheck();

                            var state = this.state,
                                opts  = state.options,
                                lv = this.labelValue(),
                                selectedItem,
                                noPat = true;
                            if(opts.selectMode) {
                                if(this.state.allResults) {
                                    $.each(this.state.allResults, function(i, item){
                                        if( lv == item.label ) {
                                            noPat = false;
                                            selectedItem = item;
                                            return true;
                                        }
                                    });
                                    if(noPat) {
                                        this.value(null);
                                        this._showErrorMsg(lv);
                                    } else {
                                        state.selectedItem = selectedItem;
                                        this.value(state.selectedItem);
                                    }
                                }
                            } else {
                                state.__triggerChangeFunc(event);
                            }
                        }
                    }, 300),
                    'select' : function( event, param ){
                        //console.info('select ... ');
                        /**
                         * 触发input的select事件会连带触发focus事件,
                         * 此时focus事件不显示hot面板
                         */
                        state.forceHiddenHot = true;
                        SIB.later(function(){
                            state.forceHiddenHot = false;
                        }, 50);
                        if(!param || !param.selected) {
                            return;
                        }
                        state.term = self.labelValue();
                        state.selectedItem = param.selected;
                        //self.labelValue(state.selectedItem.label || state.selectedItem.value);
                        //console.debug(state.selectedItem.label);
                        self.value(state.selectedItem);
                        self.close();
                        //this._trigger('change', event);
                        state.__triggerChangeFunc(event);
                    },
                    'keydown' : function( event ){
                        if ( $ac.prop( "readOnly" ) ) {
                            return;
                        }

                        var keyCode = SIB.keyCode;
                        switch( event.keyCode ) {
                        case keyCode.PAGE_UP:
                        case keyCode.PAGE_DOWN:
                        case keyCode.UP:
                        case keyCode.DOWN:
                        case keyCode.ENTER:
                        case keyCode.NUMPAD_ENTER:
                        case keyCode.TAB:
                            break;
                        case keyCode.ESCAPE:
                            self.close();
                            break;
                        default:
                            this._trigger('inputchange');
                            break;
                        }
                    }
                });

                if(opts.hideByClickOut) {
                    this._hideOverlayByClickOut();
                }
            },
            //valuechange事件处理函数
            _valueChangeHandler : function( event ){
                this._trigger('valuechangeafter', event);
            },
            _hideOverlayByClickOut : function(){
                var state = this.state,
                    self  = this;
                //区域外点击隐藏
                $(d).click(function( event ){
                    if(SIB.isOutSide(event.target, [state.$ac, state.$overlay])) {
                        self.close(); //state.$overlay.hide();
                    }
                });
            },
            //获得搜索结果展示的位置
            _getOverlayWrap : function(){
                var state = this.state,
                    opts = state.options,
                    $ac = state.$ac;

                var element = opts.appendTo;

                if ( element ) {
                    element = element.jquery || element.nodeType ?
                        $( element ) :
                        $(d).find( element ).eq( 0 );
                }

                if ( !element ) {
                    element = $ac.closest( ".sib-front" );
                }

                if ( !element.length ) {
                    element = d.body;
                }
                return element;
            },
            _createMenu : function(){
                var state = this.state,
                    opts = state.options,
                    self = this,
                    $ac = state.$ac,
                    m = $("<ul>").addClass("sib-front").appendTo(state.$results);

                //构建menu
                var menu = state.menu = new Menu({
                    // disable ARIA support, the live region takes care of that
                    role: null,
                    target : m
                });
                var menuState = menu.data(),
                    $menu = menuState.$menu;

                //autocomplete上事件触发menu 行为
                this._on({
                    'inputchange' : function( event ) {
                        
                    },
                    'querychange' : function( event ) {
                        
                    },
                    'resultchange' : function( event ){
                        //alert('result is change');
                        if(this._trigger('resultchangeshowbefore') !== false && state.results && state.results.length && !opts.disabled && !state.cancelSearch) {
                            this._suggest();
                        } else if( this.labelValue() && !opts.disabled && !state.cancelSearch) {
                            this._showErrorMsg(this.labelValue());
                        } else {
                            this.close();//state.$overlay.hide();
                        }
                    },
                    'keydown' : function(event){
                        //jshint maxcomplexity:15
                        if ( $ac.prop( "readOnly" ) ) {
                            return;
                        }

                        var keyCode = SIB.keyCode;
                        switch( event.keyCode ) {
                        case keyCode.PAGE_UP:
                            keyEvent( 'previousPage', event );
                            break;
                        case keyCode.PAGE_DOWN:
                            keyEvent( "nextPage", event );
                            break;
                        case keyCode.UP:
                            keyEvent( "previous", event );
                            break;
                        case keyCode.DOWN:
                            keyEvent( "next", event );
                            break;
                        case keyCode.ENTER:
                        case keyCode.NUMPAD_ENTER:
                            // when menu is open and has focus
                            if ( $menu.is(':visible') && menuState.$active ) {
                                // #6055 - Opera still allows the keypress to occur
                                // which causes forms to submit
                                event.preventDefault();
                                menu.select( event );
                            }
                            break;
                        case keyCode.TAB:
                            if ( $menu.is(':visible') && menuState.$active ) {
                                menu.select( event );
                            } else {
                                self.close();
                            }
                            break;
                        case keyCode.ESCAPE:
                            if (menu.$element.is(":visible")) {
                                self.labelValue(state.term);
                                //state.valueMethod.call($ac, state.term);
                                self.close( event );
                                //closeMenu( event );
                                // Different browsers have different default behavior for escape
                                // Single press can mean undo or clear
                                // Double press in IE means clear the whole form
                                event.preventDefault();
                            }
                            break;
                        default:
                            
                        }
                    }
                });

                //menu通过键盘上下移动
                function move( direction, event ) {
                    //console.debug('direction : ' + direction + '; event : ' + event);
                    if ( menu.isFirstItem() && /^previous/.test( direction ) ||
                            menu.isLastItem() && /^next/.test( direction ) ) {
                        //value.call( this, this.term );
                        //acc.valueMethod.call($ac, acc.term);
                        self.labelValue(state.term);
                        menu.blur();
                        return;
                    }
                    menu[ direction ]( event );
                }
                
                function keyEvent( keyEvent, event ) {
                    if ( state.isMultiLine || menu.$element.is( ":visible" ) ) {
                        move( keyEvent, event );
                        // prevents moving cursor to beginning/end of the text field in some browsers
                        event.preventDefault();
                    }
                }

                //监听menu上的行为,做相应的处理(如数据回填),绑定menu(下拉框)的事件
                menu._on({
                    'mousedown' : function(event){
                        // prevent moving focus out of the text field
                        event.preventDefault();
                        // IE doesn't prevent moving focus even with event.preventDefault()
                        // so we set a flag to know when we should ignore the blur event
                        self.cancelBlur = true;
                        setTimeout(function() {
                            delete self.cancelBlur;
                        }, 0);
    
                        // clicking on the scrollbar causes focus to shift to the body
                        // but we can't detect a mouseup or a click immediately afterward
                        // so we have to track the next mousedown and close the menu if
                        // the user clicks somewhere outside of the autocomplete
                        var menuElement = menu.$element;
                        if ( !$( event.target ).closest( ".sib-menu-item" ).length ) {
                            setTimeout(function() {
                                var that = self;
                                $(d).one( "mousedown", function( event ) {
                                    if ( event.target !== that.element &&
                                            event.target !== menuElement &&
                                            !$.contains( menuElement, event.target ) ) {
                                        that.close();
                                        //closeMenu(event);
                                    }
                                });
                            }, 0);
                        }
                    },
                    'menufocus' : function(event, ui){

                        var item = ui.item.data("sib-autocomplete-item");
                        if (event.originalEvent && /^key/.test( event.originalEvent.type)) {
                            //self.labelValue( item.label || item.value );
                            self.value( item );
                        }
                    },
                    'menuselect' : function(event, ui){
                        var item = ui.item.data("sib-autocomplete-item"),
                            previous = this.previous;

                        // only trigger when focus was lost (click on menu)
                        if ( $ac[0] !== d.activeElement ) {
                            $ac.focus();
                            state.previous = previous;
                            // #6109 - IE triggers two focus events and the second
                            // is asynchronous, so we need to reset the previous
                            // term synchronously and asynchronously :-(
                            setTimeout(function() {
                                self.previous = previous;
                                self.selectedItem = item;
                            }, 0);
                        }
    
                        self._trigger('select', event, {
                            node : ui.item,
                            selected : item,
                            oldTerm : state.term    //在选择的时候，获取输入的term，否则 select事件中获取的都是 selected的label
                        });
                    }
                });
            },
            _suggest : function() {     //显示搜索结果
                var state = this.state,
                    opts  = state.options,
                    menu  = state.menu;

                this._renderMenu(state.results);
                //state.isNewMenu = true;
                menu._refresh();
                this.showResultsPanel();

                if ( opts.autoFocus ) {
                    menu.next();
                }
            },
            //渲染菜单
            _renderMenu : function(items) {
                var state = this.state,
                    opts  = state.options,
                    menu  = state.menu,
                    $menu = menu.data().$menu,
                    self  = this;

                $menu.empty();
                $.each( items, function( index, item ) {
                    //自定义按照数据生成每条数据
                    var $item = $('<li></li>'),
                        $itemBody = $('<a></a>');

                    self._renderMenuItem(item, $itemBody, $item);
                    $item.append($itemBody).appendTo($menu);
                    $item.data('sib-autocomplete-item', item);
                });
            },
            //渲染菜单项
            _renderMenuItem : function(item, $itemBody, $item) {
                var opts = this.state.options,
                    itemInner;
                if($.isFunction(opts.listItemFormatter)) {
                    itemInner = opts.listItemFormatter.call(this, item, $itemBody);
                    if(itemInner && typeof itemInner === 'string') {
                        $itemBody.html(itemInner);
                    } else if( itemInner ) {
                        $itemBody.append(itemInner);
                    }
                } else {
                    $itemBody.html( item.label );
                }
            },
            _initHot : function(){
                var state = this.state,
                    opts = state.options,
                    hotOptions = opts.hotOptions,
                    $hot = state.$hot,
                    self = this;

                $hot.html('加载中,请稍后 ... ');
                state.hotSource = this._getSource(opts.hotSource);
                if( !state.hotSource && opts.selectMode ) {
                    if(!state.allResults) {
                        return;
                    }
                    state.hotSource = state.source;//this._getSource(state.allResults);
                    //如果selectMode 公用数据源，那么解析参数也应该一样
                    $.extend(opts.hotOptions, {
                        resultsLocation : opts.resultsLocation,
                        labelName : opts.labelName,
                        valueName : opts.valueName
                    });
                    opts.hotMode = 'table';
                } else if( !state.hotSource ) {
                    return;
                }
                this._buildHot();
            },
            //_createHot : function(){},
            _buildHot : function(){
                var state = this.state,
                    opts = state.options,
                    hotMode = opts.hotMode,
                    self = this;

                //如果未加载hot插件，先加载插件
                if(typeof hotMode === 'string' && !A.hotPlugins[hotMode]) {
                    require(['./plugins/' + hotMode], function(){
                        if(!A.hotPlugins[hotMode]){ //如果加载失败,防止递归死循环
                            A.hotPlugins[hotMode] = {
                                create : $.noop
                            }
                        }
                        buildHotHtml();
                    });
                } else {
                    buildHotHtml();
                }
                
                function buildHotHtml() {
                    state.$hot.empty();
                    var hotPlugin = A.hotPlugins[hotMode];
                    state.hotOptions = $.extend({}, hotPlugin.options, opts.hotOptions);
                    if(hotPlugin && typeof hotPlugin.init === 'function') {
                        state.hotSource( {}, function(content){
                            hotPlugin.init.call(hotPlugin, self, content, state.hotOptions); 
                        });
                    }
                    state._hasBuildHot = true;
                    self.showHotPanel();
                }
            },
            _close : function( event ) {
                var state = this.state,
                    menu = state.menu,
                    $results = state.$results,
                    $overlay = state.$overlay;

                if ( state.$results.is( ":visible" ) ) {
                    $results.hide();
                    menu.blur();
                    //state.isNewMenu = true;
                }
                $overlay.hide();
                this._trigger('close');
            },
            _syncPosition : function(){
                var state = this.state,
                    opts = state.options,
                    $overlay = state.$overlay;

                var pos = $.extend({
                    of: state.$ac[0]
                }, opts.position );
                $overlay.position( pos );
            },
            _resizeMsg : function() {
                var state    = this.state,
                    $message = state.$message,
                    $ac      = state.$ac;

                $message.outerWidth( Math.max(
                        $message.width( "" ).outerWidth(),
                        $ac.outerWidth()
                    ));
            },
            _resizeHot : function(){
                var state = this.state,
                    opts = state.options,
                    $hot = state.$hot,
                    $ac = state.$ac;

                $hot.width('');//reset
                var min = $ac.outerWidth();
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
                    $ac   = state.$ac, 
                    opts  = state.options,
                    $menu = state.menu.data().$menu;
                
                if(isDigits(opts.width)) {
                    $menu.outerWidth(opts.width);
                } else if(opts.width == 'auto') {
                    //自动
                } else {
                    $menu.outerWidth( Math.max(
                            // Firefox wraps long text (possibly a rounding bug)
                            // so we add 1px to avoid the wrapping (#7513)
                            $menu.width( "" ).outerWidth() + 1,
                            $ac.outerWidth()
                        ) );
                }
            },
            //显示overlay 重新设置z-index,如果跟Dialog公用,Dialog会不停的增大,导致被隐藏
            _showOverlay : function(){
                var state = this.state,
                    opts  = state.options;

                state.$overlay.show();
                state.$overlay.css('zIndex', opts.zIndex);
            }
        },
        public : {
            _init : function(){

                this._prepareOption();
                this._buildHTML();
                this._bindEvent();
                this._createMenu();
                var self = this;

                /* 先创建返回对象，再加载数据 */
                setTimeout(function(){
                    self._refresh();
                },0);
                //this._createHot();
            },
            //根据入参得到数据源
            _getSource : function( inSource ){ 
                var state = this.state,
                    opts = state.options,
                    $ac = state.$ac,
                    self = this,
                    array, 
                    url,
                    source;

                if ( typeof inSource === "string" ) { //url
                    url = inSource;
                    source = function( request, response ) {
                        if ( state.xhr ) {
                            state.xhr.abort();
                        }
                        state.xhr = $.ajax({
                            url: url,
                            type : opts.method,
                            contentType : opts.contentType || 'application/x-www-form-urlencoded; charset=UTF-8',
                            data : queryParamTransform(request, opts.paramType),
                            dataType : 'json',
                            success: function( data ) {
                                response( data );
                            },
                            error: function() {
                                response( [] );
                            }
                        });
                    };
                } else if ($.isFunction(inSource)) { //function
                    source = inSource;
                } else if ( inSource ) {    //object | array
                    source = function( request, response ) {
                        response( inSource, true, request );
                    };
                } else {
                    source = null;
                }
                return source;
            },
            _refresh : function(){
                this._initSource();
                //this.state.$hot.empty();
                this.state._hasBuildHot = false;
            },
            //内部使用
            _showErrorMsg : function(queryStr){
                var state = this.state,
                    opts  = state.options;
                if(opts.enableNoResultsMessage && opts.noResultsMessage) {
                    var errorMsg = SIB.unite(opts.noResultsMessage, {
                        query : queryStr
                    });
                    this.showMessage(errorMsg);
                } else {
                    this.hide();
                }
            },
            /**
             * 搜索查询，查询结果但不改变输入框值
             * 内部使用，不建议调用
             * 外面使用 search
             */
            _searchRequest : function( value ) {
                var state = this.state,
                    opts = state.options,
                    $ac = state.$ac;
                state.pending++;
                $ac.addClass( "sib-autocomplete-loading" );
                state.cancelSearch = false;

                if(!state.source) {
                    return;
                }
                state.term = value;
                state.source( $.extend({}, opts.sourceParam, {term : value}), $.proxy(this.response, this) );
            },
            /**
             * content 为显示的数组
             * noFilter 表示是否需要过滤：
             *   1) ajax后台返回默认已经过滤了
             *   2) Array 数组默认为过滤
             * request 查询参数
             */
            response : function( inContent, hasFilter, request ) {
                var state = this.state,
                    self = this, 
                    opts = state.options,
                    content = inContent,
                    $ac = state.$ac;

                content = this._parseResponse(content);

                //filter
                if(hasFilter) {
                    content = self._listFilter( content, request.term )
                }

                if($.isFunction(opts.listItemFilter)) {
                    content = $.grep( content, function(item) {
                        return opts.listItemFilter(item);
                    });
                }
                state.results = content;

                state.pending--;
                if ( !state.pending ) {
                    $ac.removeClass( "sib-autocomplete-loading" );
                }
                this._trigger('resultchange');
            },
            _parseResponse : function ( origContent, iLocation, labelName, valueName ){
                var state = this.state,
                    opts = state.options,
                    content = origContent,
                    location = iLocation || opts.resultsLocation;
                
                //location
                if (location) {
                    content = SIB.getLocationValue(location, content);
                    if (!content || !$.isArray(content)) { //存在且是数组
                        content = origContent;
                    }
                }

                //formatter
                if ( content ) {
                    content = this.resultsFormatter(content, labelName, valueName);
                }
                return content;
            },
            //对返回的数组格式化成{'label' : label, 'value' : value}
            resultsFormatter : function(inItems, iLabelName, iValueName){
                var state = this.state,
                    opts = state.options,
                    labelName = iLabelName || opts.labelName,
                    valueName = iValueName || opts.valueName,
                    items = inItems;
                
                // assume all items have the right format when the first item is complete
                if ( items.length && items[0].label && items[0].value && items[0].isFormatter) {
                    return items;
                }
                return $.map( items, function( item ) {
                    if ( typeof item === "string" ) {
                        return {
                            label: item,
                            value: item,
                            orig : item,
                            isFormatter : true
                        };
                    }
                    var l = SIB.getLocationValue(labelName, item),
                        v = SIB.getLocationValue(valueName, item);
                    return {
                        label : l || v,
                        value : v || l,
                        orig : item,
                        isFormatter : true
                    };
                });
            },
            showResultsPanel : function(){
                var state = this.state;
                if(!state.results || state.results.length <= 0) {
                    this.close();//state.$overlay.hide();
                    return;
                }
                this._showOverlay();
                state.$results.show();
                state.$message.hide();
                state.$hot.hide();
                this._resizeMenu();
                this._syncPosition();
                this._trigger('showResult');
            },
            showHotPanel : function() {
                var state = this.state,
                    opts  = state.options;
                if(!opts.showHot || (!opts.hotSource && !opts.selectMode )) {
                    return;
                }
                if(!state._hasBuildHot) {
                    this._initHot();
                }
                this._showOverlay();
                state.$results.hide();
                state.$message.hide();
                state.$hot.show();
                this._resizeHot();
                this._syncPosition();
                this._trigger('showHot');
            },
            showMessage : function (msg){
                var state = this.state,
                    $ac = state.$ac,
                    $message = state.$message;

                $message.html(msg);
                $message.show();
                this._showOverlay();
                state.$results.hide();
                state.$hot.hide();

                this._resizeMsg();
                this._syncPosition();
                return this;
            },
            hideHotPanel : function(){
                this.state.$hot.hide();
            },
            hideResultsPanel : function(){
                this.state.$results.hide();
            },
            hide : function(){
                this.close();//this.state.$overlay.hide();
            },
            //获取搜索框中的值
            labelValue : function(){
                var state = this.state,
                    $ac = state.$ac;

                return state.valueMethod.apply( $ac, arguments );
            },
            value : function(val){
                var state = this.state,
                    self = this,
                    opts = state.options,
                    old = state.selectedItem,
                    isChg = true;

                if(val === null) {  //清空
                    state.selectedItem = null;
                    self.labelValue('');
                    isChg = (old != null);
                    //return old && old.value;
                } else if(SIB.isInvalidValue(val)) {    //获取值
                    return state.selectedItem && state.selectedItem.value;
                } else if(opts.selectMode) {
                    var all = [].concat(state.allResults || [], state.results || []/*, state.hotResults*/),
                        hasV = false,
                        inVal = val.value || val;
                    $.each(all, function(i, item){
                        if(item.value == inVal) {
                            state.selectedItem = item;
                            self.labelValue(item.label || item.value);
                            hasV = true;
                            return false;
                        }
                    });
                    if(!hasV) {
                        state.selectedItem = null;
                        self.labelValue('');
                        isChg = (old != null);
                    } else {
                        isChg = (old == null || (state.selectedItem.value != old.value));
                    }
                } else {
                    state.selectedItem = val.value ? val : {
                        value : val,
                        label : val
                    };
                    self.labelValue(state.selectedItem.label);
                    isChg = (old == null || (state.selectedItem.value != old.value));
                }
                
                if(isChg) {
                    state.__triggerChangeFunc && state.__triggerChangeFunc();
                }

                var rv = (state.selectedItem || old); 
                return (rv && rv.value) || rv;
            },
            close: function( event ) {
                var state = this.state;
                state.cancelSearch = true;
                this._close(event);
            },
            search: function( value, event ) {
                this.labelValue(value);
                this._trigger('querychange');
            },
            setOptions : function(opts){
                var ret = this._super(opts);

                if(opts['source']) {
                    this._refresh();
                }
                return ret;
            },
            getSelected : function() {
                return this.state.selectedItem && this.state.selectedItem.orig;
            }
        }
    });

    return A;
});