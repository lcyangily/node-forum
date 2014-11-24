module.exports = {
    forum_topic: [{
        relation  : 'belongsTo',
        modelName : 'users',
        params : {
            foreignKey : 'author_id'
        }
    },{
        relation  : 'belongsTo',
        modelName : 'forum',
        params : {
            foreignKey : 'fid'
        }
    }]
}
