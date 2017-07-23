---
title: hexo优化
date: 2016-10-17 13:43:45
tags: hexo
categories: 杂谈
description: 优化你的Hexo
toc: true
---

## GithubPage上hexo的优化

建站后发现网站访问奇慢无比, 个人无法忍受, 搜集各种优化方法, 总结一下.

1. js, css, image 压缩. 此方法最为实用, 分分钟将hexo生成的代码体积减小. 加快客户端下载. 本人使用`gulp`, 配置如下, 仅供参考, 具体方法可百度`gulp`

    ```js
    var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        cssmin = require('gulp-minify-css'),
        imagemin = require('gulp-imagemin');

    //JS压缩
    gulp.task('uglify', function() {
        return gulp.src('./public/js/src/*.js')
            .pipe(uglify())
            .pipe(gulp.dest('././public/js/src/'));
    });

    //CSS压缩
    gulp.task('cssmin', function() {
        return gulp.src('./public/css/main.css')
            .pipe(cssmin())
            .pipe(gulp.dest('./public/css/'));
    });
    //图片压缩
    gulp.task('images', function() {
        gulp.src('./public/images/*.*')
            .pipe(imagemin({
                progressive: false
            }))
            .pipe(gulp.dest('././public/images/'));
    });

    gulp.task('build', ['uglify', 'cssmin', 'images']);
    ```

2. `next`主题第三方库加载,  具体可参考[next的进阶](http://theme-next.iissnan.com/advanced-settings.html), 这点也非常重要.
3. DNS优化, 这个比较曲折, 先是使用万网的DNS, 所有又使用DNSPod的DNS, 最后又迁移到万网的DNS. 目前使用的是万网的DNS解析. 使用DNSPod是看上了DNSPod的免费cdn, 但不知为什么, PC可以解析域名, 到移动终端上却无法解析. 最后又迁移到万网了. 最后如果不差钱, 你可以买阿里云的`CDN`, 反正我只能看看......
4. 木有了, 因为使用的GithubPage, 我感觉能做的就这些了, 如果有个人的服务器, 还可以做很多优化, 如`gzip`


