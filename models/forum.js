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
  "parent_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "type": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "1",
    "comment": "0-> 分组, 1-> 普通板块, 2->分类"
  },
  "name": {
    "type": "varchar(200)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "desc": {
    "type": "varchar(200)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "status": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "1",
    "comment": "0-隐藏, 1-正常"
  },
  "displayorder": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "显示顺序"
  },
  "topics": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "主题数量"
  },
  "posts": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "帖子数量(回复)"
  },
  "today_posts": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "今日帖子"
  },
  "yestoday_posts": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "昨日帖子"
  },
  "collect_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "收藏次数"
  },
  "last_reply": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "最后一帖"
  },
  "last_reply_user_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "last_reply_user_nick": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "last_reply_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "create_time": {
    "type": "datetime",
    "allowNull": false,
    "defaultValue": Sequelize.NOW,
    "comment": null
  },
  "pic": {
    "type": "varchar(200)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "图标"
  }
}