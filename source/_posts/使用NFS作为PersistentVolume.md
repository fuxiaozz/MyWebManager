---
title: 使用NFS作为PersistentVolume
date: 2019-02-03 23:02:01
tags: K8S
---

# 使用NFS作为PersistentVolume

`Kubernetes in Action`第六章的PV, PVC的实例是基于GCE的, 我这里本地实验, 使用NFS代替.

下面记录一下整个过程.

## 新建VM主机

新建一台虚拟机, 作为NFS主机. 我本地设置的NFS主机IP为: `10.233.75.50`.

## NFS服务器配置

```sh
sudo yum install nfs-utils
sudo systemctl enable rpcbind
sudo systemctl enable nfs

# 由于我是基于K8S的VM直接复制的, 所以默认防火墙是关闭的, 这里我就不需要这一步了
sudo firewall-cmd --zone=public --permanent --add-service=rpc-bind
sudo firewall-cmd --zone=public --permanent --add-service=mountd
sudo firewall-cmd --zone=public --permanent --add-service=nfs
sudo firewall-cmd --reload

sudo mkdir /data
sudo chmod 755 /data
sudo vi /etc/exports
# 添加如下配置
# /data/     192.168.0.0/24(rw,sync,no_root_squash,no_all_squash)
# 我这里是自己使用, 所以我使用*, 表示没有限制
# /data: 共享目录位置。
# 192.168.0.0/24: 客户端 IP 范围，* 代表所有，即没有限制。
# rw: 权限设置，可读可写。
# sync: 同步共享目录。
# no_root_squash: 可以使用 root 授权。
# no_all_squash: 可以使用普通用户授权。

sudo systemctl restart nfs

# 可以检查一下本地的共享目录
showmount -e localhost
# 如下显示
# Export list for localhost:
# /data 192.168.0.0/24
```

## K8S节点全部节点安装NFS客户端

```sh
sudo yum install nfs-utils
```

> K8S全部节点必须都安装NFS, 否则POD创建会报错.
> K8S全部节点必须都安装NFS, 否则POD创建会报错.
> K8S全部节点必须都安装NFS, 否则POD创建会报错.

## K8S创建PV, PVC

* PV

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongodb-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
  - ReadWriteOnce
  - ReadOnlyMany
  persistentVolumeReclaimPolicy: Retain
  nfs:
    server: 10.233.75.50
    path: /data
```

* PVC

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
spec:
  resources:
    requests:
      storage: 1Gi
  accessModes:
  - ReadWriteOnce
  storageClassName: ""
```

## 测试

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mongodb
spec:
  containers:
  - image: mongo
    name: mongodb
    volumeMounts:
    - name: mongodb-data
      mountPath: /data/db
    ports:
    - containerPort: 27017
      protocol: TCP
  volumes:
  - name: mongodb-data
    persistentVolumeClaim:
      claimName: mongodb-pvc
```

创建Pod成功后, 登陆NFS主机, 会看到`/data`目录下会有mongdb的初始化文件.

> 参考
> NFS操作: `https://qizhanming.com/blog/2018/08/08/how-to-install-nfs-on-centos-7`
> K8S操作: `Kubernetes in Action 中文版`