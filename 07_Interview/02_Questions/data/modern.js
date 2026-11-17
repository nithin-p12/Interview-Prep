QB.cat({id:'modern',name:'Java 8+ & Modern Java',short:'Java 8+',icon:'λ',col:'purple'},[
{q:'How have you used Java 8 features in your projects?',a:[
 `Daily. **Streams** to transform data — mapping entities to DTOs, grouping orders by status, summing amounts. **Lambdas and method references** everywhere a behaviour is passed, like comparators and \`@Bean\` configurations. **Optional** as the return type of repository lookups — \`findById(id).orElseThrow(() -> new ResourceNotFoundException(...))\`.`,
 `Also the **java.time** API (\`Instant\`, \`LocalDate\`) instead of \`Date\`, and **CompletableFuture** to call several downstream services in parallel and combine the results.`]},
{q:'What is a functional interface? Give some examples',c:['Tech Lead'],a:[
 `An interface with exactly **one abstract method** — it can still have default and static methods. Because it has one method, a lambda or method reference can implement it. \`@FunctionalInterface\` makes the compiler enforce that.`,
 `Built-in ones in \`java.util.function\`: \`Predicate<T>\` (test → boolean), \`Function<T,R>\` (apply), \`Consumer<T>\` (accept), \`Supplier<T>\` (get), plus \`BiFunction\`, \`UnaryOperator\`. Older ones too: \`Runnable\`, \`Callable\`, \`Comparator\`.`]},
{q:'Stream API vs traditional loops — when to use which?',a:[
 `Streams are great for **declarative data pipelines** — filter, map, group, collect — they're shorter, easier to read and have no mutable state. Loops are better when you need **early exit with complex conditions, checked exceptions, index-based logic, or mutating local variables**, and they're slightly faster in tight hot paths.`,
 `My rule: streams for transformations, loops when the stream version needs tricks to work. And I avoid \`parallelStream()\` in a web app — it uses the shared common ForkJoinPool and rarely helps for request-sized data.`]},
{q:'Optional — how do you use it to avoid NullPointerException?',c:['Deloitte'],a:[
 `\`Optional\` makes "this may have no value" explicit in the **return type**, so the caller is forced to handle it. Spring Data's \`findById\` returns one: \`repo.findById(id).map(UserDto::from).orElseThrow(() -> new UserNotFoundException(id))\`.`,
 `Good practice: use \`map\`, \`filter\`, \`orElse\`, \`orElseGet\` (lazy), \`orElseThrow\` — and avoid calling \`get()\` without checking. Use it only for return values, **not for fields, method parameters or collections** — return an empty list instead of \`Optional<List>\`.`]},
{q:'Java 8 vs 11 vs 17 vs 21 vs 25 — key features of each LTS',a:[
 `**Java 8** — the foundation: lambdas, streams, Optional, java.time, CompletableFuture, default methods.`,
 `**Java 11** — modernization: \`var\` (from 10), the new \`HttpClient\`, String helpers like \`isBlank\`, \`strip\`, \`lines\`, and running single-file programs directly.`,
 `**Java 17** — modern Java: **records**, **sealed classes**, **text blocks**, switch expressions and pattern matching for \`instanceof\`. Spring Boot 3 requires 17.`,
 `**Java 21** — **virtual threads**, record patterns, pattern matching in \`switch\`, and sequenced collections (\`getFirst\`, \`getLast\`).`,
 `**Java 25** — latest LTS: finalizes things like **scoped values**, flexible constructor bodies, compact source files and module imports, plus compact object headers for lower memory use.`]},
{q:'What are virtual threads and when would you use them?',a:[
 `Virtual threads (Java 21) are lightweight threads managed by the JVM, not the OS. Millions can exist, because when one blocks on I/O — a DB call, an HTTP call — the JVM **unmounts** it from its carrier OS thread, and that carrier runs another virtual thread.`,
 `They're ideal for **I/O-bound, thread-per-request** apps: in Spring Boot 3.2+ you just set \`spring.threads.virtual.enabled=true\` and blocking code scales like reactive code. They don't help CPU-bound work, you shouldn't pool them, and watch for **pinning** — long \`synchronized\` blocks around I/O (improved in Java 24) — and for downstream limits like the DB connection pool.`]},
{q:'Lambdas — what are they, and how do method references relate?',a:[
 `A lambda is a short, anonymous implementation of a **functional interface** — \`(a, b) -> a.getSalary() - b.getSalary()\` instead of an anonymous inner class. It can only use local variables that are **effectively final**.`,
 `A **method reference** is shorthand for a lambda that just calls an existing method: \`String::toUpperCase\`, \`System.out::println\`, \`Employee::new\`. Same behaviour, more readable — I use them whenever the lambda body is a single method call.`]},
]);
