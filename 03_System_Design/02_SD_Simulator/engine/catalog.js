// The 12 designs, in study order. `file` = rebuilt page in this folder; otherwise the old all-in-one simulator
// (kept in _archive) is linked through `legacy`.
// Building blocks (load balancer, cache, Kafka, S3, CDN …) are taught ONCE, in 00_Core_Components.html (watch first);
// design pages link to it instead of re-teaching them. `SD_CORE.components` lists what it covers today.
window.SD_CATALOG = [
  { n: 1, id: 'url', title: 'URL Shortener', icon: '🔗', desc: 'TinyURL / bit.ly: ID generation, Base62, caching, async analytics.', tags: ['Base62', 'Redis', 'Kafka'], file: '01_URL_Shortener.html' },
  { n: 2, id: 'rate', title: 'Rate Limiter', icon: '⏱', desc: 'Redis, atomicity, concurrency, distributed coordination.', tags: ['Redis Lua', 'Atomic', 'Gateway'], file: '02_Rate_Limiter.html' },
  { n: 3, id: 'ticket', title: 'Ticket Booking', icon: '🎟', desc: 'Locking, race conditions, transactions, payment.', tags: ['MongoDB CAS', 'Payments', 'Outbox'], file: '03_Ticket_Booking.html' },
  { n: 4, id: 'notify', title: 'Notification System', icon: '🔔', desc: 'Kafka, retries, DLQ, asynchronous processing.', tags: ['Kafka', 'DLQ', 'SES / FCM'], file: '04_Notification_System.html' },
  { n: 5, id: 'shop', title: 'E-commerce Order System', icon: '🛒', desc: 'Saga, inventory, idempotency, distributed transactions.', tags: ['Saga', 'Outbox', 'Inventory'], file: '05_Ecommerce_Order.html' },
  { n: 6, id: 'files', title: 'File Upload & Storage', icon: '📁', desc: 'S3, presigned URLs, multipart uploads, CDN.', tags: ['S3', 'Presigned', 'Events'], file: '06_File_Upload.html' },
  { n: 7, id: 'chat', title: 'Chat System (WhatsApp)', icon: '💬', desc: 'WebSockets, message ordering, delivery guarantees.', tags: ['WebSocket', 'Redis', 'Sync'], file: '07_Chat_System.html' },
  { n: 8, id: 'jobs', title: 'Distributed Job Scheduler', icon: '⏰', desc: 'Leader election, leases, retries, fault tolerance.', tags: ['Leases', 'Fencing', 'Retries'], file: '08_Job_Scheduler.html' },
  { n: 9, id: 'feed', title: 'News Feed (Instagram)', icon: '📰', desc: 'Fan-out, timelines, ranking, pagination.', tags: ['Fan-out', 'Redis ZSET', 'Cursor'], file: '09_News_Feed.html' },
  { n: 10, id: 'search', title: 'Search System', icon: '🔍', desc: 'Elasticsearch, inverted indexes, indexing pipeline.', tags: ['Elasticsearch', 'CDC', 'Alias'], file: '10_Search_System.html' },
  { n: 11, id: 'video', title: 'Video Streaming (YouTube)', icon: '🎬', desc: 'CDN, transcoding, chunking, adaptive streaming.', tags: ['HLS', 'CDN', 'Transcode'], file: '11_Video_Streaming.html' },
  { n: 12, id: 'cache', title: 'Distributed Cache', icon: '⚡', desc: 'Consistent hashing, eviction, replication, cache consistency.', tags: ['Hash ring', 'LRU', 'Versions'], file: '12_Distributed_Cache.html' },
  { n: 13, id: 'support', title: 'Customer Support Ticketing', icon: '🎫', desc: 'Zendesk-style helpdesk: ticket lifecycle, safe claims, SLA timers, live updates, multi-tenancy.', tags: ['State machine', 'Routing', 'SLA'], file: '13_Support_Ticketing.html' },
];
window.SD_CORE = { file: '00_Core_Components.html', title: 'Core Components', icon: '🧩',
  desc: 'What, why, without vs with, how it works, pros & cons, when to choose: one place for every building block.',
  components: ['⚖️ Load balancer', '⚡ Cache · Redis', '📨 Queue · Kafka', '🪣 Storage · S3', '🌍 CDN', '🗃️ DB scaling', '🚪 API gateway', '🧭 When to use what'], next: 'WebSockets → 7 Chat · Elasticsearch → 10 Search · consistent hashing → 12 Distributed Cache' };
window.SD_LEGACY = '_archive/03_System_Design/02_SD_Interview_Simulator_v1.html';
