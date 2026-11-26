QB.cat({id:'hr',name:'Project, Leadership & HR',short:'Project & HR',icon:'🙋',col:'amber'},[
{q:'Introduce yourself',c:['Persistent'],a:[
 `I'm [name], a Java backend developer with [N] years of experience, currently at [company]. I mainly work with **Spring Boot microservices**, **Kafka** for event-driven communication and **MongoDB**, deployed on [Kubernetes / AWS].`,
 `In my current project, [one line on the product — e.g. a test automation platform], I own [services / modules], and I've worked on things like [designing a Kafka-based execution pipeline, improving API latency, building a role-based access layer with Keycloak].`,
 `I enjoy solving production problems and making systems reliable, and I'm looking for a role where I can take more ownership of design decisions — which is why this position interests me.`]},
{q:'Explain the architecture of your project and your responsibilities',c:['ITC Infotech','KPMG'],a:[
 `Start from the outside in: "Users hit an **API Gateway**, which handles authentication with Keycloak/JWT and routes to around [N] Spring Boot microservices — [user, project, execution, reporting, notification]. Services talk synchronously over REST with Feign for queries, and asynchronously through **Kafka** for events like [execution started / completed]."`,
 `Then data and infra: "Each service owns its data — mostly **MongoDB**, with [Redis] for caching. Everything runs in Docker on [Kubernetes], with centralised logging and tracing for observability."`,
 `Then your part, specifically: "I own the [execution service]. I designed [the event flow], built [these APIs], and handled [a performance or reliability improvement] — for example, [reduced response time from X to Y by …]." Keep it to two minutes and be ready to draw it.`]},
{q:'Describe a challenging production bug you solved',c:['KPMG'],a:[
 `Use **situation → impact → investigation → fix → prevention**. Example: "After a release, some users saw executions stuck in RUNNING status. It affected around [5%] of runs, so customers couldn't see results."`,
 `"Logs showed the completion event was sent, but traces showed the consumer processing it twice in some cases and failing on the second attempt — it was a **consumer rebalance**: processing took longer than \`max.poll.interval.ms\`, so the partition moved to another consumer before the offset was committed."`,
 `"I fixed it by making the consumer **idempotent** — checking the event ID before updating — and reducing \`max.poll.records\`. Then I added an alert on consumer lag and a small job to repair stuck records. We had no repeat after that." [Swap in your own real bug — interviewers will dig into details.]`]},
{q:'Describe a technical decision you made and its trade-offs',c:['KPMG'],a:[
 `Pick one real decision and show you weighed options. Example: "We needed to notify several services when an execution finished. I chose **Kafka events** over direct REST calls."`,
 `"The benefit was loose coupling — the producer doesn't wait for or even know the consumers — plus replay and better resilience when a consumer is down. The trade-offs were **eventual consistency**, more operational complexity, and harder debugging, so we added trace IDs in headers, a DLQ for failed messages, and idempotent consumers."`,
 `"For reads where the user needs an immediate answer, we kept REST." Ending with where you did **not** use your choice shows judgement.`]},
{q:'Two critical production issues occur at the same time — how do you handle them, and what decides priority?',c:['ITC Infotech'],a:[
 `I'd prioritise by **business impact**: how many users are affected, is money or data at risk, is there a security issue, is there an SLA or a key customer involved, and is it getting worse. A data-corruption or payment issue beats a broken report page even if both are "P1".`,
 `Then I don't handle them alone — I communicate immediately to my lead and stakeholders, split the team so each issue has an owner, and for the lower one look for a quick mitigation like a rollback, feature flag or workaround, so both are contained fast.`,
 `I'd keep regular status updates going, and after both are fixed, do an RCA for each.`]},
{q:'How do you manage releases?',c:['Tech Lead'],a:[
 `We follow a **CI/CD pipeline**: every merge to main runs unit and integration tests, code quality checks and builds a versioned Docker image. The same image is promoted through dev, QA and staging to production — we never rebuild per environment.`,
 `For production I prefer small, frequent releases with **feature flags** for incomplete features, backward-compatible DB migrations, and **canary or blue-green** deployment so rollback is one step. Each release has release notes, a checklist, and someone watching dashboards for the first hour.`]},
{q:'Business wants a new requirement delivered without reducing current scope — how do you handle it?',c:['Tech Lead'],a:[
 `I don't say no, and I don't silently say yes. First I understand **why** it's urgent and estimate it with the team. Then I make the trade-off visible: with fixed capacity, adding scope means either the date moves, something else moves, or we take on risk like less testing.`,
 `I'd offer options — deliver a smaller **MVP version** of the new requirement now and the rest next sprint, reprioritise lower-value items with the product owner, or add people if it's realistic. The business picks with the trade-offs in front of them, and I document the decision.`]},
{q:'Why do you want to join this company? (e.g. Why KPMG?)',c:['KPMG'],a:[
 `Connect three things: **the company**, **the role**, and **you**. "KPMG works with large enterprise clients across [banking, healthcare…], so I'd see a wider variety of systems and problems than in a single product."`,
 `"The role is focused on [Java microservices / cloud], which matches what I've been doing, and I'd like to grow into designing solutions for clients, not just building features." [Research one specific thing — a practice, a project, a value — and mention it.]`]},
{q:'Why should we hire you?',c:['KPMG'],a:[
 `Match your strengths to their job description with proof. "You need someone strong in Spring Boot microservices and Kafka — that's what I've done for [N] years in production, including [one concrete achievement with a number]."`,
 `"Beyond coding, I take ownership — I've handled production issues end to end and improved [reliability / performance]. And I learn quickly, so I can be productive on your stack soon." Keep it confident and short, under a minute.`]},
]);
