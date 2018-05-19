## 登录中转服务器

``` bash
ssh sjg@47.91.227.144
```


## 更新源码

直接在中转服务器上直接 pull 源码

## 部署镜像

1. 生成 image

``` bash
sudo docker build -t gcr.io/pking-ok/pking-http:v${版本号} .
```

2. 推送到 gcloud 仓库（部署到 k8s 集群的时候，需要从 gcloud 仓库拉取该镜像）

``` bash
sudo gcloud docker -- push gcr.io/pking-ok/pking-http:v${版本号}
```



## 部署到 k8s 集群

1. 部署（包括更新镜像）

``` bash
sh generate.sh
```



2. 初始化数据

查看 pod
``` bash
# kubectl get pod | grep pking-http
pking-http-69bff844cb-7hdpt      1/1       Running   0          8m
pking-http-69bff844cb-vn6ck      1/1       Running   0          8m
pking-http-69bff844cb-zd426      1/1       Running   0          8m
```

如果是第一次部署，则从任意一个 pod 中执行初始化命令 make prestart（注意只需要执行一次）。
``` bash
kubectl exec -it pking-http-69bff844cb-7hdpt -- make prestart
```

查看服务状态：
``` bash
# kubectl logs pking-http-69bff844cb-7hdpt
Server success run at 3000
数据库：mongodb://main_admin:abc123@mongos-router-service.default.svc.cluster.local:27017/pking?authSource=admin连接成功
```



3. 查看服务 ip

等待大约1分钟，然后查看效果：
``` bash
# kubectl get svc | grep pking
NAME             TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)              AGE
pking-http       LoadBalancer   10.19.243.219   35.202.11.63     3000:31121/TCP       48s
```

EXTERNAL-IP:PORT 就是 app 访问服务地址，这里是`35.202.11.63:3000`



## 维护

删除
``` bash
sh generate.sh
```

更新
``` bash
sh teardown.sh
```
