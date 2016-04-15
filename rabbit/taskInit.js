var CronJob = require('cron').CronJob;
var path = require("path");
var child_process = require('child_process');
var config = require("./../config.js");
require('./BaseInit.js')

var createTask = function(cron, file) {
    try {
console.log('init task cron : ' + cron + '; file : ' + file);
        var job = new CronJob(cron, function() {
            //child_process.fork(file);
            var fn = require(file);
            fn();
        });
        job.start();
    } catch(ex) {
        console.log("cron pattern not valid : " + cron);
    }
}

setTimeout(function() {
    var tasks = require("../tasks/task.js");
    for (var cron in tasks) {
        var file = path.join(config.base_path, "tasks", tasks[cron]);
        createTask(cron, file);
    }
}, 1000)