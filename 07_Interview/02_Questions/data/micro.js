QB.cat({id:'micro',name:'Microservices & Resilience',short:'Microservices',icon:'🧩',col:'blue'},[
{q:'How do microservices communicate — sync vs async, and when do you use each? REST vs Kafka vs gRPC?',c:['ITC Infotech','KPMG'],a:[
 `There are two styles. **Synchronous** — the caller waits for the answer, usually REST over HTTP with Feign or WebClient. I use it when I need the result right now, like checking stock before confirming an order or fetching a user profile.`,
 `**Asynchronous** — the caller publishes an event and moves on, usually through Kafka. I use it when other services just need to *react*: order placed → payment, inventory and notification services each consume \`OrderCreated\`. It decouples services, absorbs traffic spikes, and if a consumer is down it catches up later.`,
 `Between the three: **REST** for public and simple request/response APIs, **gRPC** for high-volume internal calls where low latency and a strict Protobuf contract matter, and **Kafka** for events, streaming and fan-out. A typical system mixes them — REST at the edge, Kafka between domains.`]},
{q:'Feign Client vs WebClient vs RestTemplate — which do you prefer and why?',a:[
 `**RestTemplate** is the old blocking client — it works, but it's in maintenance mode. **WebClient** is the non-blocking, reactive client from WebFlux; it's great for many parallel calls or streaming, but it pulls in the reactive style. **Feign** (OpenFeign) is declarative — you write an interface with \`@FeignClient\` and annotations, and Spring generates the HTTP code, with easy integration for load balancing, retries and Resilience4j.`,
 `In a normal Spring MVC microservice I prefer **Feign** for service-to-service calls because it's clean and readable, and **WebClient** when I need to fan out several calls in parallel. For new code, Spring 6's \`RestClient\` is the modern replacement for RestTemplate.`],
 code:`@FeignClient(name = "inventory-service")
public interface InventoryClient {
  @GetMapping("/stock/{sku}")
  StockDto getStock(@PathVariable String sku);
}`},
{q:'What is an API Gateway and why use it? API Gateway vs Load Balancer — where do you use each?',c:['ITC Infotech','Tech Lead'],a:[
 `An API Gateway is the **single entry point** for all clients. Instead of the mobile app knowing twenty service URLs, it calls the gateway, which **routes** \`/orders/**\` to the order service, and handles the cross-cutting stuff in one place — **JWT validation, rate limiting, CORS, logging, request tracing**, sometimes response aggregation. In Spring we use Spring Cloud Gateway; on AWS, API Gateway.`,
 `A Load Balancer works at a lower level — it just **spreads traffic across instances of the same service** for availability, using health checks. It doesn't know about users or business routes.`,
 `So they're used together: an AWS ALB in front of the gateway instances, the gateway routing by path, and then client-side load balancing across the instances of each service.`]},
{q:'Service discovery — what is it and how does it work?',a:[
 `In microservices, instances come and go — autoscaling, restarts, new IPs — so you can't hardcode addresses. Service discovery is a **registry** where each instance registers itself on startup and sends heartbeats, and callers look up a service by **name** instead of IP.`,
 `With Spring Cloud it's Eureka: the order service calls \`http://inventory-service/...\`, the load balancer asks Eureka for healthy instances and picks one. On Kubernetes you usually don't need Eureka at all — a K8s **Service** gives a stable DNS name and kube-proxy balances across pods.`]},
{q:'Circuit Breaker pattern — and how would you implement it for a getBalance API and a transaction API?',c:['Capgemini','KPMG','Tech Lead'],a:[
 `A circuit breaker stops you from hammering a service that is already failing. It's **CLOSED** normally; when the failure or slow-call rate crosses a threshold — say 50% of the last 20 calls — it goes **OPEN** and fails fast for a while without calling the service. After a wait it goes **HALF-OPEN**, lets a few trial calls through, and closes again if they succeed.`,
 `With Resilience4j I'd put \`@CircuitBreaker(name="core-banking", fallbackMethod=...)\` on the client methods and tune thresholds in \`application.yml\`.`,
 `The two APIs need **different fallbacks**. For **getBalance** — a read — the fallback can return the last cached balance with a "may be outdated" flag. For a **transaction** — a write — I must never fake success: the fallback returns a clear "service unavailable, try again" or accepts the request as **PENDING** in a queue, and the transaction call must be **idempotent** with an idempotency key so a later retry can't debit twice. I'd also give them separate breaker instances so a problem in one doesn't block the other.`],
 code:`@CircuitBreaker(name = "balance", fallbackMethod = "cachedBalance")
public Balance getBalance(String acc) { return coreBankingClient.balance(acc); }

Balance cachedBalance(String acc, Throwable t) {
  return balanceCache.get(acc).markStale();
}`},
{q:'Circuit Breaker vs Retry vs Bulkhead',c:['Deloitte'],a:[
 `They solve different failures and are usually combined. **Retry** handles **short, temporary** glitches — a network blip — by trying again a few times with backoff.`,
 `**Circuit Breaker** handles a **dependency that is really down** — after enough failures it stops calling it and fails fast, so threads aren't wasted waiting.`,
 `**Bulkhead** **isolates resources** — like watertight compartments in a ship. You give each downstream its own limited thread pool or concurrent-call limit, so a slow payment service can use at most 20 threads and can't starve the threads serving product search.`,
 `In Resilience4j the order is Retry wrapping CircuitBreaker wrapping Bulkhead, plus a TimeLimiter so no call waits forever.`]},
{q:'How do you design retry logic for a failing downstream call — exponential backoff and jitter',c:['Deloitte','Persistent'],a:[
 `First, only retry what's **retryable**: timeouts, connection errors, 503, 429 — never a 400 validation error. And only retry operations that are **idempotent**, or send an idempotency key, otherwise a retry can create a duplicate payment.`,
 `**Exponential backoff** means waiting longer each time — 200 ms, 400 ms, 800 ms — so the struggling service gets breathing room. **Jitter** adds randomness to that wait, because if a thousand clients all retry at exactly 400 ms you create a new spike — the "thundering herd".`,
 `Keep attempts small — 3 is typical — put a circuit breaker around it so retries stop when the service is clearly down, and log every final failure. In Resilience4j that's \`maxAttempts\`, \`enableExponentialBackoff\` and \`randomizedWaitFactor\`.`]},
{q:'Service A → B → C and C is down or slow. How do you prevent a cascading failure?',c:['KPMG'],a:[
 `The danger is that B's threads all block waiting on C, then A's threads block waiting on B, and the whole chain goes down. So the first defence is **timeouts** everywhere — a call to C should give up in, say, 2 seconds, not 30.`,
 `Then a **circuit breaker** in B for C so it fails fast once C is clearly down, a **bulkhead** so calls to C can only use a limited pool, and a **fallback** — cached data, a default, or a partial response.`,
 `Longer term, ask whether the call needs to be synchronous at all. If B only *notifies* C, make it a Kafka event — then C being down just means lag, not errors. And watch it all with Actuator and the breaker metrics in Grafana.`]},
{q:'Saga pattern — orchestration vs choreography; how do you choose? (order → payment → inventory)',c:['Deloitte','ITC Infotech'],a:[
 `A saga handles a business transaction that spans several services, each with its own database, without a distributed lock. It's a sequence of **local transactions**, and if a later step fails, earlier steps are undone with **compensating actions** — refund the payment, release the stock.`,
 `In **choreography** there's no central coordinator: the order service publishes \`OrderCreated\`, payment listens and publishes \`PaymentDone\`, inventory listens and publishes \`StockReserved\` or \`StockFailed\`, and payment reacts to a failure with a refund. It's loosely coupled and simple for 2–3 steps, but the flow is hidden across services and hard to trace.`,
 `In **orchestration** an orchestrator — say an \`OrderSaga\` service — tells each service what to do and keeps the saga state: "charge payment", then "reserve stock", and on failure "refund". The flow is in one place, easy to monitor and change.`,
 `My rule: choreography for short, stable flows; orchestration once there are many steps, branches, or the business wants to see where each order is stuck.`]},
{q:'Banking: how do you keep debit and credit consistent across microservices without distributed transactions?',c:['Persistent'],a:[
 `I'd avoid 2PC and use a **saga** with a durable record of the transfer. The transfer service creates a \`Transfer\` row in state **INITIATED**, then the account service **debits** the source in its own local transaction and emits \`Debited\`. The credit side consumes it, **credits** the target, and emits \`Credited\`, and the transfer moves to **COMPLETED**.`,
 `If the credit fails — account closed, for example — a **compensating credit back** to the source account runs, and the transfer ends as **REVERSED**. Money is never lost; at worst it's temporarily in a pending state.`,
 `Three things make it safe: the **outbox pattern** so the DB change and the event can't diverge, **idempotent consumers** keyed by transfer id so a redelivered event doesn't credit twice, and a **ledger** with append-only entries plus a reconciliation job that flags anything stuck.`]},
{q:'You save an order and publish an event. The commit succeeds and the publish fails. Now what?',a:[
 `This is the **dual-write problem** — a DB and Kafka can't share one transaction, so one can succeed while the other fails, and downstream never hears about the order.`,
 `The fix is the **Transactional Outbox**. In the same DB transaction that saves the order, I insert the event into an \`outbox\` table. Either both are saved or neither is. A separate relay — a scheduled poller or Debezium reading the DB log (CDC) — then publishes outbox rows to Kafka and marks them sent.`,
 `If publishing fails, the relay simply retries later. That gives **at-least-once** delivery, so consumers must be idempotent.`]},
{q:'A downstream call succeeds 99.9% of the time. One user request calls it 50 times. How often does that request fail?',a:[
 `The request succeeds only if all 50 calls succeed: 0.999⁵⁰ ≈ 0.951. So about **4.9% of requests fail** — roughly 1 in 20, even though each call looks "three nines" reliable.`,
 `The lesson is that failures multiply with fan-out. Fixes: **batch** the 50 calls into one, cache results, run them with retries on the transient errors, or make the request tolerate a partial failure instead of failing completely.`]},
{q:'Your service depends on three external APIs and one is unavailable. How should your application behave?',a:[
 `It should **degrade gracefully**, not fail completely. First decide per dependency: is it **critical** or **optional**? If the recommendation API is down, the product page still loads without recommendations. If the payment API is down, checkout can't complete — but it can say so clearly or queue the order as pending.`,
 `Technically: timeouts on every call, a circuit breaker per API with a fallback (cached data, defaults, empty section), call them **in parallel** with \`CompletableFuture\` so one slow API doesn't add up, and return a response that marks what's missing. Plus alerting so we know the third party is down before users tell us.`]},
{q:'How do you trace a request across 15 microservices, or find which request caused an error in the logs?',a:[
 `You need a **correlation id** — a trace id — that's created at the gateway and passed in a header to every service, Kafka message and log line. In Spring Boot 3, **Micrometer Tracing** with OpenTelemetry does it automatically: it propagates the \`traceparent\` header and puts \`traceId\` and \`spanId\` into the logging **MDC**.`,
 `Then I make logs structured JSON with the traceId, ship them to ELK or Loki, and send spans to Zipkin, Jaeger or Tempo. Now from one error log I take the traceId and see the full request path — every service, every hop's latency, and exactly where it failed.`,
 `I also return the traceId in error responses, so when a user or tester reports a problem we can jump straight to it.`]},
{q:'How would you design an application that keeps working even if one instance crashes?',c:['ITC Infotech'],a:[
 `Make the service **stateless** and run **multiple instances** behind a load balancer — at least two or three, ideally spread across availability zones. Sessions go in Redis or a JWT, files in S3, nothing important in local memory.`,
 `The load balancer or Kubernetes uses **health checks** — Spring Boot Actuator liveness and readiness probes — to stop sending traffic to a dead instance and restart it. Clients use retries with timeouts so an in-flight request hitting the dead pod can go to another one.`,
 `The data layer needs the same thinking: a DB with replicas and automatic failover, Kafka with replication factor 3. And graceful shutdown so deployments themselves don't drop requests.`]},
{q:'How do you troubleshoot a failing Feign client?',a:[
 `First look at **what kind of failure** it is. Enable Feign logging with \`Logger.Level.FULL\` for that client to see the actual URL, headers and response. A **404 or wrong URL** usually means a bad path, a missing \`@PathVariable\` name, or the wrong service name in discovery. **401/403** means the JWT isn't being forwarded — add a \`RequestInterceptor\`.`,
 `**Timeouts or connection refused** point to the target being down, wrong port, or timeouts too low — check discovery/K8s service and the \`connectTimeout\` / \`readTimeout\` config. **Decode errors** mean the DTO doesn't match the JSON.`,
 `I'd also add a custom \`ErrorDecoder\` so downstream errors become meaningful exceptions, and check the trace in Zipkin to see if the request even reached the other service.`]},
{q:'Your API returns 500 errors only in production. How do you debug an issue that occurs only in prod?',a:[
 `Start from **evidence**, not guesses. Take the traceId from the failing request and find the **stack trace** in centralized logs. Then look at what's *different* about production: **configuration** (profiles, env vars, secrets, URLs), **data** (real data has nulls and edge cases test data doesn't), **scale and concurrency**, **network and permissions** (firewall, IAM, certificates), and **versions** (JDK, dependency, DB version).`,
 `Check dashboards for when it started — did it line up with a deploy, a config change, or a traffic spike? If it started with a deploy, roll back first and investigate after.`,
 `If logs aren't enough, I add targeted logging behind a feature flag, reproduce with a copy of the problem data in staging, and check Actuator \`/env\` and \`/health\`. Once fixed, I add a test for that case and improve the error handling so the next one is easier to find.`]},
]);
