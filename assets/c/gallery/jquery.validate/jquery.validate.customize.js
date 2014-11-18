/**
 * $ Validation 自定义校验
 */
(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        define( ["jquery", "jquery.validate.core", "jquery.validate.i18n.zh"], factory );
    } else {
        factory( jQuery );
    }
}(function( $ ) {
    // 身份证号码校验
    $.validator.addMethod("cid", function(value, element) {
        return this.optional(element) || checkCID(value);
    }, "请输入合法的身份证号码！");
    
    // IP验证
    $.validator.addMethod("ip", function(value, element) {
        return this.optional(element)
                || (/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.test(value) && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256));
    }, "请输入正确的IP地址");
    
    // 电话号码校验，如下格式均合法：400-823-823， 95555,025-88888888,18857107619
    $.validator.addMethod("phone", function(value, element) {
        return this.optional(element) || (value.length > 4 && (/^([0-9]{1,9}(\-)?)?([0-9]{1,9}){1}(\-[0-9]{1,9})?$/.test(value)));
    }, "请输入正确的电话号码！");
    
    // 手机号码校验，目前手机号段：13X、147、15X、170、18X
    $.validator.addMethod("mobile", function(value, element) {
        return this.optional(element) || (/^1[3|4|5|7|8][0-9]{9}$/.test(value));
    }, "请输入正确的手机号码！");
    
    $.validator.addMethod("price", function(value, element) {
        return this.optional(element) || /^\d+(?:\.\d{1,2})?$/.test(value);
    }, "请输入有效的价格，最多两位小数！");
    
    $.validator.addMethod("fixlength", function(value, element, param) {
        var length = $.isArray( value ) ? value.length : this.getLength( $.trim( value ), element );
        return this.optional( element ) || length == param;
    }, $.validator.format( "只能 {0} 位！" ));
    
    /** 身份证校验 * */
    function checkCID(cidValue) {
        var CheckIdCard = {
            // Wi 加权因子 Xi 余数0~10对应的校验码 Pi省份代码
            Wi : [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ],
            Xi : [ 1, 0, "X", 9, 8, 7, 6, 5, 4, 3, 2 ],
            Pi : [ 11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 61, 62, 63, 64, 65, 71, 81,
                    82, 91 ],
    
            // 检验18位身份证号码出生日期是否有效
            // parseFloat过滤前导零，年份必需大于等于1900且小于等于当前年份，用Date()对象判断日期是否有效。
            brithday18 : function(sIdCard) {
                var year = parseFloat(sIdCard.substr(6, 4));
                var month = parseFloat(sIdCard.substr(10, 2));
                var day = parseFloat(sIdCard.substr(12, 2));
                var checkDay = new Date(year, month - 1, day);
                var nowDay = new Date();
                if (1900 <= year && year <= nowDay.getFullYear() && month == (checkDay.getMonth() + 1) && day == checkDay.getDate()) {
                    return true;
                }
            },
    
            // 检验15位身份证号码出生日期是否有效
            brithday15 : function(sIdCard) {
                var year = parseFloat(sIdCard.substr(6, 2));
                var month = parseFloat(sIdCard.substr(8, 2));
                var day = parseFloat(sIdCard.substr(10, 2));
                var checkDay = new Date(year, month - 1, day);
                if (month == (checkDay.getMonth() + 1) && day == checkDay.getDate()) {
                    return true;
                }
            },
    
            // 检验校验码是否有效
            validate : function(sIdCard) {
                var aIdCard = sIdCard.split("");
                var sum = 0;
                for (var i = 0; i < CheckIdCard.Wi.length; i++) {
                    sum += CheckIdCard.Wi[i] * aIdCard[i]; // 线性加权求和
                }
                ;
                var index = sum % 11;// 求模，可能为0~10,可求对应的校验码是否于身份证的校验码匹配
                if (CheckIdCard.Xi[index] == aIdCard[17].toUpperCase()) {
                    return true;
                }
            },
    
            // 检验输入的省份编码是否有效
            province : function(sIdCard) {
                var p2 = sIdCard.substr(0, 2);
                for (var i = 0; i < CheckIdCard.Pi.length; i++) {
                    if (CheckIdCard.Pi[i] == p2) {
                        return true;
                    }
                }
            }
        };
    
        // 判断是否全为18或15位数字，最后一位可以是大小写字母X
        if (cidValue.match(/^\d{14,17}(\d|X)$/gi) == null) {
            return false;
        }
    
        // 分15、18位计算
        if (cidValue.length == 18) {
            if (CheckIdCard.province(cidValue) && CheckIdCard.brithday18(cidValue) && CheckIdCard.validate(cidValue)) {
                return true;
            } else {
                return false;
            }
        } else if (cidValue.length == 15) {
            if (CheckIdCard.province(cidValue) && CheckIdCard.brithday15(cidValue)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    /**
     * 检查是否含有非法字符
     * 
     * @param temp_str
     * @returns {Boolean}
     */
    function is_forbid(temp_str) {
        temp_str = temp_str.replace(/(^\s*)|(\s*$)/g, "");
        temp_str = temp_str.replace('*', "@");
        temp_str = temp_str.replace('--', "@");
        temp_str = temp_str.replace('/', "@");
        temp_str = temp_str.replace('+', "@");
        temp_str = temp_str.replace('\'', "@");
        temp_str = temp_str.replace('\\', "@");
        temp_str = temp_str.replace('$', "@");
        temp_str = temp_str.replace('^', "@");
        temp_str = temp_str.replace('.', "@");
        temp_str = temp_str.replace(';', "@");
        temp_str = temp_str.replace('<', "@");
        temp_str = temp_str.replace('>', "@");
        temp_str = temp_str.replace('"', "@");
        temp_str = temp_str.replace('=', "@");
        temp_str = temp_str.replace('{', "@");
        temp_str = temp_str.replace('}', "@");
        var forbid_str = new String('@,%,~,&');
        var forbid_array = new Array();
        forbid_array = forbid_str.split(',');
        for (i = 0; i < forbid_array.length; i++) {
            if (temp_str.search(new RegExp(forbid_array[i])) != -1)
                return true;
        }
        return false;
    }
    
    // 开始时间和结束时间校验
    $.validator.addMethod("compareDate", function(value, element) {
        return this.optional(element) || compareDate(element);
    }, "结束时间必须大于开始时间！");
    
    function compareDate(element) {
        if ($(element).attr("data-start-date")) {
            var endDate = $(element).val();
            var startDate = $("#" + $(element).attr("data-start-date")).val();
            if (startDate != "" && endDate < startDate) {
                return false;
            }
        } else if ($(element).attr("data-end-date")) {
            var startDate = $(element).val();
            var endDate = $("#" + $(element).attr("data-end-date")).val();
            if (endDate != "" && endDate < startDate) {
                return false;
            }
        }
        return true;
    }
}));