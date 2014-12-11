var Sequelize = require("sequelize");
module.exports = {
  "feedid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": null,
    "comment": null,
    "primaryKey": true,
    "autoIncrement": true
  },
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "被关注者ID"
  },
  "username": {
    "type": "varchar(200)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "被关注用户名"
  },
  "tid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "帖子tid"
  },
  "note": {
    "type": "text",
    "allowNull": true,
    "defaultValue": null,
    "comment": "转发理由"
  },
  "dateline": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  }
}