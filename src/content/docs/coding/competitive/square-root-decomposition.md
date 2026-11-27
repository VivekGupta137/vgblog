---
title: Square root decomposition (Mo's algorithm)
---

## Benefit
Allows to reduce the time complexity of linear scan to $\sqrt{n}$ 

## When 2 use ?
To be used in scenarios when we want to scan an array but the linear scan is expensive, but the scan also works if performed on groups of consecutive elements.


## Algorithm
Divide the array into $\sqrt{x}$ number of groups, with group size  $= \sqrt{x}$. And each group has value obtained by some operation$(max\ term | sum\ of\ all\ it's\ terms)$ on it's elements.


Now for each of these groups, we scan a group by making use of it's value and our condition.

## Space and time complexities
|||
|-|-|
|Find operation T.C.|$\sqrt{n}$|
|Update operation T.C.|$\sqrt{n}$|
|Space complexity|$\sqrt{n}$|

## Example

$Q.$ We want to scan an array to find the leftmost value $\ge$ $X$.

Let's say $A=[2,4,3,6,7,5,8,9,1,10,12,4,6,8,3,11]$ with $n=16$ elements.

Normal scan will be $O(n)$, but if we split the array into groups of $\sqrt{n}$ we can reduce it to $O(\sqrt{n})$:

### Step 1: Create Groups

Group size = $\sqrt{16} = 4$

Number of groups = $\lceil n / \sqrt{n} \rceil = 4$

```
Original Array: [2, 4, 3, 6, 7, 5, 8, 9, 1, 10, 12, 4, 6, 8, 3, 11]

Group 0: [2, 4, 3, 6]     → max = 6
Group 1: [7, 5, 8, 9]     → max = 9
Group 2: [1, 10, 12, 4]   → max = 12
Group 3: [6, 8, 3, 11]    → max = 11
```

### Step 2: Query Processing

**Query: Find leftmost element $\ge 10$**

1. **Scan Group 0** (max = 6): 
   - 6 < 10, skip entire group ✗
   
2. **Scan Group 1** (max = 9): 
   - 9 < 10, skip entire group ✗
   
3. **Scan Group 2** (max = 12): 
   - 12 ≥ 10, search inside group ✓
   - Check elements: 1 < 10, 10 ≥ 10 ✓
   - **Answer: Index 9, Value = 10**

**Analysis:**
- Groups checked: 3 groups
- Elements scanned: 2 elements (inside Group 2)
- Total operations: $O(\sqrt{n}) + O(\sqrt{n}) = O(\sqrt{n})$
- Without decomposition: Would need to check all 10 elements

### Step 3: More Examples

**Query: Find leftmost element $\ge 5$**

1. Group 0 (max = 6): 6 ≥ 5 ✓
   - Scan: 2 < 5, 4 < 5, 3 < 5, 6 ≥ 5 ✓
   - **Answer: Index 3, Value = 6**

**Query: Find leftmost element $\ge 15$**

1. Group 0 (max = 6): Skip
2. Group 1 (max = 9): Skip
3. Group 2 (max = 12): Skip
4. Group 3 (max = 11): Skip
- **Answer: Not found**

### Complexity Analysis

| Operation | Time Complexity |
|-----------|----------------|
| Preprocessing (build groups) | $O(n)$ |
| Query (find element) | $O(\sqrt{n})$ |
| Update element | $O(1)$ for value, $O(\sqrt{n})$ for group max |
| Space | $O(\sqrt{n})$ for group metadata |

**Trade-off:**
- Linear scan: $O(n)$ query, $O(1)$ update
- Square root decomposition: $O(\sqrt{n})$ query, $O(\sqrt{n})$ update
- Segment tree: $O(\log n)$ query, $O(\log n)$ update (but more complex)

### Implementation

```java
int[] arr = {2, 4, 3, 6, 7, 5, 8, 9, 1, 10, 12, 4, 6, 8, 3, 11};
int n = arr.length;
int blockSize = (int) Math.sqrt(n);  // 4
int[] groupMax = new int[4];  // Store max of each group

// Build: Compute max for each group - O(n)
for (int i = 0; i < n; i++) {
    int block = i / blockSize;
    groupMax[block] = Math.max(groupMax[block], arr[i]);
}

// Query: Find leftmost element >= target - O(√n)
int findLeftmost(int target) {
    for (int i = 0; i < groupMax.length; i++) {
        if (groupMax[i] < target) continue;  // Skip group
        
        // Search inside group
        for (int j = i * blockSize; j < Math.min((i + 1) * blockSize, n); j++) {
            if (arr[j] >= target) return j;
        }
    }
    return -1;
}

// Update: Change value and rebuild group - O(√n)
void update(int index, int value) {
    arr[index] = value;
    int block = index / blockSize;
    
    // Recalculate group max
    groupMax[block] = 0;
    for (int i = block * blockSize; i < Math.min((block + 1) * blockSize, n); i++) {
        groupMax[block] = Math.max(groupMax[block], arr[i]);
    }
}
```

### Use Cases

1. **Range queries on static/semi-static data**
   - When segment trees are overkill
   - Simple implementation needed
   
2. **Balance between preprocessing and query time**
   - Not as fast as segment tree ($\sqrt{n}$ vs $\log n$)
   - But simpler to implement and understand
   
3. **Memory-efficient solutions**
   - Uses less space than segment trees
   - Good for competitive programming

4. **Problems with complex operations**
   - Operations that don't easily decompose into segment tree logic
   - Custom aggregation functions

