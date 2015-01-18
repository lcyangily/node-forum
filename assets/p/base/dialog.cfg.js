define(['jquery', 'sib.dialog.core'], function($, Dialog){
    
    Dialog.defaults.closeTpl = '<i class="iconfont">&#xe649;</i>';
    Dialog.tipDefault = {
        alert : {
            icon : '&#xe657;'
        },
        confirm : {
            icon : '&#xe64f;'
        },
        tip : {
            icon : '&#xe656;'
        }
    };
    return Dialog;
});