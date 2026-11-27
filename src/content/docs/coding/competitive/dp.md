---
title: Dynamic Programming Reference
description: "Dynamic programming notes: digit DP, patterns, knapsack, subsequence/string DP and classic problems."
---

## Tree DP

## Digit DP

The problem is generally of the following type: we need to find the count of numbers in range `[0, R]` such that they satisfy a boolean function `f(x)` where `0 <= x <= R`.

We can extend this to range `[L, R]` by finding `G[L,R] = G[R] - G[L]`, where `G[x]` = count of numbers from `[0, x]` satisfying the function f.

Problem: find all the numbers between `[L, R]` that have sum of digits == X.
Constraints: `1 <= L <= R <= 10^18`, `1 <= X <= 180`

Solution: consider the boolean function `f(i) = (sum of digits of i == X)`. Now, I want to count all the numbers from 0 to R which satisfy f(i) where `0 <= i <= R`.

Let's simplify: new problem -> find the count of all 5 digit numbers whose sum of digits is X. Note: 1 is also a 5 digit number as it can be written as 00001.

In digit DP we generally expand from the most significant digit (digit 2 in 24456).

So, coming to the problem, we have 5 slots: `_ _ _ _ _`. We start with the first slot: `(_) _ _ _ _`. In the first slot we can fill digits [0-9]. After filling the first slot with a digit, we fill in the next digit.

To further generalize: we need to solve for `dp(N,X)` -> count of numbers with N digits having digit sum = X.

If the first slot is set to 0, then the result will be `dp(N-1, X)`, i.e. we need sum of X from the remaining N-1 digits. If the first slot is set to 1, then the result will be `dp(N-1, X-1)`.

`dp(N, X) = dp(N-1, X) + dp(N-1, X-1) + dp(N-1, X-2) + ... + dp(N-1, X-9)`

Thus this solves for the range `[0, 999...N times]`.

Let's see how to solve for R = 5273. The earlier solution won't work as we now have a max limit on individual digits. This is the tight constraint. Let's examine more.

We have 4 slots: `_ _ _ _`. If in the first slot I put any digit from [0-4], then in the rest of the slots I can fill [0-9] without restriction. However, if I place 5 in the first slot, then there is a tight constraint on the values to be filled in the next slot.

To generalize: we now have another dimension in our dp for the tight constraint, i.e. `dp(N, X, 1)` -> count of numbers with N digits having digit sum == X and having a tight constraint in the next slot.

`dp(N, X, 1) = dp(N-1, X, 0) + dp(N-1, X-1, 0) + ... + dp(N-1, X-4, 0) + dp(N-1, X-5, 1)`
(the last term `dp(N-1, X-5, 1)` carries the tight constraint)

Code:

```java
int solve(string& num, int n, int x, bool tight){
    if(x < 0)return 0;
    if(n == 1){
        if(x >= 0 && x <= 9)
            return 1;
        return 0;
    }

    int answer = 0;
    int ub = tight ? num[(num.length() - n)] - '0' : 9;

    for(int dig = 0; dig <= ub; dig++){
        answer += solve(num, n-1, x-dig, (tight&(dig==ub)));
    }

    return answer;
}
```

P2: find the count of boring numbers from `[ L, R ]`. A number is called boring if all the even places have even digits and odd places have odd digits. The indexing starts from 1 from the left.

Here the boolean function is `f(i)` => tells if the number `i` is a boring number or not.

`dp [ N, even, leading zero, tight ]`
- N -> number of digits
- even -> [boolean] is the current slot an even position or odd position (0 -> even, 1 -> odd)
- Leading zero -> [boolean] is the slots from start till current position all zeros
- Tight -> [boolean] comes in effect when the range is tight

`Dp[ N, 1, 1, 1 ] = dp[ N-1, 0, 1, 0 ] + dp[ N-1, 0, 0, 0] + ...`

P3:

https://leetcode.com/contest/biweekly-contest-111/problems/number-of-beautiful-integers-in-the-range/

![Number of beautiful integers problem statement and solution code](/coding-ref/i-013-019.webp)

You are given positive integers `low`, `high`, and `k`.

A number is beautiful if it meets both of the following conditions:
1. The count of even digits in the number is equal to the count of odd digits.
2. The number is divisible by `k`.

Return the number of beautiful integers in the range `[low, high]`.

Constraints: `0 < low <= high <= 10^9`, `0 < k <= 20`

Solution code:

```java
class Solution {
    int[][][][][][] memo;
    public int numberOfBeautifulIntegers(int low, int high, int k) {
        return f(k, high) - f(k, low-1);
    }
    public int f(int k, int r){
        if(r <= 0)  return 0;
        memo = new int[10][10][10][20][2][2];
        for(int[][][][][] x1: memo)
            for(int[][][][] x2: x1)
                for(int[][][] x3: x2)
                    for(int[][] x4: x3)
                        for(int[] x5: x4)
                            Arrays.fill(x5, -1);
        return solve(0, 0, 0, 0, 1, 1, k, r);
    }
    // idx -> cur pos, ne -> number of even digits, no -> count of odd digits,
    // l0 -> is current leading 0, tight -> tighten or not
    public int solve(int idx, int ne, int no, int mod, int l0, int tight, int k, int r){
        if(idx>= 10) {
            if(ne == no && mod == 0 && l0==0)    return 1;
            else    return 0;
        }
        if(memo[idx][ne][no][mod][l0][tight] != -1)
            return memo[idx][ne][no][mod][l0][tight];
        int limit = 9;
        if(tight == 1){
            int digit = (r / (int)Math.pow(10, 9-idx))%10;
            limit = digit;
        }
        int res = 0;
        for(int i = 0; i <= limit; i++){
            // if(i == limit)
            int l = l0==1 && i==0? 1: 0;
            int e = ne + (i%2==0 && l==0 ?1:0);
            int o = no + (i%2==1?1:0);
            int m = (mod*10 + i) % k;
            int t = tight==1 && (i == limit)?1:0;
            res += solve(idx+1, e, o, m, l, t, k, r);
        }
        return memo[idx][ne][no][mod][l0][tight] = res;
    }
}
```


