/**   
 * @Title: LineChart 
 * @Description: Line Chart
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-3-4
 * @version V1.0
 */
define(function(require, exports, module){
    
    //css
    require('css!./chart.css');
    //depends
    var $       = require('../../../core/1.0/jQuery+'),
        Widget  = require('../../../core/1.0/Widget'),
        SIB     = require('../../../core/1.0/Sib'),
        Raphael = require('../raphael/Raphael'),
        w = (function(){return this;})(), 
        d = w.document;
    
    var POINTS_TYPE = ["circle", "triangle", "rhomb", "square"];//圆,三角,菱形,四方形

    //config
    var defaults = {
        theme : 'sib-chart-default',
        //autoRender : true,     //是否自动渲染,如果手动则需要调用render()
        //comparable : false,
        lineType : 'straight', //线图类型,'straight'(直线) | 'arc'(弧线)
        colors : [], //手动配置线的颜色 （可选） 如 [{"DEFAULT":"#fff","HOVER":"#ccc"},{"DEFAULT":"#fff","HOVER":"#ccc"}]
        title : {    //主标题 string | object
            text: "", //html | text 标题
            show: true,
            css: {}
        },
        subTitle : { //子标题
            text: "",
            show: true,
            css: {}
        },
        legend : {  //线条说明
            show : false, //是否显示
            position : 's', //position  compass direction, nw, n, ne, e, se, s, sw, w.
            offsetx : 10,   //x轴方向偏移量
            offsety : 10,   //y轴方向偏移量
            layout: 'horizontal', // vertical | horizontal 横着排列还是竖着排列
            css : {}//样式
        },
        xAxis : {   //x轴
            show : true,
            css : {},
            pad : 1.2, //自动生成时候，最近的数据点离边框的默认距离
            title : '', //x轴文本
            min : null,
            max : null,
            num : 5,
            labels : [], //x轴刻度文本 [val1, val2, ...] or [[val, label], [val, label], ...] 待定
            renderer : null //LineChart.axisRenderer
        },
        yAxis : {   //y轴
            show : true,
            css : {},
            pad : 1.2, //
            title : '', //y轴文本
            min : null, //最小值
            max : null, //最大值
            num : 5,  //纵轴显示份数
            renderer : null //LineChart.axisRenderer
        },
        xGrid : { //boolean | object
            show : true,
            css : {},
            renderer : null    //LineChart.gridRenderer
        },
        yGrid : {
            show : true,
            css : {},
            renderer : null //LineChart.gridRenderer
        },
        //全局配置：线性配置
        line : {
            type : 'straight', //线图类型,'straight'(直线) | 'arc'(弧线)
            attr : {
                "stroke-width": "3px",
                stroke: "#f00"
            },
            hoverAttr : {
                "stroke-width": "4px",
                stroke: '#0f0'
            },
            shadow : {
                //阴影
            }
        },
        //全局配置：线性上点的配置,默认圆形
        point : {
            //type没有默认值，类型默认按照以下顺序循环显示
            //type : 'circle', //circle, square, rhomb, triangle ...
            attr : {
                stroke: "#fff",
                //"r": 4,
                width : 8,
                "stroke-width": 1.5,
                "fill": '#f00'//'{COLOR}'//COLOR_TPL
            },
            hoverAttr : {
                stroke: "#fff",
                //"r": 5,
                width : 10,
                "fill": '#0f0',//'{COLOR}',//COLOR_TPL,
                "stroke-width": 0
            },
            shadow : {
                //
            }
        },
        serie : {
            show : true,
            showPoint : true,
            showLine : true,
            lablel : null, 
            color : '#ccc',
            css : {},
            line : {},
            point : {},
            shadow : false, // boolean | object //false 不要阴影,true为有阴影使用默认值, object为自定义
            renderer : null //LineChart.renderer
        },
        series : [/*...*/],     //多个serie

        tip : {
            show : true,
            css : {},
            anim : {
                easing:"easeOut",
                duration:0.3
            },
            //boundryDetect: true, //boolean 是否进行边缘检测
            /**
             * data : {name, x, y, color}
             * cfg : {line, point ...}//cfg配置
             * tip : tip元素
             */
            formatter : function( data, cfg, tip){
                return data.x + '<br/>'+ 
                       '<span style="color : ' + data.color + '">' + data.name + '</span> : <b>' + data.y + '</b>';

            }
        }
    };

    var LineChart, LC;
    LC = LineChart = Widget.extend({
        static : {
            widgetName : 'SIBLineChart',
            require : require,
            defaults : defaults
        },
        private : {
            _prepareOption : function() {
                var state = this.state,
                    $el = this.$element,
                    opts = state.options;
                
                //title 支持string | object
                opts.title = formatTitle(opts.title);
                opts.subTitle = formatTitle(opts.subTitle);
                opts.xGrid = formatGrid(opts.xGrid);
                opts.yGrid = formatGrid(opts.yGrid);
                
                //series配置优先级: series > serie > defaults
                //line  配置优先级: series.line > lineType > line > serie.line > defaults
                //point 配置优先级：series.point > point > serie.point > defaults
                //color : series.color > colors > point/line > serie.color > defaults
                var series = opts.series;
                opts.series = [];
                //defaults 已经设置过,不用再从defaults扩展
                for(var i = 0; i < opts.source.length; i++) {
                    //opts.series[i] = $.extend(true, {}, opts.serie, (series && series[i]) || {});
                    var s = opts.series[i] = $.extend(true, {}, opts.serie);
                    if(!s.line) s.line = {};
                    if(!s.point) s.point = {};
                    $.extend(true, s.line, opts.line, (opts.lineType && {
                        type : opts.lineType
                    }) || {});
                    $.extend(true, s.point, {
                        type : POINTS_TYPE[i % 4]
                    },opts.point);
                    //color
                    var color = opts.colors && opts.colors[i];
                    var dc, hc;
                    var lineColor = {
                        attr : {},
                        hoverAttr : {}
                    };
                    var pointColor = {
                        attr : {},
                        hoverAttr : {}
                    };
                    if(typeof color === 'string') {
                        dc = color;
                        hc = color;
                    } else if(color) {
                        color['DEFAULT'] && (dc = color['DEFAULT']);
                        color['HOVER']   && (hc = color['HOVER']);
                    }
                    if(dc) {
                        lineColor.attr['stroke'] = dc;
                        pointColor.attr['fill'] = dc
                    }
                    if(hc) {
                        lineColor.hoverAttr['stroke'] = hc;
                        pointColor.hoverAttr['fill'] = hc;
                    }
                    
                    $.extend(true, s.line, lineColor);
                    $.extend(true, s.point, pointColor);
                    
                    //扩展优先级最高的
                    $.extend(true, s, (series && series[i]) || {});
                }
                
                function formatTitle(title) {
                    var stand = title;
                    if(typeof title === 'string') {
                        stand = $.extend({}, LC.defaults.title, {
                            text : title
                        });
                    }
                    return stand;
                }
                function formatGrid(grid) {
                    var stand = grid;
                    if(typeof grid === 'boolean') {
                        stand = $.extend({}, LC.defaults.xGrid, {
                            show : grid
                        });
                    }
                    return stand;
                }
            },
            _dataFormat : function() {
                var state = this.state,
                    opts  = state.options;

                state._xScales = this._getXScales();
                state._yScales = this._getYScales();
                state._dataset = this._getDataSet();
                
            },
            _drawPaper : function() {
                var state = this.state,
                    $el = this.$element;
                
                var $chart = state.$chart = $('<div class="sib-chart"></div>');
                
                $chart.appendTo($el).css({
                    width : $el.outerWidth(),
                    height : $el.outerHeight()
                });
                
                state.paper = Raphael($chart[0], $chart.outerWidth(), $chart.outerHeight());
                $(state.paper.canvas).css('zIndex', 200);
                var p = $el.css('position');
                if(!p || p == 'static') {
                    $el.css('position', 'relative');
                }
            },
            _drawAxes : function() {

                this._drawGridEvtRegion();
                this._drawGridX();
                this._drawGridY();
                this._drawAxisX();
                this._drawAxisY();
                //this._drawLabels();
            },
            //默认离周变的30宽度做成配置，待实现
            _drawLegend : function() {
                var state = this.state,
                    opts = state.options,
                    $chart = state.$chart,
                    $title = state.$title,
                    paper = state.paper,
                    self = this;
                
                var lOpts = opts.legend;
                if(!lOpts.show) return;

                var legends = state.legends = [];
                //构造Legend label
                var $legend = state.$legend = $('<div class="sib-chart-legend"><ul></ul></div>');
                $.each(state._dataset, function(idx, s){
                    var $li = $('<li></li>').text(s.name).appendTo($legend.find('ul'));
                    $li.data('state', {
                        index : idx
                    });
                    legends.push({
                        $item : $li,
                        index : idx
                    });
                });
                
                $chart.append($legend);
                $legend.css('zIndex', 400);
                
                if(lOpts.layout == 'vertical') {
                    $legend.addClass('sib-chart-legend-v');
                } else {
                    $legend.addClass('sib-chart-legend-h');
                }
                //Legend 位置
                var my = 'center bottom-30';
                var at = 'center bottom';
                //nw, n, ne, e, se, s, sw, w.
                switch(lOpts.position) {
                case 'nw' :
                    at = 'left+30 top+' + $title.outerHeight();
                    my = 'left top';
                    break;
                case 'n' :
                    at = 'center top+' + $title.outerHeight();
                    my = 'center top';
                    break;
                case 'ne' :
                    at = 'right-30 top+' + $title.outerHeight();
                    my = 'right top';
                    break;
                case 'e' : 
                    at = 'right-30 center';
                    my = 'right center';
                    break;
                case 'se' :
                    at = 'right-30 bottom-30';
                    my = 'right bottom';
                    break;
                case 's' : 
                    at = 'center bottom-30';
                    my = 'center bottom';
                    break;
                case 'sw' :
                    at = 'left+30 bottom-30';
                    my = 'left bottom';
                    break;
                case 'w' :
                    at = 'left+30 center';
                    my = 'left center';
                    break;
                default : 
                    break;
                }

                $legend.position({
                    of : $chart,
                    within : $chart,
                    my : my,
                    at : at
                });
                
                //构造Legend icon
                $.each(state._dataset, function(i, s){
                    var serie = opts.series[i];
                    if(serie.showLine) {
                        var line = serie.line;
                        var $label = $legend.find('li').eq(i);
                        var left = $label.offset().left -$chart.offset().left + 5;
                        var top = $label.offset().top - $chart.offset().top + $label.outerHeight()/2;
                        var l = paper.path('m'+left + ',' + top+'l20,0');
                        l.attr(line.attr);
                        legends[i].line = l;
                    }
                    if(serie.showPoint) {
                        var point = serie.point;
                        
                        var bbox = legends[i].line.getBBox();

                        var x = bbox.x + bbox.width / 2;
                        var y = bbox.y + bbox.height /2;
                        legends[i].point = self._drawPoint(point.type, x, y, point.attr);
                    }
                });
                
                //绑定事件
                $legend.on('click', 'li', function( evt ){
                    var state = $(this).data('state');
                    self.toggle(state.index);
                });
                $legend.on('mouseover', 'li', function( evt ){
                    var state = $(this).data('state');
                    self.hightlight(state.index);
                });
                $legend.on('mouseout', function(){
                    self.hightlight(-1);
                });
            },
            _drawSeries : function() {
                var state = this.state,
                    opts = state.options,
                    paper = state.paper,
                    _dataset = state._dataset,
                    _xScales = state._xScales,
                    _yScales = state._yScales,
                    seriesCfg = opts.series,
                    gridRegion = this._getGridRegion();

                var series = state.series = [];
                var coordset = this._dataset2Coordset();
                state.coordset = coordset;
                for(var i = 0; i < coordset.length; i++) {
                    series[i] = this._drawSerie(coordset[i].data, seriesCfg[i], i);
                }
            },
            //绘制一个序列
            _drawSerie : function( serieData, cfg, index ) {
                
                var pointCfg = cfg.point,
                    lineCfg  = cfg.line,
                    state = this.state,
                    self  = this;

                var serie = {};
                serie.show = cfg.show;
                serie.points = [];
                //var pathStr = 'M' + coordset[i].data[0][0] + ' ' + coordset[i].data[0][1];
                serie.line = this._drawLine(lineCfg.type, serieData, lineCfg.attr);
                serie.lineProxy = this._drawLine(lineCfg.type, serieData, $.extend(true, {},lineCfg.attr, {
                    "stroke-width": "20px",
                    'visibility' : 'visible',
                    'stroke' : '#fff',
                    opacity : '0.01'
                }));
                serie.cfg = cfg;
                serie.index = index;
                serie.coords = serieData;
                
                for(var j = 0; j < serieData.length; j++) {
                    var coord = serieData[j];
                    var point = this._drawPoint(pointCfg.type, coord[0], coord[1], pointCfg.attr);
                    serie.points[j] = point;
                    //pathStr += 'L' + coord[0] + ' ' + coord[1];
                }
                
                serie.lineProxy.hover(function( ev ){
                    var old = state.hoverIndex;
                    if(old != serie.index) {
                        //state.hoverIndex = serie.index;统一在hightlight里修改
                        self._trigger('focusserie', ev, {
                            index : serie.index,
                            oldIndex : old
                        });
                    }
                }, $.noop/*function(){
                    serie.line.attr(serie.cfg.line.attr);
                }*/);

                return serie;
            },
            //用户导入的数据集合，转成坐标集合
            _dataset2Coordset : function(){
                var state = this.state,
                    _dataset = state._dataset;

                var coordset = $.extend(true, [], _dataset);
                for(var i = 0; i < coordset.length; i++) {
                    for(var j = 0; j < coordset[i].data.length; j++) {
                        var coord = this._getCoord(coordset[i].data[j][0], coordset[i].data[j][1]);
                        coordset[i].data[j] = [coord.x, coord.y];
                    }
                }
                return coordset;
            },
            //x,y 为用户数据，返回{x:'', y:''}为实际坐标
            _getCoord : function(dx, dy) {
                var state = this.state,
                    _xScales = state._xScales,
                    _yScales = state._yScales,
                    gridRegion = this._getGridRegion(),
                    xDist = (_xScales[_xScales.length - 1].value - _xScales[0].value),
                    yDist = (_yScales[_yScales.length - 1].value - _yScales[0].value),
                    widthDist = gridRegion.width,
                    heightDist = gridRegion.height;
                
                var xxx = (dx - _xScales[0].value) / xDist * widthDist + gridRegion.left;
                var yyy = gridRegion.top + gridRegion.height - (dy - _yScales[0].value) / yDist * heightDist; 
                
                return {
                    x : xxx,
                    y : yyy
                };
            },
            _bindEvents : function() {
                var state = this.state,
                    opts = state.options;
                
                this._on({
                    'mouseoutgrid' : function( evt ) {
                        this.hightlight(-1);
                        this.state.$tip.hide();
                    },
                    'mouseingrid' : function( evt ){
                        
                    },
                    'mousemovegrid' : function( evt ) {
                        var state = this.state,
                            $chart = state.$chart,
                            series = state.series,
                            index  = state.hoverIndex,
                            serie  = series[index],
                            closeIndex = 0,
                            closeDis   = $chart.width();
                        
                        if(serie) {
                            for(var i = 0; i < serie.points.length; i++) {
                                var region = serie.points[i].getBBox();
                                var x = region.x + region.width/2 + $chart.offset().left;
                                var dis = Math.abs(evt.pageX - x);
                                if(closeDis > dis) {
                                    closeDis = dis;
                                    closeIndex = i;
                                }
                            }
                            this.hightlightPoint(serie, closeIndex);
                        }
                    },
                    'focusserie' : function( evt, param ){
                        this.hightlight( param.index );
                        this._trigger('mousemovegrid', evt);
                    },
                    'hightlightpoint' : function( evt, param ) {

                        var state = this.state,
                            opts  = state.options,
                            $tip  = state.$tip,
                            serie = param.serie,
                            index = param.index,
                            _dataset = state._dataset,
                            _xLabels = state._xLabels;

                        if(!opts.tip.show) return;

                        if($.isFunction(opts.tip.formatter)) {
                            var x = '';
                            if(_xLabels && _xLabels[index]) {
                                x = _xLabels[index].label || _xLabels[index].value;
                            }
                            var val = opts.tip.formatter.call(this, {
                                name : _dataset[serie.index].name,
                                x    : x || _dataset[serie.index].data[index][0],
                                y    : _dataset[serie.index].data[index][1],
                                color: serie.cfg.point.attr['fill'] || serie.cfg.line.attr['stroke']
                            }, serie.cfg, $tip[0]);
                            if(val) {
                                $tip.html(val);
                            }
                        }
                        $tip.show();
                        $tip.position({
                            of : serie.points[index].node,
                            at : 'left top',
                            my : 'right bottom',
                            using : function( to ){
                                $(this).stop(true, false).animate(to);
                            }
                        });
                    }
                });
            },
            _drawTitle : function() {
                var state = this.state,
                    opts = state.options;

                var $title = state.$title = $('<div class="sib-chart-title"></div>');
                createTitle(opts.title, $title, 'sib-chart-h1');
                createTitle(opts.subTitle, $title, 'sib-chart-h2');
                
                state.$chart.append($title);
                function createTitle(param, $container, cssName) {
                    var $t = $('<div></div>');
                    cssName && $t.addClass(cssName);
                    if(param.show && param.text) {
                        $t.text(param.text).appendTo($container);
                        if(param.css) {
                            $t.css(param.css);
                        }
                    }
                }
                $title.css({
                    zIndex : 300
                });
            },
            _drawGridEvtRegion : function(){
                var state = this.state,
                    $chart = state.$chart,
                    paper  = state.paper,
                    gridRegion = this._getGridRegion(),
                    self = this;

                var grid = paper.rect(gridRegion.left, gridRegion.top, gridRegion.width, gridRegion.height);
                state.grid = grid;
                grid.attr({
                    fill : '#fff',
                    'stroke-width' : 0,
                    opacity : 0
                });
                grid.hover(function(){
                    self._trigger('mouseingrid');
                }, function(){
                    self._trigger('mouseoutgrid');
                });
                $(grid.node).on('mousemove', function( evt ){
                    self._trigger('mousemovegrid', evt);
                });
            },
            _drawGridX : function() {
                var state = this.state,
                    opts = state.options,
                    $chart = state.$chart,
                    gridRegion = this._getGridRegion(),
                    num = state._xScales.length - 1,
                    unit = gridRegion.width / num;

                if(!opts.xGrid.show) return;
                for(var i = 0; i <= num; i++) {
                    var x = gridRegion.left + i * unit;
                    this._htmlLineY(x, gridRegion.top, gridRegion.height, {
                        color : '#dfdfdf',
                        zIndex : 1
                    });
                }
                //gridRegion.width / num
            },
            _drawGridY : function() {
                var state = this.state,
                    opts = state.options,
                    $chart = state.$chart,
                    gridRegion = this._getGridRegion(),
                    num = state._yScales.length - 1,
                    unit = gridRegion.height / num;

                if(!opts.yGrid.show) return;

                for(var i = 0; i <= num; i++) {
                    var y = gridRegion.top + gridRegion.height - i * unit;
                    this._htmlLineX(gridRegion.left, y, gridRegion.width, {
                        color : '#dfdfdf',
                        zIndex : 1
                    });
                }
            },
            _drawAxisX : function() {
                var state = this.state,
                    opts = state.options,
                    $chart = state.$chart,
                    _xScales = state._xScales,
                    _yScales = state._yScales,
                    gridRegion = this._getGridRegion(),
                    unit = gridRegion.width / (_xScales.length - 1);

                var y = gridRegion.top + gridRegion.height;
                this._htmlLineX(gridRegion.left, y, gridRegion.width, {
                    color : '#999',
                    zIndex : 100
                });
                
                //Label 小刻度线
                for(var i = 0; i < _xScales.length; i++) {
                    var left = gridRegion.left + unit * i;
                    var top  = gridRegion.top + gridRegion.height;
                    //小刻度线
                    this._htmlLineY(left, top, 4, {
                        color : '#999',
                        zIndex : 100
                    });
                    
                    //如果有label则显示
                    if(_xScales[i].label !== null) {
                        var $label = $('<span></span>').html(_xScales[i].label).appendTo($chart);
                        $label.css('position', 'absolute');
                        $label.position({
                            of : $chart,
                            within : $chart,
                            my : 'center top+3',
                            at : 'left+' + left + ' top+' + top
                        });
                    }
                }
                //如果有xLabels 则显示xLabels
                var xls = state._xLabels;
                if(xls && $.isArray(xls)) {
                    for(var i = 0; i < xls.length; i++) {
                        var coord = this._getCoord(xls[i].value, _yScales[0].value);
                        var $label = $('<span></span>').html(xls[i].label).appendTo($chart);
                        $label.css('position', 'absolute');
                        $label.position({
                            of : $chart,
                            within : $chart,
                            my : 'center top+3',
                            at : 'left+' + coord.x + ' top+' + coord.y
                        });
                    }
                }
            },
            _drawAxisY : function() {
                var state = this.state,
                    opts = state.options,
                    gridRegion = this._getGridRegion(),
                    $chart = state.$chart,
                    _yScales = state._yScales,
                    unit = gridRegion.height / (_yScales.length - 1);

                this._htmlLineY(gridRegion.left, gridRegion.top, gridRegion.height, {
                    color : '#999',
                    zIndex : 100
                });
                
                //Label
                var len = _yScales.length;
                for(var i = 0; i < len; i++) {
                    var $label = $('<span></span>').html(_yScales[i].label).appendTo($chart);
                    $label.css('position', 'absolute');
                    var left = gridRegion.left;
                    var top  = gridRegion.top + unit * (len - 1 - i);
                    $label.position({
                        of : $chart,
                        within : $chart,
                        my : 'right-5 center',
                        at : 'left+' + left + ' top+' + top
                    });
                    this._htmlLineX(left - 3, top, 3, {
                        color : '#999',
                        zIndex : 100
                    });
                }
            },
            _drawTip : function() {
                var state = this.state,
                    opts  = state.options,
                    $chart = state.$chart;
                var $tip = $('<div class="sib-chart-tip">myTip</div>').appendTo($chart);
                state.$tip = $tip;

                /*tip : {
                    show : true,
                    css : {},
                    anim : {
                        easing:"easeOut",
                        duration:0.3
                    },
                    //boundryDetect: true, //boolean 是否进行边缘检测
                    formatter : function(){
                        return '<b>'+ this.series.name +'</b><br/>'+
                                    this.x +': '+ this.y +'°C';

                    }
                }*/
            },
            //得到坐标轴的尺寸，包括Label,Labels
            _getAxesRegion : function() {
                var state = this.state,
                    opts = state.options,
                    $chart = state.$chart,
                    $title = state.$title,
                    $legend = state.$legend;

                if(state._axesRegion) return state._axesRegion;
                
                var top = $title ? $title.outerHeight() : 0,
                    left = 0,
                    width = $chart.width(),
                    height = $chart.height() - top,
                    lp = $legend.position(),
                    lLayout = opts.legend.layout;
                    
                if($legend) {
                    switch(opts.legend.position) {
                    case 'nw' :
                        if(lLayout == 'vertical') {
                            left = lp.left + $legend.outerWidth();
                            width -= left;
                        } else {
                            top = lp.top + $legend.outerHeight();
                            height = $chart.height() - top;
                        }
                        break;
                    case 'n' :
                        top = lp.top + $legend.outerHeight();
                        height = $chart.height() - top;
                        break;
                    case 'ne' :
                        if(lLayout == 'vertical') {
                            width = lp.left;
                        } else {
                            top = lp.top + $legend.outerHeight();
                            height = $chart.height() - top;
                        }
                        break;
                    case 'e' : 
                        width = lp.left;
                        break;
                    case 'se' :
                        if(lLayout == 'vertical') {
                            width = lp.left;
                        } else {
                            height = lp.top - top;
                        }
                        break;
                    case 's' : 
                        height = lp.top - top;
                        break;
                    case 'sw' :
                        if(lLayout == 'vertical') {
                            left = lp.left + $legend.outerWidth();
                            width -= left;
                        } else {
                            height = lp.top - top;
                        }
                        break;
                    case 'w' :
                        left = lp.left + $legend.outerWidth();
                        width -= left;
                        break;
                    default : 
                        break;
                    }
                }
                var space = 20;//坐标与外围的空隙
                
                state._axesRegion = {
                    position : 'absolute',
                    left : left + space,
                    top : top + space,
                    width : width - 2 * space,
                    height : height - 2 * space
                };
                return state._axesRegion;
            },
            //得到坐标里表格的尺寸,不带刻度和labels
            _getGridRegion : function() {
                var state = this.state;
                
                if(state._gridRegion) return state._gridRegion;

                var ar = this._getAxesRegion(),
                    space = 20;//表格与坐标的空隙
                state._gridRegion = {
                    width : ar.width - 2 * space,
                    height : ar.height - 2 * space,
                    left : ar.left + space,
                    top : ar.top + space
                }
                return state._gridRegion;
            },
            //得到表格里面图形的区域,图形跟Grid还要保持一点距离,后期看可需要这个。待定
            _getGraphRegion : function() {
                
            },
            _htmlLineX : function(x, y, len, css) {
                var borderTop = Number(css && css.width || 1) + 'px ';
                borderTop += css && css.style || 'solid';
                var mcss = $.extend({}, css, {
                    borderColor : css.color || '#000',
                    borderTop : borderTop,
                    left : x,
                    top : y,
                    display:"block",
                    position:"absolute",
                    width:len,
                    height:0
                });
                var $line = $("<div></div>").css(mcss);
                return $line.appendTo(this.state.$chart);
            },
            //css 属性包括：type/color/zIndex
            _htmlLineY : function(x, y, len, css) {
                var borderLeft = Number(css && css.width || 1) + 'px ';
                borderLeft += css && css.style || 'solid';
                var mcss = $.extend({}, css, {
                    borderColor : css && css.color || '#000',
                    borderLeft : borderLeft,
                    left : x,
                    top : y,
                    display:"block",
                    position:"absolute",
                    width:0,
                    height:len
                });
                var $line = $("<div></div>").css(mcss);
                return $line.appendTo(this.state.$chart);
            },
            //如果point存在则是重构
            _drawPoint : function(type, x, y, attr){
                var state = this.state,
                    paper = state.paper,
                    w = attr.width,
                    point,
                    pathStr = this._pointPathStr(type, x, y, w);

                point = paper.path(pathStr);
                point && point.attr(attr);
                return point;
            },
            _refreshPoint : function(point, type, x, y, attr) {
                var state = this.state,
                    w = attr.width,
                    pathStr = this._pointPathStr(type, x, y, w);
    
                point && point.attr($.extend({}, attr, {
                    path : pathStr
                }));
            },
            _pointPathStr : function(type, x, y, w){
                var pathStr = '';
                if(type == 'triangle') {    //三角形
                    var a = [x, y - w],
                        b = [x - w/2, y + w/2],
                        c = [x + w/2, y + w/2];

                    pathStr = 'M' + a.join(' ');
                    pathStr += 'L' + b.join(' ');
                    pathStr += 'L' + c.join(' ');
                } else if(type == 'rhomb') {    //菱形
                    var offset = w/Math.sqrt(2)
                    var a = [x, y - offset],
                        b = [x + offset, y],
                        c = [x, y + offset],
                        d = [x - offset, y];
                    
                    pathStr = 'M' + a.join(' ');
                    pathStr += 'L' + b.join(' ');
                    pathStr += 'L' + c.join(' ');
                    pathStr += 'L' + d.join(' ');
                } else if(type == 'square') {   //正方形
                    x = x - w/2;
                    y = y - w/2;
                    var a = [x, y],
                        b = [x + w, y],
                        c = [x + w, y + w],
                        d = [x, y + w];
                    pathStr = 'M' + a.join(' ');
                    pathStr += 'L' + b.join(' ');
                    pathStr += 'L' + c.join(' ');
                    pathStr += 'L' + d.join(' ');
                } else {
                    var r = w/2,
                        start = [x-r, y],
                        wn = [x-r, y-r/2, x-r/2, y-r, x, y-r],
                        ne = [x+r/2, y-r, x+r, y-r/2, x+r, y],
                        se = [x+r, y+r/2, x+r/2, y+r, x, y+r],
                        ws = [x-r/2, y+r, x-r, y+r/2, x-r, y];

                    pathStr = 'M' + start.join(' ');
                    pathStr += 'C' + wn.join(' ');
                    pathStr += 'C' + ne.join(' ');
                    pathStr += 'C' + se.join(' ');
                    pathStr += 'C' + ws.join(' ');
                }
                pathStr += 'z';
                return pathStr;
            },
            _drawLine : function(type, pointArr, attr) {
                var state = this.state,
                    opts = state.options,
                    paper = state.paper,
                    pathStr = '';

                pathStr = 'M' + pointArr[0][0] + ' ' + pointArr[0][1];
                if(type == 'arc' && pointArr.length > 2) {
                    pathStr += 'R';
                    for(var i = 1; i < pointArr.length; i++) {
                        pathStr += ' ' + pointArr[i][0] + ' ' + pointArr[i][1];
                    }
                } else {
                    for(var i = 1; i < pointArr.length; i++) {
                        pathStr += 'L' + pointArr[i][0] + ' ' + pointArr[i][1];
                    }
                }

                //console.debug('pathStr : ' + pathStr);
                var line = paper.path(pathStr);
                line.attr(attr);
                return line;
            },
            //x or y
            _getXScales : function() {
                var state = this.state,
                    opts  = state.options,
                    xAxis = opts.xAxis,
                    source = opts.source,
                    max = xAxis.max,
                    min = xAxis.min,
                    num = xAxis.num || 5,
                    pad = xAxis.pad;

                //优先级 B > xAxis.labels > A(刻度默认1,2,3...)
                var xArray = [];
                /** 从source.data中取两种形式:
                  * A) [data : [1, 2, 3 ...]] 
                  * B) [data : [[k, v], [k, v], ...]]
                  */
                //B
                if(source[0] && source[0].data && $.isArray(source[0].data[0])) {
                    var range = getXRange(source);
                    range.max > max && (max = range.max);
                    range.min < min && (min = range.min);
                //A
                } else if(source[0] && source[0].data && !$.isArray(source[0].data[0])) {
                    
                    if(xAxis.labels && $.isArray(xAxis.labels)) {
                        var len = xAxis.labels.length;
                        var _xLabels = state._xLabels = [];
                        for(var i = 0; i <= len; i++) {
                            xArray[i] = {
                                //label : xAxis.labels[i - 1] ? xAxis.labels[i - 1] : '',
                                label : null,
                                value : i
                            };
                            if(i >= len) continue;
                            _xLabels[i] = {
                                label : xAxis.labels[i],
                                value : i + 0.5
                            };
                        }
                        return xArray;
                    } else {
                        min = 1;
                        max = source[0].data.length;
                        num = max + 1;
                    }
                } else {
                    return [];
                }
                max = Math.floor(max + pad);
                min = Math.ceil(min - pad);
                unit = (max - min)/num;
                for(var i = 0; i <= num; i++) {
                    var val = (i == num) ? max : (min + unit * i);
                    val = Math.round(val * 100) / 100; //精确到小数点后两位
                    xArray[i] = {
                        label : val,
                        value : val
                    };
                }
                return xArray;
                
                //得到x轴的最大最小值range
                function getXRange( source ) {
                    var max, min;
                    max = min = source[0].data[0][0];
                    for(var i = 0; i < source.length; i++) {
                        var data = source[i].data;
                        if(!data || !$.isArray(data)) break;
                        for(var j = 0; j < data.length; j++) {
                            var xv = data[j][0];
                            if(xv > max) {
                                max = xv;
                            } else if(xv < min) {
                                min = xv;
                            }
                        }
                    }
                    return {
                        max : max,
                        min : min
                    };
                }
            },
            _getYScales : function() {
                var state = this.state,
                    opts  = state.options,
                    yAxis = opts.yAxis,
                    source = opts.source,
                    max = yAxis.max,
                    min = yAxis.min,
                    num = yAxis.num || 5,
                    pad = yAxis.pad;
    
                var yArray = [];

                /** 从source.data中取两种形式:
                  * A) [data : [1, 2, 3 ...]] 
                  * B) [data : [[k, v], [k, v], ...]]
                  */
                //B
                if(source[0] && source[0].data && $.isArray(source[0].data[0])) {
                    var range = getYRange(source);
                    range.max > max && (max = range.max);
                    range.min < min && (min = range.min);
                //A
                } else if(source[0] && source[0].data && !$.isArray(source[0].data[0])) {
                    max = min = source[0].data[0];
                    for(var i = 0; i < source.length; i++) {
                        var mmax = Math.max.apply(null, source[i].data);
                        var mmin = Math.min.apply(null, source[i].data);
                        mmax > max && (max = mmax);
                        mmin < min && (min = mmin);
                    }
                } else {
                    return [];
                }
                max = Math.ceil(max + pad);
                min = Math.ceil(min - pad);
                unit = (max - min)/num;
                for(var i = 0; i <= num; i++) {
                    var val = (i == num) ? max : (min + unit * i);
                    yArray[i] = {
                        label : val,
                        value : val
                    };
                }
                return yArray;
                
                //得到x轴的最大最小值range
                function getYRange( source ) {
                    var max, min;
                    max = min = source[0].data[0][1];
                    for(var i = 0; i < source.length; i++) {
                        var data = source[i].data;
                        if(!data || !$.isArray(data)) break;
                        for(var j = 0; j < data.length; j++) {
                            var xv = data[j][1];
                            if(xv > max) {
                                max = xv;
                            } else if(xv < min) {
                                min = xv;
                            }
                        }
                    }
                    return {
                        max : max,
                        min : min
                    };
                }
            },
            _getDataSet : function() {
                var state = this.state,
                    opts = state.options,
                    source = opts.source,
                    dataset = [];

                //B
                if(source[0] && source[0].data && $.isArray(source[0].data[0])) {
                    return $.extend(true, [], source);
                //A
                } else if(source[0] && source[0].data && !$.isArray(source[0].data[0])) {
                    var msource = $.extend(true, [], source);
                    for(var i = 0; i < msource.length; i++) {
                        for(var j = 0; j < msource[i].data.length; j++) {
                            //将key值设置为 对应label的key
                            if(state._xLabels && $.isArray(state._xLabels)) {
                                msource[i].data[j] = [state._xLabels[j].value, msource[i].data[j]];
                            } else {
                                //默认坐标从1 开始
                                msource[i].data[j] = [j + 1, msource[i].data[j]];
                            }
                        }
                    }
                    return msource;
                } else {
                    return [];
                }
            }
        },
        public : {
            _init : function() {
                var state = this.state,
                    opts = state.options,
                    self = this;
                
                this._prepareOption();
                this._dataFormat();
                this._drawPaper();
                this._drawTitle();
                this._drawLegend();
                this._drawAxes();
                this._drawSeries();
                this._drawTip();
                this._bindEvents();
            },
            //显示隐藏曲线
            toggle : function( index ) {
                var state = this.state,
                    opts  = state.options,
                    series = state.series,
                    seriesCfg = opts.series,
                    legends   = state.legends;

                if(SIB.isInvalidValue(index) || index >= series.length) {
                    return;
                }
                var serie  = series[index],
                    cfg    = seriesCfg[index],
                    legend = legends[index];
                serie.show = !serie.show;
                if(serie.show) {
                    serie.line.show();
                    serie.lineProxy.show();
                    $.each(serie.points, function(i, point){
                        point.show();
                    });
                    if(legend) {
                        legend.line.attr(cfg.line.attr);
                        legend.point.attr(cfg.point.attr);
                        legend.$item.removeClass('legend-item-disabled');
                    }
                } else {
                    serie.line.hide();
                    serie.lineProxy.hide();
                    $.each(serie.points, function(i, point){
                        point.hide();
                    });
                    if(legend) {
                        legend.line.attr({
                            stroke : '#ccc'
                        });
                        legend.point.attr({
                            fill : '#ccc'
                        });
                        legend.$item.addClass('legend-item-disabled');
                    }
                }
            },
            //突出显示指定曲线
            hightlight : function( index ){
                var state = this.state,
                    series = state.series,
                    serie  = series[index],
                    oldIndex = state.hoverIndex;

                if(SIB.isInvalidValue(index) || index >= series.length) {
                    return;
                }
                if(oldIndex != index) {
                    this.lowlight(oldIndex);
                }
                state.hoverIndex = index;
                if(index < 0) { //如果-1 则不高亮显示任何一条线
                    return;
                }
                serie.line.attr(serie.cfg.line.hoverAttr);
                serie.line.toFront();
                for(var i in serie.points) {
                    serie.points[i].toFront();
                }
            },
            lowlight : function( index ) {
                var state = this.state,
                    series = state.series,
                    serie  = series[index];
                
                if(SIB.isInvalidValue(index) || index >= series.length) {
                    return;
                }
                if(serie && serie.line){
                    serie.line.attr(serie.cfg.line.attr);
                }
                if(serie && serie.points && serie.points.length) {
                    for(var i = 0; i < serie.points.length; i++) {
                        var coord = serie.coords[i];
                        var pcfg  = serie.cfg.point;
                        this._refreshPoint(serie.points[i], pcfg.type, coord[0], coord[1], serie.cfg.point.attr);
                    }
                }
            },
            hightlightPoint : function( serie, index ) {
                var state = this.state,
                    $tip  = state.$tip,
                    pcfg = serie.cfg.point,
                    curPoint = serie.points[index],
                    isChange = false;

                for(var i = 0; i < serie.points.length; i++) {
                    var coord = serie.coords[i],
                        attr = pcfg.attr,
                        flag = serie.points[i].data('hightlight');
                    if(i == index) {
                        if(flag) continue;
                        attr = pcfg.hoverAttr;
                        serie.points[i].data('hightlight', true);
                    } else {
                        if(!flag) continue;
                        serie.points[i].data('hightlight', false);
                    }
                    this._refreshPoint(serie.points[i], pcfg.type, coord[0], coord[1], attr);
                    isChange = true;
                }

                if(isChange) {
                    this._trigger('hightlightpoint', null, {
                        serie : serie,
                        index : index
                    });
                }
            }
        }
    });
    
    return LC;
})