---
title: Ubuntu_K8S_1.13_kubeadm搭建集群
date: 2018-12-28 23:20:14
tags: K8S
---

## Ubuntu_K8S_1.13_kubeadm搭建集群

本地通过`vmware fusion`搭建了安装了4台虚拟机, 通过这4台虚拟机来完成k8s集群的搭建工作, 用于日常学习.


### 前置条件

建议将系统的源改为国内源, 避免不必要的问题

* 中科大源使用帮助: http://mirrors.ustc.edu.cn/help/ubuntu.html
* 源自动配置使用工具: https://mirrors.ustc.edu.cn/repogen/

```sh
# 1. 更新源和安装必要的工具
sudo apt-get update && sudo apt-get install -y apt-transport-https

# 2. 添加国内镜像GPG证书
curl -s http://packages.faasx.com/google/apt/doc/apt-key.gpg | sudo apt-key add -

# 3. 添加镜像源
sudo cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb http://mirrors.ustc.edu.cn/kubernetes/apt/ kubernetes-xenial main
EOF

# 4. 更新源
sudo apt-get update
```

# 安装

```sh
apt-get install -y docker.io

sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://wlij5bh2.mirror.aliyuncs.com"]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker

## 开启自启dokcer
systemctl enable docker.service

# 关闭系统的Swap方法如下:
# 编辑`/etc/fstab`文件，注释掉引用`swap`的行，保存并重启后输入:
sudo swapoff -a

# ubuntu
cat /proc/swaps
swapoff -a
# /etc/fstab
Remove any matching reference found in /etc/fstab
reboot

## kubenetes 1.13 可以直接使用下面初始化

kubeadm init --image-repository registry.aliyuncs.com/google_containers --kubernetes-version v1.13.1 --pod-network-cidr=192.168.0.0/16

## 初始化完毕后, 可在其他节点执行下面语句, 添加K8S节点, 注意token值, 此值是在上一步执行完毕后, 系统显示的值
kubeadm join 10.233.75.10:6443 --token dn6m78.nyt3iaiohskjah5w --discovery-token-ca-cert-hash sha256:2c1965152b6f35847a9d278274c900b15fa136da6bc116746330a4b1fea9bcbb
  
## 非root用户
rm -rf $HOME/.kube/
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

## 下载镜像(非k8s1.13版本, 课通过此方法, 下载镜像, 否则由于网络限制, 可能导致镜像下载失败)
docker pull registry.aliyuncs.com/google_containers/kube-apiserver:v1.12.2 
docker pull registry.aliyuncs.com/google_containers/kube-controller-manager:v1.12.2
docker pull registry.aliyuncs.com/google_containers/kube-scheduler:v1.12.2
docker pull registry.aliyuncs.com/google_containers/kube-proxy:v1.12.2
docker pull registry.aliyuncs.com/google_containers/pause:3.1
docker pull registry.aliyuncs.com/google_containers/etcd:3.2.24
docker pull registry.aliyuncs.com/google_containers/coredns:1.2.2
docker pull registry.aliyuncs.com/google_containers/kubernetes-dashboard-amd64:v1.10.0

docker tag registry.aliyuncs.com/google_containers/kube-apiserver:v1.12.2 k8s.gcr.io/kube-apiserver:v1.12.2
docker tag registry.aliyuncs.com/google_containers/kube-controller-manager:v1.12.2 k8s.gcr.io/kube-controller-manager:v1.12.2
docker tag registry.aliyuncs.com/google_containers/kube-scheduler:v1.12.2 k8s.gcr.io/kube-scheduler:v1.12.2
docker tag registry.aliyuncs.com/google_containers/kube-proxy:v1.12.2 k8s.gcr.io/kube-proxy:v1.12.2
docker tag registry.aliyuncs.com/google_containers/pause:3.1 k8s.gcr.io/pause:3.1
docker tag registry.aliyuncs.com/google_containers/etcd:3.2.24 k8s.gcr.io/etcd:3.2.24
docker tag registry.aliyuncs.com/google_containers/coredns:1.2.2 k8s.gcr.io/coredns:1.2.2
docker tag registry.aliyuncs.com/google_containers/kubernetes-dashboard-amd64:v1.10.0 k8s.gcr.io/kubernetes-dashboard-amd64:v1.10.0

docker rmi registry.aliyuncs.com/google_containers/kube-apiserver:v1.12.2 
docker rmi registry.aliyuncs.com/google_containers/kube-controller-manager:v1.12.2
docker rmi registry.aliyuncs.com/google_containers/kube-scheduler:v1.12.2
docker rmi registry.aliyuncs.com/google_containers/kube-proxy:v1.12.2
docker rmi registry.aliyuncs.com/google_containers/pause:3.1
docker rmi registry.aliyuncs.com/google_containers/etcd:3.2.24
docker rmi registry.aliyuncs.com/google_containers/coredns:1.2.2
docker rmi registry.aliyuncs.com/google_containers/kubernetes-dashboard-amd64:v1.10.0

apt-get install -y kubeadm

初始化kubeadm 

kubeadm config print-config > init.yaml


# 安装网络插件
插件文档: https://kubernetes.io/docs/concepts/cluster-administration/addons/

demo选用 Weave Net

安装: https://github.com/kubernetes/dashboard

修改配置:
kubectl -n kube-system edit service kubernetes-dashboard

修改为:

kind: Service
apiVersion: v1
metadata:
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kube-system
spec:
  ports:
    - port: 443
      targetPort: 8443
      nodePort: 31111
  selector:
    k8s-app: kubernetes-dashboard
  type: NodePort

如上两点: nodePort: 31111, type: NodePort

访问: https//master节点ip:3111

创建访问权限: 

新建yaml文件, 如: account.yaml 文件内容:

# Create Service Account
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system
---
# Create ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system

执行: kubectl create -f account.yaml
查询访问token: kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')

如下: 

Name:         admin-user-token-2rg44
Namespace:    kube-system
Labels:       <none>
Annotations:  kubernetes.io/service-account.name: admin-user
              kubernetes.io/service-account.uid: a6b51095-eda0-11e8-b73c-001c42a92496

Type:  kubernetes.io/service-account-token

Data
====
ca.crt:     1025 bytes
namespace:  11 bytes
token:      eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJhZG1pbi11c2VyLXRva2VuLTJyZzQ0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImFkbWluLXVzZXIiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiJhNmI1MTA5NS1lZGEwLTExZTgtYjczYy0wMDFjNDJhOTI0OTYiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06YWRtaW4tdXNlciJ9.tSXCa-mMCu3vXXns8sQI1JqUM5A_WyxrKgK3ioqVs4kGHQPA7vbWyuSZ1yEWR0zPRNEbq3L8rY2j8YTQVbl-73-1Kuj_1-5wGZvfyIMr4oYD_-u1KIVTn-OFRrr-QCb1eWw1CmeJ1QH3epPcIjNQHl_wcZmOOCwj6SaUVfUeN_XDVHda7OKNoyJpDtCB4AWrMy6_GcziVhC6i8vSHVpwROuGU7fP6S6KReOlu2hyrroDN1c-mRvVVPoAS_NMX-_WBmW8RAodCVQ3rbSs7VsPeFhnmtry5sQP95yylNKQ-AMiyahBbSZgKkjP5-v88k5e6h9ysUfx98-Pdm3aFM6k-w

```

