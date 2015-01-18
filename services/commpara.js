var _ = require('lodash');
var async  = require('async');

var Commpara = new BaseModel('commpara');


exports.getByCodeInBBS = function (code, cb){

    Commpara.findAll().where({
        sys_code : 'BBS',
        param_code : code
    }).done(function(err, datas){
        cb && cb(err, datas);
    });
}
