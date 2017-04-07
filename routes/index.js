var express = require('express');
var router = express.Router();
var admin = require('dao/dbConnect').admin;
var article = require('dao/dbConnect').article;
var website = require('dao/dbConnect').website;
var message = require('dao/dbConnect').message;
var moment = require('moment');
//上传支持
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var multipart = require('connect-multiparty');

var links = '<li><a href="http://sxyz.blog">三咲亚子\'s 博客</a></li>';


/* GET home page. */
//首页
router.get('/err.html', function(req, res, next) {
    res.render('error', '500', '500', '500');
});





/*
后台页面
 */
//管理员登陆
router.route('/login.html').get(function (req, res) {
    if(req.session.islogin === undefined){
        res.render('bg_login');
    }else{
        res.redirect('/bgindex.html');
    }
}).post(function (req, res) {
    //验证身份
    var adminname = req.param('adminname');
    var password = req.param('password');
    result = null;
    admin.login(adminname, function (result,err) {
        console.log(result);
        // if(!(err === undefined)){
        //     res.redirect('err.html');
        // }
        if(result[0] === undefined){
            res.send('没有该用户');
        }else{
            if(result[0].admin_password === password){
                req.session.islogin=adminname;
                res.locals.islogin=req.session.islogin;
                res.cookie('islogin',res.locals.islogin,{maxAge:60000});
                res.redirect('/bgindex.html');
            }else{
                res.send('<script>document.write("用户名或密码错误<a href=\'login.html\'>返回登陆</a>")</script>');
            }
        }

    });
});
router.post('/sendArticle.html',function (req, res) {
    console.log(req.session.islogin);
    if(req.session.islogin == undefined || req.session.islogin == '' || req.session.islogin == null){
        res.json({msg: '身份过期'});
        return;
    }
    var title = req.param('title');
    var describe = req.param('describe');
    var keyword = req.param('keyword');
    var text = req.param('text');
    var picturename = req.param('picturename');
    var path = '../public/img/' + picturename;
    admin.sendArticle(title,text, picturename, keyword, describe, function (err) {
        if(err === undefined){
            res.json({msg : '操作失败! '});
        }else{
            res.json({msg : '操作成功! '});
        }
    });
});


router.route('/bgindex.html').get(function (req, res) {
    res.render('bg_index');
});
router.get('/bg_article.html', function (req, res) {
    article.getListTable(req.param('pageNumber'), req.param('pageSize'),function (result,err) {
        if(err === null){
            var articles = '';
            for(var i = 0; i < result.length; i++){
                articles += '<tr><td>'+result[i].id+'</td><td>'+result[i].article_title+'</td><td>'+result[i].article_time
                    +'</td><td>'+result[i].article_status+'</td><td><button name="'+result[i].id+'">删除</button>' +
                    '<button name="'+result[i].id+'">修改</button><button name="'+result[i].id+'">推荐</button></td></tr>';
            }
            res.render('bg_article',{articles:articles});
        }else{
            throw err;
        }
        res.render('bg_article',{articles:articles});
    });

});

router.route('/exit*').get(function (req, res) {
    req.session.islogin = undefined;
    res.locals.islogin = undefined;
    res.cookie = undefined;
    res.redirect('/login.html');
});



//文章列表模版
var articlelistemodel = '<li class="index_article">'+
    '<img class="am-fr img-thumbnail index_img" src="{#picture}" />'+
    '<h1><a href="{#href}" >{#title}</a></h1>'+
    '<p style="color: #999999;"><small>作者：黑白|发布日期：{#time}|阅读量：{#click}</small></p>'+
    '<p>{#describe}</p>'+
    '</li>';



