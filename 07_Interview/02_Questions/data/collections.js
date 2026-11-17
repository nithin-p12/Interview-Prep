QB.cat({id:'collections',name:'Collections & HashMap',short:'Collections',icon:'🗂',col:'amber'},[
{q:'How does HashMap work internally?',c:['Deloitte','Cognizant','KPMG'],a:[
 `A HashMap is an **array of buckets**. On \`put\`, it calls the key's \`hashCode()\`, spreads the bits (\`h ^ (h >>> 16)\`) so the high bits also count, and does \`hash & (n-1)\` to pick a bucket index.`,
 `If the bucket is empty the entry goes straight in. If not, it walks the entries there and uses \`equals()\` to check whether the key already exists — if yes it replaces the value, otherwise it appends a new node. \`get\` follows the same path: hash to the bucket, then \`equals\` to find the key.`,
 `When the size crosses **capacity × load factor (0.75)** — 12 entries for the default 16 — it **doubles** the array and redistributes entries. And since Java 8, if one bucket grows beyond **8 entries** (and the table has at least 64 buckets) that linked list is converted into a **red-black tree**, so the worst case becomes O(log n) instead of O(n).`]},
{q:'What happens when two different keys have the same hashCode()?',a:[
 `That's a **collision**. Both keys land in the same bucket, and HashMap stores them as separate nodes in a linked list in that bucket — or a tree once it gets long. On \`get\`, it goes to the bucket and uses \`equals()\` to pick the right key, so the result is still correct, just a bit slower.`,
 `That's exactly why a good \`hashCode\` matters — if every key returned the same hash, the whole map would collapse into one bucket and lookups would degrade from O(1) to O(log n) or worse.`]},
{q:'Why is HashMap not thread-safe? What goes wrong when multiple threads use it?',a:[
 `None of its operations are synchronized. Two threads doing \`put\` at the same time can both see a bucket as empty and one entry silently **overwrites** the other — you **lose updates**. A concurrent **resize** can leave entries missing, and in Java 7 it could even create a cycle in the linked list, causing an infinite loop and 100% CPU on \`get\`.`,
 `There's also visibility — one thread may simply not see another thread's writes. So for shared state, like an in-memory cache in a Spring singleton bean, I use \`ConcurrentHashMap\`.`]},
{q:'HashMap vs ConcurrentHashMap',c:['Capgemini','KPMG'],a:[
 `\`HashMap\` is not thread-safe, allows **one null key** and null values, and its iterator is **fail-fast**. \`ConcurrentHashMap\` is thread-safe with high concurrency, allows **no null keys or values**, and its iterator is **weakly consistent** — it never throws ConcurrentModificationException.`,
 `Unlike \`Collections.synchronizedMap\` or \`Hashtable\`, which lock the whole map, ConcurrentHashMap locks only the bin being written and reads don't lock at all. It also gives atomic helpers like \`computeIfAbsent\` and \`merge\` — I use \`counts.merge(key, 1, Integer::sum)\` for thread-safe counters.`]},
{q:'How does ConcurrentHashMap work internally?',a:[
 `In Java 8+ it's the same bucket array as HashMap, but with fine-grained concurrency. Inserting into an **empty bin** uses a lock-free **CAS**. If the bin already has nodes, it does \`synchronized\` on just the **first node of that bin**, so threads writing to different bins never block each other.`,
 `**Reads take no lock** — the fields are \`volatile\`, so they always see a recent value. Resizing is done cooperatively: threads that arrive during a resize help move bins. (Java 7 used 16 fixed **segments** with a lock each — that's the older answer.)`,
 `Nulls are banned because \`get\` returning null must unambiguously mean "absent" — in a concurrent map you can't safely follow up with \`containsKey\`.`]},
{q:'Fail-fast vs fail-safe iterators, and what causes ConcurrentModificationException?',c:['Deloitte','TCS','Accenture'],a:[
 `A **fail-fast** iterator — \`ArrayList\`, \`HashMap\` — keeps a \`modCount\`. If the collection is structurally modified during iteration by anything other than the iterator itself, the next \`next()\` sees the count changed and throws \`ConcurrentModificationException\`. The classic cause is calling \`list.remove()\` inside a for-each loop — even in a single thread.`,
 `A **fail-safe** iterator — \`CopyOnWriteArrayList\`, \`ConcurrentHashMap\` — works on a snapshot or is weakly consistent, so it never throws, but it may not reflect the latest changes.`,
 `Fix: use \`iterator.remove()\`, \`list.removeIf(...)\`, or collect into a new list with streams.`]},
{q:'ArrayList vs LinkedList — when would you use each?',a:[
 `\`ArrayList\` is backed by a dynamic array: **O(1) random access** by index, great CPU-cache locality, and appends are amortized O(1). Inserting or removing in the middle shifts elements, O(n).`,
 `\`LinkedList\` is a doubly linked list: O(1) add/remove at the ends or at an iterator position, but \`get(i)\` is O(n) and each node costs extra memory. In practice I use **ArrayList almost always**; for queue or stack behaviour I'd use \`ArrayDeque\` rather than LinkedList.`]},
{q:'List vs Set vs Map — when do you choose which? How have you used collections in projects?',a:[
 `**List** when order matters and duplicates are allowed — like order line items returned from an API. **Set** when I need uniqueness — e.g. a \`Set<String>\` of user roles or processed Kafka message IDs. **Map** when I look things up by key — e.g. \`Map<String, Product>\` built from a DB result so I avoid N+1 lookups in a loop.`,
 `Then I pick the implementation: \`HashSet\`/\`HashMap\` for speed, \`LinkedHashMap\` when insertion order matters (or for a simple LRU cache), \`TreeMap\` when I need sorted keys or range queries, and \`ConcurrentHashMap\` for shared state across threads.`]},
{q:'How do you handle duplicate elements in a collection?',a:[
 `To remove them, put the elements in a \`Set\` — \`LinkedHashSet\` if I want to keep the original order — or use \`stream().distinct()\`. To **find** duplicates, \`Collectors.groupingBy(identity, counting())\` and keep counts > 1, or add to a \`HashSet\` and catch the ones where \`add\` returns false.`,
 `For custom objects this only works if \`equals\` and \`hashCode\` are implemented on the right fields. And at the system level, I also enforce uniqueness with a **unique index** in the DB, since in-memory checks don't protect against concurrent requests.`],
 code:`Set<Integer> seen = new HashSet<>();
List<Integer> dups = list.stream()
    .filter(n -> !seen.add(n))   // add() returns false for a duplicate
    .distinct()
    .toList();`},
]);
