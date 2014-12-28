var _ = require('underscore');
var async = require('async');

var BaseModel = function(modelName, modelType) {
    this.modelType = modelType ? modelType : 'sql';
    if (this.modelType == 'sql') {
        //生成一个Model对象
        this.Model = loadModel(modelName);
        //同步数据库
        this.Model && this.Model.sync();
    } else {
        this.Model = loadMongoModel(modelName);
    }

    this.params = {};
    this.params.where = null;
    this.params.limit = 0;
    this.params.offset = 0;
    this.params.fields = null;
    this.params.order = '';
    this.params.raw = false;

    this.result = null;
    this.action = null;
}

BaseModel.prototype = {
    getModel: function() {
        return this.Model;
    },
    findAll: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            var where  = self.params.where,
                limit  = self.params.limit,
                curPage= self.params.current_page,
                offset = self.params.offset,
                fields = self.params.fields,
                order  = self.params.order,
                include= self.params.include,
                raw    = self.params.raw;

            if (self.Model.db_type == 'sql') {

                if(this.params.is_page) {

                    async.parallel([
                        function(cb){
                            self.Model.findAll({
                                where: where,
                                limit: limit,
                                offset: offset,
                                attributes: fields,
                                order: order,
                                raw: raw,
                                include : include
                            }).success(function(datas) {
                                cb(null, datas);
                            }).error(function(e) {
                                cb(e);
                            });
                        },
                        function(cb){
                            self.Model.count({
                                where: self.params.where
                            }).success(function(count) {
                                cb(null, count);
                            }).error(function(e) {
                                cb(e);
                            });
                        }
                    ], function(err, results){
                        var total = (results && results[1]) || 0;
                        var totalPages = Math.ceil(total / limit);
                        callback(err, results && results[0], {
                            total    : results && results[1],
                            current  : curPage,
                            pageSize : limit,
                            totalPages : totalPages
                        });
                    });
                } else {
                    self.Model.findAll({
                        where: where,
                        limit: limit,
                        offset: offset,
                        attributes: fields,
                        order: order,
                        raw: raw,
                        include : include
                    }).success(function(datas) {
                        callback(null, datas);
                    }).error(function(e) {
                        callback(e);
                    });
                }
            } else {

                if(this.params.is_page) {
                    async.parallel([
                        function(cb){
                            self.Model.find().where(where).skip(offset)
                                .limit(limit)
                                .select((fields ? fields.join(' ') : null))
                                .sort(order)
                                .exec(function(error, datas) {
                                    cb(error, datas);
                                })
                        },
                        function(cb){
                            self.Model.count(where, function(err, count) {
                                cb(err, count);
                            })
                        }
                    ], function(err, results){
                        callback(err, results && results[0], {
                            total    : results && results[1],
                            current  : curPage,
                            pageSize : limit
                        });
                    });
                } else {
                    self.Model.find().where(self.params.where).skip(self.params.offset)
                        .limit(self.params.limit)
                        .select((self.params.fields ? self.params.fields.join(' ') : null))
                        .sort(self.params.order)
                        .exec(function(error, datas) {
                            callback(error, datas);
                        })
                }
            }
        }
        return this;
    },
    find: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.find({
                    where: self.params.where,
                    attributes: self.params.fields,
                    order: self.params.order,
                    raw: self.params.raw,
                    include : self.params.include
                }).success(function(data) {
                    callback(null, data);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.Model.findOne().where(self.params.where).select((self.params.fields ? self.params.fields.join(' ') : null))
                    .exec(function(error, data) {
                        callback(error, data);
                    })

            }
        }
        return this;
    },
    findById: function(id) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.params.where = self.params.where || {};
                self.params.where.id = id;
                self.Model.find({
                    where: self.params.where,
                    attributes: self.params.fields,
                    order: self.params.order,
                    raw: self.params.raw,
                    include : self.params.include
                }).success(function(data) {
                    self.result = data;
                    callback(null, data);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.params.where = self.params.where || {};
                self.params.where[_id] = id;
                self.Model.findOne(self.params.where, (self.params.fields ? self.params.fields.join(' ') : null), function(err, data) {
                    self.result = data;
                    callback(err, data)
                })
            }
        }
        return this;
    },
    findByField: function(field, value) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.params.where = self.params.where || {};
                self.params.where[field] = value;
                self.Model.find({
                    where: self.params.where,
                    attributes: self.params.fields,
                    order: self.params.order,
                    raw: self.params.raw,
                    include : self.params.include
                }).success(function(data) {
                    self.result = data;
                    callback(null, data);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.params.where = self.params.where || {};
                self.params.where[field] = value;
                self.Model.findOne(self.params.where, (self.params.fields ? self.params.fields.join(' ') : null), function(err, data) {
                    self.result = data;
                    callback(err, data)
                })
            }
        }
        return this;
    },
    count: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.count({
                    where: self.params.where
                }).success(function(count) {
                    callback(null, count);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.Model.count(self.params.where, function(err, count) {
                    callback(err, count);
                })
            }
        }
        return this;
    },
    add: function(kv) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.create(kv).success(function(data) {
                    callback(null, data);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.Model.create(kv, function(err, model) {
                    callback(err, model);
                })
            }

        }
        return this;
    },
    update: function(kv) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
