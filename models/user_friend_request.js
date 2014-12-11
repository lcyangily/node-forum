var Sequelize = require("sequelize");
module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "fuid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "被请求用户ID",
    "primaryKey": true
  },
  "friend_name": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "note": {
    "type": "varchar(200)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "申请附言"
  },
  "dateline": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  }
}