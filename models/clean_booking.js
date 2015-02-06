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
  "type": {
    "type": "tinyint(4)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "1-家庭保洁，2-大扫除，3-新居开荒"
  },
  "link_name": {
    "type": "varchar(30)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "联系人"
  },
  "link_phone": {
    "type": "varchar(30)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "联系电话"
  },
  "province_code": {
    "type": "varchar(6)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "city_code": {
    "type": "varchar(6)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "district_code": {
    "type": "varchar(6)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "address": {
    "type": "varchar(200)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "status": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "订单状态：0-未处理，1-已派发，2-已取消，3-完成"
  },
  "status_chg_uid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "status_chg_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  },
  "uid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "用户id，如果登录了，则填入"
  }
}