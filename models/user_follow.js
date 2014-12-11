var Sequelize = require("sequelize");
module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "username": {
    "type": "varchar(300)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "用户名"
  },
  "follow_uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "被关注用户ID",
    "primaryKey": true
  },
  "follow_username": {
    "type": "varchar(300)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "remark": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "备注"
  },
  "status": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "0:正常 1:特殊关注 -1:不能再关注此人"
  },
  "mutual": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "0:单向 1:已互相关注"
  },
  "follow_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  }
}