---
title: Segment Trees
description: a binary-tree data structure for efficient range queries and updates. Covers construction, point and range updates, lazy propagation, complexity analysis (build/query/update in O(log n)), and common implementation patterns with examples and pitfalls.
---

## When 2 use ?

Need to be used in scenarios where we require to perform fast range-max(or min|sum) queries with point updates.

Can also check [Square root decomposition technique](/coding/competitive/square-root-decomposition/)

## Datastructure design & operations

The segment tree, contains actual array data in the leaf nodes, and the internal nodes stores the value of specific operation performed on it's children (segment of the array). This design allows efficient computation of range queries.

It performs two key operations
- range query - `log(n)`
- point update- `log(n)`

## Example

Given an array `a[N] = {2,4,5,1,6,4, ...}`, we need to handle the update and queries:
- update `a[i] to x`
- query `sum for range [l,r] = a[l]+a[l+1]+a[l+2]... +a[r]` # could also be Range minimum query

In this case the internal nodes of the segment tree will contain the sum of it's children leaf nodes.

### Visual Representation

#### 1. Original Input Array

The segment tree is built from an input array. Each element will eventually be stored in a leaf node of the tree.

```d2
grid-columns: 6

a0: "a[0] = 2" {
  style.fill: "#ffd97d"
  style.stroke: "#ff8c00"
  style.font-color: "#000"
}
a1: "a[1] = 4" {
  style.fill: "#90ee90"
  style.stroke: "#2e8b57"
  style.font-color: "#000"
}
a2: "a[2] = 5" {
  style.fill: "#ffb3ba"
  style.stroke: "#dc143c"
  style.font-color: "#000"
}
a3: "a[3] = 1" {
  style.fill: "#dda0dd"
  style.stroke: "#9370db"
  style.font-color: "#000"
}
a4: "a[4] = 6" {
  style.fill: "#87ceeb"
  style.stroke: "#4169e1"
  style.font-color: "#000"
}
a5: "a[5] = 4" {
  style.fill: "#ffb6c1"
  style.stroke: "#c71585"
  style.font-color: "#000"
}
```

#### 2. Segment Tree Structure

The tree stores array elements at leaf nodes (with bold borders) and aggregated values (sums) at internal nodes. Each node tracks its range coverage `[left, right]` and the corresponding tree array index.

```d2
direction: down

n1: |md
  **tree[1] = 22**
  range: [0-5]
| {
  style.fill: "#5dade2"
  style.stroke: "#2874a6"
  style.stroke-width: 2
  style.font-color: "#000"
}

n2: |md
  **tree[2] = 11**
  range: [0-2]
| {
  style.fill: "#90ee90"
  style.stroke: "#2e8b57"
  style.font-color: "#000"
}

n3: |md
  **tree[3] = 11**
  range: [3-5]
| {
  style.fill: "#ffb6c1"
  style.stroke: "#c71585"
  style.font-color: "#000"
}

n4: |md
  **tree[4] = 6**
  range: [0-1]
| {
  style.fill: "#7fffd4"
  style.stroke: "#20b2aa"
  style.font-color: "#000"
}

n5: |md
  **tree[5] = 5**
  range: [2-2]
| {
  style.fill: "#ffb3ba"
  style.stroke: "#dc143c"
  style.font-color: "#000"
}

n6: |md
  **tree[6] = 7**
  range: [3-4]
| {
  style.fill: "#dda0dd"
  style.stroke: "#9370db"
  style.font-color: "#000"
}

n7: |md
  **tree[7] = 4**
  range: [5-5]
| {
  style.fill: "#ffb6c1"
  style.stroke: "#c71585"
  style.font-color: "#000"
}

n8: |md
  **tree[8] = 2**
  range: [0-0]
  **leaf: a[0]**
| {
  style.fill: "#ffd97d"
  style.stroke: "#ff8c00"
  style.stroke-width: 3
  style.font-color: "#000"
}

n9: |md
  **tree[9] = 4**
  range: [1-1]
  **leaf: a[1]**
| {
  style.fill: "#90ee90"
  style.stroke: "#2e8b57"
  style.stroke-width: 3
  style.font-color: "#000"
}

n10: |md
  **tree[10] = 1**
  range: [3-3]
  **leaf: a[3]**
| {
  style.fill: "#dda0dd"
  style.stroke: "#9370db"
  style.stroke-width: 3
  style.font-color: "#000"
}

n11: |md
  **tree[11] = 6**
  range: [4-4]
  **leaf: a[4]**
| {
  style.fill: "#87ceeb"
  style.stroke: "#4169e1"
  style.stroke-width: 3
  style.font-color: "#000"
}

n1 -> n2: "left\n2*i"
n1 -> n3: "right\n2*i+1"
n2 -> n4
n2 -> n5
n3 -> n6
n3 -> n7
n4 -> n8
n4 -> n9
n6 -> n10
n6 -> n11
```

