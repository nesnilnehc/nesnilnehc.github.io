---
layout: post
title: "PostgreSQL ctid 实战：无主键表的去重与分批，标准 SQL 里有替代吗"
description: "ctid 是每行的物理地址，让没有主键的落地表也能去重、分批和定点删改。本文给出三种实测用法与失效条件，并说明 ISO/IEC SQL 标准中没有对应概念，只有可更新游标这一条代价更高的替代路径。"
date: 2026-08-06 15:40:00 +0800
categories: [tech]
tags: [PostgreSQL, SQL, SQL 标准, 数据清洗]
article_type: concept
difficulty: intermediate
content_score: 8.0
score_basis: "三种用法、ctid 失效条件和标准游标替代方案都在 PostgreSQL 16.14 与 18.4 上实测，并核对了 SQL 一致性特性编号；不足是只覆盖单机堆表，未涉及分区表分批与逻辑复制场景。"
permalink: /tech/postgresql-ctid/
---

`ctid` 是 PostgreSQL 给每一行的物理地址，形如 `(块号, 块内序号)`。它不需要建索引、不需要主键，任何堆表都能直接查——这让没有主键的落地表也能去重、分批和定点删改。**代价是它随时会变：`UPDATE`、`VACUUM FULL`、`CLUSTER` 都会改写它，所以它是行的当前位置，不是行的身份。**

| 遇到的问题 | 用法 |
| --- | --- |
| 表没有主键，要删掉完全重复的行 | `ctid` + `min(ctid)` |
| 大表要分批处理，`OFFSET` 越翻越慢 | `ctid` 区间扫描（Tid Range Scan） |
| 要按可控批量删改一小撮行 | `WHERE ctid = ANY (ARRAY(...))` |
| 需要跨事务、可存储的行标识 | 别用 `ctid`，加主键 |

本文语句在 PostgreSQL 16.14 上实测，标准替代方案部分在 18.4 上实测。姊妹篇讲幂等写入：[PostgreSQL 幂等写入]({{ '/tech/postgresql-upsert-on-conflict-vs-merge/' | relative_url }})。

## 它长什么样

```sql
SELECT ctid, order_no, amount FROM staging_order ORDER BY ctid;
```

```text
 ctid  | order_no | amount
-------+----------+--------
 (0,1) | O-1      |  10.00
 (0,2) | O-2      |  20.00
 (0,3) | O-1      |  10.00
```

`(0,3)` 表示「第 0 号数据块里的第 3 条元组」。同一张表里两行内容可以一模一样，但 `ctid` 一定不同——这正是它在数据清洗里的价值。

## 用途一：删掉完全重复的行

落地表没有主键、整行重复时，`ctid` 是唯一能把两行区分开的东西。保留每组里 `ctid` 最小的一条：

```sql
DELETE FROM staging_order a
WHERE a.ctid <> (
  SELECT min(b.ctid) FROM staging_order b
  WHERE b.order_no = a.order_no
    AND b.amount   = a.amount
    AND b.city     = a.city
);
```

关联条件要列全所有参与判重的列；含 NULL 的列改用 `IS NOT DISTINCT FROM`，否则那些行永远匹配不上、一条都删不掉。

## 用途二：按物理位置分批

分批处理大表时，`LIMIT ... OFFSET` 会越翻越慢，因为每一批都要重新跳过前面所有行。`ctid` 区间可以让 PostgreSQL 只扫指定的数据块：

```sql
SELECT count(*) FROM big
WHERE ctid >= '(0,0)'::tid AND ctid < '(200,0)'::tid;
```

```text
 Aggregate (actual rows=1 loops=1)
   ->  Tid Range Scan on big (actual rows=6800 loops=1)
         TID Cond: ((ctid >= '(0,0)'::tid) AND (ctid < '(200,0)'::tid))
```

计划节点是 `Tid Range Scan`（PostgreSQL 14 起支持），不是全表扫描。总块数用 `pg_relation_size(rel) / current_setting('block_size')::bigint` 算，然后按固定步长推进即可。

注意每批的行数不均匀：删除留下的死元组仍然占着块，`ctid` 分批走的是物理空间而不是行数。批次大小按块估，别指望它等于行数。

## 用途三：定点删改一小撮行

把要处理的行先取成 `ctid` 数组，再一次性操作：

```sql
DELETE FROM big
WHERE ctid = ANY (ARRAY(SELECT ctid FROM big WHERE id > 0 LIMIT 1000));
```

