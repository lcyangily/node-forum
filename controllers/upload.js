var _      = require('lodash');
var userSvc  = loadService('user');
var config   = require('../config');
var fs = require('fs');

module.exports = {
    '/upload' : {
        post : {
            filters : ['checkLogin'],
            controller : function(req, res, next){
                var finfo = req.files.upload;
                var origName= finfo.originalFilename;
                var extName = origName.substring(origName.lastIndexOf('.'));
                var tmpPath = finfo.path;
                var newName = new Date().getTime() + extName;
                var newPath = config.base_path + '/uploads/' + newName;
                var webPath = '/uploads/' + newName;
                var callback= req.query.CKEditorFuncNum;

                if(tmpPath) {
                    var ret = '<script type="text/javascript">'+
                                'window.parent.CKEDITOR.tools.callFunction('+callback+', "' +
                                    webPath +
                                '", "");' +
                            '</script>';
                    fs.rename(tmpPath, newPath, function(err){
                        if(err) {
                            return res.send(501, 'upload error : ' + err);
                        }
                        res.send(200, ret);
                    });
                }
            }
        }
    }
}