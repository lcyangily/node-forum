/**   
 * @Title: Menu.js 
 * @Description: Sib Menu
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-3-23
 * @version V1.1
 */
define(function(require, exports, module){
    //导入依赖样式资源
    //require('css!./menu.css');
    
    //depends
    var $       = require('jquery+'),
        Widget  = require('sib.widget'),
        SIB     = require('sib.sib'),
        w = (function(){return this;})(), d = w.document;

    //config
    var defaults = {
        defaultElement : '<ul>',
        delay : 300,    //延迟多长时间关闭菜单
        menus : 'ul',
        subMenuIcon : 'sib-icon-carat-1-e', //父菜单中包含菜单的标示
        position : {    //子菜单相对父级菜单的位置
            my : 'left top', 
            at : 'right top'
        },
        //role : 'menu',
        disabled : false,
        blur : null,
        //create : null,
        focus : null,
        select : null
    };

    var M, Menu;
    M = Menu = Widget.extend({
        static : {
            widgetName : 'SIBMenu',
            widgetEventPrefix : 'menu',
            require : require,
            defaults : defaults
        },
        private : {
            _prepareOption : function(){
                var state = this.state;

                //当前激活的菜单
                state.$activeMenu = this.$element;
                state.$menu = this.$element;
            },
            _buildHTML : function(){
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu;

                $menu.addClass("sib-menu sib-widget sib-widget-content sib-radius-all")
                     .toggleClass("sib-menu-icons", !!$menu.find(".sib-icon").length);
                    //.attr({
                        //role : opts.role,
                        //tabIndex : 0
                    //});

                if(opts.disabled){
                    $menu.addClass("sib-state-disabled").attr("data-disabled", "true");
                }
            },
            _bindEvent : function() {
                var state = this.state,
                    opts  = state.options, 
                    $menu = state.$menu,
                    self  = this;

                this._on({
                    'click' : function( event ){
                        if(opts.disabled) {
                            event.preventDefault();
                        }
                    },
                    //保证焦点停留在菜单上
                    'mousedown .sib-menu-item > a' : function( event ){
                        event.preventDefault();
                    },
                    //已经disabled的菜单点击无效
                    'click .sib-state-disabled > a' : function( event ) {
                        event.preventDefault();
                    },
                    'click .sib-menu-item:has(a)' : function( event ) {
                        var $target = $( event.target ).closest( ".sib-menu-item" );
                        if ($target.not( ".sib-state-disabled" ).length ) {
                            this.select( event );
                            if ($target.has( ".sib-menu" ).length) {
                                this.expand( event );
                            } else if ( !$menu.is( ":focus" ) ) {
                                $menu.trigger( "focus", [true]);
                                // 如果当前active的菜单是一级菜单,
                                //则清除定时器(定时器是隐藏active,针对子菜单)
                                if (state.$active && state.$active.parents( ".sib-menu" ).length === 1) {
                                    state.timer && state.timer.cancel();
                                }
                            }
                        }
                    },
                    'mouseenter .sib-menu-item:not(.sib-state-disabled)' : function(event) {
                        var $target = $( event.currentTarget );
                        // 清楚菜单avtive样式
                        $target.siblings().children(".sib-state-active").removeClass("sib-state-active");
                        this.focus(event, $target);
                    },
                    'mouseleave': this.collapseAll,
                    'mouseleave .sib-menu': this.collapseAll,
                    focus : function(event, keepActiveItem) {   //keepActiveItem保持原有菜单不变,否则调用focus
                        // 菜单获取焦点,如果有active菜单则保持不变，如果没有则默认第一个子菜单
                        var item = state.$active || $menu.children(".sib-menu-item").eq( 0 );
                        if ( !keepActiveItem ) {
                            this.focus(event, item);
                        }
                    },
                    blur : function( event ) {
                        SIB.later(function(){
                            if ( !$.contains( this.$element, d.activeElement ) ) {
                                this.collapseAll( event );
                            }
                        }, 0, false, this);
                    },
                    keydown: this._keydown
                });

                $(d).on("click" + M.ENS, function(event){
                    if ( !$(event.target).closest( ".sib-menu" ).length ) {
                        self.collapseAll(event);
                    }
                });
            },
            _keydown : function (event){
                var state = this.state,
                    $menu = state.$menu,
                    opts  = state.options,
                    match, prev, character, skip, regex,
                    preventDefault = true;

                function escape( value ) {
                    return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
                }

                switch ( event.keyCode ) {
                case SIB.keyCode.PAGE_UP:
                    this.previousPage( event );
                    break;
                case SIB.keyCode.PAGE_DOWN:
                    this.nextPage( event );
                    break;
                case SIB.keyCode.HOME:
                    this.move("first", "first", event);
                    break;
                case SIB.keyCode.END:
                    this.move("last", "last", event);
                    break;
                case SIB.keyCode.UP:
                    this.previous( event );
                    break;
                case SIB.keyCode.DOWN:
                    this.next( event );
                    break;
                case SIB.keyCode.LEFT:
                    this.collapse( event );
                    break;
                case SIB.keyCode.RIGHT:
                    if (state.$active && !state.$active.is(".sib-state-disabled")) {
                        this.expand( event );
                    }
                    break;
                case SIB.keyCode.ENTER:
                case SIB.keyCode.SPACE:
                    this._activate(event);
                    break;
                case SIB.keyCode.ESCAPE:
                    this.collapse( event );
                    break;
                default:
                    preventDefault = false;
                    prev = state.previousFilter || "";
                    character = String.fromCharCode( event.keyCode );
                    skip = false;

                    state.filterTimer && filterTimer.cancel();

                    if ( character === prev ) {
                        skip = true;
                    } else {
                        character = prev + character;
                    }

                    regex = new RegExp( "^" + escape( character ), "i" );
                    match = state.$activeMenu.children(".sib-menu-item").filter(function() {
                        return regex.test( $( this ).children( "a" ).text() );
                    });
                    match = skip && match.index( state.$active.next() ) !== -1 ?
                        state.$active.nextAll( ".sib-menu-item" ) :
                        match;

                    // If no matches on the current filter, reset to the last character pressed
                    // to move down the menu to the first item that starts with that character
                    if ( !match.length ) {
                        character = String.fromCharCode( event.keyCode );
                        regex = new RegExp( "^" + escape( character ), "i" );
                        match = state.$activeMenu.children( ".sib-menu-item" ).filter(function() {
                            return regex.test( $( this ).children( "a" ).text() );
                        });
                    }

                    if ( match.length ) {
                        this.focus( event, match );
                        if ( match.length > 1 ) {
                            state.previousFilter = character;
                            state.filterTimer = SIB.later(function() {
                                delete state.previousFilter;
                            }, 1000, false, this);
                        } else {
                            delete state.previousFilter;
                        }
                    } else {
                        delete state.previousFilter;
                    }
                }

                if ( preventDefault ) {
                    event.preventDefault();
                }
            },
            _activate : function(event) {
                var state = this.state;
                if (!state.$active.is( ".sib-state-disabled" )) {
                    if (state.$active.children("a[data-haspopup='true']").length) {
                        this.expand(event);
                    } else {
                        this.select(event);
                    }
                }
            },
            _scrollIntoView : function(item) {
                var state = this.state,
                    borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
                if (this._hasScroll()) {
                    borderTop = parseFloat( $.css(state.$activeMenu[0], "borderTopWidth")) || 0;
                    paddingTop = parseFloat( $.css(state.$activeMenu[0], "paddingTop")) || 0;
                    offset = item.offset().top - state.$activeMenu.offset().top - borderTop - paddingTop;
                    scroll = state.$activeMenu.scrollTop();
                    elementHeight = state.$activeMenu.height();
                    itemHeight = item.height();

                    if ( offset < 0 ) {
                        state.$activeMenu.scrollTop( scroll + offset );
                    } else if ( offset + itemHeight > elementHeight ) {
                        state.$activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
                    }
                }
            },
            _startOpening : function(submenu) {
                var state = this.state, 
                    opts  = state.options, 
                    self = this;

                state.timer && state.timer.cancel();

                // Don't open if already open fixes a Firefox bug that caused a .5 pixel
                // shift in the submenu position when mousing over the carat icon
                if ( submenu.attr("data-hidden") !== "true" ) {
                    return;
                }

                state.timer = SIB.later(function() {
                    this._close();
                    this._open(submenu);
                }, opts.delay, false, this);
            },
            _move : function( direction, filter, event ) {
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu,
                    self  = this,
                    next;
                if ( state.$active ) {
                    if ( direction === "first" || direction === "last" ) {
                        next = state.$active
                            [ direction === "first" ? "prevAll" : "nextAll" ]( ".sib-menu-item" )
                            .eq( -1 );
                    } else {
                        next = state.$active
                            [ direction + "All" ]( ".sib-menu-item" )
                            .eq( 0 );
                    }
                }
                if ( !next || !next.length || !state.$active ) {
                    next = state.$activeMenu.children( ".sib-menu-item" )[ filter ]();
                }

                this.focus( event, next );
            },
            _hasScroll: function() {
                return this.$element.outerHeight() < this.$element.prop("scrollHeight");
            },
            _destroy: function() {
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu;

                // Destroy (sub)menus
                $menu.removeAttr( "data-activedescendant" )
                     .find(".sib-menu").addBack()
                        .removeClass("sib-menu sib-widget sib-widget-content sib-corner-all sib-menu-icons")
                        .removeAttr("role")
                        .removeAttr( "data-labelledby" )
                        .removeAttr( "data-expanded" )
                        .removeAttr( "data-hidden" )
                        .removeAttr( "data-disabled" )
                        .show();

                // Destroy menu items
                $menu.find(".sib-menu-item")
                    .removeClass("sib-menu-item")
                    .removeAttr("role")
                    .removeAttr("data-disabled")
                    .children("a")
                        .removeClass("sib-corner-all sib-state-hover")
                        .removeAttr("tabIndex")
                        .removeAttr("role")
                        .removeAttr("data-haspopup")
                        .children().each( function() {
                            var elem = $( this );
                            if ( elem.data( "sib-menu-submenu-marker" ) ) {
                                elem.remove();
                            }
                        });

                // Destroy menu dividers
                $menu.find(".sib-menu-divider").removeClass("sib-menu-divider sib-widget-content");
            }
        },
        public : {
            _init : function(){

                this._prepareOption();
                this._buildHTML();
                this._refresh();
                this._bindEvent();
            },
            _refresh : function(e) { //刷新菜单,对未被初始化的菜单,初始化.增加样式,修改样式,调整结构等 
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu,
                    $submenus = $menu.find(opts.menus),
                    $menus, 
                    icon = opts.subMenuIcon;

                // 初始化嵌套子菜单
                $submenus.filter( ":not(.sib-menu)" )
                            .addClass( "sib-menu sib-widget-content sib-radius-all" )
                            .hide()
                            .attr({
                                //role: opts.role,
                                "data-hidden": "true",
                                "data-expanded": "false"
                            }).each(function() {
                                var $cMenu = $( this ),
                                    $cItem = $cMenu.prev( "a" ),
                                    $smMark = $('<span class="sib-menu-icon sib-icon"></span>');

                                $smMark.data("sib-menu-submenu-marker", true)
                                       .addClass(icon);

                                $cItem.attr( "data-haspopup", "true" )
                                      .prepend($smMark);
                                $cMenu.attr( "data-labelledby", $cItem.attr("id") );
                            });

                $menus = $submenus.add( $menu );
                // 对未初始化的菜单项进行初始化
                $menus.children(":not(.sib-menu-item):has(a)")
                          .addClass("sib-menu-item")
                          .attr( "role", "presentation" )
                          .children("a")
                              .addClass( "sib-radius-all" )
                              .attr({
                              //    tabIndex: -1,
                                  role: 'menuitem'
                              });

                // 初始化分割符
                $menus.children( ":not(.sib-menu-item)" ).each(function() {
                    var item = $( this );
                    // hyphen, em dash, en dash
                    if ( !/[^\-\u2014\u2013\s]/.test( item.text() ) ) {
                        item.addClass( "sib-widget-content sib-menu-divider" );
                    }
                });
                
                $menus.children(".sib-state-disabled").attr( "data-disabled", "true" );
                
                // 如果当前被选中的菜单被移除,执行blur操作
                if (state.$active && !$.contains($menu[0], state.$active[0])) {
                    this.blur();
                }
            },
            //关闭指定菜单,否则关闭所有
            _close : function( $startMenu ){
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu;
                if ( !$startMenu ) {
                    $startMenu = state.$active ? state.$active.parent() : $menu;
                }
    
                $startMenu
                    .find( ".sib-menu" )
                        .hide()
                        .attr( "data-hidden", "true" )
                        .attr( "data-expanded", "false" )
                    .end()
                    .find( "a.sib-state-active" )
                        .removeClass("sib-state-active");
            },
            //显示子菜单
            _open : function( $submenu ){
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu,
                    position = $.extend({
                        of: state.$active
                    }, opts.position );

                state.timer && state.timer.cancel();
                //隐藏非当前菜单的父级菜单
                $menu.find( ".sib-menu" ).not( $submenu.parents( ".sib-menu" ) )
                    .hide()
                    .attr( "data-hidden", "true" );

                $submenu
                    .show()
                    .removeAttr( "data-hidden" )
                    .attr( "data-expanded", "true" )
                    .position( position );
            },
            blur : function(event, fromFocus){ //args : event
                var state = this.state,
                    $menu = state.$menu;

                if (!fromFocus) {
                    state.timer && state.timer.cancel();
                }

                if (!state.$active) return;

                state.$active.children("a").removeClass("sib-state-focus");
                state.$active = null;
                this._trigger('blur', event, { item: state.$active });
            },
            focus : function(event, item){
                var state = this.state,
                    $menu = state.$menu, 
                    opts  = state.options,
                    self = this,
                    nested, 
                    focused;

                this.blur(event, event && event.type === "focus");
                this._scrollIntoView(item);

                state.$active = item.first();
                focused = state.$active.children("a").addClass("sib-state-focus");
                $menu.attr( "data-activedescendant", focused.attr( "id" ) );

                // Highlight active parent menu item, if any
                state.$active
                     .parent()
                     .closest( ".sib-menu-item" )
                     .children( "a:first" )
                     .addClass( "sib-state-active" );

                if (event && event.type === "keydown") {
                    this._close();
                } else {
                    state.timer = SIB.later(function() {
                        this._close();
                    }, opts.delay, false, this);
                }

                nested = item.children(".sib-menu");
                if ( nested.length && ( /^mouse/.test( event.type ) ) ) {
                    this._startOpening(nested);
                }
                state.$activeMenu = item.parent();
                this._trigger('focus', event, { item: item });
            },
            //关闭当前激活的菜单
            collapse : function(e){     //args : event
                var state = this.state,
                    $menu = state.$menu,
                    newItem = state.$active && state.$active.parent().closest(".sib-menu-item", $menu);
                if (newItem && newItem.length) {
                    this._close();
                    this.focus(e, newItem);
                }
            },
            //关闭当前或所有菜单
            collapseAll : function(event, all){   //args: [event][,all] all:boolean
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu;

                state.timer && state.timer.cancel();
                state.timer = SIB.later(function(){
                    var currentMenu = all ? $menu :
                        $(event && event.target).closest( $menu.find( ".sib-menu" ) );

                    if ( !currentMenu.length ) {
                        currentMenu = $menu;
                    }

                    this._close(currentMenu);
                    this.blur(event);
                    state.$activeMenu = currentMenu;
                }, opts.delay, false, this);
            },
            expand : function(event){
                var state = this.state,
                    $menu = state.$menu,
                    newItem = state.$active && state.$active.find( ">.sib-menu>.sib-menu-item" ).first();
        
                if ( newItem && newItem.length ) {
                    this._open(newItem.parent());
                    // Delay so Firefox will not hide activedescendant change in expanding submenu from AT
                    SIB.later(function(){
                        this.focus( event, newItem );
                    }, 0, false, this);
                }
            },
            isFirstItem : function(){
                var state = this.state;
                return state.$active && !state.$active.prevAll(".sib-menu-item").length;
            },
            isLastItem : function(){
                var state = this.state;
                return state.$active && !state.$active.nextAll(".sib-menu-item").length;
            },
            next : function( event ){
                this._move( 'next', 'first', event );
            },
            previous : function(event){
                this._move( "prev", "last", event );
            },
            nextPage : function( event ){
                var state = this.state,
                    $menu = state.$menu, 
                    $item, base, height;

                if ( !state.$active ) {
                    this.next( event );
                    return;
                }
                if ( this.isLastItem() ) {
                    return;
                }
                if (this._hasScroll()) {
                    base = state.$active.offset().top;
                    height = $menu.height();
                    state.$active.nextAll( ".sib-menu-item" ).each(function() {
                        $item = $( this );
                        return $item.offset().top - base - height < 0;
                    });

                    this.focus( event, $item );
                } else {
                    this.focus( event, state.$activeMenu.children( ".sib-menu-item" )
                        [ !state.$active ? "first" : "last" ]());
                }
            },
            previousPage : function(event){
                var state = this.state,
                    $menu = state.$menu,
                    $item, base, height;
                if ( !state.$active ) {
                    this.next( event );
                    return;
                }
                if (this.isFirstItem()) {
                    return;
                }
                if (hasScroll(this.$element)) {
                    base = state.$active.offset().top;
                    height = $menu.height();
                    state.$active.prevAll( ".sib-menu-item" ).each(function() {
                        $item = $(this);
                        return $item.offset().top - base + height > 0;
                    });
                    this.focus(event, $item);
                } else {
                    this.focus(event, state.$activeMenu.children(".sib-menu-item").first());
                }
            },
            select : function(e){
                var state = this.state,
                    opts  = state.options,
                    $menu = state.$menu;
                // TODO: It should never be possible to not have an active item at this
                // point, but the tests don't trigger mouseenter before click.
                state.$active = state.$active || $( e.target ).closest(".sib-menu-item");
                var ui = { item: state.$active };
                if ( !state.$active.has(".sib-menu").length ) {
                    this.collapseAll( e, true );
                }

                this._trigger('select', e, ui);
            },
            data : function(){
                return this.state;
            },
            getOption : function(name){
                var opts = this.state.options;
                return opts[name] || opts;
            },
            show : function(pos){
                this.$element.show();
                this.$element.position(pos);
            },
            hide : function(){
                this.$element.hide();
            }
        }
    });

    return M;
});