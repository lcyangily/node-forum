var Sequelize = require("sequelize");
module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "verify_type": {
    "type": "varchar(100)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "认证类型",
    "primaryKey": true
  },
  "status": {
    "type": "tinyint(1)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "-1:被拒绝 0-待审核 1-审核通过"
  }
}