比起「按业务条件反复 `DELETE ... LIMIT`」，这种写法能保证每批规模可控，长事务和锁范围都更好预测。

## 什么时候 ctid 会变

这是使用 `ctid` 唯一需要牢记的纪律：

- `UPDATE` 一行，PostgreSQL 写的是新版本，`ctid` 随之改变（HOT 更新也只是把新版本放在同一个块内，块内序号仍然变）。
- `VACUUM FULL`、`CLUSTER`、`pg_repack` 会重写整张表，所有 `ctid` 重排。
- 普通 `VACUUM` 回收的空间会被后续插入复用，新行可能拿到旧行用过的 `ctid`。

实测一次 `VACUUM FULL` 前后：

```text
-- 之前            -- 之后
 (0,1) | O-1        (0,1) | O-1
 (0,5) | O-1        (0,3) | O-1
 (0,6) | O-2        (0,4) | O-2
 (0,4) | O-3        (0,2) | O-3
```

由此得出三条硬约束：

1. 不要把 `ctid` 存进业务表，也不要跨事务传递。
2. 需要跨语句使用时，先 `SELECT ctid ... FOR UPDATE` 锁住，或把结果快照到临时表，并接受期间其他会话可能已经改动数据。
3. 表有主键时优先用主键；`ctid` 是没有主键、或需要按物理布局操作时的补充手段。

## ISO/IEC SQL 标准怎么说

