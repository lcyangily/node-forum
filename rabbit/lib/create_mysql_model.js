var config, connection, createTableInfo, database, fs, modelsPath, mysql, path, queuedo, result;

mysql = require('mysql');

queuedo = require('queuedo');

fs = require('fs');

path = require('path');

config = require('./../../config.js');

result = {};

database = config.mysql_config.database;

modelsPath = path.join(config.base_path, "models");

connection = mysql.createConnection({
    host: config.mysql_config.host,
    user: config.mysql_config.username,
    password: config.mysql_config.password
});

connection.connect();
console.log('------> database : ' + database);
connection.query('use ' + database + ';');

createTableInfo = function(tableName, callback) {
    return connection.query('show full columns from ' + tableName + ';', function(error, _results) {
        if (error) {
            throw error;
        } else {
            result[tableName] = {};
            _results.forEach(function(r) {
                //console.log('---> r obj : ' + JSON.stringify(r));
                var ret = {
                    type: r.Type,
                    allowNull: r.Null === "YES" ? true : false,
                    defaultValue: r.Default,
                    //primaryKey: r.Key === "PRI" ? true : false,
                    comment: r.Comment || null
                };
                if(r.Key === "PRI") {
                    ret.primaryKey = true;
                }
                if(r.Extra === "auto_increment") {
                    ret.autoIncrement = true;
                }
                return result[tableName][r.Field] = ret;
            });
            return callback();
        }
    });
};



//module.exports = function() {
    connection.query('show tables;', function(error, _results) {
        if (error) {
            throw error;
        } else {
            return queuedo(_results, function(cx, next, context) {
                var tableName;
                tableName = cx['Tables_in_' + database];
                return createTableInfo(tableName, function() {
                    return next.call(context);
                });
            }, function() {
                var cCount, table_name, targetPath;
                cCount = 0;
                var prefix = 'var Sequelize = require("sequelize");\nmodule.exports = ';
                for (table_name in result) {
                    targetPath = path.join(modelsPath, table_name + ".js");

                    fs.writeFileSync(targetPath, prefix + JSON.stringify(result[table_name], null, 2));
                    cCount++;
                    console.log('create model config success : ' + targetPath);
                }
                console.log('total models :' + cCount);
                return connection.end();
            });
        }
    });
//}