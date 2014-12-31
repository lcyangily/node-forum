var Sequelize = require("sequelize");
module.exports = {
  "id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": null,
    "comment": null,
    "primaryKey": true
  },
  "title": {
    "type": "varchar(300)",
    "allowNull": true,
    "defaultValue": "",
    "comment": null
  },
  "content": {
    "type": "text",
    "allowNull": true,
    "defaultValue": null,
    "comment": "内容，如果有则显示这个，没有则显示主题/关联文章内容"
  },
  "img": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": "",
    "comment": "图片"
  },
  "fid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "ftype_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "author_id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "status": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "帖子状态：0-正常，1-删除不可见，2-管理员强制删除"
  },
  "status_chg_uid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "改变状态人(作者/版主/管理员)"
  },
  "status_chg_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": "状态改变时间"
  },
  "top": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否顶置"
  },
  "is_hot": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否是热门帖"
  },
  "create_uid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "申请/添加 主题到首页新闻的人(管理员/版主)"
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": "添加时间"
  },
  "audit_uid": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": null,
    "comment": "审核人员"
  },
  "audit_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": "审核通过时间"
  },
  "update_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "last_reply_user_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  }
}