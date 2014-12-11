var Sequelize = require("sequelize");
module.exports = {
  "id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": null,
    "comment": "论坛ID",
    "primaryKey": true,
    "autoIncrement": true
  },
  "fid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "ftype_id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "tid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "主题ID"
  },
  "title": {
    "type": "varchar(300)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "标题"
  },
  "content": {
    "type": "text",
    "allowNull": false,
    "defaultValue": "",
    "comment": "内容"
  },
  "author_id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "作者"
  },
  "author_nick": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "作者昵称"
  },
  "author_pic": {
    "type": "varchar(200)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "作者头像"
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  },
  "author_ip": {
    "type": "varchar(15)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "发帖者IP"
  },
  "is_first": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否是首帖"
  },
  "invisible": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否通过审核, 0-可见，1-不可见"
  },
  "anonymous": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否匿名"
  },
  "signature": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否启用签名"
  },
  "rate": {
    "type": "smallint(6)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "评分份数"
  },
  "ratetimes": {
    "type": "tinyint(3)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "评分次数"
  },
  "replycredit": {
    "type": "int(10)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "回帖获得积分数"
  },
  "status": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "帖子状态"
  }
}