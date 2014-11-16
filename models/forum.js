module.exports = {
  "id": {
    "type": "int(11)",
    "allowNull": false,
    autoIncrement: true,
    "primaryKey": true,
    "comment": null
  },
  "parent_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "type": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "1",
    "primaryKey": false,
    "comment": "0-> 分组, 1-> 普通板块, 2->分类"
  },
  "name": {
    "type": "varchar(200)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "desc": {
    "type": "varchar(200)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "status": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "1",
    "primaryKey": false,
    "comment": "0-隐藏, 1-正常"
  },
  "displayorder": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "显示顺序"
  },
  "topics": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "主题数量"
  },
  "posts": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "帖子数量(回复)"
  },
  "today_posts": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "今日帖子"
  },
  "yestoday_posts": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "昨日帖子"
  },
  "last_post": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": "最后一帖"
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "pic": {
    "type": "varchar(200)",
    "allowNull": true,
    "primaryKey": false,
    "comment": "图标"
  }
}