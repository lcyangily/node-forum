var Sequelize = require("sequelize");
module.exports = {
  "id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": null,
    "comment": null,
    "primaryKey": true,
    "autoIncrement": true
  },
  "name": {
    "type": "varchar(255)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "名称"
  },
  "img": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "图片"
  },
  "desc": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "描述"
  },
  "phone": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "电话，多个用逗号隔开"
  },
  "type": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "类型(外卖/超市/...)"
  },
  "fid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "论坛ID,预留，可能商铺开通了论坛模块"
  },
  "addr": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "地址"
  },
  "tid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "对应的主题模块，可能发布了主题，描述详细信息"
  },
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "用户ID"
  },
  "arg0": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "通用字段"
  },
  "arg1": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg2": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg3": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg4": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg5": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg6": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg7": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg8": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg9": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "arg10": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  }
}