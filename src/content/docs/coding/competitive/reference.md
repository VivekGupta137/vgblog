---
title: Competitive Coding Reference
description: Night-before-interview coding notes covering Java collections, math, DP, graphs, trees, bit tricks and common interview problems.
---

Source: https://leetcode.com/discuss/career/217868/My-notes-for-the-night-before-interview

## Coding

## Basic things

### MODULO

:::caution[Pitfalls]
- Use `long` for products: `(int)((a*(long)b)%MOD)`.
- Subtraction can go negative: always `((a-b)%MOD + MOD)%MOD`.
- Division needs the modular inverse (Fermat): `a/b ≡ a·b^(p-2) (mod p)` for prime `p`.
:::

In Java we can write `10^9+7` as:

```java
static final int MOD = (int)(1e9 + 7 );
```

Where, `1e9` is a double representing scientific notation for the number one followed by nine zeros - 1,000,000,000.

When dealing with modulo questions, it's better to use the self-implemented add method.

```java
public int add(int a,int b){
         return (a+b)%MOD;
}
```

When dealing with modulo questions involving multiplication, it's better to use the `long` datatype, as `long` datatype can store `(1e9+7)^2`.

```java
public int multiply(int a, int b) {
    return (int)( (a*(long)b)%MOD );
}
```

We need to be careful when dealing with modulo in case of subtraction, as the value can be negative.

```java
public int subtract(int a,int b){
    return ((a-b)%MOD + MOD)%MOD;
}
// (21 - 18)%10 = 3        let us suppose, MOD == 10
// BUT, (21%10 - 18%10)%10 == (1 - 8)%10 = -7
// both 3 and -7 are mathematically equal as, -7 + MOD == 3
```

Modular division of `a/b` with `MOD` = p (p is a prime number):

`(a/b)%p != (a%p / b%p)%p`

For eg. if a = 10, b = 5, p = 5, then `(a/b)%p = 2` and `(a%p / b%p)%p = 0`.

To find the correct value of `(a/b)%p` from `(a%p / b%p)%p`, we use Fermat's theorem.

- Theorem 1: according to this `(a^p - a)` is a multiple of p.
  - `k*p = (a^p - a)`
  - `a^p % p = a % p`
- Theorem 2: according to this `(a^(p-1) - 1)` is an integer multiple of p, iff a is not a multiple of p.
  - `a^(p-1) % p = 1 % p`
  - `a^(p-2) % p = a^(-1) % p` (multiply both sides by a^(-1))
  - `modinv(a) = a^(-1) % p = a^(p-2) % p`

So now `(a%p / b%p)%p = (a%p * modinv(b)%p )%p = (a%p * b^(p-2)%p )%p`

### Modular exponentiation / power with mod

:::note
Binary exponentiation computes `a^b % m` in `O(log b)` multiplications.
:::

```c
static int power(int x, int y, int p)
{
  int res = 1;      // Initialize result

  x = x % p;        // Update x if it is more than or
                    // equal to p

  if (x == 0)
    return 0;       // In case x is divisible by p;

  while (y > 0)
  {
    // If y is odd, multiply x with result
    if ((y & 1) != 0)
      res = (res * x) % p;

    // y must be even now
    y = y >> 1;     // y = y/2
    x = (x * x) % p;
  }
  return res;
}
```

### ITERATING OVER MAP

Iterating over maps, for pairs:

```java
Map<String, Object> map = ... ; // just an example
for (Map.Entry<String, Object> entry : map.entrySet()) {
    System.out.printf("%s -> %s\n", entry.getKey(), entry.getValue());
}
```

### SINGLE LINE ARRAY RETURN

Returning the array in a single line:

```java
return new double[]{1.1,1.2};
```

One-liner array sort:

```java
Arrays.sort(times, (a,b) -> a-b);
```

### Deque

:::tip[Which one to use?]
Prefer `ArrayDeque` for both stack and queue; it is faster than `LinkedList` and has `O(1)` add/remove at both ends. It does not allow `null`.
:::

It allows insert and delete at both ends.

```java
Deque<TreeNode> q = new ArrayDeque<>();
```

Implementing classes: `ArrayDeque`, ConcurrentLinkedDeque, LinkedBlockingDeque, `LinkedList`.

Implementation to use: `ArrayDeque`, as if we need to add/remove at both ends, `ArrayDeque` is significantly better than a linked list. Also, random access to each element is `O(1)` for a cyclic queue.

The only better operation of a linked list is removing the current element during iteration. Also, `LinkedList` supports `null` elements, whereas `ArrayDeque` does not. `LinkedList` has methods like `indexOf` or `remove(int)` while `ArrayDeque` hasn't.

It is a doubly ended linked list, and can be used as both a Stack and a Queue.

Stack method to equivalent `Deque` method:

| Stack Method | Equivalent `Deque` Method |
|---|---|
| `push(e)` | `addFirst(e)` |
| `pop()` | `removeFirst()` |
| `peek()` | `peekFirst()` |

Queue method to equivalent `Deque` method:

| Queue Method | Equivalent `Deque` Method |
|---|---|
| `add(e)` | `addLast(e)` |
| `offer(e)` | `offerLast(e)` |
| `remove()` | `removeFirst()` |
| `poll()` | `pollFirst()` |
| `element()` | `getFirst()` |
| `peek()` | `peekFirst()` |

`Deque` methods summary:

| | First Element (Head): Throws exception | First Element (Head): Special value | Last Element (Tail): Throws exception | Last Element (Tail): Special value |
|---|---|---|---|---|
| Insert | `addFirst(e)` | `offerFirst(e)` | `addLast(e)` | `offerLast(e)` |
| Remove | `removeFirst()` | `pollFirst()` | `removeLast()` | `pollLast()` |
| Examine | `getFirst()` | `peekFirst()` | `getLast()` | `peekLast()` |

### TreeMap and TreeSet

:::note
Both are red-black trees: `O(log n)` for insert, search and delete. `floor`/`ceiling`/`lower`/`higher` give nearest-key lookups, so you rarely need a segment tree for range questions.
:::

No need to implement segment trees, as we can use these for range queries.

`TreeMap` stores the Map entries sorted by keys.

We can insert / search for an element in `O(log n)`. We can get all keys belonging to a range using `subMap`.

- `SortedMap<K,V>  subMap(K fromKey, K toKey)`: Returns a view of the portion of this map whose keys range from `fromKey`, inclusive, to `toKey`, exclusive.
- `Set<K>  keySet()`: Returns a Set view of the keys contained in this map.
- `K  firstKey()`: Returns the first (lowest) key currently in this map.
- `K  lastKey()`: Returns the last (highest) key currently in this map.
- `K  floorKey(K key)`: Returns the greatest key less than or equal to the given key, or `null` if there is no such key.
- `K  lowerKey(K key)`: Returns the greatest key strictly less than the given key, or `null` if there is no such key.
- `K  ceilingKey(K key)`: Returns the least key greater than or equal to the given key, or `null` if there is no such key.
- `K  higherKey(K key)`: Returns the least key strictly greater than the given key, or `null` if there is no such key.
- `Map.Entry<K,V>  pollFirstEntry()`: Removes and returns a key-value mapping associated with the least key in this map, or `null` if the map is empty.
- `Map.Entry<K,V>  pollLastEntry()`: Removes and returns a key-value mapping associated with the greatest key in this map, or `null` if the map is empty.

```java
TreeSet<Long> bt = new TreeSet<>();
// provides guaranteed log(n) time cost for the basic operations (add, remove, contains, floor, ceiling).
new TreeSet<>( (a,b)->a-b );
```

- `first()`: Returns the first (lowest) element currently in this set.
- `last()`: Returns the last (highest) element currently in this set.
- `pollFirst()`: Retrieves and removes the first (lowest) element, or returns `null` if this set is empty.
- `pollLast()`: Retrieves and removes the last (highest) element, or returns `null` if this set is empty.
- `bt.floor()`: Returns the greatest element in this set less than or equal to the given element.
- `bt.ceiling()`: Returns the least element in this set greater than or equal to the given element.

### Sliding window maximum

:::tip[Pick the structure by cost]
Max-heap `O(N log N)` → `TreeMap` `O(N log K)` → monotonic deque `O(N)` (best).
:::

We need to know the maximum in the window of size k.

- Use max heap: `O(N log N)`
- Use `TreeMap`: `O(N log K)`
- Use deque: `O(N)`

Using max heap:

```java
// using max heap
public int[] maxSlidingWindow(int[] nums, int k) {
    int window[] = new int[nums.length-k+1], idx = 0;
    PriorityQueue<Integer> pq = new PriorityQueue<>(new Comparator<Integer>(){
        @Override
        public int compare(Integer a,Integer b){
            return nums[b]-nums[a];
        }
    });
    for(int i = 0 ; i < nums.length; i++){
        if(i < k-1) {
            pq.add(i);
            continue;
        }
        while(!pq.isEmpty() && pq.peek() < i-k+1)
            pq.poll();
        pq.add(i);
        window[idx++] = nums[pq.peek()];
    }
    return window;
}
```

Using deque:

```java
// using deque
public int[] maxSlidingWindow(int[] nums, int k) {
    int window[] = new int[nums.length-k+1], idx = 0;
    Deque<Integer> dq = new ArrayDeque<>();
    for(int i = 0 ; i < nums.length; i++){
        // if my current element is greater than last element in dq
        while(!dq.isEmpty() && nums[dq.peekLast()] < nums[i])
            dq.removeLast();
        // if my first element in dq is out current window
        while(!dq.isEmpty() && dq.peekFirst() < i-k+1)
            dq.removeFirst();
        dq.addLast(i);
        if(i < k-1) continue;
        window[idx++] = nums[dq.peekFirst()];
    }
    return window;
}
```

### Input Size and Time Complexity

:::note[Rule of thumb]
About `10^8` simple operations per second. `N ≤ 10^5` → `O(N log N)`; `N ≤ 10^3` → `O(N^2)`; `N ≤ 20` → exponential/bitmask.
:::

We can perform at most 10^8 to 10^9 operations. Most online judges use a 733 MHz CPU which can perform 7.33e8 operations in a second. The time limit is generally 1 to 2 seconds.

### LAZY Increment

:::tip[Difference array]
For many range increments, add `+v` at `l` and `-v` at `r+1`, then take a prefix sum once at the end: `O(N+Q)`.
:::

Print modified array after multiple array range increment operations.

Example input and output:

```java
int[] A = {3, 5, 4, 8, 6, 1};
int[][] q = {{0, 3}, {4, 5}, {1, 4}, {0, 1}, {2, 5}};
int increment = 2;
output : [7, 11, 10, 14, 12, 5]
```

```java
public static String lazyIncrement(int[] A,int[][] queries,int increment) {
    int[] inc = new int[A.length];
    for(int[] query: queries){
        int i = query[0], j = query[1];
        if(i!=0)
            inc[i-1] -= increment;
        inc[j] += increment;
    }
    // do reverse prefix sum
    for(int i = A.length-2; i >= 0; i--)
        inc[i] += inc[i+1];
    for(int i = 0; i < A.length; i++)
        A[i] += inc[i];
    return Arrays.toString(A);
}
```

### 2D ARRAY sorting

Sorting array of `int`:

```java
// Sort arr in increasing order by their values.
Arrays.sort(arr, Comparator.comparingInt(o -> o[0]));
```

Sorting by value with original indices:

```java
int n = nums.length;
int[][] arr = new int[n][2];
for (int i = 0; i < n; ++i) {
    arr[i][0] = nums[i];
    arr[i][1] = i;
}
Arrays.sort(arr, Comparator.comparingInt(o -> o[0]));
// Sort arr in increasing order by their values.
```

### HCF / GCD

:::note
`gcd(a, b) = gcd(b, a % b)`; the loop version avoids recursion and runs in `O(log min(a, b))`.
:::

We want to find the HCF of two numbers A and B.

Property: since the HCF divides A and B, it also divides (`A-B`).

```java
public static long gcd(long a,long b){
     if(b==0)     return a;
     if(a==0)     return b;
     if(a>=b)     return gcd(a-b,b);
     else         return gcd(a,b-a);
}
```

We can optimise it further by using modulo:

```java
public static long gcd(long a,long b){
     if(b==0)     return a;
     if(a==0)     return b;
     if(a>=b)     return gcd(a%b,b);
     else         return gcd(a,b%a);
}
```

Without recursion:

```java
private int gcd(int a, int b) {
     while (b != 0) {
        int temp = b;
        b = a % b;
        a = temp;
     }
     return a;
   }
```

### Handling updates in the priority queue

:::tip[Lazy deletion]
PQ has no decrease-key. Push the new `(key, value)` and keep a `HashMap` of the latest value; when polling, skip entries that do not match the map.
:::

The problem happens when we need to handle updating the key of a previously inserted value in a priority queue. One approach is to remove the element from the PQ and add it again.

An efficient approach is to keep a `HashMap` that tracks the most updated value associated with some key. The idea is to add all the `<K,V>` pairs to the priority queue, and whenever we want to make an update, also update the `HashMap` for that `<K,V>`. When it comes to reading values from the PQ (i.e. we want to poll the max or min), run a while loop to remove the outdated values (those keys whose values do not match the `HashMap`) from the PQ.

For eg. if we want to store `Node<K,V>` in the priority queue:

```text
PQ -> [ Node<2,3> ]
Map -> <2,3>

Adding more values (items are sorted based on their values)
PQ -> [ Node<1,5>, Node<2,3>, Node<4,2> ]
Map -> <2,3> <1,5> <4,2>

Now I want to update the value for key = 1 with value = 1, I will simply add it in pq and update the map
PQ -> [ Node<1,5>, Node<2,3>, Node<4,2>, Node<1,1>]
Map -> <2,3> <1,1> <4,4>
```

Now if I want to read the max value item from the PQ, we run the while loop to check whether the max item has the updated value according to the Map, as per the following code:

```java
// get the max val
while(!pq.isEmpty()){
    Node p = pq.peek();
    if(map.get(p.key) == p.val){
        // ok
        break;
    }
    else{
        pq.poll();
    }
}
Node mx = pq.peek();
```

### Inclusion - exclusion principle

:::note
Sum single sets, subtract pairwise intersections, add triple intersections, and so on, alternating signs.
:::

$$|A \cup B| = |A| + |B| - |A \cap B|$$

General inc - exc = sum of individual terms - (sum of even intersection) + (sum of odd intersection).

### Prime Numbers

$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

Inversions in an array: basically, inversions are the pairs that are in the wrong order relative to sorted order. For eg. in case of an ascending array A, if there is a pair (A_i, A_j) such that `A[i]` = A_i and `A[j]` = A_j, then if A_i > A_j and `i < j`, it forms an inversion pair. It is easily solved using a BIT.

Mod power exponentiation - compute `a^b % m`. Time complexity: `O(log b)`.

Mod division - compute `(a / b) % m`. 

$$\left|\bigcup_{i=1}^{n} A_i\right| = \sum_{i=1}^{n}|A_i| - \sum_{1\le i<j\le n}|A_i\cap A_j| + \sum_{1\le i<j<k\le n}|A_i\cap A_j\cap A_k| - \cdots + (-1)^{n+1}|A_1\cap\cdots\cap A_n|$$

 To calculate this we find the modular multiplicative inverse `(1 / b) % m => b^(-1) % m = y`. The y is the multiplicative inverse of x such that `x*y = 1`. The multiplicative inverse may not exist; it only exists if `gcd(x, m)` = 1, as otherwise any `x*y` will be divisible by m because x `gcd(x, m)` != 1.

### Segment tree

### Suffix array

## Dynamic programming and graphs

- Digit DP, DP patterns and DP problems: see [Dynamic Programming Reference](/coding/competitive/dp/).
- Graph representations, algorithms and graph problems: see [Graph Algorithms Reference](/coding/competitive/graphs/).

### union-find algorithm

:::tip
Use path compression (+ union by rank/size) for near-`O(1)` amortized `find`/`union`. Typical uses: connected components, cycle detection in undirected graphs, Kruskal's MST.
:::

It performs two useful operations:
- FIND: determine which subset a particular element is in.
- UNION: join the two subsets into a single subset.

