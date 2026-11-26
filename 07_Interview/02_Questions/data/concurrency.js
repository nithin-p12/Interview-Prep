QB.cat({id:'concurrency',name:'Concurrency & Multithreading',short:'Concurrency',icon:'🧵',col:'red'},[
{q:'How do you handle multithreading in your projects?',c:['KPMG'],a:[
 `I almost never create raw threads. I use a configured \`ExecutorService\` or Spring's \`ThreadPoolTaskExecutor\` with a bounded queue, and \`@Async\` or \`CompletableFuture\` for parallel work — for example calling the pricing, inventory and user services in parallel and combining the results.`,
 `For shared state I prefer **avoiding it**: stateless Spring beans, immutable DTOs. When I do need it, I use \`ConcurrentHashMap\`, \`AtomicLong\`, or a lock. Across multiple instances, in-JVM locks don't help, so I rely on DB optimistic locking, unique constraints or a Redis lock. And Kafka consumers scale by partitions, with \`concurrency\` on the listener container.`]},
{q:'synchronized, locking, wait(), notify() and notifyAll()',c:['Deloitte'],a:[
 `\`synchronized\` acquires an object's **monitor lock** — only one thread runs that block at a time for the same object — and it also guarantees **visibility**: changes made inside are seen by the next thread that takes the lock.`,
 `\`wait()\`, \`notify()\` and \`notifyAll()\` are for coordination and must be called while holding that lock. \`wait()\` **releases** the lock and sleeps until notified; \`notify()\` wakes one waiting thread, \`notifyAll()\` wakes all. Always call \`wait()\` inside a \`while\` loop re-checking the condition, because of spurious wakeups.`,
 `In real code I'd rather use higher-level tools — \`BlockingQueue\`, \`CountDownLatch\`, \`ReentrantLock\` with \`Condition\`.`]},
{q:'wait() vs sleep() vs join()',a:[
 `\`wait()\` is on \`Object\`, must be inside \`synchronized\`, **releases the lock** and waits for a \`notify\`. \`sleep()\` is on \`Thread\`, just pauses for a time and **keeps any lock** it holds. \`join()\` makes the current thread **wait until another thread finishes** — e.g. main waits for worker threads.`]},
{q:'ReentrantLock vs ReentrantReadWriteLock',c:['Deloitte'],a:[
 `\`ReentrantLock\` is an explicit lock like \`synchronized\` but with more features: \`tryLock\` with a timeout, interruptible locking, a fairness option and multiple \`Condition\`s. You must \`unlock()\` in a \`finally\` block.`,
 `\`ReentrantReadWriteLock\` has two locks: **many readers can hold the read lock together**, but a writer gets exclusive access. It suits **read-heavy** data, like an in-memory config or reference-data cache that's refreshed occasionally. If writes are frequent, it adds overhead without benefit.`]},
{q:"Why doesn't volatile make i++ thread-safe?",a:[
 `\`volatile\` guarantees **visibility** — every read sees the latest write — but not **atomicity**. \`i++\` is actually three steps: read, add one, write. Two threads can both read 5 and both write 6, so one increment is lost.`,
 `\`volatile\` is right for a simple flag like \`running = false\` that one thread writes and others read. For counters use \`AtomicInteger\` / \`LongAdder\` or a lock.`]},
{q:'When would you choose AtomicInteger over synchronized?',a:[
 `When the shared state is a **single variable** — a counter, a sequence, a flag. \`AtomicInteger\` uses lock-free **CAS** (compare-and-swap), so threads never block and it's faster under typical contention. For very hot counters, like request metrics, \`LongAdder\` is even better.`,
 `I use \`synchronized\` or a lock when **several variables must change together** — like debiting one balance and crediting another — because atomics can't make multiple updates atomic as a group.`],
 code:`class RequestCounter {
  private final AtomicInteger count = new AtomicInteger();
  int increment() { return count.incrementAndGet(); }   // thread-safe, no lock
}`},
{q:'Future vs CompletableFuture',c:['Deloitte'],a:[
 `\`Future\` only lets you **block** with \`get()\` or poll with \`isDone()\` — no chaining, no callbacks, no combining, no clean error handling.`,
 `\`CompletableFuture\` is non-blocking and composable: \`thenApply\` to transform, \`thenCompose\` to chain another async call, \`thenCombine\` or \`allOf\` to merge parallel calls, \`exceptionally\`/\`handle\` for errors, and \`orTimeout\` for timeouts. I use it to fan out to several services and join the results.`]},
{q:'How does CompletableFuture run async tasks? Your supplyAsync calls block on HTTP and the whole app slows under load — which pool are they on?',c:['Accenture'],a:[
 `\`supplyAsync(task)\` without an executor runs on the **ForkJoinPool.commonPool()**, which has only **CPU cores − 1** threads and is shared by the whole JVM, including parallel streams. When those few threads block on slow HTTP calls, every other async task in the app queues behind them.`,
 `Fix: always pass a **dedicated, bounded executor** for blocking I/O — \`supplyAsync(() -> client.call(), ioExecutor)\` — sized for the downstream, with timeouts on the HTTP client and \`orTimeout\` on the future. On Java 21, a virtual-thread executor is a great fit for this.`],
 code:`ExecutorService io = Executors.newFixedThreadPool(50);
CompletableFuture<Price> p = CompletableFuture.supplyAsync(() -> pricing.get(id), io);
CompletableFuture<Stock> s = CompletableFuture.supplyAsync(() -> stock.get(id), io);
Product result = p.thenCombine(s, Product::new).orTimeout(2, TimeUnit.SECONDS).join();`},
{q:'How does ExecutorService help manage threads efficiently?',a:[
 `Creating a thread per task is expensive and unbounded. An \`ExecutorService\` keeps a **pool of reusable threads** and a **work queue**: you submit tasks, idle threads pick them up, and you get back a \`Future\`.`,
 `It also gives control: you limit concurrency, choose a bounded queue and a **rejection policy** for overload, name threads for easier dumps, and shut down gracefully with \`shutdown()\` and \`awaitTermination\`. In production I create a \`ThreadPoolExecutor\` explicitly rather than \`newCachedThreadPool\` (unbounded threads) or \`newFixedThreadPool\` (unbounded queue).`]},
{q:'Producer-consumer — how would you implement it?',a:[
 `The cleanest way is a \`BlockingQueue\`: the producer calls \`put()\`, which blocks when the queue is full, and the consumer calls \`take()\`, which blocks when it's empty. The queue handles all the locking and signalling, and its bound gives natural **back-pressure**.`,
 `At system scale, Kafka is the same pattern across services — producers write to a topic and a consumer group drains it.`],
 code:`BlockingQueue<Order> queue = new ArrayBlockingQueue<>(100);
// producer
executor.submit(() -> { while (true) queue.put(nextOrder()); });
// consumer
executor.submit(() -> { while (true) process(queue.take()); });`},
{q:'Deadlock vs starvation — and how do you detect a deadlock in production?',a:[
 `A **deadlock** is threads waiting on each other forever — thread A holds lock 1 and wants lock 2, B holds 2 and wants 1. Nobody progresses. **Starvation** is a thread that *could* run but never gets its turn, because others keep taking the lock or CPU — e.g. an unfair lock or low priority.`,
 `To detect it: take a **thread dump** with \`jstack <pid>\` or \`jcmd <pid> Thread.print\` — the JVM prints "Found one Java-level deadlock" with the threads and locks involved. Symptoms are requests hanging while CPU stays low. Prevention: acquire locks in a **consistent order**, use \`tryLock\` with a timeout, and keep locked sections small.`]},
{q:'How can ThreadLocal create a memory leak?',a:[
 `A ThreadLocal value lives in a map inside the **thread** itself. In a thread pool — like Tomcat's request threads — threads never die, so if you set a value and never call \`remove()\`, it stays there forever, and the next request on that thread may even **see the previous user's data**.`,
 `In app servers it can also pin a whole classloader across redeploys. The fix is simple: always \`remove()\` in a \`finally\` block, or in a filter/interceptor's after-completion — the same pattern Spring uses for security context and MDC logging.`]},
{q:'Java Memory Model — happens-before and visibility',a:[
 `Each thread can cache values in CPU registers or caches, and the compiler can reorder instructions, so without rules one thread may never see another's write. The JMM defines **happens-before** relationships that guarantee visibility and ordering.`,
 `The main ones: unlocking a monitor happens-before the next lock of it; a write to a \`volatile\` field happens-before later reads of it; \`Thread.start()\` happens-before anything in the started thread; and everything in a thread happens-before another thread's successful \`join()\` on it. Also, \`final\` fields are safely visible once the constructor finishes. If no happens-before exists between a write and a read, you have a data race.`]},
{q:'What happens when two threads access shared data, and how do you troubleshoot thread-safety issues?',a:[
 `If both only read, nothing. If at least one writes without synchronization, you get **race conditions** (lost updates, check-then-act bugs), **visibility** problems (stale values) and corrupted structures — like a HashMap losing entries.`,
 `These bugs are intermittent and load-dependent, so I look for **mutable shared state**: fields in singleton Spring beans, static collections, non-thread-safe classes like \`SimpleDateFormat\` used as fields. I reproduce with load tests (JMeter) or concurrent unit tests with a \`CountDownLatch\`, take thread dumps for hangs, and fix by making beans stateless, using immutable objects, concurrent collections or atomics.`]},
]);
