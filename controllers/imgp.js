var spiderSvc = loadService('spider');
var S = require('string');
var moment = require('moment');
var request = require('request');
var topicSvc = loadService('topic');
var commparaSvc = loadService('commpara');
var fs = require('fs');

module.exports = {  
    "/": {
        get : function(req, res, next){
            var url = req.query.s;
            //console.log('source url: ' + url);
            /*request(url, function(e, r, body){
                console.log('*********************************');
                //console.log('----> body : ' + body);
                return res.send(body).end();
            });*/
            request.get(url)
                .on('response', function(response){
                    //console.log(response.statusCode) // 200 
                    //console.log(response.headers['content-type']) // 'image/png' 
                })
                .pipe(res);
        }
    }
}   