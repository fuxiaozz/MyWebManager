---
title: 蓝鲸CMDB部署个人整理
date: 2018-07-21 14:21:43
description: 蓝鲸CMDB
toc: true
---

## 蓝鲸_CMDB_Docker部署文档

#### MongoDB

```sh
启动容器
docker run -d --name cmdb-mongo -p 27027:27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=Root1q2w  mongo

进入容器执行脚本
docker exec -i -t cmdb-mongo bash

mongo --port 27027 -u root -p Root1q2w --authenticationDatabase admin
use cmdb
db.createUser({user: "cc",pwd: "cc",roles: [ { role: "readWrite", db: "cmdb" } ]})
```

#### Redis

```sh
## /Users/lony/redis
mkdir redis && cd redis && mkdir conf && mkdir db
## 下载官网redis, 将redis.conf 复制到 conf 目录下
## 修改内容
port 16379
daemonize no
pidfile /db/redis_16379.pid
logfile "/db/redis.log"
requirepass Root1q2w
dir /db

docker run -d -p 16379:16379 -v /Users/lony/redis/conf/redis.conf:/etc/redis/redis.conf -v /Users/lony/redis/db:/db  -v /Users/lony/redis/db:/data --name cmdb-redis redis redis-server /etc/redis/redis.conf
```

#### ZooKeeper

* 单机

```sh
#/conf/ 将 zoo.sample.cfg 重命名为 zoo.cfg
# 默认端口号: 2181
zkServer.sh start
```

#### cmdb启动

```sh
python init.py --discovery 127.0.0.1:2181 --database cmdb --redis_ip 127.0.0.1 --redis_port 16379 --redis_pass Root1q2w --mongo_ip 127.0.0.1 --mongo_port 27027 --mongo_user cc --mongo_pass cc --blueking_cmdb_url http://10.233.72.49:8083 --listen_port 8083
```