console.log('----> update begin done ... result : ' + self.result);
                if (self.result) {
                    var fields, k, v;
                    fields = [];
                    for (k in kv) {
                        v = kv[k];
console.log('-------> Model.rawAttributes : ' + self.Model.rawAttributes[k]);
                        if (self.Model.rawAttributes[k]) {
                            fields.push(k);
                        }
                    }
                    self.result.updateAttributes(kv, fields).success(function(data) {
                        callback(null, data);
                    }).error(function(e) {
                        callback(e);
                    });
                } else {
                    self.Model.update(kv, {where : self.params.where}).success(function(num, rows) {
                        callback();
                    }).error(function(e){
                        callback(e);
                    });
                }
            } else {
                //mongodb的update
                if (self.result) {
                    self.Model.update({
                        _id: self.result._id
                    }, kv, {
                        multi: true
                    }, function(err, numberAffected, raw) {
                        callback(err);
                    })
                } else {
                    self.Model.update(self.params.where, kv, {
                        multi: true
                    }, function(err, numberAffected, raw) {
                        callback(err);
                    })
                }
            }
        }
        return this;
    },
    delete: function() {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                if (self.result) {
                    self.result.destroy().success(function(data) {
                        callback(null, data);
                    }).error(function(e) {
                        callback(e);
                    });
                } else {
                    self.Model.destroy({where : self.params.where}).success(function() {
                        callback()
                    });
                }
            } else {
                if (self.result) {
                    self.Model.remove({
                        _id: self.result._id
                    }, function(err) {
                        callback(err)
                    })
                } else {
                    self.Model.remove(self.params.where, function(err) {
                        callback(err)
                    })
                }
            }
        }
        return this;
    },
    addCount: function(key) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.find({
                    where: self.params.where
                }).success(function(data) {
                    if (!data) {

                    } else {
                        var obj = {}
                        obj[key] = data[key] * 1 + 1;
                        console.log(obj)
                        data.updateAttributes(obj, [key]).success(function(data) {
                            callback(null, data);
                        }).error(function(e) {
                            callback(e);
                        });
                    }
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.Model.findOne(self.params.where, (self.params.fields ? self.params.fields.join(' ') : null), function(err, data) {
                    var obj = {}
                    obj[key] = data[key] * 1 + 1;
                    self.Model.update(self.params.where, obj, function(err, numberAffected, raw) {
                        callback(err);
                    })
                })
            }
        }
        return this;
    },
    addBat : function(records, options){
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.bulkCreate(records, options).success(function(data) {
                    callback(null, data);
                }).error(function(e) {
                    callback(e);
                });
            } else {
                //
            }
        }
        return this;
    },
    findOrAdd : function(){
        //待实现
    },
    updateOrAdd: function(kv) {
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.find({
                    where: self.params.where,
                    attributes: self.params.fields,
                    order: self.params.order,
                    raw: self.params.raw
                }).success(function(data) {
                    if (data) {
                        self.Model.update(kv, self.params.where).success(function() {
                            callback();
                        }).error(function(e) {
                            callback(e);
                        });
                    } else {
                        self.Model.add(kv).success(function(data) {
                            callback(null, data)
                        }).error(function(e) {
                            callback(e);
                        });
                    }
                }).error(function(e) {
                    callback(e);
                });
            } else {
                self.Model.findOne().where(self.params.where).select((self.params.fields ? self.params.fields.join(' ') : null))
                    .exec(function(error, data) {
                        if (data) {
                            self.Model.update(self.params.where, kv, {
                                multi: true
                            }, function(err, numberAffected, raw) {
                                callback(err);
                            })
                        } else {
                            self.Model.create(kv, function(err, model) {
                                callback(err, model);
                            })
                        }
                    })
            }
        }
        return this;
    },
    max : function(field){
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.max(field).success(function(max){
                    callback && callback(null, max);
                }).error(function(err){
                    callback && callback(err);
                });
            } else {
                //待实现
            }
        }

        return this;
    },
    min : function(field){
        var self = this;
        this.action = null;
        this.action = function(callback) {
            if (self.Model.db_type == 'sql') {
                self.Model.min(field).success(function(min){
                    callback && callback(null, min);
                }).error(function(err){
                    callback && callback(err);
                });
            } else {
                //待实现
            }
        }

        return this;
    }
}

_.extend(BaseModel.prototype, {
    where: function(param) {
        this.params.where = param;
        return this;
    },
    limit: function(limit) {
        this.params.limit = limit;
        return this;
    },
    offset: function(offset) {
        this.params.offset = offset;
        return this;
    },
    page: function(p){
console.log('======> page : ' + page + '; pageSize : ' + pageSize);
        var page = (p && p.page) || 1;
        var pageSize = (p && p.pageSize) || 10;
        var start = (page - 1) * pageSize;
        start = start > 0 ? start : 0;
        this.offset(start).limit(pageSize);
        this.params.is_page = true;
        this.params.current_page = page;
        return this;
    },
    //返回哪些字段
    fields: function(fields) {
        this.params.fields = fields;
        return this;
    },
    order: function(order) {
        if (this.Model.db_type == 'sql') {
            var order_str = '';
            for (var i in order) {
                order_str += i + ' ' + order[i] + ' '
            }
            this.params.order = order_str;
        } else {
            this.params.order = order
        }
        return this;
    },
    include : function(models){
        if(!_.isArray(models)) {
            models = [models];
        }

        if(!this.params.include) {
            this.params.include = models;
        } else {
            this.params.include.concat(models);
        }
        return this;
    },
    raw: function(raw) {
        this.params.raw = raw;
        return this;
    },
    clean : function(){
        this.result = null;
        return this;
    }
});
_.extend(BaseModel.prototype, {
    done: function(callback) {
        if (this.action) {
            this.action(callback);
            this.params.where = null;
            this.params.limit = 0;
            this.params.offset = 0;
            this.params.fields = null;
            this.params.order = '';
            this.params.raw = false;
            this.params.is_page = false;
            this.result = null;
            this.action = null;
        } else {
            callback(new Error('没有指定动作'))
        }
    }
});
module.exports = BaseModel;