## Dynamic programming patterns

Dynamic Programming Patterns - LeetCode Discuss.

3 types of problems in DP (https://www.youtube.com/watch?v=YBSt1jYwVfU):
1. Combinatorics: count something, like no. of ways
2. Minimize or maximize something
3. YES/NO problem

2 and 3 may also be solved using greedy approaches.

APPROACH: After we write some part of the solution (example), ask what is important so far.

DOUBLE COUNTING PROBLEM

Better explanation:
- Problem 1: count the number of distinct ways of adding up a set of coins to form the target sum.
- Problem 2: problem 1 but with different sequences counted as different combinations (eg. [1,2,1] is different than [1,1,2]).

The difference lies in the core logic to solve both problems.

In problem 1, we need to either include a coin or exclude it to form the final sum. The recursive expression will be:

```java
public int solve(int idx, int target, int[] A){
    if(idx >= A.length)    return 0;

    // we found the target
    if(target == 0)   return 1;

    // find the sum if including the current idx
    int include = solve(idx+1, target - A[idx], A);

    // find the target sum by not including
    int exlcude = solve(idx+1, target, A);

    // by just including and excluding we are
    // not considering the different sequences
    return include + exclude;
}
```

For problem 2: here things are a bit different as we need to include all combinations. For this I'll think to find the number of ways to reach the target if the first term is x, where x is one of the coins. For eg. if x = 2, then I need to find the (target-2) sum again with all the terms, like in this position we can again use all of the coins one by one.

```java
public int solve(int target, int[] A){

    // we found the target
    if(target == 0)   return 1;

    int ans = 0;

    for(int i = 0; i < A.length; i++){
        // for current position in the sequence
        // include all the possible numbers
        ans += solve(target-A[i], A);
    }

    return ans;
}
```

## 377. Combination Sum IV (LeetCode)

Given an integer array with all positive numbers and no duplicates, find the number of possible combinations that add up to a positive integer target.

```java
int[] nums = {1,2,3};
int target = 4;
```

If different sequences are not counted as different combinations:

```text
idx 0 1 2 3 (4 <-target)
0      1, 1, 1, 1, 1,
1      1, 1, 2, 2, 3,
2      1, 1, 2, 3, 4,
answer = 4
Sequences will be : (1,1,1,1), (1,1,2), (2,2), (1,3)
```

```java
int[][] dp = new int[nums.length][target+1];

for (int i = 0; i < nums.length; i++) {
    dp[i][0] = 1;
    for (int j = 1; j <= target; j++)
        dp[i][j] = (j>=nums[i]?dp[i][j-nums[i]]:0) +
(i>=1?dp[i-1][j]:0);
}
```

If different sequences are counted as different combinations:

```text
idx
0    1, 1, 1, 1, 1,
1    1, 1, 2, 3, 5,
2    1, 1, 2, 4, 7,
answer = 7
Sequences will be: (1, 1, 1, 1), (1, 1, 2), (1, 2, 1), (1, 3), (2, 1, 1), (2, 2), (3, 1)
```

```java
for (int i = 0; i < nums.length; i++) {
    dp[i][0] = 1;
    for (int j = 1; j <= target; j++)
        for (int j2 = 0; j2 <= i; j2++)
            dp[i][j] += (j-nums[j2] >= 0)?dp[i][j-nums[j2]]:0;
}
```

Trick in the second method lies in checking all the sequences whose last term will be nums[j2].

## Reverse way

If different sequences are counted as different combinations:

```java
int dp[] = new int[target+1];
dp[0] = 1;
for (int i = 0; i <= target; i++)
    for (int x : nums)
        if( x + i <= target)
            dp[x+i] += dp[i];
// Here, dp[] = 1 1 2 4 7
```

dp[i] is the no. of ways for making the sum "i", or "i" represents the sum. What we are doing is that upon reaching any index i, I'll check what other sums I can make using all the other numbers in nums. Eg. at index 10, we can form sums of 11, 12, 13 using the nums=[1,2,3] array. Here we already know dp[i] and we are using it to update the future dp values. This is known as the forward approach.

Another approach is to find the current dp[i] using the previous values. This is given by:

```java
int dp[] = new int[target+1];
dp[0] = 1;
for (int i = 1; i <= target; i++)
    for (int x : nums)
        if( i - x >= 0)
            dp[i] += dp[i-x];
// print1D(dp);
return dp[target];
```

If different sequences are not counted as different combinations.
## Double counting problem

What we can do is to take one representation of every group, i.e., for group `[ (2,2,1), (2,1,2), (1,2,2) ]` take any one, but can't do this randomly as we need to do this for every group. We propose the rule of taking the lexicographically sorted manner, i.e. we select `(1,2,2)` as the representation of the above group.

![Handwritten notes for N = 5 with compositions and double-counting groups](/coding-ref/i-020-026.webp)

**[Figure]** Handwritten notes for N = 5 (compositions of 5 from terms 1 and 2): 2+2+1, 2+1+1+1, 1+1+1+1+1, with the group (2,2,1)/(2,1,2)/(1,2,2) circled and marked 3, the 2+1+1+1 row marked x4, and final count 4.

Handwritten notes (figure): top shows `[1, 2, 5]` with index labels `0 1 ...`; `N = 5`; rows `5` (x1 marker), `2+2+1`, `2+1+1+1` (x4 marker), `1+1+1+1+1` (x1 marker). The `2+2+1` group is circled with the crossed-out ordering `2+2+1 / 2+1+2 / 1+2+2` and a count of `3`. The boxed result is `4`.

```java
int dp[][] = new int[target+1][nums.length];
// initial: take every one as first term of series
for (int i = 0; i < nums.length; i++)
    dp[nums[i]][i]++;
// now, find all the future terms of this series
for (int i = 0; i <= target; i++)
    for (int j = 0; j < nums.length; j++)
        // check if the next term "j2" is >= current term "j"
        for (int j2 = j; j2 < nums.length; j2++)
             if(i+nums[j2] <= target)
                 dp[i+nums[j2]][j2] += dp[i][j];
print2D(dp);
int ans = 0;
for (int i = 0; i < nums.length; i++)
    ans += dp[target][i];
return ans;

// nums = {1,2,3}; target = 5;
Trgt 0 1 2 //indexes of last terms
0   0, 0, 0,
1   1, 0, 0,
2   1, 1, 0,
3   1, 1, 1,
4   1, 2, 1,
5   1, 2, 2,
Answer = 5

// nums = {1,2,5}; target = 5;
Trgt 0 1 2 //indexes of last terms
0   0, 0, 0,
1   1, 0, 0,
2   1, 1, 0,
3   1, 1, 0,
4   1, 2, 0,
5   1, 2, 1,
Answer = 4
```


## Patterns

1. LIS
2. Minimum (Maximum) Path to Reach a Target

   Given a target find the minimum (maximum) cost / path / sum to reach the target.

   $$routes[i] = \min(routes[i-1], routes[i-2], \ldots, routes[i-k]) + cost[i]$$

3. Distinct Ways

   Given a target find a number of distinct ways to reach the target.

   $$routes[i] = routes[i-1] + routes[i-2] + \ldots + routes[i-k]$$

4. Merging Intervals

   Given a set of numbers, find an optimal solution for a problem considering the current number and the best you can get from the left and right sides. // matrix multiplication

   $$dp[i][j] = dp[i][k] + result[k] + dp[k+1][j]$$

5. DP on Strings

   Given two strings `s1` and `s2`, return some result.

   Subsequence:

   ```java
   for (int i = 1; i <= n; ++i) {
       for (int j = 1; j <= m; ++j) {
           if (s1[i-1] == s2[j-1]) {
               dp[i][j] = /*code*/;
           } else {
               dp[i][j] = /*code*/;
           }
       }
   }
   ```

   or

   Substring:

   ```java
   for (int l = 1; l < n; ++l) {
       for (int i = 0; i < n-l; ++i) {
           int j = i + l;
           if (s[i] == s[j]) {
                dp[i][j] = /*code*/;
           } else {
                dp[i][j] = /*code*/;
           }
       }
   }
   ```

6. Decision Making

   Given a set of values find an answer with an option to choose or ignore the current value.

   ```java
   // i - indexing a set of values
   // j - options to ignore j values
   for (int i = 1; i < n; ++i) {
       for (int j = 1; j <= k; ++j) {
            dp[i][j] = max({dp[i][j], dp[i-1][j] + arr[i],
   dp[i-1][j-1]});
            dp[i][j-1] = max({dp[i][j-1], dp[i-1][j-1] + arr[i],
   arr[i]});
       }
   }
   ```

## Ways to color a 3xN Board

Given a 3 x A board, find the number of ways to color it using at most 4 colors such that no 2 adjacent boxes have same color.

Solution: we find all possible ways to fill 3xN correctly, it turns out that we can split them into two groups, p and q. P represents all different, Q represents only two are different. We chose a random sequence from p and find the all the possible sequence for the next adjacent 3x1 block. Similarly, we find those for Q. Now we split the results found for P and Q into two groups one with all different and other with 2 of them different terms. Using this we find the recursive equation.

![Handwritten P/Q state-transition diagram for 3xN coloring](/coding-ref/i-023-027.webp)

**[Figure]** Handwritten P/Q state-transition diagram for the 3xN coloring: a 3-cell strip splits into P (strip 1 2 3, all different) and Q (strip 1 2 1, two equal), with lists of next-column patterns (P side: 11 patterns 214, 231, 234, 241, 312, 314, 341, 342, 412, 431, 432 and 6 patterns 212, 232, 242, 313, 414, 434; Q side: 10 patterns 213, 214, 234, 243, 312, 314, 342, 412, 413, 432 and 7 patterns 212, 232, 242, 313, 343, 414, 434) and the coefficient pairs 11 / 6 (P side) and 10 / 7 (Q side). Recurrence written as P_{+1} = 11·P + 10·Q and Q_{+1} = 5·P + 7·Q.

Handwritten recurrence (partially legible): `P_{+1} = 11·P + 10·Q`, `Q_{+1} = 5·P + 7·Q`.

## Problems

### 0/1 Knapsack

```java
/**
*     Given two integer arrays to represent weights and profits of 'N' items,
*     we need to find a subset of these items which will give us maximum
*     profit such that their cumulative weight is not more than a given
number 'C'.
*     Each item can only be selected once, which means either we put an item
*     in the knapsack or we skip it.
*/
```

```java
public int knapsackRecursive(int currentIndex, int capacity,int[] profits,int[] weights){
    if(currentIndex >= profits.length || capacity <= 0) return 0;
    int profit1=0,profit2=0;
    // include this item
    if(weights[currentIndex] <= capacity)
        profit1 = profits[currentIndex] + knapsackRecursive(currentIndex+1,
capacity-weights[currentIndex], profits, weights);
    // don't include this item
    profit2 = knapsackRecursive(currentIndex+1, capacity, profits,
weights);
    return Math.max(profit1,profit2);
}
```

Bottom up

```java
public int knapsack(int capacity, int[] profits, int[] weights){
    int[][] dp = new int[profits.length][capacity+1];
    for(int i = 0; i < profits.length; i++){
        dp[i][0] = 0;
        for(int c = 1; c <= capacity; c++){
            int profit1 = 0, profit2 = 0;
            if(weights[i] <= c)
                profit1 = i!=0 ? profits[i] + dp[i-1][c-weights[i]]: profits[i];
            if(i > 0)
                profit2 = dp[i-1][c];
            dp[i][c] = Math.max(profit1,profit2);
        }
    }
    return dp[profits.length-1][capacity];
}
```

Bottom up, Space: O(capacity)

```java
public int knapsack(int capacity, int[] profits, int[] weights){
    int[] dp = new int[capacity+1];
    for(int i = 0; i < profits.length; i++){
        dp[0] = 0;
        for(int c = capacity; c >= 1; c--){
             int profit1 = 0, profit2 = 0;
             profit2 = dp[c];
             if(weights[i] <= c)
                  profit1 = profits[i] + dp[c-weights[i]];
             dp[c] = Math.max(profit1,profit2);
        }
    }
    return dp[capacity];
}
```

### Equal Subset Sum Partition

Given a set of positive numbers, find if we can partition it into two subsets such that the sum of elements in both the subsets is equal.

Input: `{1, 1, 3, 4, 7}`
Output: True
Explanation: The given set can be partitioned into two subsets with equal sum: `{1, 3, 4}` & `{1, 7}`

Solutions: Assume if S represents the total sum of all the given numbers, then the two equal subsets must have a sum equal to S/2. This essentially transforms our problem to: "Find a subset of the given numbers that has a total sum of S/2". If such partition exists return true. Test: `{1,3}`. The given array can be thought of weights array in knapsack problem.

### Subset Sum

Given a set of positive numbers, determine if there exists a subset whose sum is equal to a given number 'S'.

Input: `{1, 2, 7, 1, 5}`, S=10
Output: True
The given set has a subset whose sum is '10': `{1, 2, 7}`

### Minimum Subset Sum Difference

Given a set of positive numbers, partition the set into two subsets with a minimum difference between their subset sums.

Input: `{1, 2, 7, 1, 5}`
Output: 0
Explanation: We can partition the given set into two subsets where minimum absolute difference between the sum of number is '0'. Following are the two subsets: `{1, 2, 5}` & `{7, 1}`.

Solution: Let's assume 'S' represents the total sum of all the numbers. So what we are trying to achieve in this problem is to find a subset whose sum is as close to 'S/2' as possible, because if we can partition the given set into two subsets of an equal sum, we get the minimum difference i.e. zero. This transforms our problem to Subset Sum, where we try to find a subset whose sum is equal to a given number--'S/2' in our case. If we can't find such a subset, then we will take the subset which has the sum closest to 'S/2'.

### Count of Subset Sum

Given a set of positive numbers, find the total number of subsets whose sum is equal to a given number 'S'.

Input: `{1, 2, 7, 1, 5}`, S=9
Output: 3
The given set has '3' subsets whose sum is '9': `{2, 7}`, `{1, 7, 1}`, `{1, 2, 1, 5}`

### Target Sum

Given a set of positive numbers (non zero) and a target sum 'S'. Each number should be assigned either a '+' or '-' sign. We need to find out total ways to assign symbols to make the sum of numbers equal to target 'S'.

Input: `{1, 1, 2, 3}`, S=1
Output: 3
Explanation: The given set has '3' ways to make a sum of '1': `{+1-1-2+3}` & `{-1+1-2+3}` & `{+1+1+2-3}`

This problem follows the 0/1 Knapsack pattern and can be converted into Count of Subset Sum.

We are asked to find two subsets of the given numbers whose difference is equal to the given target 'S'. Take the first example above. As we saw, one solution is `{+1-1-2+3}`. So, the two subsets we are asked to find are `{1, 3}` & `{1, 2}`.

Now, let's say 'Sum(s1)' denotes the total sum of set 's1', and 'Sum(s2)' denotes the total sum of set 's2'.

$$Sum(s_1) - Sum(s_2) = S$$

This equation can be reduced to the subset sum problem. Let's assume that 'Sum(num)' denotes the total sum of all the numbers, therefore:

$$Sum(s_1) + Sum(s_2) = Sum(num)$$

Let's add the above two equations:

$$Sum(s_1) - Sum(s_2) + Sum(s_1) + Sum(s_2) = S + Sum(num)$$

$$2 \cdot Sum(s_1) = S + Sum(num)$$

$$Sum(s_1) = \frac{S + Sum(num)}{2}$$

This essentially converts our problem to: "Find count of subsets of the given numbers whose sum is equal to"

$$\frac{S + Sum(num)}{2}$$

### Unbounded Knapsack

The only difference between the 0/1 Knapsack problem and this problem is that we are allowed to use an unlimited quantity of an item.

Brute Force T.C:

For regular Knapsack problem it's O(2^N). Inside recursive function we do recursion twice, so we could visualize call stack as a binary tree (left-> using item, right child-> not using item). To find number of nodes (recursive calls) we use formula (2^(N+1)) - 1 (asymptotically O(2^N)). In the unbound knapsack we have more items than N (as we can reuse them), so it's equal O(2^(N+X)), where X is number of times we reused items. The sum of reused items (X) can't be more than C (capacity), so if we reused the smallest item (worst case), it would be C/S (S - smallest item). In case if S == 1, like we have in the problem, C/S == C == X, so O(2^(N+X)) == O(2^(N+C)).

```java
public static int unboundedKnapsack(int[] profits, int[] weights, int capacity){
    int[] dp = new int[capacity+1];

    for(int i = 0; i < profits.length; i++)
        for(int c = 0; c <= capacity; c++) // Note: c starts from 0 here
              if(c >= weights[i])
                  dp[c] = Math.max(dp[c], profits[i] + dp[c-weights[i]]);

    return dp[capacity];
}
```

### Rod Cutting

Given a rod of length 'n', we are asked to cut the rod and sell the pieces in a way that will maximize the profit. We are also given the price of every piece of length 'i' where `1 <= i <= n`.

Lengths: `[1, 2, 3, 4, 5]`
Prices: `[2, 6, 7, 10, 13]`
Rod Length: 5
Two pieces of length 2 and one piece of length 1 => 14 price

Solution: This problem can be mapped to the Unbounded Knapsack pattern. The Weights array of the Unbounded Knapsack problem is equivalent to Lengths array, and Profits is equivalent to Prices.

### Coin Change

Given an infinite supply of 'n' coin denominations and a total money amount, we are asked to find the total number of distinct ways to make up that amount.

Denominations: `{1,2,3}`
Total amount: 5
Output: 5

This problem is quite similar to Count of Subset Sum. The only difference here is that after including the item (i.e. coin), we recursively call to process all the items (including the current coin). In 'Count of Subset Sum', however, we were recursively calling to process only the remaining items.

### Minimum Coin Change

Given an infinite supply of 'n' coin denominations and a total money amount, we are asked to find the minimum number of coins needed to make up that amount.

### Maximum Ribbon Cut

We are given a ribbon of length 'n' and a set of possible ribbon lengths. Now we need to cut the ribbon into the maximum number of pieces that comply with the above-mentioned possible lengths. Write a method that will return the count of pieces.

### Fibonacci numbers

Write a function to calculate the nth Fibonacci number.

```java
public int nthfib(int n){
    if(n <= 2)      return n-1;   // 0 1
    int[] dp = new int[n+1];
    dp[1] = 0;
    dp[2] = 1;
    for(int i = 3; i <= n; i++)
         dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}
```

Also, direct formula for nth fibonacci number:

$$F(n) = \frac{\left[\frac{\sqrt{5}+1}{2}\right]^n}{\sqrt{5}}$$

```java
// return (int) Math.round(Math.pow(phi, n)/ Math.sqrt(5));
```

Also, sum of first n fibonacci numbers: F(n+2)

### Longest Palindromic Subsequence

Given a sequence, find the length of its Longest Palindromic Subsequence (LPS). In a palindromic subsequence, elements read the same backward and forward.

This form of solution is hard to reduce the space complexity:

```java
public static int longestPalindromicSubsequence(String s){
    int n = s.length();
    int[][] dp = new int[n][n];

    for(int l = 1; l <= n; l++)
        for(int i=0, j=i+l-1; i < n && j < n; i++,j++){
            if(l == 1)    dp[i][j] = 1;
            else if(s.charAt(i) == s.charAt(j)) dp[i][j] = 2 + dp[i+1][j-1];
            else dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
        }

    return dp[0][n-1];
}
```

Another form would be to use the fact that in order to fill the current entry I need 3 pieces of information: left cell, bottom cell and bottom-left cell (when charAt[i] == charAt[j]). This is done by bottom up filling table. This solution can be space optimised to O(n).

```java
for(int i = n-1; i >= 0; i--)
    for(int j = i; j < n; j++){
        if(i == j)   dp[i][j] = 1;
        else if(s.charAt(i) == s.charAt(j)) dp[i][j] = 2 + dp[i+1][j-1];
        else dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
    }
```

For input String `"abdbca"` we have the following dp table (rows i, columns j):

```
0    1, 1, 1, 3, 3, 5,
1    0, 1, 1, 3, 3, 3,
2    0, 0, 1, 1, 1, 1,
3    0, 0, 0, 1, 1, 1,
4    0, 0, 0, 0, 1, 1,
5    0, 0, 0, 0, 0, 1,
```

Output: 5

### Longest Palindromic Substring

Given a string, find the length of its Longest Palindromic Substring (LPS). In a palindromic string, elements read the same backward and forward.

Input: `"abdbca"`
Output: 3
Explanation: LPS is `"bdb"`.

![Handwritten DP table for abdbca longest palindromic subsequence](/coding-ref/i-031-028.webp)

**[Figure]** Handwritten DP table for "abdbca" (columns a b d b c a, rows a b d b c a) with arrows tracing back from the cell for 3; green circles mark the matches "bdb" (length 3) and "bd"-side entries; the boxed word abdba is written at top right; the bottom shows the matched pairs (a-a, b-b, d-d) forming the palindrome.

Figure: DP table over `a b d b c a` (rows and columns), with entries `3` in the `d`/`b` cells circled in green and red back-tracking arrows. Callouts: `"bdb"` and `"bd"`. Boxed result `abdba`.

### Count of Palindromic Substrings

Given a string, find the total number of palindromic substrings in it. Please note we need to find the total number of substrings and not subsequences.

Input: `"abdbca"`
Output: 7
Explanation: Here are the palindromic substrings, `"a"`, `"b"`, `"d"`, `"b"`, `"c"`, `"a"`, `"bdb"`.

![Handwritten boolean palindrome table for cddpd](/coding-ref/i-032-029.webp)

**[Figure]** Handwritten boolean palindrome table for the word "cddpd" (columns c d d p d, rows c d d p d) with T/F entries, green circles on the palindromic results "ddpd" and "dpd" and arrows tracing the diagonal fill; title written as "cddpd" with "dpd" boxed.

Figure: boolean table over `c d d p d` with `T` on the diagonal, arrows showing `dpd` and `ddpd` as palindromic (green callouts `"ddpd"` and `"dpd"`).

### Minimum Deletions in a String to make it a Palindrome

Given a string, find the minimum number of characters that we can remove to make it a palindrome.

Input: `"abdbca"`
Output: 1
Explanation: By removing `"c"`, we get a palindrome `"abdba"`.

Solution: This problem can be easily converted to the Longest Palindromic Subsequence (LPS) problem. We can use the fact that LPS is the best subsequence we can have, so any character that is not part of LPS must be removed.

Above Solution also works in case of Minimum insertions in a string to make it a palindrome problem.

### Palindromic Partitioning

Given a string, we want to cut it into pieces such that each piece is a palindrome. Write a function to return the minimum number of cuts needed.

Input: `"abdbca"`
Output: 3
Explanation: Palindrome pieces are `"a"`, `"bdb"`, `"c"`, `"a"`.

The following solution is wrong, for Input: `"ababb"` correct answer will be 1 with `"aba"`, `"bb"` as pieces.

Solution: This problem is very similar to both Longest Palindromic Substring and Subsequence. First we find all the substring which are palindrome is store them in `isPalindrome[][]` array. Second, at each position dp[i][j] of new dp[][] array, we can place a partition before i+1 (ie. i|[i+1, ... j] ) or before j (ie. [i ... ,j-1]|j) or place a "0" incase [i ... j] represents a palindromic substring.

![Handwritten cut-placement diagram and DP table for abdbca](/coding-ref/i-033-030.webp)

**[Figure]** Handwritten cut-placement diagram for "abdbca" split as a|bdb|c|a with the recurrence dp[i][j] = min(dp[i+1][j], dp[i][j-1]) + 1, and dp[i][j] = 0 if [i...j] is a palindrome; a 2D table with columns a b d b c a is filled with the resulting cut counts.

Figure: DP table over `a b d b c a` with final answer cell `2` circled, and the handwritten recurrence:

```
dp[i][j] = min( dp[i+1][j], dp[i][j-1] ) + 1
if ([i...j] is a palindrome) dp[i][j] = 0
```

The correct solution:

Solution:
1. First find all substring palindromes in O(n^2).
2. Now to find the minimum cuts we define `cuts[]` array, which store the minimum cuts required for `[i ... n-1]`.

![Handwritten isPalin() table and CUTS array for ababb](/coding-ref/i-034-031.webp)

**[Figure]** Handwritten isPalin() table (rows and columns 0-4 for "ababb", with entries 1 = palindrome) and CUTS array with values 1 1 1 0 0 for indices 0-4; the word ababb is written below with a cut marked between "aba" and "bb".

Figure: `isPalin()` boolean table over indices 0-4 of `ababb`, and `CUTS` array `[1, 1, 1, 0, 0]` for indices 0-4 (values shown as handwritten `1 1 1 0 0`), with a red cut marker between `aba` and `bb`.

Now for each substring `[i ... n-1]` we find the minimum cuts by looping for `0 <= k < n-1`, then, checking if left part `[i ... k]` is a palindrome then the left part of partition needs 0 partition, otherwise left part will have `k-i` partitions; for right part we have already computed `cuts[i+1]`.

### Longest Common Substring

Given two strings 's1' and 's2', find the length of the longest substring which is common in both the strings.

```java
public static int LCSubstring(char[] s1, char[] s2){
    int mx = 0, n1 = s1.length, n2 = s2.length;
    int[][] dp = new int[n1+1][n2+1];

    for(int i = 0; i <= n1; i++)
       for(int j = 0; j <= n2; j++){
            if(i == 0 || j == 0)    dp[i][j] = 0;
            else if(s1[i-1] == s2[j-1]) dp[i][j] = 1+dp[i-1][j-1];
            mx = mx > dp[i][j]? mx: dp[i][j];
       }
    return mx;
}
```

### Longest Common Subsequence

Given two strings 's1' and 's2', find the length of the longest subsequence which is common in both the strings.

Input: s1 = `"abdca"`, s2 = `"cbda"`
Output: 3
Explanation: The longest common subsequence is `"bda"`.

Since we want to match all the subsequences of the given two strings, we can use a two-dimensional array to store our results. The lengths of the two strings will define the size of the array's two dimensions. So for every index 'i' in string 's1' and 'j' in string 's2', we will choose one of the following two options:

1. If the character s1[i] matches s2[j], the length of the common subsequence would be one plus the length of the common subsequence till the i-1 and j-1 indexes in the two respective strings.
2. If the character s1[i] does not match s2[j], we will take the longest subsequence by either skipping ith or jth character from the respective strings.

![Handwritten LCS dynamic-programming table for abdca and cbda](/coding-ref/i-035-032.webp)

**[Figure]** Handwritten LCS dynamic-programming table for s1 = "abdca" (columns) and s2 = "cbda" (rows), with the matched common subsequence "bda" traced by red arrows and a green-circled match, and "s1: abd / s2: cb" annotations.

Figure: LCS table with rows `∅ c b d a` and columns `∅ a b d c a`; the traced matches form `b`, `d`, `a` (common subsequence `bda`), with `s1: "abd"` and `s2: "cb"` annotations.

### Minimum Deletions & Insertions to Transform a String into another

Given strings s1 and s2, we need to transform s1 into s2 by deleting and inserting characters. Write a function to calculate the count of the minimum number of deletion and insertion operations.

Input: s1 = `"abdca"`, s2 = `"cbda"`
Output: 2 deletions and 1 insertion.
Explanation: We need to delete `{'a', 'c'}` and insert `{'c'}` to s1 to transform it into s2.

If we can find the LCS of the two input strings, we can easily find how many characters we need to insert and delete from s1.

1. Let's assume len1 is the length of s1 and len2 is the length of s2.
2. Now let's assume c1 is the length of LCS of the two strings s1 and s2.
3. To transform s1 into s2, we need to delete everything from s1 which is not part of LCS, so minimum deletions we need to perform from s1 => len1 - c1
4. Similarly, we need to insert everything in s1 which is present in s2 but not part of LCS, so minimum insertions we need to perform in s1 => len2 - c1

### Longest Increasing Subsequence

Given a number sequence, find the length of its Longest Increasing Subsequence (LIS). In an increasing subsequence, all the elements are in increasing order (from lowest to highest).

Input: `{4,2,3,6,10,1,12}`
Output: 5
Explanation: The LIS is `{2,3,6,10,12}`.

Solution: if num[i] > num[j] => dp[i] = dp[j] + 1 if there is no bigger LIS for 'i', for all (j < i).

### Shortest Common Super-sequence

Given two sequences 's1' and 's2', write a method to find the length of the shortest sequence which has 's1' and 's2' as subsequences.

Input: s1: `"abcf"`, s2: `"bdcf"`
Output: 5
Explanation: The shortest common super-sequence (SCS) is `"abdcf"`.

1. If the character s1[i] matches s2[j], the length of the SCS would be one plus the length of the SCS till i-1 and j-1 indexes in the two strings.
2. If the character s1[i] does not match s2[j], we will consider two SCS: one without s1[i] and one without s2[j]. Our required SCS length will be the shortest of these two super-sequences plus one.

### Minimum Deletions to Make a Sequence Sorted

Given a number sequence, find the minimum number of elements that should be deleted to make the remaining sequence sorted.

Input: `{4,2,3,6,10,1,12}`
Output: 2
Explanation: We need to delete `{4,1}` to make the remaining sequence sorted `{2,3,6,10,12}`.

Alternately, we can convert this problem into a Longest Increasing Subsequence (LIS) problem. As we know that LIS will give us the length of the longest increasing subsequence (in the sorted order!). So, subtracting the length of LIS from the length of the input array:

`Length-of-input-array - LIS()`

### Longest Repeating Subsequence

Given a sequence, find the length of its longest repeating subsequence (LRS). A repeating subsequence will be the one that appears at least twice in the original sequence and is not overlapping (i.e. none of the corresponding characters in the repeating subsequences have the same index).

Input: `"a a b d b c e c"`
Output: 3
The longest repeating subsequence is “a b c” from `a a b d b c e c`.

1. If `i1` and `i2` are different and the character `str[i1]` matches the character `str[i2]`, then the length of the LRS is one plus the length of the LRS up to indexes `i1-1` and `i2-1`.
2. If the character at `str[i1]` does not match `str[i2]`, we take the LRS by either skipping the `i1`'th or the `i2`'th character.

![LRS DP grid](/coding-ref/i-038-033.webp)

**Figure (LRS DP grid):** rows and columns are prefixes (ϕ, a, a, b, d, …); blue cell values 0/1/2 with a red diagonal path. Hand-drawn, partially legible.

## Subsequence Pattern Matching

Given a string and a pattern, write a method to count the number of times the pattern appears in the string as a subsequence.

Input: string: “tomorrow”, pattern: “tor”
Output: 4
Explanation: Following are the four occurrences: `{tomorrow, tomorrow, tomorrow, tomorrow}`.

1. If the character at `strIndex` equals the one at `patIndex`, then the count will be `dp[patIndex-1][strIndex-1]`.
2. At every step we skip a character from the string and try matching the remaining string with the pattern, so we add to the count by ignoring the current `strIndex`: `dp[patIndex][strIndex-1]`.

![Subsequence pattern matching DP table](/coding-ref/i-039-034.webp)

DP table (rows = pattern prefixes ϕ, t, to, tor; columns = string prefix ϕ, t, o, m, o, r, r, o, w; transcribed from the handwritten table):

| pattern \ string | ϕ | t | o | m | o | r | r | o | w |
|---|---|---|---|---|---|---|---|---|---|
| ϕ | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| t | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| to | 0 | 0 | 1 | 1 | 2 | 2 | 2 | 3 | 3 |
| tor | 0 | 0 | 0 | 0 | 0 | 2 | 4 | 4 | 4 |

## Longest Bitonic Subsequence

Given a number sequence, find the length of its Longest Bitonic Subsequence (LBS). A subsequence is considered bitonic if it is monotonically increasing and then monotonically decreasing.

Input: `{4,2,5,9,7,6,10,3,1}`
Output: 7
Explanation: The LBS is `{4,5,9,7,6,3,1}`.

### Approach 1

1. Find the LIS and LDS arrays separately.
2. For each index `i`, find the maximum possible value of `LIS[i]+LDS[i]-1`.

### Approach 2

1. Find the LDS from `i` to the beginning.
2. Find the LDS from `i` to the end.
3. For each index `i`, find the maximum possible value of `LDS1[i]+LDS2[i]-1`.

![LIS LDS LBS table](/coding-ref/i-039-035.webp)

**Figure (LBS table, input 4, 2, 5, 9, 7, 6, 10, 3, 1):** LIS (longest increasing subsequence) = 1 1 2 3 3 3 4 2 1; LDS (longest decreasing subsequence) = 3 2 3 5 4 3 3 2 1; LBS (longest bitonic subsequence) = 3 2 4 7 6 5 6 3 1.

## Longest Alternating Subsequence

Given a number sequence, find the length of its Longest Alternating Subsequence (LAS). A subsequence is considered alternating if its elements are in alternating order.

A three element sequence (a1, a2, a3) will be an alternating sequence if its elements hold one of the following conditions:

`{a1 > a2 < a3 }` or `{ a1 < a2 > a3}`.

Input: `{1,2,3,4}`
Output: 2
Explanation: There are many LAS: `{1,2}`, `{3,4}`, `{1,3}`, `{1,4}`.

If `i` represents the currentIndex and `j` represents the previousIndex, our recursive formula would look like:

- If `nums[i]` is bigger than `nums[j]`, then we consider the LAS ending at `j` where the last two elements were in descending order: if `nums[i] > nums[j]` then `dp[i][0] = 1 + dp[j][1]`, if there is no bigger LAS for `i`.
- If `nums[i]` is smaller than `nums[j]`, then we consider the LAS ending at `j` where the last two elements were in ascending order: if `nums[i] < nums[j]` then `dp[i][1] = 1 + dp[j][0]`, if there is no bigger LAS for `i`.

![LAS table input 1 3 2 4 ascending/descending](/coding-ref/i-040-036.webp)

**Figure (input 1, 3, 2, 4):** row "ascending" = 1 2 2 4; row "descending" = 1 1 3 1; row "max=" = 1 2 3 4.

![LAS table input 1 3 2 4 alternating](/coding-ref/i-040-037.webp)

**Figure (input 1, 3, 2, 4):** row `> <` = 1 1 3 1; row `< >` = 1 2 2 4.

or

## Edit Distance

Given strings `s1` and `s2`, we need to transform `s1` into `s2` by deleting, inserting, or replacing characters. Write a function to calculate the count of the minimum number of edit operations.

Input: `s1 = "abdca"`
`s2 = "cbda"`
Output: 2
Explanation: We can replace the first 'a' with 'c' and delete the second 'c'.

1. If the character `s1[i1]` matches `s2[i2]`, the count of the edit operations is equal to the count of the edit operations for the remaining strings.
2. If the character `s1[i1]` does not match `s2[i2]`, we take the minimum count from the remaining strings after performing any of the three edit operations.

```text
if(s1[i1] == s2[i2])
    dp[i1][i2] = dp[i1-1][i2-1]
else
    dp[i1][i2] = 1 + min(dp[i1-1][i2],   // remove i1 from s1
                        dp[i1][i2-1],    // insert s2[i2] at i1 in s1
                        dp[i1-1][i2-1]); // replace i1 in s1
```

## Strings Interleaving

Given three strings `m`, `n`, and `p`, write a method to find out if `p` has been formed by interleaving `m` and `n`. `p` would be considered interleaving `m` and `n` if it contains all the letters from `m` and `n` and the order of letters is preserved too.

Input: `m="abd", n="cef", p="abcdef"`
Output: true
Explanation: 'p' contains all the letters from 'm' and 'n' and preserves their order too.

1. If the character `m[mIndex]` matches the character `p[pIndex]`, we take the matching result up to `mIndex-1` and `nIndex`.
2. If the character `n[nIndex]` matches the character `p[pIndex]`, we take the matching result up to `mIndex` and `nIndex-1`.

![Strings interleaving table](/coding-ref/i-042-038.webp)

**Figure (interleaving table):** columns ϕ, c, e, f; rows ϕ, a, b, d; the string `a b c d e f` is written below. T marks matching cells, with arrows showing the path back to the origin.

![T/F matching table aadbbcbcac](/coding-ref/i-042-039.webp)

**Figure (T/F table):** matching table for string `aadbbcbcac` (indices 1–10 below the string), column headers ϕ, a, a, b, c, c, and row labels ϕ, d, b, c, a (handwritten, partly legible). A green box marks the pattern prefix; the highlighted T cell is annotated with the matched subsequence "a a b d b" (indices 1, 2, 3, 4, 5). Hand-drawn, partially legible.

