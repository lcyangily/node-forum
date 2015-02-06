var _ = require('lodash');
var async  = require('async');

var CleanBooking = new BaseModel('clean_booking');

exports.add = function (booking, cb){
    booking.status = 0;
    CleanBooking.add(booking).done(function(err, bk){
        cb && cb(err, bk);
    });
}

exports.chgStatus = function(bid, value, user, callback){
    var self = this;
    if(!user || user.is_admin != 1) {
        return callback && callback('只有管理员才能操作！');
    }
    async.waterfall([
        function(cb){
            CleanBooking.findById(bid).done(function(error, booking) {
                if(!booking || booking.status == 3) return cb('预约信息不存在或已结束！');
                cb(error, booking);
            });
        },
        function(booking, cb){

            if(booking.status == value){
                return cb('已经更改，请勿重复操作！');
            } else {
                Topic.clean().update({
                    status : value
                }).where({
                    id : bid
                }).done(cb);
            }
        }
    ], callback);
}

exports.start = function(tid, user, callback){
    this.chgStatus(tid, 1, user, callback);
}

exports.cancel = function(bid, user, callback){
    this.chgStatus(tid, 2, user, callback);
}

exports.complete = function(bid, user, callback){
    this.chgStatus(tid, 3, user, callback);
}