/*导航页面*/
router.get('/', function(req, res) {
    var articlelist = '';
    var aboutme = '';
    var nav = getHeader(0);
    //获取首页推荐列表
    article.getIndexList(function (result) {
        for(var i=0;i<result.length;i++){
            var articleli = articlelistemodel;
            articleli = articleli.replace('{#picture}',result[i].article_picture);
            articleli = articleli.replace('{#title}', result[i].article_title);
            articleli = articleli.replace('{#href}', 'article.html?id='+result[i].id);
            articleli = articleli.replace('{#time}', moment(new Date(result[i].article_time)).format('YYYY-MM-DD HH:mm:ss'));
            articleli = articleli.replace('{#click}', result[i].article_click);
            articleli = articleli.replace('{#describe}', result[i].article_describe);
            articlelist += articleli;
        }
        //获取关于信息
        website.getWebsite(1,function (result,err) {
            aboutme = result[0].website_aboutme;
            //获取右侧推荐
            article.getRightList(function (result,err){
               var model =  '<li><a href="article.html?id={#id}">{#title}</a></li>';
               var articleRight = '';
               for(var i = 0; i < result.length; i++){
                   var articleli = model.replace('{#id}', result[i].id);
                   articleli = articleli.replace('{#title}', result[i].article_title);
                   articleRight += articleli;
               }
                res.render('index', {h1:'首页推荐文章', article : articlelist, aboutme : aboutme, articleRight : articleRight, nav : nav,links:links});
            })
        });
    });
});

router.get('/index.html', function (req, res) {
    var articlelist = '';
    var aboutme = '';
    var nav = getHeader(1);
    //获取首页推荐列表
    article.getIndexList(function (result) {
        for(var i=0;i<result.length;i++){
            var articleli = articlelistemodel;
            articleli = articleli.replace('{#picture}',result[i].article_picture);
            articleli = articleli.replace('{#title}', result[i].article_title);
            articleli = articleli.replace('{#href}', 'article.html?id='+result[i].id);
            articleli = articleli.replace('{#time}', moment(new Date(result[i].article_time)).format('YYYY-MM-DD HH:mm:ss'));
            articleli = articleli.replace('{#click}', result[i].article_click);
            articleli = articleli.replace('{#describe}', result[i].article_describe);
            articlelist += articleli;
        }
        //获取关于信息
        website.getWebsite(1,function (result,err) {
            aboutme = result[0].website_aboutme;
            //获取右侧推荐
            article.getRightList(function (result,err){
                var model =  '<li><a href="article.html?id={#id}">{#title}</a></li>';
                var articleRight = '';
                for(var i = 0; i < result.length; i++){
                    var articleli = model.replace('{#id}', result[i].id);
                    articleli = articleli.replace('{#title}', result[i].article_title);
                    articleRight += articleli;
                }
                res.render('index', {h1:'首页推荐文章', article : articlelist, aboutme : aboutme, articleRight : articleRight,links:links, nav : nav});
            })
        });
    });
});

