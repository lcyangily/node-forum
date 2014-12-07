var Sequelize, config, path, sequelize;
config = require('./../config.js');
path = require('path');
modelRelation = require('../models/model_relation');
_ = require('lodash');

global.dbModels = {};

global.loadService = function(functionName) {
    return require(path.join(config.base_path, 'services', functionName + config.script_ext));
};

global.loadFilter = function(functionName) {
    return require(path.join(config.base_path, config.rainbow.filters, functionName + config.script_ext));
}
global.loadFilters = function(filters) {
    var f = [];
    if(!filters) {
        return f;
    }
    if(_.isString(filters)) {
        filters = [filters];
    }

    filters.forEach(function(filter_path) {
        f.push(loadFilter(filter_path));
    });

    return f;
}

/**
 * 初始化sequelize,通常为mysql。
 */
if (config.mysql_config) {
    Sequelize = require('sequelize');
    global.sequelize = sequelize = new Sequelize(config.mysql_config.database, config.mysql_config.username, config.mysql_config.password, {
        define: {
            underscored: false,
            freezeTableName: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: false
        },
        host: config.mysql_config.host,
        maxConcurrentQueries: 120,
        logging: true
    });
    console.log('mysql尝试连接')
} else {
    console.log('mysql没有配置，不能使用sql的功能')
}
//全局的针对SQL的BaseModel
global.loadModel = function(modelName) {
    if(dbModels[modelName]) {
        return dbModels[modelName];
    }
    var obj;
    var model_config = require(path.join(config.base_path, 'models', modelName + config.script_ext));
    var options = {

    }
    if (model_config.tableName) {
        options.tableName = model_config.tableName;
        delete model_config.tableName
    }
    if (!sequelize) {
        throw new Error("请配置mysql数据库，")
    }
//console.log('define model : ' + modelName);
    obj = sequelize.define(modelName.replace(/\/|\\/g, '_'), model_config, options);
    obj.db_type = 'sql';
    obj.table_name = modelName;
    dbModels[modelName] = obj;

    //初始化关系
    if(modelRelation && modelRelation[modelName]) {
        var r = modelRelation[modelName];
        if(r && r.length) {
            for(var i = 0; i < r.length; i++) {
                var rela = r[i];
                if(rela.relation && _.isFunction(obj[rela.relation]) && rela.modelName) {
                    var m = loadModel(rela.modelName);
                    if(m) {
                        obj[rela.relation](m, rela.params);
                        console.log('----------------> ' + modelName + ' - ' + rela.relation + ' - ' + m.tableName);
                    }
                }
            }
        }
    }

    return obj;
};

/**
 * 初始化mongodb，基于mongoose
 */
if (config.mongo_config) {
    mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    mongoose.connect('mongodb://' + config.mongo_config.user + ':' + config.mongo_config.pass + '@' + config.mongo_config.host + ':' + config.mongo_config.port + '/' + config.mongo_config.database, config.mongo_config);
    console.log('mongodb尝试链接')
} else {
    console.log('mongodb没有配置，不能使用mongodb的功能');
}
//全局的针对mongoose的BaseMongoModel
//
global.loadMongoModel = function(modelName) {
    var MongoModel = mongoose.model(modelName.replace(/\//g, '_'), new Schema(require(path.join(config.base_path, 'models', modelName + config.script_ext))));
    MongoModel.db_type = 'mongo';
    return MongoModel
}


//全局的BaseModel，预置了对orm的顶层封装。
global.BaseModel = require('./BaseModel.js');