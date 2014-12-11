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
  "tid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": 0,
    "comment": null
  },
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "dateline": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  }
}