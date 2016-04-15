var _ = require('lodash');
var async  = require('async');

var Commpara = new BaseModel('commpara');

exports.getByAttr = function (attr, cb){
    Commpara.findAll().where({
        sys_code : 'SYS',
        param_attr : attr
    }).done(function(err, datas){
        cb && cb(err, datas);
    });
}

exports.getByCode = function (code, cb){

    Commpara.findAll().where({
        sys_code : 'SYS',
        param_code : code
    }).done(function(err, datas){
        cb && cb(err, datas);
    });
}

exports.getByAttrCode = function (attr, code, cb){
    Commpara.findAll().where({
        sys_code : 'SYS',
        param_attr : attr,
        param_code : code
    }).done(function(err, datas){
        cb && cb(err, datas);
    });
}