**Key observations:**
- The root node `tree[1]` covers the entire array range `[0-5]` with sum = 22
- Each parent's value equals the sum of its two children
- Leaf nodes (bold borders) store individual array elements
- Node indices follow the pattern: left child = `2*i`, right child = `2*i+1`, parent = `i/2`

#### 3. Memory Layout (Array Representation)

The tree is stored as a 1D array using 1-based indexing. This allows efficient parent-child navigation using simple arithmetic.

```d2
grid-columns: 12

t0: "tree[0]\nunused" {
  style.fill: "#a9a9a9"
  style.stroke: "#696969"
  style.font-color: "#000"
}

t1: "tree[1]\n22\n[0-5]" {
  style.fill: "#5dade2"
  style.stroke: "#2874a6"
  style.font-color: "#000"
}

t2: "tree[2]\n11\n[0-2]" {
  style.fill: "#90ee90"
  style.stroke: "#2e8b57"
  style.font-color: "#000"
}

t3: "tree[3]\n11\n[3-5]" {
  style.fill: "#ffb6c1"
  style.stroke: "#c71585"
  style.font-color: "#000"
}

t4: "tree[4]\n6\n[0-1]" {
  style.fill: "#7fffd4"
  style.stroke: "#20b2aa"
  style.font-color: "#000"
}

t5: "tree[5]\n5\n[2-2]" {
  style.fill: "#ffb3ba"
  style.stroke: "#dc143c"
  style.font-color: "#000"
}

t6: "tree[6]\n7\n[3-4]" {
  style.fill: "#dda0dd"
  style.stroke: "#9370db"
  style.font-color: "#000"
}

t7: "tree[7]\n4\n[5-5]" {
  style.fill: "#ffb6c1"
  style.stroke: "#c71585"
  style.font-color: "#000"
}

t8: "tree[8]\n2\n[0-0]" {
  style.fill: "#ffd97d"
  style.stroke: "#ff8c00"
  style.stroke-width: 2
  style.font-color: "#000"
}

t9: "tree[9]\n4\n[1-1]" {
  style.fill: "#90ee90"
  style.stroke: "#2e8b57"
  style.stroke-width: 2
  style.font-color: "#000"
}

t10: "tree[10]\n1\n[3-3]" {
  style.fill: "#dda0dd"
  style.stroke: "#9370db"
  style.stroke-width: 2
  style.font-color: "#000"
}

t11: "tree[11]\n6\n[4-4]" {
  style.fill: "#87ceeb"
  style.stroke: "#4169e1"
  style.stroke-width: 2
  style.font-color: "#000"
}
```

**Navigation Formulas:**
- Left child of node i: **2 × i**
- Right child of node i: **2 × i + 1**
- Parent of node i: **i ÷ 2** (integer division)
- **Space Complexity:** O(4n) for array of size n

**Why 1-based indexing?**

- Simplifies parent-child calculations (no need for `2*i+1` vs `2*i+2`)
- `tree[0]` remains unused but makes the math cleaner
- Industry standard for segment tree implementations

## Implementation

### Range Sum Query

The range sum query recursively traverses the tree to find the sum of elements in the query range `[queryL, queryR]`.

```java
public int rangeSum(int[] tree, int node, int segL, int segR, int queryL, int queryR) {
    // Case 1: Complete overlap - current segment is completely inside query range
    if (queryL <= segL && segR <= queryR) {
        return tree[node];
    }
    
    // Case 2: No overlap - current segment is completely outside query range
    if (segR < queryL || queryR < segL) {
        return 0;  // Identity element for sum
    }
    
    // Case 3: Partial overlap - query range partially overlaps current segment
    int mid = (segL + segR) / 2;
    int leftSum = rangeSum(tree, 2*node, segL, mid, queryL, queryR);
    int rightSum = rangeSum(tree, 2*node+1, mid+1, segR, queryL, queryR);
    
    return leftSum + rightSum;
}

// Usage: rangeSum(tree, 1, 0, n-1, queryL, queryR)
```

**Algorithm Explanation:**

1. **Complete Overlap** (`queryL <= segL && segR <= queryR`):
   - The current segment `[segL, segR]` is completely inside the query range `[queryL, queryR]`
   - Return the precomputed value at this node
   - Example: Query `[1,4]` with segment `[1,1]` → return `tree[node]`

