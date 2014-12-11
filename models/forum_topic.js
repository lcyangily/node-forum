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
  "title": {
    "type": "varchar(300)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "content": {
    "type": "text",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "fid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "ftype_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "author_id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "author_nick": {
    "type": "varchar(50)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "author_pic": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "top": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "reply_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "visit_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "collect_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
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
  "last_reply": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "last_reply_user_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "last_reply_user_nick": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "last_reply_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "is_hot": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "zan_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  }
}