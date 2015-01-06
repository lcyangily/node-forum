module.exports = {
    forum_topic: [{
        relation  : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'author_id'
        }
    },{
        relation  : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'last_reply_user_id',
            as : 'reply_author'
        }
    },{
        relation  : 'belongsTo',
        modelName : 'forum',
        params : {
            foreignKey : 'fid'
        }
    },{
        relation  : 'belongsTo',
        modelName : 'forum',
        params : {
            foreignKey : 'ftype_id',
            as : 'forum_type'
        }
    },{
        relation  : 'hasOne',
        modelName : 'news_topic',
        params : {
            foreignKey : 'id'
        }
    }],
    user_friend : [{
        relation  : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'fuid'
        }
    }],
    user_friend_request : [{
        relation  : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'fuid',
            as : 'receive'
        }
    }, {
        relation  : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'uid',
            as : 'send'
        }
    }],
    user_follow : [{
        relation : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'follow_uid',
            as : 'follow'
        }
    }, {
        relation : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'uid',
            as : 'fans'
        }
    }],
    forum_reply : [{
        relation : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'author_id'
        }
    },{
        relation : 'belongsTo',
        modelName : 'forum_topic',
        params : {
            foreignKey : 'fid'
        }
    }],
    topic_zan_logs : [{
        relation : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'uid'
        }
    }],
    forum_moderator : [{
        relation : 'belongsTo', //'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'uid'
        }
    },{
        relation : 'belongsTo', //'belongsTo',
        modelName : 'forum',
        params : {
            foreignKey : 'fid'
        }
    }],
    user_favorite : [{
        relation : 'belongsTo',
        modelName : 'forum',
        params : {
            foreignKey : 'id'
        }
    }, {
        relation : 'belongsTo',
        modelName : 'forum_topic',
        params : {
            foreignKey : 'id'
        }
    }],
    users : [{
        relation : 'belongsTo',    //belongsTo
        modelName : 'user_count',
        params : {
            foreignKey : 'id'
        }
    },{
        relation : 'belongsTo',    //belongsTo
        modelName : 'user_profile',
        params : {
            foreignKey : 'id'
        }
    }],
    news_topic : [{
        relation : 'hasOne',
        modelName : 'forum_topic',
        params : {
            foreignKey : 'id'
        }
    }],
    living_info : [{
        relation : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'uid'
        }
    },{
        relation : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'audit_uid',
            as : 'auditer'
        }
    }]
}
