define(['cryptojs.sha256'], function(CryptoJS){
    var emailReg = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var phoneReg = /^1[3|4|5|7|8][0-9]{9}$/;

    var Utils = {
        crypto : function( source ){
            source = CryptoJS.SHA256(source).toString();
            return CryptoJS.HmacSHA256(source, 'vipjll@517').toString();
        },
        valid : {
            isEmail : function(str){
                return emailReg.test(str);
            },
            isPhoneCN : function(str){
                return phoneReg.test(str);
            }
        }
    };

    return Utils;
});