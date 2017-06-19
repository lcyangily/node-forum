var config;

config = {
    debug: true,
    run_port: 8080,

    base_path: __dirname, //应用根路径，程序中常用
    view_dir : 'views',
    script_ext: ".js", //编程用的脚本后缀
    assets_head: "/assets",
    session_secret: "1234567", //session
    auth_cookie_name: 'linbilin',
    //rainbow的配置
    rainbow: {
        controllers: '/controllers/',
        filters: '/filters/',
        template: '/views/'
    },
    //如果需要使用mysql，则去掉mysql_config的注释并修改为自己的数据库信息
    //如果需要使用mongo，则去掉mongo_config的注释并修改为自己的配置。
    post_interval: 2000,    //表单提交最小间隔时间，防止重复提交
    auth : {
        sina : {
            app_id:"****",
            app_secret:"***",
            redirect_uri : 'http://153e2244.ngrok.com/auth/cb/weibo'
        }
    },
    upload : {
        //七牛上传配置
        qn : {
            accessKey: 'wkKkpDQUjY0mFoKG8Nx6TNewBRDMRUN-nbnmuoD9',
            secretKey: 'Fr_FiJATCJErYJ6JxH6K9mQ5eCrI8-XlEr1c89dq',
            bucket: 'linbilin-topic',
            domain: 'http://7vijxt.com1.z0.glb.clouddn.com'
        },
        //本地上传路径配置
        path : '/uploads/',
        param : {
            max : 1024*1024*2
        }
    },
    mysql_config: {
        host: "127.0.0.1", //数据库地址
        database: "node_forum", //数据库表名
        username: "root", //数据库用户名
        password: "123456", //数据库密码
    }
    // 
    // mongo_config: {
    //     db: {
    //         native_parser: true
    //     },
    //     server: {
    //         poolSize: 5
    //     },
    //     user: '',
    //     pass: '',
    //     host: "localhost",
    //     port: "27017",
    //     database: "local"
    // }
};

module.exports = config;