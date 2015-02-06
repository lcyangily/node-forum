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
  "title": {
    "type": "varchar(300)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "content": {
    "type": "text",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "fid": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "ftype_id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "author_id": {
    "type": "int(11)",
    "allowNull": false,
    "defaultValue": "",
    "comment": null
  },
  "author_nick": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "author_pic": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "type": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "0->普通帖，1-投票帖子，2->..."
  },
  "closed": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否关闭：0->正常，1->关闭（只能查看，不能回复，赞等）"
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
  "highlight": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否高亮"
  },
  "digest": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否精华"
  },
  "top_all": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "全局顶置, 1-全局顶置"
  },
  "top": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "本版顶置：0-不顶置，1-本版顶置"
  },
  "is_hot": {
    "type": "tinyint(4)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "是否是热门帖"
  },
  "reply_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "visit_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "collect_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "zan_count": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": "赞数量"
  },
  "create_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  },
  "update_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "last_reply": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "last_reply_user_id": {
    "type": "int(11)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "last_reply_user_nick": {
    "type": "varchar(50)",
    "allowNull": true,
    "defaultValue": "0",
    "comment": null
  },
  "last_reply_time": {
    "type": "datetime",
    "allowNull": true,
    "defaultValue": Sequelize.NOW,
    "comment": null
  },
  "source": {
    "type": "varchar(100)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "source_home_url": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  },
  "source_url": {
    "type": "varchar(255)",
    "allowNull": true,
    "defaultValue": null,
    "comment": null
  }
}