//文章列表页
router.get('/articles.html',function (req, res) {
    var articlemodel = '<li class="index_article">'+
        '<img class="am-fr img-thumbnail index_img" src="{#picture}" />'+
        '<h1><a href="{#href}" >{#title}</a></h1>'+
        '<p style="color: #999999;"><small>作者：黑白|发布日期：{#time}|阅读量：{#click}</small></p>'+
        '<p>{#describe}</p>'+
        '</li>';
    var articlelist = '';
    var aboutme = '';
    var page = parseInt(req.param('page'));
    if(isNaN(page)){
        page = 1;
    }
    //获取导航
    var nav = getHeader(2);
    //获取首页推荐列表
    article.getListTable(page, 5, function (result) {
        if(result.length == 0){
            articlelist = '<script>alert("没有更多数据了!");window.location.href="articles.html?page='+(page-1)+'"</script>';
        }
        for(var i=0;i < result.length;i++){
            var articleli = articlelistemodel;
            articleli = articleli.replace('{#picture}',result[i].article_picture);
            articleli = articleli.replace('{#title}', result[i].article_title);
            articleli = articleli.replace('{#href}', 'article.html?id='+result[i].id);
            articleli = articleli.replace('{#time}', moment(new Date(result[i].article_time)).format('YYYY-MM-DD HH:mm:ss'));
            articleli = articleli.replace('{#click}', result[i].article_click);
            articleli = articleli.replace('{#describe}', result[i].article_describe);
            articlelist += articleli;
            console.log('articleli:'+articleli);

        }
        //生成分页代码
        var pagelist = "";
        pagelist += '<li class="am-pagination-first">'+
            '<a href="articles.html?page='+(page-1)+'">上一页</a>'+
            '</li>';
        //判断page是否
        if(page <= 3){
            for(var i=1;i<6;i++){
                if(i==page){
                    pagelist  += '<li class="am-active">'+
                        '<a href="articles.html?page='+i+'" class="">第'+i+'页</a>'+
                        '</li>';
                }else{
                    pagelist  += '<li class="">'+
                        '<a href="articles.html?page='+i+'" class="">第'+i+'页</a>'+
                        '</li>';
                }

            }
        }else{
            for(var i=page-2;i<page+3;i++){
                if(i == page){
                    console.log(1);
                    pagelist  += '<li class="am-active">'+
                        '<a href="articles.html?page='+i+'" class="">第'+i+'页</a>'+
                        '</li>';
                }else{
                    console.log(2);
                    pagelist  += '<li>'+
                        '<a href="articles.html?page='+i+'" class="">第'+i+'页</a>'+
                        '</li>';
                }

            }
        }
        // if(page<3){
        //
        // }

        pagelist += '<li class="am-pagination-next ">'+
            '<a href="articles.html?page='+(page+1)+'" class="">下一页</a>'+
            '</li>';
        articlelist += '<ul data-am-widget="pagination" class="am-pagination am-pagination-default">'+pagelist+'</ul>';

        //获取关于信息
        website.getWebsite(1,function (result,err) {
            aboutme = result[0].website_aboutme;
            //获取右侧推荐
            article.getRightList(function (result,err){
                var model =  '<li><a href="article.html?id={#id}">{#title}</a></li>';
                var articleRight = '';
                for(var i = 0; i < result.length; i++){
                    var articleli = model.replace('{#id}', result[i].id);
                    articleli = articleli.replace('{#title}', result[i].article_title);
                    articleRight += articleli;
                }
                console.log(links);
                res.render('index', {h1:'文章列表', article : articlelist, aboutme : aboutme, articleRight : articleRight, links:links, nav : nav});
            })
        });
    });
})

router.get('/article.html',function (req, res) {
    var aboutme = '';
    var nav = getHeader(2);
    //获取文章
    article.getArticle(req.param('id'), function (result) {
        var title = result[0].article_title;
        var text = result[0].article_text;
        var time = moment(new Date(result[0].article_time)).format('YYYY-MM-DD HH:mm:ss');
        var click = result[0].article_click;
        //获取关于信息
        article.getComment(req.param('id'),1,5,function (result) {
            var commentmodel = '<div>' +
                '<div class="col-sm-6 col-md-4">' +
                '<div class="thumbnail">' +
                '<div class="caption">' +
                '<h3>{#name}</h3>' +
                '<p><small>发布时间：{#time}</small></p>' +
                '<p>{#value}</p>' +
                '</div></div></div></div>';
            var comment = '<div id="comment">';
            for (var i=0;i<result.length;i++){
                var m = commentmodel;
                m = m.replace('{#name}',result[i].name);
                m = m.replace('{#time}',moment(new Date(result[i].time)).format('YYYY-MM-DD HH:mm:ss'));
                m = m.replace('{#value}',result[i].text);
                comment += m;
            }
            comment += '</div>';
            website.getWebsite(1,function (result,err) {
                aboutme = result[0].website_aboutme;
                //获取右侧推荐
                article.getRightList(function (result,err){
                    var model =  '<li><a href="article.html?id={#id}">{#title}</a></li>';
                    var articleRight = '';
                    for(var i = 0; i < result.length; i++){
                        var articleli = model.replace('{#id}', result[i].id);
                        articleli = articleli.replace('{#title}', result[i].article_title);
                        articleRight += articleli;
                    }
                    res.render('article', {aboutme : aboutme, articleRight : articleRight,
                        nav : nav, title:title,text:text,time:time,click:click,comment:comment});
                })
            });
        })

    });
})
router.get("/message.html",function (req, res) {
    var aboutme = '';
    var nav = getHeader(4);
    //获取文章
    message.getMessage(req.param('pageNumber'),req.param('pageSize'), function (result) {
        console.log(result)
        var messagemodel = '<article class="am-comment"><a href="">' +
            '<img class="am-comment-avatar" alt="" src="images/54eebef12dad7.jpg"/>' +
            '</a>' +
            '<div class="am-comment-main">' +
            '<header class="am-comment-hd">' +
            '<div class="am-comment-meta"><a href="#link-to-user" class="am-comment-author">{#user}</a>'+
            '留言于 <time datetime="">{#time}</time>' +
            '</div> ' +
            '</header>' +
            '<div class="am-comment-bd">{#text}</div>' +
            ' <!-- 评论内容 --> ' +
            '</div> </article>'
        var message = '<div id="messagelist">';
        for (var i = 0; i < result.length; i++){
             var rong = messagemodel;
             rong = rong.replace("{#user}", result[i].message_name);
             rong = rong.replace("{#time}", moment(new Date(result[i].message_time)).format("YYYY-MM-DD HH:mm:ss"));
             rong = rong.replace("{#text}", result[i].message_value);
             message += rong + "<br />";
        }
        message += '</div><p><button class="am-btn am-btn-warning" style="width: 100%;" onclick="seeOther();">查看更多</button></p>' +
            '<legend>发表留言</legend>' +
            '<div style="width: 100%;" class="am-form">' +
            '<p><label>昵称：</label><input id="name" type="text" /></p>' +
            '<p><label>请输入留言内容：</label></p>' +
            '<textarea id="text" style="width: 100%; height: 300px;"></textarea><br /><br />' +
            '<button class="am-btn am-btn-success" style="width: 100%;" onclick="sendMessage();">发布</button>' +
            '</div>' ;
        //获取关于信息
        website.getWebsite(1,function (result,err) {
            aboutme = result[0].website_aboutme;
            //获取右侧推荐
            article.getRightList(function (result,err){
                var model =  '<li><a href="article.html?id={#id}">{#title}</a></li>';
                var articleRight = '';
                for(var i = 0; i < result.length; i++){
                    var articleli = model.replace('{#id}', result[i].id);
                    articleli = articleli.replace('{#title}', result[i].article_title);
                    articleRight += articleli;
                }
                res.render('index', {h1:"留言板", aboutme : aboutme, articleRight : articleRight,
                    nav : nav, article:message ,links:links});
            })
        });
    });
})

