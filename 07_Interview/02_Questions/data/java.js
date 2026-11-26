QB.cat({id:'java',name:'Core Java & OOP',short:'Core Java',icon:'☕',col:'orange'},[
{q:'Abstract class vs interface — after Java 8, from a design perspective',c:['Deloitte','KPMG'],a:[
 `After Java 8 the line got blurry because interfaces can have \`default\` and \`static\` methods, so the real difference is now about **design intent**, not syntax.`,
 `An interface describes a **capability** — "can do" — like \`Comparable\`, \`Runnable\` or a \`PaymentGateway\`. A class can implement many of them, and it can't hold instance state. An abstract class describes an **"is-a" base** with shared state and partly built behaviour — it can have fields, constructors and protected methods, but a class can extend only one.`,
 `So I use interfaces for contracts between layers — my Spring services and repositories are interfaces — and an abstract class when several implementations share real code and state, like an \`AbstractNotificationSender\` holding the retry logic and template for Email and SMS senders.`]},
{q:'== vs .equals()',c:['KPMG'],a:[
 `\`==\` compares **references** for objects — are these the same object in memory — and values for primitives. \`.equals()\` compares **logical content**, as defined by the class.`,
 `Classic trap: two \`new String("abc")\` are \`equals\` but not \`==\`. And \`Integer a=127, b=127\` gives \`a==b\` true because of the Integer cache (−128 to 127), but with 128 it's false — so always compare wrapper objects with \`equals\`.`]},
{q:'Why must equals() and hashCode() be overridden together?',c:['KPMG'],a:[
 `The contract is: if two objects are \`equals\`, they **must** return the same \`hashCode\`. Hash-based collections use \`hashCode\` first to pick the bucket and only then call \`equals\` inside that bucket.`,
 `If I override only \`equals\`, two "equal" employees get different hash codes, land in different buckets, and a \`HashSet\` happily stores both — or a \`HashMap.get\` with an equal key returns null. So I always generate both from the same fields, ideally immutable ones, or just use a \`record\` which does it for me.`]},
{q:'String vs StringBuilder vs StringBuffer',c:['Cognizant'],a:[
 `\`String\` is immutable — every concatenation creates a new object. \`StringBuilder\` is mutable and fast but not thread-safe. \`StringBuffer\` is the old mutable version with every method \`synchronized\`, so it's thread-safe but slower.`,
 `In practice: \`String\` for normal values, \`StringBuilder\` when building strings in a loop (like generating a CSV or a long log line), and \`StringBuffer\` almost never — if a builder is shared across threads, that's usually a design smell.`]},
{q:'Why is String immutable in Java?',c:['Wipro'],a:[
 `Mainly for **safety and performance**. Because Strings never change, the JVM can keep one copy of a literal in the **String pool** and share it everywhere. They're automatically **thread-safe**, and their \`hashCode\` can be cached, which makes them perfect HashMap keys.`,
 `Security is the other reason — Strings carry things like DB URLs, file paths and class names. If someone could mutate a path after it passed a security check, that check would be meaningless.`]},
{q:'How do you make a String mutable?',c:['Capgemini'],a:[
 `You can't — \`String\` itself is final and immutable. What you do is switch to a mutable type: \`StringBuilder\` (or \`StringBuffer\` if it's shared across threads), edit it with \`append\`, \`insert\`, \`reverse\`, \`setCharAt\`, then call \`toString()\` when you need a String again. For a single change, a \`char[]\` also works.`]},
{q:'How do you create an immutable class?',c:['Cognizant','KPMG'],a:[
 `Make the class \`final\` so it can't be subclassed, make all fields \`private final\`, set them only in the constructor, and provide no setters.`,
 `The part people miss is **mutable fields** — if a field is a \`List\` or \`Date\`, make a defensive copy in the constructor and return a copy or an unmodifiable view from the getter, otherwise the caller can still change your "immutable" object. From Java 16, a \`record\` gives most of this for free — just remember to copy mutable components.`],
 code:`public final class Order {
  private final String id;
  private final List<String> items;
  public Order(String id, List<String> items) {
    this.id = id;
    this.items = List.copyOf(items);   // defensive copy
  }
  public List<String> getItems() { return items; } // already unmodifiable
}`},
{q:'Why are immutable objects useful in multithreaded applications?',a:[
 `Because an object that never changes can't have a race condition. Many threads can read it at once with **no locks, no \`volatile\`, no synchronization** — and \`final\` fields are guaranteed to be visible correctly once the constructor finishes.`,
 `That's why I keep things like config objects, DTOs and event payloads immutable. If something needs to "change", you create a new instance and swap the reference — for example with an \`AtomicReference\` — instead of editing the shared one.`]},
{q:'Overloading vs overriding — and can static methods be overloaded or overridden?',c:['KPMG','Wipro'],a:[
 `**Overloading** is same method name, different parameter list, in the same class — resolved at **compile time**. **Overriding** is a subclass giving its own version of an inherited method with the same signature — resolved at **runtime** based on the actual object. That's runtime polymorphism.`,
 `Static methods **can be overloaded**, like any method. They **cannot be overridden** — if a subclass declares the same static method, it's **method hiding**: which one runs depends on the reference type, not the object.`]},
{q:'Checked vs unchecked exceptions, with examples',c:['Wipro'],a:[
 `**Checked** exceptions extend \`Exception\` and the compiler forces you to handle or declare them — \`IOException\`, \`SQLException\`. They're for recoverable conditions outside your control. **Unchecked** ones extend \`RuntimeException\` — \`NullPointerException\`, \`IllegalArgumentException\` — and usually mean a bug or invalid input.`,
 `In Spring Boot code I mostly use unchecked custom exceptions like \`OrderNotFoundException\`, because they don't pollute every method signature, and \`@Transactional\` rolls back on unchecked exceptions by default — a checked one does **not** roll back unless you add \`rollbackFor\`.`]},
{q:'How do you create a custom exception?',a:[
 `Extend \`RuntimeException\` (or \`Exception\` if you want it checked), add constructors that take a message and a cause, and give it a meaningful name. Then map it in a \`@RestControllerAdvice\` to the right HTTP status, e.g. \`ResourceNotFoundException\` → 404.`],
 code:`public class ResourceNotFoundException extends RuntimeException {
  public ResourceNotFoundException(String msg) { super(msg); }
  public ResourceNotFoundException(String msg, Throwable cause) { super(msg, cause); }
}`},
{q:'Explain each OOP pillar and where you used it in your project',c:['Infosys'],a:[
 `**Encapsulation** — hiding state behind methods. My entities keep fields private and expose business methods like \`order.cancel()\` instead of letting anyone set the status.`,
 `**Abstraction** — exposing what, hiding how. My controllers depend on a \`PaymentService\` interface and don't know whether it calls Razorpay or Stripe.`,
 `**Inheritance** — reusing a base. A \`BaseEntity\` with \`id\`, \`createdAt\`, \`updatedAt\` that all my entities extend.`,
 `**Polymorphism** — one call, many behaviours. A \`NotificationSender\` interface with Email, SMS and Push implementations; Spring injects a \`List<NotificationSender>\` and I loop through them.`]},
{q:'Explain the SOLID principles',c:['Capgemini','KPMG'],a:[
 `**S — Single Responsibility**: a class has one reason to change; my controller handles HTTP, the service holds business logic, the repository talks to the DB.`,
 `**O — Open/Closed**: open for extension, closed for modification; adding a new payment method means adding a new \`PaymentProcessor\` class, not editing a big switch.`,
 `**L — Liskov Substitution**: a subclass must work wherever the parent is expected without surprises — the classic violation is a \`Square\` extending \`Rectangle\`.`,
 `**I — Interface Segregation**: many small interfaces beat one fat one, so implementers aren't forced to write empty methods.`,
 `**D — Dependency Inversion**: depend on abstractions, not concrete classes — which is exactly what Spring's constructor injection of interfaces gives us.`]},
{q:'Singleton pattern — thread-safe implementation and the tricky follow-ups',c:['Infosys'],a:[
 `The cleanest thread-safe singletons are an **enum** or the **Bill Pugh holder** pattern — a static inner class that's loaded lazily, and the JVM guarantees class loading is thread-safe. Double-checked locking also works, but only if the instance field is \`volatile\`.`,
 `The follow-ups are about breaking it: **reflection** can call a private constructor (guard by throwing if the instance already exists), **serialization** creates a new copy (add \`readResolve\`), and **cloning** (don't implement \`Cloneable\`). An enum singleton is immune to all three.`,
 `And in Spring, every bean is a singleton by default, so in real projects I rarely hand-write one.`],
 code:`public class Config {
  private Config() {}
  private static class Holder { static final Config INSTANCE = new Config(); }
  public static Config get() { return Holder.INSTANCE; }
}`},
{q:'Comparable vs Comparator',c:['Cognizant'],a:[
 `\`Comparable\` is the **natural order**, written inside the class with \`compareTo\` — one ordering only, like \`Employee\` sorted by id. \`Comparator\` is an **external** ordering you can create as many of as you want, without touching the class.`,
 `With Java 8 I mostly use Comparator chains: \`Comparator.comparing(Employee::getDept).thenComparing(Employee::getSalary, Comparator.reverseOrder())\`.`]},
{q:'Generics — <? extends T> vs <? super T>',c:['Deloitte'],a:[
 `Remember **PECS — Producer Extends, Consumer Super**. Use \`? extends T\` when you only **read** from the collection: a \`List<? extends Number>\` can hold Integers or Doubles and you can read them as Number, but you can't add to it.`,
 `Use \`? super T\` when you only **write** into it: a \`List<? super Integer>\` accepts Integers, and could be a \`List<Number>\` or \`List<Object>\`. \`Collections.copy(dest, src)\` is the textbook example — \`src\` is \`extends\`, \`dest\` is \`super\`.`]},
{q:'Your payment totals drift by one paisa every few thousand transactions. What type holds the money?',a:[
 `The money is in a \`double\` or \`float\`. Binary floating point can't represent values like 0.1 exactly, so rounding errors accumulate — \`0.1 + 0.2\` gives \`0.30000000000000004\`.`,
 `Money must use \`BigDecimal\`, created from a **String** (\`new BigDecimal("0.10")\`, not from a double), with an explicit scale and \`RoundingMode.HALF_EVEN\` for division. Or store amounts as a \`long\` in the smallest unit — paise. In the DB use \`DECIMAL(19,2)\`, and in MongoDB \`Decimal128\`.`]},
{q:'new BigDecimal("2.0") and new BigDecimal("2.00") are the same amount, but equals() says false. Why?',a:[
 `\`BigDecimal.equals\` compares both **value and scale** — 2.0 has scale 1, 2.00 has scale 2, so they're not equal. Use \`compareTo(...) == 0\` to compare amounts.`,
 `This bites you when BigDecimals are keys in a \`HashSet\` or \`HashMap\` — you get "duplicate" amounts. Normalise with \`stripTrailingZeros()\` or a fixed \`setScale(2)\` before using them as keys.`]},
{q:'Everything works on your laptop, but in production every timestamp is five and a half hours off. Why?',a:[
 `Your laptop is in IST (UTC+5:30) and the production server or container runs in **UTC**. Code that uses \`LocalDateTime.now()\` or \`new Date()\` without a zone takes the JVM default timezone, so the same code gives different times.`,
 `Fix: store and transmit everything in UTC using \`Instant\` or \`OffsetDateTime\`, set \`hibernate.jdbc.time_zone=UTC\`, and convert to the user's zone only at display time. Don't rely on the server's default timezone.`]},
{q:'What happens internally when a Java class is loaded?',a:[
 `It happens in three phases. **Loading** — a ClassLoader finds the \`.class\` bytes and creates a \`Class\` object. Loaders follow **parent delegation**: Bootstrap → Platform → Application, so core classes can't be replaced.`,
 `**Linking** — the bytecode is **verified**, memory for static fields is **prepared** with default values, and symbolic references are **resolved**. **Initialization** — static initializers and static blocks run, once, the first time the class is actually used.`,
 `That's why the Bill Pugh singleton is lazy — the holder class isn't initialized until \`get()\` first touches it.`]},
]);
