var Sequelize = require("sequelize");
module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "realname": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "实名"
  },
  "signature": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "个性签名"
  },
  "gender": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "性别 (0:保密 1:男 2:女)"
  },
  "birthyear": {
    "type": "smallint(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "出生年"
  },
  "birthmonth": {
    "type": "tinyint(3)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "birthday": {
    "type": "tinyint(3)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "constellation": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "zodiac": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "生肖(根据生日自动计算)"
  },
  "telephone": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "固定电话"
  },
  "mobile": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "手机"
  },
  "idcardtype": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "证件类型：身份证 护照 军官证等"
  },
  "idcard": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "证件号码"
  },
  "address": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "邮寄地址"
  },
  "qq": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "email": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "resideprovince": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": " 居住省份"
  },
  "residecity": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "居住城市"
  },
  "residecommunity": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "居住小区"
  },
  "company": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "公司"
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
  }
}