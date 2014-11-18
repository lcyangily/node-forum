define(['jquery'], function($){
    $(document).ajaxError(function(e, xhr, o){
        if(xhr && xhr.responseText == '__requiredLogin-noLogin') {
            alert('尚未登录，请先登录！');
        }
    });
});