router.get("/about.html",function (req, res) {
    var aboutme = '';
    var nav = getHeader(5)
    var about = '<div> ' +
        '<p>姓名：刘浩然</p> ' +
        '<p>性别：男</p> ' +
        '<p>E-Mail：lhr5533@126.com</p> ' +
        '<p>出生地：河南平顶山</p> ' +
        '<p>爱好：算法，研究新技术</p> ' +
        '<p>座右铭：不断学习创新是一件愉悦的事情。</p> ' +
        '</div>';
    website.getWebsite(1,function (result,err) {
        aboutme = result[0].website_aboutme;
        //获取右侧推荐
        article.getRightList(function (result,err){
            var model =  '<li><a href="article.html?id={#id}">{#title}</a></li>';
            var articleRight = '';
            for(var i = 0; i < result.length; i++){
                var articleli = model.replace('{#id}', result[i].id);
                articleli = articleli.replace('{#title}', result[i].article_title);
                articleRight += articleli;
            }
            res.render("index", {h1:"个人简介", aboutme : aboutme, articleRight : articleRight,
                nav : nav, article:about,links:links});
        })
    });

})
router.get("/share.html",function (req,res) {
    var aboutme = '';
    var nav = getHeader(3);
    website.getWebsite(1,function (result,err) {
        aboutme = result[0].website_aboutme;
        //获取右侧推荐
        article.getRightList(function (result,err){
            var model =  '<li><a href="article.html?id={#id}">{#title}</a></li>';
            var articleRight = '';
            for(var i = 0; i < result.length; i++){
                var articleli = model.replace('{#id}', result[i].id);
                articleli = articleli.replace('{#title}', result[i].article_title);
                articleRight += articleli;
            }
            res.render("index", {h1:"分享", aboutme : aboutme, articleRight : articleRight,
                nav : nav, article:"正在开发中。。。。。。。。",links:links});
        })
    });
})










