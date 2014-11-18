module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "用户ID",
    "primaryKey": true
  },
  "fuid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "用户好友ID",
    "primaryKey": true
  },
  "friend_name": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "用户好友名"
  },
  "dateline": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "note": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "好友备注"
  }
}