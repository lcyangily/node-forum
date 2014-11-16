var fs = require('fs');
var Handlebars = require('handlebars');

Handlebars.registerHelper("page", function(options){
    var baseUrl = options.hash.baseUrl,
        current = options.hash.current,
        showNum = options.hash.showNum,
        total   = options.hash.total,
        base = baseUrl + (baseUrl.indexOf('?') < 0 ) ? '?' : '&' + 'page=';

    var pageShowMax = showNum % 2 == 0 ? current - 1 : current;
    var pageShowMin = current;

    for(var i = 0; i < Math.floor(showNum/2); i++) {
        pageShowMax++;
        pageShowMin--;
        if(pageShowMax > total) {
            pageShowMax = total;
            if(pageShowMin > 1) {
                pageShowMin--;
            }
        }
        if(pageShowMin < 1) {
            pageShowMin = 1;
            if(pageShowMax < total) {
                pageShowMax++;
            }
        }
    }

    var ret = '<ul class="pagination">';
    if(pageShowMin <= 1) {
        ret += '<li class="disabled"><a>«</a></li>';
    } else {
        ret += '<li><a href="'+ base + '1">«</a></li>';
    }
    
    for(var i = pageShowMin; i <= pageShowMax; i++) {
        if (i == current) {
            ret += '<li class="disabled"><a>' + i + '</a></li>';
        } else {
            ret += '<li><a href="' + base + i + '">' + i + '</a></li>';
        }
    }
    
    if (pageShowMax >= total) {
        ret += '<li class="disabled"><a>»</a></li>';
    } else {
        ret += '<li><a href="' + base + total + '">»</a></li>';
    }

    ret += '</ul>';
    return new Handlebars.SafeString(ret);
});

exports = Handlebars;