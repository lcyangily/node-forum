module.exports = {
  "uid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null,
    "primaryKey": true
  },
  "friends": {
    "type": "int(6)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "好友个数"
  },
  "topics": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "主题数"
  },
  "replys": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "回复数"
  },
  "picks": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "精华数"
  },
  "blogs": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "日志数"
  },
  "albums": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "相册数"
  },
  "views": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "空间查看数"
  },
  "follower": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "听众数量"
  },
  "following": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "收听数量"
  },
  "newfollower": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "新增听众数量"
  },
  "blacklist": {
    "type": "mediumint(8)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "拉黑用户数"
  }
}