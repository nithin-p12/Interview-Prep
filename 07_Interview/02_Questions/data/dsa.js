QB.cat({id:'dsa',name:'Coding — Problems & DSA',short:'DSA Coding',icon:'🔢',col:'blue'},[
{q:'Validate balanced brackets (), [], {} — with a stack, then without an explicit stack',c:['Deloitte'],a:[
 `With a stack: push every opening bracket; on a closing bracket the stack must not be empty and its top must be the matching opener, so pop it. At the end the stack must be empty. O(n) time, O(n) space. I use \`ArrayDeque\`, not the old \`Stack\` class.`,
 `Without an explicit stack: if there's only **one** bracket type, a simple counter works — +1 on open, −1 on close, never below zero, zero at the end. For **mixed** types, a counter isn't enough because "([)]" would pass; the no-stack trick is to repeatedly remove adjacent pairs "()", "[]", "{}" until nothing changes — O(n²) but no stack. Or use the char array itself as a stack with a top index, which is the same idea in O(1) extra space.`],
 code:`boolean isValid(String s) {
  Deque<Character> st = new ArrayDeque<>();
  for (char c : s.toCharArray()) {
    if (c == '(') st.push(')');
    else if (c == '[') st.push(']');
    else if (c == '{') st.push('}');
    else if (st.isEmpty() || st.pop() != c) return false;
  }
  return st.isEmpty();
}

// no stack: keep removing adjacent pairs
boolean isValidNoStack(String s) {
  int len;
  do {
    len = s.length();
    s = s.replace("()", "").replace("[]", "").replace("{}", "");
  } while (s.length() != len);
  return s.isEmpty();
}`},
{q:'Two Sum — return indexes of two numbers that add up to the target',c:['KPMG'],a:[
 `Brute force checks every pair in O(n²). The optimal way is one pass with a \`HashMap\` of value → index: for each number, check if \`target - num\` is already in the map; if yes, that's the pair, otherwise store the current number.`,
 `O(n) time, O(n) space. Edge case: the same element can't be used twice — checking the map **before** inserting the current number handles that, including duplicates like [3,3] target 6.`],
 code:`int[] twoSum(int[] nums, int target) {
  Map<Integer, Integer> seen = new HashMap<>();
  for (int i = 0; i < nums.length; i++) {
    Integer j = seen.get(target - nums[i]);
    if (j != null) return new int[]{j, i};
    seen.put(nums[i], i);
  }
  return new int[0];
}`},
{q:'Sort an array of integers without using a sort method',c:['TCS'],a:[
 `I'd write bubble sort first because it's easy to explain — repeatedly swap adjacent out-of-order elements, with an early exit if a pass makes no swaps. That's O(n²) worst case, O(n) on an already sorted array, O(1) space.`,
 `If they ask for better, I'd mention merge sort or quicksort at O(n log n), and counting sort at O(n + k) when the values are in a small known range.`],
 code:`void bubbleSort(int[] a) {
  for (int i = 0; i < a.length - 1; i++) {
    boolean swapped = false;
    for (int j = 0; j < a.length - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
        swapped = true;
      }
    }
    if (!swapped) break;   // already sorted
  }
}`},
{q:'Find the second-largest element without using two loops',c:['Capgemini'],a:[
 `One pass with two variables, \`first\` and \`second\`. If the current number is bigger than \`first\`, the old first moves down to second; else if it's between them and not equal to first, it becomes second.`,
 `O(n) time, O(1) space. Edge cases: duplicates of the max ([5,5,3] → 3, thanks to the \`!= first\` check), and arrays with fewer than two distinct values — return a sentinel or throw.`],
 code:`int secondLargest(int[] a) {
  int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
  for (int n : a) {
    if (n > first) { second = first; first = n; }
    else if (n > second && n != first) second = n;
  }
  if (second == Integer.MIN_VALUE) throw new IllegalArgumentException("no second largest");
  return second;
}`},
{q:'Find the Nth-largest element in an array',c:['ITC Infotech'],a:[
 `Sorting and picking index \`length - n\` works in O(n log n). Better is a **min-heap of size n**: push every number, and whenever the heap grows past n, remove the smallest. At the end the top of the heap is the nth largest.`,
 `O(n log k) time, O(k) space — great when k is small and the array is huge or streaming. Quickselect gives O(n) average if they push further. Edge case: n larger than the array size.`],
 code:`int nthLargest(int[] nums, int n) {
  PriorityQueue<Integer> heap = new PriorityQueue<>();   // min-heap
  for (int x : nums) {
    heap.offer(x);
    if (heap.size() > n) heap.poll();
  }
  return heap.peek();
}`},
{q:'Find the missing number in an array containing 1..n with one number missing',a:[
 `The expected sum of 1..n is \`n*(n+1)/2\`; subtract the actual sum and what's left is the missing number. O(n) time, O(1) space.`,
 `Edge case: for big n the sum can overflow \`int\` — use \`long\`, or use XOR: XOR all numbers 1..n with all array elements and the pairs cancel out, leaving the missing one, with no overflow risk.`],
 code:`int missing(int[] a) {          // a has n-1 numbers from 1..n
  int n = a.length + 1;
  long expected = (long) n * (n + 1) / 2;
  long actual = 0;
  for (int x : a) actual += x;
  return (int) (expected - actual);
}

int missingXor(int[] a) {
  int x = 0, n = a.length + 1;
  for (int i = 1; i <= n; i++) x ^= i;
  for (int v : a) x ^= v;
  return x;
}`},
{q:'Move all zeros to the end, keeping the order of the other elements',a:[
 `Two pointers: \`pos\` marks where the next non-zero should go. Walk the array, copy every non-zero to \`pos\` and advance it; then fill the rest with zeros. In-place, O(n) time, O(1) space, and the relative order of non-zero elements is preserved.`],
 code:`void moveZeros(int[] a) {
  int pos = 0;
  for (int x : a) if (x != 0) a[pos++] = x;
  while (pos < a.length) a[pos++] = 0;
}`},
{q:'Maximum subarray sum — Kadane\'s algorithm',a:[
 `At each element I decide: extend the previous subarray, or start fresh from here — whichever is bigger. \`current = max(x, current + x)\`, and track the best seen so far. The idea is that a negative running sum can only hurt what comes next, so drop it.`,
 `O(n) time, O(1) space. Edge case: all-negative arrays — initialising with \`a[0]\` instead of 0 correctly returns the largest single negative number.`],
 code:`int maxSubArray(int[] a) {
  int current = a[0], best = a[0];
  for (int i = 1; i < a.length; i++) {
    current = Math.max(a[i], current + a[i]);
    best = Math.max(best, current);
  }
  return best;
}`},
{q:'Merge two sorted arrays',a:[
 `Two pointers, one per array: compare the heads, copy the smaller into the result and advance that pointer. When one array runs out, copy the remainder of the other. O(n + m) time and O(n + m) space for the result — same idea as the merge step in merge sort.`],
 code:`int[] merge(int[] a, int[] b) {
  int[] r = new int[a.length + b.length];
  int i = 0, j = 0, k = 0;
  while (i < a.length && j < b.length) r[k++] = a[i] <= b[j] ? a[i++] : b[j++];
  while (i < a.length) r[k++] = a[i++];
  while (j < b.length) r[k++] = b[j++];
  return r;
}`},
{q:'Find the largest and smallest element in an array',a:[
 `Single pass: start both \`min\` and \`max\` at the first element and update them as you go. O(n), O(1) space. Edge case: an empty array — throw or return an Optional. With streams, \`IntStream.of(a).summaryStatistics()\` gives both.`],
 code:`int[] minMax(int[] a) {
  int min = a[0], max = a[0];
  for (int x : a) {
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return new int[]{min, max};
}`},
{q:'Intersection of two arrays',a:[
 `Put the first array into a \`HashSet\`, then walk the second and keep elements found in the set — removing each one as it's matched so the result has no duplicates. O(n + m) time, O(n) space.`,
 `If both arrays are already sorted, two pointers give O(n + m) with O(1) extra space. If they want duplicates counted ([1,2,2,1] and [2,2] → [2,2]), use a count map instead of a set.`],
 code:`List<Integer> intersection(int[] a, int[] b) {
  Set<Integer> set = new HashSet<>();
  for (int x : a) set.add(x);
  List<Integer> res = new ArrayList<>();
  for (int x : b) if (set.remove(x)) res.add(x);
  return res;
}`},
{q:'Rotate an array left and right by k positions',a:[
 `The neat in-place trick is **three reversals**. To rotate right by k: reverse the whole array, then reverse the first k, then reverse the rest. Rotate left is the mirror — reverse the first k, reverse the rest, then reverse the whole array.`,
 `O(n) time, O(1) space. Edge case: k larger than the length — always do \`k %= n\` first.`],
 code:`void rotateRight(int[] a, int k) {
  int n = a.length; k %= n;
  reverse(a, 0, n - 1); reverse(a, 0, k - 1); reverse(a, k, n - 1);
}
void rotateLeft(int[] a, int k) {
  int n = a.length; k %= n;
  reverse(a, 0, k - 1); reverse(a, k, n - 1); reverse(a, 0, n - 1);
}
void reverse(int[] a, int i, int j) {
  while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
}`},
{q:'Check if two arrays are equal when order does not matter ([3,2,5,7] vs [2,3,5,7])',a:[
 `Quick check first: different lengths means not equal. Then either sort copies of both and compare with \`Arrays.equals\` — O(n log n) — or build a frequency map from one array and decrement with the other — O(n).`,
 `Edge case: duplicates. A \`HashSet\` comparison is wrong because [1,1,2] and [1,2,2] would look equal; counting handles it.`],
 code:`boolean sameElements(int[] a, int[] b) {
  if (a.length != b.length) return false;
  Map<Integer, Integer> count = new HashMap<>();
  for (int x : a) count.merge(x, 1, Integer::sum);
  for (int x : b) {
    int c = count.getOrDefault(x, 0);
    if (c == 0) return false;
    count.put(x, c - 1);
  }
  return true;
}`},
{q:'Top K frequent elements',a:[
 `First count frequencies with a \`HashMap\`. Then keep a **min-heap of size k** ordered by frequency — push each entry and pop when the size exceeds k, so the heap ends up holding the k most frequent.`,
 `O(n log k) time, O(n) space. Bucket sort by frequency gives O(n) if they ask for linear time.`],
 code:`List<Integer> topK(int[] nums, int k) {
  Map<Integer, Integer> freq = new HashMap<>();
  for (int n : nums) freq.merge(n, 1, Integer::sum);
  PriorityQueue<Map.Entry<Integer, Integer>> heap =
      new PriorityQueue<>(Map.Entry.comparingByValue());
  for (var e : freq.entrySet()) {
    heap.offer(e);
    if (heap.size() > k) heap.poll();
  }
  List<Integer> res = new ArrayList<>();
  while (!heap.isEmpty()) res.add(heap.poll().getKey());
  return res;
}`},
{q:'Next greater element for each item in an array',a:[
 `Use a **monotonic stack** of indexes whose next-greater hasn't been found yet. For each number, while it's bigger than the element at the stack top, that's the answer for the top — pop and record. Then push the current index. Whatever remains in the stack gets -1.`,
 `Each index is pushed and popped once, so O(n) time and O(n) space, versus O(n²) for the nested-loop brute force.`],
 code:`int[] nextGreater(int[] a) {
  int[] res = new int[a.length];
  Arrays.fill(res, -1);
  Deque<Integer> st = new ArrayDeque<>();      // indexes
  for (int i = 0; i < a.length; i++) {
    while (!st.isEmpty() && a[i] > a[st.peek()]) res[st.pop()] = a[i];
    st.push(i);
  }
  return res;   // [4,5,2,25] -> [5,25,25,-1]
}`},
{q:'Search in a rotated sorted array',a:[
 `Modified binary search. At every step at least one half — left to mid, or mid to right — is still sorted. Check which half is sorted, see if the target lies within that half's range, and discard the other half accordingly.`,
 `O(log n) time, O(1) space. Edge case: with duplicates you can't always tell which half is sorted, and it degrades to O(n).`],
 code:`int search(int[] a, int target) {
  int lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) return mid;
    if (a[lo] <= a[mid]) {                       // left half sorted
      if (target >= a[lo] && target < a[mid]) hi = mid - 1; else lo = mid + 1;
    } else {                                     // right half sorted
      if (target > a[mid] && target <= a[hi]) lo = mid + 1; else hi = mid - 1;
    }
  }
  return -1;
}`},
{q:'Longest substring without repeating characters',a:[
 `Sliding window. I keep a map from each character to its last index, and a \`left\` pointer for the window start. When I see a character already inside the window, I jump \`left\` past its previous position. At each step the window length is \`right - left + 1\`.`,
 `O(n) time, O(k) space for the character set. Edge case: \`left\` must never move backwards — that's why it's \`Math.max\` — e.g. "abba".`],
 code:`int lengthOfLongestSubstring(String s) {
  Map<Character, Integer> last = new HashMap<>();
  int best = 0, left = 0;
  for (int right = 0; right < s.length(); right++) {
    char c = s.charAt(right);
    if (last.containsKey(c)) left = Math.max(left, last.get(c) + 1);
    last.put(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`},
{q:'Anagram check — do two strings have the same character frequencies?',a:[
 `If the lengths differ, they're not anagrams. Otherwise count with a 26-slot int array: increment for each char of the first string, decrement for the second; every slot must end at zero. O(n) time, O(1) space.`,
 `For full Unicode, use a \`HashMap<Character,Integer>\` instead. The simple alternative is sorting both char arrays and comparing — O(n log n). Clarify whether case and spaces matter.`],
 code:`boolean isAnagram(String a, String b) {
  if (a.length() != b.length()) return false;
  int[] count = new int[26];
  for (int i = 0; i < a.length(); i++) {
    count[a.charAt(i) - 'a']++;
    count[b.charAt(i) - 'a']--;
  }
  for (int c : count) if (c != 0) return false;
  return true;
}`},
{q:'Check if two strings are rotations of each other',a:[
 `If both strings have the same length, then \`b\` is a rotation of \`a\` exactly when \`b\` appears inside \`a + a\`. For "ABCD" and "CDAB": "ABCDABCD" contains "CDAB".`,
 `O(n) space for the doubled string; \`contains\` is O(n·m) worst case, O(n) with KMP. Don't forget the length check — without it "AB" would match "ABAB".`],
 code:`boolean isRotation(String a, String b) {
  return a.length() == b.length() && (a + a).contains(b);
}`},
{q:'Reverse a string without using built-in methods',a:[
 `Convert to a char array and swap from both ends with two pointers moving towards the middle. O(n) time, O(n) for the array since Strings are immutable. Edge case: emojis and other surrogate pairs get split by char-level reversal — mention it if they ask about Unicode.`],
 code:`String reverse(String s) {
  char[] c = s.toCharArray();
  for (int i = 0, j = c.length - 1; i < j; i++, j--) {
    char t = c[i]; c[i] = c[j]; c[j] = t;
  }
  return new String(c);
}`},
{q:'Reverse the words in a sentence',a:[
 `Trim, split on one-or-more spaces, then join the words from last to first. O(n) time and space. Edge cases: leading, trailing and multiple spaces — splitting on \`\\\\s+\` after \`trim()\` handles them all.`],
 code:`String reverseWords(String s) {
  String[] words = s.trim().split("\\\\s+");
  StringBuilder sb = new StringBuilder();
  for (int i = words.length - 1; i >= 0; i--) {
    sb.append(words[i]);
    if (i > 0) sb.append(' ');
  }
  return sb.toString();   // "Java is fun" -> "fun is Java"
}`},
{q:'Count vowels and consonants in a string',a:[
 `Lowercase the string and loop once: skip anything that isn't a letter, then check whether the letter is in "aeiou". O(n) time, O(1) space. Edge case: digits, spaces and punctuation are neither — that's why the letter check comes first.`],
 code:`int[] countVowelsConsonants(String s) {
  int v = 0, c = 0;
  for (char ch : s.toLowerCase().toCharArray()) {
    if (!Character.isLetter(ch)) continue;
    if ("aeiou".indexOf(ch) >= 0) v++; else c++;
  }
  return new int[]{v, c};
}`},
{q:'Remove all occurrences of a given character from a string',a:[
 `The one-liner is \`s.replace(String.valueOf(ch), "")\`. Done by hand, loop through the string and append every character that isn't the target to a \`StringBuilder\`. O(n) either way.`],
 code:`String removeChar(String s, char target) {
  StringBuilder sb = new StringBuilder();
  for (char c : s.toCharArray()) if (c != target) sb.append(c);
  return sb.toString();
}`},
{q:'Find special characters in a string (neither letters nor digits)',a:[
 `Loop over the characters and keep those where \`Character.isLetterOrDigit\` is false. Decide up front whether spaces count as special. O(n). A regex alternative is \`s.replaceAll("[a-zA-Z0-9]", "")\`, which leaves only the special characters.`],
 code:`List<Character> specials(String s) {
  List<Character> res = new ArrayList<>();
  for (char c : s.toCharArray())
    if (!Character.isLetterOrDigit(c) && !Character.isWhitespace(c)) res.add(c);
  return res;
}`},
{q:'Convert the first half of a string to lowercase and the second half to uppercase',a:[
 `Find the midpoint with \`length / 2\`, take the two substrings and change their case, then concatenate. O(n). Edge case: odd lengths — decide which half gets the middle character; with \`length / 2\` the extra character goes to the second half.`],
 code:`String halfCase(String s) {
  int mid = s.length() / 2;
  return s.substring(0, mid).toLowerCase() + s.substring(mid).toUpperCase();
}`},
{q:'Find the middle element of a linked list',a:[
 `Slow and fast pointers: slow moves one step, fast moves two. When fast reaches the end, slow is in the middle. One pass, O(n) time, O(1) space — no need to count the length first.`,
 `Edge case: even length — this version returns the second of the two middle nodes; start fast at \`head.next\` if they want the first one.`],
 code:`ListNode middle(ListNode head) {
  ListNode slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`},
{q:'Reverse a linked list, and detect a cycle',a:[
 `Reverse: walk the list with three pointers — \`prev\`, \`curr\`, \`next\` — and point each node back to \`prev\`. At the end, \`prev\` is the new head. O(n) time, O(1) space.`,
 `Cycle: **Floyd's tortoise and hare** — slow moves one step, fast moves two. If there's a cycle they must meet; if fast hits null, there's no cycle. O(n) time, O(1) space, versus a \`HashSet\` of visited nodes which needs O(n) space.`],
 code:`ListNode reverse(ListNode head) {
  ListNode prev = null, curr = head;
  while (curr != null) {
    ListNode next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

boolean hasCycle(ListNode head) {
  ListNode slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) return true;
  }
  return false;
}`},
{q:'Factorial of a number — iterative and recursive',a:[
 `Iterative is a simple loop multiplying 1..n — O(n) time, O(1) space. Recursive is \`n * fact(n-1)\` with base case 0 or 1 — same time but O(n) stack space, and a very large n can throw \`StackOverflowError\`.`,
 `The real catch is overflow: \`int\` overflows after 12!, \`long\` after 20!. For anything bigger, use \`BigInteger\`. Also reject negative input.`],
 code:`long factorial(int n) {
  if (n < 0) throw new IllegalArgumentException("negative");
  long r = 1;
  for (int i = 2; i <= n; i++) r *= i;   // overflows after 20!
  return r;
}

long factorialRec(int n) {
  return n <= 1 ? 1 : n * factorialRec(n - 1);
}

BigInteger bigFactorial(int n) {
  BigInteger r = BigInteger.ONE;
  for (int i = 2; i <= n; i++) r = r.multiply(BigInteger.valueOf(i));
  return r;
}`},
]);
