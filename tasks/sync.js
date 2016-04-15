//require('../rabbit/BaseInit.js');
var moment = require('moment');
var commparaSvc = loadService('commpara');
var spiderSvc = loadService('spider');

function sync(){
    spiderSvc.getAllSource(function(err, list){
        _.each(list, function(item){

            var now = moment().add(-15, 'm');
            var begin = moment().startOf('day');
            var end = moment().endOf('day');

            //每天只要同步到一次有数据，则今天不再同步
            if(item.param_20) {
                var sysTime = moment(item.param_20, 'YYYY-MM-DD HH:mm:ss');
                if(begin.isBefore(sysTime)){
                    console.log('今天已同步数据，不再同步!');
                    return;
                }
            }

            //距离上次同步检查时间不能小于15分钟。
            if(item.update_time){
                var ut = moment(item.update_time);
                if(now.isBefore(ut)) {
                    console.log('距离上次同步检查时间不能小于15分钟!');
                    return;
                }
            }

            spiderSvc.syncToday(item.param_code, function(){
                console.log('check ' + item.param_code + ' success!');
            });
        });
    });
}

module.exports = sync;