---
title: ElasticSearch学习笔记
date: 2018-06-10 19:02:27
tags:
---

# ElasticSearch学习

## 文档


#### 文档元数据

_index: 文档在哪存放
_type: 文档对象类别
_id: 文档唯一标识

* _index 索引

索引: 名字必须小写, 不能包含逗号, 不能以下划线开头.

一个索引应该是因共同的特性被分组到一起的文档集合. 例如: 你可能存储所有的商品到product索引中.

* _type 类型

_type(类型)允许在索引中对数据进行逻辑分区, 比如对产品划分不同的类型. 不同的types的文档可能有不同的字段, 但最好能够非常相似. 

类型: 名字可以小写, 大写, 但不能以下划线或者句号开头, 不应该包含逗号, 并且长度限制为256个字符. 

* _id 

id是一个字符串, _id, _type, _index 可以在elastic中确定一个文档. 创建一个文档时, _id要么自己提供, 要么让elastic帮你生成.

#### 索引文档

一个文档的 `_index`, `_type`, `_id`唯一标识一个文档. 我们可以提供自定义的`_id`, 或者让elastic帮你生成一个`_id`

* 使用自定义ID

```sh
POST /{index}/{type}/{id}
```

* 自动生成ID

```sh
POST /{index}/{type}
```

#### 获取一个文档

```
Get /{index}/{type}/{id}

-- Response
{
    "_index": "website",
    "_type": "blog",
    "_id": "AV93p7aYfWxcWfV5Guob",
    "_version": 1,
    "found": true,
    "_source": {
        "title": "My second blog entry",
        "text": "Still trying this out...",
        "date": "2014/01/01"
    }
}
```

> ?pretty : 加上此参数会让elastic调用pretty-print功能, 使得json输出格式化, 但是， `_source` 字段不能被格式化打印出来.

* `found`字段: true 表示文档找到了, false 表示文档没有找到, 另外http响应吗为`404`

#### 获取一个文档的部分字段

默认Get获取整个文档, 如果只对文档的部分字段感兴趣, 可以在`URL`中添加`_source`参数.多个字段也能使用逗号分隔的列表来指定。

```sh
Get /website/blog/123?_source=title,text
```

如果只想得到文档的`_source`字段, 不想要文档的元数据, 可以使用`URL`+`_source`端点获取

```sh
Get /website/blog/123/_source
```

#### 检测文档是否存在

使用 `HEAD` 请求, `HEAD`请求没有body, 如果存在, 则返回200状态码, 否则返回404状态码

```sh
HEAD /{_index}/{_type}/{_id}
```

#### 更新文档

在Elastic中, 文档是不可修改的, 不能修改它们, 如果想要更新现有的文档, 需要`重建索引或者进行替换`. 

```sh
PUT /{_index}/{_type}/{_id}
{
文档
}

-- Response
{
    "_index": "website",
    "_type": "blog",
    "_id": "123",
    "_version": 2,
    "result": "updated",
    "_shards": {
        "total": 2,
        "successful": 1,
        "failed": 0
    },
    "created": false
}
```

注意:

1. `_version`: 此字段值会累加
2. `created`: 此字段会变为false, 是因为相同的索引、类型和 ID 的文档已经存在。

#### 创建一个新文档

`_index`, `_type`, `_id`三个元素确定一个文档, 所以, **确保创建一个新文档的最简单办法是: 使用索引请求的POST方式让Elasticsearch自动生成一个唯一`ID`**

如果必须使用自己的 `_id`, 并且只有在 `_index`, `_type`, `_id`不存在的情况下才新建, 有两种方法:

1. 使用 `op_type` 查询字符串参数

    ```sh
    PUT /{_index}/{_type}/{_id}?op_type=create
    {...}
    ```
    
