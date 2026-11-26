QB.cat({id:'db',name:'SQL, MongoDB & Data',short:'SQL & Mongo',icon:'🧮',col:'teal'},[
{q:'Why MongoDB? When would you choose it over a relational database like MySQL?',a:[
 `MongoDB stores data as flexible JSON-like **documents**, so an object with nested parts — an order with its items, or a test case with its steps — is stored and read as **one document**, with no joins. The schema can evolve without migrations, and it **scales horizontally** with built-in sharding and replica sets.`,
 `I choose it when the data is naturally hierarchical, the structure varies or changes often, and reads are mostly "fetch this whole thing by id". In our platform, test cases and execution results with variable fields fit Mongo really well.`,
 `I'd stay with MySQL or Postgres when data is highly relational with lots of joins, or needs strict multi-row transactions and constraints — like a banking ledger. Mongo does support multi-document transactions now, but if you need them everywhere, a relational DB is the better fit.`]},
{q:'Do you know about sharding?',a:[
 `Sharding is **splitting one large dataset across multiple servers**, each holding a part — a shard. It's horizontal scaling: when one machine can't hold the data or handle the writes, you add more machines instead of a bigger one.`,
 `In MongoDB you pick a **shard key**; data is split into chunks by that key and spread across shards, and the \`mongos\` router sends each query to the right shard. Each shard is itself a replica set for availability.`,
 `The **shard key choice** is everything: it needs high cardinality and even distribution, and should match your main query pattern. A monotonically increasing key like a timestamp sends all new writes to one shard — a hot spot — so use a hashed key or a compound key like \`{tenantId, _id}\`. Queries without the shard key become scatter-gather across all shards, which is slow.`]},
{q:'How do you analyse a slow query?',a:[
 `I look at the **execution plan** instead of guessing. In SQL that's \`EXPLAIN\` or \`EXPLAIN ANALYZE\`; I check whether it does a full table scan, which index it uses, the estimated vs actual rows, and expensive sorts or joins.`,
 `In MongoDB I run \`.explain("executionStats")\` and look at three things: is the stage **COLLSCAN** (bad) or **IXSCAN** (good), and compare \`totalDocsExamined\` with \`nReturned\` — examining 1 million docs to return 10 means a missing or wrong index. An in-memory **SORT** stage is another red flag.`,
 `To find which queries are slow in the first place I use the slow query log or Mongo's profiler and Atlas Performance Advisor, and Hibernate SQL logging or APM traces on the application side.`]},
{q:'Indexing — types of indexes, composite indexes, and how indexes improve performance',c:['Deloitte','ITC Infotech','KPMG'],a:[
 `An index is a sorted data structure — usually a **B-tree** — that lets the database jump to matching rows instead of scanning the whole table, turning O(n) into roughly O(log n).`,
 `Common types: **primary / clustered** (rows stored in key order), **secondary / non-clustered**, **unique**, **composite** (multi-column), **full-text**, and in Mongo also multikey (arrays), TTL, text and geospatial indexes. A **covering index** contains all the columns a query needs, so the table isn't touched at all.`,
 `For a **composite index** column order matters — the **leftmost prefix rule**. An index on \`(customer_id, status, created_at)\` helps queries filtering on customer_id, or customer_id + status, but not status alone. I order columns as equality filters first, then sort, then range — the ESR rule in Mongo.`,
 `The trade-off: every index slows down inserts and updates and uses memory, so I index for real query patterns, not every column.`]},
{q:'Primary key vs unique key',c:['ITC Infotech'],a:[
 `Both enforce uniqueness. A **primary key** identifies the row: only **one per table**, **never NULL**, and in MySQL InnoDB the table data is physically clustered on it. A **unique key** just prevents duplicates in a column, you can have **many** per table, and it usually allows NULL.`,
 `Typical example: \`id\` is the primary key, while \`email\` and \`pan_number\` have unique constraints.`]},
{q:'DELETE vs TRUNCATE',c:['ITC Infotech'],a:[
 `\`DELETE\` is DML — it removes rows **one by one**, can have a \`WHERE\` clause, fires triggers, is logged per row and can be rolled back. \`TRUNCATE\` is DDL — it removes **all rows** at once by deallocating pages, so it's much faster, resets auto-increment, doesn't fire row triggers, and in most databases (like MySQL) can't be rolled back.`,
 `So: \`DELETE\` to remove specific data, \`TRUNCATE\` to empty a staging table quickly.`]},
{q:'INNER JOIN vs LEFT JOIN',c:['KPMG'],a:[
 `\`INNER JOIN\` returns only rows that have a match **in both tables**. \`LEFT JOIN\` returns **all rows from the left table**, and the matching right rows — or NULLs where there's no match.`,
 `Example: employees and departments. Inner join shows only employees assigned to a department; left join shows every employee, with department NULL for unassigned ones. \`LEFT JOIN ... WHERE d.id IS NULL\` is the classic way to find employees without a department.`]},
{q:'WHERE vs HAVING',c:['KPMG'],a:[
 `\`WHERE\` filters **rows before grouping**, and can't use aggregates. \`HAVING\` filters **groups after** \`GROUP BY\`, so it can use \`COUNT\`, \`SUM\`, \`AVG\`.`,
 `Example: \`WHERE status='ACTIVE'\` keeps active employees, then \`GROUP BY dept HAVING COUNT(*) > 10\` keeps departments with more than 10 of them. Filter in \`WHERE\` whenever you can — it's cheaper.`]},
{q:'Explain ACID properties',c:['KPMG'],a:[
 `**Atomicity** — all or nothing: a transfer's debit and credit both happen or neither does. **Consistency** — a transaction moves the DB from one valid state to another; constraints and rules always hold. **Isolation** — concurrent transactions don't see each other's half-done work. **Durability** — once committed, it survives a crash, thanks to the write-ahead log.`,
 `In Spring, \`@Transactional\` gives us atomicity on one database. Across microservices you lose ACID and move to sagas and eventual consistency.`]},
{q:'You read the same row twice in one transaction and get two different values. Is that a bug?',a:[
 `Not necessarily — it's a **non-repeatable read**, and it's allowed under **READ COMMITTED**, which is the default in Postgres, Oracle and SQL Server. Another transaction committed a change in between your two reads.`,
 `The isolation levels, weakest to strongest: **READ UNCOMMITTED** (dirty reads possible), **READ COMMITTED** (no dirty reads), **REPEATABLE READ** (same row stays the same; MySQL's default), and **SERIALIZABLE** (as if transactions ran one at a time).`,
 `If your logic needs stable data, raise the level for that transaction with \`@Transactional(isolation = REPEATABLE_READ)\`, lock the row with \`SELECT ... FOR UPDATE\`, or use optimistic locking — rather than raising isolation globally, which costs concurrency.`]},
{q:'Stored procedures vs triggers',c:['Deloitte'],a:[
 `A **stored procedure** is precompiled SQL logic you **call explicitly** — \`CALL monthly_close(...)\` — it can take parameters and return results. A **trigger** runs **automatically** on an event like \`INSERT\`, \`UPDATE\` or \`DELETE\` on a table — you never call it.`,
 `Procedures are good for heavy set-based batch work close to the data. Triggers are handy for audit columns or history tables, but they're hidden logic — hard to debug and test — so in a Spring Boot app I keep business rules in the service layer and use triggers sparingly.`]},
{q:'Two users update the same record at the same time. Optimistic or pessimistic locking — which for inventory?',a:[
 `Without protection you get a **lost update** — both read stock 10, both write 9, and one sale disappears.`,
 `**Optimistic locking** assumes conflicts are rare: add a \`@Version\` column; the update runs \`... WHERE id=? AND version=?\`, and if someone else changed it first, zero rows update and JPA throws \`OptimisticLockException\`, so you retry or tell the user. No locks are held, so it scales well.`,
 `**Pessimistic locking** locks the row while you work — \`SELECT ... FOR UPDATE\`, or \`@Lock(PESSIMISTIC_WRITE)\` in JPA — so others wait. It's safer under heavy contention but reduces throughput and risks deadlocks.`,
 `For inventory: optimistic for normal products. For a **hot item in a flash sale**, contention is high and retries explode, so I'd use an **atomic conditional update** — \`UPDATE stock SET qty = qty - 1 WHERE sku=? AND qty > 0\` — or a pessimistic lock, or a Redis counter in front.`]},
{q:'A query that took 50 ms now takes 10 seconds. How do you troubleshoot and optimise slow SQL queries?',c:['KPMG','ITC Infotech'],a:[
 `A query that **got** slow usually means something changed: data grew, the plan changed, or something is blocking it. So I run \`EXPLAIN ANALYZE\` and compare with what I expect — did it switch from an index scan to a full scan? Stale statistics are a common cause, fixed by \`ANALYZE\`. I also check for **lock waits** and whether the DB itself is overloaded.`,
 `General optimisation: add or fix indexes for the WHERE, JOIN and ORDER BY columns; avoid functions on indexed columns (\`WHERE DATE(created_at)=...\` kills the index); select only needed columns instead of \`SELECT *\`; replace correlated subqueries with joins; paginate; and fix N+1 patterns on the application side.`,
 `If the table is just huge, look at partitioning, archiving old data, or caching the result in Redis.`]},
{q:'Database CPU reaches 100% during peak hours. What steps would you take?',a:[
 `**Short term**: find the top queries by total CPU time — \`pg_stat_statements\`, MySQL's Performance Schema, or Mongo's profiler — because usually a handful of queries cause most of the load. Kill runaway queries and check whether a recent deploy introduced a new query.`,
 `**Then fix the causes**: add missing indexes (full scans burn CPU), fix N+1 query storms from the app, cache hot read data in Redis, and move reads to **read replicas**. Check the connection pool too — too many connections cause context switching on the DB.`,
 `**Longer term**: move heavy reports to off-peak or a separate analytics replica, scale up the instance, or partition/shard if it's write load.`]},
{q:'A table has hundreds of millions of records. How would you improve performance?',a:[
 `First make sure the access paths are right — **indexes** that match the main queries, and queries that always filter on them. Then reduce what each query touches.`,
 `**Partitioning** — split the table by date or tenant, so a query for "last 30 days" only scans recent partitions, and old partitions can be dropped instantly. **Archiving** — move cold data to an archive table or cheap storage. **Read replicas** for read-heavy load, **caching** for hot data, and **summary tables** or materialized views for reports instead of aggregating millions of rows live.`,
 `When a single node really can't keep up with writes, **shard** the data across servers by a key like customerId.`]},
{q:'Page 1 of your list API takes 20 ms. Page 5,000 takes 4 seconds. Why, and what do you use instead?',a:[
 `\`LIMIT 20 OFFSET 100000\` still makes the database **read and throw away** 100,000 rows before returning 20 — the deeper the page, the slower it gets. Mongo's \`skip()\` has the same problem.`,
 `Use **keyset (cursor) pagination**: remember the last value of the sort key and ask for rows after it — \`WHERE id > :lastId ORDER BY id LIMIT 20\`. With an index on that column it's equally fast on every page. The API returns a \`nextCursor\` instead of a page number. The trade-off is you can't jump straight to page 5,000 — which users almost never need.`],
 code:`SELECT id, name, created_at
FROM orders
WHERE (created_at, id) < (:lastCreatedAt, :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;`},
{q:'You delete 10 million old rows in one statement and replica lag jumps to an hour. What should you have done?',a:[
 `One huge \`DELETE\` is one huge transaction — it holds locks for a long time, bloats the transaction log, and replicas must replay the whole thing before they can move on, hence the lag.`,
 `Delete in **small batches** — say 5,000 rows at a time by primary key range, committing each batch, with a short pause between them, ideally off-peak. Even better, design for it upfront: **partition** the table by date and simply \`DROP\` the old partition, which is instant, or use a TTL index in MongoDB so expiry happens gradually.`]},
{q:'How do you fetch and handle a large amount of data?',c:['Infosys'],a:[
 `Never load it all into memory with one \`findAll()\`. For APIs, use **pagination** — keyset for large tables — and return only the fields needed using projections or DTOs.`,
 `For batch processing, **stream** or **chunk** it: Spring Batch with chunk-oriented processing, a JPA \`Stream<T>\` with a fetch size, or a Mongo cursor with batch size, processing and clearing as you go so memory stays flat. Write in bulk with \`saveAll\` batches or Mongo \`bulkWrite\`.`,
 `For exports, stream the response straight to the client (\`StreamingResponseBody\`) or generate the file asynchronously, upload it to S3 and send a download link. And add indexes on what you filter by, so each chunk is cheap.`]},
{q:'MongoDB: how did you optimise query performance under high traffic?',c:['Persistent'],a:[
 `I started with the **profiler** and \`explain("executionStats")\` on the slowest queries. The main wins were **compound indexes** matching the real filter and sort — following the ESR rule, equality then sort then range — which turned COLLSCANs into IXSCANs.`,
 `Then **projections** so we only returned needed fields, especially when documents had large arrays; replacing \`skip/limit\` with range-based pagination on \`_id\`; and **reshaping documents** — embedding data that was always read together so one read replaced several lookups.`,
 `For read load we used **read preference secondaryPreferred** for non-critical reads and cached hot data in Redis. On writes we used \`bulkWrite\` and appropriate write concern. Monitoring through Atlas metrics told us when the working set no longer fit in RAM.`]},
{q:'MongoDB: describe a schema you designed for scalability and reliability',c:['Persistent'],a:[
 `The main decision in Mongo is **embed vs reference**. I embed when data is read together, belongs to one parent and is **bounded** in size — like an order with its line items and shipping address. I reference when the child grows without limit or is shared — like users referenced from many orders.`,
 `For example, for test executions: an \`executions\` document with summary fields (status, counts, timings), and step results in a separate \`execution_steps\` collection referencing \`executionId\`, because a run can have thousands of steps and a document has a 16 MB limit. Frequently displayed fields like project name were **denormalised** into the execution to avoid lookups.`,
 `For reliability: replica set with \`w:"majority"\` writes, a schema validator for required fields, a \`version\` field for optimistic concurrency, and a shard key like \`{projectId, _id}\` planned from day one.`]},
{q:'MongoDB: how did you manage indexes for read and write efficiency?',c:['Persistent'],a:[
 `Indexes are driven by **real query patterns**: I list the main queries per collection and design compound indexes so one index serves several queries through prefixes. I avoid redundant ones — \`{a:1}\` is unnecessary if \`{a:1, b:1}\` exists.`,
 `For writes, every extra index costs on each insert, so I keep the count low on write-heavy collections and remove unused ones found with \`$indexStats\`. I use **partial indexes** to index only active documents, **TTL indexes** to auto-expire logs and sessions, and build indexes in a rolling way on large collections.`,
 `Indexes are created through code — \`@CompoundIndex\` annotations or a migration tool like Mongock — so every environment has the same indexes.`]},
{q:'SQL: find employees earning more than their managers',c:['Deloitte'],a:[
 `It's a **self-join** — join the employee table to itself, once as employee and once as manager, matching \`e.manager_id = m.id\`, then compare salaries.`],
 code:`SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employee e
JOIN employee m ON e.manager_id = m.id
WHERE e.salary > m.salary;`},
{q:'SQL: find the second highest salary',c:['Cognizant','KPMG'],a:[
 `Two common ways. The subquery way: the max salary that's less than the overall max. The window-function way with \`DENSE_RANK\`, which handles ties correctly and generalises to the Nth highest — just change the number. Both return no row if there's no second salary.`],
 code:`-- 1. subquery
SELECT MAX(salary) FROM employee
WHERE salary < (SELECT MAX(salary) FROM employee);

-- 2. Nth highest with DENSE_RANK
SELECT DISTINCT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employee
) t
WHERE rnk = 2;`},
{q:'SQL: find duplicate records in a table',c:['Capgemini'],a:[
 `Group by the columns that define a duplicate and keep groups with more than one row. To see or delete the extra rows themselves, number them with \`ROW_NUMBER()\` per group and take everything after the first.`],
 code:`SELECT email, COUNT(*) AS cnt
FROM customer
GROUP BY email
HAVING COUNT(*) > 1;

-- the extra copies (keep the lowest id)
SELECT id FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
  FROM customer
) t
WHERE rn > 1;`},
]);
