var _ = require('lodash');
var async  = require('async');

var User       = new BaseModel('users');
var LivingInfo = new BaseModel('living_info');


exports.joinRequest = function (linfo, cb){

    LivingInfo.add(linfo).done(function(err, li){
        cb && cb(err, li);
    });
}

exports.getByType = function(type, cb, page){
    LivingInfo.findAll().where({
        type : type,
        status : 0
    }).done(cb);
}

/** mgr **/
exports.getRequestList = function(cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    LivingInfo.findAll().where({
        status : 3
    }).include([
        User.Model
    ]).page(p).done(cb);
}

exports.getAuditedList = function(cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    LivingInfo.findAll().where({
        status : 0
    }).include([
        User.Model
    ]).page(p).done(cb);
}

exports.audit = function(id, cb){
    LivingInfo.find().where({
        id : id
    }).done(function(err, info){
        if(err || !info) return cb(!info ? '审核信息不存在!' : err);
        if(info.status != 3) {
            return cb('内容不是待审核状态！');
        }

        LivingInfo.clean().update({
            status : 0
        }).where({
            id : id
        }).done(function(error, num, rows){
            cb && cb(error, rows && rows[0]);
        });
    });
}