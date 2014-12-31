define(['jquery', 'sib.tip'], function($, Tip){
    $(document).ajaxError(function(e, xhr, o){
        if(xhr && xhr.responseText == '__requiredLogin-noLogin') {
            //alert('尚未登录，请先登录！');
            LBL.login();
        }
    });

    $(document).ready(function(){
        $('[data-tip-title]').each(function(){
            var $t = $(this);
            var cnt = $t.attr('data-tip-title');
            var pos = {
                my : 'center top',
                at : 'center bottom'
            };
            var p = $t.attr('data-tip-place') || 'b';
            
            switch(p) {
                case 't' :
                    pos = {
                        my : 'center bottom',
                        at : 'center top'
                    };
                    break;
                case 'b' : 
                    pos = {
                        my : 'center top',
                        at : 'center bottom'
                    };
                    break;
                case 'l' : 
                    pos = {
                        my : 'right center',
                        at : 'left center'
                    };
                    break;
                case 'r' : 
                    pos = {
                        my : 'left center',
                        at : 'right center'
                    };
                    break;
            }

            new Tip({
                trigger : $t,
                //content : cnt,
                content : function(){
                    return $t.attr('data-tip-title');
                },
                /*arrowWidth:10,*/
                theme : 'pure-tip',
                position : pos,
                showafter : function(evt, param){
                    param.popup.css('overflow', 'visible');//bootstrap导致显示style有 overflow:hidden，箭头看不到
                }
            });
        });
    });
});