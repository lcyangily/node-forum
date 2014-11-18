/**   
 * @Title: jQuery+.js 
 * @Description: jquery和jquery plugin打包
 * @author liuchuanyang
 * @email  lcyangily@gmail.com
 * @date 2013-8-1 下午8:17:48 
 * @version V1.0   
 */
define(function(require, exports, module){
    
    //console.info(require.toUrl('./jquery/jquery-1.8.3'));
    var $ = require('jquery');

    //jquery plugins or enhance
    require('jquery.easing');
    require('jquery.enhance');
    require('jquery.position');
    //require('jquery.resizable');
    require('jquery.resize');
    require('jquery.event.drag');

    return $;
});