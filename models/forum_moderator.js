var Sequelize = require("sequelize");
module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "会员ID",
    "primaryKey": true
  },
  "fid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "论坛ID",
    "primaryKey": true
  },
  "displayorder": {
    "type": "tinyint(3)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "显示顺序"
  },
  "inherited": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否继承"
  }
}