**标准里没有 `ctid`，也没有任何物理行地址的概念。** SQL 标准描述的是逻辑关系模型，行在磁盘上的位置不属于它的表达范围。PostgreSQL 把 `ctid` 归在[系统列](https://www.postgresql.org/docs/current/ddl-system-columns.html)里，属于实现细节而非标准接口。各家数据库都有自己的私有做法且互不兼容：Oracle 是文档化的 `ROWID` 伪列，SQL Server 有未文档化的 `%%physloc%%`，MySQL 则不对外暴露 InnoDB 的内部行号。

那么标准里有没有能顶替这三种用法的东西？分开看：

### 行的身份：有，但是逻辑身份

标准提供的是 identity column（特性 T174 / T178，PostgreSQL 支持），也就是 `GENERATED ALWAYS AS IDENTITY` 这类自增主键。它给的是稳定的逻辑标识，恰恰不是物理地址——`ctid` 能做而它做不到的，是在**表还没有任何键**的时候就区分两行。

标准另有一套基于引用类型的行标识（特性 S041 / S043，typed table 的 `REF`），但它出现在未支持特性列表里，PostgreSQL 不实现。

### 删掉一模一样的两行之一：有，代价更高

这是标准唯一正面回答了的场景：**可更新游标 + 定位删除**，对应 Core 特性 E121-06（Positioned UPDATE）与 E121-07（Positioned DELETE）。逐行推进游标，删掉「当前这一行」：

```sql
BEGIN;
DECLARE c CURSOR FOR SELECT a, b FROM dup FOR UPDATE;
FETCH 1 FROM c;
FETCH 1 FROM c;          -- 停在第二行
DELETE FROM dup WHERE CURRENT OF c;
CLOSE c;
COMMIT;
```

三行完全相同的数据，实测删掉的正是第二行（`ctid` 从 `(0,1) (0,2) (0,3)` 变成 `(0,1) (0,3)`）。

它确实是标准写法，但代价明显：必须开事务、逐行 `FETCH`，几十万行的落地表按这个节奏走一遍不现实。相比之下 `ctid` 那条 `DELETE` 是一条集合操作语句。**标准方案存在，只是不适合批处理规模。**

### 分批：有，但不解决「无主键」

标准提供 `FETCH FIRST n ROWS ONLY` 与 `OFFSET`（特性 F856 至 F865，PostgreSQL 支持），这就是常见的分页写法。工程上更推荐的是键集分页（keyset pagination）——`WHERE id > :last_id ORDER BY id FETCH FIRST 1000 ROWS ONLY`，它避开了 `OFFSET` 越翻越慢的问题，而且完全标准。

所以分批这件事，**只要表有可排序的唯一键，标准写法就够用且更好**。`ctid` 分批的适用面窄得多：表没有唯一键，或者你要的正是按物理布局顺序扫描（例如配合 `VACUUM`、修复损坏页、控制 I/O 局部性）。

### 小结

| 用途 | 标准里有替代吗 | 替代方案 |
| --- | --- | --- |
| 区分两行完全相同的记录 | 有，但只能逐行 | 可更新游标 + `DELETE ... WHERE CURRENT OF`（E121-07） |
| 稳定的行标识 | 有 | identity column（T174），即加主键 |
| 分批处理 | 有，且通常更好 | 键集分页 + `FETCH FIRST`（F856–F865） |
| 物理地址、按块扫描 | **没有** | 无对应概念 |

一句话：`ctid` 能做的事，标准 SQL 大部分能用别的方式做到，但都要求表已经有键，或者接受逐行处理的代价。`ctid` 真正不可替代的场景只有一个——**表没有任何键，而你要做集合规模的清洗**。

## 组合用法：一条可以重跑的清洗流程

把 `ctid` 和 [`ON CONFLICT`]({{ '/tech/postgresql-upsert-on-conflict-vs-merge/' | relative_url }}) 串起来，就是一条从脏落地表到干净目标表的流水线：先用 `ctid` 去掉整行重复，再按 `ctid` 分批，每批用 `DISTINCT ON` 收敛到业务键，最后 upsert 写入目标表。

```sql
-- 步骤 1：删掉完全重复的物理行
DELETE FROM stg_order a
WHERE a.ctid <> (
  SELECT min(b.ctid) FROM stg_order b
  WHERE b.order_no = a.order_no AND b.amount = a.amount
    AND b.city = a.city AND b.loaded_at = a.loaded_at
);

-- 步骤 2：按 ctid 区间分批 upsert
DO $$
DECLARE
  blk_start bigint := 0;
  blk_step  bigint := 128;
  max_blk   bigint;
  moved     bigint;
BEGIN
  SELECT pg_relation_size('stg_order') / current_setting('block_size')::bigint
    INTO max_blk;

  WHILE blk_start <= max_blk LOOP
    WITH batch AS (
      SELECT DISTINCT ON (order_no) order_no, amount, city
      FROM stg_order
      WHERE ctid >= ('(' || blk_start || ',0)')::tid
        AND ctid <  ('(' || (blk_start + blk_step) || ',0)')::tid
      ORDER BY order_no, loaded_at DESC
    )
    INSERT INTO dim_order (order_no, amount, city)
    SELECT order_no, amount, city FROM batch
    ON CONFLICT (order_no) DO UPDATE
      SET amount = EXCLUDED.amount, city = EXCLUDED.city, updated_at = now()
      WHERE dim_order.amount IS DISTINCT FROM EXCLUDED.amount
         OR dim_order.city   IS DISTINCT FROM EXCLUDED.city;

    GET DIAGNOSTICS moved = ROW_COUNT;
    RAISE NOTICE 'blocks [%,%) -> % 行', blk_start, blk_start + blk_step, moved;
    blk_start := blk_start + blk_step;
  END LOOP;
END $$;
```

20500 行落地数据、3000 个业务键，跑完得到 3000 行目标数据；原样再跑一次，目标表行数不变，且 `DO UPDATE ... WHERE` 让第二次一行都没有真正写入（实测 `ROW_COUNT` 合计为 0）。

一个前提值得强调：`DISTINCT ON` 只在批次内去重，同一个业务键如果跨批次出现，后一批仍会覆盖前一批。要保证「全局最后一次胜出」，要么让分批边界与业务键对齐，要么在 `DO UPDATE ... WHERE` 里加上时间戳比较（例如 `dim_order.updated_at < EXCLUDED.loaded_at`）。

## 适用边界

| 事项 | 结论 |
| --- | --- |
| 版本要求 | `ctid` 一直都有；Tid Range Scan 需 14+ |
| 表类型 | 只适用于堆表；外部表和部分表访问方法没有 |
| 分区表 | 父表虽然能查 `ctid`，但不同分区的值会重复，去重和分批必须逐个分区做 |
| 并发 | 跨语句使用必须显式加锁；`VACUUM` 与并发 `UPDATE` 都会让它失效 |
| 可移植性 | 零。换数据库就要整段重写 |

## 参考

- [System Columns](https://www.postgresql.org/docs/current/ddl-system-columns.html)
- [DECLARE](https://www.postgresql.org/docs/current/sql-declare.html) 与 [DELETE — WHERE CURRENT OF](https://www.postgresql.org/docs/current/sql-delete.html)
- [Appendix D.1. Supported Features](https://www.postgresql.org/docs/current/features-sql-standard.html)
- [Appendix D.2. Unsupported Features](https://www.postgresql.org/docs/current/unsupported-features-sql-standard.html)
