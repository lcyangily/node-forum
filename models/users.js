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
    "defaultValue": "0",
    "comment": null
  },
  "head_pic": {
    "type": "varchar(50)",
    "allowNull": false,
    "defaultValue": "0",
    "comment": null
  },
  "name": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "location": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "email": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "signature": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
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
  "topic_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "reply_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "follower_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "following_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "collect_tag_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "collect_topic_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
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