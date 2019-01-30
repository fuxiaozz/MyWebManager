---
title: CoreOS本地VM安装
date: 2018-10-21 23:06:00
tags:
---


## CoreOS本地VM安装

### 镜像准备

#### 前期准备

1. 下载文件

    * https://raw.githubusercontent.com/coreos/init/master/bin/coreos-install
    * http://stable.release.core-os.net/amd64-usr/current/coreos_production_image.bin.bz2
    * http://stable.release.core-os.net/amd64-usr/current/coreos_production_image.bin.bz2.sig

2. 生成公钥

    ```sh
    ssh-keygen
    ```

2. 新建 `cloud-config.yaml` 文件

    ```yaml
    #cloud-config
    
    hostname: coreos1

    coreos:  
      etcd:    
        addr: $private_ipv4:4001
        peer-addr: $private_ipv4:7001
      units:
        - name: etcd.service
          command: start
        - name: fleet.service
          command: start
        - name: static.network
          content: |
            [Match]
            Name=enp3s0
    
            [Network]
            Address=192.168.1.103/24 # 修改为自己的IP
            Gateway=192.168.1.254    # 修改为自己的网关
            DNS=8.8.8.8
            DNS=8.8.4.4
    users:  
      - name: core
        ssh-authorized-keys: 
          - ssh-rsa  #id_rsa.pub文件里的内容粘贴在这里
    
      - groups:
          - sudo
          - docker
    ```

#### 搭建局域网安装环境

* 局域网准备一台Nginx/Apache服务器
* 将下载的文件放到Web服务器的根节点
* livecd引导启动系统，建立安装环境。
* sudo passwd root   # 修改root用户的密码
* sudo passwd core   # 修改core用户密码
* 配置静态IP配置

  ```
  #在目录/etc/systemd/network/目录下
  touch static.network
  vi static.network
  # 保存以下内容
  [Match]  
  Name=eth0 #网卡名  
  
  [Network]  
  Address=192.168.1.103/24  # 静态IP
  Gateway=192.168.1.254 # 网关
  DNS=xxxx
  DNS=xxxx

  # 重启网卡
  sudo systemctl restart systemd-networkd
  ```
  
* 执行正式安装命令： 

    ```sh
    ./coreos-install -d /dev/sda -C stable -c cloud-config.yaml -b http://服务器地址/ -V current 
    # -d 是指定安装磁盘 
    # -C 大写C是指定coreos的升级通道 
    # -c 指定配置文件（到这里发现其实这个也可以放在http目录里就好了，没必要下载的，试过了这种方法不被支持，还是得下载） 
    # -b 指定baseurl，就是指定安装的二进制文件的存放位置，不考虑网速时可以用官方的网站（http://stable.release.core-os.net/amd64-usr/）代替，
    # -V 指定的是 baseurl后面的下一级目录，这里指定的是current,对应着192.168.16.10/current/，
    # 所以这个命令也可以改为 $ sudo coreos-install -d /dev/sda -C stable -c cloud-config.yaml -b http://stable.release.core-os.net/amd64-usr/ -V current
    ```

#### 挂在Live-CD修复

* 挂载ISO镜像, 启动, 注意调整启动顺序
* sudo su root
* mount /dev/sda9 /mnt
* 修改/mnt下的文件 如配置网卡

##### 启动密码重置

![](media/15321541124271/15095255274706.jpg)

* 按e进入 grub 页面 在命令行下直接输入一下内容

`console=tty0 console=ttyS0 coreos.autologin=tty1 coreos.autologin=ttyS0`

输入完毕, `ctrl + x` 启动, 进入console页面, `sudo su root` 修改密码, 重启服务器.

#### 错误处理

1. 启动报错:

```
Failed Units: 1
  user-cloudinit@var-lib-coreos\x2dinstall-user_data.service
```

解决方案: 

```
cd /var/lib/coreos-install/
rm user_data
reboot
```