```java showLineNumbers mark={2,5-6}
public static void union(int u,int v, int[] ufds){
     ufds[find(u,ufds)] = find(v,ufds);
}
public static int find(int u,int[] ufds){
     if(ufds[u] == -1) return u;
     return (ufds[u] = find(ufds[u],ufds));
}
```

T.C. = `O(n)` each operation (here), `O(lg n)` optimal.

Datastructure: a disjoint-set data structure that keeps track of a set of elements partitioned into a number of disjoint subsets.

```java
// disjoint set datastructure
int[] ufds = new int[V];
Arrays.fill(ufds, -1);
```

### Bitmasking

:::tip[Common tricks]
- Even/odd character counts: keep a mask and XOR; a substring has all-even counts when two prefix masks are equal.
- Enumerate submasks: `for (s = mask; s > 0; s = (s-1) & mask)`.
- Gray code: `G(n) = n ^ (n >> 1)`.
:::

Even odd pattern: if we have a string, we can find whether each character occurs an even or odd number of times.

`String == abca`. First we find the masks for every substring from 0 to i:
- For [0..0] == 0001 (right most bit denotes 'a')
- For [0..1] == 0011
- For [0..2] == 0111
- For [0..3] == 0110

For substring == [2..3] == ca == [0..1] xor [0..3] == 0011^0110 == 0101

Generating all the possible combinations with each set bit as unset and set:

Eg. 1011 -> 1010 -> 1001 -> 1000 -> 0011 -> 0010 -> 0001 -> 0000

Since there are 3 set bits, there are 2x2x2 possibilities.

If initially `bitMask == 1011` and `initialMask = 1011`:

```java
while(bitMask!=0){
    print(bitMask)
    bitMask = (bitMask-1)&initialMask
}
```

### Gray Codes

It is a sequence of numbers such that each consecutive number differs by a single bit. It is cyclic in nature.

If n is the number of terms in the Gray code:
- n = 1: 0, 1
- n = 2: 00, 01, 11, 10
- n = 3: 000, 001, 011, 010, 110, 111, 101, 100

To generate the Nth gray code number: `G(N) = N^(N>>1)`

Working: `N == _____`?011111, then `N+1` == _____?100000.
- `_____?011111`
- `_____?01111`

So, `N^(N>>1) == xxxxxx(?^0)10000` and `(N+1)^((N+1)>>1) == xxxxxx(?^1)10000`. Here, xxxxxx is the result of the XOR before the digit `?`.

### Sieve to generate all primes

:::note
Sieve of Eratosthenes runs in `O(N log log N)`. There are 168 primes up to `1000` and 9592 up to `100000`.
:::

Number of primes from 1 to 100,000 = 9592
Number of primes from 1 to 1000 = 168

```java
public void generatePrimes(){
    int n = (int)1e5; // generate primes till n
    sieve = new boolean[n]; // true => prime
    Arrays.fill(sieve, true);
    for(int i = 2; i*i < n; i++){
        if(!sieve[i])   continue; // not prime
        for(int j = i*i; j < n; j += i){
            sieve[j] = false;
        }
    }
    for(int i = 2; i < n; i++)
        if(sieve[i])
            primes.add(i); // global list
}
```

## PriorityQueue data structure

:::note
Java `PriorityQueue` is a binary min-heap: `offer`/`poll` are `O(log n)`, `peek` is `O(1)`, `remove(Object)` is `O(n)`. For a max-heap pass `Collections.reverseOrder()` or a comparator.
:::

It has 3 useful operations:

- POLL: removes the element with lowest priority
- REMOVE(Obj o): removes the entity "`o`" if present in the heap
- ADD(Obj o): adds a new object to heap.

- there is no support for decrease-key in `O(lgn)`
- decrease-key is done by doing `remove(o)` and then `add(o)` which takes `O(n)`

The comparator class is assigned in constructor:

```java
PriorityQueue<Pair> heap = new PriorityQueue<>(new The_Comparator());
```

Defining the comparator:

```java
class The_Comparator implements Comparator<Pair>{
    @Override
    public int compare(Pair p1, Pair p2) {
        return (p1.d == p2.d)?0:((p1.d>p2.d)?1:-1);
    }
}
```

One liner method:

```java
PriorityQueue<Integer> maxH = new PriorityQueue<>(new Comparator<Integer>(){
    @Override
    public int compare(Integer a,Integer b) {
        return b-a;
    }
});
```

Better one liner:

```java
Queue<int[]> minH = new PriorityQueue<>((a,b) -> a[0]-b[0]);
```

If we wish to have unique elements in the `PriorityQueue`, it can be done without removing the elements in the queue, by just overriding the offer method. BTW: `add()` calls `offer()` internally, so maybe it's even enough to just override the `offer()` method and do the check there.

```java
class Solution extends PriorityQueue<Long> {

    @Override
    public boolean offer(Long e) {
        if (contains(e)) {
            return false;
        } else {
            return super.offer(e);
        }
    }
    public int nthUglyNumber(int n) {
        PriorityQueue<Long> q = new Solution();
        ....
        ....
    }
}
```

## BIT MANIPULATION

:::tip
`x & (x-1)` clears the lowest set bit; `x & -x` isolates it; `1 << k` sets bit `k`.
:::

We can convert given number in any base to any other base by:

```java
String s = Integer.toString(n,3);
```

Here we converted the integer n to base 3, and returned the result as a string. Useful in case of finding powers of 3, like in the above base 3 number system:

- 3^1 = 1
- 3^2 = 10
- 3^3 = 100

Convert string to `Integer`: `Integer.parseInt(String s, int radix)`

## Kth Largest Element in an Array

:::tip[Approaches]
Sort `O(N log N)` · min-heap of size `k` `O(N log k)` · Quickselect average `O(N)` (shuffle to avoid the worst case).
:::

Find the kth largest element in an unsorted array.

```java
public static int findKthLargest(int[] nums, int k) {
    k = nums.length-k;
    int lo = 0;
    int hi = nums.length - 1;
    while (lo < hi) {
        final int j = partition(nums, lo, hi);
        if(j < k) {
            lo = j + 1;
        } else if (j > k) {
            hi = j - 1;
        } else {
            break;
        }
    }
    return nums[k];
}

private static int partition(int[] a, int lo, int hi) {
    int i = lo;
    int j = hi + 1;
    while(true) {
        while(i < hi && (a[++i]< a[lo]));
        while(j > lo && (a[lo] < a[--j]));
        if(i >= j) {
            break;
        }
        swap(a, i, j);
    }
    swap(a, lo, j);
    return j;
}

private static void swap( int[] nums,int i, int j) {
    final int tmp = nums[i];
    nums[i] = nums[j];
    nums[j] = tmp;
}
```

Shuffle to make it `O(N)` guaranteed:

```java
private void shuffle(int a[]) {
    final Random random = new Random();
    for(int ind = 1; ind < a.length; ind++) {
        final int r = random.nextInt(ind + 1);
        exch(a, ind, r);
    }
}
```

Cleaner recursive method:

```java
public int findKthLargest(int[] nums, int k) {
    return quickSelect(nums, 0, nums.length - 1, k);
}

int quickSelect(int[] nums, int low, int high, int k) {
    int pivot = low;
    // use quick sort's idea
    // put nums that are <= pivot to the left
    // put nums that are      > pivot to the right
    for (int j = low; j < high; j++) {
        if (nums[j] <= nums[high]) {
            swap(nums, pivot++, j);
        }
    }
    swap(nums, pivot, high);
    // count the nums that are > pivot from high
    int count = high - pivot + 1;
    // pivot is the one!
    if (count == k) return nums[pivot];
    // pivot is too small, so it must be on the right
    if (count > k) return quickSelect(nums, pivot + 1, high, k);
    // pivot is too big, so it must be on the left
    return quickSelect(nums, low, pivot - 1, k - count);
}
```

## SUFFIX ARRAY

:::note
A suffix array stores the sorted order of all suffixes; it supports pattern search, longest common prefix of suffixes and `k`-th suffix queries.
:::

Reference: https://web.stanford.edu/class/cs97si/suffix-array.pdf

Key words: suffix sorting, suffix arrays, suffix trees

Suffix Array is a special case of a trie. A suffix array is a sorted array of all suffixes of a given string.

Operations done:

1. (Pattern Searching) checking whether a string W is a substring of A. T.C.: `O(|W|)`.
2. searching the longest common prefix for two suffixes of A. `O(n)` using least common ancestor.
3. finding the `k-th` suffix in lexicographic order. `O(n)`

A suffix array can be created by doing the DFS traversal on the trie. Noting that during the depth first search we have to consider the nodes in the ascending lexicographic order of the edges linking them to their father.

abac = A0, ac = A2, bac = A1, c = A3.

We get the array P = (0, 2, 1, 3), this being the suffix array for the string "abac".

A trie is a tree meant to store strings. Each of its nodes will have a number of sons equal to the size of the alphabet used by the strings that are needed to be stored. In our case, with strings containing only small letters of the English alphabet, each node will have at most 26 sons. Every edge going from the father toward its sons is labeled with a different letter of the alphabet. The labels on a path starting from the root and ending in a leaf will form a string stored in that tree.

![Hand-drawn trie of the suffixes of abac with edge labels](/coding-ref/i-065-065.webp)

Trie of the suffixes of "abac" (node 1 is the root):

```text
1
+-a-- 2
|     +-b-- 3
|     |      +-a-- 4
|     |             +-c-- 5
|     +-c-- 6
+-b-- 7
|     +-a-- 8
|            +-c-- 9
+-c-- 10
```

Building Suffix Array:

- Approach 1: `O(n^2 logn)`. Make an array of all suffixes and then sort the array. If we use an `O(n logn)` comparison based sorting algorithm, then the total time to make the suffix array would be `O(n^2 logn)`, because string comparison takes `O(N)` time.
- Approach 2: `O(n logn*logn)`. https://www.hackerearth.com/practice/data-structures/advanced-data-structures/suffix-arrays/tutorial/

## TRIE

:::note
A trie stores strings by shared prefixes; insert/search/startsWith are `O(L)` for word length `L`.
:::

```java
class TrieNode {
    Map<Character, TrieNode> edges;
    boolean isWordEnd;

    TrieNode() {
        this.edges = new HashMap<>();
        this.isWordEnd = false;
    }
}
```

```java
TrieNode root = new TrieNode();
```

```java
public void insert(TrieNode root, String word) {
    TrieNode currentNode = root;
    for (char c : word.toCharArray()) {
        if (!currentNode.edges.containsKey(c)) {
            currentNode.edges.put(c, new TrieNode());
        }
        currentNode = currentNode.edges.get(c);
    }
    currentNode.isWordEnd = true;
}
```

```java
public boolean search(TrieNode root, String word) {
    TrieNode currentNode = root;
    for (char c : word.toCharArray()) {
        if (!currentNode.edges.containsKey(c)) {
            return false;
        }
        currentNode = currentNode.edges.get(c);
    }
    return currentNode.isWordEnd;
}
```

Autocomplete style search over the trie:

```java
class Solution {
    Node trie;
    // other code as per problem
    public List<String>  search(String word){
        char[] s = word.toCharArray();
        int idx = 0;
        Node t = trie;
        while(idx < s.length){
            // word not found
            if(!t.next.containsKey(s[idx]))  return new ArrayList<>();
            t = t.next.get(s[idx]);
            idx++;
        }
        // perform dfs from this node onwards
        List<String> ans = new ArrayList<>();
        ans.addAll(dfs(word, t));

        return ans;
    }
    public List<String> dfs(String prefix, Node t){
        List<String> words = new ArrayList<>();
        if(t.isEnd) words.add(prefix);
        for(int i = 0; i < 26; i++){
            char ch = (char)('a'+i);
            if(t.next.containsKey(ch))
                words.addAll(dfs(prefix+ch, t.next.get(ch)));
        }
        return words;
    }
    public void insert(String word){
        char[] s = word.toCharArray();
        int idx = 0;
        Node t = trie;
        while(idx < s.length && t.next.containsKey(s[idx])){
            t = t.next.get(s[idx]);
            idx++;
        }
        // if remaining word is not present in the trie
        while(idx < s.length){
            t.next.put(s[idx], new Node());
            t = t.next.get(s[idx]);
            idx++;
        }
        // mark the last character as the terminating
        t.isEnd = true;
    }
}

class Node{
    boolean isEnd = false;
    Map<Character, Node> next;
    Node(){
        next = new HashMap<>();
    }
}
```

Sum of prefix scores using a 26-ary trie with a count at each node:

```java
class Trie{
    Trie[] ch = new Trie[26];
    int count = 0;
}

public int[] sumPrefixScores(String[] words) {
    Trie root = new Trie();
    int[] ans = new int[words.length];

    // populating the trie
    for(String word: words){
        Trie trie = root; // reference to the actual root of trie
        for(char c: word.toCharArray()){
            if(trie.ch[c-'a'] == null)
                trie.ch[c-'a'] = new Trie(); // for each character
            // increment times visited this character(c)
            trie.ch[c-'a'].count++;
            // move to the next node
            trie = trie.ch[c-'a'];
        }
    }

    // reading the trie
    for(int i = 0; i < words.length; i++){
        Trie trie = root;
        String word = words[i];
        for(char c: word.toCharArray()){
            ans[i] += trie.ch[c-'a'].count;
            trie = trie.ch[c-'a'];
        }
    }

    return ans;
}
```

## Modulo arithmetic 1000000007

:::caution
With `MOD = 1e9+7`, products overflow `int`; cast to `long` before multiplying and reduce after every operation.
:::

```java
static final int INF = 1000000007;
```

We have stored `INF` into `int` `dType` which can store only upto: `INF`*2. While solving problems we can encounter situations like `INF`*5 this won't fit in an `int` `dType`.

```java
System.out.println(INF*3);
```

- **Output:** `-1294967275`

For such situations we use the long `dType` which is 64 bits. It can even store `INF`*`INF` without overflow.

```java
long n = INF*((long)INF);
System.out.println(n);
```

- **Output:** `1000000014000000049`

### Formulas

1. $(a + b) \bmod m = (a \bmod m + b \bmod m) \bmod m$
2. $(a - b) \bmod m = (a \bmod m - b \bmod m) \bmod m$
3. $(a \cdot b) \bmod m = (a \bmod m \cdot b \bmod m) \bmod m$

Thus, we can take the remainder after every operation and the numbers will never become too large.

### Negative remainders

The remainder of a negative number is either zero or negative.

In JAVA: `-13 % 64 = -13` (on modulus 64)

Java developers chose: the sign of the result equals the sign of the dividend. "Mathematically" both are correct:

- `-13 % 64 = -13` (on modulus 64)
- `-13 % 64 = 51` (on modulus 64)

An easy way to make sure there are no negative remainders is to first calculate the remainder as usual and then add m if the result is negative.

```java
x = x%m;
if (x < 0) x += m;
```

## Counting Sort

:::tip
Use when values lie in a small range `k`: `O(N + k)` time, `O(k)` extra space.
:::

Here, we create a vector list with max value in the array. Each element in the vector list is the index of that element in the original array: arr. If multiple occurrences of the same element is there we append them to the end of the list. For eg. `adj[5]` will represent the element with value 5. And it will store the index of occurrences of 5 in arr. Here the value of `arr[i]` lies in `1 <= arr[i] <= 15`.

```cpp
vector<int> adj[16];
int n = arr.size();

for(int i=0;i<n;i++)
    adj[arr[i]].push_back(i);
```

If we need to treat this as a `LinkedList`, i.e. we could delete the element from the vector list. We create two arrays left and right. The `left[i]` denotes the index of element left to `arr[i]` or index of `arr[i-1]`. Similarly `right[i]` denotes the index of element to the right of `arr[i]` i.e. `arr[i+1]`.

```cpp
int left[n];
for(int i=0;i<n;i++) left[i]=i-1;
right[n];
for(int i=0;i<n;i++) right[i]=i+1;
```

Maintaining these arrays will help us to delete an element from the `adj[ ]`. To delete the element `arr[i]` from adj list:

```cpp
if( left[i] != -1 ) left[ right[i] ] = left[ i ]
if( right[i] != n ) right[ left[i] ] = right[ i ]
```

