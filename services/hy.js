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

exports.getAuditRequests = function(cb, page){
    var p = _.extend({page : 1, pageSize : 20}, page);
    LivingInfo.findAll().where({
        status : 3
    }).page(p).done(cb);
}