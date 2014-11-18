/**   
 * @Title: ImageZoom.js 
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-7-1
 */
define(function(require, exports, module){

    //导入依赖样式资源
    //require('css!./imagezoom.css');

    var $      = require('jquery+'),
        Widget = require('sib.widget'),
        SIB    = require('sib.sib'),
        w = (function(){return this})(), d = w.document,
        isIE=!!w.ActiveXObject,
        isIE6=isIE&&!w.XMLHttpRequest,
        ALL_TYPES = ['standard', 'drag', 'innerzoom', 'reverse'];

    //默认值
    var defaults = {
        target : null,
        type : 'standard',      //standard, reverse, drag, innerzoom
        zoomWidth : 300,        //number
        zoomHeight : 300,       //number
        zoomPosition : {        //zoom位置
            my : 'left top',
            at : 'right top'
        },
        preloadImages : true,   //boolean 预加载大图
        preloadText : 'Loading zoom',   //预加载提示文本
        title : true,   //是否在zoom上显示标题,显示tinyImg上的title,如果没有，显示smallImg上的title
        lens  : true,   //镜头，false:在smallImg上的镜头方块将不显示
        imageOpacity : 0.4,     //如果类型为reverse,设置smallImg的opacity
        showEffect : 'show',  //zoom显示效果 hide, fadein
        hideEffect : 'hide',  //zoom隐藏效果 hide, fadeout
        href : null,            //string | function($el, $img, $thumbs, $thumb){} 返回string
        thumbActiveCls : '{clsPrefix}-thumb-active',
        thumbs : null,
        thumbsTriggerType : 'hover' //click/hover
    };

    //小图
    var SmallImage = Widget.extend({
        static : {
            widgetName : 'SIBImageZoom_si',
            require : require,
            defaults : defaults,
            clsPrefix : 'sib-izoom'
        },
        private : {
            _bindEvent : function(){
                var self = this,
                    $el  = this.$element;

                $el[0].onerror = function () {
                    throw 'Problems while loading image.';
                }
                $el[0].onload = function (e) {
                    self.calculate();
                    self._trigger('smallimageloaded');
                }
            }
        },
        public : {
            _init : function(){
                this._bindEvent();
            },
            calculate : function () {
                var state = this.state,
                    region = {},
                    $el    = this.$element,
                    btw = parseInt($el.css('border-top-width')) || 0,
                    blw = parseInt($el.css('border-left-width')) || 0,
                    ptw = parseInt($el.css('padding-top')) || 0,
                    plw = parseInt($el.css('padding-left')) || 0;

                region.w = $el.width();
                region.h = $el.height();
                region.ow = $el.outerWidth();
                region.oh = $el.outerHeight();
                region.pos = $el.offset();
                region.pos.l = region.pos.left + blw + plw;
                region.pos.t = region.pos.top + btw + ptw;
                region.pos.r = region.w + region.pos.l;
                region.pos.b = region.h + region.pos.t;
                region.bleft = blw + plw;
                region.btop  = btw + ptw;
                region.rightlimit = region.pos.left + region.ow;
                region.bottomlimit = region.pos.top + region.oh;

                return (state.region = region);
            },
            getRegion : function(){
                var state = this.state;
                return state.region || this.calculate();
            }
        }
    });

    //大图
    var LargeImage = Widget.extend({
        static : {
            widgetName : 'SIBImageZoom_li',
            require : require,
            template : '<img />',
            defaults : defaults,
            clsPrefix : 'sib-izoom'
        },
        private : {
            _bindEvent : function() {
                var state = this.state,
                    $el   = this.$element,
                    self  = this;
                $el[0].onerror = function () {
                    //alert('Problems while loading the big image.');
                    self._trigger('largeimageloadederror');
                    throw 'Problems while loading the big image.';
                };
                $el[0].onload = function () {
                    //fetching data
                    self.calculate();
                    self._trigger('largeimageloaded');
                };
            }
        },
        public : {
            _init : function(){
                var state = this.state,
                    opts  = state.options;
                
                state.si = opts.smallimage,
                state.lens = opts.lens;
                this._bindEvent();
            },
            //计算尺寸
            calculate : function () {
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element,
                    si    = state.si,
                    siRegion = si.getRegion(),
                    scale = {},
                    region= {};

                $el.css('display', 'block');
                region.w = $el.width();
                region.h = $el.height();
                region.pos = $el.offset();
                region.pos.l = region.pos.left;
                region.pos.t = region.pos.top;
                region.pos.r = region.w + region.pos.l;
                region.pos.b = region.h + region.pos.t;
                scale.x = (region.w / siRegion.w);
                scale.y = (region.h / siRegion.h);
                d.body.removeChild($el[0]);
                $(opts.parentNode).empty().append($el);
                state.scale = scale;
                return (state.region = region);
            },
            getRegion : function(){
                var state = this.state;
                return state.region || this.calculate();
            },
            getScale : function(){
                var state = this.state;
                if(!state.scale) this.calculate();
                return state.scale;
            },
            //大图位置
            setPosition : function () {
                var state = this.state,
                    $el   = this.$element,
                    scale = this.getScale(),
                    lensRegion = state.lens.getRegion(),
                    siRegion   = state.si.getRegion();
                var left = -scale.x * (lensRegion.left - siRegion.bleft + 1);
                var top =  -scale.y * (lensRegion.top - siRegion.btop + 1);
                $el.css({
                    'left': left + 'px',
                    'top': top + 'px'
                });
            },
            loadImage : function (url) {
                var state = this.state,
                    $el   = this.$element;

                //如果同一张图片则不用计算尺寸，直接返回
                if(state.url === url) {
                    this._trigger('largeimageloaded');
                    return;
                }
                this._trigger('largeimageloadbefore');
                state.url = url;
                $el.css({
                    'position' : 'absolute',
                    'border'   : '0px',
                    'display'  : 'none',
                    'left'     : '-5000px',
                    'top'      : '0px'
                });
                $el.appendTo(d.body);
                $el.attr('src', url);
            }
        }
    });

    //镜头，在smallImg上的镜头方块
    var Lens = Widget.extend({
        static : {
            widgetName : 'SIBImageZoom_Lens',
            require : require,
            template : '<div class="{clsPrefix}-pop"></div>',
            defaults : defaults,
            clsPrefix : 'sib-izoom'
        },
        private : {
            _prepareOption : function(){
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options;
                $(opts.parentNode).append($el);
                var si = state.smallimage = opts.smallimage;

                if (opts.type == 'reverse') {
                    state.image = new Image();
                    state.image.src = si.$element.src; // fires off async
                    $el.empty().append(state.image);
                }
            }
        },
        public : {
            _init : function() {
                this._prepareOption();
            },
            resize : function(scale){
                var $el = this.$element,
                    state = this.state,
                    opts  = state.options,
                    si    = state.smallimage,
                    siRegion = si.getRegion(),
                    image = state.image;

                var w = (parseInt((opts.zoomWidth) / scale.x) > siRegion.w ) ? siRegion.w : (parseInt(opts.zoomWidth / scale.x)); 
                var h = (parseInt((opts.zoomHeight) / scale.y) > siRegion.h ) ? siRegion.h : (parseInt(opts.zoomHeight / scale.y));
                var top = (siRegion.oh - h - 2) / 2;
                var left = (siRegion.ow - w - 2) / 2;
                state.region = {
                    w : w,
                    h : h,
                    top : top,
                    left : left
                };
                //centering lens
                $el.css({
                    top: top,
                    left: left,
                    width: w + 'px',
                    height: h + 'px',
                    position: 'absolute',
                    display: 'none',
                    borderWidth: 1 + 'px'
                });

                if (opts.type == 'reverse') {
                    image.src = si.$element.src;
                    $el.css({
                        'opacity': 1
                    });

                    $(image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(this.node.left + 1 - smallimage.bleft) + 'px',
                        top: -(this.node.top + 1 - smallimage.btop) + 'px'
                    });
                }
            },
            //位置设置成中心
            setCenter : function(){
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element,
                    si    = state.smallimage,
                    siRegion = si.getRegion(),
                    region = state.region;
                //calculating center position
                region.top = (siRegion.oh - region.h - 2) / 2;
                region.left = (siRegion.ow - region.w - 2) / 2;
                //centering lens
                $el.css({
                    top: region.top,
                    left: region.left
                });
                if (opts.type == 'reverse') {
                    $(this.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(region.left + 1 - si.bleft) + 'px',
                        top: -(region.top + 1 - si.btop) + 'px'
                    });
                }

                this._trigger('lensposchange');
            },
            setPosition : function(e){
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element,
                    si    = state.smallimage,
                    siRegion = si.getRegion(),
                    region = state.region,
                    x = e.pageX,
                    y = e.pageY,
                    lensleft = 0,
                    lenstop = 0;

                function overleft() {
                    return x - (region.w) / 2 < siRegion.pos.l; 
                }

                function overright() {
                    return x + (region.w) / 2 > siRegion.pos.r; 
                }

                function overtop() {
                    return y - (region.h) / 2 < siRegion.pos.t; 
                }

                function overbottom() {
                    return y + (region.h) / 2 > siRegion.pos.b; 
                }

                lensleft = x + siRegion.bleft - siRegion.pos.l - (region.w + 2) / 2;
                lenstop  = y + siRegion.btop  - siRegion.pos.t - (region.h + 2) / 2;
                if (overleft()) {
                    lensleft = siRegion.bleft - 1;
                } else if (overright()) {
                    lensleft = siRegion.w + siRegion.bleft - region.w - 1;
                }
                if (overtop()) {
                    lenstop = siRegion.btop - 1;
                } else if (overbottom()) {
                    lenstop = siRegion.h + siRegion.btop - region.h - 1;
                }

                region.left = lensleft;
                region.top = lenstop;
                $el.css({
                    'left': lensleft + 'px',
                    'top': lenstop + 'px'
                });
                if (opts.type == 'reverse') {
                    $(state.image).css({
                        position: 'absolute',
                        display: 'block',
                        left: -(region.left + 1 - siRegion.bleft) + 'px',
                        top: -(region.top + 1 - siRegion.btop) + 'px'
                    });
                }

                this._trigger('lensposchange');
            },
            hide : function () {
                var $el = this.$element;
                $(this.state.image).css({
                    'opacity': 1
                });
                $el.hide();
            },
            show : function () {
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options;

                if (opts.type != 'innerzoom' && (opts.lens || opts.type == 'drag')) {
                    $el.show();
                }       

                if (opts.type == 'reverse') {
                    $(state.image).css({
                        'opacity': opts.imageOpacity
                    });
                }
            },
            getRegion : function () {
                return this.state.region;
            }
        }
    });

    var Stage = Widget.extend({
        static : {
            widgetName : 'SIBImageZoom_Stage',
            require : require,
            template : '<div class="{clsPrefix}-win">'+
                            '<div class="{clsPrefix}-wwrapper" data-iz-wwrapper>'+
                                '<div class="{clsPrefix}-wtitle" data-iz-wtitle></div>'+
                                '<div class="{clsPrefix}-wimage" data-iz-wimage></div>'+
                            '</div>'+
                        '</div>',
            defaults : defaults,
            clsPrefix : 'sib-izoom'
        },
        private : {
            _buildHTML : function(){
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    $zwinwrap  = state.$zwinwrap  = $el.find('[data-iz-wwrapper]'),
                    $zwintitle = state.$zwintitle = $el.find('[data-iz-wtitle]'),
                    $zwinimage = state.$zwinimage = $el.find('[data-iz-wimage]'),
                    si = state.options.smallimage;

                
                if(isIE6){
                    state.$ieframe = $('<iframe class="zoomIframe" src="javascript:\'\';" marginwidth="0" marginheight="0" align="bottom" scrolling="no" frameborder="0" ></iframe>');
                }
                if (opts.type == 'innerzoom') {
                    $el.css({
                        cursor: 'default'
                    });
                    var thickness = (si.bleft == 0) ? 1 : si.bleft;
                    $zwinwrap.css({
                        borderWidth: thickness + 'px'
                    });
                }

                $zwinwrap.css({
                    width: Math.round(opts.zoomWidth) + 'px'
                });
                $zwinimage.css({
                    width: '100%',
                    height: Math.round(opts.zoomHeight) + 'px'
                });
                //zoom title
                $zwintitle.css({
                    width: '100%',
                    position: 'absolute'
                });

                $zwintitle.hide();
                /*if (settings.title && zoomtitle.length > 0) {
                    $('.zoomWrapperTitle', this.node).html(zoomtitle).show();
                }*/
                $(opts.parentNode).append($el);
                $el.css({
                    position: 'absolute',
                    zIndex: 5001
                });
                this.setPosition();
                $el.hide();
            }
        },
        public : {
            _init : function(){
                this._buildHTML();
            },
            setPosition : function(){
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element;

                if (opts.type != 'innerzoom') {
                    //positioning
                    $el.position($.extend({}, opts.zoomPosition, {
                        of : opts.smallimage.$element
                    }));
                } else {
                    $el.css({
                        left : '0px',
                        top : '0px'
                    });   
                }
            },
            hide : function () {
                var state= this.state,
                    opts = this.state.options,
                    $el  = this.$element;

                switch (opts.hideEffect) {
                case 'fadeout':
                    $el.fadeOut(opts.fadeoutSpeed || 100, function () {});
                    break;
                default:
                    $el.hide();
                    break;
                }
                state.$ieframe && state.$ieframe.hide();
            },
            show : function () {
                var state = this.state,
                    $el   = this.$element,
                    opts  = state.options,
                    $ieframe = state.$ieframe;
                switch (opts.showEffect) {
                case 'fadein':
                    $el.fadeIn();
                    $el.fadeIn(opts.fadeinSpeed || 100, function () {});
                    break;
                default:
                    $el.show();
                    break;
                }
                if (isIE6 && opts.type != 'innerzoom') {
                    $ieframe.insertAfter($el);
                    $ieframe.css({
                        display: 'block',
                        position: "absolute",
                        zIndex: 99,
                        width: $el.width() + 'px',
                        height: $el.height() + 'px'
                    })
                    $ieframe.position({
                        my : 'left top',
                        at : 'left top',
                        of : $el
                    });
                    $ieframe.show();
                };
            }
        }
    });

    var I, ImageZoom;
    I = ImageZoom = Widget.extend({
        static : {
            widgetName : 'SIBImageZoom',
            require : require,
            defaults : defaults,
            clsPrefix : 'sib-izoom'
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element;

                var $img = $el.find('img:eq(0)');
                state.$img  = $img;
                state.title = $el.attr('title');
                state.imgTitle = $img.attr('title');
                
                state.zoom_active = false;
                state.largeimageloading = false; //tell us if large image is loading
                state.largeimageloaded = false; //tell us if large image is loaded
                state.mouseDown = false;
                state.thumbActiveCls = SIB.unite(opts.thumbActiveCls, this.constructor);
                state.$thumbs = $(opts.thumbs);
                state.$thumb;   //当前

                $el.on('click', function (e) {
                    /*e.preventDefault();
                    return false;*/
                    var href = opts.href
                    if($.isFunction(opts.href)) {
                        href = opts.href($el, state.$img, state.$thumb);
                    }
                    if(href) {
                        $el.attr('href', href);
                    }
                });

                if ($.inArray($.trim(opts.type), ALL_TYPES) < 0) {
                    opts.type = 'standard';
                }
            },
            //构造HTML
            /**
             * a
             * |-img
             *-------------------->
             * a
             * |-zoompad
             *      |-img
             *      |-zoompup
             *      |-zoomwindow
             *      |-zoompreload
             */
            _buildHTML : function() {
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element,
                    $img  = state.$img,
                    padTpl = '<div class="{clsPrefix}-pad"></div>',
                    preloadTpl = '<div class="{clsPrefix}-preload"></div>',
                    $preload = state.$preload = $(SIB.unite(preloadTpl, this.constructor));

                $el.css({
                    'outline-style': 'none',
                    'text-decoration': 'none'
                });

                //create pad
                $zoomPad = state.$zoomPad = $img.wrap(SIB.unite(padTpl, this.constructor)).parent();
                if(opts.type === 'innerzoom') {
                    opts.zoomWidth = $img.width();
                    opts.zoomHeight = $img.height();
                }

                var si = state.si = new SmallImage($.extend({}, opts, {
                    target : $img
                }));
                var lens = state.lens = new Lens($.extend({}, opts, {
                    target : null,
                    parentNode : $zoomPad[0],
                    smallimage : si
                }));
                var stage = state.stage = new Stage($.extend({}, opts, {
                    target : null,
                    parentNode : $zoomPad[0],
                    smallimage : si
                }));
                var li = state.li = new LargeImage($.extend({}, opts, {
                    target : null,
                    parentNode : stage.state.$zwinimage,
                    smallimage : si,
                    lens : lens
                }));

                if (opts.type == 'innerzoom') {
                    stage.state.$zwinwrap.css({
                        cursor: 'crosshair'
                    });
                }

                $preload.html(opts.preloadText).hide().appendTo($zoomPad);
            },
            _bindEvents : function(){
                var state = this.state,
                    self  = this,
                    $el   = this.$element,
                    $img  = state.$img,
                    opts  = state.options,
                    $zoomPad = state.$zoomPad,
                    $preload= state.$preload,
                    si    = state.si,
                    li    = state.li,
                    siRegion = si.getRegion(),
                    lens  = state.lens,
                    stage = state.stage,
                    $thumbs = state.$thumbs;
                //drag option
                if (opts.type == 'drag') {
                    $zoomPad.mousedown(function () {
                        state.mouseDown = true;
                    });
                    $zoomPad.mouseup(function () {
                        state.mouseDown = false;
                    });
                    d.body.ondragstart = function () {
                        return false;
                    };
                    $zoomPad.css({
                        cursor: 'default'
                    });
                    state.lens.$element.css({
                        cursor: 'move'
                    });
                }

                $zoomPad.bind('mouseenter mouseover', function (event) {
                    $img.attr('title', '');
                    $el.attr('title', '');
                    state.zoom_active = true;
                    //if loaded then activate else load large image
                    si.calculate();
                    if (state.largeimageloaded) {
                        self.activate(event);
                    } else {
                        self.load();
                    }
                });
                $zoomPad.bind('mouseleave', function (event) {
                    self.deactivate();
                });
                $zoomPad.bind('mousemove', function (e) {

                    //如果大图加载失败,则lens的region未被计算,使用setCenter会报错
                    if(!state.largeimageloaded){
                        return;
                    }
                    //prevent fast mouse mevements not to fire the mouseout event
                    if (e.pageX > siRegion.pos.r || e.pageX < siRegion.pos.l || e.pageY < siRegion.pos.t || e.pageY > siRegion.pos.b) {
                        lens.setCenter();
                        return false;
                    }
                    state.zoom_active = true;
                    if (state.largeimageloaded && !stage.$element.is(':visible')) {
                        self.activate(e);
                    }
                    if (state.largeimageloaded && (opts.type != 'drag' || (opts.type == 'drag' && state.mouseDown))) {
                        lens.setPosition(e);
                    }
                });
                
                si._on({
                    'smallimageloaded' : function(data){}
                });

                li._on({
                    'largeimageloadbefore' : function(){
                        loaderShow();
                    },
                    'largeimageloaded' : function(data){
                        $preload.hide();
                        state.largeimageloading = false;
                        state.largeimageloaded = true;
                        lens.resize(li.getScale());
                        if (opts.type == 'drag' || opts.alwaysOn) {
                            self.activate();
                            lens.setCenter();
                        }
                    },
                    'largeimageloadederror' : function(){
                    
                    }
                });

                lens._on({
                    'lensposchange' : function(){
                        li.setPosition();
                    }
                });
                
                function loaderShow(){
                    $preload.show();
                    var top  = (siRegion.oh - $preload.height())/2;
                    var left = (siRegion.ow - $preload.width())/2;
                    //setting position
                    $preload.css({
                        top: top,
                        left: left,
                        position: 'absolute'
                    });
                }

                var thumb_preload = [];
                if($thumbs.length > 0) {
                    $thumbs.each(function(i){
                        if(opts.preloadImages) {
                            var img = new Image();
                            thumb_preload[i] = img;
                            img.src = $(this).attr('data-iz-large');
                        }
                    });

                    if( $.inArray(opts.thumbsTriggerType, ['click','hover'] ) != -1 ) {
                        $thumbs.bind(opts.thumbsTriggerType, function(e){
                            e.preventDefault();
                            if($(this).hasClass(state.thumbActiveCls)) {
                                return false;
                            }
                            $thumbs.removeClass(state.thumbActiveCls);
                            self.swapThumb(this);
                            return false;
                        });
                    }
                }
            }
        },
        public : {
            _init : function() {
                var state = this.state,
                    opts  = state.options;
                this._prepareOption();
                this._buildHTML();
                this._bindEvents();

                //preloading images
                if (opts.preloadImages || opts.type == 'drag' || opts.alwaysOn) {
                    this.load();
                }
            },
            load: function () {
                var state = this.state,
                    $el   = this.$element,
                    li    = state.li;
                if (state.largeimageloaded == false && state.largeimageloading == false) {
                    var url = $el.attr('data-iz-href') || $el.attr('href');
                    if(!url) { //没有显示的大图,则直接返回,不加载图片
                        return;
                    }
                    state.largeimageloading = true;
                    li.loadImage(url);
                }
            },
            activate: function (e) {
                var state = this.state;
                state.lens.show();
                state.stage.show();
            },
            deactivate: function (e) {
                var state = this.state,
                    opts  = state.options,
                    $el   = this.$element,
                    $img  = state.$img,
                    lens  = state.lens,
                    stage = state.stage;
                switch (opts.type) {
                case 'drag':
                    break;
                default:
                    $img.attr('title', state.imagetitle);
                    $el.attr('title', state.title);
                    if (opts.alwaysOn) {
                        lens.setCenter();
                    } else {
                        stage.hide();
                        lens.hide();
                    }
                    break;
                }
                state.zoom_active = false;
            },
            //{small : '', large : '', title : ''}
            swap : function(link){
                var state = this.state,
                    $img  = state.$img,
                    $el   = this.$element,
                    lens  = state.lens,
                    stage = state.stage;

                state.largeimageloading = false;
                state.largeimageloaded = false;

                $el.attr('href', link.large);
                $el.attr('data-iz-href', link.large);
                $img.attr('src', link.small);
                lens.hide();
                stage.hide();
                this.load();
            },
            swapThumb: function (thumb) {
                var state = this.state,
                    opts  = state.options,
                    $thumb= state.$thumb = $(thumb),
                    small = $thumb.attr('data-iz-small'),
                    large = $thumb.attr('data-iz-large'),
                    title = $thumb.attr('data-iz-title') || $thumb.attr('title');
                    

                if (small && large) {
                    $thumb.addClass(state.thumbActiveCls);
                    this.swap({
                        large : large,
                        small : small,
                        title : title
                    });
                } else {
                    throw 'ERROR :: Missing parameter for largeimage or smallimage.';
                }
            }
        }
    });
    return I;
});
