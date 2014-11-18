module.exports = {
  "tid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": " 主题id",
    "primaryKey": true
  },
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": "会员id",
    "primaryKey": true
  },
  "username": {
    "type": "varchar(20)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "options": {
    "type": "text",
    "allowNull": true,
    "defaultValue": null,
    "comment": "选项 分隔"
  },
  "vote_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": "发表时间"
  }
}