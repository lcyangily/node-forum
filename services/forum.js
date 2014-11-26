var Forum = new BaseModel('forum');

module.exports = {
    getAll: function(cb) {
        Forum.findAll().order({
            create_time: 'desc'
        }).done(function(error, datas) {
            cb && cb(error, datas);
        });
    },
    //得到统计数
    getStat : function(cb){
        Forum.find().where({
            type : -1
        }).done(function(error, forum){
            cb && cb(error, forum);
        });
    },
    getGroup: function(cb) {
        Forum.findAll().where({
            type : 0
        }).done(function(error, forums) {
            cb && cb(error, forums);
        });
    },
    getForum: function(cb) {
        console.log('forum service getForum ... ');
        Forum.findAll().where({
            type : 1
        }).done(function(error, forums) {
            cb && cb(error, forums);
        });
    },
    getAllSub: function(cb) {
        Forum.findAll().where({
            type : 2
        }).done(function(error, forums) {
            cb && cb(error, forums);
        });
    },
    getSub: function(fid, cb) {
        Forum.findAll().where({
            type : 2,
            parent_id : fid
        }).done(function(error, forums) {
            cb && cb(error, forums);
        });
    },
    getById : function(id, cb){
        Forum.findById(id).done(function(error, forum) {
            cb && cb(error, forum);
        });
    },
    getPage : function(param, page, cb){
        Forum.findAll().page(page.page, page.pageSize).done(cb);
    },
    add : function(f, cb){
        Forum.add(f).done(function(error, teacher) {
            cb && cb(error, teacher);
        });
    },
    update : function(f, cb){
        Forum.update(f).where({id : f.id}).done(function(error, teacher) {
            cb && cb(error, teacher);
        });
    },
    remove : function(id, cb){
        if(!id) {
            cb && cb('没有指定删除板块!');
        }
        Forum.delete().where({id : 1}).done(function(error){
            cb && cb(error);
        });
    }
};