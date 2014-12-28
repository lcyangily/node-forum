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
    }]
}
