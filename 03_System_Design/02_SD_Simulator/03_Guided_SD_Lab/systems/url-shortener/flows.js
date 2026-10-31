// URL Shortener · request flows. A track { p: [node ids], l: label, k: tone, ret?: reply label, rk?: reply tone,
// fail?: refused on the last hop } moves a packet along existing connections; tracks in one step run in parallel.
// Tones: req (blue), res / ok (green), async (purple), cache (orange), fail (red).
LAB.define('url-shortener', 'flows', {
  // ---------- stage 1 ----------
  journeys: {
    title: 'The two user journeys', sub: 'What the black box must do', tone: 'req',
    variants: {
      shorten: { label: 'Shorten', steps: [
        { t: 'A user pastes a long URL and asks for a short one.', go: [{ p: ['client', 'app'], l: 'long URL' }] },
        { t: 'The service returns a **short code that must never point anywhere else**. Creates are rare: about 40 per second.', go: [{ p: ['app', 'client'], l: 'sho.rt/4c92', k: 'ok' }], chip: { client: ['short link saved', 'ok'] } },
      ] },
      redirect: { label: 'Redirect', steps: [
        { t: 'Someone clicks `sho.rt/4c92`.', go: [{ p: ['client', 'app'], l: 'GET /4c92' }] },
        { t: 'The service answers with a redirect to the original URL. Clicks outnumber creates about **100 : 1**, so this path must be fast.', go: [{ p: ['app', 'client'], l: '302 → original', k: 'ok' }], chip: { client: ['opens original page', 'ok'] } },
      ] },
    },
  },

  // ---------- stage 2 ----------
  create: {
    title: 'Create a short URL', sub: 'counter + base62, then insert', tone: 'ok',
    steps: [
      { t: 'The client sends the long URL: `POST /api/urls {"url": "https://…/very/long", "ttlDays": 30}`.', go: [{ p: ['client', 'app'], l: 'POST /api/urls' }] },
      { t: 'The app validates the URL (scheme, length), then **atomically** takes the next number from the counter document: `findOneAndUpdate($inc: {seq: 1})`.', go: [{ p: ['app', 'mongo'], l: '$inc seq', ret: 'seq = 1,000,000' }], chip: { mongo: 'counter → 1,000,000' } },
      { t: 'It encodes the number in base62: `base62(1,000,000) = "4c92"`. Unique number in, unique code out: no collision check needed.', chip: { app: ['code = "4c92"', 'req'] } },
      { t: 'It inserts the mapping `{_id: "4c92", url, expireAt}`. The code is the primary key, so a lookup later is one index probe.', go: [{ p: ['app', 'mongo'], l: 'insert 4c92', ret: 'ack' }], chip: { mongo: ['urls: 4c92 → …/very/long', 'ok'] } },
      { t: 'The app answers `201 Created` with `https://sho.rt/4c92`.', go: [{ p: ['app', 'client'], l: '201 sho.rt/4c92', k: 'ok' }], mark: { client: 'ok' } },
    ],
  },
  redirect: {
    title: 'Redirect', sub: 'find by code, then 302', tone: 'req',
    variants: {
      found: { label: 'Found', steps: [
        { t: 'A browser requests `GET /4c92`.', go: [{ p: ['client', 'app'], l: 'GET /4c92' }] },
        { t: 'The app looks the code up by primary key: `findOne({_id: "4c92"})`, about 2–5 ms.', go: [{ p: ['app', 'mongo'], l: 'find 4c92', ret: '{url, expireAt}' }] },
        { t: '`expireAt` is in the future, so the app answers `302 Found` with `Location: https://…/very/long`. The browser follows it.', go: [{ p: ['app', 'client'], l: '302 Location', k: 'ok' }], mark: { client: 'ok' }, chip: { client: ['redirected', 'ok'] } },
      ] },
      expired: { label: 'Expired', steps: [
        { t: 'A browser requests a link created with a 30-day expiry, 31 days ago.', go: [{ p: ['client', 'app'], l: 'GET /4c92' }] },
        { t: 'The document is still there: MongoDB\'s TTL monitor only deletes about once a minute, so **the app checks `expireAt` itself**.', go: [{ p: ['app', 'mongo'], l: 'find 4c92', ret: 'expireAt < now' }], chip: { app: ['expired', 'warn'] } },
        { t: 'The app answers `410 Gone` (the link existed, but is no longer valid).', go: [{ p: ['app', 'client'], l: '410 Gone', k: 'fail' }], mark: { client: 'warn' } },
      ] },
      unknown: { label: 'Unknown', steps: [
        { t: 'A browser requests a code that was never created (a typo, or someone guessing).', go: [{ p: ['client', 'app'], l: 'GET /zzzz' }] },
        { t: 'The lookup returns nothing.', go: [{ p: ['app', 'mongo'], l: 'find zzzz', ret: 'null' }] },
        { t: 'The app answers `404 Not Found`. (Later we cache this "not found" briefly too, so scanners cannot hammer the database.)', go: [{ p: ['app', 'client'], l: '404', k: 'fail' }], mark: { client: 'fail' } },
      ] },
    },
  },

  // ---------- stage 3 ----------
  'redirect-analytics': {
    title: 'Redirect + click event', sub: 'the event never blocks the redirect', tone: 'async',
    steps: [
      { t: 'A browser requests `GET /4c92`.', go: [{ p: ['client', 'app'], l: 'GET /4c92' }] },
      { t: 'The app resolves the code in MongoDB, exactly as before.', go: [{ p: ['app', 'mongo'], l: 'find 4c92', ret: 'url' }] },
      { t: 'Two things happen **at the same time**: the app sends `302` back, and hands a `ClickEvent` to the Kafka producer. `send()` only appends to an in-memory batch, so the response does not wait for the broker.', go: [{ p: ['app', 'client'], l: '302', k: 'ok' }, { p: ['app', 'kafka'], l: 'ClickEvent', k: 'async' }], chip: { client: ['redirected · 6 ms', 'ok'], kafka: ['partition 3 · offset 9,412', 'async'] } },
      { t: 'Later (milliseconds to seconds), the analytics consumer polls a **batch** of events from its partitions.', go: [{ p: ['kafka', 'analytics'], l: 'batch × 500', k: 'async' }], chip: { analytics: ['4c92 +312 · x9Qa +7 …', 'async'] } },
      { t: 'It writes one bulk `$inc` for the whole batch, then commits its offset. The user was redirected long before the count changed: **eventual consistency**.', go: [{ p: ['analytics', 'mongo'], l: 'bulk $inc', ret: 'ok' }], chip: { mongo: ['clicks: 4c92 = 18,312', 'ok'] } },
    ],
  },
  'slow-consumer': {
    title: 'Analytics falls behind', sub: 'lag grows, redirects stay fast', tone: 'warn',
    steps: [
      { t: 'A link goes viral: thousands of redirects per second, each producing an event.', go: [{ p: ['client', 'app'], l: 'GET /4c92' }, { p: ['client', 'app'], l: 'GET /4c92', delay: 150 }, { p: ['client', 'app'], l: 'GET /x9Qa', delay: 300 }] },
      { t: 'Redirects are answered as fast as before; the events queue up in Kafka.', go: [{ p: ['app', 'client'], l: '302', k: 'ok' }, { p: ['app', 'kafka'], l: 'events ×3k/s', k: 'async' }], chip: { client: ['still ~6 ms', 'ok'] } },
      { t: 'The analytics consumer is slower than the producers (say 1,000 events/s vs 3,000/s). **Consumer lag** grows: counts become minutes stale.', go: [{ p: ['kafka', 'analytics'], l: 'batch', k: 'async', ms: 1100 }], mark: { analytics: 'warn' }, chip: { kafka: ['lag 120,000 events', 'warn'], analytics: ['1k events/s', 'warn'] } },
      { t: 'Nothing user-facing broke: that is the point of the decoupling. The fix is more consumers in the group, **up to the number of partitions** (12 partitions → at most 12 consumers working).', mark: { analytics: 'ok' }, chip: { analytics: ['scaled to 6 consumers', 'ok'], kafka: ['lag falling', 'ok'] } },
    ],
  },

  // ---------- stage 4 ----------
  'redirect-cache': {
    title: 'Redirect with cache', sub: 'cache-aside: hit and miss', tone: 'cache',
    variants: {
      hit: { label: 'Cache hit', steps: [
        { t: 'A browser requests `GET /4c92`.', go: [{ p: ['client', 'app'], l: 'GET /4c92' }] },
        { t: 'The app asks Redis first: `GET url:4c92`.', go: [{ p: ['app', 'redis'], l: 'GET url:4c92', k: 'cache', ret: 'HIT', rk: 'cache' }], mark: { redis: 'ok' }, chip: { redis: ['HIT · 0.4 ms', 'ok'] } },
        { t: '**MongoDB is not touched.** The app answers `302` and, as before, emits the click event without waiting.', go: [{ p: ['app', 'client'], l: '302', k: 'ok' }, { p: ['app', 'kafka'], l: 'ClickEvent', k: 'async' }], chip: { client: ['redirected · 2 ms', 'ok'] } },
      ] },
      miss: { label: 'Cache miss', steps: [
        { t: 'A browser requests a link nobody clicked recently: `GET /x9Qa`.', go: [{ p: ['client', 'app'], l: 'GET /x9Qa' }] },
        { t: 'Redis does not have it.', go: [{ p: ['app', 'redis'], l: 'GET url:x9Qa', k: 'cache', ret: 'MISS', rk: 'fail' }], mark: { redis: 'warn' }, chip: { redis: ['MISS', 'warn'] } },
        { t: 'The app falls back to MongoDB, the source of truth.', go: [{ p: ['app', 'mongo'], l: 'find x9Qa', ret: 'url' }] },
        { t: 'It **populates the cache** (`SET url:x9Qa <url> EX 86400`) and answers `302` at the same time; the next click on this link is a hit.', go: [{ p: ['app', 'redis'], l: 'SET … EX 24h', k: 'cache' }, { p: ['app', 'client'], l: '302', k: 'ok' }, { p: ['app', 'kafka'], l: 'ClickEvent', k: 'async' }], mark: { redis: 'ok' }, chip: { redis: ['cached for 24 h', 'ok'], client: ['redirected · 7 ms', 'ok'] } },
      ] },
    },
  },
  'redis-down': {
    title: 'Redis is down', sub: 'fall back to MongoDB, carefully', tone: 'fail',
    steps: [
      { t: 'Redis crashes. Requests keep coming.', mark: { redis: 'down' }, chip: { redis: ['unreachable', 'fail'] }, go: [{ p: ['client', 'app'], l: 'GET /4c92' }] },
      { t: 'The cache call fails after a **50 ms timeout**. After a few failures a **circuit breaker** opens and the app skips Redis for 30 s instead of paying that timeout on every request.', go: [{ p: ['app', 'redis'], l: 'GET url:4c92', k: 'cache', fail: true }], chip: { app: ['breaker open → skip cache', 'warn'] } },
      { t: 'Every redirect now reads MongoDB. Load on it jumps (here, about 20×): this is why the database must be sized, or rate-limited, to survive a cache outage.', go: [{ p: ['app', 'mongo'], l: 'find 4c92', ret: 'url' }], mark: { mongo: 'warn' }, chip: { mongo: ['reads ×20', 'warn'] } },
      { t: 'Users are still redirected, just slower. **Degraded, not down.**', go: [{ p: ['app', 'client'], l: '302', k: 'ok' }], chip: { client: ['redirected · 9 ms', 'ok'] } },
    ],
  },
  stampede: {
    title: 'Cache stampede', sub: 'many misses for one key at once', tone: 'warn',
    steps: [
      { t: 'A link is posted somewhere huge seconds after it was created. It is not cached yet; thousands of requests arrive together.', go: [{ p: ['client', 'app'], l: 'GET /4c92' }, { p: ['client', 'app'], l: 'GET /4c92', delay: 130 }, { p: ['client', 'app'], l: 'GET /4c92', delay: 260 }] },
      { t: 'They all miss. Without protection, **all of them** would query MongoDB for the same document.', go: [{ p: ['app', 'redis'], l: 'GET', k: 'cache', ret: 'MISS', rk: 'fail' }, { p: ['app', 'redis'], l: 'GET', k: 'cache', ret: 'MISS', rk: 'fail', delay: 150 }], mark: { redis: 'warn' }, chip: { redis: ['3,000 misses', 'warn'] } },
      { t: 'Instead, each tries `SET lock:4c92 1 NX EX 5`. Exactly one wins; the rest wait ~50 ms and re-read the cache.', go: [{ p: ['app', 'redis'], l: 'SET lock NX', k: 'cache', ret: 'OK (winner)', rk: 'ok' }], chip: { app: ['1 loader, rest wait', 'req'] } },
      { t: 'Only the winner reads MongoDB and fills the cache.', go: [{ p: ['app', 'mongo'], l: 'find 4c92', ret: 'url' }, { p: ['app', 'redis'], l: 'SET url:4c92', k: 'cache', delay: 1250 }], chip: { mongo: ['1 query, not 3,000', 'ok'] }, mark: { redis: 'ok' } },
      { t: 'The waiting requests now hit the cache and everyone is redirected.', go: [{ p: ['app', 'redis'], l: 'GET', k: 'cache', ret: 'HIT', rk: 'cache' }, { p: ['app', 'client'], l: '302 ×3,000', k: 'ok' }], chip: { redis: ['HIT', 'ok'] } },
    ],
  },

  // ---------- stage 5 ----------
  'via-lb': {
    title: 'Request through the LB', sub: 'TLS at the edge, then route', tone: 'req',
    steps: [
      { t: 'The browser connects to the **load balancer**, the only public address. TLS ends here.', go: [{ p: ['client', 'lb'], l: 'GET /4c92 (HTTPS)' }], chip: { lb: ['TLS terminated', 'req'] } },
      { t: 'The LB picks a healthy instance from its pool (only one so far) and forwards plain HTTP.', go: [{ p: ['lb', 'app'], l: 'GET /4c92' }] },
      { t: 'The app works exactly as before: cache first.', go: [{ p: ['app', 'redis'], l: 'GET url:4c92', k: 'cache', ret: 'HIT', rk: 'cache' }], chip: { redis: ['HIT', 'ok'] } },
      { t: 'The `302` travels back through the LB to the browser.', go: [{ p: ['app', 'lb', 'client'], l: '302', k: 'ok' }, { p: ['app', 'kafka'], l: 'ClickEvent', k: 'async' }], mark: { client: 'ok' } },
    ],
  },
  'health-check': {
    title: 'Instance goes unhealthy', sub: 'health checks with one instance', tone: 'fail',
    steps: [
      { t: 'Every 5 s the LB probes `GET /actuator/health`. The instance answers `UP`.', go: [{ p: ['lb', 'app'], l: 'health?', k: 'info', ret: '200 UP', rk: 'ok' }], chip: { lb: ['healthy 1 / 1', 'ok'] } },
      { t: 'The instance runs out of memory and stops answering.', mark: { app: 'down' }, chip: { app: ['crashed', 'fail'] } },
      { t: 'Three probes in a row fail; the LB takes the instance **out of rotation**.', go: [{ p: ['lb', 'app'], l: 'health?', k: 'info', fail: true }], chip: { lb: ['healthy 0 / 1', 'fail'] } },
      { t: 'With nothing healthy behind it, the LB can only fail fast with `503`. Better than hanging, but still an outage: **one instance is not enough.** Next stage.', go: [{ p: ['client', 'lb'], l: 'GET /4c92' }, { p: ['lb', 'client'], l: '503', k: 'fail', delay: 650 }], mark: { client: 'fail' } },
    ],
  },

  // ---------- stage 6 ----------
  'two-instances': {
    title: 'Two requests, two instances', sub: 'round robin over stateless services', tone: 'req',
    steps: [
      { t: 'Two requests arrive at the same moment.', go: [{ p: ['client', 'lb'], l: 'GET /4c92' }, { p: ['client', 'lb'], l: 'GET /x9Qa', delay: 150 }] },
      { t: 'Round robin sends one to **Service A** and the other to **Service B**.', go: [{ p: ['lb', 'app'], l: 'GET /4c92' }, { p: ['lb', 'app2'], l: 'GET /x9Qa' }], chip: { lb: ['round robin', 'req'] } },
      { t: 'Both read the **same Redis**. A link cached by Service A is a hit for Service B: that is why the cache is shared, not in each instance\'s memory.', go: [{ p: ['app', 'redis'], l: 'GET', k: 'cache', ret: 'HIT', rk: 'cache' }, { p: ['app2', 'redis'], l: 'GET', k: 'cache', ret: 'HIT', rk: 'cache' }], chip: { redis: ['shared · HIT ×2', 'ok'] } },
      { t: 'Both answer through the LB. Neither instance remembers anything about the request afterwards: **stateless**.', go: [{ p: ['app', 'lb', 'client'], l: '302', k: 'ok' }, { p: ['app2', 'lb', 'client'], l: '302', k: 'ok', delay: 150 }], mark: { client: 'ok' } },
    ],
  },
  'id-blocks': {
    title: 'ID block allocation', sub: 'unique codes without a per-request lock', tone: 'ok',
    steps: [
      { t: 'On start-up, Service A reserves a block of 1,000 ids with one atomic call: `findOneAndUpdate({_id: "url"}, {$inc: {seq: 1000}})`.', go: [{ p: ['app', 'mongo'], l: '$inc seq 1000', ret: '1,000,000–1,000,999' }], chip: { app: ['block 1,000,000–1,000,999', 'ok'] } },
      { t: 'Service B does the same and gets the **next** block. `$inc` is atomic, so the two blocks can never overlap.', go: [{ p: ['app2', 'mongo'], l: '$inc seq 1000', ret: '1,001,000–1,001,999' }], chip: { app2: ['block 1,001,000–1,001,999', 'ok'], mongo: ['seq = 1,002,000', 'info'] } },
      { t: 'Two creates arrive together and land on different instances.', go: [{ p: ['client', 'lb', 'app'], l: 'POST /api/urls' }, { p: ['client', 'lb', 'app2'], l: 'POST /api/urls' }] },
      { t: 'Each takes the next number **from its own block, in memory**: A uses 1,000,000 → `4c92`, B uses 1,001,000 → `4cpa`. No database round trip, no lock, no collision.', chip: { app: ['1,000,000 → "4c92"', 'req'], app2: ['1,001,000 → "4cpa"', 'req'] } },
      { t: 'Both insert their mappings and answer. The counter is touched once per **1,000** creates instead of once per create.', go: [{ p: ['app', 'mongo'], l: 'insert 4c92', ret: 'ack' }, { p: ['app2', 'mongo'], l: 'insert 4cpa', ret: 'ack' }], mark: { mongo: 'ok' } },
    ],
  },
  'instance-crash': {
    title: 'Instance crashes mid-block', sub: 'gaps, never duplicates', tone: 'fail',
    steps: [
      { t: 'Service A has used ids up to 1,000,412 of its block when it crashes.', mark: { app: 'down' }, chip: { app: ['crashed at 1,000,412', 'fail'] } },
      { t: 'Health checks fail; the LB stops sending traffic to A.', go: [{ p: ['lb', 'app'], l: 'health?', k: 'info', fail: true }], chip: { lb: ['healthy 1 / 2', 'warn'] } },
      { t: 'All requests go to Service B. Users notice nothing (as long as B has the capacity: plan for N + 1).', go: [{ p: ['client', 'lb', 'app2'], l: 'POST /api/urls' }], chip: { app2: ['1,001,001 → "4cpb"', 'ok'] } },
      { t: 'A restarts and reserves a **fresh** block, 1,002,000–1,002,999. Ids 1,000,413–1,000,999 are never used. That gap is harmless: codes only need to be unique, not consecutive.', mark: { app: 'ok' }, go: [{ p: ['app', 'mongo'], l: '$inc seq 1000', ret: '1,002,000–1,002,999' }], chip: { app: ['new block from 1,002,000', 'ok'] } },
    ],
  },

  // ---------- stage 7 ----------
  'create-final': {
    title: 'Create (production)', sub: 'rate limit, safety check, id block', tone: 'ok',
    variants: {
      safe: { label: 'Safe URL', steps: [
        { t: 'The client sends `POST /api/urls` with its API key. The LB checks the key\'s rate limit (100 creates / min) before anything else.', go: [{ p: ['client', 'lb'], l: 'POST /api/urls' }], chip: { lb: ['42 / 100 this min', 'ok'] } },
        { t: 'The request reaches an instance, which validates the URL and asks the **URL safety API** (100 ms timeout).', go: [{ p: ['lb', 'app'], l: 'POST /api/urls' }, { p: ['app', 'safety'], l: 'check URL', delay: 650, ret: 'clean', rk: 'ok' }] },
        { t: 'It takes the next id from its **block in memory** and encodes it: 1,000,413 → `4cfH`.', chip: { app: ['1,000,413 → "4cfH"', 'req'] } },
        { t: 'It inserts the mapping; the replica set acknowledges once a **majority** has it (`w: "majority"`), so a failover cannot lose it.', go: [{ p: ['app', 'mongo'], l: 'insert 4cfH', ret: 'ack (majority)' }] },
        { t: '`201 Created` with the short URL.', go: [{ p: ['app', 'lb', 'client'], l: '201 sho.rt/4cfH', k: 'ok' }], mark: { client: 'ok' } },
      ] },
      malicious: { label: 'Malicious URL', steps: [
        { t: 'Someone tries to shorten a known phishing page.', go: [{ p: ['client', 'lb', 'app'], l: 'POST /api/urls' }] },
        { t: 'The safety API recognises it.', go: [{ p: ['app', 'safety'], l: 'check URL', ret: 'PHISHING', rk: 'fail' }], mark: { safety: 'fail' }, chip: { safety: ['known phishing', 'fail'] } },
        { t: 'Nothing is stored; the client gets `400`. The attempt is logged per API key, and repeated attempts get the key blocked.', go: [{ p: ['app', 'lb', 'client'], l: '400 rejected', k: 'fail' }], mark: { client: 'fail' } },
      ] },
    },
  },
  'redirect-final': {
    title: 'Redirect (production)', sub: 'the hot path, end to end', tone: 'req',
    variants: {
      hit: { label: 'Cache hit', steps: [
        { t: 'The browser requests `GET /4c92` from the load balancer (TLS, per-IP rate limit).', go: [{ p: ['client', 'lb'], l: 'GET /4c92' }] },
        { t: 'The LB forwards to any healthy instance.', go: [{ p: ['lb', 'app2'], l: 'GET /4c92' }] },
        { t: 'The instance reads the shared Redis: hit.', go: [{ p: ['app2', 'redis'], l: 'GET url:4c92', k: 'cache', ret: 'HIT', rk: 'cache' }], chip: { redis: ['HIT', 'ok'] } },
        { t: 'It answers `302` and, in parallel, publishes the click event to Kafka without waiting.', go: [{ p: ['app2', 'lb', 'client'], l: '302', k: 'ok' }, { p: ['app2', 'kafka'], l: 'ClickEvent', k: 'async' }], mark: { client: 'ok' }, chip: { client: ['~2 ms server time', 'ok'] } },
        { t: 'The analytics consumer picks the event up later and updates the counts idempotently.', go: [{ p: ['kafka', 'analytics', 'mongo'], l: 'batch → $inc', k: 'async' }] },
      ] },
      miss: { label: 'Cache miss', steps: [
        { t: 'The browser requests a less popular link through the LB.', go: [{ p: ['client', 'lb', 'app'], l: 'GET /x9Qa' }] },
        { t: 'Redis misses; the instance reads MongoDB (with the stampede lock if many requests miss together).', go: [{ p: ['app', 'redis'], l: 'GET', k: 'cache', ret: 'MISS', rk: 'fail' }, { p: ['app', 'mongo'], l: 'find x9Qa', ret: 'url', delay: 1250 }] },
        { t: 'It fills the cache, answers `302` and publishes the event, all without waiting on each other.', go: [{ p: ['app', 'redis'], l: 'SET EX 24h', k: 'cache' }, { p: ['app', 'lb', 'client'], l: '302', k: 'ok' }, { p: ['app', 'kafka'], l: 'ClickEvent', k: 'async' }], mark: { client: 'ok' } },
      ] },
    },
  },
  'kafka-down': {
    title: 'Kafka is unavailable', sub: 'redirects must not care', tone: 'fail',
    steps: [
      { t: 'The Kafka cluster becomes unreachable.', mark: { kafka: 'down' }, chip: { kafka: ['unreachable', 'fail'] } },
      { t: 'A redirect arrives and is served from the cache as usual.', go: [{ p: ['client', 'lb', 'app'], l: 'GET /4c92' }, { p: ['app', 'redis'], l: 'GET', k: 'cache', ret: 'HIT', rk: 'cache', delay: 1250 }] },
      { t: 'The `302` goes back immediately. The event cannot be delivered: the producer keeps it in a bounded buffer (`buffer.memory`) and **never blocks** the request (`max.block.ms` ≈ 0).', go: [{ p: ['app', 'lb', 'client'], l: '302', k: 'ok' }, { p: ['app', 'kafka'], l: 'ClickEvent', k: 'async', fail: true }], mark: { client: 'ok' }, chip: { app: ['buffered 48k events', 'warn'] } },
      { t: 'If the outage outlasts the buffer, further events are **dropped and counted** in a metric. We trade a few lost clicks for redirects that never fail: the right trade for analytics.', chip: { app: ['dropped 1,204 (alerted)', 'fail'] } },
      { t: 'Kafka recovers; the buffered events are flushed and the consumer catches up.', mark: { kafka: 'ok' }, go: [{ p: ['app', 'kafka'], l: 'flush buffer', k: 'async' }], chip: { kafka: ['recovered', 'ok'], app: null } },
    ],
  },
  'duplicate-event': {
    title: 'Duplicate delivery', sub: 'idempotent analytics', tone: 'async',
    steps: [
      { t: 'The consumer polls a batch: partition 3, offsets 9,000–9,499.', go: [{ p: ['kafka', 'analytics'], l: 'p3 · 9000–9499', k: 'async' }] },
      { t: 'In **one transaction** it applies the counts and records "p3 applied up to 9,499".', go: [{ p: ['analytics', 'mongo'], l: '$inc + offset 9499', ret: 'committed' }], chip: { mongo: ['p3 applied ≤ 9,499', 'ok'] } },
      { t: 'It crashes **before committing the offset to Kafka**.', mark: { analytics: 'down' }, chip: { analytics: ['crashed', 'fail'] } },
      { t: 'After restart Kafka redelivers the same batch (at-least-once).', mark: { analytics: null }, go: [{ p: ['kafka', 'analytics'], l: 'p3 · 9000–9499 again', k: 'async' }], chip: { analytics: ['duplicate batch', 'warn'] } },
      { t: 'The consumer sees that offsets ≤ 9,499 are already applied and **skips** the batch. Counts stay correct.', go: [{ p: ['analytics', 'mongo'], l: 'applied ≤ 9499?', ret: 'yes → skip', rk: 'ok' }], chip: { analytics: ['skipped · no double count', 'ok'] } },
    ],
  },
  'mongo-failover': {
    title: 'MongoDB primary fails', sub: 'election, retries, cache keeps serving', tone: 'fail',
    steps: [
      { t: 'The MongoDB primary dies. The replica set needs about **10 s** to elect a new one.', mark: { mongo: 'down' }, chip: { mongo: ['electing new primary', 'fail'] } },
      { t: 'Redirects for cached links keep working: they never touch MongoDB.', go: [{ p: ['client', 'lb', 'app'], l: 'GET /4c92' }, { p: ['app', 'redis'], l: 'GET', k: 'cache', ret: 'HIT', rk: 'cache', delay: 1250 }], chip: { redis: ['HIT', 'ok'] } },
      { t: 'Creates need a write and fail during the election. The driver **retries** writes once (`retryWrites`), and the API answers `503 Retry-After` rather than hanging.', go: [{ p: ['app2', 'mongo'], l: 'insert', fail: true }, { p: ['app', 'lb', 'client'], l: '302', k: 'ok' }], chip: { app2: ['503 · retry in 2 s', 'warn'] } },
      { t: 'A secondary becomes primary; writes succeed again. Because inserts used `w: "majority"`, nothing acknowledged before the failure was lost.', mark: { mongo: 'ok' }, go: [{ p: ['app2', 'mongo'], l: 'insert (retry)', ret: 'ack' }], chip: { mongo: ['new primary', 'ok'], app2: null } },
    ],
  },
});
