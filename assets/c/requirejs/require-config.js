requirejs.config({
    baseUrl : '../../js',
    map : {
        '*' : {
            'css' : 'requirejs/css'
        }
    },
    paths : {
        'handlebars'        : 'gallery/handlebars/handlebars',
        'hbs-helper.calc'   : 'gallery/handlebars/helper/calc',
        'hbs-helper.eq'     : 'gallery/handlebars/helper/eq',
        'hbs-helper.string' : 'gallery/handlebars/helper/string',
        'jquery'            : 'sib/core/1.0/jquery/jquery-1.8.3',
        //'jquery'          : '../p/base/jll-jquery', //让jquery依赖初始化js
        'jquery.cookie'           : 'gallery/jquery.cookie',
        'jquery.validate.core'    : 'gallery/jquery.validate/jquery.validate',
        'jquery.validate.i18n.zh' : 'gallery/jquery.validate/localization/messages_zh',
        'jquery.validate'         : 'gallery/jquery.validate/jquery.validate.customize',
        'jquery.blockUI'  : 'gallery/jquery.blockUI',
        'utils'           : 'common/utils',
        'cryptojs.core'   : 'gallery/cryptojs/core',
        'cryptojs.sha256' : 'gallery/cryptojs/sha256',
        'cryptojs.hmac'   : 'gallery/cryptojs/hmac',
        'init'            : '../p/base/init'
    },
    shim : {
        'handlebars' : {
            exports : 'Handlebars'
        },
        'cryptojs.core': {
            exports: "CryptoJS"
        },
        'cryptojs.hmac': {
            deps: ['cryptojs.core'],
            exports: "CryptoJS"
        },
        'cryptojs.sha256': {
            deps: ['cryptojs.hmac'],
            exports: "CryptoJS"
        }
    }
});