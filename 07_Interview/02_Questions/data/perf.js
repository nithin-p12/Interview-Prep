QB.cat({id:'perf',name:'Production Scenarios & Performance',short:'Prod Scenarios',icon:'🚨',col:'red'},[
{q:'API response time suddenly jumps from 200 ms to 3 s — how do you debug it?',a:[
 `First I check **what changed** — a recent deployment, a config change, a traffic increase or a data growth. "Suddenly" usually means something changed, so I line the latency graph up against the deploy timeline.`,
 `Then I find **where the time goes**. With distributed tracing (Micrometer Tracing + Zipkin/Jaeger) I can see the span breakdown — is it the DB call, a downstream service, or our own code? Actuator metrics like \`http.server.requests\`, HikariCP pool usage and JVM GC pauses tell me whether we're waiting on connections, threads or garbage collection.`,
 `If it's the database, I check slow query logs and run \`EXPLAIN\` — often a missing index or a table that grew. If it's a downstream call, I check its latency and our timeouts. If it's in our JVM, I take a few thread dumps to see where threads are stuck. Fix the root cause, and add an alert on p95 latency so we catch it earlier next time.`]},
{q:'High latency at peak load, but CPU and DB look normal — how do you troubleshoot?',c:['Persistent'],a:[
 `Low CPU with high latency means requests are **waiting**, not working. The usual suspects are a saturated pool — Tomcat threads, HikariCP connections, or the HTTP client pool for downstream calls — or a slow downstream service.`,
 `I check Actuator metrics: \`tomcat.threads.busy\` near max, \`hikaricp.connections.pending\` above zero, or \`http.client.requests\` latency going up. A **thread dump** confirms it — if most threads are \`WAITING\` on \`getConnection\` or blocked on a socket read, I know exactly where they're queued.`,
 `Fixes depend on the cause: right-size the pools, add timeouts and a circuit breaker on the slow downstream, remove lock contention like a \`synchronized\` block on a hot path, or move slow work off the request thread to Kafka.`]},
{q:'A DB query takes 50 ms but the API takes 2 s — where do you look?',a:[
 `The query isn't the problem, so the time is somewhere around it. I'd look at: **N+1 queries** — one 50 ms query repeated 40 times in a loop; **waiting for a DB connection** from the pool; **downstream HTTP calls** in the same request; and **serialization** of a huge response or lazy-loading triggered while Jackson writes the entity.`,
 `Tracing shows the breakdown instantly. Enabling Hibernate SQL logging or \`hibernate.generate_statistics\` reveals how many queries actually ran. Then the fix is targeted — fetch joins, DTO projections, pagination, or parallelising the downstream calls.`]},
{q:'A REST API takes 30 s because of 3 sequential downstream calls — how do you optimise it?',a:[
 `If the three calls don't depend on each other, run them **in parallel** with \`CompletableFuture\` on a dedicated executor, so total time becomes the slowest call instead of the sum.`,
 `Then I'd add a **timeout** per call and a fallback so one slow service doesn't hold the whole response, consider **caching** results that rarely change, and if the client doesn't need everything immediately, return quickly and push the slow part to async processing via Kafka.`],
 code:`ExecutorService pool = Executors.newFixedThreadPool(20);

CompletableFuture<User>    u = CompletableFuture.supplyAsync(() -> userClient.get(id), pool);
CompletableFuture<Orders>  o = CompletableFuture.supplyAsync(() -> orderClient.get(id), pool);
CompletableFuture<Balance> b = CompletableFuture.supplyAsync(() -> walletClient.get(id), pool)
        .orTimeout(2, TimeUnit.SECONDS)
        .exceptionally(ex -> Balance.unknown());

CompletableFuture.allOf(u, o, b).join();
return new Dashboard(u.join(), o.join(), b.join());`},
{q:'Database connections are exhausted though traffic hasn\'t increased — what could be wrong?',a:[
 `If traffic is flat, connections are being **held longer** or **never returned**. Common causes: a **connection leak** — code that opens a connection or \`EntityManager\` manually and doesn't close it; **long transactions** — a \`@Transactional\` method that makes an HTTP call or does heavy work while holding the connection; or slow queries after data growth or a lost index.`,
 `HikariCP helps here: set \`leakDetectionThreshold\` (say 30 s) and it logs the stack trace of whoever held a connection too long. I also watch \`hikaricp.connections.active\` and \`pending\` in Actuator, and check the DB side for long-running or blocked sessions.`,
 `Fix is to keep transactions short — no remote calls inside them — close resources with try-with-resources, and add query timeouts. Just increasing the pool size only hides the problem.`]},
{q:'Works fine with 100 users, unstable with 10,000 — how do you find the bottleneck?',a:[
 `I reproduce it with a **load test** — JMeter, Gatling or k6 — ramping up users step by step while watching metrics in Grafana. The point where latency or errors start climbing tells me the capacity, and the metric that saturates first tells me the bottleneck.`,
 `I watch the usual resources: CPU, heap and GC, thread pool and connection pool usage, DB CPU and slow queries, and downstream latency. A profiler like async-profiler or JFR shows hot code paths, and thread dumps under load show contention.`,
 `Typical findings are a small connection pool, a missing index, a \`synchronized\` hot spot, an unbounded in-memory cache, or a single downstream dependency. Fix one, re-run the test, and repeat until we hit the target.`]},
{q:'Traffic spike of 10,000 requests / 10x traffic tomorrow / 100,000 req/min — how do you keep it stable and scale?',a:[
 `First make the service **horizontally scalable** — stateless instances behind a load balancer, sessions in Redis or JWT — so I can just add pods. On Kubernetes I'd pre-scale replicas and set an HPA rather than wait for autoscaling to catch up.`,
 `Then **reduce load on the backend**: cache hot reads in Redis, serve static content from a CDN, add read replicas for the DB, and move non-critical work like emails and analytics to Kafka so the request path stays short.`,
 `Then **protect the system**: rate limiting at the API Gateway, circuit breakers and timeouts on downstream calls, bulkheads, and graceful degradation — better to return a cached or partial response than fall over.`,
 `If it's a planned 10x for tomorrow, I'd run a load test today at that level, check DB and Kafka capacity, and have dashboards, alerts and a rollback plan ready.`]},
{q:'How do you identify performance bottlenecks in a backend application?',a:[
 `I go from **measure** to **narrow down** to **prove**. Measure with metrics — Actuator + Micrometer + Prometheus/Grafana for latency percentiles, throughput, error rate, pool usage, GC. Narrow down with distributed tracing, which shows which hop or query takes the time.`,
 `Then prove it at code level: a profiler (async-profiler, JFR, VisualVM) for CPU hot spots, thread dumps for waiting and lock contention, heap dumps for memory, and \`EXPLAIN\` or Mongo's \`explain()\` for queries. I always look at p95/p99, not averages — averages hide the slow requests users actually complain about.`]},
{q:'How do you debug a production issue end to end?',a:[
 `First **stabilise** — if users are impacted and a recent deploy is the likely cause, roll back or toggle off the feature, then investigate calmly. Then **scope** it: which endpoints, which users, since when, and what changed.`,
 `Next I follow the **correlation ID / trace ID** through centralised logs (ELK or Loki) and traces to find the exact failing request and service. Metrics tell me if it's resources — memory, threads, connections — and for JVM issues I take thread or heap dumps.`,
 `Once I have a hypothesis I reproduce it in a lower environment with the same data or config, fix it, add a test for it, and write a short RCA with a preventive action — usually an alert or a guardrail so it doesn't come back.`]},
{q:'A deployment causes increased latency — how do you find the root cause and roll back safely?',a:[
 `Rollback first if the impact is real — with Kubernetes it's \`kubectl rollout undo\` or redeploying the previous image tag; with blue-green you just switch traffic back. Rollback is only safe if **DB migrations are backward compatible**, which is why I always use expand-and-contract migrations — add columns first, remove old ones in a later release.`,
 `For the root cause I compare the old and new versions side by side: latency per endpoint, query counts, GC, pool usage, and the diff of code and config. Common culprits are a new N+1 query, a removed index, a changed timeout or pool size, or a new synchronous downstream call.`,
 `To reduce risk next time I'd use **canary releases** — send 5% of traffic to the new version, watch the metrics, then roll forward — plus feature flags for risky changes.`]},
]);
