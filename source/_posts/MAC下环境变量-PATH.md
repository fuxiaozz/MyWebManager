---
title: MAC下环境变量$PATH
date: 2019-02-26 12:47:32
tags: macos
---
## MAC环境变量`$PATH`

macos 以下设置会影响 `$PATH` 变量

* `/etc/paths`
* `/etc/paths.d`, 这是一个文件夹, 其中包含的文件会影响`$PATH`变量.
* 如果使用`bash`环境(系统默认), 那么`~/.bash_profile`, `~/.bashrc`会影响`$PATH`
* 如果使用`zsh`环境, 那么`~/.zshrc`会影响`$PATH`

以上中`/etc/paths.d`文件加下文件是平常忽视的, 我在检查`$PATH`时发现, 明明都改掉了`GOROOT`路径了, 但是新版就是不生效, 查了好多文件都找不到`PATH`中第一个`go`命令路径在哪设置的, 最后才知道是`/etc/paths.d`文件夹下设置的.