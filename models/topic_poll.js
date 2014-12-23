var Sequelize = require("sequelize");
module.exports = {
  "tid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "主题ID",
    "primaryKey": true
  },
  "overt": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否公开投票参与人"
  },
  "multiple": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否多选"
  },
  "visible": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否投票后可见"
  },
  "maxchoices": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "最大可选项数"
  },
  "expiration": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": "过期时间"
  },
  "voters": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": 0,
    "comment": "投票人数"
  }
}