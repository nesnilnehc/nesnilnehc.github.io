---
layout: post
title: "PostgreSQL 幂等写入：ON CONFLICT 的四个坑，以及标准 MERGE 怎么选"
description: "ON CONFLICT 不在 ISO/IEC SQL 标准里，标准方案是 SQL:2003 起的 MERGE。本文给出四个高频报错的成因与解法、两种写法的实测差异，以及按并发安全、唯一索引、可移植性三个维度的选择依据。"
date: 2026-08-06 15:30:00 +0800
categories: [tech]
tags: [PostgreSQL, SQL, SQL 标准, 数据清洗]
article_type: concept
difficulty: intermediate
content_score: 8.2
score_basis: "四个报错、两种写法的差异都在 PostgreSQL 16.14 与 18.4 上实测，并核对了 PostgreSQL 官方兼容性说明与 SQL 一致性特性编号；不足是并发安全的差异只引用文档结论，未给出可复现的竞态实验。"
permalink: /tech/postgresql-upsert-on-conflict-vs-merge/
---

导入脚本要能重跑，就需要「已存在则更新、不存在则插入」这一类幂等写入。PostgreSQL 有两种写法：`INSERT ... ON CONFLICT` 和 `MERGE`。**先说结论：`ON CONFLICT` 不是 ISO/IEC SQL 标准语法，PostgreSQL 官方文档明确把它标为扩展，并指向 `MERGE` 作为「更符合标准」的选择；但在最常见的「按唯一键 upsert」场景下，官方仍建议用 `ON CONFLICT`，因为只有它能处理并发插入。**

| 你的情况 | 用哪个 |
| --- | --- |
| 按主键或唯一键 upsert，且有并发写入 | `INSERT ... ON CONFLICT DO UPDATE` |
| 只想补缺，已存在的原样保留 | `INSERT ... ON CONFLICT DO NOTHING` |
| 匹配条件不是唯一索引（任意连接条件） | `MERGE` |
| 一条语句里同时要插入、更新和删除 | `MERGE` |
| SQL 要在 Oracle、SQL Server、Db2 之间移植 | `MERGE` |

本文语句在 PostgreSQL 16.14 上实测，标注「18 起」的部分在 18.4 上实测。姊妹篇讲物理行地址：[PostgreSQL ctid 实战]({{ '/tech/postgresql-ctid/' | relative_url }})。

## ON CONFLICT 的基本形态

`EXCLUDED` 是一张虚拟表，代表「本次想插入但被挡下的那一行」。冲突时用它覆盖目标表：

```sql
INSERT INTO product (sku, name, price) VALUES
  ('A-1', '新名称', 12.00),
  ('B-2', '新品', 20.00)
ON CONFLICT (sku) DO UPDATE
  SET name = EXCLUDED.name,
      price = EXCLUDED.price,
      updated_at = now();
```

`A-1` 已存在就更新，`B-2` 不存在就插入。整条语句是原子的，冲突判定由唯一索引兜底，不需要先 `SELECT` 再决定走哪条路。

## 坑一：冲突目标必须有唯一索引

`ON CONFLICT (col)` 里的列不是随便写的，PostgreSQL 要用它去推断一个唯一索引或唯一约束。目标列上没有唯一索引时：

```text
ERROR:  there is no unique or exclusion constraint matching the ON CONFLICT specification
```

见到这个报错，先查目标列上到底有没有唯一索引，而不是去改 SQL 语法。这是 `ON CONFLICT` 与 `MERGE` 最根本的差别：前者的冲突判定绑定在索引上，后者的 `ON` 只是普通连接条件。

## 坑二：部分唯一索引要把 WHERE 抄一遍

只对未删除记录建唯一索引很常见：

```sql
CREATE UNIQUE INDEX acct_email_live ON acct (email) WHERE NOT deleted;
```

此时 `ON CONFLICT (email)` 依然报「找不到唯一约束」，必须把索引的谓词原样写进冲突目标：

```sql
INSERT INTO acct (id, email) VALUES (2, 'a@x.com')
ON CONFLICT (email) WHERE NOT deleted DO UPDATE
  SET id = EXCLUDED.id;
```

## 坑三：源数据自身重复，两种写法都会失败

`ON CONFLICT` 只解决「新数据与表中已有数据」的冲突，不解决「同一条语句内部」的冲突：

```sql
INSERT INTO product (sku, name, price) VALUES
  ('D-4', '第一次', 1.00),
  ('D-4', '第二次', 2.00)
ON CONFLICT (sku) DO UPDATE SET price = EXCLUDED.price;
```

