---
title: 2017年的第一天, 给自己的网站加个"S"
date: 2017-01-01 00:28:24
tags: https
categories: Nginx
description: http到https
toc: true
---

## 2017年的第一天, 给自己的网站加个"S"

* 苹果从2017年1月1日起强制新提交的App使用https请求
* 很多站点已全站使用https
* ...

https是以后的趋势, 以前我的站点是挂在Github上的, 所以没办法给站点加这个"s", 2016年的最后一天, 下了狠心, 买了腾讯云的虚拟主机(不要问我为啥不用阿里云, 因为腾讯云便宜...). 顺便就给站点加个"s"吧. 

给站点加"s"的关键点是申请证书, 目前申请免费证书的方法很多.

* 阿里云的个人免费证书, 赛门铁克(Symantec)签发, 支持顶级域名(xx.com), 1年有效期
* 腾讯云的个人免费证书, 亚洲诚信(TrustAsia)签发, 不支持顶级域名(xx.com), 只支持一级域名(www.xx.com), 1年有效期
* Let’s Encrypt 申请, 此种方式最为流行. 3个月有效期(可通过定时脚本, 自动重新申请).


开始我申请的是腾讯云的证书, 绑定域名"www.fuxiao86.com", 所以已"fuxiao86.com"访问则会提示非安全(当然你可以使用`nginx`强制跳转). 所有使用`Let's Encrypt`, 在虚拟机上折腾了好一阵, 腾讯云的`git clone`速度慢的要死, 最终放弃. 在阿里云上重新申请, 申请完毕后, 在虚拟主机上部署. 终于这个"s"加上去了.

部署中没有什么难度. 比较纠结的是域名的跳转问题:

1. `http`强制跳转`https`
2. `fuxiao86.com`强制跳转`www.fuxiao86.com`

这两个问题, 需要一起处理, `google`了半天, 具有参考价值的是nginx官网的[一篇文章](http://nginx.org/en/docs/http/converting_rewrite_rules.html). 很多博客上的参考示例都是nginx标注错误的配置方法. 参考nginx的这篇文章, 我的配置大致是这样子的:

```sh
server {
   listen 80;
   server_name fuxiao86.com;
   return 301 https://www.$host$request_uri;
}

server {
   listen 80;
   server_name www.fuxiao86.com;
   return 301 https://$host$request_uri;
}
```

上面两个`server`的配置, 目的是

1. 将`http://fuxiao86.com`跳转至`https://www.fuxiao86.com`, 
2. 将`http://www.fuxiao86.com`跳转至`https://www.fuxiao86.com`.

还有一个`https://fuxiao86.com`跳转至`https://www.fuxiao86.com`的问题没有解决.
这个问题我没有查到好的办法. 也是利用上面的原理. 如下:

```sh
    server {

        server_name  fuxiao86.com;
        listen       443 ssl;

        ssl_certificate cert/fuxiao86.com.pem;
        ssl_certificate_key cert/fuxiao86.com.key;
        ssl_session_timeout 5m;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;
        
        ......

        return 301 https://www.$host$request_uri;
    }
```

至此, 我的两个问题算是解决了, 个人觉得不完美. 如果你有什么好的配置方法, 请一定要告诉我. 我的邮箱: fuxiao86@163.com.




