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
  "loginname": {
    "type": "varchar(50)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "登录名"
  },
  "password": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "nickname": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "昵称"
  },
  "avatar": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "头像"
  },
  "weibo_id": {
    "type": "bigint(20)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "weibo_token": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "weibo_refresh": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "weibo_name": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "is_block": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "score": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  },
  "update_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "is_admin": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "level": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  }
}