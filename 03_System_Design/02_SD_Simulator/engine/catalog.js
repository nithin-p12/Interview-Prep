// The 12 designs, in study order. `file` = rebuilt page in this folder; otherwise the old all-in-one simulator
// (kept in _archive) is linked through `legacy`.
window.SD_CATALOG = [
  { n: 1, id: 'url', title: 'URL Shortener', icon: '🔗', desc: 'TinyURL / bit.ly: ID generation, Base62, caching, async analytics.', tags: ['Base62', 'Redis', 'Kafka'], file: '01_URL_Shortener.html' },
  { n: 2, id: 'rate', title: 'Rate Limiter', icon: '⏱', desc: 'Redis, atomicity, concurrency, distributed coordination.', tags: ['Redis Lua', 'Atomic', 'Gateway'] },
  { n: 3, id: 'ticket', title: 'Ticket Booking', icon: '🎟', desc: 'Locking, race conditions, transactions, payment.', tags: ['MongoDB CAS', 'Payments', 'Outbox'] },
  { n: 4, id: 'notify', title: 'Notification System', icon: '🔔', desc: 'Kafka, retries, DLQ, asynchronous processing.', tags: ['Kafka', 'DLQ', 'SES / FCM'] },
  { n: 5, id: 'shop', title: 'E-commerce Order System', icon: '🛒', desc: 'Saga, inventory, idempotency, distributed transactions.', tags: ['Saga', 'Outbox', 'Inventory'] },
  { n: 6, id: 'files', title: 'File Upload & Storage', icon: '📁', desc: 'S3, presigned URLs, multipart uploads, CDN.', tags: ['S3', 'Presigned', 'Events'] },
  { n: 7, id: 'chat', title: 'Chat System (WhatsApp)', icon: '💬', desc: 'WebSockets, message ordering, delivery guarantees.', tags: ['WebSocket', 'Redis', 'Sync'] },
  { n: 8, id: 'jobs', title: 'Distributed Job Scheduler', icon: '⏰', desc: 'Leader election, leases, retries, fault tolerance.', tags: ['Leases', 'Fencing', 'Retries'] },
  { n: 9, id: 'feed', title: 'News Feed (Instagram)', icon: '📰', desc: 'Fan-out, timelines, ranking, pagination.', tags: ['Fan-out', 'Redis ZSET', 'Cursor'] },
  { n: 10, id: 'search', title: 'Search System', icon: '🔍', desc: 'Elasticsearch, inverted indexes, indexing pipeline.', tags: ['Elasticsearch', 'CDC', 'Alias'] },
  { n: 11, id: 'video', title: 'Video Streaming (YouTube)', icon: '🎬', desc: 'CDN, transcoding, chunking, adaptive streaming.', tags: ['HLS', 'CDN', 'Transcode'] },
  { n: 12, id: 'cache', title: 'Distributed Cache', icon: '⚡', desc: 'Consistent hashing, eviction, replication, cache consistency.', tags: ['Hash ring', 'LRU', 'Versions'] },
];
window.SD_LEGACY = '_archive/03_System_Design/02_SD_Interview_Simulator_v1.html';