2. 在末端使用 `/_create`

    ```sh
    PUT /{_index}/{_type}/{_id}/_create
    {...}
    ```
    
    如果新建文档请求成功, 则响应码返回 `201 Create`, 如果新建文档已存在(即_index, _type, _id相等), 则响应吗返回 `409 Conflict`
    
#### 删除文档

使用 `DELETE` 请求删除文档

```sh
DELETE /{_index}/{_type}/{_id}
```

#### 处理文档冲突

###### 乐观锁

* 在修改删除请求时,可以通过在URL添加`version=版本号`来控制.
* 通过外部系统版本号控制. `?version=外部版本号&version_type=external`

#### 更新部分文档

请求方法: POST, 关键字: `/_update`, 在URL尾部添加关键字 `/_update`

```sh
curl -XPOST 'localhost:9200/website/blog/1/_update?pretty' -H 'Content-Type: application/json' -d'
{
   "doc" : {
      "tags" : [ "testing" ],
      "views": 0
   }
}
'
```

* 可以使用脚本来更新文档字段. `ctx._source`

```sh
curl -XPOST 'localhost:9200/website/blog/1/_update?pretty' -H 'Content-Type: application/json' -d'
{
   "script" : "ctx._source.views+=1"
}
'

```

* 如果更新的文档尚不存在, 在body请求中添加关键字 `upsert`

```sh
curl -XPOST 'localhost:9200/website/pageviews/1/_update?pretty' -H 'Content-Type: application/json' -d'
{
   "script" : "ctx._source.views+=1",
   "upsert": {
       "views": 1
   }
}
'
```

* 更新冲突解决, 在URL中添加`retry_on_conflict=重试次数`

```sh
curl -XPOST 'localhost:9200/website/pageviews/1/_update?retry_on_conflict=5&pretty' -H 'Content-Type: application/json' -d'
{
   "script" : "ctx._source.views+=1",
   "upsert": {
       "views": 0
   }
}
'
```

#### 获取多个文档

可以将获取多个文档的请求合并为一个

```
curl -XGET 'localhost:9200/_mget?pretty' -H 'Content-Type: application/json' -d'
{
   "docs" : [
      {
         "_index" : "website",
         "_type" :  "blog",
         "_id" :    2
      },
      {
         "_index" : "website",
         "_type" :  "pageviews",
         "_id" :    1,
         "_source": "views"
      }
   ]
}
'
```

如果检索对象包含相同的, _index, _type, 则可以这样:

```
curl -XGET 'localhost:9200/website/blog/_mget?pretty' -H 'Content-Type: application/json' -d'
{
   "docs" : [
      { "_id" : 2 },
      { "_type" : "pageviews", "_id" :   1 }
   ]
}
'

GET /website/blog/_mget
{
   "ids" : [ "2", "1" ]
}

```

#### 代价较小的批量操作

bulk API 允许在单个步骤中进行多次 create 、 index 、 update 或 delete 请求

```
curl -XPOST 'localhost:9200/_bulk?pretty' -H 'Content-Type: application/json' -d'
{ "delete": { "_index": "website", "_type": "blog", "_id": "123" }} 
{ "create": { "_index": "website", "_type": "blog", "_id": "123" }}
{ "title":    "My first blog post" }
{ "index":  { "_index": "website", "_type": "blog" }}
{ "title":    "My second blog post" }
{ "update": { "_index": "website", "_type": "blog", "_id": "123", "_retry_on_conflict" : 3} }
{ "doc" : {"title" : "My updated blog post"} }
'

```

最佳的批量做法: 通过批量索引典型文档，并不断增加批量大小进行尝试。 当性能开始下降，那么你的批量大小就太大了。一个好的办法是开始时将 1,000 到 5,000 个文档作为一个批次, 如果你的文档非常大，那么就减少批量的文档个数。

密切关注你的批量请求的物理大小往往非常有用，一千个 1KB 的文档是完全不同于一千个 1MB 文档所占的物理大小。 一个好的批量大小在开始处理后所占用的物理大小约为 5-15 MB。


