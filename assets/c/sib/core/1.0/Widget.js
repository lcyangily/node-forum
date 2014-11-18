/**   
 * @Title: Widget.js 
 * @Description: TODO
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-11-1 下午8:17:48 
 * @version V1.0   
 */
define(function(require, exports, module){
    var $ =     require('jquery+'),
        Class = require('sib.class'),
        SIB =   require('sib.sib'),
        w = (function(){this})(), d = document;

    //导入依赖样式资源
    //require('css!./commons.css');

    var uuid = 0,
        Widget, 
        W;

    var template = '<div></div>';
    W = Widget = Class.extend({
        /**
         * 静态属性或方法,子类集成必须覆盖一下属性：
         * widgetName, require
         */
        static : {
            widgetName : 'SIBWidget',
            widgetEventPrefix: "",
            optionRequire : '',//option必传字段
            optionFilter : '', //options 不能传字段,默认自动删除,以逗号分隔的字符串
            /**
             * 类似于类加载器,每个子类都必须覆盖这个require,
             * 加载资源文件相对子类位置而不是父类位置!
             */
            require : require,
            template : template,
            $parentNode : $(d.body),
            defaults : {},
            clsPrefix : '',
            i18n : null
        },
        public : {
            init : function(opts){
                var self = this,
                    options = opts || {},
                    $parentNode = this.constructor.$parentNode;

                if(this.constructor.optionFilter) {
                    $.each(this.constructor.optionFilter.split(','), function(i, prop){
                        try {   //options为string会报错，忽略
                            if(prop in options) {
                                delete options[prop];
                            }
                        } catch (e){}
                    });
                }

                var mconst = {
                    clsPrefix : options.clsPrefix || this.constructor.defaults.clsPrefix || this.constructor.clsPrefix || ''
                };
                var $el = this.$element = getElement();
                if(!$el[0]) {
                    alert('target not found.');
                    return;
                }

                var state = this.state = $.data($el[0], this.constructor.WN);
                if(state) { //更新
                    $.extend(true, state.options, options);
                    this.refresh();
                } else { //创建
                    state = this.state = $.data($el[0], this.constructor.WN, {
                        options : $.extend(true, {}, this.constructor.defaults, options||{}),
                        $parentNode : $parentNode,
                        i18n : this.constructor.i18n,
                        oid : this.constructor.WN + (''+Math.random()).replace( /\D/g, "" ),
                        mconst : mconst
                    });
                    i18n();
                    this._init();
                }
                
                function getElement() {
                    var $el;
                    if(self.$element) return self.$element;
                    if(typeof options === 'string') {
                        options = {target : options};
                    }
                    $el = $(options.target);
                    if(!$el[0] && typeof options.target === 'string') {
                        if(options.target.indexOf('#') != 0){
                            options.target = '#' + options.target;
                            $el = $(options.target);
                        } 
                    }
                    if(!$el[0]) $el = null;
                    if(!$el && self.constructor.template) {
                        var tmpl = SIB.unite(self.constructor.template, mconst);
                        $el = $(tmpl);
                    } else {
                        $parentNode = $el;
                    }
                    return $el;
                }
                
                //国际化资源加载
                function i18n() {
                    if(!options.lang) {
                        return;
                    }
                    if(typeof options.lang != 'string') {
                        state.i18n = options.lang;
                        return;
                    }
                    
                    //alert(require.resolve('./i18n/' + opts.lang));
                    //alert(self.constructor.require.resolve('./i18n/' + opts.lang));
                    if(self.constructor.require) {
                        self.constructor.require(['./i18n/' + options.lang], function(lang){
                            state.i18n = lang;
                            self.i18n();
                        });
                    }
                }
            },
            _init : $.noop,
            refresh : $.noop,
            //from jqueryui 
            _on : function( suppressDisabledCheck, element, handlers ) {
                var delegateElement,
                    instance = this;
    
                // no suppressDisabledCheck flag, shuffle arguments
                if ( typeof suppressDisabledCheck !== "boolean" ) {
                    handlers = element;
                    element = suppressDisabledCheck;
                    suppressDisabledCheck = false;
                }
    
                // no element argument, shuffle and use this.element
                if ( !handlers ) {
                    handlers = element;
                    element = this.$element;
                    delegateElement = this.widget();
                } else {
                    // accept selectors, DOM elements
                    element = delegateElement = $( element );
                    //this.bindings = this.bindings.add( element );
                }
    
                $.each( handlers, function( event, handler ) {
                    function handlerProxy() {
                        // allow widgets to customize the disabled handling
                        // - disabled as an array instead of boolean
                        // - disabled class as method for disabling individual parts
                        if ( !suppressDisabledCheck &&
                                ( instance.state.disabled === true ||
                                    $( this ).hasClass( "sib-state-disabled" ) ) ) {
                            return;
                        }
                        return ( typeof handler === "string" ? instance[ handler ] : handler )
                            .apply( instance, arguments );
                    }
    
                    // copy the guid so direct unbinding works
                    if ( typeof handler !== "string" ) {
                        handlerProxy.guid = handler.guid =
                            handler.guid || handlerProxy.guid || $.guid++;
                    }
    
                    var match = event.match( /^(\w+)\s*(.*)$/ ),
                        eventName = match[1] + instance.constructor.eventNamespace,
                        selector = match[2];
                    if ( selector ) {
                        delegateElement.delegate( selector, eventName, handlerProxy );
                    } else {
                        element.bind( eventName, handlerProxy );
                    }
                });
            },
            //from jqueryui
            _off : function( element, eventName ){
                if(!eventName && typeof element === 'string') {
                    eventName = element;
                    element = this.$element;
                }
                if(!element) {
                    element = this.$element;
                }
                eventName = (eventName || "").split( " " ).join( this.constructor.eventNamespace + " " ) + this.constructor.eventNamespace;
                element.unbind( eventName ).undelegate( eventName );
            },
            //from jqueryui
            _trigger : function( type, event, data ){
                var prop, orig,
                    callback = this.state.options[ type ];
    
                data = data || {};
                event = $.Event( event );
                event.type = ( type === this.constructor.widgetEventPrefix ?
                    type :
                    (this.constructor.widgetEventPrefix || '') + type ).toLowerCase();
                // the original event may come from any element
                // so we need to reset the target on the new event
                event.target = this.$element[ 0 ];
    
                // copy original event properties over to the new event
                orig = event.originalEvent;
                if ( orig ) {
                    for ( prop in orig ) {
                        if ( !( prop in event ) ) {
                            event[ prop ] = orig[ prop ];
                        }
                    }
                }
    
                this.$element.trigger( event, data );
                return !( $.isFunction( callback ) &&
                    callback.apply( this, [ event ].concat( data ) ) === false ||
                    event.isDefaultPrevented() );
            },
            widget : function(){
                return this.$element;
            },
            render : function() {
                var state = this.state,
                    $parentNode = state.$parentNode;

                if(!state.rendered) {
                    state.rendered = true;
                } else {
                    return;
                }

                //$parentNode存在而且当前组件不在页面中
                if($parentNode[0] && $parentNode[0] != this.$element[0] && SIB.isOutSide(this.$element, $parentNode)) {
                    this.$element.appendTo($parentNode);
                }
            },
            destroy : function(){},
            i18n : function( el, method, key ){
                var i18n = this.state.i18n || {};
//                if(!i18n) { //有可能没给默认值
//                    return;
//                }
                if(!el) { //对所有的进行刷新
                    var $el = this.$element;
                    $el.find('[sib-i18n-val]').each(function(i, item){
                        $(item).val(i18n[$(item).attr('sib-i18n-val')]);
                    });
                    $el.find('[sib-i18n-html]').each(function(i, item){
                        $(item).html(i18n[$(item).attr('sib-i18n-html')]);
                    });
                    $el.find('[sib-i18n-text]').each(function(i, item){
                        $(item).text(i18n[$(item).attr('sib-i18n-text')]);
                    });
                } else {
                    $(el).attr('sib-i18n-' + method, key);
                    $(el)[method](i18n[key] || key);
                }
            },
            i18nVal : function( el, val ) {
                this.i18n(el, 'val', val);
            },
            i18nHtml : function( el, val ) {
                this.i18n(el, 'html', val);
            },
            i18nText : function( el, val ) {
                this.i18n(el, 'text', val);
            },
            setOption : function(key, value){
                var opts = {};
                opts[key] = value;
                return this.setOptions(opts);
            },
            setOptions : function(opts){
                var state = this.state;
                // this.init(opts);
                $.extend(state.options, opts);
                return $.extend(true, {}, state.options);
            },
            //value 有可能是undefined,不能判断是否有value来判断有没有入参，判断arguments.length准确
            option : function(name, value){
                var state = this.state;
                //取值,返回一个克隆,防止取到修改
                var optsClone = $.extend(true, {}, state.options),
                    opts = {};
                if(arguments.length === 1 && typeof name === 'string' ) {
                    return optsClone[name];
                } else if(arguments.length === 0) {
                    return optsClone;
                } else if(arguments.length ===  1) {
                    opts = name;
                } else if(arguments.length === 2 && typeof name === 'string') {
                    opts[name] = value;
                } else {
                    return optsClone;
                }

                return this.setOptions(opts)
            }
        }
    });

    var oExtend = W.extend;
    W.extend = function(opts) {
        var Class = oExtend.call(this, opts);

        Class.widgetName = Class.WN = 
            Class.widgetName || Class.WN || 'SIBWidget' + (uuid++);

        if(Class.eventNamespace != this.eventNamespace) {
            Class.ENS = Class.eventNamespace;
        } else {
            Class.eventNamespace = Class.ENS = '.' + Class.WN;
        }

        Class.extend = arguments.callee;
        return Class;
    }
    return W;
});