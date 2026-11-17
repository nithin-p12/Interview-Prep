QB.cat({id:'sd',name:'Design, Redis & Cloud',short:'Design & Cloud',icon:'🏗',col:'purple'},[
{q:'Do you know AWS? Which services have you used?',a:[
 `Yes, at a practical level for deploying and running backend services. **EC2** for virtual machines, **EKS** or **ECS** to run our containerised Spring Boot services, **S3** for file and report storage, and **RDS** for managed relational databases.`,
 `For messaging I know **SQS** (queues) and **SNS** (pub/sub notifications), though for event streaming we used Kafka (MSK is AWS's managed Kafka). **CloudWatch** for logs, metrics and alarms, and **IAM** for roles and permissions — services get access through IAM roles, never hard-coded keys.`,
 `[Personalise: say honestly which ones you've configured yourself and which you've only consumed — interviewers respect that more than a long list.]`]},
{q:'EC2 needs secure access to S3 — how do you do it without storing credentials?',a:[
 `Use an **IAM role** attached to the EC2 instance through an **instance profile**. The role has a policy that allows only what's needed — for example \`s3:GetObject\` and \`s3:PutObject\` on one bucket.`,
 `The AWS SDK's default credential chain automatically picks up **temporary credentials** from the instance metadata service and rotates them, so there are no access keys in code, config or environment variables. On EKS the equivalent is **IRSA** — an IAM role mapped to the pod's service account.`]},
{q:'Explain Redis caching and how you use it',c:['KPMG'],a:[
 `Redis is an in-memory key-value store, so reads take well under a millisecond. I use it mostly as a cache in front of the database with the **cache-aside** pattern: check Redis first — on a **cache hit** return it, on a **cache miss** load from the DB, put it in Redis with a TTL, and return.`,
 `In Spring Boot that's just \`@Cacheable("products")\` on a service method, \`@CacheEvict\` when the data is updated, and Redis configured as the cache manager. Every entry gets a **TTL** so stale data expires, and Redis evicts with policies like \`allkeys-lru\` when memory is full.`,
 `The hard part is **invalidation** — I evict on write and keep TTLs short for data that changes often. Besides caching, I've used Redis for sessions, rate limiting counters and distributed locks.`]},
{q:'Someone runs KEYS * on production Redis and every request freezes. Why?',a:[
 `Redis executes commands on a **single thread**. \`KEYS *\` scans every key in one go — with millions of keys that takes seconds, and during that time every other command from every client waits.`,
 `Use \`SCAN\` instead, which iterates in small batches with a cursor and lets other commands run in between. In production I'd also disable or rename \`KEYS\` and \`FLUSHALL\` with \`rename-command\` or ACLs.`]},
{q:'Redis crashes unexpectedly — how should your application behave?',a:[
 `If Redis is only a cache, the app should **degrade, not fail** — treat a Redis error as a cache miss and read from the database. In Spring I add a \`CacheErrorHandler\` that logs and swallows cache errors, plus short connection and command timeouts so requests don't hang.`,
 `The risk is the DB suddenly taking all the traffic, so I'd protect it with a circuit breaker around Redis, rate limiting, and request coalescing for hot keys. For availability, run Redis with replication and **Sentinel** or **Redis Cluster** so a replica takes over automatically; if Redis holds sessions or locks, enable persistence (AOF) too.`]},
{q:'How would you implement a payment gateway integration?',a:[
 `I'd put it behind a \`PaymentGateway\` interface in its own payment service, with one implementation per provider like Razorpay or Stripe. The flow is: create an order on our side with status \`PENDING\`, call the provider to create a payment, redirect the user or return the payment token, then confirm.`,
 `The important parts are reliability. Every request carries an **idempotency key** so retries don't double-charge. The final status comes from the provider's **webhook**, which I verify with its signature, and a reconciliation job checks pending payments against the provider in case a webhook is missed.`,
 `I'd also never store raw card data — the provider tokenises it, which keeps us out of most PCI scope — and publish a \`PaymentCompleted\` event to Kafka so order and notification services react asynchronously.`]},
{q:'Redesign a payment system to support multiple payment methods using design patterns and SOLID — and keep it maintainable as methods grow',c:['Persistent'],a:[
 `I'd use the **Strategy** pattern: a \`PaymentProcessor\` interface with \`supports(method)\` and \`pay(request)\`, and one class per method — Card, UPI, Wallet, NetBanking. A **factory** or registry picks the right processor at runtime.`,
 `With Spring the factory is almost free — inject \`List<PaymentProcessor>\` and build a map by method. Adding a new method like BNPL means **adding one new class**; nothing existing changes. That's **Open/Closed**, each class has a **single responsibility**, and the service depends on the interface — **Dependency Inversion**.`,
 `As methods grow, shared steps like validation, logging and retries go into a **Template Method** base class or decorators, and per-method config lives in properties, so the core stays small.`],
 code:`public interface PaymentProcessor {
  PaymentMethod method();
  PaymentResult pay(PaymentRequest req);
}

@Service
public class PaymentService {
  private final Map<PaymentMethod, PaymentProcessor> processors;
  public PaymentService(List<PaymentProcessor> list) {
    processors = list.stream().collect(Collectors.toMap(PaymentProcessor::method, p -> p));
  }
  public PaymentResult pay(PaymentRequest req) {
    return processors.get(req.method()).pay(req);
  }
}`},
{q:'Refactor a tightly coupled inventory management module using SOLID',c:['Persistent'],a:[
 `First I'd find the reasons it changes and **split responsibilities**: a stock service for reservations and updates, a pricing component, a notification sender for low-stock alerts, and a repository for persistence — instead of one class doing everything.`,
 `Then I'd **introduce interfaces** at the boundaries — \`InventoryRepository\`, \`StockAlertNotifier\` — and inject them through the constructor, so the business logic doesn't know about MySQL or email. Replace direct calls to other modules with **events** like \`StockLow\` on Kafka where they don't need to be synchronous.`,
 `I'd do it safely: write characterisation tests around the current behaviour first, then refactor in small steps, so each step can be verified and shipped.`]},
{q:'Plugin architecture for a reporting tool — add new report formats without modifying existing code',c:['Persistent'],a:[
 `Define a \`ReportExporter\` interface with \`format()\` and \`export(ReportData)\`. Each format — PDF, Excel, CSV — is its own implementation. The report engine only knows the interface and looks up the exporter by format from a registry.`,
 `Discovery is the plugin part: in Spring, any new \`@Component\` implementing the interface is picked up automatically via \`List<ReportExporter>\`; outside Spring, Java's \`ServiceLoader\` finds implementations from JARs on the classpath. So a new format like JSON is a new class or JAR — the core code is never touched. That's Open/Closed plus Strategy.`]},
]);