```text
ERROR:  ON CONFLICT DO UPDATE command cannot affect row a second time
HINT:  Ensure that no rows proposed for insertion within the same command have duplicate constrained values.
```

换成 `MERGE` 并不能绕过去，只是换个报错。源数据里两行都命中同一条已存在的目标行时：

```text
ERROR:  MERGE command cannot affect row a second time
HINT:  Ensure that not more than one source row matches any one target row.
```

而两行都走 `WHEN NOT MATCHED` 分支时，`MERGE` 会实打实地插两次，直接撞唯一约束：

```text
ERROR:  duplicate key value violates unique constraint "product_pkey"
```

结论是：**源数据的去重是你自己的责任，不是 upsert 语法能替你兜的。** 最直接的解法是 `DISTINCT ON`，它保留每个键在 `ORDER BY` 下的第一行：

```sql
WITH src(sku, name, price, ord) AS (
  VALUES ('D-4', '第一次', 1.00, 1), ('D-4', '第二次', 2.00, 2)
)
INSERT INTO product (sku, name, price)
SELECT DISTINCT ON (sku) sku, name, price
FROM src
ORDER BY sku, ord DESC
ON CONFLICT (sku) DO UPDATE SET price = EXCLUDED.price;
```

`ORDER BY sku, ord DESC` 表示同一个 `sku` 保留 `ord` 最大的那条，也就是「最后一次的值胜出」。

`DISTINCT ON` 同样是 PostgreSQL 扩展。标准写法要绕一层：先用窗口函数编号，再在外层过滤（窗口函数不能直接写进 `WHERE`）。

```sql
WITH src(sku, name, price, ord) AS (
  VALUES ('D-4', '第一次', 1.00, 1), ('D-4', '第二次', 2.00, 2)
)
INSERT INTO product (sku, name, price)
SELECT sku, name, price FROM (
  SELECT sku, name, price,
         ROW_NUMBER() OVER (PARTITION BY sku ORDER BY ord DESC) AS rn
  FROM src
) t
WHERE rn = 1
ON CONFLICT (sku) DO UPDATE SET price = EXCLUDED.price;
```

## 坑四：DO NOTHING 时 RETURNING 拿不到行

想实现「插入或取回已有 id」时，很容易写成这样：

```sql
INSERT INTO product (sku, name, price) VALUES ('A-1', 'x', 1)
ON CONFLICT (sku) DO NOTHING
RETURNING sku;
```

冲突时这条语句返回 **0 行**——被跳过的行不进 `RETURNING`。要拿到已存在的行，必须再补一次 `SELECT`，或者改用 `DO UPDATE SET sku = EXCLUDED.sku` 这种空更新（代价是产生死元组）。

## 只在值真的变了时才更新

`DO UPDATE` 后面可以再挂 `WHERE`，条件不成立就跳过这一行：

```sql
INSERT INTO product (sku, name, price) VALUES ('A-1', '再改一次', 13.00)
ON CONFLICT (sku) DO UPDATE
  SET name = EXCLUDED.name,
      price = EXCLUDED.price,
      updated_at = now()
  WHERE product.name  IS DISTINCT FROM EXCLUDED.name
     OR product.price IS DISTINCT FROM EXCLUDED.price;
```

`WHERE` 里用表名前缀指现有行，用 `EXCLUDED` 指待插入行。三个收益：`updated_at` 只在内容真的变化时才动；不产生无意义的死元组，减少 VACUUM 压力；不会白白触发 UPDATE 触发器。用 `IS DISTINCT FROM` 而不是 `<>`，是为了让 NULL 参与比较时结果仍然是真假而不是 NULL。

实测把同一批数据重跑第二遍，加了这个 `WHERE` 之后 `ROW_COUNT` 合计为 0——这才是「可重跑」的实际含义。

## 区分插入与更新

PostgreSQL 18 起，`RETURNING` 支持 `old` 和 `new` 别名，这是目前最干净的写法：

```sql
INSERT INTO product (sku, name, price) VALUES ('A-1', '新名称', 12.00), ('B-2', '新品', 20.00)
ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price
RETURNING sku, old.price AS 旧价, new.price AS 新价, (old.sku IS NULL) AS 是新插入;
```

```text
 sku | 旧价  | 新价  | 是新插入
-----+-------+-------+----------
 A-1 | 10.00 | 12.00 | f
 B-2 |       | 20.00 | t
```

18 以下的版本没有 `old`/`new`，通行做法是读系统列 `xmax`，值为 0 表示本次新插入：

```sql
RETURNING sku, (xmax = 0) AS is_insert;
```

