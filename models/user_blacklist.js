module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "buid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "被屏蔽的用户ID",
    "primaryKey": true
  },
  "dateline": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  }
}