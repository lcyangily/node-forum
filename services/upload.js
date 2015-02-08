var _ = require('lodash');
var async  = require('async');
var qn = require('qn');
var config = require('../config');
var fs = require('fs');

exports.up2qn = function(tmpFile, param, callback){
    this.upload(tmpFile, 'qn', param, callback);
}

exports.up2local = function(tmpFile, type, param, callback){
    this.upload(tmpFile, 'local', param, callback);
}

/**
 *  param
 *    |- prefix //topic_
 *    |- max    //1024*4
 *    |- limit  //jpg,png,jpeg...
 *
 */
exports.upload = function(tmpFile, type, param, callback){

    if(!tmpFile) return callback && callback('上传文件不能为空！');

    var origName= tmpFile.originalFilename;
    var extName = origName.substring(origName.lastIndexOf('.'));
    var tmpPath = tmpFile.path;
    var newName = new Date().getTime() + extName;

    param = _.extend({}, config.upload.param, param);
    if(param && param.prefix) {
        newName = param.prefix + newName;
    }

    //上传内容为空，直接返回
    if(!tmpPath || tmpFile.size <= 0){
        return callback && callback();
    }

    if(param && param.max && param.max < tmpFile.size){
        return callback && callback('文件太大，超出最大('+param.max /(1024*1024) +' M)限制');
    }

    if(type === 'qn') {
        var client = qn.create(config.upload.qn);
        client.uploadFile(tmpPath, {key: newName}, function (err, result) {
console.log('------> ' + JSON.stringify(result));
            callback && callback(err, result && result.url, result);
            fs.unlink(tmpPath);
        });
    } else {
        var newPath = config.base_path + config.upload.path + newName;
        var webPath = config.upload.path + newName;

        fs.rename(tmpPath, newPath, function(err){
            if(err) {
                return callback('图片上传失败！:' + err);
            }
            callback(null, webPath);
            fs.unlink(tmpPath);
        });
    }
}