这个技巧能用，但它依赖存储层实现，不是官方承诺的接口，别把它放进业务判断的关键路径。

## ISO/IEC SQL 标准怎么说

**`ON CONFLICT` 不在标准里。** PostgreSQL 官方文档 [INSERT](https://www.postgresql.org/docs/current/sql-insert.html) 的 Compatibility 一节写得很直白：`INSERT` 本身符合标准，但 `RETURNING`、`WITH`、以及「用 `ON CONFLICT` 指定替代动作」的能力都是 PostgreSQL 扩展，并补了一句——想要更符合标准的写法，见 `MERGE`。

**标准里的对应物是 `MERGE`**，出现在 ISO/IEC 9075 的一致性特性编号里：

| 特性编号 | 名称 | 引入版本 | PostgreSQL |
| --- | --- | --- | --- |
| F312 | MERGE statement | SQL:2003 | 15 起支持 |
| F313 | Enhanced MERGE statement | SQL:2008 | 支持 |
| F314 | MERGE statement with DELETE branch | SQL:2008 | 支持 |

这三条都出现在 PostgreSQL 18 的[已支持特性列表](https://www.postgresql.org/docs/current/features-sql-standard.html)中，未支持列表里没有它们。`MERGE` 页面的 Compatibility 一节也直接写着「This command conforms to the SQL standard」。

同样的 upsert 用标准 `MERGE` 写出来是这样：

```sql
MERGE INTO product AS t
USING (VALUES ('A-1', '标准写法', 13.00), ('C-3', '新品 C', 30.00)) AS s(sku, name, price)
   ON t.sku = s.sku
WHEN MATCHED AND (t.name, t.price) IS DISTINCT FROM (s.name, s.price) THEN
  UPDATE SET name = s.name, price = s.price
WHEN NOT MATCHED THEN
  INSERT (sku, name, price) VALUES (s.sku, s.name, s.price)
RETURNING merge_action() AS 动作, t.sku;
```

```text
  动作  | sku
--------+-----
 UPDATE | A-1
 INSERT | C-3
```

不过要注意：**这段 SQL 里已经掺了扩展。** PostgreSQL 文档明说，`WITH` 子句、`WHEN NOT MATCHED` 的 `BY SOURCE` / `BY TARGET` 限定、`DO NOTHING` 动作和 `RETURNING` 子句都是对标准的扩展。上面例子里的 `RETURNING merge_action()`（17 起提供）就属于此列。只保留 `WHEN MATCHED` / `WHEN NOT MATCHED` 加 `UPDATE` / `INSERT` / `DELETE` 动作，才是可移植的那部分。

横向看其他数据库：Oracle、SQL Server、Db2 都走 `MERGE`；MySQL 用私有的 `INSERT ... ON DUPLICATE KEY UPDATE`；SQLite 则[直接照抄了 PostgreSQL 的 `ON CONFLICT` 语法](https://www.sqlite.org/lang_upsert.html)（3.24.0，2018 年）。所以 `ON CONFLICT` 虽然不标准，可移植范围反而不算窄。

## 那到底选哪个

PostgreSQL 的 `MERGE` 文档在 Notes 一节给了官方口径：`MERGE` 并发运行时遵循常规的事务隔离规则，并建议——「你可能还想考虑用 `INSERT ... ON CONFLICT` 作为替代语句，它能在并发 `INSERT` 发生时执行 `UPDATE`」，同时提醒两者「有各种差异和限制，并不能互换」。

翻译成决策依据：

| 维度 | ON CONFLICT | MERGE |
| --- | --- | --- |
| 是否标准 | 否，PostgreSQL 扩展 | 是，F312 / F313 / F314 |
| 最低版本 | 9.5 | 15 |
| 冲突判定 | 必须能推断出唯一索引 | 任意连接条件，不要求唯一索引 |
| 并发插入 | 由唯一索引保证，可安全 upsert | 遵循隔离级别，仍可能撞唯一约束 |
| 支持 DELETE 分支 | 否 | 是 |
| 源数据自身重复 | 报错 | 同样报错或撞唯一约束 |

简单说：**按唯一键做幂等写入、且有并发，用 `ON CONFLICT`；需要复杂分支、非唯一连接条件、或者这段 SQL 要跨数据库跑，用 `MERGE`。** 两者都要求你自己先把源数据去重。

## 参考

- [INSERT — ON CONFLICT Clause](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
- [MERGE](https://www.postgresql.org/docs/current/sql-merge.html)
- [Appendix D.1. Supported Features](https://www.postgresql.org/docs/current/features-sql-standard.html)
- [SQLite: UPSERT](https://www.sqlite.org/lang_upsert.html)
