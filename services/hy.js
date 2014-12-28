var _ = require('lodash');
var async  = require('async');

var User       = new BaseModel('users');
var LivingInfo = new BaseModel('living_info');


exports.joinRequest = function (linfo, cb){

    console.log('----> joinRequest linfo : ' + JSON.stringify(linfo));
    LivingInfo.add(linfo).done(function(err, li){
        cb && cb(err, li);
    });
}

exports.getByType = function(type, cb, page){
    LivingInfo.findAll().where({
        type : type
    }).done(cb);
}