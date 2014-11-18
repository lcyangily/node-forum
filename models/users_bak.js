module.exports = {
  "id": {
    "type": "int(11)",
    "allowNull": false,
    autoIncrement: true,
    "primaryKey": true,
    "comment": null
  },
  "loginname": {
    "type": "varchar(50)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "head_pic": {
    "type": "varchar(50)",
    "allowNull": false,
    "defaultValue": "0",
    "primaryKey": false,
    "comment": null
  },
  "name": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "location": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "email": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "signature": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "weibo_id": {
    "type": "bigint(20)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "weibo_token": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "weibo_refresh": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "weibo_name": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "is_block": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "score": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "topic_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "reply_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "follower_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "following_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "collect_tag_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "collect_topic_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "update_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "is_admin": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  },
  "level": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "primaryKey": false,
    "comment": null
  }
}