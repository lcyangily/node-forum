/**   
 * @Title: LineChart 
 * @Description: Line Chart
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2014-3-3
 * @version V1.0
 */
define(function(require, exports, module){
    //depends
    var $      = require('../../core/1.0/jQuery+'),
        Widget = require('../../core/1.0/Widget'),
        SIB    = require('../../core/1.0/Sib'),
        w = (function(){return this;})(), 
        d = w.document;
    
    var POINTS_TYPE = ["circle", "triangle", "rhomb", "square"];//圆,三角,菱形,四方形
    
    //config
    var defaults = {
        zIndex: 0,
        yAxis: {
            spacing: {
                top: 0,
                bottom: 0
            }
        },
        xAxis: {
            spacing: {
                left: 0,
                right: 0
            }
        },
        canvasAttr: {
            x: 60,
            y: 60
        },
        defineKey: {
        
        },
        zoomType: "x"
    };
    
    var BaseChart, BC;
    BC = BaseChart = Widget.extend({
        static : {
            widgetName : 'SIBBaseChart',
            require : require,
            defaults : defaults
        },
        private : {
            //获取内部容器信息
            _createContainer : function() {
                var state = this.state,
                    opts = state.options,
                    self = this,
                    $el = this.$element,
                    canvasAttr = opts.canvasAttr,
                    innerWidth = canvasAttr.width || ($el.width() - 2 * canvasAttr.x),
                    innerHeight = canvasAttr.height || ($el.height() - 2 * canvasAttr.y),
                    x = canvasAttr.x,
                    y = canvasAttr.y,
                    width = innerWidth,
                    height = innerHeight,
                    tl = {
                        x: x,
                        y: y
                    },
                    tr = {
                        x: x + innerWidth,
                        y: y
                    },
                    bl = {
                        x: x,
                        y: y + height
                    },
                    br = {
                        x: x + innerWidth,
                        y: y + height
                    };
                //内部容器的信息
                state.innerContainerOpts = {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    tl: tl,
                    tr: tr,
                    bl: bl,
                    br: br
                };
            },
            //计算坐标刻度
            _dataFormat: function() {
                var state = this.state,
                    opts = state.options,
                    self = this,
                    zoomType = opts.zoomType,
                    isY = zoomType == "x" ? false : true,
                    ictn = state.innerContainerOpts,
                    left = opts.xAxis.spacing ? self.px2num(opts.xAxis.spacing.left) : 0,
                    right = opts.xAxis.spacing ? self.px2num(opts.xAxis.spacing.right) : 0,
                    top = opts.yAxis.spacing ? self.px2num(opts.yAxis.spacing.top) : 0,
                    bottom = opts.yAxis.spacing ? self.px2num(opts.yAxis.spacing.bottom) : 0,
                    width = ictn.width - left - right,
                    height = ictn.height - top - bottom,
                    x = ictn.x / 1 + left,
                    y = ictn.y / 1 + top,
                    allDatas,
                    allDatasX,
                    coordNum,
                    coordNumX,
                    coordPos,
                    coordPosX,
                    curCoordNum;

                self._pointsY = [];
                self._pointsX = [];

                if (zoomType == "x") {
                    //获取所有刻度值
                    allDatas = self.getAllDatas();
                    //获取刻度 从定义刻度中获取
                    curCoordNum = coordNum = state.coordNum = self._getScales(allDatas, opts.yAxis);
                    //刻度值转换成图上的点
                    coordPos = self._data2GrapicData(coordNum, false, true);
                } else if (zoomType == "y") {
                    allDatasX = self.getAllDatas();
                    curCoordNum = coordNumX = state.coordNumX = self._getScales(allDatasX, opts.xAxis);
                    coordPosX = self._data2GrapicData(coordNumX, true, false);
                } else if (zoomType == "xy") {
                    allDatas = self.getAllDatas(0);
                    allDatasX = self.getAllDatas(1);
                    curCoordNum = coordNum = state.coordNum = self._getScales(allDatas, opts.xAxis);
                    coordNumX = state.coordNumX = self._getScales(allDatasX, opts.yAxis);
                    coordPos = self._data2GrapicData(coordNum, false, false);
                    coordPosX = self._data2GrapicData(coordNumX, true, true);
                }

                var getDataPoints = function(data, index, coordNum) {
                    var series = opts.series[index],
                        //坐标刻度的最大值
                        max = Math.max.apply(null, coordNum),
                        min = Math.min.apply(null, coordNum),
                        defineKey = opts.defineKey,
                        defineKeyX = defineKey.x,
                        defineKeyY = defineKey.y,
                        points = [],
                        j = 0,
                        dataType = self.getDataType();

                    if (zoomType == "x") {
                        //复杂数据 data 的 元素为 object
                        if (defineKeyX && defineKeyY && dataType == "object") {
                            for (var i in self._pointsX) {
                                if (data[j] && opts.xAxis.text[i] == data[j][defineKeyX]) {
                                    points[i] = {
                                        x: self._pointsX[i].x, //横坐标
                                        y: self.data2Grapic(data[j][defineKeyY], max, min, height, y, true), //纵坐标
                                        dataInfo: data[j], //数据信息 暂时将series.data的数据 和 series下的数据 耦合
                                        index: Math.round(i) //索引
                                    };

                                    j++;
                                } else {
                                    points[i] = {
                                        x: self._pointsX[i].x, //横坐标
                                        index: Math.round(i) //索引
                                    };
                                }
                            }
                            //简单数据 data 的元素为 number 类型
                        } else {
                            for (var i in self._pointsX) {
                                if (data[i] === '' || data[i] === null) {
                                    points[i] = {
                                        x: self._pointsX[i].x, //横坐标
                                        index: Math.round(i) //索引
                                    };
                                } else {
                                    points[i] = {
                                        x: self._pointsX[i].x, //横坐标
                                        y: self.data2Grapic(data[i], max, min, height, y, true), //纵坐标
                                        dataInfo: {
                                            y: data[i],
                                            x: opts.xAxis['text'][i]
                                        }, //数据信息 暂时将series.data的数据 和 series下的数据 耦合
                                        index: Math.round(i) //索引
                                    };
                                }

                            }
                        }
                    } else if (zoomType == "y") {
                        //复杂数据 data 的 元素为 object
                        if (defineKeyX && defineKeyY && S.isPlainObject(state._datas['total'][0]['data'][0])) {
                            for (var i in self._pointsY) {
                                if (data[j] && opts.yAxis.text[i] == data[j][defineKeyX]) {
                                    points[i] = {
                                        x: self.data2Grapic(data[j][defineKeyY], max, min, width, x), //横坐标
                                        y: self._pointsY[i].y, //纵坐标
                                        dataInfo: {
                                            y: data[j]
                                        }, //数据信息 暂时将series.data的数据 和 series下的数据 耦合
                                        index: Math.round(i) //索引
                                    };
                                    j++;
                                } else {
                                    points[i] = {
                                        y: self._pointsY[i].y, //纵坐标
                                        index: Math.round(i) //索引
                                    };
                                }
                            }
                            //简单数据 data 的元素为 number 类型
                        } else {
                            for (var i in self._pointsY) {
                                points[i] = {
                                    x: self.data2Grapic(data[i], max, min, width, x), //横坐标
                                    y: self._pointsY[i].y, //纵坐标
                                    dataInfo: {
                                        y: data[i],
                                        x: opts.yAxis['text'][i]
                                    }, //数据信息
                                    index: Math.round(i) //索引
                                };
                            }
                        }
                    } else if (zoomType == "xy") {
                        var xs = self._data2GrapicData(self.getArrayByKey(series.data, 0)),
                            ys = self._data2GrapicData(self.getArrayByKey(series.data, 1), true, true);
                        for (var i in series.data) {
                            points[i] = {
                                x: xs[i], //横坐标
                                y: ys[i], //纵坐标
                                dataInfo: {
                                    y: data[i]
                                }, //数据信息
                                index: Math.round(i) //索引
                            };
                        }
                    }
                    return points;
                };

                if (zoomType == "x") {
                    for (var i in coordPos) {
                        self._pointsY[i] = {
                            number: coordNum[i] + "",
                            y: coordPos[i],
                            x: x
                        };
                    }
                    try {
                        self._gridPoints = self.getSplitPoints(x, y + height, x + width, y + height, opts.xAxis.text.length, true);
                        self._pointsX = self.getCenterPoints(self._gridPoints);
                    } catch (e) {
                        throw new Error("未配置正确的xAxis.text数组");
                    }
                } else if (zoomType == "y") {
                    for (var i in coordPosX) {
                        self._pointsX[i] = {
                            number: coordNumX[i] + "",
                            y: y + height,
                            x: coordPosX[i]
                        };
                    }
                    try {
                        self._pointsY = self.getSplitPoints(x, y, x, y + height, opts.yAxis.text.length + 1);
                    } catch (e) {
                        throw new Error("未配置正确的yAxis.text数组");
                    }
                } else if (zoomType == "xy") {
                    for (var i in coordPosX) {
                        self._pointsY[i] = {
                            number: coordNumX[i] + "",
                            y: coordPosX[i],
                            x: x
                        };
                    }
                    for (var i in coordPos) {
                        self._pointsX[i] = {
                            number: coordNum[i] + "",
                            y: y + height,
                            x: coordPos[i]
                        };
                    }
                }
                for (var i in state._datas['cur']) {
                    state._points[i] = getDataPoints(state._datas['cur'][i]['data'], i, curCoordNum);
                }
            },
            //获取刻度
            _getScales: function(allDatas, axis) {
                var self = this;
                //若直接配置了text 则按照text返回
                if (axis.text && $.isArray(axis.text)) {
                    return axis.text;
                } else {
                    var cmax = axis.max/1,
                        cmin = axis.min/1,
                        num = axis.num || 5,
                        _max = Math.max.apply(null, allDatas),
                        _min = Math.min.apply(null, allDatas);
                    isNagitive = _max <= 0 ? 1 : 0;
                    isPositive = _min >= 0 ? 1 : 0;
                    //纵轴上下各有10%的延展
                    var offset = (_max - _min) * 0.1;
                    //修复最大值最小值的问题  bug
                    var max = (cmax || cmax == 0) ? (cmax >= _max ? cmax : _max + offset) : _max + offset;
                    var min = (cmin || cmin == 0) ? (cmin <= _min ? cmin : _min - offset) : _min - offset;
                    return getScales(max, min, num);
                }
                
                /**
                 * TODO 坐标刻度计算
                 * @return {Array}
                 */
                function getScales(cormax, cormin, cornum) {
                    var corstep,
                        tmpstep,
                        tmpnum,
                        tmp, //幂
                        step,
                        extranum,
                        min,
                        max,
                        middle,
                        log = Math.log,
                        pow = Math.pow,
                        ary = [],
                        fixlen = 0;
    
                    if (cormax <= cormin) return;
                    //获取间隔宽度
                    corstep = (cormax - cormin) / cornum;
                    tmp = Math.floor(log(corstep) / log(10)) + 1;
                    tmpstep = corstep / pow(10, tmp);
                    if (tmpstep > 0 && tmpstep <= 0.1) {
                        tmpstep = 0.1;
                    } else if (tmpstep > 0.1 && tmpstep <= 0.2) {
                        tmpstep = 0.2;
                    } else if (tmpstep > 0.2 && tmpstep <= 0.25) {
                        tmpstep = 0.25;
                    } else if (tmpstep > 0.25 && tmpstep <= 0.5) {
                        tmpstep = 0.5;
                    } else {
                        tmpstep = 1;
                    }
                    step = tmpstep * pow(10, tmp);
                    middle = (cormax + cormin) / 2 - ((cormax + cormin) / 2) % step;
                    min = max = middle;
                    while (min > cormin) {
                        min -= step;
                    }
                    while (max < cormax) {
                        max += step;
                    }
                    if (self.isFloat(step)) {
                        var stepstr = (step + "");
                        if (stepstr.indexOf(".") > -1) {
                            fixlen = stepstr.split(".")[1]['length'] > 4 ? 4 : stepstr.split(".")[1]['length'];
                        }
                    }
                    for (var i = min; i <= max; i += step) {
                        ary.push(parseFloat(i).toFixed(fixlen));
                    }
                    // 过滤数据 如果全部为正 则删除负值 若全部为负 则删除正数
                    if (isNagitive) {
                        for (i in ary) {
                            ary[i] > 0 && ary.splice(i, 1)
                        }
                    } else if (isPositive) {
                        for (i in ary) {
                            ary[i] < 0 && ary.splice(i, 1)
                        }
                    }

                    return ary;
                }
            },
            /*
                TODO 将实际数值转化为图上的值
                @param data {Array|Number} 实际数值
                @param isY  {Boolean} 可选，是否是纵向的(默认值：false)
                @param nagitive 可选，是否是反向的(默认值：false)
            */
            _data2GrapicData: function(data, isY, nagitive) {
                if (undefined === data) return;
                var self = this,
                    state = this.state,
                    opts = state.options,
                    ictn = state.innerContainerOpts,
                    margin = isY ? ictn.x : ictn.y,
                    height = ictn.height,
                    width = ictn.width,
                    zoomType = opts.zoomType,
                    dist,
                    //坐标刻度的最大值
                    max = isY ? Math.max.apply(null, state.coordNumX) : Math.max.apply(null, state.coordNum),
                    min = isY ? Math.min.apply(null, state.coordNumX) : Math.min.apply(null, state.coordNum),
                    tmp = [];
    
                if (zoomType == "xy") {
                    dist = isY ? height : width;
                } else if (zoomType == "x") {
                    dist = height;
                } else if (zoomType == "y") {
                    dist = width;
                }
    
                //如果是数组
                if ($.isArray(data)) {
                    for (var i in data) {
                        tmp.push(self.data2Grapic(data[i], max, min, dist, margin, nagitive));
                    }
                    return tmp;
                } else {
                    return self.data2Grapic(data, max, min, dist, margin, nagitive);
                }
            }
        },
        public : {
            _init : function() {
                var state = this.state,
                    opts = state.options,
                    self = this,
                    series;
                
                this.$element.css({
                    "-webkit-text-size-adjust": "none", //chrome最小字体限制
                    "-webkit-tap-highlight-color": "rgba(0,0,0,0)" //去除touch时的闪烁背景
                });

                //构建内部容器
                this._createContainer();
                
                $.extend(state, {
                    _datas: {
                        cur: {},
                        total: {}
                    },
                    _points: {},
                    _centerPoints: [],
                    _pointsX: [],
                    _pointsY: [],
                    _gridsX: [],
                    _gridsY: [],
                    _areas: [],
                    _axisX: null,
                    _axisY: null,
                    _labelX: [],
                    _labelY: [],
                    _evtEls: [],
                    _gridPoints: [], //存放网格线
                    _multiple: false,
                    stackable: false
                });
                
                series = state.series = opts.series || null;
                
                if(!series || series.length <=0 || !series[0].data) return;
                state._multiple = (series.length > 1);
                $.each(series, function(i, serie){
                    state._datas['total'][i] = {
                        index : i,
                        data : series[i].data
                    };
                    state._datas['cur'][i] = {
                        index : i,
                        data : series[i].data
                    };
                });

                this._dataFormat();
                //this.onResize();
            },
            //获取内部容器
            getInnerContainer: function() {
                var state = this.state;
                return state.innerContainerOpts;
            },
            getAllDatas: function() {
                var state = this.state,
                    opts = state.options,
                    self = this,
                    allDatas = [],
                    zoomType = opts.zoomType,
                    numbers,
                    arg = arguments[0],
                    dataType = self.getDataType();
                if (opts.stackable) {
                    //堆叠图 需要叠加多组数据 进行计算
                    for (var i in state._datas['cur']) {
                        if (dataType == "object" && opts.defineKey.y && opts.defineKey.x) {
                            numbers = self.getArrayByKey(state._datas['cur'][i]['data'], opts.defineKey.y);
                        } else if (S.isArray(state._datas['cur'][i]['data'])) {
                            numbers = state._datas['cur'][i]['data'];
                        }
                        for (var j in numbers) {
                            //fixed number bug
                            allDatas[j] = allDatas[j] ? (numbers[j] - 0) + (allDatas[j] - 0) : numbers[j];
                        }
                    }
                } else {
                    for (var i in state._datas['cur']) {
                        if (dataType == "object" && opts.defineKey.y && opts.defineKey.x) {
                            numbers = self.getArrayByKey(state._datas['cur'][i]['data'], opts.defineKey.y);
                        } else if ($.isArray(state._datas['cur'][i]['data'])) {
                            if (zoomType == "xy") {
                                numbers = self.getArrayByKey(state._datas['cur'][i]['data'], arg)
                            } else {
                                numbers = state._datas['cur'][i]['data'];
                            }
                        }
                        allDatas.push(numbers.join(","));
                    }
                }
                return allDatas.length ? allDatas.join(",").split(",") : [];
            },
            getDataType: function() {
                var self = this,
                    state = self.state;
                if (!state._datas['total'][0] || !state._datas['total'][0]['data']) return;
                for (var i in state._datas['total'][0]['data']) {
                    if ($.isPlainObject(state._datas['total'][0]['data'][i])) {
                        return "object";
                    } else if ($.isNumeric(state._datas['total'][0]['data'][i] - 0)) {
                        return "number";
                    }
                }
            },
            isFloat: function(num) {
                return /^([+-]?)\d*\.\d+$/.test(num);
            },
            /*
                TODO 数据翻转偏移 至画布
                @param data {Integer|Float}数据
                @param max {Integer|Float}坐标最大值
                @param min {Integer|Float}坐标最小值
                @param dist {Integer|Float}画布上的总长度
                @param offset {Integer|Float}偏移量
                @param nagitive {Boolean}是否反向
            */
            data2Grapic: function(data, max, min, dist, offset, nagitive) {
                //反向
                if (max - min <= 0) return;
                if (nagitive) {
                    return dist * (1 - (data - min) / (max - min)) + offset;
                } else {
                    return dist * (data - min) / (max - min) + offset;
                }
            },
            /*
                TODO 获取一条线上的等分点坐标
                @param sx {Integer|Float}起点横坐标
                @param sy {Integer|Float}起点纵坐标
                @param ex {Integer|Float}终点横坐标
                @param ey {Integer|Float}终点纵坐标
                @param num {Integer}等分数
                @param e {Boolean}是否包含两端坐标
                @return {Array}
            */
            getSplitPoints: function(sx, sy, ex, ey, num, e) {
    
                var ox = (ex - sx) / num,
                    oy = (ey - sy) / num,
                    array = [];
    
                e && array.push({
                    x: sx,
                    y: sy
                });
    
                for (var i = 0; i < num - 1; i++) {
    
                    array.push({
                        x: sx + (i + 1) * ox,
                        y: sy + (i + 1) * oy
                    });
    
                }
    
                e && array.push({
                    x: ex,
                    y: ey
                });
                return array;
    
            },
            /**
                TODO 获取中心点
                @return {Array}
            **/
            getCenterPoints: function(p) {
                var self = this,
                    ary = [],
                    len = p.length;
                if (len > 1) {
                    for (var i = 0; i < len - 1; i++) {
                        ary[i] = {
                            x: (p[i]['x'] + p[i + 1]['x']) / 2,
                            y: (p[i]['y'] + p[i + 1]['y']) / 2
                        };
                    }
                }
                return ary;
            }
        }
    });
    
    return BaseChart;
})