2. **No Overlap** (`segR < queryL || queryR < segL`):
   - The current segment is completely outside the query range
   - Return identity element (0 for sum, infinity for min, -infinity for max)
   - Example: Query `[1,4]` with segment `[5,5]` → return 0

3. **Partial Overlap**:
   - The segment partially overlaps with the query range
   - Recursively query both left and right children
   - Combine results using the operation (sum, min, max, etc.)

**Example Query: sum([1, 4])**

For array `a[] = {2,4,5,1,6,4}`, querying sum of range `[1,4]`:

```
Query: [1,4]
├─ Node 1 [0-5]: Partial overlap → recurse
   ├─ Node 2 [0-2]: Partial overlap → recurse
   │  ├─ Node 4 [0-1]: Partial overlap → recurse
   │  │  ├─ Node 8 [0-0]: No overlap → return 0
   │  │  └─ Node 9 [1-1]: Complete overlap → return 4 ✓
   │  └─ Node 5 [2-2]: Complete overlap → return 5 ✓
   └─ Node 3 [3-5]: Partial overlap → recurse
      ├─ Node 6 [3-4]: Complete overlap → return 7 ✓
      └─ Node 7 [5-5]: No overlap → return 0

Result: 4 + 5 + 7 = 16
```

**Time Complexity:** O(log n) - At most 4 nodes per level are visited

### Building the Segment Tree

```java
public void buildTree(int[] arr, int[] tree, int node, int start, int end) {
    if (start == end) {
        // Leaf node - store array element
        tree[node] = arr[start];
    } else {
        int mid = (start + end) / 2;
        
        // Build left and right subtrees
        buildTree(arr, tree, 2*node, start, mid);
        buildTree(arr, tree, 2*node+1, mid+1, end);
        
        // Internal node - store sum of children
        tree[node] = tree[2*node] + tree[2*node+1];
    }
}

// Usage: buildTree(arr, tree, 1, 0, n-1)
```

**Time Complexity:** O(n) - Each array element is visited once

### Point Update

```java
public void updatePoint(int[] tree, int node, int segL, int segR, int idx, int value) {
    if (segL == segR) {
        // Leaf node - update value
        tree[node] = value;
    } else {
        int mid = (segL + segR) / 2;
        
        if (idx <= mid) {
            // Update in left subtree
            updatePoint(tree, 2*node, segL, mid, idx, value);
        } else {
            // Update in right subtree
            updatePoint(tree, 2*node+1, mid+1, segR, idx, value);
        }
        
        // Update current node
        tree[node] = tree[2*node] + tree[2*node+1];
    }
}

// Usage: updatePoint(tree, 1, 0, n-1, idx, value)
```

**Time Complexity:** O(log n) - Traverse from root to leaf and update path

## Lazy Propagation

### Problem with Range Updates

In the basic segment tree, updating a range `[L, R]` requires updating all elements individually, which takes **O(n log n)** time. This becomes inefficient when we need frequent range updates.

**Example:** Update all elements in range `[2, 5]` by adding 10.
- Without lazy propagation: Update each of 4 elements → 4 × O(log n) = O(n log n)
- With lazy propagation: Update only necessary nodes → O(log n)

### Lazy Propagation Concept

**Core Idea:** Postpone updates to children until they are actually needed.

- Maintain a separate `lazy[]` array to store pending updates
- When updating a range, mark nodes with pending updates in `lazy[]`
- Only propagate updates down when querying or updating that subtree
- This allows range updates in O(log n) time

**Key Principles:**

1. **Lazy values represent pending operations** on a node's entire range
2. **Before processing a node**, apply and push down any pending updates
3. **Leaf nodes never have lazy values** (updates are immediately applied)

### Range Update with Lazy Propagation

```java
public void updateRange(int[] tree, int[] lazy, int node, int segL, int segR, 
                       int updateL, int updateR, int value) {
    // Step 1: Check if there's a pending update for this node
    if (lazy[node] != 0) {
        // Apply the pending update to current node
        tree[node] += (segR - segL + 1) * lazy[node];
        
        // Propagate to children if not a leaf node
        if (segL != segR) {
            lazy[2*node] += lazy[node];
            lazy[2*node+1] += lazy[node];
        }
        
        // Clear the lazy value
        lazy[node] = 0;
    }
    
    // Step 2: No overlap - current segment is outside update range
    if (segR < updateL || updateR < segL) {
        return;
    }
    
    // Step 3: Complete overlap - current segment is completely inside update range
    if (updateL <= segL && segR <= updateR) {
        // Update current node
        tree[node] += (segR - segL + 1) * value;
        
        // Mark children as lazy (postpone their updates)
        if (segL != segR) {
            lazy[2*node] += value;
            lazy[2*node+1] += value;
        }
        return;
    }
    
    // Step 4: Partial overlap - recursively update children
    int mid = (segL + segR) / 2;
    updateRange(tree, lazy, 2*node, segL, mid, updateL, updateR, value);
    updateRange(tree, lazy, 2*node+1, mid+1, segR, updateL, updateR, value);
    
    // Update current node from children
    tree[node] = tree[2*node] + tree[2*node+1];
}

// Usage: updateRange(tree, lazy, 1, 0, n-1, updateL, updateR, value)
```