#### 监控组件 - Heapster 部署

```sh

# 新建文件夹，用于存放 Heapster 部署所需的 yaml 文件
mkdir heapster
cd heapster

# 获取相关 yaml 文件
wget https://raw.githubusercontent.com/kubernetes/heapster/master/deploy/kube-config/influxdb/grafana.yaml
wget https://raw.githubusercontent.com/kubernetes/heapster/master/deploy/kube-config/influxdb/heapster.yaml
wget https://raw.githubusercontent.com/kubernetes/heapster/master/deploy/kube-config/influxdb/influxdb.yaml
wget https://raw.githubusercontent.com/kubernetes/heapster/master/deploy/kube-config/rbac/heapster-rbac.yaml

docker pull registry.aliyuncs.com/google_containers/heapster-grafana-amd64:v5.0.4
docker pull registry.aliyuncs.com/google_containers/heapster-amd64:v1.5.4
docker pull registry.aliyuncs.com/google_containers/heapster-influxdb-amd64:v1.5.2

docker tag registry.aliyuncs.com/google_containers/heapster-grafana-amd64:v5.0.4 k8s.gcr.io/heapster-grafana-amd64:v5.0.4
docker tag registry.aliyuncs.com/google_containers/heapster-amd64:v1.5.4 k8s.gcr.io/heapster-amd64:v1.5.4
docker tag registry.aliyuncs.com/google_containers/heapster-influxdb-amd64:v1.5.2 k8s.gcr.io/heapster-influxdb-amd64:v1.5.2

docker rmi registry.aliyuncs.com/google_containers/heapster-grafana-amd64:v5.0.4
docker rmi registry.aliyuncs.com/google_containers/heapster-amd64:v1.5.4
docker rmi registry.aliyuncs.com/google_containers/heapster-influxdb-amd64:v1.5.2

kubectl create -f *.yaml
```

以上一个K8S的集群搭建完毕.
