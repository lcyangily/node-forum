/**   
 * @Title: Dialog.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-2-11
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./dialog.css');
    
    var $      = require('jquery+'),
        SIB    = require('sib.sib'),
        Widget = require('sib.widget'),
        Mask   = require('sib.dialog.mask'),
        Events = require('events'),
        w = (function(){return this})(), d = w.document;

    //默认值
    var defaults = {
        //appendTo : "",
        //autoOpen : true,
        trigger : null,
        title : null,
        content : null,

        //buttons : [], //object | array
        closeOnEscape : true, //当前对话框获取焦点的情况下，是否允许ESC键关闭
        closeTpl : '×',
        //dialogClass : '',
        height : 'auto',
        width : 'auto',
        maxHeight : null,
        maxWidth : null,
        minHeight : 100,
        minWidth : 150,
        iframeDefaultHeight : 300,  //iframe 加载完成前，设置的默认高度
        modal : false,
        position : {
            my : 'center',
            at : 'center',
            of : w,
            collision : 'fit',
            // 保证顶部header和close按钮始终能在可视区域内
            using: function( pos ) {
                var topOffset = $( this ).css( pos ).offset().top;
                if ( topOffset < 0 ) {
                    $( this ).css( "top", pos.top - topOffset );
                }
            }
        },
        draggable : false,
        theme : null,
        //resiable : true,
        //show : null, //显示时动画
        //hide : null, //关闭时动画

        //简单的动画效果 none | fade | slide
        effect : '',
        speed : 'normal',
        zIndex : 999,
        btns : null, //[{tpl : '', label : '', click : function(){}, align : 'left'}]

        //callback event
        iframeload : null,  //iframe load 触发的事件
        beforeclose : null,
        afterclose : null,
        close : null,
        drag : null,
        dragStart : null,
        dragStop : null,
        focus : null,
        open : null/*,
        resize : null,
        resizeStart : null,
        resizeStop : null*/
    };

    var dTmpl = '<div class="{clsPrefix}" data-role="dialog">' +
                    '<div class="{clsPrefix}-header sib-clearfix" data-role="header">' + 
                        '<span class="{clsPrefix}-title" data-role="title">{title}</span>' +
                    '</div>'+
                    '<a class="{clsPrefix}-close" title="Close" href="javascript:;" data-role="close"></a>' +
                    '<div class="{clsPrefix}-content" data-role="content"></div>' +
                    '<div class="{clsPrefix}-shadow"></div>'+
                '</div>';
    var btnTpl = '<div class="{clsPrefix}-btns sib-clearfix" data-role="btns"></div>';

    var D, Dialog;
    D = Dialog = Widget.extend({
        static : {
            widgetName : 'SIBDialog',
            require : require,
            optionFilter : 'target',
            clsPrefix : 'sib-dialog',
            defaults : defaults,
            template : dTmpl,
            allDialogs : [],
            mask : new Mask(),
            MIN_WIDTH : 50,
            MAX_WIDTH : $(w).width()
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts = state.options,
                    $el = this.$element,
                    self = this;

                state.zIndex = +opts.zIndex;
                state.$dialog  = $el;
                state.$header  = $el.find('>[data-role=header]');
                state.$close   = $el.find('>[data-role=close]');
                state.$content = $el.find('>[data-role=content]');
                if(opts.trigger) {
                    var $t = $(opts.trigger);
                    state.$trigger = $t.length > 0 ? $t : null;
                }

                //内容类型
                state.contentType = getType();
                
                function getType() {
                    var type = '';
                    if (/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(opts.content)) {
                        type = "iframe";
                    }
                    return type;
                }
            },
            //构造HTML
            _buildHTML : function() {
                var state = this.state, 
                    $el = this.$element,
                    opts = state.options,
                    $content = state.$content;

                //title
                var title = opts.title || '';
                if(opts.title) {
                    state.$header.find('[data-role=title]').text(title);
                } else {
                    state.$header.remove();
                    state.$header = null;
                }

                $el.attr('tabIndex', -1);

                if(opts.theme) {
                    $el.addClass(SIB.unite(opts.theme, state.mconst));
                }
                
                //close
                if(opts.closeTpl) {
                    state.$close.html(opts.closeTpl);
                } else {
                    state.$close.hide();
                }

                //非iframe情况
                if (state.contentType !== "iframe") {
                    var value;
                    // 有些情况会报错
                    try {
                        value = $(opts.content);
                    } catch (e) {
                        value = [];
                    }
                    if (value[0]) {
                        $content.empty().append(value);
                        value.show();   //如果是dom节点,大部分情况是先隐藏在页面中，生成Dialog后显示,先将这种情况下内容显示
                    } else {
                        $content.empty().html(opts.content);
                    }
                    //this._position();
                }
            },
            _bindEvents : function(){
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog,
                    $header = state.$header,
                    self = this;

                this._on({
                    //绑定ESC键和TAB键事件
                    keydown: function( event ) {
                        if ( opts.closeOnEscape && !event.isDefaultPrevented() && event.keyCode &&
                                event.keyCode === SIB.keyCode.ESCAPE ) {
                            event.preventDefault();
                            this.close( event );
                            return;
                        }

                        // prevent tabbing out of dialogs
                        if ( event.keyCode !== SIB.keyCode.TAB ) {
                            return;
                        }
                        var $tabbables = $dialog.find('input,select,textarea,button,object').not(':disabled').filter(':visible');
                            $first = $tabbables.filter( ":first" ),
                            $last = $tabbables.filter( ":last" );

                        if (( event.target === $last[0] || event.target === $dialog[0]) && !event.shiftKey) {
                            $first.focus();
                            event.preventDefault();
                        } else if ( ( event.target === $first[0] || event.target === $dialog[0] ) && event.shiftKey ) {
                            $last.focus();
                            event.preventDefault();
                        }
                    },
                    mousedown: function( event ) {
                        if ( this.moveToTop( event ) ) {
                            $dialog.focus();
                        }
                    }
                });

                this._on({
                    //关闭窗口时，将显示的zIndex最大的窗口获取焦点
                    close : function( event ){
                        var zIndexMax = 0,
                            topDialog;
                        $.each(D.allDialogs, function(idx, obj){
                            //获取显示的且z-index最大的
                            if(obj.isOpen() && obj.state.zIndex > zIndexMax) {
                                zIndexMax = obj.state.zIndex;
                                topDialog = obj;
                            }
                        });
                        topDialog && topDialog.moveToTop();
                    }
                });
                //关闭按钮
                this._on( state.$close, {
                    click: function( event ) {
                        event.preventDefault();
                        this.close( event );
                    }
                });

                if(state.$trigger) {
                    state.$trigger.on('click', function(e){
                        state.$activeTrigger = $(e.currentTarget);
                        self.open();
                    });
                }
                
                D.mask._on({
                    'maskfoucs' : function(evt, data) {
                        if(data.$dialog[0] == state.$dialog[0]) {
                            state.$dialog.focus();
                        }
                    }
                });
                
                if(opts.draggable && $header) {
                    
                    $dialog.drag('init', function(ev, dd){
                        
                    },{
                        handle : $header
                        
                    }).drag('start', function(ev, dd){
                        $( this ).css({
                            opacity: .75,
                            cursor: 'crosshair'
                        });
                    }).drag(function(ev, dd){
                        $( this ).css({
                            top: dd.offsetY,
                            left: dd.offsetX
                        });
                    }).drag('end', function(){
                        $( this ).css({
                            opacity: '',
                            cursor: ''
                        });
                    });
                }
            },
            _size: function() {
                //reset
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog,
                    $content = state.$content,
                    nonContentHeight, //内容高度设置为0的dialog高度
                    minContentHeight, 
                    maxContentHeight,
                    width = opts.width,
                    maxW = parseFloat(opts.maxWidth) || D.MAX_WIDTH,
                    minW = parseFloat(opts.minWidth) || D.MIN_WIDTH;

                $dialog.stop(true, true);
                // Reset content sizing
                $content.show().css({
                    //width: "auto",
                    minHeight: 0,
                    maxHeight: "none",
                    height: 0
                });
                //如果是iframe,则可能设置了宽度，不能auto
                if(state.contentType != 'iframe') {
                    $content.css('width', 'auto');
                }

                //reset dialog
                nonContentHeight = $dialog.css({height: "auto"}).outerHeight();
                minContentHeight = Math.max( 0, opts.minHeight - nonContentHeight );
                maxContentHeight = typeof opts.maxHeight === "number" ?
                                    Math.max( 0, opts.maxHeight - nonContentHeight ) :
                                    "none";

                if(opts.width == 'auto') {
                    $dialog.width('auto');
                    var autoW = SIB.outerWidth($dialog);

                    if(autoW > maxW) {
                        width = maxW;
                    } else if(autoW < minW) {
                        width = minW;
                    }
                } else {
                    if(opts.minWidth) {
                        width = Math.max(width, minW);
                    }
                    if(opts.maxWidth) {
                        width = Math.min(width, maxW);
                    }
                }
                if(width != 'auto') {
                    $dialog.outerWidth(width);
                    //只要设置了dialog的宽度,则content为宽度为auto,iframe的情况可能设置content宽度
                    $content.css('width', 'auto');
                }
                

                if ( opts.height === "auto" ) {
                    $content.css({
                        minHeight: minContentHeight,
                        maxHeight: maxContentHeight,
                        height: "auto"
                    });
                } else {
                    $content.height( Math.max( 0, opts.height - nonContentHeight ) );
                }

                /*if (this.uiDialog.is(":data(ui-resizable)") ) {
                    this.uiDialog.resizable( "option", "minHeight", this._minHeight() );
                }*/
            },
            _position: function() {
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog;

                var isVisible = $dialog.is( ":visible" );
                if ( !isVisible ) {
                    $dialog.show();
                }

                $dialog.position( opts.position );
 
                if ( !isVisible ) {
                    $dialog.hide();
                }
            },
            _setupMask : function() {
                //显示/关闭遮罩层
                this._on({
                    open : this._showMask,
                    close : this._hideMask
                });
            },
            //创建/显示遮罩层
            _showMask: function() {
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog;

                if ( !opts.modal ) {//非模态窗口，直接返回
                    return;
                }

                D.mask.maskTo($dialog);
            },
            //当前窗口关闭，隐藏遮罩或遮罩显示在其他窗口下
            _hideMask : function(){
                var state = this.state,
                    opts = state.options;
                
                if(!opts.modal) {
                    return;
                }

                var topDialog,//最上层有遮罩的窗口
                    zIndexMax = 0;
                $.each(D.allDialogs, function(idx, obj){
                    //显示 & 模态
                    if(obj.isOpen() && obj.state.options.modal && obj.state.zIndex > zIndexMax) {
                        zIndexMax = obj.state.zIndex;
                        topDialog = obj;
                    }
                });

                if(zIndexMax && topDialog) {
                    D.mask.maskTo(topDialog.$element);
                } else {
                    D.mask.hide();
                }
            },
            //在最上层显示
            _moveToTop : function( event, silent ) {
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog,
                    moved = false;

                if(!D.zIndexMax) {
                    var zIndicies = $.map(D.allDialogs, function(obj, idx) {
                        return +obj.state.zIndex;
                    });
                    D.zIndexMax = Math.max.apply( null, zIndicies );
                }

                if ( D.zIndexMax >= state.zIndex ) {
                    D.zIndexMax = state.zIndex = D.zIndexMax + 1;
                    $dialog.css( "z-index", state.zIndex );
                    if(opts.modal) {
                        D.mask.maskTo($dialog, state.zIndex);
                    }

                    moved = true;
                }

                if ( moved && !silent ) {
                    this._trigger( "focus", event );
                }
                return moved;
            },
            _showIframe: function() {
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog,
                    that = this;

                // 若未创建则新建一个
                if (!state.$iframe) {
                    this._createIframe();
                }
                // 开始请求 iframe
                state.$iframe.attr({
                    src: fixUrl(),
                    name: D.WN + "-iframe" + new Date().getTime()
                });
                // iframe不支持0级DOM的onload事件绑定，所以 IE 下 onload 无法触发
                // 用 $().one 函数来代替 onload,只执行一次
                state.$iframe.on("load", function(e) {
                    that._trigger('iframeload', e);
                    // 如果 dialog 已经隐藏了，就不需要触发 onload
                    if (!$dialog.is(":visible")) {
                        return;
                    }
                    // 绑定自动处理高度的事件
                    if(!opts.width || opts.width === 'auto') {
                        var w = getIframeWidth(state.$iframe);
                        state.$content.width(w);
                        that.resize();
                    }
                    that._syncIframeHeight();
                });

                //URL添加时间戳
                function fixUrl() {
                    var s = opts.content.match(/([^?#]*)(\?[^#]*)?(#.*)?/),
                        tempName = 't',
                        tempValue = new Date().getTime();
                    s.shift();
                    if(s[1] && s[1] !== "?") {
                        //防止重名
                        while(tempName.indexOf(tempName + '=') >= 0){
                            tempName += 't';
                        }
                        s[1] += '&' + tempName + '=' + tempValue;
                    } else {
                        s[1] = '?t=' + tempValue;
                    }
                    return s.join("");
                }

                function getIframeWidth($iframe){
                    var doc = $iframe[0].contentWindow.document;
                    if (doc.body.scrollWidth && doc.documentElement.scrollWidth) {
                        return Math.min(doc.body.scrollWidth, doc.documentElement.scrollWidth);
                    } else if (doc.documentElement.scrollWidth) {
                        return doc.documentElement.scrollWidth;
                    } else if (doc.body.scrollWidth) {
                        return doc.body.scrollWidth;
                    }
                }
            },
            _createIframe: function() {
                var state = this.state,
                    self  = this,
                    $content = state.$content;

                var $iframe = state.$iframe = $("<iframe>", {
                    src: "javascript:'';",
                    scrolling: "no",
                    frameborder: "no",
                    allowTransparency: "true",
                    css: {
                        border: "none",
                        width: "100%",
                        display: "block",
                        height: "100%",
                        overflow: "hidden"
                    }
                }).appendTo($content);
                // 给 iframe 绑一个 close 事件
                // iframe 内部可通过 window.frameElement.trigger('close') 关闭
                Events.mixTo($iframe[0]);
                $iframe[0].on('close', function(data){
                    self.close(null, data);
                });
            },
            _setIframeHeight : function(){
                var state = this.state,
                    opts = state.options,
                    $el = this.$element,
                    $content = state.$content,
                    self = this,
                    h;
                // 如果未传 height，才会自动获取
                try {
                    h = getIframeHeight(state.$iframe);// + "px";
                } catch (err) {
                    // 页面跳转也会抛错，最多失败6次
                    state._errCount = (state._errCount || 0) + 1;
                    if (state._errCount >= 6) {
                        // 获取失败则给默认高度 300px
                        // 跨域会抛错进入这个流程
                        h = opts.minHeight;
                        clearInterval(state._interval);
                        delete state._interval;
                    }
                }

                var oldIframeH = state._iframe_h;

                if(h && h != state._iframe_h) {
                    state._iframe_h = h;
                    //$content.css("height", h);
                    $content.stop(true, false).animate({
                        height : h + 'px'
                    }, 'fast', function(){
                        if(oldIframeH == null) {  //iframe加载完第一次重新计算位置,后面改变高度，不计算
                            self.position();
                        }
                    });
                    // force to reflow in ie6
                    // http://44ux.com/blog/2011/08/24/ie67-reflow-bug/
                    $el[0].className = $el[0].className;
                }
                
                // 获取 iframe 内部的高度
                function getIframeHeight($iframe) {
                    var doc = $iframe[0].contentWindow.document;
                    if (doc.body.scrollHeight && doc.documentElement.scrollHeight) {
                        return Math.min(doc.body.scrollHeight, doc.documentElement.scrollHeight);
                    } else if (doc.documentElement.scrollHeight) {
                        return doc.documentElement.scrollHeight;
                    } else if (doc.body.scrollHeight) {
                        return doc.body.scrollHeight;
                    }
                }
            },
            _show : function(fn){
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog,
                    $content = state.$content;

                // iframe 要在载入完成才显示
                if (state.contentType === "iframe") {
                    // iframe 还未请求完，先设置一个固定高度
                    //!this.get("height") && this.contentElement.css("height", this.get("initialHeight"));
                    var defalutHeight = opts.height == 'auto' ? opts.iframeDefaultHeight : opts.height;
                    $content.height(defalutHeight || 300);
                    state._iframe_h = null;
                    this._showIframe();
                }

                //this.render();
                if('slide' == opts.effect) {
                    $dialog.slideDown(opts.speed || 'normal', fn);
                } else if('fade' == opts.effect) {
                    $dialog.fadeIn(opts.speed || 'normal', fn);
                } else {
                    $dialog.show(0, fn);
                }

                //$dialog.focus();
                //this._focusChildEle();
                this._trigger("focus");
            },
            _initBtns : function(){
                var state = this.state,
                    $el   = this.$element,
                    $d    = state.$dialog,
                    opts  = state.options,
                    self  = this;

                if(!$.isArray(opts.btns) || !opts.btns.length) return;
                
                var $btns = $(SIB.unite(btnTpl, state.mconst));
                $d.append($btns);
                $.each(opts.btns, function(i, btn){
                    var $btn = $(btn.tpl);
                    $btn.appendTo($btns);
                    if($.isFunction(btn.click)) {
                        $btn.on('click', $.proxy(btn.click, self));
                    }
                    if(btn.autoFocus) {
                        $btn.focus();
                    }

                    if(btn.align && $.inArray(btn.align, ['left', 'center', 'right'])) {
                        $btns.css('text-align', btn.align);
                        //$btn.addClass('sib-' + opts.align);
                    }
                });
            }
        },
        public : {
            _init : function(){
                this._prepareOption();
                /**暂不构建html,render时再构造html(懒构造),如果先buildHTML,而没有open(render),
                 * 则在DOM中无window的html节点了,DOM中可能有其他一些组件初始化，则无法找到元素
                 */
                //this._buildHTML();
                this._initBtns();
                this._bindEvents();
                this._setupMask();
                D.allDialogs.push(this);
            },
            //iframe内容加载完，同步iframe高度
            _syncIframeHeight : function(){
                var state = this.state,
                    opts = state.options;
                // 绑定自动处理高度的事件
                if (!opts.height || opts.height === 'auto') {
                    clearInterval(state._interval);
                    state._interval = setInterval($.proxy(this._setIframeHeight, this), 300);
                }
            },
            _focusDialogEle: function() {
                var state = this.state,
                    $dialog = state.$dialog;
                var hasFocus = $dialog.find("[autofocus]");
                if ( !hasFocus.length ) {
                    hasFocus = $dialog.find('input,select,textarea,button,object').not(':disabled').filter(':visible');
                }
                hasFocus.eq(0).focus();
            },
            render : function(){
                var state = this.state;

                if(state.rendered) {
                    return;
                }
                this._super();
                this._buildHTML();
                return ;
            },
            isOpen : function(){
                return this.state._isOpen;
            },
            moveToTop : function(){
                return this._moveToTop();
            },
            open : function() {
                var state = this.state,
                    opts  = state.options,
                    $dialog = state.$dialog,
                    that  = this;

                if ( state._isOpen ) {
                    if ( this._moveToTop() ) {
                        $dialog.focus();
                        that._focusDialogEle();
                    }
                    return;
                } else {
                    //先将Dialog加入到页面，否则后面设置位置有问题，IE下position为relative
                    this.render();
                }

                state._isOpen = true;
                //state.opener = $( $el.document[0].activeElement );
                this._size();
                this._position();
                this._moveToTop( null, true );
                $dialog.hide(); //先隐藏，不然第一次弹出时没有动画效果
                this._show(function(){
                    $dialog.focus();
                    that._focusDialogEle();
                });
                this._trigger("open");
                return this;
            },
            close : function( event, data ){
                var state = this.state,
                    opts = state.options,
                    $dialog = state.$dialog,
                    that = this;

                if ( !state._isOpen || this._trigger( "beforeClose", event, data ) === false ) {
                    return;
                }

                state._isOpen = false;

                var afterClose = function(){
                    that._trigger('afterclose', event, data);
                }
                if('slide' == opts.effect) {
                    $dialog.slideUp(opts.speed || 'normal', afterClose);
                } else if('fade' == opts.effect) {
                    $dialog.fadeOut(opts.speed || 'normal', afterClose);
                } else {
                    $dialog.hide(0, afterClose);
                }
                this._trigger('hide', event, data);
                this._trigger('close', event, data);
            },
            resize : function(){
                this._size();
                this._position();
                return this;
            },
            position : function(){
                this._position();
            },
            refresh : function(){
                var state = this.state,
                    opts = state.options;

                return this;
            },
            destroy : function(){
                this.$element.remove();
                clearInterval(this.state._interval);
                this._off();
                return this._super(this);
            }
        }
    });

    var tipDefault = {
        title : null,
        closeTpl : null,
        minHeight : 50,
        minWidth : 350,
        maxWidth : 550,
        effect : 'fade',
        modal : true,
        afterclose : function(){
            this.destroy();
        },
        tipTpl : '<div class="{clsPrefix}-tip-inner">'+
                     '<div class="{clsPrefix}-tip-icon">'+
                         '<i class="iconfont" title="提示">{icon}</i>'+    
                     '</div>'+
                     '<div class="{clsPrefix}-tip-content">'+
                         '<h3 class="{clsPrefix}-tip-title">{msg}</h3>'+
                     '</div>'+
                 '</div>',
        alert:{
            title : '温馨提示',
            btnTpl : '<a href="javascript:;" class="sib-btn sib-btn-confirm">确定</a>',
            icon : '&#xe687;'
        },
        confirm:{
            title : '请确认',
            confirmBtnTpl : '<a href="javascript:;" class="sib-btn sib-btn-confirm">确定</a>',
            cancelBtnTpl : '<a href="javascript:;" class="sib-btn sib-btn-cancel">取消</a>',
            icon : '&#xe681;'
        },
        tip : {
            title : '温馨提示',
            icon : '&#xe686;'
        }
    };
    $.extend(D, {
        tipDefault : {},
        alert : function(msg, callback, options){
            var cfg = $.extend(true, {}, tipDefault, D.tipDefault);
            var content = SIB.unite(cfg.tipTpl, $.extend(true, {
                icon : cfg.alert.icon,
                msg : msg,
                clsPrefix : D.clsPrefix
            }, options));
            var defaults = {
                title : cfg.alert.title,
                content : content,
                theme : '{clsPrefix}-alert',
                btns : [{
                    tpl : cfg.alert.btnTpl,
                    autoFocus : true,
                    click : function(e){
                        callback && callback();
                        this.close();
                    }
                }]
            };
            return new Dialog($.extend(true, {}, cfg, defaults, options)).open();
        },
        confirm : function(msg, onConfirm, onCancel, options){
            var cfg = $.extend(true, {}, tipDefault, D.tipDefault);
            var content = SIB.unite(cfg.tipTpl, $.extend(true, {
                icon : cfg.alert.icon,
                msg : msg,
                clsPrefix : D.clsPrefix
            }, options));

            var defaults = {
                title : cfg.confirm.title || '请确认',
                content : content,
                theme : '{clsPrefix}-confirm',
                btns : [{
                    tpl : cfg.confirm.confirmBtnTpl,
                    autoFocus : true,
                    click : function(e){
                        $.isFunction(onConfirm) && onConfirm();
                        this.close();
                    }
                }, {
                    tpl : cfg.confirm.cancelBtnTpl,
                    click : function(){
                        $.isFunction(onCancel) && onCancel();
                        this.close();
                    }
                }]
            }
            return new Dialog($.extend(true, {}, cfg, defaults, options)).open();
        },
        tip : function(msg, timeout, callback, options){
            var cfg = $.extend(true, {}, tipDefault, D.tipDefault);
            var content = SIB.unite(cfg.tipTpl, $.extend(true, {
                icon : cfg.alert.icon,
                msg : msg,
                clsPrefix : D.clsPrefix
            }, options));

            var defaults = {
                title : cfg.tip.title,
                theme : '{clsPrefix}-tip',
                modal : false,
                content : content
            }
            var d = new Dialog($.extend(true, {}, cfg, defaults, options));
            d.open();
            setTimeout(function(){
                d.close();
                $.isFunction(callback) && callback();
            }, timeout || 1000);
        },
        blockUI : function(opts){
            
            var bui = $(w).data(D.widgetName + '-blockui');
            if(bui) {
                D.unblockUI();
            }
            bui = new Dialog($.extend(true, {}, defaults, opts, {
                trigger : null,
                closeOnEscape : false,
                closeTpl : null,
                minHeight : 50,
                modal : true,
                position : {
                    my : 'center',
                    at : 'center',
                    of : w,
                    collision : 'fit',
                    // 保证顶部header和close按钮始终能在可视区域内
                    using: function( pos ) {
                        var topOffset = $( this ).css( pos ).offset().top;
                        if ( topOffset < 0 ) {
                            $( this ).css( "top", pos.top - topOffset );
                        }
                    }
                },
                draggable : false
            }));
            
            $(w).data(D.widgetName + '-blockui', bui);
            bui.open();
        },
        unblockUI : function(){
            var d = $(w).data(D.widgetName + '-blockui');
            if(d) {
                d.close();
                d.destroy();
            }
            $(w).data(D.widgetName + '-blockui', null);
        }
    });

    return D;
});
