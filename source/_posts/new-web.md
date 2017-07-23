---
title: 备案, 重新搭建
date: 2017-07-23 01:47:40
tags: hexo
description: 重新搭建hexo后遇到的问题
---

## 重新搭建网站


周六, 网站要重新备案一次.....

腾讯云的服务器重新安装操作系统后, 重新搭建hexo, 出了很多问题.

### 问题列表

* `sh: highlight_alias.json: Permission denied`

    执行下面脚本:
    
    ```sh
    npm config set user 0
    npm config set unsafe-perm true
    ```
    
    然后重新安装 `hexo`
    
    > 注: nodejs8 会出现此问题, 6的版本直接过, 没有问题, 自己一直有升级高版本的强迫症, 这次纯粹自讨苦吃
    

* `hexo g` 后页面内容为空.

    执行 `hexo g` 后, 提示 `ARN  No layout: xxx` 等信息, 打开 `index.html` 页面, 内容是空的. 最后原因是 git clone 后没有安装对应的 `themes`.
    
    因为我用的是 `next` 主题, 所以按照官网的操作在下载一下就好了. [官网地址](http://theme-next.iissnan.com/getting-started.html)
    
### 修改主题

使用: [maupassant-hexo](https://www.haomwei.com/technology/maupassant-hexo.html)

```sh
git clone https://github.com/tufu9441/maupassant-hexo.git themes/maupassant
cnpm install hexo-renderer-jade@0.3.0 --save
cnpm install hexo-renderer-sass --save
```

> 记得修改为淘宝npm镜像
    
    
    


