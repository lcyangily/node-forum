//LBL对象，通用方法
define(['jquery', 'sib.sib', 'sib.dialog'], function($, Sib, Dialog){
    var LBL = window.LBL || {};

    $.extend(LBL, {
        loginConfirm : function(loginFunc, nologinFunc, errorFunc){
            $.ajax({
                type : 'GET',
                url : '/islogin?t=' + new Date().getTime(),
                dataType : 'json',
                success : function(data){
                    if(data && data.login) {
                        if($.isFunction(loginFunc)) {
                            loginFunc(data.user);
                        }
                    } else {
                        if($.isFunction(nologinFunc)) {
                            nologinFunc();
                        }
                    }
                },
                error : function(error){
                    if($.isFunction(errorFunc)) {
                        errorFunc(error);
                    }
                }
            });
        },
        login : (function(){
            var d;
            return function(successFunc, failureFunc, errorFunc){
                var token = new Date().getTime();
                if(!d) {
                    d = new Dialog({
                        content : '/loginpop',
                        effect : 'fade',
                        title : '登录',
                        width:540,
                        height:300,
                        modal : true
                    });
                }
                d._off('iframeload');
                d._on({
                    iframeload : function(e){
                        var $iframe = this.state.$iframe;
                        if($iframe && $iframe[0]) {
                            if($iframe[0].contentWindow) {
                                $iframe[0].contentWindow.token = token;
                            }
                        }
                    },
                    close : function(evt, data){
                        if(data && data.code == 'loginsuccess') {
                            Dialog.tip('登录成功!');
                            $.isFunction(successFunc) && successFunc();
                            Sib.publish('_ajax_login_success', data.user);
                        }
                    }
                });
                d.open();
            }
        })(),
        addFriend : function(uid){
            $.ajax({
                type : 'post',
                url : '/friend/add/' + uid,
                //data : data,
                success : function(data){
                    Dialog.tip((data && data.msg) || '操作成功！');
                },
                error : function(err){
                    Dialog.tip(err.responseText);
                }
            });
        },
        removeFriend : function(uid){

        },
        follow : function(uid){
            $.ajax({
                type : 'post',
                url : '/follow/add/' + uid,
                dataType : 'json',
                success : function(data){
                    if(data) {
                        if(data.result == 1) {
                            Dialog.tip('关注成功！');
                            return;
                        } else if(data.result == 2) {
                            Dialog.tip('已经关注！');
                            return;
                        }
                    }
                    Dialog.tip('关注失败！');
                },
                error : function(err){
                    Dialog.tip(err);
                }
            });
        },
        unfollow : function(){

        },
        zan : function(id){
            $.ajax({
                type : 'post',
                url : '/topic/'+id+'/zan',
                dataType : 'json',
                success : function(data){
                    if(data && data.code == 1) {
                        Dialog.tip('成功');
                    } else {
                        Dialog.tip(data.msg);
                    }
                },
                error : function(err){
                    Dialog.tip(err.responseText);
                }
            });
        },
        zanReply : function(id){
            $.ajax({
                type : 'post',
                url : '/reply/'+id+'/zan',
                dataType : 'json',
                success : function(data){
                    if(data && data.code == 1) {
                        Dialog.tip('成功');
                    } else {
                        Dialog.tip(data.msg);
                    }
                },
                error : function(err){
                    Dialog.tip(err.responseText);
                }
            });
        },
        collectTopic : function(tid){
            LBL.collect(tid, 2);
        },
        collectForum : function(fid){
            LBL.collect(fid, 1);
        },
        collect : function(id, type) {
            if(!id || !type) {
                return;
            }

            var url = '/fav/';
            if(type ==1) {
                url += 'forum';
            } else if(type == 2) {
                url += 'topic';
            } else {
                return;
            }
            url += '/add/' + id;

            $.ajax({
                url : url,
                type : 'post',
                //data : data,
                success : function(data){
                    var msg = (data && data.msg) || '操作成功！';
                    Dialog.tip(msg);
                },
                error : function(err){
                    Dialog.tip(err.responseText);
                }
            });
        },
        /*attend : function(id, type){
            if(!id) {
                return;
            }
            var data = {};
            var successTip = '恭喜您，关注成功!';
            var repeatTip = '已经关注！';
            var failureTip = '关注失败，请稍候再试!';
            if(type == "shop") {
                data.merchantId = id;
                data.attentType = "1";
            } else {
                data.productId = id;
                data.attentType = "0";
            }
            $.ajax({
                url : '/mall/collect',
                data : data,
                success : function(data){
                    if(data) {
                        if(data.result == 1) {
                            Dialog.tip(successTip);
                            return;
                        } else if(data.result == 2) {
                            Dialog.tip(repeatTip);
                            return;
                        }
                    }
                    Dialog.tip(failureTip);
                },
                error : function(){
                    Dialog.tip(failureTip);
                }
            });
        },*/
        addFavorite : function(){
            var url = "http://www.linbilin.com/";
            var title = "邻比邻";
            if(document.all) {
                window.external.AddFavorite(url, title);
            } else if(window.sidebar && window.sidebar.addPanel) {
                window.sidebar.addPanel(title, url, "");
            } else {
                Dialog.tip("<span>对不起，您的浏览器不支持此操作！<br/>请您使用菜单栏或者Ctrl+D收藏本站。</span>");
            }
        },
        //'top', 'untop', 'hot', 'unhot', 'digest', 'undigest', 
        //'highlight', 'unhighlight', 'closed', 'unclosed', 'delete'
        topicChg : function(tid, type) {
            $.ajax({
                type : 'post',
                url : '/topic/'+tid+'/'+type,
                dataType : 'json',
                success : function(data){
                    Dialog.tip((data && data.msg) || '操作成功!');
                },
                error : function(err){
                    Dialog.tip(err.responseText);
                }
            });
        },
        //主题推荐到首页新闻
        topicToNews : (function (){
            var d;
            return function(tid){
                var token = new Date().getTime();
                if(!d) {
                    d = new Dialog({
                        content : '/topic/' + tid + '/tonews',
                        effect : 'fade',
                        title : '推荐到首页',
                        width:540,
                        modal : true
                    });
                }
                d._off('iframeload');
                d._on({
                    iframeload : function(e){
                        var $iframe = this.state.$iframe;
                        if($iframe && $iframe[0]) {
                            if($iframe[0].contentWindow) {
                                $iframe[0].contentWindow.token = token;
                            }
                        }
                    },
                    close : function(evt, data){
                        if(data && data.code == 'tonewssuccess') {
                            Dialog.tip('操作成功!');
                        }
                    }
                });
                d.open();
            }
        })(),
    });
    
    return LBL;
});