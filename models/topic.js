module.exports = {
  "id": {
    "type": "int(11)",
    "allowNull": false,
    autoIncrement: true,
    "primaryKey": true,
    "comment": null
  },
  "title": {
    "type": "varchar(300)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "content": {
    "type": "text",
    "allowNull": false,
    "defaultValue": "",
    "primaryKey": false,
    "comment": null
  },
  "fid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "ftype_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "author_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "author_nick": {
    "type": "varchar(50)",
    "allowNull": false,
    "defaultValue": "",
    "primaryKey": false,
    "comment": null
  },
  "author_pic": {
    "type": "varchar(50)",
    "allowNull": false,
    "defaultValue": "",
    "primaryKey": false,
    "comment": null
  },
  "top": {
    "type": "tinyint(4)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "reply_count": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "visit_count": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "collect_count": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "create_time": {
    "type": "datetime",
    "allowNull": false,
    "defaultValue": "",
    "primaryKey": false,
    "comment": null
  },
  "update_time": {
    "type": "datetime",
    "allowNull": false,
    "defaultValue": "",
    "primaryKey": false,
    "comment": null
  },
  "last_reply": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "last_reply_user_id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "last_reply_user_nick": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "last_reply_time": {
    "type": "datetime",
    "allowNull": false,
    "defaultValue": "",
    "primaryKey": false,
    "comment": null
  },
  "is_hot": {
    "type": "tinyint(4)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "zan_count": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  }
}