## BINARY INDEXED TREE / Fenwick Tree

:::note[Fenwick Tree]
Prefix sums with point updates, both in `O(log N)`; `1`-indexed. Move up with `i += i & -i`, down with `i -= i & -i`.
:::

We are given an array `a[]`, and we want to be able to perform two types of operations on it.

- Given an index `x`, find the sum of elements in the array from index 1 to index `x` (inclusive).
- Given an index `x` and a value val, add the value to `arr[x]`.

We maintain an array `BIT[]` such that, at any index we can store the sum of some numbers of the given array. This can also be called a partial sum tree.

Consider the array (note that the array is considered to be 1 based):

![Table of arr and prefix sums sum for indices 1 to 10](/coding-ref/i-071-073.webp)

| index | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `arr[]` | 3 | 0 | 5 | 6 | 1 | 2 | 1 | 3 | 4 | 6 |
| `sum[]` | 3 | 3 | 8 | 14 | 15 | 17 | 18 | 21 | 25 | 31 |

Every index `i` in the `BIT[]` array stores the cumulative sum from the index `i` to `i - (1<<r) + 1` (both inclusive), where r represents the last set bit in the index `i`.

![Table of BIT index ranges and BIT values for indices 1 to 10](/coding-ref/i-071-074.webp)

| index | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| range (stored) | 1 | 1..2 | 3 | 1..4 | 5 | 5..6 | 7 | 1..8 | 9 | 9..10 |
| `BIT[]` | 3 | 3 | 5 | 14 | 1 | 3 | 1 | 21 | 4 | 10 |

![Update-chain diagram linking BIT indices with upward arrows from baseline 0](/coding-ref/i-071-075.webp)

Update-chain diagram (figure): a baseline labeled 0 with dashed guide lines at levels 1 to 10 and upward arrows that link BIT indices. Arrows visible in the figure, read approximately: 0 to 1, 0 to 2, 0 to 4, 0 to 8, 2 to 3, 4 to 5, 4 to 6, 6 to 7, 8 to 9, 8 to 10. Verify exact arrow endpoints against PDF page 71 if they matter.
### x & (-x): last set bit

`x&(-x)` gives the last set bit in a number `x`.

**Proof of last set bit.**
Let's say $x = a1b$ (in binary) is the number whose last set bit we want to isolate.

