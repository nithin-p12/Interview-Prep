// URL Shortener · the learning journey. One fixed path; each stage declares only what changes in the
// architecture (see core/progression.js) plus what the mentor says about it.
(function () {
  const kb = LAB.systems['url-shortener'].kb;

  LAB.define('url-shortener', 'stages', [
    // ------------------------------------------------------------------ 1
    {
      id: 'requirements', nav: 'Requirements', title: 'Understand the problem',
      arch: {
        nodes: {
          client: { x: 80, y: 300 },
          app: { x: 520, y: 300, label: 'URL Shortener', sub: 'black box · to design', ghost: true },
        },
        edges: [{ from: 'client', to: 'app', label: 'shorten · redirect' }],
      },
      flows: ['journeys'],
      challenge: { type: 'requirement', label: 'The problem', text: '"Design a URL shortening service like Bitly."' },
      problem: 'Nothing is designed yet, and that is deliberate. Before drawing boxes, pin down **what must work** (functional) and **what "good" means** (non-functional). Every component we add later must be justified against this list.',
      extra: [
        { t: 'Functional requirements', list: kb.requirements.functional.slice(0, 3), open: true },
        { t: 'Non-functional requirements', list: kb.requirements.nonFunctional, open: true },
        { t: 'Rough numbers (to ask or assume)', table: kb.capacity.table, after: kb.capacity.after },
        { t: 'Out of scope (say it out loud)', list: kb.requirements.outOfScope },
      ],
      faq: [
        { q: 'Why not start drawing caches and queues right away?', a: 'Because you cannot justify them yet. Interviewers want to see each component appear for a reason. We build the simplest working system first, then let requirements force each addition.' },
        { q: 'Which requirement drives the design most?', a: 'The 100 : 1 read-to-write ratio plus low redirect latency. Nearly every later stage is about making redirects fast and reliable.' },
      ],
      takeaway: 'Two operations, one dominant: redirects. Establish the basic system first; scalability comes later.',
    },

    // ------------------------------------------------------------------ 2
    {
      id: 'basic', nav: 'Basic architecture', title: 'Build the basic architecture',
      arch: {
        nodes: {
          app: { x: 520, y: 300, label: 'Spring Boot app', sub: 'REST API · code generator', ghost: false },
          mongo: { x: 800, y: 300 },
        },
        edges: [
          { from: 'client', to: 'app', label: 'POST /api/urls · GET /{code}' },
          { from: 'app', to: 'mongo', label: 'insert · find' },
        ],
      },
      flows: ['create', 'redirect'],
      challenge: { type: 'goal', label: 'Goal', text: 'Build the **simplest** system that meets the functional requirements: one service and one database.' },
      problem: 'The black box needs two things: somewhere to run logic (validate, generate codes, redirect) and somewhere durable to keep `code → URL` mappings.',
      introduce: { components: ['app', 'mongo'], text: 'A **Spring Boot** service exposing two REST endpoints, and **MongoDB** storing one document per short link, keyed by its code.' },
      why: 'This is the minimum that satisfies create, redirect and expiry. Lookups by primary key take a few milliseconds, and at small scale one instance and one database handle the load comfortably.',
      how: [
        '**Create**: validate the URL → take the next number from an atomic counter → encode it in **base62** → insert `{_id: code, url, expireAt}` → return the short URL.',
        '**Redirect**: `findOne({_id: code})` → check `expireAt` → `302 Location: <url>` (or `404` / `410`).',
        '**Expiry**: a TTL index deletes expired documents in the background; the app also checks `expireAt` because the TTL monitor runs only about once a minute.',
      ],
      extra: [
        { t: 'APIs', table: kb.apis.table },
        { t: 'Database schema', code: kb.schema.code },
        { t: 'Why counter + base62 for codes', list: [
          'A counter is **unique by construction**: no collision check, no retry.',
          'base62 (`0-9a-zA-Z`) keeps codes short: `base62(1,000,000) = "4c92"`; 7 characters reach 3.5 trillion.',
          'The counter is one document updated with `$inc`, which MongoDB applies atomically.',
          'Hashing the URL instead needs collision handling: see the follow-up questions in stage 8.',
        ] },
        { t: 'Why 302 and not 301', text: 'A `301 Moved Permanently` is cached by the browser, so later clicks never reach us. `302 Found` sends every click through us; we will need that for analytics in the next stage.' },
      ],
      without: 'Without a database the mappings would live in memory and disappear on the first restart. Without the service there is nothing to turn a code into a redirect.',
      tradeoffs: [
        'One instance is a **single point of failure**: every deploy or crash is an outage.',
        'Every redirect reads the database, which is fine at 40 req/s but not at 40,000.',
        'The counter document is touched on every create: a single hot document.',
        'Sequential codes are guessable.',
      ],
      failures: [
        '**App crashes**: everything stops until it restarts.',
        '**MongoDB unavailable**: creates and redirects both fail.',
      ],
      faq: [
        { q: 'Is one instance really acceptable?', a: 'For the functional requirements, yes. We are deliberately postponing scale and availability so that each later addition has a visible reason.' },
        { q: 'Why MongoDB rather than PostgreSQL?', a: 'The access pattern is key-value (look up by code, no joins), which fits a document store and shards easily on the code. PostgreSQL would work just as well at this size; say that, and pick one.' },
      ],
      takeaway: 'Client → Spring Boot → MongoDB already meets every functional requirement. The trade-offs listed above are exactly what the next stages fix.',
    },

    // ------------------------------------------------------------------ 3
    {
      id: 'kafka', nav: 'Async analytics · Kafka', title: 'Asynchronous analytics with Kafka',
      arch: {
        nodes: { kafka: { x: 800, y: 490 }, analytics: { x: 800, y: 660 } },
        edges: [
          { from: 'app', to: 'kafka', kind: 'async', label: 'ClickEvent' },
          { from: 'kafka', to: 'analytics', kind: 'async', label: 'consume' },
          { from: 'analytics', to: 'mongo', label: 'bulk $inc', bend: 220 },
        ],
      },
      flows: ['redirect-analytics', 'slow-consumer'],
      challenge: { type: 'requirement', label: 'New requirement', text: 'We now want to collect **click analytics** for every shortened URL: track click counts and process analytics **without affecting redirect latency**.' },
      problem: 'The obvious approach is `$inc` on a counter inside the redirect. That adds a database write (5–10 ms) to every click, makes viral links fight over one hot document, and means **if the analytics write fails, the redirect fails**. Analytics would be on the critical path of the most important request we serve.',
      introduce: { components: ['kafka', 'analytics'], text: 'The redirect publishes a small **ClickEvent** to a Kafka topic and returns immediately. A separate **analytics consumer** reads events in batches and updates the counts.' },
      why: 'It moves the work **off the redirect path**. The user does not need the count to be updated before being redirected, so the redirect should not wait for it. Kafka also keeps events durably, so a broken consumer can be fixed and **replayed**.',
      how: [
        'The redirect builds `ClickEvent {eventId, code, ts, referrer}` and calls the producer\'s `send()`: it appends to an in-memory batch and returns at once.',
        'The producer sends batches to the `url-clicks` **topic**. The topic is split into **partitions**; the key is the short code, so one link\'s events stay in order on one partition.',
        'Consumers in the **consumer group** `analytics` share the partitions: each partition is read by exactly one consumer of the group.',
        'The consumer aggregates a batch (`4c92 +312, …`), writes one bulk `$inc`, then **commits its offset**.',
        'Counts trail the clicks by seconds: **eventual consistency**.',
      ],
      extra: [
        { t: 'Kafka vocabulary in one minute', table: { rows: [
          ['**Topic**', 'A named log of events (`url-clicks`).'],
          ['**Partition**', 'A topic is split into ordered logs; the unit of parallelism.'],
          ['**Offset**', 'Position of an event in a partition; consumers commit how far they got.'],
          ['**Consumer group**', 'Consumers sharing the work; each partition goes to one member.'],
          ['**Retention**', 'Events are kept for days, so they can be re-read.'],
        ] } },
        { t: 'Retries and duplicates', list: [
          'Delivery is **at-least-once**: a consumer that crashes after writing but before committing will see the batch again.',
          'So processing must be **idempotent**: store "applied up to offset N" per partition in the same transaction as the counts (stage 7 shows it).',
          'Events that can never be processed go to a **dead-letter topic** after a few retries, so one bad event cannot block a partition.',
        ] },
      ],
      without: 'Every redirect waits for an analytics write. Slow analytics means slow redirects, and an analytics outage becomes a redirect outage.',
      tradeoffs: [
        '**Eventual consistency**: click counts lag by seconds (minutes under heavy lag).',
        '**At-least-once delivery** forces idempotent processing.',
        'Ordering is guaranteed only **within a partition**.',
        'A Kafka cluster is a real operational cost. At small scale a background Redis `INCR` would be simpler; Kafka wins once you want replay or several consumers.',
      ],
      failures: [
        '**Analytics slow**: consumer lag grows, counts get stale, redirects are unaffected. Scale consumers up to the partition count.',
        '**Consumer crashes before committing**: the batch is redelivered; idempotency prevents double counting.',
        '**Kafka unavailable**: the producer must not block the redirect; events are buffered, then dropped and counted (stage 7).',
      ],
      faq: [
        { q: 'Why not just use `@Async` in Spring?', a: 'An in-memory queue loses events on every crash or deploy, cannot be replayed and cannot feed a second consumer.' },
        { q: 'How many partitions?', a: 'Enough for peak throughput and future consumers: say 12. You can add partitions later, but that changes which partition a key maps to.' },
      ],
      takeaway: 'Analytics happens **after** the redirect, not during it. The redirect only appends an event; Kafka and the consumer absorb the cost.',
    },

    // ------------------------------------------------------------------ 4
    {
      id: 'caching', nav: 'Caching · Redis', title: 'Redis caching for the redirect path',
      arch: {
        nodes: { redis: { x: 800, y: 110 } },
        edges: [
          { from: 'app', to: 'redis', label: 'GET / SET url:code' },
          { from: 'app', to: 'mongo', label: 'miss · insert' },
        ],
      },
      flows: ['redirect-cache', 'redis-down', 'stampede'],
      challenge: { type: 'constraint', label: 'New constraint', text: 'The number of redirects is increasing significantly. **Every redirect currently requires a database lookup.**' },
      problem: 'At 4,000 redirects/s (and 40,000 during viral spikes), every one costs a MongoDB query: disk pages, connections and CPU. Yet traffic is extremely skewed: a small set of popular links gets most clicks, and we keep reading the **same documents** again and again.',
      introduce: { components: ['redis'], text: 'A **Redis** cache in front of MongoDB, used with the **cache-aside** pattern: the app reads Redis first and only goes to MongoDB on a miss.' },
      why: 'Memory reads take well under a millisecond and Redis handles 100k+ operations per second per node. With a 90%+ hit ratio, MongoDB sees a tenth of the read traffic and redirect latency drops.',
      how: [
        '**Cache hit**: `GET url:<code>` returns the URL; MongoDB is not touched.',
        '**Cache miss**: read MongoDB, then **populate** Redis with `SET url:<code> <url> EX 86400`.',
        '**TTL**: min(24 h, time until the link expires), so a cached link never outlives its expiry.',
        '**Popular URLs** stay cached; with `allkeys-lru` eviction the long tail drops out when memory is full.',
        '**Invalidation**: deleting or disabling a link writes MongoDB, then `DEL url:<code>`.',
      ],
      extra: [
        { t: 'Cache stampede', text: 'When a popular key is missing (just created, or just expired), thousands of requests miss at the same moment and all hit MongoDB. Fix: one request takes `SET lock:<code> NX EX 5` and loads; the others wait ~50 ms and re-read the cache. Watch the **Cache stampede** flow.' },
        { t: 'What caching does NOT solve', list: [
          'Writes (creates) still go to MongoDB; caching only helps reads.',
          'It adds a failure mode: what happens when Redis is down? (see the flow)',
          'It does not add capacity to the service itself; one Spring Boot instance is still the limit (next stage).',
        ] },
      ],
      without: 'Every redirect is a database query. Read load grows linearly with clicks, and a viral link can saturate MongoDB.',
      tradeoffs: [
        'Memory cost (about 5 GB for 10 M hot links, plus a replica).',
        '**Stale data** until the TTL expires or the key is deleted.',
        'Cache invalidation must happen on every delete or disable.',
        'Stampede and hot-key problems need extra handling.',
      ],
      failures: [
        '**Redis down**: fall back to MongoDB with a 50 ms timeout and a circuit breaker; MongoDB must be able to absorb the extra load, or rate limits must protect it.',
        '**Stampede** on a popular missing key: lock so only one request loads.',
        '**Hot key** overloading one Redis node: tiny in-process cache for the top links.',
      ],
      faq: [
        { q: 'Why not cache inside the Spring Boot process?', a: 'With one instance it would work. Once we have several instances (stage 6), each would have its own copy: lower hit ratio, and a deleted link would linger in every instance\'s memory. A shared cache keeps one view.' },
        { q: 'Write-through instead of cache-aside?', a: 'You could put new links into Redis on create, but most links are rarely clicked; cache-aside only caches what is actually read.' },
      ],
      takeaway: 'Cache-aside makes popular redirects memory-fast and shields MongoDB, at the cost of staleness, invalidation work and a new failure mode.',
    },

    // ------------------------------------------------------------------ 5
    {
      id: 'lb', nav: 'Load balancer', title: 'Put a load balancer in front',
      arch: {
        nodes: {
          lb: { x: 300, y: 300 },
          app: { x: 520, y: 300, label: 'Spring Boot app', sub: 'instance 1 · behind LB' },
        },
        remove: ['client-app'],
        edges: [
          { from: 'client', to: 'lb', label: 'HTTPS' },
          { from: 'lb', to: 'app' },
        ],
      },
      flows: ['via-lb', 'health-check'],
      challenge: { type: 'constraint', label: 'New constraint', text: 'Traffic has increased. **A single Spring Boot instance cannot handle the incoming requests reliably.**' },
      problem: 'Clients currently connect straight to one machine. To add capacity we must run more instances, but clients cannot be told about every instance, and DNS changes are slow and cached. There is also no way to stop sending traffic to an instance that is broken.',
      introduce: { components: ['lb'], text: 'A **load balancer**: one stable public address that forwards each request to a healthy instance.' },
      why: 'It decouples **where clients connect** from **which instances exist**. Instances can be added, removed, deployed and replaced behind it without clients noticing.',
      how: [
        '**Request distribution**: round robin, or least connections when request costs vary.',
        '**Health checks**: probe `/actuator/health` every 5 s; after 3 failures, take the instance out of the pool; add it back once it recovers.',
        '**Routing**: L7 (HTTP-aware) so it can route by path, terminate TLS and add headers.',
        '**Instance unavailable**: no traffic is sent to it; idempotent `GET`s that fail mid-connection can be retried on another instance.',
      ],
      extra: [
        { t: 'Load-balancing strategies', table: { rows: [
          ['**Round robin**', 'Simple; fine when requests cost about the same (our redirects).'],
          ['**Least connections**', 'Better when some requests are slow.'],
          ['**Hash (IP / key)**', 'Sticky routing; we avoid it because our services are stateless.'],
        ] } },
      ],
      without: 'Clients are tied to one machine. Scaling out means DNS changes; a crashed instance keeps receiving traffic.',
      tradeoffs: [
        'One more network hop (sub-millisecond).',
        'The LB itself must be highly available (managed, multi-zone).',
        'Health-check tuning: too strict flaps instances, too loose sends users to dead ones.',
      ],
      failures: [
        '**Only instance unhealthy**: the LB can only return `503` fast. Watch the flow: this is why the next stage adds instances.',
        '**LB failure**: use a managed load balancer with several nodes across zones.',
      ],
      faq: [
        { q: 'Why add an LB with only one instance?', a: 'It is the prerequisite for the next step. On its own it gives TLS termination, health checks and a stable address; its real value appears with two or more instances.' },
      ],
      takeaway: 'The load balancer gives clients one address and gives us freedom over the instances behind it.',
    },

    // ------------------------------------------------------------------ 6
    {
      id: 'scaling', nav: 'Horizontal scaling', title: 'Multiple application instances',
      arch: {
        nodes: {
          app: { x: 520, y: 190, label: 'Service A', sub: 'Spring Boot · A' },
          app2: { x: 520, y: 410 },
        },
        edges: [
          { from: 'lb', to: 'app2' },
          { from: 'app2', to: 'redis' },
          { from: 'app2', to: 'mongo' },
          { from: 'app2', to: 'kafka', kind: 'async' },
          { from: 'app', to: 'kafka', kind: 'async', label: 'ClickEvent', labelAt: .3 },
        ],
      },
      flows: ['two-instances', 'id-blocks', 'instance-crash'],
      challenge: { type: 'constraint', label: 'Scale out', text: 'One instance is a capacity limit and a single point of failure. **Run several identical instances behind the load balancer.**' },
      problem: 'Copying the service is easy only if it keeps **no state** of its own. Two things in our design quietly assume a single instance: anything cached in process memory, and the way we generate ids (one counter call per create).',
      introduce: { components: ['app2'], text: 'A second, identical instance (**Service B**). Both share the same Redis, MongoDB and Kafka. Ids are handed out in **blocks**.' },
      why: '**Horizontal scaling** adds capacity linearly and removes the single point of failure: if one instance dies, the other keeps serving while it is replaced.',
      how: [
        '**Stateless instances**: no sessions, no local-only data. Any instance can serve any request, so the LB can send anything anywhere.',
        '**Shared state** lives in shared systems: mappings in MongoDB, hot links in Redis, events in Kafka.',
        '**Concurrent requests**: two creates at the same moment must never get the same code.',
        '**ID block allocation**: each instance reserves 1,000 ids with one atomic `$inc: {seq: 1000}`. Pod A gets 1,000,000–1,000,999, Pod B gets 1,001,000–1,001,999, then each hands ids out **from memory**.',
        '**Crash**: unused ids in a dead instance\'s block are simply never used. Gaps are fine; duplicates are impossible.',
      ],
      extra: [
        { t: 'Why local in-memory caching alone is not enough', text: 'Each instance would hold its own copy: the hit ratio drops with every instance added, and when a link is deleted or disabled, other instances keep serving their stale copy until it expires. A shared Redis gives one consistent view; a tiny local cache (seconds) is only an add-on for hot keys.' },
        { t: 'Database connection pools', list: [
          'Each instance holds a connection pool (say 50). 10 instances × 50 = 500 connections to MongoDB.',
          'Scaling instances multiplies connections: size pools so the total stays under the database\'s limit.',
          'A pool that is too small queues requests inside the app; too large overloads the database.',
        ] },
        { t: 'Alternatives for unique ids', table: { rows: [
          ['**Id blocks** (chosen)', 'Simple, one DB call per 1,000 ids; gaps on crash.'],
          ['**Snowflake-style**', 'Timestamp + worker id + sequence; no DB call, but longer codes and needs unique worker ids.'],
          ['**Random + insert-if-absent**', 'Not guessable; needs retry on collision.'],
        ] } },
      ],
      without: 'Capacity stops at one machine, and any crash or deploy is an outage. Without block allocation, every create hits one hot counter document.',
      tradeoffs: [
        'Every shared system (Redis, MongoDB, Kafka) is now hit by N instances: watch connection counts.',
        'Id blocks leave gaps when an instance dies; codes are not strictly in creation order across instances.',
        'More instances means more to deploy and observe.',
      ],
      failures: [
        '**Instance crash**: health checks remove it; the others absorb its traffic (plan capacity for N + 1).',
        '**Counter document unavailable** (MongoDB failover): instances keep creating from the ids left in their current block.',
      ],
      faq: [
        { q: 'Could each instance just use its own counter?', a: 'Only if ranges are partitioned up front (for example high bits = instance id). Blocks from a shared counter achieve the same without fixed instance ids.' },
        { q: 'Why 1,000 per block?', a: 'Large enough that the counter is touched rarely (once per 1,000 creates), small enough that a crash wastes few ids. At 400 creates/s peak, a block lasts about 2.5 s per instance.' },
      ],
      takeaway: 'Stateless instances behind the LB, shared state in shared systems, and ids from atomically reserved blocks.',
    },

    // ------------------------------------------------------------------ 7
    {
      id: 'reliability', nav: 'Reliability & security', title: 'Reliability, security and production readiness',
      arch: {
        nodes: {
          safety: { x: 300, y: 110 },
          monitor: { x: 80, y: 560 },
          lb: { x: 300, y: 300, sub: 'TLS · rate limit · health' },
          redis: { x: 800, y: 110, sub: 'primary + replica' },
          mongo: { x: 800, y: 300, sub: 'replica set × 3' },
          kafka: { x: 800, y: 490, sub: 'RF 3 · dead-letter topic' },
        },
        edges: [{ from: 'app', to: 'safety', label: 'check URL' }],
      },
      flows: ['create-final', 'redirect-final', 'kafka-down', 'duplicate-event', 'mongo-failover'],
      challenge: { type: 'risk', label: 'Production readiness', text: 'The design scales. Now make it **survive failures and abuse**, and make problems visible before users report them.' },
      problem: 'Every component we added is also something that can fail, and a public shortener attracts spam and phishing. Most of this needs **configuration and behaviour**, not new boxes; only two problems genuinely need new components.',
      introduce: { components: ['safety', 'monitor'], text: 'A **URL safety API** checked on create (abuse needs outside knowledge), and **metrics & alerts** (partial failures are silent without them). Everything else in this stage is hardening of what already exists.' },
      why: 'Short links hide their destination, which makes them ideal for phishing; a shortener that redirects to malware gets its whole domain blocked. And with caches and queues, failures become quiet: a falling hit ratio or growing consumer lag never shows as an error page.',
      how: [
        '**Redis failure**: 50 ms timeout, circuit breaker, fall back to MongoDB; Redis runs as primary + replica with automatic failover.',
        '**MongoDB failover**: 3-node replica set; writes use `w: "majority"` and `retryWrites`; cached redirects keep working during the ~10 s election.',
        '**Kafka unavailable**: the producer never blocks the redirect; bounded buffer, then drop and count events.',
        '**Consumer lag**: alert on it; scale consumers up to the partition count.',
        '**Idempotent analytics**: counts and "applied up to offset" in one transaction.',
        '**Retry strategy**: retry only idempotent operations, with exponential backoff and jitter, and a retry budget so retries cannot multiply an outage.',
        '**Rate limiting** at the LB: per API key for creates, per IP for redirects; `429 Retry-After`.',
        '**Abuse prevention**: safety API on create, background re-scan, operator kill switch (DB flag + cache delete).',
        '**Hot keys**: in-process cache for the top links in front of Redis.',
        '**Indexing**: `_id` (the code) for lookups, TTL index on `expireAt`, `ownerId` for "my links".',
      ],
      extra: [
        { t: 'What to monitor', table: { head: ['Signal', 'Why'], rows: [
          ['Redirect p99 latency, error rate', 'The user-facing SLO'],
          ['Cache hit ratio, evictions', 'A falling ratio predicts MongoDB overload'],
          ['Kafka consumer lag, dropped events', 'Analytics freshness and loss'],
          ['MongoDB latency, pool usage, replication lag', 'Database health and failover risk'],
        ] } },
        { t: 'Capacity considerations', list: [
          'Size MongoDB so it survives a **cache outage** at reduced service (or rate-limit redirects when Redis is down).',
          'Keep N + 1 service instances so one failure does not overload the rest.',
          'Kafka retention (for example 7 days) bounds how long analytics can be down and still recover by replay.',
        ] },
      ],
      without: 'The system works on a good day only: one dependency failing turns into a full outage, abuse goes unnoticed, and we learn about problems from users.',
      tradeoffs: [
        'Dropping click events during a Kafka outage trades analytics accuracy for redirect availability.',
        'Falling back to MongoDB when Redis is down trades database load for availability.',
        'The safety check adds latency to creates and can block legitimate links (false positives).',
        'Rate limits protect the system but can throttle legitimate heavy users; set limits per plan.',
      ],
      failures: [
        '**Redis down** → slower redirects from MongoDB, protected by timeout + circuit breaker.',
        '**MongoDB primary down** → ~10 s of failed writes, retried; cached redirects unaffected.',
        '**Kafka down** → events buffered, then dropped and counted; redirects unaffected.',
        '**Consumer behind** → stale counts; scale consumers.',
        '**Safety API down** → accept creates, queue them for priority re-scan.',
        '**One service instance down** → LB routes around it.',
      ],
      faq: [
        { q: 'Should we add more components to look thorough?', a: 'No. Each box must answer a requirement. Rate limiting, retries, idempotency, indexing and failover are behaviour and configuration of existing parts; only the safety check and monitoring needed new pieces.' },
        { q: 'Where should rate limiting live?', a: 'At the edge (LB / API gateway) so abusive traffic never reaches the services; counters in Redis if limits must be shared across LB nodes.' },
      ],
      takeaway: 'Decide in advance what degrades and how: drop analytics before redirects, fall back before failing, and measure everything.',
    },

    // ------------------------------------------------------------------ 8
    {
      id: 'interview', nav: 'Interview ready', title: 'Interview ready', kind: 'summary',
    },
  ]);
})();
