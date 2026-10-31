// URL Shortener · material that is not tied to one stage: requirements, estimates, APIs, schema,
// strategies, follow-ups and the 45-minute plan. Stage 1 and the interview-ready view both read from here.
LAB.define('url-shortener', 'kb', {
  problem: 'Design a URL shortening service like Bitly: turn a long URL into a short code, and redirect anyone who opens the short link to the original URL, fast, for years.',
  summary: 'Two endpoints: `POST /api/urls` creates a code and `GET /{code}` answers `302`. Codes come from a **counter encoded in base62**; each instance reserves **blocks of 1,000 ids** with an atomic `$inc`, so codes are unique without a lock per request. Mappings live in **MongoDB** keyed by code, with a TTL index for expiry. Redirects outnumber creates 100 : 1, so a shared **Redis** cache (cache-aside, 24 h TTL, stampede lock) serves popular links in under a millisecond. Each redirect publishes a click event to **Kafka**; an analytics consumer aggregates in batches and writes counts idempotently, so analytics never slows a redirect. Stateless **Spring Boot** instances sit behind a **load balancer** with health checks and edge rate limiting. When Redis fails we fall back to MongoDB behind a circuit breaker; when Kafka fails we drop events rather than redirects.',
  requirements: {
    functional: [
      'Create a short URL from a long URL (optionally with an expiry, optionally a custom alias).',
      'Redirect anyone who opens the short URL to the original URL.',
      'Links stop working after their expiration time.',
      'Count clicks per link (added in stage 3).',
    ],
    nonFunctional: [
      '**Low redirect latency**: p99 under ~50 ms server-side; redirects are the hot path.',
      '**High availability**: redirects must keep working even when parts of the system fail (99.99%).',
      '**Scalability**: reads outnumber writes about 100 : 1; traffic grows and spikes on viral links.',
      '**Durability**: a created link must never be lost or start pointing elsewhere.',
      '**Unique short codes**: no two long URLs may ever get the same code.',
    ],
    outOfScope: ['User accounts and dashboards', 'Editing a link\'s destination', 'Custom domains', 'Detailed analytics (geo, device) beyond counts'],
  },
  capacity: {
    table: {
      head: ['Quantity', 'Assumption / maths', 'Result'],
      rows: [
        ['New links', '100 M / month ÷ 2.6 M s', '**≈ 40 / s** (peak ×10 ≈ 400 / s)'],
        ['Redirects', '100 × creates', '**≈ 4,000 / s** (viral peaks 40k+ / s)'],
        ['Links stored', '100 M × 12 × 5 years', '**6 billion**'],
        ['Code length', '62⁷ ≈ 3.5 trillion ≫ 6 billion', '**7 characters** is plenty'],
        ['Storage', '6 B × ~500 B', '**≈ 3 TB** (shard by code when needed)'],
        ['Cache', '~10 M hot links × ~500 B', '**≈ 5 GB**: one Redis + replica'],
      ],
    },
    after: 'Conclusion to say out loud: storage is modest, writes are easy, the **read path** is what needs design.',
  },
  apis: {
    table: {
      head: ['Endpoint', 'Request', 'Response'],
      rows: [
        ['`POST /api/urls`', '`{url, ttlDays?, alias?}` + API key', '`201 {code, shortUrl, expireAt}` · `400` invalid / unsafe · `409` alias taken · `429`'],
        ['`GET /{code}`', '-', '`302 Location: <url>` · `404` unknown · `410` expired'],
        ['`GET /api/urls/{code}/stats`', 'API key (owner)', '`{clicks, lastClickAt}` (seconds behind: eventually consistent)'],
        ['`DELETE /api/urls/{code}`', 'API key (owner)', '`204` (also deletes the cache key)'],
      ],
    },
  },
  schema: {
    code: `// urls: one document per short link; the code is the primary key
{ _id: "4c92", url: "https://example.com/very/long", ownerId: "u42",
  createdAt: ISODate("2026-10-31"), expireAt: ISODate("2026-11-30") }
db.urls.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })   // TTL delete

// counters: hands out ids (single +1 in stage 2, blocks of 1,000 from stage 6)
{ _id: "url", seq: 1002000 }

// clicks: written only by the analytics consumer
{ _id: "4c92", total: 18312, byDay: { "2026-10-31": 912 } }

// consumer_offsets: makes analytics idempotent
{ _id: "url-clicks:3", appliedUpTo: 9499 }`,
  },
  caching: [
    '**Cache-aside** on the redirect path: `GET url:<code>` → on miss read MongoDB → `SET … EX 86400`.',
    'TTL = min(24 h, time until the link\'s `expireAt`), so a cached link never outlives its expiry.',
    '`allkeys-lru` eviction: popular links stay, the long tail falls out.',
    'Cache "not found" for ~60 s to stop scanners hammering MongoDB with random codes.',
    'Stampede protection: `SET lock:<code> NX EX 5`; one loader, others wait and re-read.',
    'Hot keys: a tiny in-process cache (2–5 s) in each instance for the top links.',
    'Delete / disable a link → `DEL url:<code>` after the DB write.',
    'Redis down → 50 ms timeout + circuit breaker → read MongoDB.',
  ],
  scaling: [
    'Stateless Spring Boot instances behind a load balancer; scale on CPU / request rate; run N + 1.',
    'Shared Redis (primary + replica, Sentinel or a managed service); shard with Redis Cluster if memory grows.',
    'MongoDB replica set (3 nodes); shard on hashed `_id` past a few TB.',
    'Id blocks of 1,000 per instance: the counter is hit once per 1,000 creates.',
    'Kafka topic with 12 partitions keyed by code; up to 12 analytics consumers.',
    'Connection pools sized per instance so that instances × pool size stays under MongoDB\'s connection limit.',
    'Rate limiting at the LB per API key (creates) and per IP (redirects).',
  ],
  decisions: {
    table: {
      head: ['Decision', 'Why', 'Trade-off'],
      rows: [
        ['Counter + base62', 'Short, unique by construction, no collision checks', 'Sequential codes are guessable; shuffle with a bijective scramble if that matters'],
        ['302, not 301', 'Every click reaches us, so it can be counted', 'More traffic than letting browsers cache a 301'],
        ['Kafka for clicks', 'Redirect never waits for analytics; replayable', 'Counts lag by seconds; another system to operate'],
        ['Redis cache-aside', 'Sub-ms reads for popular links, DB protected', 'Stale data until TTL / delete; memory cost'],
        ['Id blocks', 'No per-request coordination across instances', 'Crashes leave unused gaps (harmless)'],
      ],
    },
  },
  flows: [
    { h: 'Create URL flow', flow: 'create-final', variant: 'safe' },
    { h: 'Redirect flow', flow: 'redirect-final', variant: 'miss' },
    { h: 'Analytics flow', flow: 'redirect-analytics' },
  ],
  followups: [
    { q: 'Why not hash the long URL (MD5 / SHA) and take 7 characters?', a: 'Truncated hashes collide, so every insert needs a check-and-retry, and two users shortening the same URL get the same code (a problem if links have different owners or expiries). A counter is unique by construction. Use hashing only if you want deduplication on purpose.' },
    { q: 'Sequential codes are guessable. Is that a problem?', a: 'Someone can enumerate recent links. If links may be private, scramble the id with a bijective function (for example a Feistel network or multiply by a large odd number mod 62⁷) before base62: still unique, no longer sequential. Or use random 8-character codes with an insert-if-absent and retry.' },
    { q: 'How do custom aliases work?', a: 'Insert with the alias as `_id`; the unique primary key rejects duplicates (`409`). Keep aliases in a namespace that the counter can never produce (for example require a minimum length or a character the encoder never emits).' },
    { q: 'Why does the redirect check `expireAt` if there is a TTL index?', a: 'MongoDB\'s TTL monitor runs about once a minute and can fall behind, so an expired document may still exist. The app check makes expiry exact; the TTL index just cleans up storage.' },
    { q: 'What if the same viral link hits one Redis shard too hard?', a: 'Hot key. Add a tiny in-process cache (a few seconds) in each instance for the hottest codes, or replicate that key to read replicas. Detect hot keys from metrics rather than guessing.' },
    { q: 'How would you go multi-region?', a: 'Redirects: serve from every region with a regional Redis and a MongoDB read replica (or a globally distributed DB). Creates: either route to one write region, or give each region its own id range (high bits = region id) so codes stay unique without cross-region coordination.' },
    { q: 'Can analytics be exactly-once?', a: 'With Kafka transactions plus an idempotent sink, close to it. We store the last applied offset per partition in the same DB transaction as the counts, so a redelivered batch is skipped. If approximate counts are acceptable, skip the transaction and accept rare duplicates.' },
    { q: 'Why Kafka and not just `@Async` or a thread pool?', a: 'An in-memory queue loses events on every crash or deploy, cannot be replayed, and cannot feed a second consumer. Kafka is durable, replayable and multi-consumer. If none of those matter, a Redis `INCR` in the background is a valid simpler answer.' },
    { q: 'How do you stop abuse (spam, phishing)?', a: 'Rate limit creates per API key and per IP at the edge, check URLs against a safety API at creation, re-scan in the background, and let operators disable a code (DB flag + cache delete) in seconds.' },
    { q: 'What do you monitor?', a: 'Redirect p99 latency and error rate (the SLO), cache hit ratio, Kafka consumer lag and dropped events, MongoDB latency / pool usage / replication lag. Alert on SLO burn, not single spikes.' },
  ],
  plan: [
    { t: 'Clarify requirements', min: 5, say: ['Create, redirect, expiry; analytics?', 'Read : write ratio, scale, latency target', 'Name what is out of scope'] },
    { t: 'Estimate', min: 4, say: ['~40 creates/s, ~4k redirects/s', '6 B links, ~3 TB, 7-char codes', '"The read path is what needs design"'] },
    { t: 'API & data model', min: 5, say: ['`POST /api/urls`, `GET /{code}` → 302', '`{_id: code, url, expireAt}` + TTL index', 'Counter + base62 for codes'] },
    { t: 'Basic design', min: 6, say: ['Client → Spring Boot → MongoDB', 'Walk create and redirect end to end', '"This meets the functional requirements; now scale it"'] },
    { t: 'Evolve the design', min: 17, say: ['Kafka for clicks: why async, lag, duplicates', 'Redis cache-aside: hit / miss, TTL, stampede', 'LB + stateless instances, id blocks'] },
    { t: 'Reliability & wrap-up', min: 8, say: ['Redis / Kafka / Mongo failures and fallbacks', 'Rate limiting, URL safety, monitoring', 'Recap the trade-offs; invite questions'] },
  ],
});
