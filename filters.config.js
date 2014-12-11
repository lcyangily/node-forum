/**
 * 这里是全局的filter配置，用正则表达式做key，只要符合正则的请求，都会经过配置的filter
 *
 * @type {Object}
 */
module.exports = {
    filters : {
        /*'/*': {
            get: ['autoLogin', 'beforeTest']
        },*/
        '/*' : ['autoLogin', 'pathvar'],
        '/mgr*' : ['checkAdmin'],
        '/home*' : ['checkLogin'],
        '/friend*' : ['checkLogin'],
        '/follow*' : ['checkLogin']
    },
    afterFilters : {
        '/*': {
            get: ['afterTest']
        }
    }
}