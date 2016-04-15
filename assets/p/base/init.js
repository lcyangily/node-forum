define(['jquery', 'sib.tip', 'sib.lazyload'], function($, Tip, LazyLoad){
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
            var p = $t.attr('data-tip-place') || 't';
            
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

    new LazyLoad({
        target : '[data-sib-lazyload]',
        skipHidden : true
    });

    new LazyLoad({
        target : 'img[data-src]',
        attrName : 'data-src',
        skipHidden : true,
        render : function($el){
            var state = this.state,
                opts  = state.options,
                nodeName = $el[0].nodeName.toUpperCase();
            if (nodeName == "IMG") {
                var src = $el.attr(opts.attrName);
                $el.attr("src", '/imgp?s=' + src);
            }
        }
    });
});