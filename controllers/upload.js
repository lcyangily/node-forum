var _      = require('lodash');
var userSvc  = loadService('user');
var uploadSvc  = loadService('upload');
var config   = require('../config');
var fs = require('fs');

module.exports = {
    '/upload' : {
        post : {
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var finfo = req.files.upload;
                var callback= req.query.CKEditorFuncNum;

                uploadSvc.up2qn(finfo, null, function(err, path){
                    if(err){
                        path = "";
                    }
                    var ret = '<script type="text/javascript">'+
                                'window.parent.CKEDITOR.tools.callFunction('+callback+', "'+path +'", "'+(err||'')+'");' +
                              '</script>';
                    res.send(200, ret);
                });
            }
        }
    }
}