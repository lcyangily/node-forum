var Sequelize = require("sequelize");
module.exports = {
  "poid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": null,
    "comment": "选项id",
    "primaryKey": true,
    "autoIncrement": true
  },
  "tid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "主题id"
  },
  "voters": {
    "type": "mediumint(9)",
    "allowNull": true,
    "defaultValue": 0,
    "comment": "票数"
  },
  "displayorder": {
    "type": "tinyint(3)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "显示顺序"
  },
  "option": {
    "type": "varchar(80)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "选项内容"
  }
}