router.post('/file/uploading', multipart(), function(req, res, next){
    var fs = require('fs'),
        path = require('path');
    var filename = req.files.files.originalFilename || path.basename(req.files.files.path);
//copy file to a public directory
    var newfilename = (Math.random()+'').split('.')[1]+'.'+filename.split('.')[1];
    var targetPath = '../public/img/' + newfilename;
    console.log(req.files.files.path);
//copy file
    fs.createReadStream(req.files.files.path).pipe(fs.createWriteStream(targetPath));
//return file url
    res.json({code: 200, msg: {url: 'http://' + req.headers.host + '/img/' + newfilename}});
});


router.post('/sendMessage.html', function (req, res) {
    var name = req.param('name');
    var msg = req.param('message');
    var fid = req.param('fid');
    var ip = req.ip.match(/\d+\.\d+\.\d+\.\d+/);
    if(name == "" || msg == ""){
        res.json({msg:'昵称或内容不能为空！'});
        return;
    }
    if(isNaN(fid) || fid == undefined || fid === undefined){
        fid = 0;
    }
    console.log(name, msg, fid, ip);
    message.addMessage(name,msg,fid,ip, res);
})

router.get('/message',function (req,res) {
    var page = req.param('page');
    if(page < 1){
        res.json({msg:'错误请求'});
        return;
    }
    message.getMessage(page,5,function (result ,err) {
        var a = [];
        for(var i=0;i<result.length;i++){
            a[i] = {
                name : result[i].message_name,
                message : result[i].message_value,
                time : result[i].message_time
            }
        }
        res.json(a);
    });
})
router.post('/sendComment.html', function (req, res) {

    var ip = req.ip.match(/\d+\.\d+\.\d+\.\d+/);
    var name = req.param('name');
    var text = req.param('text');
    var email = req.param('email');
    var id = req.param('id');
    if(name == "" || text == ""){
        res.json({msg:'请填写昵称和内容'});
        return;
    }
    console.log(name);
    article.sendComment(id,email,name,text,ip,res);
})


//富文本测试
router.get('/ueditor', function (req, res) {
    res.render('ueditor');
});


function getHeader(nowpage){
    var nav = ""
    if(nowpage == 0){
        //首页
        nav = ' <li class="am-active"><a href="index.html">首页</a></li>'
            +'<li><a href="articles.html?page=1">文章</a></li>'
            +'<li><a href="share.html">分享</a></li>'
            +'<li><a href="message.html">留言板</a></li>'
            +'<li><a href="about.html">关于</a></li>';
        return nav;
    }
    if(nowpage == 1){
        //首页
        nav = ' <li class="am-active"><a href="index.html">首页</a></li>'
            +'<li><a href="articles.html?page=1">文章</a></li>'
            +'<li><a href="share.html">分享</a></li>'
            +'<li><a href="message.html">留言板</a></li>'
            +'<li><a href="about.html">关于</a></li>';
        return nav;
    }if(nowpage == 2){
        //文章
        nav = ' <li><a href="index.html">首页</a></li>'
            +'<li class="am-active"><a href="articles.html?page=1">文章</a></li>'
            +'<li><a href="share.html">分享</a></li>'
            +'<li><a href="message.html">留言板</a></li>'
            +'<li><a href="about.html">关于</a></li>';
        return nav;
    }if(nowpage == 3){
        //分享
        nav = ' <li><a href="index.html">首页</a></li>'
            +'<li><a href="articles.html?page=1">文章</a></li>'
            +'<li class="am-active"><a href="share.html">分享</a></li>'
            +'<li><a href="message.html">留言板</a></li>'
            +'<li><a href="about.html">关于</a></li>';
        return nav;
    }if(nowpage == 4){
        //留言板
        nav = ' <li><a href="index.html">首页</a></li>'
            +'<li><a href="articles.html?page=1">文章</a></li>'
            +'<li><a href="share.html">分享</a></li>'
            +'<li class="am-active"><a href="message.html">留言板</a></li>'
            +'<li><a href="about.html">关于</a></li>';
        return nav;
    }if(nowpage == 5){
        //关于
        nav = ' <li><a href="index.html">首页</a></li>'
            +'<li><a href="articles.html?page=1">文章</a></li>'
            +'<li><a href="share.html">分享</a></li>'
            +'<li><a href="message.html">留言板</a></li>'
            +'<li class="am-active"><a href="about.html">关于</a></li>';
        return nav;
    }

}

function getRight() {
    
}

module.exports = router;