**Algorithm Steps:**

1. **Apply pending updates** from `lazy[node]` before processing
2. **Check overlap conditions** (no overlap, complete, or partial)
3. **For complete overlap**: Update node and mark children as lazy
4. **For partial overlap**: Recursively update both children
5. **Recompute parent value** from updated children

### Range Query with Lazy Propagation

```java
public int queryRange(int[] tree, int[] lazy, int node, int segL, int segR, 
                     int queryL, int queryR) {
    // Step 1: Apply pending update before querying
    if (lazy[node] != 0) {
        tree[node] += (segR - segL + 1) * lazy[node];
        
        if (segL != segR) {
            lazy[2*node] += lazy[node];
            lazy[2*node+1] += lazy[node];
        }
        
        lazy[node] = 0;
    }
    
    // Step 2: No overlap
    if (segR < queryL || queryR < segL) {
        return 0;
    }
    
    // Step 3: Complete overlap
    if (queryL <= segL && segR <= queryR) {
        return tree[node];
    }
    
    // Step 4: Partial overlap
    int mid = (segL + segR) / 2;
    int leftSum = queryRange(tree, lazy, 2*node, segL, mid, queryL, queryR);
    int rightSum = queryRange(tree, lazy, 2*node+1, mid+1, segR, queryL, queryR);
    
    return leftSum + rightSum;
}

// Usage: queryRange(tree, lazy, 1, 0, n-1, queryL, queryR)
```

### Example: Range Update Walkthrough

**Initial Array:** `a[] = {2, 4, 5, 1, 6, 4}`  
**Operation:** Add 10 to range `[1, 3]`

```
Step 1: Start at root [0-5]
├─ Partial overlap → recurse to children
   ├─ Node 2 [0-2]: Partial overlap
   │  ├─ Process lazy updates (if any)
   │  ├─ Recurse to children
   │  │  ├─ Node 4 [0-1]: Partial overlap
   │  │  │  ├─ Node 8 [0-0]: No overlap → return
   │  │  │  └─ Node 9 [1-1]: Complete overlap
   │  │  │     └─ Update: tree[9] += 1*10, mark lazy[] = 0
   │  │  └─ Node 5 [2-2]: Complete overlap
   │  │     └─ Update: tree[5] += 1*10
   │  └─ Update parent: tree[2] = tree[4] + tree[5]
   │
   └─ Node 3 [3-5]: Partial overlap
      ├─ Node 6 [3-4]: Partial overlap
      │  ├─ Node 10 [3-3]: Complete overlap
      │  │  └─ Update: tree[10] += 1*10
      │  └─ Node 11 [4-4]: No overlap → return
      └─ Node 7 [5-5]: No overlap → return

After update: a[] = {2, 14, 15, 11, 6, 4}
Lazy array: Only pending values for unvisited nodes remain
```

**Key Advantage:** Only O(log n) nodes updated, not O(n)

### Complexity Analysis

| Operation | Without Lazy Propagation | With Lazy Propagation |
|-----------|-------------------------|----------------------|
| Point Update | O(log n) | O(log n) |
| Range Update | O(n log n) | **O(log n)** |
| Range Query | O(log n) | O(log n) |
| Space | O(4n) | O(8n) |

### Common Use Cases

1. **Range Addition/Subtraction**: Add/subtract value to all elements in range
2. **Range Set**: Set all elements in range to a specific value
3. **Combination queries**: Update ranges and query multiple times efficiently
4. **Interval scheduling**: Track overlapping intervals with updates

### Implementation Tips

1. **Initialize lazy array to 0** (identity element for the operation)
2. **Always check lazy values** before processing any node
3. **Clear lazy values** after propagating them down
4. **For set operations**, use a flag to distinguish between "add" and "set" modes
5. **Test edge cases**: single element ranges, full array updates, overlapping updates

