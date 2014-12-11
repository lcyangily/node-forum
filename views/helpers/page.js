var fs = require('fs');
var Handlebars = require('handlebars');

Handlebars.registerHelper("page", function(){
    var options = arguments[arguments.length - 1];
    var baseUrl = (arguments.length > 1 ? arguments[0] : null) || options.hash.baseUrl || '',
        current = (options.hash.current || 1)*1,
        showNum = (options.hash.showNum || 10)*1,
        pageSize= options.hash.pageSize || 20,
        totalPages   = options.hash.totalPages,
        totalRecords = options.hash.totalRecords,
        type = options.hash.type,
        pageVar = options.pageVar || 'page',
        pageSizeVar = options.pageSizeVar || "pageSize",
        base = baseUrl + (baseUrl.indexOf('?') < 0 ? '?' : '&') 
                       + (options.hash.pageSize ? (pageSizeVar + '=' + pageSize + '&') : '')
                       + pageVar + '=';

    if(!totalPages) {
        if(!totalRecords || !pageSize) {
            return new Handlebars.SafeString("");
        } else {
            totalPages = Math.ceil(totalRecords / pageSize);
        }
    }

    var pageShowMax = showNum % 2 == 0 ? current - 1 : current;
    var pageShowMin = current;

    if(type === 'min') {
        pageShowMax = current - 1;
        showNum = 0;
    }
    for(var i = 0; i < Math.floor(showNum/2); i++) {
        pageShowMax++;
        pageShowMin--;
        if(pageShowMax > totalPages) {
            pageShowMax = totalPages;
            if(pageShowMin > 1) {
                pageShowMin--;
            }
        }
        if(pageShowMin < 1) {
            pageShowMin = 1;
            if(pageShowMax < totalPages) {
                pageShowMax++;
            }
        }
    }

    var ret = '<ul class="pagination">';
    if(current > 1) {
        ret += '<li><a href="'+ base + '1">«</a></li>';
    } else {
        ret += '<li class="disabled"><a>«</a></li>';
    }
    
    for(var i = pageShowMin; i <= pageShowMax; i++) {
        if (i == current) {
            ret += '<li class="disabled"><a>' + i + '</a></li>';
        } else {
            ret += '<li><a href="' + base + i + '">' + i + '</a></li>';
        }
    }
    
    if (current >= totalPages) {
        ret += '<li class="disabled"><a>»</a></li>';
    } else {
        ret += '<li><a href="' + base + (current + 1) + '">»</a></li>';
    }

    if(options.fn) {
        ret += options.fn(options.context);
    }
    ret += '</ul>';
    return new Handlebars.SafeString(ret);
});

exports = Handlebars;