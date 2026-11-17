QB.cat({id:'streams',name:'Coding — Java 8 Streams',short:'Streams Coding',icon:'💻',col:'indigo'},[
{q:'Sort integers in descending order, remove duplicates, and put odd numbers before even',c:['Deloitte'],a:[
 `I do it in one pipeline: \`distinct()\` removes duplicates, then one \`sorted\` with a combined comparator — first by "is even" so odds (false) come before evens (true), then by value in reverse order.`,
 `Time O(n log n) for the sort, space O(n). Edge case: negative odd numbers — use \`n % 2 != 0\`, not \`n % 2 == 1\`, because \`-3 % 2\` is \`-1\`.`],
 code:`List<Integer> result = nums.stream()
    .distinct()
    .sorted(Comparator.comparing((Integer n) -> n % 2 == 0)   // odds first
        .thenComparing(Comparator.reverseOrder()))          // then descending
    .toList();
// [5, 3, 8, 3, 2, 7, 8] -> [7, 5, 3, 8, 2]`},
{q:'Find all numbers starting with 1 from (11, 18, 20, 24, 85, 66, 13)',a:[
 `Convert each number to a String and keep those that \`startsWith("1")\`. O(n) time. Edge case: negative numbers start with "-", so use \`Math.abs\` if they should count.`],
 code:`List<Integer> result = Stream.of(11, 18, 20, 24, 85, 66, 13)
    .map(String::valueOf)
    .filter(s -> s.startsWith("1"))
    .map(Integer::valueOf)
    .toList();   // [11, 18, 13]`},
{q:'Count male and female employees, and the average salary by gender',a:[
 `Both are a \`groupingBy\` on gender — the only difference is the downstream collector: \`counting()\` for the count and \`averagingDouble\` for the average salary.`,
 `O(n) time, O(g) space for the number of groups. Edge case: null gender would throw in \`groupingBy\`, so filter or default it first.`],
 code:`Map<String, Long> countByGender = emps.stream()
    .collect(Collectors.groupingBy(Employee::gender, Collectors.counting()));

Map<String, Double> avgSalaryByGender = emps.stream()
    .collect(Collectors.groupingBy(Employee::gender,
             Collectors.averagingDouble(Employee::salary)));`},
{q:'Sum of even and sum of odd numbers — separate even and odd using streams',a:[
 `\`partitioningBy\` splits a stream into exactly two groups, \`true\` and \`false\`. With \`summingInt\` downstream I get both sums in one pass; with no downstream I get the two lists.`,
 `O(n) time. Edge case: an empty list still gives both keys, with 0 or an empty list — that's a nice property of partitioningBy over groupingBy.`],
 code:`Map<Boolean, Integer> sums = nums.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0, Collectors.summingInt(n -> n)));
int evenSum = sums.get(true), oddSum = sums.get(false);

Map<Boolean, List<Integer>> evenOdd = nums.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));`},
{q:'Find duplicate elements in a list using streams',c:['Wipro'],a:[
 `The simplest trick is a \`HashSet\` — \`Set.add\` returns false if the element is already there, so filtering on that gives the duplicates. The pure-stream way is to group by the value with \`counting()\` and keep keys with count > 1.`,
 `Both are O(n) time and O(n) space. The Set trick uses a stateful lambda, so don't run it on a parallel stream.`],
 code:`Set<Integer> seen = new HashSet<>();
Set<Integer> dups = nums.stream()
    .filter(n -> !seen.add(n))
    .collect(Collectors.toSet());

// pure stream version
Set<Integer> dups2 = nums.stream()
    .collect(Collectors.groupingBy(n -> n, Collectors.counting()))
    .entrySet().stream()
    .filter(e -> e.getValue() > 1)
    .map(Map.Entry::getKey)
    .collect(Collectors.toSet());`},
{q:'Highest-paid employee in each department',a:[
 `\`groupingBy\` department with \`maxBy\` on salary. \`maxBy\` returns an \`Optional\`, so I wrap it in \`collectingAndThen(..., Optional::get)\` — safe here because a group never exists without at least one employee.`,
 `O(n) time. Edge case: ties — maxBy keeps one of them; if you need all top earners, group to a list and filter by the max.`],
 code:`Map<String, Employee> topByDept = emps.stream()
    .collect(Collectors.groupingBy(Employee::dept,
        Collectors.collectingAndThen(
            Collectors.maxBy(Comparator.comparingDouble(Employee::salary)),
            Optional::get)));`},
{q:'Max salary per department, plus overall max and min salary',a:[
 `Per department I group and map to the salary, then take the max. For the overall numbers, \`summaryStatistics()\` on a \`DoubleStream\` gives min, max, average and count in a single pass.`,
 `O(n) time. Edge case: on an empty list the statistics return \`Infinity\` / \`-Infinity\` for min and max, so check \`getCount()\` first.`],
 code:`Map<String, Double> maxByDept = emps.stream()
    .collect(Collectors.groupingBy(Employee::dept,
        Collectors.collectingAndThen(
            Collectors.maxBy(Comparator.comparingDouble(Employee::salary)),
            o -> o.get().salary())));

DoubleSummaryStatistics stats = emps.stream()
    .mapToDouble(Employee::salary).summaryStatistics();
double max = stats.getMax(), min = stats.getMin();`},
{q:'Employee count per department — group employees by department',c:['TCS'],a:[
 `\`groupingBy(Employee::dept)\` on its own gives \`Map<String, List<Employee>>\`; adding \`counting()\` as the downstream gives the count per department. If they want the output sorted by department name, pass \`TreeMap::new\` as the map factory.`,
 `O(n) time, O(d) space for the departments.`],
 code:`Map<String, List<Employee>> byDept = emps.stream()
    .collect(Collectors.groupingBy(Employee::dept));

Map<String, Long> countByDept = emps.stream()
    .collect(Collectors.groupingBy(Employee::dept, TreeMap::new, Collectors.counting()));`},
{q:'Print employee details working in each department',a:[
 `Group by department, then iterate the map with \`forEach\` and print each department followed by its employees. If they only want names, use \`mapping(Employee::name, toList())\` as the downstream.`,
 `O(n) time.`],
 code:`emps.stream()
    .collect(Collectors.groupingBy(Employee::dept, TreeMap::new,
             Collectors.mapping(Employee::name, Collectors.toList())))
    .forEach((dept, names) -> System.out.println(dept + " -> " + names));`},
{q:'Print active and inactive employees from a collection',a:[
 `This is a two-way split, so \`partitioningBy(Employee::active)\` is the natural fit — \`true\` gives the active list, \`false\` the inactive list. Single pass, O(n).`],
 code:`Map<Boolean, List<Employee>> split = emps.stream()
    .collect(Collectors.partitioningBy(Employee::active));
System.out.println("Active: "   + split.get(true));
System.out.println("Inactive: " + split.get(false));`},
{q:'Find words starting with a vowel',a:[
 `Split the sentence on whitespace, lowercase the first character and check whether it's in "aeiou". O(n) over the characters. Edge cases: empty strings from multiple spaces (split on \`\\\\s+\` and filter blanks) and uppercase first letters.`],
 code:`List<String> vowelWords = Arrays.stream(sentence.trim().split("\\\\s+"))
    .filter(w -> !w.isEmpty())
    .filter(w -> "aeiou".indexOf(Character.toLowerCase(w.charAt(0))) >= 0)
    .toList();`},
{q:'Sum of all elements in a list of integers',a:[
 `\`mapToInt(Integer::intValue).sum()\` — mapping to an \`IntStream\` avoids boxing and gives a primitive \`sum()\`. \`reduce(0, Integer::sum)\` also works. O(n). Edge case: a large list can overflow \`int\`, so use \`mapToLong\` when in doubt.`],
 code:`int sum   = nums.stream().mapToInt(Integer::intValue).sum();
int sum2  = nums.stream().reduce(0, Integer::sum);
long safe = nums.stream().mapToLong(Integer::longValue).sum();`},
{q:'Find the second-highest number using streams',c:['KPMG'],a:[
 `\`distinct()\` first so a repeated max doesn't count twice, sort descending, \`skip(1)\` and \`findFirst()\`. It returns an \`Optional\`, which nicely handles a list with fewer than two distinct values.`,
 `O(n log n) because of the sort. If they push for O(n), I'd do a single loop tracking the largest and second largest.`],
 code:`Optional<Integer> second = nums.stream()
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(1)
    .findFirst();`},
{q:'Find the second-highest salary using streams',a:[
 `Same idea as the second-highest number, but on salaries: map to salary, \`distinct\`, sort descending, \`skip(1)\`. If they want the **employees** earning it, I first find that value and then filter employees with that salary — there might be more than one.`],
 code:`Optional<Double> secondSalary = emps.stream()
    .map(Employee::salary)
    .distinct()
    .sorted(Comparator.reverseOrder())
    .skip(1)
    .findFirst();

List<Employee> earners = secondSalary
    .map(s -> emps.stream().filter(e -> e.salary() == s).toList())
    .orElse(List.of());`},
{q:'Find the first non-repeating character in a string using streams',c:['ITC Infotech'],a:[
 `Count every character into a \`LinkedHashMap\` — the linked map keeps insertion order — then pick the first entry whose count is 1. Two passes, O(n) time, O(k) space for distinct characters.`,
 `Edge case: if every character repeats, the \`Optional\` is empty — return a sentinel or throw, but don't call \`get()\` blindly.`],
 code:`Optional<Character> first = str.chars()
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
    .entrySet().stream()
    .filter(e -> e.getValue() == 1)
    .map(Map.Entry::getKey)
    .findFirst();   // "swiss" -> 'w'`},
{q:'Character frequency in a string',a:[
 `\`chars()\` gives an \`IntStream\`, so I box each to a \`Character\` and \`groupingBy(identity, counting())\`. Use \`LinkedHashMap::new\` to keep first-seen order, or \`TreeMap::new\` for alphabetical. O(n) time. Edge case: decide whether spaces and case matter — filter or lowercase first.`],
 code:`Map<Character, Long> freq = str.chars()
    .mapToObj(c -> (char) c)
    .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()));`},
{q:'Remove duplicate characters from a string, preserving order',a:[
 `\`distinct()\` on a stream keeps the **first occurrence** and preserves encounter order, so streaming the chars, calling \`distinct()\` and joining back gives the answer. O(n) time, O(k) space.`],
 code:`String result = str.chars()
    .distinct()
    .mapToObj(c -> String.valueOf((char) c))
    .collect(Collectors.joining());   // "programming" -> "progamin"`},
{q:'Sum the digits of a number (12345 → 15)',c:['Tech Lead'],a:[
 `Convert the number to a String, stream its chars and map each with \`Character.getNumericValue\`, then \`sum()\`. O(d) for d digits. Edge case: a negative number has a "-" which maps to -1 — use \`Math.abs\` first. The non-stream way is the classic \`n % 10\`, \`n / 10\` loop.`],
 code:`int sum = String.valueOf(Math.abs(12345))
    .chars()
    .map(Character::getNumericValue)
    .sum();   // 15`},
{q:'Combine two lists element by element ([A,B,C] + [1,2,3] → [A1,B2,C3])',c:['Tech Lead'],a:[
 `Java has no built-in \`zip\`, so I stream the **indexes** with \`IntStream.range\` up to the shorter list's size and join the elements at each index. O(n). Edge case: different lengths — using \`Math.min\` simply drops the extras instead of throwing.`],
 code:`List<String> result = IntStream
    .range(0, Math.min(list1.size(), list2.size()))
    .mapToObj(i -> list1.get(i) + list2.get(i))
    .toList();   // [A1, B2, C3]`},
{q:'Sort employees by salary, and by empId',c:['Cognizant'],a:[
 `\`sorted\` with a \`Comparator\` built from the getter — \`comparingDouble(Employee::salary)\`, add \`.reversed()\` for highest first, and chain \`thenComparing\` for a tie-breaker. O(n log n). The sort is stable, so equal salaries keep their original order.`],
 code:`List<Employee> bySalary = emps.stream()
    .sorted(Comparator.comparingDouble(Employee::salary).reversed()
        .thenComparing(Employee::name))
    .toList();

List<Employee> byId = emps.stream()
    .sorted(Comparator.comparingInt(Employee::id))
    .toList();`},
{q:'Convert a list to a map — and handle duplicate keys',a:[
 `\`Collectors.toMap(keyFn, valueFn)\` — but if two elements produce the same key it throws \`IllegalStateException: Duplicate key\`. So in real code I always pass a **merge function** to decide which value wins, and a map supplier like \`LinkedHashMap::new\` if order matters.`,
 `O(n). If duplicates are expected and you want all of them, that's a \`groupingBy\` instead of \`toMap\`.`],
 code:`Map<Integer, String> idToName = emps.stream()
    .collect(Collectors.toMap(Employee::id, Employee::name));

Map<String, Employee> byName = emps.stream()
    .collect(Collectors.toMap(Employee::name, e -> e,
        (a, b) -> a.salary() >= b.salary() ? a : b,   // keep the higher paid
        LinkedHashMap::new));`},
]);