$$-x = \text{2's complement of } x = (a1b)' + 1 = a'0b' + 1 = a'0(0\ldots0)' + 1 = a'0(1\ldots1) + 1 = a'1(0\ldots0) = a'1b$$

![last set bit isolated: x and -x aligned, AND gives single bit](/coding-ref/i-072-076.webp)

Image (last set bit isolated), page 72:

```
      a1b          <- This is x
  &   a'1b         <- This is -x
  ----------
    = (0...0)1(0...0)   <- This is the last set bit isolated.
```

### Range Sum

If the given input is 5, then `BIT[5]` (iteration 1) + `BIT[4]` (iteration 2) will be returned as the sum.
Or prefix sum till index `idx`. The loop will remove the rightmost set bit until the `idx` doesn't have any more set bits.

```java showLineNumbers mark={8}
int get(int idx)
{
     int sum = 0;
     idx = idx + 1; // if your array is one based then remove this
     while (idx>0)
     {
          sum += BIT[idx]; // add the value
          idx -= idx & (-idx); // remove the last set bit
     }
     return sum;
}
```

### Point Update

Here the `idx` is being updated until the `idx` becomes greater than `N`. The rightmost bit is added.
If we update `idx: 1`, this change will be added to every sub range which includes this `idx: 1`.

```java showLineNumbers mark={5-6}
void update(int idx, int val)
{
    idx = idx + 1; // if your query is one based then remove this
    while (idx <= N){
        BIT[idx] += val;
        idx += idx & (-idx);
    }
}
```

## Trees

### All paths from root to leaves

```java
public void allPaths(TreeNode root,TreeNode parent,List<Integer> p){
   if(root == null)           return;

    p.add(root.val);
    if(root.left == null && root.right == null)
        paths.add((List<Integer>)p.clone());
    prefixTree(root.left,root,p);
    prefixTree(root.right,root,p);
    p.remove(p.size()-1);
}
```

### PreOrder Traversal

```java
public List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode p = root;
    while(!stack.isEmpty() || p != null) {
        if(p != null) {
            stack.push(p);
            result.add(p.val);   // Add before going to children
            p = p.left;
        } else {
            TreeNode node = stack.pop();
            p = node.right;
        }
    }
    return result;
}
```

### Inorder Traversal

```java
public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode p = root;
    while(!stack.isEmpty() || p != null) {
        if(p != null) {
            stack.push(p);
            p = p.left;
        } else {
               TreeNode node = stack.pop();
               result.add(node.val);   // Add after all left children
               p = node.right;
        }
    }
    return result;
}
```

### Postorder Traversal

```java
public List<Integer> postorderTraversal(TreeNode root) {
    LinkedList<Integer> result = new LinkedList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode p = root;
    while(!stack.isEmpty() || p != null) {
        if(p != null) {
               stack.push(p);
               result.addFirst(p.val);   // Reverse the process of preorder
               p = p.right;              // Reverse the process of preorder
        } else {
               TreeNode node = stack.pop();
               p = node.left;            // Reverse the process of preorder
        }
    }
    return result;
}
```

### BST Iterator

Implement an iterator over a binary search tree (BST). Your iterator will be initialized with the root node of a BST.

The first call to `next()` will return the smallest number in BST. Calling `next()` again will return the next smallest number in the BST, and so on.

**Solution:** It is another tricky form of tree traversal especially for BST. The idea is similar to inorder traversal. Here we first put all left most nodes in the stack, (now the top of stack contains the minimum element), before returning this element we add all the left-most nodes of minimum_node.right subtree.

```java
public class Solution {
    Stack<TreeNode> pre;
    public Solution(TreeNode root) {
        TreeNode t = root;
        pre = new Stack<>();
        while(t!=null){
            pre.push(t);
            t = t.left;
        }
    }


    /** @return the next smallest number */
    public int next() {
        TreeNode pop = pre.pop();
        TreeNode t = pop.right;
        while(t!=null){
            pre.push(t);
            t = t.left;
        }
        return pop.val;
    }
}
```

This approach can be used to solve: **2-Sum Binary Tree**.
Given a binary search tree T, where each node contains a positive integer, and an integer K, you have to find whether or not there exist two different nodes A and B such that A.value + B.value = K.

We use two pointer approach when solving this problem for sorted array. Here we can do the similar thing. By making use of two iterators, one of which tracks the minimum element, other tracks the maximum element.

### Lowest Common Ancestor of a Binary Tree
## Lowest Common Ancestor of a Binary Tree

Page 90 (image):

```java
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if(root == null)    return null;
    if(root == p || root == q) return root;
    TreeNode lft = lowestCommonAncestor(root.left,p,q);
    TreeNode rgt = lowestCommonAncestor(root.right,p,q);
    if(lft != null && rgt != null)  return root;
    return (lft != null)?lft:rgt;
}
```

Page 90 (image):

```java
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if(root == null)
        return null;
    int lft = find(root.left,p.val,q.val);
    int rgt = find(root.right,p.val,q.val);
    if(lft == 1 && rgt == 1)
        return root;
    else if(lft == 1 && (root.val == p.val || root.val == q.val))
        return root;
    else if(rgt == 1 && (root.val == p.val || root.val == q.val))
        return root;
    else if(lft == 2)
        return lowestCommonAncestor(root.left,p,q);
    else if(rgt == 2)
        return lowestCommonAncestor(root.right,p,q);
    else return null;
}
public int find(TreeNode root, int p,int q){
    if(root == null)
        return 0;
    if(root.val == p || root.val == q)
        return 1 + find(root.left, p, q) + find(root.right, p, q);
    else
        return find(root.left, p, q) + find(root.right, p, q);
}
```

Page 91 (image):

```java showLineNumbers mark={13}
private boolean recurseTree(TreeNode currentNode, TreeNode p, TreeNode q) {
    // If reached the end of a branch, return false.
    if (currentNode == null)
        return false;

    // Left Recursion. If left recursion returns true, set left = 1 else 0
    int left = recurseTree(currentNode.left, p, q) ? 1 : 0;

    // Right Recursion
    int right = recurseTree(currentNode.right, p, q) ? 1 : 0;

    // If the current node is one of p or q
    int mid = (currentNode == p || currentNode == q) ? 1 : 0;

    // If any two of the flags left, right or mid become True
    if (mid + left + right >= 2)
        ans = currentNode;

    // Return true if any one of the three bool values is True.
    return (mid + left + right > 0);
}
```

Page 92 (image):

```java
public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    Map<TreeNode, TreeNode> parent = new HashMap<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    parent.put(root, null);
    stack.push(root);
// create the parent dictionary
    while (!parent.containsKey(p) || !parent.containsKey(q)) {
        TreeNode node = stack.pop();
        if (node.left != null) {
            parent.put(node.left, node);
            stack.push(node.left);
        }
        if (node.right != null) {
            parent.put(node.right, node);
            stack.push(node.right);
        }
    }
// check for parent having both p and q as childeren
    Set<TreeNode> ancestors = new HashSet<>();
    while (p != null) {
        ancestors.add(p);
        p = parent.get(p);
    }
    while (!ancestors.contains(q))
        q = parent.get(q);
    return q;
}
```

Page 93 (image), alternative approach:

![DFS path approach text](/coding-ref/i-093-088.webp)

Another solution is to run DFS for both p and q values and create paths from root to p and q. These paths can be stored in lists. Since we need lowest common ancestor, we can check from the front for the last such node which is common in both the lists.

Running time:

1. DFS will lead to `O(N)` since this is a binary tree and not a binary search tree.
2. Two DFS operations will lead to `O(N)`

Comparison work of the lists - using a while loop - to find common element will take `O(N)`

3. So total running time - `O(N)`

Space

1. Lists to store paths can lead to `O(N)`

## Binary Search

:::tip[Template]
Keep the invariant `lo <= answer <= hi` and use `mid = lo + (hi - lo) / 2` to avoid overflow. Decide first whether you need the first/last occurrence, floor or ceiling.
:::

### JAVA Binary Search function

If `A[]` is a sorted array, then `Arrays.binarySearch(A, key)` and `Arrays.binarySearch(A,fromIndex,toIndex(exlude),key)` will search the first occurrence of key in the array A, if it is not present then it will return `(-(insertion point) - 1)`.

Insertion point is the index of the first element greater than the key, or `A.length`.

Let `idx = Arrays.binarySearch(A,key)` and `ceil = -1*idx -1`;

Finding the Ceil (`>=` key): `idx = idx>=0?idx: ceil;`

Finding the Floor (`<=` key):

```java
if(ceil == A.length)
    idx = A.length-1;
else
    idx = idx>=0?idx:(A[ceil] > key?ceil-1:ceil);
```

### Simple Binary Search

```java showLineNumbers mark={6,10,12}
int binarySearch(int Arr[], int n, int target) {
   //set starting and ending index
   int start = 0, end = n-1;
    while(start <= end) {
        // take mid of the list
        int mid = (start + end) / 2;
        // we found a match
        if(Arr[mid] == target)    return mid;
        // go on right side
        else if(Arr[mid] < target)     start = mid + 1;
        // go on left side
        else     end = mid - 1;
    }
    // element is not present in list
    return -1;
}
```

Things to Note here:

1. The start pointer will always point to `num >= target`
2. The end pointer will always point to `num <= target`
3. When `start == end` then at this point the target should have been present (if it was absent).
4. Binary search takes ~30 steps to search any number between [1, INTEGER_MAX]

![Binary search steps for key 5 over [1..7]](/coding-ref/i-095-090.webp)

Image (binary search on `key = 5` over `[1, 2, 3, 4, 5, 6, 7]`, page 95): three steps:

- Step 1: start (value 1), middle (value 4), end (value 7). Search 'key' = '5'. As key > `arr[middle]`, therefore start = middle + 1.
- Step 2: remaining window is 5, 6, 7 with start, middle (6), end (7). As key < `arr[middle]`, therefore end = middle - 1.
- Step 3: start, middle, end all point to 5. As key == `arr[middle]`, return middle as the required index.

### Beyond Sorted Array Binary Search

Similar thing can be done with monotonic functions (monotonically increasing or decreasing) as well.

Let's say we have `f(x)` which increases when x increases.

So, given a problem of finding x so that `f(x)` = p, I can do a binary search for x. At any instance,

1. if `f(current_position)` > p, then I will search for values lower than current_position.
2. if `f(current_position)` < p, then I will search for values higher than current_position.
3. if `f(current_position)` = p, then I have found my answer.

### Matrix Median (IB)

Given a matrix of integers A of size N x M in which each row is sorted. Find and return the overall median of the matrix A.

Solution:

We cannot use extra memory, so we can't actually store all elements in an array and sort the array. But since rows are sorted it must be of some use, right?

Note that in a row you can binary search to find how many elements are smaller than a value X in $O(\log M)$. // `M == no`. of columns. This is the base of our solution.

Say k = `N*M`/2. We need to find (`k + 1`)th smallest element. We can use binary search on answer. In $O(N \log M)$, we can count how many elements are smaller than X in the matrix.

So, we use binary search on interval [1, INT_MAX]. So, total complexity is $O(30 \cdot N \log M)$.

### Ceiling and Floor of a number

The ceiling of the 'key' will be the smallest element in the given array greater than or equal to the 'key'.

- **Input:** [1, 3, 8, 10, 15], key = 12
- **Output:** 4
- **Explanation:** The smallest number greater than or equal to '12' is '15' having index '4'.

If we find the 'key', we return its index as the ceiling. If we can't find the 'key', the next big number will be pointed out by the index start.

```java showLineNumbers mark={5,7-8}
// arr is sorted in ascending order
public static int ceiling(int[] arr, int key){
    int l = 0, r = arr.length-1;
    while(l <= r){
         int mid = l + (r-l)/2;
         if(arr[mid] == key)           return mid;
         else if(arr[mid] > key) r = mid - 1;
         else l = mid + 1;
    }
    // we did not found key then we reach this point
    // when l == r then at this point the key should have been present if
A[l] > key this means this the element present is greater than key so we
make r = l-1. This means A[r] <= key and A[l] >= key.
    return l;
}
```

### Next Greater number

Find the smallest letter in the given array greater than a given 'key'. Given array is a circular list.

- **Input:** ['a', 'c', 'f', 'h'], key = 'f'
- **Output:** 'h'
- **Explanation:** The smallest letter greater than 'f' is 'h' in the given array.

1. The array is considered circular, which means if the 'key' is bigger than the last letter of the array or if it is smaller than the first letter of the array, the key's next letter will be the first letter of the array.
2. The other difference is that we have to find the next biggest letter which can't be equal to the 'key'. This means that we will ignore the case where key == `arr[middle]`. To handle this case, we can update our start range to start = middle +1.

```java showLineNumbers mark={6-8}
public int nextGreater(int[] arr, int x){
    if(x > arr[arr.length-1] || x < arr[0])
         return 0;
    int l = 0, r = arr.length-1;
    while(l <= r){
         int mid = l + (r-l)/2;
         if(arr[mid] > x)          r = mid - 1;
         else l = mid + 1;
    }
    return l%arr.length;
}
```

### Bitonic Array Maximum

Find the maximum value in a given Bitonic array. An array is considered bitonic if it is monotonically increasing and then monotonically decreasing (no two consecutive numbers are same).

![Bitonic array example input and output](/coding-ref/i-098-091.webp)

Image (example, page 98):

```
Input: [1, 3, 8, 12, 4, 2]
Output: 12
Explanation: The maximum number in the input bitonic array is '12'.
```

Solution: whenever we calculate the middle, we can compare the numbers pointed out by the index middle and middle+1 to find if we are in the ascending or the descending part.

1. If `arr[middle]` > `arr[middle + 1]`, we are in the second (descending) part of the bitonic array. Therefore, our required number could either be pointed out by middle or will be before middle. This means we will be doing: end = middle.
2. If `arr[middle]` <= `arr[middle + 1]`, we are in the first (ascending) part of the bitonic array. Therefore, the required number will be after middle. This means we will be doing: start = middle + 1.

We can break when `start == end`.

Image (page 98):

```java showLineNumbers mark={4,6,8}
public int find_max_bitonic(int[] arr){
    int l = 0, r = arr.length-1;
    while(l < r){
        int mid = ( l + r )/2;
        if(arr[mid] > arr[mid+1]) // descending
            r = mid;
        else
            l = mid + 1;    // ascending
    }
    return l;
}
```

### Search in Rotated Array

:::note
In each step one half is always sorted; check whether the key lies in the sorted half, otherwise search the other half. `O(log N)`.
:::

Given an array of numbers which is sorted in ascending order and also rotated by some arbitrary number, find if a given 'key' is present in it.

Write a function to return the index of the 'key' in the rotated array. If the 'key' is not present, return -1. You can assume that the given array does not have any duplicates.

Solution:

After calculating the middle, we can compare the numbers at indices start and middle. This will give us two options:

1. If `arr[start]` <= `arr[middle]`, the numbers from start to middle are sorted in ascending order.
2. Else, the numbers from middle+1 to end are sorted in ascending order.

![Rotated array example input and output](/coding-ref/i-099-093.webp)

Image (example, page 99):

```
Input: [4, 5, 7, 9, 10, -1, 2], key = 10
Output: 4
Explanation: '10' is present in the array at index '4'.
```

![Original array and array after 5 rotations](/coding-ref/i-099-094.webp)

Image (page 99): original array `[-1, 2, 4, 5, 7, 9, 10]` and the array after 5 rotations `[4, 5, 7, 9, 10, -1, 2]`.

![Rotated array search walkthrough for key 10](/coding-ref/i-100-095.webp)

Image (search walkthrough for key = 10, page 100):

- Step 1: start, middle (9), end. Since `arr[start]` <= `arr[middle]`, we can conclude that all numbers from start --> middle are sorted in ascending order. By looking at the sorted part, from its start and end, we can conclude that the key can't be in the sorted part, hence start = middle +1.
- Step 2: start, middle (-1), end (2) over `[10, -1, 2]`. Since `arr[start]` > `arr[middle]`, we can conclude that all numbers from middle --> end are sorted in ascending order. By looking at the sorted part, from its start and end, we can conclude that the key can't be in the sorted part, hence end = middle - 1.
- Step 3: start, middle, end all point to 10. We have found the key!

Image (page 101):

```java showLineNumbers mark={4,8,10,14,16}
public int search(int[] nums, int target) {
    int l = 0, r = nums.length-1;
    while(l <= r){
        int mid = (l + r) / 2;
        if(nums[mid] == target) return mid;
        if(nums[l] <= nums[mid]) {// left part is sorted
            if(target >= nums[l] && target < nums[mid])
                r = mid-1;
            else
                l = mid+1;  // go to the right part
        }
        else { // right part is sorted
            if(target > nums[mid] && target <= nums[r])
                l = mid+1;
            else
                r = mid-1;
        }
    }
    return -1;
}
```

### Rotation Count or Find Minimum in Rotated Sorted Array

Given an array of numbers which is sorted in ascending order and is rotated 'k' times around a pivot, find 'k'.

Solution:

An interesting fact about the minimum element is that it is the only element in the given array which is smaller than its previous element.

After calculating the middle, we can compare the number at index middle with its previous and next number. This will give us two options:

1. If `arr[middle]` > `arr[middle + 1]`, then the element at middle + 1 is the smallest.
2. If `arr[middle - 1]` > `arr[middle]`, then the element at middle is the smallest.

To adjust the ranges:

1. If `arr[start]` < `arr[middle]`, the numbers from start to middle are sorted.
2. Else, the numbers from middle to end are sorted.

Image (page 102):

```java showLineNumbers mark={4,11,13}
public int findMin(int[] nums) {
    int l = 0, r = nums.length-1;
    while(l < r){
        int mid = (l+r)/2;
        if(mid > l && nums[mid] < nums[mid-1])
            return mid;
        if(mid < r && nums[mid] > nums[mid+1])
            return nums[mid+1];

        if(nums[mid] > nums[l]) // left is sorted l to mid
            l = mid+1;
        else
            r = mid;
    }
    return 0; // not rotated
}
```

## Two Pointers

:::tip
Two indices moving through a sorted array or a window, giving `O(N)` instead of `O(N^2)`. Sliding window: expand right, shrink left while the window is invalid.
:::

We deal with sorted arrays (or LinkedLists) and need to find a set of elements that fulfill certain constraints.

Q. Given an array of sorted numbers and a target sum, find a pair in the array whose sum is equal to the given target.

- **Input:** [1, 2, 3, 4, 6], target=6
- **Output:** [1, 3]
- **Explanation:** The numbers at index 1 and 3 add up to 6: 2+4=6

Given that the input array is sorted, an efficient way would be to start with one pointer in the beginning and another pointer at the end. At every step, we will see if the numbers pointed by the two pointers add up to the target sum.

If they do not, we will do one of two things:

1. If the sum of the two numbers pointed by the two pointers is greater than the target sum, this means that we need a pair with a smaller sum. So, to try more pairs, we can decrement the end-pointer.
2. If the sum of the two numbers pointed by the two pointers is smaller than the target sum, this means that we need a pair with a larger sum. So, to try more pairs, we can increment the start-pointer.

```java
public int[] TwoSum(int[] A, int target){
    int left = 0, right = A.length-1;
    // as same number cannot be counted twice
    while(left < right){
         int pair = A[left] + A[right];
         if(target == pair)          return new int[]{left,right};
         else if(target > pair)            left++;
         else right++;
    }
    return new int[0]; // not found
}
```

### Longest Substring with Same Letters after Replacement

Given a string with lowercase letters only, if you are allowed to replace no more than 'k' letters with any letter, find the length of the longest substring having the same letters after replacement.

![Longest substring with replacements examples](/coding-ref/i-103-098.webp)

Image (examples, page 103):

```
Input: String="aabccbb", k=2
Output: 5
Explanation: Replace the two 'c' with 'b' to have a longest repeating substring "bbbbb".

Input: String="abbcb", k=1
Output: 4
Explanation: Replace the 'c' with 'b' to have a longest repeating substring "bbbb".
```

Solution: We can use a `HashMap` to count the frequency of each letter. We'll iterate through the string to add one letter at a time in the window. We'll also keep track of the count of the maximum repeating letter in any window (let's call it `maxRepeatLetterCount`). So at any time, we know that we can have a window which has one letter repeating `maxRepeatLetterCount` times, this means we should try to replace the remaining letters. If we have more than 'k' remaining letters, we should shrink the window as we are not allowed to replace more than 'k' letters.

Image (page 104):

```java
public static int findLength(String s, int k){
    int windowStart = 0, maxLength = 0, maxRepeatingLetterCount = 0;
    int[] map = new int[26]; // frequency table
    char[] str = s.toCharArray();
    for(int windowEnd = 0; windowEnd < str.length; windowEnd++){
        map[str[windowEnd]-'a']++;
        maxRepeatingLetterCount = Math.max(maxRepeatingLetterCount, map[str[windowEnd]-'a']);
        // if the no of different characters are greater than k
        if(windowEnd-windowStart+1 - maxRepeatingLetterCount > k)
            windowStart++;
        maxLength = Math.max(maxLength, windowEnd-windowStart+1);
    }
    return maxLength;
}
```

## String

### KMP algorithm

:::note
Build the `lps` (longest proper prefix that is also a suffix) array in `O(M)`, then search the text in `O(N)` without re-reading characters.
:::

https://www.youtube.com/watch?v=BXCEFAzhxGY B2B swe

We make a prefix suffix array (or longest proper prefix which is also suffix, lps array). Of which each "`i`"th element tells the end position of longest prefix that matches the suffix (which is the "`i`"th element) in the substring starting with 0th index and ending at index `i`.

Eg.: d s g w a d s g z (in this example the ith element tells the end position of longest prefix + 1)

![LPS example for dsgwadsgz](/coding-ref/i-104-100.webp)

Image (page 104, lps example for `d s g w a d s g z`):

```
idx:  0  1  2  3  4  5  6  7  8
Eg.:  d  s  g  w  a  d  s  g  z
lps:  0  0  0  0  0  1  2  3  0
```

Image (page 105, lps example for `A A C E C A A A A $ A A A A C E C A A`):

```
idx : 0     1   2   3   4   5   6   7   8   9 10 11 12 13 14 15 16 17 18
Eg. : A     A   C   E   C   A   A   A   A   $   A   A   A   A   C   E   C   A   A
lps :{0, 1, 0, 0, 0, 1, 2, 2, 2, 0, 1, 2, 2, 2, 3, 4, 5, 6, 7}
```

With comments:

```java
public static int[] getlps(String str){
    int l = 0, lps[] = new int[str.length()], n = str.length();
    char[] S = str.toCharArray();
    // the first term always has prefix == suffix == 0
    for(int r = 1; r < n; r++){
        // if a prefix == suffix found
        if(S[l] == S[r])
                lps[r] = ++l;
    // if the current_prefix != suffix and the l has elements to it's left
        // remember : dsgwadsgz
        else if(l != 0){
                // lps[l-1] gives me previous (longest prefix for 0 to l-1) + 1
                l = lps[l-1];
                // we check, if any previous prefix that matches current suffix
                // so we don't need to increment r in next iteration
                r--;
        }
            // we have l == 0 and s[l] != s[r] we cannot go back to make the
prefix == suffix
        else lps[r] = 0;
    }
    System.out.println(Arrays.toString(lps));
    return lps;
}
```

Without comments:

```java
public static int[] getlps(String str){
    int l = 0, lps[] = new int[str.length()], n = str.length();
    char[] S = str.toCharArray();
    for(int r = 1; r < n; r++){
        if(S[l] == S[r])
                lps[r] = ++l;
        else if(l != 0){
              l = lps[l-1];
              r--;
         }
         else lps[r] = 0;
    }
    return lps;
}
```

## Tricky / Important problems

:::info
These are frequently asked LeetCode patterns: multi-source BFS, union-find on coordinates, sliding window, intervals, cyclic sort, tree DFS with prefix sums, backtracking and DP.
:::

### 542. 01 Matrix

:::tip[Multi-source BFS]
Start the BFS from all `0` cells at once; the first time a `1` cell is reached gives its shortest distance. `O(R·C)`.
:::

Given a matrix consists of 0 and 1, find the distance of the nearest 0 for each cell. The distance between two adjacent cells is 1.

![01 Matrix example input and output](/coding-ref/i-106-101.webp)

Image (example, page 106):

```
Input:
[[0,0,0],
 [0,1,0],
 [1,1,1]]

Output:
[[0,0,0],
 [0,1,0],
 [1,2,1]]
```

Using BFS

Image (BFS solution, page 107):

```java showLineNumbers mark={9,25}
public int[][] updateMatrix(int[][] matrix) {
    if(matrix.length == 0)
      return matrix;
    int m = matrix.length, n = matrix[0].length;
    Queue<int[]> q = new LinkedList<>();
    for(int i = 0; i < m; i++)
        for(int j = 0; j < n; j++){
            if(matrix[i][j] == 0)
                q.add(new int[]{i,j});
            else matrix[i][j] = Integer.MAX_VALUE;
        }
    while(!q.isEmpty()){
        int size = q.size();
        for(int i = 0; i < size; i++){
            int[] coord = q.poll();
            int[][] directions = {
                {-1,0},{1,0},{0,-1},{0,1}
            };
            for(int[] dir: directions){
                int x = coord[0] + dir[0], y = coord[1] + dir[1];
                if(x < 0 || y < 0 || x >= m || y >= n)
                  continue;
                if(matrix[x][y] > matrix[coord[0]][coord[1]]+1){
                    matrix[x][y] = matrix[coord[0]][coord[1]]+1;
                    q.add(new int[]{x,y});
                }
            }
        }
    }
    return matrix;
}
```

Using DP

(Page 107 shows only the heading "Using DP"; no DP content or image is present in the source chunk for this page.)
## 417. Pacific Atlantic Water Flow

Given an m x n matrix of non-negative integers representing the height of each unit cell in a continent.

The "Pacific ocean" touches the left and top edges of the matrix and the "Atlantic ocean" touches the right and bottom edges.

Water can only flow in four directions (up, down, left, or right) from a cell to another one with height equal or lower.

Find the list of grid coordinates from where water can flow to both the Pacific and Atlantic ocean.

### Code (image on p.108, no caption in the PDF; appears to be the 01 Matrix solution)

```java
public int[][] updateMatrix(int[][] matrix) {
    if(matrix.length == 0)  return matrix;
    int m = matrix.length, n = matrix[0].length, max_distance = m*n;
    int[][] distance = new int[m][n];
    // first check all paths from up and left
    for(int i = 0; i < m; i++)
        for(int j = 0; j < n; j++){
            if(matrix[i][j] == 0)
                distance[i][j] = 0;
            else {
                int up = (i > 0)?distance[i-1][j]: max_distance;
                int left = (j > 0)?distance[i][j-1]: max_distance;
                distance[i][j] = 1 + Math.min(up,left);
            }
        }
    // then check all paths from down and right
    for(int i = m-1; i >= 0; i--)
        for(int j = n-1; j >= 0; j--){
            if(matrix[i][j] == 0)
                distance[i][j] = 0;
            else {
                int down = (i < m-1)?distance[i+1][j]: max_distance;
                int right = (j < n-1)?distance[i][j+1]: max_distance;
                distance[i][j] = Math.min(distance[i][j], 1 + Math.min(down,right));
            }
        }
    // we can also use the same matrix
    return distance;
}
```

## 417. Pacific Atlantic Water Flow (solution)

### Grid example

![Pacific Atlantic grid example with reachable cells marked](/coding-ref/i-109-105.webp)

Heights matrix; cells in parentheses are the positions that can reach both oceans. `*` marks the Atlantic/Pacific border side indicators as in the figure:

```text
Pacific ~   ~   ~   ~   ~
        ~  1   2   2   3  (5) *
        ~  3   2   3  (4) (4) *
        ~  2   4  (5)  3   1  *
        ~ (6) (7)  1   4   5  *
        ~ (5)  1   1   2   4  *
           *   *   *   *   *
```

- **Output:** `[[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]` (positions with parentheses in above matrix).

### Code

```java
public List<List<Integer>> pacificAtlantic(int[][] matrix) {
    List<List<Integer>> ans = new ArrayList<>();
    if(matrix.length == 0)  return ans;
    int m = matrix.length, n = matrix[0].length;
    int[][] visited = new int[m][n];
    // pacific -> 1, atlantic -> 2, both -> 3
    for(int i = 0; i < m; i++) // leftCol is connected to pacific
        ff(i,0,1,visited,matrix);
    for(int i = 0; i < n; i++) // topRow is connected to pacific
        ff(0,i,1,visited,matrix);
    for(int i = 0; i < m; i++) // rgtCol is connected to atlantic
        ff(i,n-1,2,visited,matrix);
    for(int i = 0; i < n; i++) // bottomRow is conn. to atlantic
        ff(m-1,i,2,visited,matrix);

    for(int i = 0; i < m; i++)
        for(int j = 0; j < n; j++)
            if(visited[i][j] == 3)
                ans.add(Arrays.asList(i,j));

    return ans;
}

public void ff(int i,int j,int color,int[][] visited,int[][] matrix){
    if(i < 0 || j < 0 || i >= matrix.length || j >= matrix[0].length)  return;
    if(visited[i][j] >= color)  return;
    visited[i][j] += color;
    int[][] directions = {
        {-1,0}, {1,0}, {0,-1}, {0,1}
    };
    for(int[] dir: directions){
        int x = dir[0] + i, y = dir[1] + j;
        if(x < 0 || y < 0 || x >= matrix.length || y >= matrix[0].length)  continue;
        if(matrix[x][y] >= matrix[i][j])
            ff(x,y,color,visited,matrix);
    }
}
```

## 947. Most Stones Removed with Same Row or Column

:::tip[Pattern]
Treat each row and column as a node and each stone as an edge. Answer = stones − number of connected components (union-find).
:::

On a 2D plane, we place stones at some integer coordinate points. Each coordinate point may have at most one stone.

Now, a move consists of removing a stone that shares a column or row with another stone on the grid.

What is the largest possible number of moves we can make?

### Examples

![Most Stones Removed examples](/coding-ref/i-110-107.webp)

```text
Input: stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]
Output: 5

Input: stones = [[0,0],[0,2],[1,1],[2,0],[2,2]]
Output: 3
```

### Solution

First build the graph by connecting stones in same row/col, then we can reduce all the stones in a connected component to 1 stone.

### Code

```java showLineNumbers mark={19,24-25,30}
static int[] nodes; // nodes[i] is no. of nodes in connected component with root "i"
public int removeStones(int[][] stones) {
    if(stones.length == 0)  return 0;
    int[] ufds = new int[stones.length];
    nodes = new int[stones.length];
    Arrays.fill(nodes,1);   // all components will have a single nodes
    Arrays.fill(ufds,-1);
    int ans = 0;

    for(int i = 0; i < stones.length; i++)
        for(int j = i+1; j < stones.length; j++){
            if(find(i,ufds) == find(j,ufds))    continue;
            if(stones[i][0] == stones[j][0] || stones[i][1] == stones[j][1]){
                union(i,j,ufds);
            }
        }
    // for each connected component get the no. of nodes
    for(int i = 0; i < stones.length; i++)
        if(ufds[i] == -1)
            ans += nodes[i]-1;
    return ans;
}
public int find(int x,int[] ufds){
    if(ufds[x] == -1)   return x;
    return ufds[x] = find(ufds[x],ufds);
}
public void union(int u,int v,int[] ufds){
    // increase the connected nodes of component with root v
    nodes[find(v,ufds)] += nodes[find(u,ufds)];
    ufds[find(u,ufds)] = find(v,ufds);
}
```

## 1423. Maximum Points You Can Obtain from Cards

:::tip[Pattern]
Taking `k` cards from the ends means leaving a contiguous window of `n-k` cards. Minimise the window sum with a sliding window: `O(N)`.
:::

There are several cards arranged in a row, and each card has an associated number of points. The points are given in the integer array `cardPoints`.

In one step, you can take one card from the beginning or from the end of the row. You have to take exactly k cards.

Your score is the sum of the points of the cards you have taken.

Given the integer array `cardPoints` and the integer `k`, return the maximum score you can obtain.

### Examples

![Maximum Points You Can Obtain from Cards examples](/coding-ref/i-112-109.webp)

```text
Input: cardPoints = [1,2,3,4,5,6,1], k = 3
Output: 12

Input: cardPoints = [2,2,2], k = 2
Output: 4
Explanation: Regardless of which two cards you take, your score will always be 4.

Input: cardPoints = [9,7,7,9,7,7,9], k = 7
Output: 55
Explanation: You have to take all the cards. Your score is the sum of points of all cards.
```

### Sliding window+DP

### Code

```java showLineNumbers mark={4,7-8}
public int maxScore(int[] cards, int k) {
    int[] dp = new int[k+1];
    int ans = 0;
    for(int i = cards.length-1; i>=cards.length-k; i--)  dp[0] += cards[i];
    ans = dp[0];
    for(int i = 1; i <= k; i++){
        dp[i] = dp[i-1] + cards[i-1] - cards[cards.length-k+i-1];
        ans = Math.max(ans,dp[i]);
    }
    return ans;
}
```

### Diagram (sliding window over an 9-card array, indices 0-8)

![Sliding window DP diagram over cards array](/coding-ref/i-112-111.webp)

```text
i=0: dp[0] = 1+7+10+11 (window_sum = 1+7+10+11, the last 4 cards = indices 5..8)
     indices: 0 1 2 3 4 | 5 6 7 8   (window = 5..8)

i=1: dp[1] = (left == 1) + (right == 7+10+11)
     => dp[1] = dp[0] + card[0] - card[5]
     window = 0 | 6 7 8

i=2: dp[2] = dp[1] + card[1] - card[6]
     window = 0 1 | 7 8
```

## 1452. People Whose List of Favorite Companies Is Not a Subset of Another List

Given the array `favoriteCompanies` where `favoriteCompanies[i]` is the list of favorites companies for the ith person (indexed from 0).

Return the indices of people whose list of favorite companies is not a subset of any other list of favorites companies. You must return the indices in increasing order.

*UNION FIND*

### Example

![Favorite companies example](/coding-ref/i-113-112.webp)

```text
Input: favoriteCompanies = [["leetcode","google","facebook"],["google","microsoft"],
["google","facebook"],["google"],["amazon"]]
Output: [0,1,4]
Explanation:
Person with index=2 has favoriteCompanies[2]=["google","facebook"] which is a subset of
favoriteCompanies[0]=["leetcode","google","facebook"] corresponding to the person with index 0.
Person with index=3 has favoriteCompanies[3]=["google"] which is a subset of favoriteCompanies[0]=
["leetcode","google","facebook"] and favoriteCompanies[1]=["google","microsoft"].
Other lists of favorite companies are not a subset of another list, therefore, the answer is
[0,1,4].
```

### Code

```java showLineNumbers mark={13-14,18,23}
static int[] ufds;
public List<Integer> peopleIndexes(List<List<String>> fc) {
    Set<String>[] ps = new Set[fc.size()];
    for(int i = 0; i < ps.length; i++)
        ps[i] = new HashSet<>(fc.get(i));
    // ufds[i] stores the subset number which stores all the nodes
    ufds = new int[ps.length];
    Arrays.fill(ufds,-1);

    for(int i = 0; i < ps.length; i++)
        for(int j = i+1; j < ps.length; j++){
            if(find(i) == find(j))  continue;
            else if(contains(ps[find(i)],ps[find(j)]))  ufds[find(j)] = find(i);
            else if(contains(ps[find(j)],ps[find(i)]))  ufds[find(i)] = find(j);
        }
    List<Integer> ans = new ArrayList<>();
    for(int i = 0; i < ps.length; i++)
        if(ufds[i] == -1)
            ans.add(i);
    return ans;
}
public int find(int x){
    if(ufds[x] == -1)   return x;
    return find(ufds[x]);
}
// Using Set will lead to : containsAll() will be O(n)
public boolean contains(Set<String> a,Set<String> b){
    if(a.size()<=b.size())  return false;
    return a.containsAll(b);
}
```

### Typical union-find

![Typical union-find graph example](/coding-ref/i-115-114.webp)

For example:

```text
favoriteCompanies = [["leetcode","google","facebook"],["google","microsoft"],
["google","facebook"],["google"],["amazon"]]
```

It is actually a graph:

```text
    {lgf}     {gm}     {a}
      |
     {gf}
      |
     {g}
```

With path compression, the root of each node can be found faster:

```text
    {lgf}     {gm}     {a}
    /   \
 {gf}   {g}
```

In the end, we just need to return the index of the three roots of the graph.

## 115. Start of LinkedList Cycle (medium)

:::tip
Floyd's tortoise and hare: when slow and fast meet, restart one pointer from the head; they meet again at the cycle start. `O(N)` time, `O(1)` space.
:::

Given the head of a Singly `LinkedList` that contains a cycle, write a function to find the starting node of the cycle.

### Solution

1. Find the cycle length (by using slow/fast pointer) == c
2. Find the first meeting point of the slow/fast pointers, then distance travelled by fast, df = 2 * ds (distance travelled by slow). So we can find the no. of nodes before the start of cycle => df = `a + c` => a = `c - 2`*ds.
3. Move a pointer from start to cover `a+1` distance.

### Diagram

![Linked list cycle start detection diagram](/coding-ref/i-115-115.webp)

Linked list 1 -> 2 -> 3 -> 4 -> 5 -> 6, where node 6 links back to node 3 (cycle). Pointer1 and pointer2 start at node 1; the slow pointer (pointer1) and fast pointer (pointer2) meet at node 4 with `dF = 2ds` annotated. Bracket `a` spans nodes 1-2 (before the cycle); bracket `c` spans nodes 3-6 (the cycle). Footer: `df = 2ds && df = a + c`, `c -> cycle length`.

## 116. Happy Number (medium)

:::tip
The digit-square-sum sequence either reaches `1` or enters a cycle; detect it with fast/slow pointers.
:::

Any number will be called a happy number if, after repeatedly replacing it with a number equal to the sum of the square of all of its digits, leads us to number `1`. All other (not-happy) numbers will never reach `1`. Instead, they will be stuck in a cycle of numbers which does not include `1`.

### Example

![Happy number example](/coding-ref/i-116-116.webp)

```text
Input: 23
Output: true (23 is a happy number)
Explanations: Here are the steps to find out that 23 is a happy number:
1. 2^2 + 3^2 = 4 + 9 = 13
2. 1^2 + 3^2 = 1 + 9 = 10
3. 1^2 + 0^2 = 1 + 0 = 1
```

### Code

```java
public boolean isHappyNumber(int num){
    int slow = num, fast = num;
    do{
        slow = digitSquareSum(num);
        fast = digitSquareSum(digitSquareSum(num));
    } while(slow != fast);
    return slow == 1;
}
```

TC: `O(logN)`

## Palindrome LinkedList

Given the head of a Singly `LinkedList`, write a method to check if the `LinkedList` is a palindrome or not.

As we know, a palindrome `LinkedList` will have nodes values that read the same backward or forward. This means that if we divide the `LinkedList` into two halves, the node values of the first half in the forward direction should be similar to the node values of the second half in the backward direction. As we have been given a Singly `LinkedList`, we can't move in the backward direction.

1. We can use the Fast & Slow pointers method similar to Middle of the `LinkedList` to find the middle node of the `LinkedList`.
2. Once we have the middle of the `LinkedList`, we will reverse the second half.
3. Then, we will compare the first half with the reversed second half to see if the `LinkedList` represents a palindrome.
4. Finally, we will reverse the second half of the `LinkedList` again to revert and bring the `LinkedList` back to its original form.

## 56. Merge Intervals

:::tip[Pattern]
Sort by start, then merge while `next.start <= current.end`. `O(N log N)`.
:::

Given a list of intervals, merge all the overlapping intervals to produce a list that has only mutually exclusive intervals.

### Example

![Merge intervals example](/coding-ref/i-117-118.webp)

```text
Intervals: [[1,4], [2,5], [7,9]]
Output: [[1,5], [7,9]]
Explanation: Since the first two intervals [1,4] and [2,5] overlap, we merged them into one [1,5].
```

### Diagram

![Merge intervals diagram](/coding-ref/i-117-119.webp)

Number line 1..10. Bars: `1-4` (orange) and `2-5` (blue) are marked "Overlapping intervals" by arrows; `7-9` (grey-green) is standalone. Below, "After merging" (arrow): `1-5` (green) and `7-9` (grey-green).

### Solution

![Merge intervals solution steps](/coding-ref/i-118-120.webp)

1. Sort the intervals on the start time to ensure `a.start <= b.start`
2. If `a` overlaps `b` (i.e. `b.start <= a.end`), we need to merge them into a new interval `c` such that:

```text
c.start = a.start
c.end = max(a.end, b.end)
```

3. We will keep repeating the above two steps to merge `c` with the next interval if it overlaps with `c`.

### Code

```java
public int[][] merge(int[][] intervals) {
    if(intervals.length == 0)   return new int[0][0];
    Arrays.sort(intervals, new Comparator<int[]>(){
        @Override
        public int compare(int[] a,int[] b){
            return a[0]-b[0];
        }
    });
    // initialize start and end
    int len = intervals.length, start = intervals[0][0], end = intervals[0][1];
    // will hold final ans
    List<int[]> mergeIntervals = new ArrayList<>();
    for(int i = 1; i < len; i++){
        // if current interval start[0] is <= previous end
        if(intervals[i][0] <= end)
            end = Math.max(intervals[i][1], end);
        else {
            mergeIntervals.add(new int[]{start,end});
            start = intervals[i][0];
            end = intervals[i][1];
        }
    }
    mergeIntervals.add(new int[]{start,end});

    return mergeIntervals.toArray(new int[mergeIntervals.size()][]);
}
```

## Minimum Meeting Rooms

:::tip[Pattern]
Sort by start and keep a min-heap of end times; the heap size at the end (peak) is the number of rooms. `O(N log N)`.
:::

Given a list of intervals representing the start and end time of `N` meetings, find the minimum number of rooms required to hold all the meetings.

### Examples

![Minimum meeting rooms example 1](/coding-ref/i-119-122.webp)

![Minimum meeting rooms example 2](/coding-ref/i-119-123.webp)

```text
Meetings: [[1,4], [2,5], [7,9]]
Output: 2
Explanation: Since [1,4] and [2,5] overlap, we need two rooms to hold these two meetings. [7,9] can
occur in any of the two rooms later.

Meetings: [[6,7], [2,4], [8,12]]
Output: 1
Explanation: None of the meetings overlap, therefore we only need one room to hold all meetings.
```

### Timeline diagram

![Minimum meeting rooms timeline diagram](/coding-ref/i-119-124.webp)

Number line 1..7 with meetings: `4-5` (grey), `2-3` (orange), `2-4` (blue), `3-5` (green).

### Solution

1. Sort all the meetings on their start time.
2. Create a min-heap to store all the active meetings. This min-heap will also be used to find the active meeting with the smallest end time.
3. Iterate through all the meetings one by one to add them in the min-heap. Let's say we are trying to schedule the meeting m1.
4. Since the min-heap contains all the active meetings, so before scheduling m1 we can remove all meetings from the heap that have ended before m1, i.e., remove all meetings from the heap that have an end time smaller than or equal to the start time of m1.
5. Now add m1 to the heap.
6. The heap will always have all the overlapping meetings, so we will need rooms for all of them. Keep a counter to remember the maximum size of the heap at any time which will be the minimum number of rooms needed.

### Code

```java
public static int findMinimumMeetingRooms(List<Meeting> meetings) {
    if (meetings == null || meetings.size() == 0)
        return 0;

    // sort the meetings by start time
    Collections.sort(meetings, (a, b) -> Integer.compare(a.start, b.start));

    int minRooms = 0;
    PriorityQueue<Meeting> minHeap =
        new PriorityQueue<>(meetings.size(), (a, b) -> Integer.compare(a.end, b.end));
    for (Meeting meeting : meetings) {
        // remove all meetings that have ended
        while (!minHeap.isEmpty() && meeting.start >= minHeap.peek().end)
            minHeap.poll();
        // add the current meeting into the minHeap
        minHeap.offer(meeting);
        // all active meeting are in the minHeap, so we need rooms for all of them.
        minRooms = Math.max(minRooms, minHeap.size());
    }
    return minRooms;
}
```

## Cyclic Sort

:::tip
For values in `1..n`, put each number at index `value-1` by swapping. `O(N)` time, `O(1)` space.
:::

We are given an array containing `n` objects. Each object, when created, was assigned a unique number from 1 to `n` based on their creation sequence.

Write a function to sort the objects in-place on their creation sequence number in `O(n)` and without any extra space.

### Examples

![Cyclic sort example 1](/coding-ref/i-120-126.webp)

![Cyclic sort example 2](/coding-ref/i-120-127.webp)

```text
Input: [3, 1, 5, 4, 2]
Output: [1, 2, 3, 4, 5]

Input: [2, 6, 4, 3, 1, 5]
Output: [1, 2, 3, 4, 5, 6]
```

### Solution

We iterate the array one number at a time, and if the current number we are iterating is not at the correct index, we swap it with the number at its correct index. This way we will go through all numbers and place them in their correct indices, hence, sorting the whole array.

### Code

```java
public void cyclic_sort(int[] arr){
    int idx = 0;
    while(idx < arr.length){
        if(idx == arr[idx]-1)   // 1 indexed
            idx++;
        else
            swap(idx,arr[idx]-1);
    }
}
```

## Find the Smallest Missing Positive Number

:::tip
Cyclic sort first, then the first index `i` with `nums[i] != i+1` gives the answer `i+1`.
:::

Given an unsorted array containing numbers, find the smallest missing positive number in it. In this problem, the numbers are not bound by any range so we can have any number in the input array.

### Example

![Smallest missing positive number example](/coding-ref/i-121-129.webp)

```text
Input: [-3, 1, 5, 4, 2]
Output: 3
Explanation: The smallest missing positive number is '3'
```

### Solution

We place the numbers on their correct indices and ignore all numbers that are out of the range of the array. Once we are done with the cyclic sort we will iterate the array and the first index that does not have the correct number will be the smallest missing positive number!

### Code

```java
public void min_positive(int[] arr){ // 0 or 1 indexed
    int idx = 0;
    while(idx < arr.length && ){
        if( arr[idx] > 0 && arr[idx] <= arr.length && arr[idx]-1 != idx)
            swap(idx,arr[idx]-1);
        else
            idx++;
    }
    for(int i = 0; i < arr.length; i++){
        if(arr[i] != i+1)
            return i+1;
    }
    return nums.length+1;
}
```

## 437. Path Sum III

:::tip[Pattern]
Prefix sums on a root-to-node path with a `HashMap`: count how many earlier prefix sums equal `current - target`; undo the count when backtracking.
:::

You are given a binary tree in which each node contains an integer value.

Find the number of paths that sum to a given value.

The path does not need to start or end at the root or a leaf, but it must go downwards (traveling only from parent nodes to child nodes).

## 437. Path Sum III (Count Paths for a Sum)

Given a binary tree and a number `S`, find all paths in the tree such that the sum of all the node values of each path equals `S`. Please note that the paths can start or end at any node but all paths must follow direction from parent to child (top to bottom).

### Solution 1

We can follow the same DFS approach. But there will be four differences:

1. We will keep track of the current path in a list which will be passed to every recursive call.
2. Whenever we traverse a node we will do two things:
   - Add the current node to the current path.
   - As we added a new node to the current path, we should find the sums of all sub-paths ending at the current node. If the sum of any sub-path is equal to `S` we will increment our path count.
3. We will traverse all paths and will not stop processing after finding the first path.
4. Remove the current node from the current path before returning from the function. This is needed to Backtrack while we are going up the recursive call stack to process other paths.

```java
private static int countPathsRecursive(TreeNode currentNode, int S, List<Integer> currentPath) {
    if (currentNode == null)
        return 0;

    // add the current node to the path
    currentPath.add(currentNode.val);
    int pathCount = 0, pathSum = 0;
    // find the sums of all sub-paths in the current path list
    ListIterator<Integer> pathIterator = currentPath.listIterator(currentPath.size());
    while (pathIterator.hasPrevious()) {
        pathSum += pathIterator.previous();
        // if the sum of any sub-path is equal to 'S' we increment our path count.
        if (pathSum == S) {
            pathCount++;
        }
    }

    // traverse the left sub-tree
    pathCount += countPathsRecursive(currentNode.left, S, currentPath);
    // traverse the right sub-tree
    pathCount += countPathsRecursive(currentNode.right, S, currentPath);

    // remove the current node from the path to backtrack,
    // we need to remove the current node while we are going up the recursive call stack.
    currentPath.remove(currentPath.size() - 1);

    return pathCount;
}
```

T.C: `O(N^2)`, S.C.: `O(N)`

### Solution 2 (hashMap)

We can use the `hashMap` for remembering the sum values along a path.

```java showLineNumbers mark={8,22,27}
static int count,target;
static Map<Integer,Integer> map;
public int pathSum(TreeNode root, int sum) {
    if(root==null)  return 0;
    map = new HashMap<>();
    count = 0;
    target = sum;
    map.put(0,1);
    prefixTree(root,null);

    // System.out.println(map);

    return count;
}
public void prefixTree(TreeNode root,TreeNode parent){
    if(root == null)    return;

    if(parent != null)  root.val += parent.val;

    count += map.getOrDefault(root.val - target,0);

    map.put(root.val,1 + map.getOrDefault(root.val,0));

    prefixTree(root.left,root);
    prefixTree(root.right,root);

    map.put(root.val, map.get(root.val) - 1);
}
```
```java showLineNumbers mark={8,13}
public void prefixTree(TreeNode root,TreeNode parent){
    if(root == null)    return;

    if(parent != null)  root.val += parent.val;

    count += map.getOrDefault(root.val - target,0);

    map.put(root.val,1 + map.getOrDefault(root.val,0));

    prefixTree(root.left,root);
    prefixTree(root.right,root);

    map.put(root.val, map.get(root.val) - 1);
}
```

T.C. : `O(N)`

## Tree Diameter

:::note
Diameter = max over nodes of (left height + right height). Compute heights in one DFS and track the best sum. `O(N)`.
:::

Given a binary tree, find the length of its diameter. The diameter of a tree is the number of nodes on the longest path between any two leaf nodes. The diameter of a tree may or may not pass through the root.

![Tree for Example 2 diameter](/coding-ref/i-125-134.webp)

**Example 2:**

- **Output:** 7

Explaination: The diameter of the tree is: [10, 8, 5, 3, 6, 9, 11]

Tree for Example 2 (edges point parent to child):

```text
1
├── 2
└── 3
    ├── 5
    │   ├── 7
    │   └── 8
    │       └── 10
    └── 6
        └── 9
            └── 11
```

### Solution

We can follow the same DFS approach. There will be a few differences:

1. At every step, we need to find the height of both children of the current node. For this, we will make two recursive calls similar to DFS.
2. The height of the current node will be equal to the maximum of the heights of its left or right children, plus '1' for the current node.
3. The tree diameter at the current node will be equal to the height of the left child plus the height of the right child plus '1' for the current node: diameter = `leftTreeHeight` + `rightTreeHeight` + 1. To find the overall tree diameter, we will use a class level variable. This variable will store the maximum diameter of all the nodes visited so far, hence, eventually, it will have the final tree diameter.

```java
public int diameterOfBinaryTree(TreeNode root) {
    if(root == null)    return 0;
    int l = 0, r = 0;
    if(root.left != null) l = deepest(root.left) + 1;
    if(root.right != null) r = deepest(root.right) + 1;
    return max(diameterOfBinaryTree(root.left), diameterOfBinaryTree(root.right), l+r);
}
public int max(int a,int b,int c) {
    return a > b? (a > c? a: c): (b > c? b: c);
}
private int deepest(TreeNode root) {
    if(root.left == null && root.right == null)    return 0;
    int n1 = 0, n2 = 0;
    if(root.left != null )  n1 = deepest(root.left)+1;
    if(root.right != null)  n2 = deepest(root.right)+1;
    return Math.max(n1,n2);
}
```

We can do it in single recursion:

```java
static int diameter;
public int diameterOfBinaryTree(TreeNode root) {
    diameter = 0;
    getDepth(root);
    return diameter == 0?0:diameter-1;
}
public int getDepth(TreeNode root){
    if(root == null)    return 0;
    int lftDepth = getDepth(root.left);
    int rgtDepth = getDepth(root.right);

    diameter = Math.max(diameter,1 +lftDepth +rgtDepth );

    return 1 + Math.max(lftDepth,rgtDepth);
}
```

## 295. Find Median from Data Stream

:::tip[Two heaps]
Max-heap for the lower half, min-heap for the upper half; keep sizes within 1. Median is the top(s). `O(log N)` add, `O(1)` median.
:::

Design a class to calculate the median of a number stream. The class should have the following two methods:

1. `insertNum(int num)`: stores the number in the class
2. `findMedian()`: returns the median of all numbers inserted in the class

If the count of numbers inserted in the class is even, the median will be the average of the middle two numbers.

Example:

![insertNum and findMedian example](/coding-ref/i-127-137.webp)

```text
1. insertNum(3)
2. insertNum(1)
3. findMedian() -> output: 2
4. insertNum(5)
5. findMedian() -> output: 3
6. insertNum(4)
7. findMedian() -> output: 3.5
```

### Solution

We can use two heaps `maxHeap` (stores smaller nos.) and `minHeap` (stores larger nos.). We will make sure that always size(`maxHeap`) >= size(`minHeap`). So if size(`maxHeap`) == size(`minHeap`) then median is avg(`maxHeap`.top, `minHeap`.top) otherwise, median is `maxHeap`.top.

For insertion there are two cases:

1. If size(`maxHeap`) == size(`minHeap`): insert the num in `maxHeap` if it's less than `maxHeap`.top, otherwise insert the num in `minHeap`.
2. If `size(maxHeap) < size(minHeap)`: rebalance (push the `minHeap`.top to `maxHeap`), then this case is reduced to case 1.

```java
PriorityQueue<Integer> maxH , minH;
/** initialization of maxH and minH. */
public void addNum(int n) {
    if(maxH.isEmpty() || n <= maxH.peek()) {
        maxH.add(n);
        // if size(maxH) - size(minH) >= 2
        // case: first we insert 5, then we insert 3
        if(maxH.size() - minH.size() >= 2)
            minH.add(maxH.poll());
    }
    else {
        minH.add(n);
        if(minH.size() > maxH.size())
            maxH.add(minH.poll());
    }
}

public double findMedian() {
    if(maxH.size() == minH.size())
        return (minH.peek()+maxH.peek())/(double)2;
    return maxH.peek();
}
```

`insertNum()` will be `O(logN)`, `findMedian()` will be `O(1)`

## Subsets

:::note
`n` elements give `2^n` subsets. BFS-style: for each number, append it to a copy of every existing subset.
:::

Given a set with distinct elements, find all of its distinct subsets.

Examples:

![Subsets examples](/coding-ref/i-129-139.webp)

```text
Input: [1, 3]
Output: [], [1], [3], [1,3]

Input: [1, 5, 3]
Output: [], [1], [5], [3], [1,5], [1,3], [5,3], [1,5,3]
```

### Solution

We could use bitmasks to generate solution, but it could get complicated. To generate all subsets of the given set, we can use the Breadth First Search (BFS) approach. We can start with an empty set, iterate through all numbers one-by-one, and add them to existing sets to create new subsets.

At each step our subset size doubles. So T.C. = `O(2^N)`

Lets go through each step of our algorithm:

Given set: [1, 5, 3]

Subset-generation diagram (copy = keep the existing subsets; add = append the number to a copy of each existing subset):

![Subset generation diagram](/coding-ref/i-129-141.webp)

```text
Start: []
Insert 1:  copy [] , add 1 -> [1]                    => [] [1]
Insert 5:  copy [] [1] , add 5 -> [5] [1,5]          => [] [1] [5] [1,5]
Insert 3:  copy [] [1] [5] [1,5] , add 3 -> [3] [1,3] [5,3] [1,5,3]
Result:    [] [1] [5] [1,5] [3] [1,3] [5,3] [1,5,3]
```

1. Start with an empty set: [[]]
2. Add the first number (1) to all the existing subsets to create new subsets: [[], [1]];
3. Add the second number (5) to all the existing subsets: [[], [1], [5], [1,5]];
4. Add the third number (3) to all the existing subsets: [[], [1], [5], [1,5], [3], [1,3], [5,3], [1,5,3]].

```java
public List<List<Integer>> generateSubsets(int[] arr){
    List<List<Integer>> subsets = new ArrayList<>();
    // add an empty set
    subsets.add(new ArrayList<>());
    for(int currentNum: arr){
        int size = subsets.size();
        for(int i = 0; i < size; i++){
            // create a new copy of List
            List<Integer> newSet = new ArrayList<>(subsets.get(i));
            newSet.add(currentNum);
            subsets.add(newSet);
        }
    }
    return subsets;
}
```

## Subsets with duplicates

:::caution
Sort first. When the current number equals the previous one, add it only to the subsets created in the previous step to avoid duplicates.
:::

Given a set of numbers that might contain duplicates, find all of its distinct subsets

Examples:

![Subsets with duplicates examples](/coding-ref/i-130-143.webp)

```text
Input: [1, 3, 3]
Output: [], [1], [3], [1,3], [3,3], [1,3,3]

Input: [1, 5, 3, 3]
Output: [], [1], [5], [3], [1,5], [1,3], [5,3], [1,5,3], [3,3], [1,3,3], [3,3,5], [1,5,3,3]
```

### Solution

To handle duplicates, we will do two extra things:

1. Sort all numbers of the given set. This will ensure that all duplicate numbers are next to each other.
2. Follow the same BFS approach but whenever we are about to process a duplicate (i.e., when the current and the previous numbers are same), instead of adding the current number (which is a duplicate) to all the existing subsets, only add it to the subsets which were created in the previous step.

Lets go through each step of our algorithm:

Start with an empty set: [[]]

Add the first number (1) to all the existing subsets to create new subsets: [[], [1]];

Add the second number (3) to all the existing subsets: [[], [1], [3], [1,3]].

The next number (3) is a duplicate. If we add it to all existing subsets we will get:

[[], [1], [3], [1,3], [3], [1,3], [3,3], [1,3,3]]

We got two duplicate subsets: [3], [1,3]

Whereas we only needed the new subsets: [3,3], [1,3,3]

To handle this instead of adding (3) to all the existing subsets, we only add it to the new subsets which were created in the previous (3rd) step:

[[], [1], [3], [1,3], [3,3], [1,3,3]]

Finally, add the fourth number (5) to all the existing subsets: [[], [1], [3], [1,3], [3,3], [1,3,3], [5], [1,5], [3,5], [1,3,5], [3,3,5], [1,3,3,5]]

![Given and sorted set](/coding-ref/i-131-144.webp)

Given set: [1, 5, 3, 3]

Sorted set: [1, 3, 3, 5]

Walkthrough diagram for the sorted set `[1, 3, 3, 5]` (each box is one subset):

![Subsets with duplicates walkthrough diagram](/coding-ref/i-131-145.webp)

```text
Insert 1:  copy [] , add 1 -> [1]
           result: [] [1]
Insert 3:  copy [] [1] , add 3 -> [3] [1,3]
           result: [] [1] [3] [1,3]
Insert 3 (duplicate): add 3 ONLY to the subsets created in the previous step ([3] [1,3])
           -> [3,3] [1,3,3]
           result: [] [1] [3] [1,3] [3,3] [1,3,3]
Insert 5:  copy all , add 5 -> [5] [1,5] [3,5] [1,3,5] [3,3,5] [1,3,3,5]
           result: [] [1] [3] [1,3] [3,3] [1,3,3] [5] [1,5] [3,5] [1,3,5] [3,3,5] [1,3,3,5]
```

The source diagram marks the duplicate step with the note: "Note the difference for handling the duplicates".

```java
public List<List<Integer>> generateSubsets(int[] arr){
    // sort the array
    Arrays.sort(arr)
    List<List<Integer>> subsets = new ArrayList<>();
    // add an empty set
    subsets.add(new ArrayList<>());
    int startIndex = 0, endIndex = 0;
    for(int i = 0; i < arr.length; i++){
        int currentNum = arr[i];
        startIndex = 0;
        if(i > 0 && arr[i] == arr[i-1]) // duplicate found
            startIndex = endIndex + 1;
        endIndex = subsets.size()-1;
        for(int i = startIndex; i <= endIndex; i++){
            // create a new copy of List
            List<Integer> newSet = new ArrayList<>(subsets.get(i));
            newSet.add(currentNum);
            subsets.add(newSet);
        }
    }
    return subsets;
}
```

## Permutations

:::note
`n!` permutations. Build level by level by inserting the new element at every position of each existing permutation.
:::

Given a set of distinct numbers, find all of its permutations.

Examples:

![Permutations examples](/coding-ref/i-132-147.webp)

```text
Input: [1,3,5]
Output: [1,3,5], [1,5,3], [3,1,5], [3,5,1], [5,1,3], [5,3,1]
```

### Solution

Following a BFS approach, we will consider one number at a time:

1. If the given set is empty then we have only an empty permutation set: []
2. Let's add the first element (1), the permutations will be: [1]
3. Let's add the second element (3), the permutations will be: [3,1], [1,3]
4. Let's add the third element (5), the permutations will be: [5,3,1], [3,5,1], [3,1,5], [5,1,3], [1,5,3], [1,3,5]

Permutation diagram:

![Permutation generation diagram](/coding-ref/i-133-148.webp)

```text
Given set: 1 3 5

[]
 |-- add 1 in all positions -> [1]
 |-- add 3 in all positions -> [3,1]  [1,3]
 |-- add 5 in all positions:
       on [3,1] -> [5,3,1]  [3,5,1]  [3,1,5]
       on [1,3] -> [5,1,3]  [1,5,3]  [1,3,5]
```

So approach is like : for each list in previous step, we insert the current number to every possible index and add it to the step.

```java
public static List<List<Integer>> findPermutations(int[] nums) {
    List<List<Integer>> result = new ArrayList<>();
    Queue<List<Integer>> permutations = new LinkedList<>();
    permutations.add(new ArrayList<>());
    for (int currentNumber : nums) {
        // we will take all existing permutations and add the current number to create new permutations
        int n = permutations.size();
        for (int i = 0; i < n; i++) {
            List<Integer> oldPermutation = permutations.poll();
            // create a new permutation by adding the current number at every position
            for (int j = 0; j <= oldPermutation.size(); j++) {
                List<Integer> newPermutation = new ArrayList<Integer>(oldPermutation);
                newPermutation.add(j, currentNumber);
                if (newPermutation.size() == nums.length)
                    result.add(newPermutation);
                else
                    permutations.add(newPermutation);
            }
        }
    }
    return result;
}
```

## Balanced Parentheses

:::note
For `n` pairs, there are Catalan(n) valid strings. Add `(` while open < `n`, add `)` while close < open.
:::

Given a set of distinct numbers, find all of its permutations.

Note: the problem statement above is reproduced as it appears in the source PDF text (it describes the permutations problem, not balanced parentheses).

Examples:

![Balanced parentheses examples](/coding-ref/i-134-150.webp)

```text
Input: N=2
Output: (()), ()()

Input: N=3
Output: ((())), (()()), (())(), ()(()), ()()()
```

### Solution

Parentheses generation diagram: each level shows the partial strings after adding one character (add `(` or `)`), keeping only valid prefixes. Level 1 is the empty string root, and the diagram's branch labels are "add '('" and "add ')'":

![Balanced parentheses generation diagram](/coding-ref/i-134-151.webp)

```text
Level 0:  ""
Level 1:  (
Level 2:  ((     ()
Level 3:  (((    (()    ()(
Level 4:  ((()   (()(   (())   ()()   ()((
Level 5:  ((())  (()()  (())(  ()()(  ()(()
Level 6:  ((()))  (()())  (())()  ()()()  ()(())
```

```java showLineNumbers mark={4,13,17}
public static List<String> generateValidParentheses(int num) {
    List<String> result = new ArrayList<String>();
    Queue<ParenthesesString> queue = new LinkedList<>();
    queue.add(new ParenthesesString("", 0, 0));
    while (!queue.isEmpty()) {
        ParenthesesString ps = queue.poll();
        // if we've reached the maximum number of open and close parentheses, add to the result
        if (ps.openCount == num && ps.closeCount == num) {
            result.add(ps.str);
        } else {
            // if we can add an open parentheses, add it
            if (ps.openCount < num)
                queue.add(new ParenthesesString(ps.str + "(", ps.openCount + 1, ps.closeCount));

            // if we can add a close parentheses, add it
            if (ps.openCount > ps.closeCount)
                queue.add(new ParenthesesString(ps.str + ")", ps.openCount, ps.closeCount + 1));
        }
    }
    return result;
}
```

## Two Single Numbers

:::tip
XOR of all numbers = `a ^ b`. Use any set bit of that XOR to split numbers into two groups and XOR each group.
:::

In a non-empty array of numbers, every number appears exactly twice except two numbers that appear only once. Find the two numbers that appear only once.

### Solution

Let's assume num1 and num2 are the two single numbers. If we do XOR of all elements of the given array, we will be left with XOR of num1 and num2 as all other numbers will cancel each other because all of them appeared twice. Let's call this XOR n1xn2.

Now, any set bit in n1xn2 represents that num1 & num2 have different bit at that position. Thus, we can use any set bit in n1xn2 (let's call it B) and divide the array into two subsets, one set with bit at location B as 1 and other set will have it as 0.

```java
public int[] two_single(int[] A){
    int n1xn2 = 0;
    for(int i = 0; i < A.length; i++)
        n1xn2 ^= A[i];
    int rightMostSetBit = n1xn2&(~( n1xn2&(n1xn2-1) ));
    int num1 = 0, num2 = 0;
    for(int i = 0; i < A.length; i++){
        if(rightMostSetBit & A[i] == 0)
            num1 ^= A[i];
        else
            num2 ^= A[i];
    }
    return new int[]{num1,num2};
}
```

## Tasks Scheduling

:::tip
Count frequencies; the answer is determined by the most frequent task and how many tasks share that max frequency.
:::

There are 'N' tasks, labeled from '0' to '`N-1`'. Each task can have some prerequisite tasks which need to be completed before it can be scheduled. Given the number of tasks and a list of prerequisite pairs, find out if it is possible to schedule all the tasks.

Examples:

![Tasks scheduling example 1](/coding-ref/i-136-154.webp)

![Tasks scheduling example 2 (cyclic)](/coding-ref/i-136-155.webp)

```text
Input: Tasks=6, Prerequisites=[2, 5], [0, 5], [0, 4], [1, 4], [3, 2], [1, 3]
Output: true
Explanation: A possible sceduling of tasks is: [0 1 4 3 2 5]

Input: Tasks=3, Prerequisites=[0, 1], [1, 2], [2, 0]
Output: []
Explanation: The tasks have cyclic dependency, therefore they cannot be scheduled.
```

```java showLineNumbers mark={7,15}
// graph here represents the tasks graph
public List<Integer> topo_sort(HashMap<Integer, List<Integer>> graph,
                               HashMap<Integer, Integer> indegree){
    Queue<Integer> q = new LinkedList<>();
    for(Map.Entry<Integer,Integer> entry: indegree.entrySet())
        if(entry.getValue() == 0)
            q.add(entry.getKey());
    List<Integer> topo = new ArrayList<>();
    while(!q.isEmpty()){
        int u = q.poll();
        topo.add(u);
        for(Integer v: graph.get(u)){ // for all the child nodes
            indegree.put(v,indegree.get(v) -1);
            if(indegree.get(v) == 0)
                q.add(v);
        }
    }
    // if topological sort includes all the vertices then there is
    // no cyclic dependencies.
    return topo.size() == graph.size();
}
```

## Rearrange String

:::tip
Greedy with a max-heap of character frequencies; always place the most frequent char that is not the previously placed one.
:::

Given a string, find if its letters can be rearranged in such a way that no two same characters come next to each other.

Examples:

![Rearrange string example](/coding-ref/i-137-157.webp)

```text
Input: "aappp"
Output: "papap"
Explanation: In "papap", none of the repeating characters come next to each other.
```

### Solution

The first thing is we need to place the characters as far as possible, this is possible when we place the most frequently occurring characters first. So in each step we place the most frequent character in the current place. To track the frequency we use a hashmap, then to track the most freq. `char`. we use the Max Heap.

We pop an element from this Max Heap, then append to answer string then decrement it's frequency. Since two characters cannot be adjacently placed, We will not put this character back in the heap to ensure that no two same characters are adjacent to each other.

In the next step, we should process the next most frequent character from the heap in the same way and then, at the end of this step, insert the character from the previous step back to the heap after decrementing its frequency.

```java
public static String rearrangeString(String str) {
    Map<Character, Integer> charFrequencyMap = new HashMap<>();
    for (char chr : str.toCharArray())
        charFrequencyMap.put(chr, charFrequencyMap.getOrDefault(chr, 0) + 1);

    PriorityQueue<Map.Entry<Character, Integer>> maxHeap = new PriorityQueue<Map.Entry<Character, Integer>>(
        (e1, e2) -> e2.getValue() - e1.getValue());

    // add all characters to the max heap
    maxHeap.addAll(charFrequencyMap.entrySet());

    Map.Entry<Character, Integer> previousEntry = null;
    StringBuilder resultString = new StringBuilder(str.length());
    while (!maxHeap.isEmpty()) {
        Map.Entry<Character, Integer> currentEntry = maxHeap.poll();
        // add the previous entry back in the heap if its frequency is greater than zero
        if (previousEntry != null && previousEntry.getValue() > 0)
            maxHeap.offer(previousEntry);
        // append the current character to the result string and decrement its count
        resultString.append(currentEntry.getKey());
        currentEntry.setValue(currentEntry.getValue() - 1);
        previousEntry = currentEntry;
    }

    // if we were successful in appending all the characters to the result string, return it
    return resultString.length() == str.length() ? resultString.toString() : "";
}
```

## Number of Sub-arrays With Odd Sum

:::tip
Track the count of even and odd prefix sums; a subarray has odd sum when its two prefix sums have different parity.
:::

Given an array of integers arr. Return the number of sub-arrays with odd sum.

As the answer may grow large, the answer must be computed modulo 10^9 + 7.

Examples:

![Odd sub-arrays example 1](/coding-ref/i-138-159.webp)

![Odd sub-arrays example 2](/coding-ref/i-138-160.webp)

```text
Input: arr = [1,3,5]
Output: 4
Explanation: All sub-arrays are [[1],[1,3],[1,3,5],[3],[3,5],[5]]
All sub-arrays sum are [1,4,9,3,8,5].
Odd sums are [1,9,3,5] so the answer is 4.

Input: arr = [100,100,99,99]
Output: 4
```

```java
static int MOD = (int)(1e9+7);
public int numOfSubarrays(int[] arr) {
    long o = 0, e = 0, ans = 0;
    // in each iteration we keep track of no. of subarrays ending at index == i which can have
    // even sum, as well as we do same for odd sum.
    for(int i = 0; i < arr.length; i++){
        if(arr[i] % 2 == 1){
            long tmp = o;
            o = e + 1;
            e = tmp;
        }
        else if(arr[i] %2 == 0)
            e = e + 1;
        ans = (ans+o)%MOD;
    }
    return (int)ans;
}
```

## 1526. Minimum Number of Increments on Subarrays to Form a Target Array

:::tip
Answer = `target[0]` + sum of `max(0, target[i] - target[i-1])`.
:::

Given an array of positive integers target and an array initial of same size with all zeros.

Return the minimum number of operations to form a target array from initial if you are allowed to do the following operation:

- Choose any subarray from initial and increment each value by one.

The answer is guaranteed to fit within the range of a 32-bit signed integer.

Examples:

![Minimum increments example](/coding-ref/i-139-162.webp)

```text
Input: target = [1,2,3,2,1]
Output: 3
Explanation: We need at least 3 operations to form the target array from the initial array.
[0,0,0,0,0] increment 1 from index 0 to 4 (inclusive).
[1,1,1,1,1] increment 1 from index 1 to 3 (inclusive).
[1,2,2,2,1] increment 1 at index 2.
[1,2,3,2,1] target array is formed.
```
## Ugly numbers

:::tip
Use three pointers (for ×2, ×3, ×5) and always take the smallest next candidate; skip duplicates. `O(N)`.
:::

Given three prime numbers A, B and C and an integer D.

You need to find the first (smallest) D integers which only have A, B, C or a combination of them as their prime factors.

Eg. for A = 2, B = 3, C = 5, D = 5
output => [2, 3, 4, 5, 6]

```java
public int minNumberOperations(int[] target) {
    // difference array
    int[] D = new int[target.length];
    int ans = target[0];
    D[0] = target[0];
    for(int i = 1; i < target.length; i++){
        D[i] = target[i] - target[i-1];
        // if the value of difference array is positive then we need to
        // add that extra amount to form the value : target[i], if it is
        // negative then we would have added till i-1, so we ignore it
        if(D[i] > 0)    ans += D[i];
    }
    return ans;
}
```

```java showLineNumbers mark={4,8,10-12}
public int[] solve(int A, int B, int C, int D) {
    int[] dp = new int[D+1];
    int[] ans = new int[D]; // just for returning in correct form
    dp[0] = 1;
    int t1 = 0, t2 = 0, t3 = 0; // all pointing to idx==0
    for(int i = 1; i <= D; i++){
        /* finding next term from previously found terms */
        dp[i] = Math.min(A*dp[t1], Math.min(B*dp[t2], C*dp[t3]));
        ans[i-1] = dp[i];
        if(dp[i] == A*dp[t1])   t1++;
        if(dp[i] == B*dp[t2])   t2++; // avoiding duplicates
        if(dp[i] == C*dp[t3])   t3++;
    }
    return ans; // it should not have dp[0] so we create ans[]
}
```

## Longest Arithmetic Subsequence

:::note
DP keyed by `(index, difference)`: `dp[i][d] = dp[j][d] + 1` for `j < i`, `d = nums[i] - nums[j]`. `O(N^2)`.
:::

Given an Array of numbers find the longest Arithmetic sequence.

Usually the constraints are weak for this problem.

Eg. A = [ 9, 4, 2, 7, 10 ]
- **Output:** 3 as [ 4, 7, 10 ] is aritmetic sequence with `difference == 3`

### Solution

Similar to Longest Increasing subsequence

```java
public static int longestArithSeqLength(int[] A) {
    if(A.length == 0)   return 0;
    Map<Integer,Integer>[] map = new HashMap[A.length];
    int mx = 1;
    for(int i = 0; i < A.length; i++){
        map[i] = new HashMap<>();
        for(int j = 0; j < i; j++){
            // let diff == A[i] - A[j]
            // currLen denotes if we already have diff
            int currLen = map[i].getOrDefault(A[i]-A[j], 0);
            // prevLen denotes in map[j] , if diff is present
            int prevLen = map[j].getOrDefault(A[i]-A[j], 1);
            if(prevLen+1 > currLen){
                map[i].put(A[i]-A[j], prevLen + 1);
            }
            mx = Math.max(mx, map[i].get(A[i]-A[j]));
        }
    }
    return mx;
}
```

We can also do another thing, we find the maximum difference possible.

```java showLineNumbers mark={17-18}
public static int longestArithSeqLength(int[] A) {
    int mx = Integer.MIN_VALUE, mn = Integer.MAX_VALUE;
    for (int i = 0; i < A.length; i++) {
        mx = mx > A[i]? mx: A[i];
        mn = mn < A[i]? mn: A[i];
    }
    int t = mx-mn; // maximum difference possible
    // any diff will be : -t <= diff <= t, so we declare 2d array
    int[][] dp = new int[A.length][(t<<1)+1];
    for (int i = 0; i < dp.length; i++)
        Arrays.fill(dp[i],1);

    int ans = 0;
    for (int i = 1; i < A.length; i++) {
        for (int j = 0; j < i; j++) {
            int diff = A[i]-A[j];
            dp[i][t+diff]  = dp[j][t+diff] + 1;
            ans = Math.max(dp[i][t+diff], ans);
        }
    }
    return ans;
}
```

```text
A = [1, 2, 1, 2]
output: 2

A = [7, 2, 4, 8, 7]
output: 6
```

## Best Time to Buy and Sell Stocks III

:::note
At most 2 transactions: track `buy1, sell1, buy2, sell2` states in one pass, or compute best profit from the left and right of each index.
:::

Given an array A, for which the ith element is the price of a given stock on day i.

Design an algorithm to find the maximum profit. You may complete at most 2 transactions.

### Explanation

In order to sell the stock, you must've bought it on a day t=[0..`j-1`].
Maximum profit that can be attained is t:0->`j-1`
`max(prices[j]-prices[t]+dp[i-1][t-1])` where `prices[j]`-`prices[t]` is the profit from buying on day t and selling on day j. `dp[i-1][t-1]` is the maximum profit that can be made with at most `i-1` transactions with prices `prices[0..t-1]`.

In order to reduce it to `O(nk)`, we must find t:0->`j-1` `max(prices[j]-prices[t]+dp[i-1][t-1])` this expression in constant time. If you see carefully,

t:0->`j-1` `max(prices[j]-prices[t]+dp[i-1][t-1])` is same as

`prices[j]` + t:0->`j-1` `max(dp[i-1][t-1]-prices[t])`

Second part of the above expression `maxTemp` = t:0->`j-1` `max(dp[i-1][t-1]-prices[t])` can be included in the dp loop by keeping track of the maximum value till `j-1`.

```java showLineNumbers mark={8,13}
public int maxProfit(final int[] A) {
    int n = A.length;
    int[][] dp = new int[2][n];
    if(n == 0)  return 0;
    int lmin = A[0];
    for(int i = 1; i < n; i++){
        lmin = Math.min(lmin, A[i]);
        dp[0][i] = Math.max(dp[0][i-1], A[i] - lmin);
    }

    int tmpMax = -1*A[0];
    for(int i = 1; i < n; i++){
        dp[1][i] = Math.max(A[i] + tmpMax, dp[1][i-1]);
        tmpMax = Math.max(tmpMax, dp[0][i] - A[i]);

        ///////////////////////////////////////////////////
        //lmin = A[i];
        //for(int j = i-1; j >= 0; j--){
        //    lmin = Math.min(A[j], lmin);
        //    dp[1][i] = Math.max(A[i] - lmin + (j>0?dp[0][j-1]:0), dp[1][i]);
        //}
        //dp[1][i] = Math.max(dp[1][i], dp[1][i-1]);
        ///////////////////////////////////////////////////
    }
    return dp[1][n-1];
}
```

## Longest valid Parentheses

:::tip
Use a stack of indices (seeded with `-1`) or a DP array; a valid length is `i - stack.peek()` after a match.
:::

Given a string A containing just the characters '(' and ')'.

Find the length of the longest valid (well-formed) substring of parentheses.

For, A = ")()())"
Output = 4

For A = "())()"
Output = 2

```java showLineNumbers mark={6,9,11}
public int longestValidParentheses(String s) {
    int l = 0, r = 0, ans = 0, c = 0;
    char[] ss = s.toCharArray();
    int[] dp = new int[ss.length];
    for (int i = 0; i < s.length(); i++) {
        if(ss[i] == '(')    dp[i] = 0;
        else if(i > 0){
            if(ss[i-1] == '(')
                dp[i] = i > 1?dp[i-2]+2:2;
            else if(i-dp[i-1] > 0 && ss[i-dp[i-1]-1] == '(')
                dp[i] = i-dp[i-1] > 1? dp[i-dp[i-1]-2]+dp[i-1]+2: dp[i-1]+2;
        }
        ans = ans < dp[i]? dp[i]:ans;
    }
    return ans;
}
```

## Sub Matrices with sum Zero

:::tip
Fix two rows, collapse columns into a 1-D array of column sums, then count zero-sum subarrays with a prefix-sum `HashMap`. `O(R^2·C)`.
:::

Given a 2D matrix, find the number non-empty sub matrices, such that the sum of the elements inside the sub matrix is equal to 0. (note: elements might be negative).

Eg.

```text
-8 5 7
 3 7 -8
 5 -8 9
```

- **Output:** 2

### Explanation

The approach is like, we create a new matrix `dp[][]`, where `dp[i][j]` == sum of all elements of the matrix whose bottom-right corner is `(i,j)`. Then for each element in the matrix we find all the submatrices, but instead of this we find all the submatrices where any element `(i,j)` is the bottom-right (or any other) corner element.

```java showLineNumbers mark={10-13}
public int solve(ArrayList<ArrayList<Integer>> A) {
    int m = A.size();
    if(m == 0)  return 0;
    int n = A.get(0).size();
    int[][] dp = new int[m][n];
    int count = 0;

    for(int i = 0; i < m; i++){
        for(int j = 0; j < n; j++){
            dp[i][j] = A.get(i).get(j);
            if(i != 0)  dp[i][j] += dp[i-1][j];
            if(j != 0)  dp[i][j] += dp[i][j-1];
            if(i!=0 && j!=0)    dp[i][j] -= dp[i-1][j-1];

            for(int i1 = 0; i1 <= i; i1++)
                for(int j1 = 0; j1 <= j; j1++)
                    if(area(i1,j1,i,j,dp) == 0)
                        count++;
        }
    }

    return count;
}
public int area(int x,int y, int m, int n, int[][] dp){
    int a = dp[m][n];

    if(x != 0)  a -= dp[x-1][n];
    if(y != 0)  a -= dp[m][y-1];
    if(x != 0 && y != 0) a += dp[x-1][y-1];
    return a;
}
```

## 741. Cherry Pickup

:::tip
Think of two people walking from `(0,0)` to `(n-1,n-1)` at the same time; DP over the step count and both rows.
:::

In a N x N grid representing a field of cherries, each cell is one of three possible integers.

- 0 means the cell is empty, so you can pass through;
- 1 means the cell contains a cherry, that you can pick up and pass through;
- -1 means the cell contains a thorn that blocks your way.

Your task is to collect maximum number of cherries

Similar : 1463. Cherry Pickup II

- **Input:** grid =
```text
[[0, 1, -1],
 [1, 0, -1],
 [1, 1, 1]]
```
- **Output:** 5

```java showLineNumbers mark={38}
static int[][][][] dp;
public int cherryPickup(int[][] grid) {
    // 0 -> cell is empty
    // 1 -> cherry
    //-1 -> blocked
    int n = grid.length;
    dp = new int[n][n][n][n];
    return Math.max(0,twoRobot(0,0,0,0,grid));
}
public int twoRobot(int r1,int c1, int r2, int c2, int[][] grid){
    if(r1 >= grid.length || r2 >= grid.length ||
       c1 >= grid[0].length || c2 >= grid[0].length ||
       grid[r1][c1] == -1 || grid[r2][c2] == -1)
        return Integer.MIN_VALUE;
    if(dp[r1][c1][r2][c2] != 0) return dp[r1][c1][r2][c2];
    int cherry = 0, n = grid.length;

    // if person 1 reached the bottom right, return what's in there (could be 1 or 0)
    if(r1 == n - 1 && c1 == n - 1)
        return grid[r1][c1];

    // if person 2 reached the bottom right, return what's in there (could be 1 or 0)
    if(r2 == n - 1 && c2 == n - 1)
        return grid[r2][c2];

    if(r1 == r2 && c1 == c2)
        cherry += grid[r1][c1];
    else
        cherry += grid[r1][c1] + grid[r2][c2];

    cherry += max4(
            twoRobot(r1+1,c1, r2+1,c2,grid)   // down down
          , twoRobot(r1,c1+1, r2,c2+1,grid)   // right right
          , twoRobot(r1+1,c1, r2, c2+1,grid)  // down right
          , twoRobot(r1,c1+1, r2+1,c2,grid)   // right down
          );

    dp[r1][c1][r2][c2] = cherry;
    return cherry;
}
public int max4(int a,int b,int c,int d){
    return Math.max(Math.max(Math.max(a,b),c),d);
}
```

## 1368. Minimum Cost to Make at Least One Valid Path in a Grid

:::tip
Zero-cost move if the cell arrow points that way, cost `1` otherwise: use 0-1 BFS (deque) or Dijkstra.
:::

Given a m x n grid. Each cell of the grid has a sign pointing to the next cell you should visit if you are currently in this cell. The sign of `grid[i][j]` can be:

- 1 which means go to the cell to the right. (i.e go from `grid[i][j]` to `grid[i][j + 1]`)
- 2 which means go to the cell to the left. (i.e go from `grid[i][j]` to `grid[i][j - 1]`)
- 3 which means go to the lower cell. (i.e go from `grid[i][j]` to `grid[i + 1][j]`)
- 4 which means go to the upper cell. (i.e go from `grid[i][j]` to `grid[i - 1][j]`)

A valid path in the grid is a path which starts from the upper left cell (0,0) and ends at the bottom-right cell (`m - 1`, `n - 1`) following the signs on the grid. The valid path doesn't have to be the shortest.

You can modify the sign on a cell with cost = 1. You can modify the sign on a cell one time only.

Return the minimum cost to make the grid have at least one valid path.

Example grid 1 (4 x 4, image; arrows as drawn, colors as in the figure, no caption):

![Example grid 1: 4x4 arrow grid](/coding-ref/i-149-172.webp)

| Row | Col 1 | Col 2 | Col 3 | Col 4 |
|---|---|---|---|---|
| 1 | yellow → (start cell (0,0)) | red → | red → | red → |
| 2 | brown ← | brown ← | brown ← | brown ← |
| 3 | red → | red → | red → | red → |
| 4 | brown ← | brown ← | brown ← | brown ← |

Example grid 2 (3 x 3, image; arrows as drawn, colors as in the figure, no caption):

![Example grid 2: 3x3 arrow grid](/coding-ref/i-149-173.webp)

| Row | Col 1 | Col 2 | Col 3 |
|---|---|---|---|
| 1 | yellow → (start cell (0,0)) | red → | blue ↓ |
| 2 | blue ↓ | brown ← | brown ← |
| 3 | red → | red → | pink ↑ |

### Solution

This problem is very tricky!. It can be solved using DFS, but it would result in TLE. Then, next thing to use is Dijkstra. The approach is VlogE, this can be optimised using 0-1 BFS to V (or `O(MN)`).

NOTE: The Dijkstra algorithm in previous post was not working, I've to remove the line if(`visited[x][y]`) continue; Don't know why it wasn't working.

```java showLineNumbers mark={18}
static int INF = (int)1e9;
static int[][] dir = {{0,1},{0,-1},{1,0},{-1,0}};
public int minCost(int[][] grid) {
    int n = grid.length, m = grid[0].length;
    int[][] dist = new int[n][m];
    boolean[][] visited = new boolean[n][m];
    for(int i = 0; i < n; i++)  Arrays.fill(dist[i], INF);
    dist[0][0] = 0;
    // Dijkstra
    // PriorityQueue<int[]> q = new PriorityQueue<>(new Comparator<>(){
    //     @Override
    //     public int compare(int[] a,int[] b){
    //         return dist[a[0]][a[1]]-dist[b[0]][b[1]];
    //     }
    // });
    // 0-1 BFS
    Deque<int[]> q = new ArrayDeque<>();
    q.add(new int[]{0,0});
    while(!q.isEmpty()){
        int[] pop = q.removeFirst();
        int x = pop[0], y = pop[1];
        visited[x][y] = true;
        int cd = grid[x][y]-1;
        for(int i = 0; i < 4; i++){
            int nx = x + dir[i][0], ny = y + dir[i][1];
            if(nx < 0 || ny < 0 || nx >= n || ny >= m)  continue;
            int w = (cd==i?0:1);
            if(dist[nx][ny] > dist[x][y]+w){
                dist[nx][ny] = dist[x][y]+w;
                if(w == 0)  q.addFirst(new int[]{nx,ny});
                else q.addLast(new int[]{nx,ny});
            }
        }
    }
    return dist[n-1][m-1];
}
```

## 1124. Longest Well-Performing Interval

:::tip
Map tired days to `+1` and others to `-1`; find the longest subarray with positive sum using prefix sums and a first-occurrence map (or a monotonic stack).
:::

Given an array find the longest subarray positive (>0) sum subarray containing 1 and -1 only.

Eg. -1 -1 -1 1 1 -1 -1 -1 1 1 1
- **Output:** 9

![Hand-drawn sketch of the well-performing interval on a price-like line](/coding-ref/i-151-175.webp)

Sketch (hand-drawn, image): a price-like line plotted over indices 0 to 10 on the x-axis (numbers 0-10 written above the axis, three horizontal guide lines), with red dots on points, yellow highlighted segments on the rising/falling runs (roughly indices 3-4 and 4-6 and 8-10), a green double-headed arrow spanning index 1 to index 10 along the top, a grey oval/loop around index 2, a grey curved arrow labelled `t2` from index 0 to index 2, and two grey rectangles around the segments between 4-7 and 7-9. Text is hand-drawn and not otherwise labelled.

Yellow portions are useless, as once we reached a sum state for the first time, we will store it in Map. Then if incase the sum till now is positive, then I update the answer to `i+1`. Otherwise, if we reached this sum for the first time we store it in map, then check if we have reached the sum of (sum-1) earlier coz, the sum from prev (sum-1) till i will be 1 (excluding the sum-1) as sum - (sum-1) == 1.

```java showLineNumbers mark={7}
for(int i = 0; i < n; i++){
    s+= A[i];
    if(s > 0)   ans = i+1;
    else{
        map.putIfAbsent( s, i);
        if(map.containsKey(s-1))
            ans = Math.max(ans, i - map.get(s-1));
    }
}
```

## Generalized Problem: Find Longest Subarray With Sum >= K

- **Input:** array arr in which elements are arbitrary integers.
- **Output:** length of a longest subarray arr[i, j) with sum(`arr[i]`, ... , `arr[j-1]`) >= K.

1. Compute prefix sum of arr as `prefixSum` where `prefixSum[i]` = sum(`arr[0]`, ... `arr[i-1]`) for i > 0 and `prefixSum[0]` = 0.
2. Iterate through `prefixSum` from begin to end and build a strictly monotone decreasing stack `smdStack`. (`smdStack.top()` is the smallest)
3. Iterate through `prefixSum` from end to begin. For each `prefixSum[i]`, while `smdStack.top()` is less than `prefixSum[i]` by at least K, pop `smdStack` and try to update result by subarray [index of top,i). Until top element is not less than it by K.
4. Return result.

For simplicity, call `(i, j)` a valid pair if the inequation `prefixSum[j]` - `prefixSum[i]` >= K holds. Our goal is to optimize `j-i` over all valid pair `(i, j)`.

1. Firstly, fix j and minimize i. Consider any i1 and i2 that `i1 < i2` < j and `prefixSum[i1]` <= `prefixSum[i2]`. It is obvious that `(i2, j)` can't be a candidate of optimal subarray because `(i1, j)` is more promising to be valid and longer than `(i2, j)`. Therefor candidates are monotone decreasing, and we can use a strictly monotonic descresing stack to find all candidates. (Monotone stack are just normal stack with a constraint that the elements in them are monotonically increasing or decreasing. When processing a new element, we either pop top elements then push new elem or discard this new element to guarantee the property of monotonicity. If you are not familiar with this data structure, you'd better solve some similar leetcode problems before this one).
2. Secondly, fix i and maximize j. Consider any j1 and j2 that `i < j1` < j2 and `prefixSum[j2]` - `prefix[i]` >= K. We can find that `(i, j1)` can't be a candidate of optimal subarrary because `(i, j2)` is better. This discovery tells us that we should iterate j from end to begin and if we find a valid `(i, j)`, we don't need to keep i in `smdStack` any longer.

## 31. Next Permutation

:::tip[Steps]
1. Find the first index `i` from the right with `a[i] < a[i+1]`.
2. Swap `a[i]` with the smallest larger element to its right.
3. Reverse the suffix after `i`.
:::

Implement next permutation, which rearranges numbers into the lexicographically next greater permutation of numbers.

- **Input:** nums = [3,2,1]
- **Output:** [1,2,3]

![Swap example: 1 2 5 4 | 8 7 6 3 becomes 1 2 5 6 | 3 4 7 8](/coding-ref/i-153-177.webp)

Swap example (image): array `1 2 5 4 [8 7 6 3]`-style sketch, i.e. before: `1 2 5 4 | 8 7 6 3`, where the swap pairs 4 with 6 ("Swap as 6>4 and 6 is closest to 4"), giving `1 2 5 6 | 3 4 7 8` after the sort of the suffix ("after swap sort" label).

```java
public static void nextPerm(int[] A){
    int N = A.length;
    int idx = N-2;
    for(;idx>=0; idx--){
        if(A[idx] < A[idx+1])
            break;
    }
    if(idx>=0){
        int cur = A[idx], dist = (int)1e9, mn = -1;
        for(int i = idx+1; i < N; i++){
            if(dist > A[i]-cur && A[i] > cur){
                dist = A[i]-cur;
                mn = i;
            }
        }
        int t = A[idx];
        A[idx] = A[mn];
        A[mn] = t;
    }
    Arrays.sort(A, idx+1, N);
}
```

## Important Links

12 Week Programme - Leetcode

Tech Interview Handbook

Mock Interview:
- https://www.pramp.com
- https://triplebyte.com

Parking Lot OOD:
- https://www.youtube.com/watch?v=tVRyb4HaHgw (Better)
- https://www.youtube.com/watch?v=DSGsa0pu8-k (If have more time)
