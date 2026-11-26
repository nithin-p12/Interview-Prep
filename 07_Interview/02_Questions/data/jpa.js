QB.cat({id:'jpa',name:'Hibernate & JPA',short:'Hibernate/JPA',icon:'🗄',col:'teal'},[
{q:'What is the N+1 query problem and how do you resolve it?',c:['Deloitte','KPMG'],a:[
 `It's when you run **1 query** to load a list of parents and then **N extra queries**, one per parent, to load a lazy association. For example, loading 100 orders and then touching \`order.getItems()\` in a loop fires 101 queries. It's invisible in code and kills performance at scale.`,
 `Fixes: a **fetch join** — \`select o from Order o join fetch o.items\`; an \`@EntityGraph(attributePaths = "items")\` on the repository method; \`@BatchSize\` or \`default_batch_fetch_size\` so Hibernate loads children in batches with an IN query; or a **DTO projection** that fetches only the needed columns. To catch it I turn on SQL logging or Hibernate statistics in dev and watch the query count.`]},
{q:'Lazy vs eager loading — when to use each?',a:[
 `**Lazy** loads the association only when you first access it, via a proxy. **Eager** loads it immediately with the parent. JPA defaults are eager for \`@ManyToOne\` and \`@OneToOne\`, and lazy for collections.`,
 `My rule: make **everything lazy**, including \`@ManyToOne\`, and fetch what each use case needs explicitly with a fetch join or entity graph. Eager looks convenient but loads data you don't need everywhere and often causes N+1 problems of its own.`]},
{q:'API works locally but fails in production with LazyInitializationException',a:[
 `The code touches a lazy association **after the Hibernate session is closed** — typically in the controller or during JSON serialization. Locally it often "works" because \`spring.jpa.open-in-view\` is on by default, keeping the session open for the whole request; in production that's often turned off, or the access happens in an async thread.`,
 `Fix: load what you need **inside** the \`@Transactional\` service method with a fetch join or \`@EntityGraph\`, and map to a DTO before returning. Don't "fix" it with eager fetching or by enabling open-in-view everywhere.`]},
{q:'First-level vs second-level cache in Hibernate',c:['Deloitte'],a:[
 `The **first-level cache** is the persistence context — per session or transaction, always on. If I load the same entity twice in one transaction, the second time comes from memory, not the DB.`,
 `The **second-level cache** is shared across sessions, at the \`SessionFactory\` level, and is opt-in. I enable it with a provider like Ehcache or Redis, mark entities with \`@Cacheable\` and a concurrency strategy like \`READ_WRITE\`. It suits **read-mostly reference data** like countries, product categories or config. For frequently updated data it brings stale reads and invalidation pain — across multiple instances you need a distributed cache.`]},
{q:'What is dirty checking in Hibernate?',a:[
 `When an entity is **managed**, Hibernate keeps a snapshot of its original state. At flush or commit it compares the current fields with the snapshot, and for anything changed it generates the UPDATE automatically — so inside a \`@Transactional\` method I just call \`order.setStatus(SHIPPED)\` and never call \`save()\`.`,
 `The catch: it costs memory and CPU for large result sets, so for read-only queries I use \`@Transactional(readOnly = true)\`, which skips dirty checking.`]},
{q:'JpaRepository vs CrudRepository vs PagingAndSortingRepository',a:[
 `They're a hierarchy. \`CrudRepository\` gives basic CRUD — \`save\`, \`findById\`, \`findAll\`, \`delete\`. \`PagingAndSortingRepository\` adds \`findAll(Pageable)\` and \`findAll(Sort)\`. \`JpaRepository\` adds JPA-specific extras — \`flush\`, \`saveAndFlush\`, batch deletes, and returns \`List\` instead of \`Iterable\`.`,
 `In a JPA project I just extend \`JpaRepository\`, since it includes everything. For MongoDB the equivalent is \`MongoRepository\`.`]},
{q:'You return a JPA entity straight from a controller and get infinite recursion. Why?',a:[
 `Because of a **bidirectional relationship** — \`Order\` has a list of \`OrderItem\`, and each \`OrderItem\` points back to its \`Order\`. Jackson serializes order → items → order → items… forever, until a StackOverflowError. It can also trigger lazy loading or LazyInitializationException along the way.`,
 `Quick fixes are \`@JsonManagedReference\` / \`@JsonBackReference\` or \`@JsonIgnore\` on the back side. The proper fix is to **never expose entities** — map them to response DTOs, which also stops leaking internal fields and decouples the API from the DB schema.`]},
{q:'Entity lifecycle states — transient, managed, detached, removed',a:[
 `**Transient** — a new object created with \`new\`, unknown to Hibernate. **Managed** (persistent) — attached to the current persistence context after \`persist\` or a load; changes are tracked and saved automatically. **Detached** — it was managed but the session closed, so changes are no longer tracked; \`merge\` brings it back. **Removed** — scheduled for deletion and deleted at flush.`,
 `This matters for bugs like "my update didn't save" — the entity was detached — or LazyInitializationException, which happens on detached entities.`]},
{q:'JPQL vs native SQL — when to use which?',a:[
 `**JPQL** queries entities and fields, not tables, so it's database-independent, type-checked against the mapping, and returns managed entities. I use it, or derived query methods, for most queries.`,
 `**Native SQL** (\`@Query(nativeQuery = true)\`) is for what JPQL can't do or does badly — database-specific features like window functions, CTEs, JSON operators, hints, or heavy reporting queries where I want full control. The trade-off is lost portability and mapping results to DTOs or projections myself.`]},
]);
