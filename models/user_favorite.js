var Sequelize = require("sequelize");
module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "type": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "收藏内容类型：1-版块，2-主题",
    "primaryKey": true
  },
  "title": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "description": {
    "type": "text",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "dateline": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  }
}