---
title: Graph Algorithms Reference
description: "Graph notes: representations, traversal, sparse table and binary lifting, cycles, topological sort, SCC, Eulerian paths, articulation points, bridges, shortest paths and graph problems."
---

## Graphs

### Edge List Representation

```java
List<Pair> g;
EdgeGraph(int V){
    g = new ArrayList<Pair>();
    buildGraph();
}
private void addEdge(int u,int v){
    g.add(new Pair(u,v));
}
```

## Adjacency list Representations

### Using List

```java
public List<Integer>[] g;
public void addEdge(int u, int v) {
        if(g[u] == null) g[u] = new ArrayList<Integer>();
        g[u].add(v);
    }
```

### Another method

```java
List<int[]>[] g = new List[N+1];
// build Graph
for (int[] edge : times) {
    int u = edge[0], v = edge[1], w = edge[2];
    if(g[u] == null)      g[u] = new ArrayList<>();
    g[u].add(new int[]{v,w});
}
```

### Using Map

```java
Map<Integer, Set<Integer>> G = new HashMap<>();
// initialize graph by adding N nodes
for (int i = 0; i < N; i++) G.put(i, new HashSet<>());
// add the edges
G.get(u).add(v);
```

### BFS traversal

```java
public static void bfs(Graph G, int s) {
    Queue<Integer> q = new LinkedList<>();
    boolean[] visited = new boolean[G.g.length];
    q.add(s);
    visited[s] = true;
    while (!q.isEmpty()) {
        int u = q.poll();
        System.out.println(u);      // this vertex is visited
        if(G.g[u] != null)
            for (int v : G.g[u])
                 if(!visited[v]){
                       q.add(v);
                       visited[v] = true;
                   }
    }
}
```

### DFS traversal

```java
public static void dfsUtil(List<Integer>[] g,int start) {
    boolean[] visited = new boolean[g.length];
    dfs(g,start,visited);
}
public static void dfs(List<Integer>[] g,int curr,boolean[] visited){
    if(visited[curr] == true) return;
    visited[curr] = true;
    System.out.printf("%d ",curr);
    if(g[curr] != null)
            for (Integer v : g[curr])
               dfs(g,v,visited);
}
```

### Iterative

Iterative DFS (Java):

```java
public void dfs(String start, Map<String, Integer> visited, Map<String, List<String>> g){
    Stack<String> stack = new Stack<String>();
    stack.push(start);

    while(!stack.isEmpty()){
        String u = stack.pop();
        if(visited.get(u) == 1) continue;
        visited.put(u,1);

        for(String v: g.get(u)){
            if(visited.get(v) == 0)
                stack.push(v);
        }
    }
}
```

### Level Order Traversal

```java
Queue<TreeNode> q = new LinkedList<>();
q.add(root);
q.add(new TreeNode(-1));        // to mark the new level
int lvl = 0;
while(!q.isEmpty()){
    TreeNode pop = q.poll();
    if(pop.val == -1){
        lvl++;
        if(!q.isEmpty())      // if this queue is not empty || no more levels left
            q.add(new TreeNode(-1));
        continue;
    }
    if(pop.left != null)      q.add(pop.left);
    if(pop.right != null)     q.add(pop.right);
}
```

### Another implementation for level order traversal

```java
Queue<TreeNode> queue = new LinkedList<>();
queue.add(root);
while (!queue.isEmpty()) {
    int size = queue.size();
    for (int i = 0; i < size; i++){
        TreeNode node = queue.poll();
        if (node.left != null)     queue.add(node.left);
        if (node.right != null) queue.add(node.right);
    }
    currentLevel++;
}
```

### 0-1 BFS (Shortest Path in a Binary Weight Graph)

In normal BFS of a graph all edges have equal weight, but in 0-1 BFS some edges may have 0 weight and some may have 1 weight.

Algorithm: while performing BFS, if an edge having weight = 0 is found, the node is pushed at the front of the double-ended queue; if an edge having weight = 1 is found, it is pushed at the back of the double-ended queue.

Explanation: It is very similar to Dijkstra, i.e. we add a node's children only once we have found the shortest path to that node, and we traverse the graph the same way. This is guaranteed because:

1. If the child's edge weight is 0, then the child is at the same distance from the source as the node is, so it is safe to visit the child next. Thus we add this child to the front of the queue.
2. If the child's edge weight is 1, then this child is the most distant to the node (and distant to all the nodes present in the queue, as all the other nodes are either at the same distance as the popped node or are most distant children of previously popped nodes), so we add this child to the end of the queue.
3. At each iteration we have the closest node at the beginning of the queue.

T.C.: O(V+E)

E.g. Given a graph where every edge has weight either 0 or 1, find the shortest path from the source vertex to every other vertex.

![Example graph for 0-1 BFS](/coding-ref/i-047-041.webp)

**Figure (example graph, start = 0):** nodes 0–8; edge weights: 0–1 = 0, 0–7 = 1, 1–2 = 1, 1–7 = 1, 2–3 = 0, 2–5 = 0, 2–8 = 1, 3–5 = 1, 3–4 = 1, 4–5 = 1, 5–6 = 1, 6–7 = 1, 6–8 = 1, 7–8 = 1. Resulting shortest distances for nodes 0..8: `0 0 1 1 2 1 2 1 2`.

```java
// List<int[]> g; .. v: int[0], weight: int[1]
public int[] zeroOneBFS(int src) {
  int[] dist = new int[g.length];
  Arrays.fill(dist, Integer.MAX_VALUE);

  boolean[] visited = new boolean[g.length];

  Deque<Integer> dq = new ArrayDeque<>();
  dq.addFirst(src);
  dist[src] = 0;

  while(!dq.isEmpty()){
    int u = dq.removeFirst();
    visited[u] = true;
    for(int[] child: g[u]){
      int v = child[0], w = child[1];
      if(visited[v])
        continue;
      if(w == 0)
        dq.addFirst(v);
      else
        dq.addLast(v);
      dist[v] = dist[u] + w;
    }
  }

  return dist;
}
```

## Sparse Table & RMQ (Range Minimum Query)

Given an array and a set of queries. Queries contain the interval in which we need to find the minimum term in that window.

![Sparse table array 2 3 4 5 3 1 1 3](/coding-ref/i-048-043.webp)

**Figure:** array `2, 3, 4, 5, 3, 1, 1, 3` at indices 0–7; a yellow bracket spans indices 1–5.

If we use brute force: TC: O(Q*N)
If we use a sparse table: TC: O(N log(N) + Q)

Idea behind this is to find the answer for every range and store the results in sparse tables.

Sparse table: will be made of size `m[N][log N]`.
`m[x][y]` stores the minimum for the range `[x, 2^y]`, i.e. we store the minimums for lengths in powers of 2 → 1, 2, 4, 8 …, for each interval.

Now we can say that `m[x][power=8] = min( m[x][power=4], m[x+4][power=4] )`.

Thus `m[x][y] = Math.min( m[x][y-1], m[x +(1<<y-1)][y-1] )`.

![Range brackets over indices 0-12](/coding-ref/i-048-044.webp)

**Figure:** indices 0–12; brackets over indices 3–6 and 7–10, with a lower bracket spanning from about index 2 to index 11.

To find the range min, suppose for length = 7, range = [2, 8]:

![Range brackets annotated 4 + 2 + 1](/coding-ref/i-049-045.webp)

**Figure:** indices 0–12; brackets over 2–5, 6–7 and 8, annotated `4 + 2 + 1`.

We find the minimum among: `m[2][2]`, `m[2][1]`, `m[2][0]`.

## Binary Lifting => used for LCA (lowest common ancestor)

Application: Let G be a rooted tree with N nodes. For Q queries of the form (K,V) we want to find the K-th ancestor of V in the tree.

One solution is to maintain a parent array, then for each query find the K-th ancestor by moving up K times; time complexity will be O(N×Q).

To improve this, we introduce jump edges. A jump-edge is simply an edge that starts from a node and is not directed towards its parent, but towards an arbitrary ancestor. Let's start by building jump-edges from each node towards its 2nd ancestor, 4th ancestor, 8th ancestor and so on. Note that one node will have multiple jump edges.

Note that in the figure below only a subset of these jump-edges is visible, since otherwise it would clutter the image too much.

![Binary lifting jump edges](/coding-ref/i-049-046.webp)

**Figure (jump edges):** nodes 9, 8, 7, 6, 5, 4, 3, 2, 1 laid out left to right; the path edges 9→8→7→6→5→4→3→2→1 are drawn in black and the jump edges go from 9 to 1 (green), from 9 to 5 and 5 to 1 (blue, jump length 4), and from 9 to 7, 7 to 5, 5 to 3 (red) with a black edge 3→2.

Note that all the blue edges in the above figure have jump length = 4.

We denote `far(h,i)` = the 2^h-th ancestor of `i`, i.e. if h = 4, the 16th ancestor of `i`:

$$far(h,i) = far(h-1,\ far(h-1,i))$$

Meaning the 4th ancestor of `i` is the same as the 2nd ancestor of the 2nd ancestor of `i`.

For preprocessing, for every node we want to store the 1st, 2nd, 4th, 8th, 16th … parents.

`up[v][0]` is the 1st parent of node `v`.
`up[v][1]` is the 2nd parent of `v`. This is calculated by taking the 1st parent `up[v][0]` and finding its own 1st parent, i.e. the parent of the parent: `up[ up[v][0] ][0]`.

`up[v][2]` is the 4th parent of `v`, calculated using the 2nd parent of the 2nd parent of `v`: `up[up[v][1]][1]`.

Code: O(N x log(N))

Pseudo-code (first version, loops over `v` in the outer loop):

```text
int up[N][LOG]
up[v][j] -- 2^j-th ancestor of v
for v = 0 .. N-1:
  up[v][0] = parent[v]
  up[v][1] = up[ up[v][0] ][0]
  up[v][2] = up[up[v][1]][1]
  up[v][3] = up[up[v][2]][2]
  ...
```

Code screenshot (second version, `j` loop nested inside the `v` loop):

```text
int up[N][LOG]
up[v][j] -- 2^j-th ancestor of v
for v = 0 .. N-1:
  up[v][0] = parent[v]
  for j = 1 .. LOG-1:
    up[v][j] = up[ up[v][j-1] ][j-1]
```

Caveat: since we loop over vertices from 0 to N-1, ancestors are populated one vertex at a time. This only works if the nodes are ordered such that `parent[i] < i`, i.e. the parent of node `i` has a lower index than `i`. So this algorithm does not work in all situations, e.g. if the tree is linear 4→2→3. Reversing the loop order solves this issue.

Corrected code (the highlighted first loop is the step that assigns the 0th-ancestor parents; the `j` loop is outer):

```text
int up[N][LOG]
up[v][j] -- 2^j-th ancestor of v
for v = 0 .. N-1:
  up[v][0] = parent[v]
for j = 1 .. LOG-1:
  for v = 0 .. N-1:
    up[v][j] = up[ up[v][j-1] ][j-1]
```

We now, in the first step, assign parents for the 0th ancestors. After that, for every next layer, we know all the ancestors for the previous layer and use them to compute the next ancestors:

```cpp
for(int h = 1; h <= lgmax; h++)
  for(int i = 1; i <= n; i++)
    far[h][i] = far[h - 1][far[h - 1][i]];
```

For example, let's search for the 7th ancestor of 9. Since 7 = 4 + 2 + 1, we can traverse the blue edge from 9→5, the red edge from 5→3 and the black edge from 3→2.

### Computing the lowest common ancestor using binary lifting

Another common application of binary lifting is computing the lowest common ancestor (from now on abbreviated LCA) of 2 nodes.

Here, in addition to precomputing our jump edges we should also compute for each node its depth.

The depth means the number of nodes present in the path from root to the node.

Idea is to find the depth of each node; suppose we need to find the LCA of nodes `x` and `y`. We denote:
- `dx` → depth of `x`
- `dy` → depth of `y`

Suppose `x` is deeper, i.e. `dx > dy`.

So to get to the same level as `y`, we need to move up from node `x` `(dx-dy)` times, going to the node's ancestor one by one. This approach takes O(n) without binary lifting.

Once we are at the same level, we again go up the ancestors one by one to find the common ancestor.

So basically there are two steps:
1. Find the same-level node.
2. Find the first common ancestor.

For 1, we can simply perform the jump using binary lifting with jump size `k = dx-dy`.

For 2, we start with high powers, like `j = 14` (meaning 2^14), and find the ancestors from top to bottom: first `j = 14`, then `j = 13`, and so on. This is done until we find different ancestors for `x` and `y`; once found, we go to those nodes and continue doing the same.

![LCA tree first case](/coding-ref/i-052-050.webp)

**Figure (tree, first case):** a root with two branches. A highlighted node `A` sits on the left branch, with a deeper highlighted `A` reached via a lift arrow below it; a highlighted node `B` sits on the right branch. Yellow arrows show the nodes being lifted up toward their common ancestor.

![LCA tree second case](/coding-ref/i-052-051.webp)

**Figure (tree, second case):** two chains hang from a common branching node. Highlighted `A` appears twice on the left chain (upper and lower) and highlighted `B` twice on the right chain (upper and lower). Yellow arrows show both nodes being lifted up by the same number of levels until they meet just below the common ancestor.

In the image below: `j = 14` initially.

```java
int k = depth[a] - depth[b];
for(int j = LOG - 1; j >= 0; j--) {
    if(k & (1 << j)) {
        a = up[a][k];
    }
}
if(a == b) {
    return a;
}
```

```java
for(int j = LOG - 1; j >= 0; j--) {
    if(up[a][j] != up[b][j]) {
        a = up[a][j];
        b = up[b][j];
    }
}
```

Let `x` and `y` be 2 nodes; to find their LCA we can apply the following strategy:
https://cses.fi/paste/2c444ae8e8a5444237ea7a/

## Tarjans algorithm, euler tour

## Cycle Detection

1. Union find (undirected graph): if an edge exists such that it connects two nodes belonging to the same component, then a cycle exists.
2. DFS (any graph): if there is an edge that connects a node to one of its ancestors (not the immediate parent, for undirected graphs), then a cycle exists.
3. BFS: same as DFS for undirected graphs. Can't use BFS for directed graphs.
4. Topological ordering: if the topological order size does not equal the graph size, a cycle exists.

// cycle detection algorithm for directed graph using dfs

```java
// for undirected graph
public static void unionfind(List<Pair> g, int V){
    // disjoint set datastructure
    int[] ufds = new int[V];
    Arrays.fill(ufds, -1);

    for (Pair p : g) {
        if(find(p.u,ufds) == find(p.v,ufds))
            System.out.println("Cycle found " + p.u+","+p.v);
        union(p.u,p.v,ufds);
    }
}
public static void union(int u,int v, int[] ufds){
    ufds[find(u,ufds)] = find(v,ufds);
}
public static int find(int u,int[] ufds){
    if(ufds[u] == -1) return u;
    return (ufds[u] = find(ufds[u],ufds));
}
```
## Topological Ordering

Topological sorting is a linear ordering of vertices such that for every directed edge u -> v, vertex u comes before v in the ordering.

Topological Sorting for a graph is not possible if the graph is not a DAG.

Khan algo: first it finds the indegree of every nodes, then one by one it removes and prints all zero indegree nodes.

Using DFS: once we visit all the children of a node, we push it to the stack.

Cycle check with DFS (directed graph):

```java
// for directed graph
public boolean dfs(int u, List<Integer>[] g, int[] visited){
    visited[u] = 1;
    boolean loop = false;
    if(g[u] != null)
        for(int v: g[u])
            // for undirected graph if(visited[v] == 1 && v != parentOfu)
            if(visited[v] == 1) loop = true;
            else if(visited[v] == 0) loop = loop || dfs(v,g,visited);
    visited[u] = 2;
    // topological.add(u); :::: a global list
    return loop;
}
```

Topological order using DFS (push to stack after all children are visited):

```java
public static int dfs(int u,int[] visited, List<Integer>[] g,
                      int[] st, int top) {
    visited[u] = 1;
    if(g[u] != null)
        for (int v : g[u])
            if(visited[v] == 0)
                top = dfs(v, visited, g, st, top);
    st[++top] = u;
    return top;
}
```

## Kahn's algorithm

In the below approach if our graph contained cyclic dependency then those edges won't be a part of our solution. So we can easily detect cyclic dependency.

```java
public static List<Integer> getTopologicalOrder(List<Integer>[] g, int[] indegree)
{
    int u = 0;
    int[] st = new int[g.length]; int top = -1;

    for (int i = 0; i < indegree.length; i++)
        if(indegree[i] == 0)
            st[++top] = i;

    List<Integer> topologicalOrder = new ArrayList<>();

    while(top > -1){
        u = st[top--];
        topologicalOrder.add(u);
        if(g[u] != null)
            for (int v : g[u]){
                indegree[v]--;
                if(indegree[v] == 0)
                    st[++top] = v;
            }
        indegree[u] = -1;
    }
    return topologicalOrder;
}
```

```java
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
    return topo;
}
```

## Bipartite Graph

A Bipartite Graph is a graph whose vertices can be divided into two independent sets, U and V such that every edge (u, v) either connects a vertex from U to V or a vertex from V to U. This is solved using graph coloring with 2 colours.

## Strongly Connectedness of Graphs

Is the graph containing only one strongly connected component?

```java
public static boolean isSCC(List<Integer>[] g) {
    // visited stores if this vertex is visited during traversal
    boolean[] visited = new boolean[g.length];
    dfs(0,g,visited);
    // if after dfs traversal any of nodes are not visited then
    // the graph is not connected thus it's not strongly connected
    for (int i = 0; i < g.length; i++)
        if(!visited[i])
            return false;
    // if g contains edges of form u -> v
    // then tg contains edges of form v -> u
    List<Integer>[] tg = transposeGraph(g);
    // reinitialize all nodes as unvisited
    Arrays.fill(visited, false);
    dfs(0,tg,visited);
    // if after dfs traversal any of nodes are not visited then
    // the graph is not strongly connected.
    // As tg contains edges of form v -> u. if a node is not visited then,
    // it means that there is path from u -> v but there isn't any from v -> u.
    for (int i = 0; i < g.length; i++)
        if(!visited[i])
            return false;
    return true;
}
```

## Eulerian Graph

### Eulerian Circuit

Eulerian Circuit is a path which visits all edges exactly once and starts and ends on the same vertex.

### Eulerian Path

Eulerian Path is a path in graph that visits every edge exactly once.

PROPERTY: If the graph is semi-eulerian, then there will be exactly 2 nodes with odd number of edges, and the eulerian path will begin and end on those nodes.

A graph is called Eulerian if it has an Eulerian Cycle and called Semi-Eulerian if it has an Eulerian Path.

![Graph with Eulerian path 4 3 0 1 2 0 and no Eulerian cycle](/coding-ref/i-058-061.webp)

The graph has Eulerian Paths, for example "4 3 0 1 2 0", but no Eulerian Cycle. Note that there are two vertices with odd degree (4 and 0).

![Graph with Eulerian cycle 2 1 0 3 4 0 2](/coding-ref/i-058-062.webp)

The graph has Eulerian Cycles, for example "2 1 0 3 4 0 2". Note that all vertices have even degree.

Two conditions for eulerian graph:

1. it must be single scc
2. indegree == outdegree for every edge

Two conditions for eulerian path:

1. it must be single scc
2. Only two vertices have odd degree and all other vertices have even degree.

```java
public static void isEulerian(EulerianGraph G) {
    for (int i = 0; i < G.g.length; i++)
        if(G.in[i] != G.out[i]){
            System.out.println("Graph not eulerian so eulerian circuit not possible");
            return;
        }
    if(!isSCC(G.g)){
        System.out.println("Graph not eulerian so eulerian circuit not possible");
        return;
    }
    System.out.println("Graph is eulerian");
}
```

## Fleury's Algorithm for printing Eulerian Path or Circuit

1. Make sure the graph has either 0 or 2 odd vertices
2. If there are 0 odd vertices, start anywhere. If there are 2 odd vertices, start at one of them.
3. Follow edges one at a time. If you have a choice between a bridge and a non-bridge, always choose the non-bridge.
4. Stop when you run out of edges.

The idea is "don't burn bridges" so that we can come back to a vertex and traverse remaining edges. In the below figure if we start from 2 then we should not chose 2->3 edge first.

![Four-vertex graph with edges 0-1, 0-2, 1-2, 2-3](/coding-ref/i-059-063.webp)

Graph for the example (edges 0-1, 0-2, 1-2, 2-3):

```text
    0 ----- 2 ----- 3
    |      /
    |     /
    1 --/
```

## Articulation Points

A vertex in an undirected connected graph is an articulation point (or cut vertex) iff removing it (and edges through it) disconnects the graph.

Conditions necessary for articulation point:

1. if the node[i] is root of DFS tree, then it must have >= two child
2. if the node[i] is not the root, and there is no back edge by vertices in subtrees at childs of node[i] to ancestors (in DFS tree) of node[i]

Basically, node[i] must be a point having atleast 2 edges towards two subtrees which are not connected by any path not containing node[i].

To implement step 2 we use disc[i] and low[i] to track discovery time and lowest discovery time in all child nodes in subtree with root 'i'.

![Hand-drawn DFS tree with nodes 0 to 5](/coding-ref/i-059-064.webp)

DFS tree figure (nodes 0 to 5; 0 is the root with children 1 and 5; 1 has children 2 and 3; 2-3 are joined by an edge; 4 is connected to both 2 and 3 by back edges):

```text
            0
          /   \
         1     5
        / \
       2 - 3
        \ /
         4
```

```java
private static void dfs(int u, List<Integer>[] g, boolean[] ap, boolean[] visited,
                         int[] disc, int[] low, int[] parent) {
    visited[u] = true;
    // disc[u] is set and low[u] is initialized
    disc[u] = low[u] = ++time;
    // initializing the no. of child of node[u]
    int childeren = 0;
    if(g[u] != null)
        for (int v : g[u]) {
            // if node[v] is already visited and it is not the parent of node[u]
            // then update the low[u]
            // low[u] represents the minimum dicovery time of all child nodes
            // of subtree of node 'u'
            if(visited[v] && parent[u] != v)  // this case only possible when v is a node which is an ancestor of u
                low[u] = Math.min(low[u], disc[v]);
                // why not min(low[u], low[v])
                // Since low[u] must hold the minimum discovery time of its
                // children also, since this case will execute if node v is an ancestor,
                // so it is possible that the subtree belonging to that ancestor might not
                // been fully visited, ie that subtree contains u also. So low[v] won't be
                // correct value
            if(!visited[v]){
                parent[v] = u;
                dfs(v, g, ap, visited, disc, low, parent);
                childeren++;
                // Check if the subtree rooted with v has a connection to
                // one of the ancestors of u
                low[u] = Math.min(low[u], low[v]);
                // if node is a root and has atleast 2 childs
                if(parent[u] == -1 && childeren > 1)
                    ap[u] = true;
                // if low of child is greater than disc of u then
                // child must have been discovered after node[u]
                // and it won't have any back edges to ancestors of node[u]
                if(parent[u] != -1 && low[v] >= disc[u])
                    ap[u] = true;
            }
        }
}
```

## Bridges in the Graph

An edge in an undirected connected graph is a bridge iff removing it disconnects the graph.

We do DFS traversal of the given graph. In DFS tree an edge (u, v) (u is parent of v in DFS tree) is a bridge if there does not exist any other alternative to reach u or an ancestor of u from subtree rooted with v.

The condition for an edge (u, v) to be a bridge is "low[v] > disc[u]".


## Graph Problems

### Dijkstra algo using Priority Queue

Image (Dijkstra with PriorityQueue, page 73):

```java
static final int INF = (int)(1e9+7);
public static int[] dijkstra(int[][] edges, int N, int s) {
    List<int[]>[] g = new List[N+1];
    // build Graph
    for (int[] edge : edges) {
        int u = edge[0], v = edge[1], w = edge[2];
        if(g[u] == null)    g[u] = new ArrayList<>();
        g[u].add(new int[]{v,w});
    }

    int[] dist = new int[N+1];
    Arrays.fill(dist, INF);
    dist[s] = 0;

    Queue<Integer> minh = new PriorityQueue<>(new Comparator<Integer>()
    {
        public int compare(Integer a,Integer b){
            return dist[a]-dist[b];
        }
    });

    minh.add(s);
    boolean[] visited = new boolean[N+1];

    while(!minh.isEmpty()){
        int u = minh.poll();
        if(visited[u])  continue;
        visited[u] = true;
        if(g[u] != null)
            for (int[] pair : g[u]) {
                int v = pair[0], w = pair[1];
                if(dist[v] > dist[u]+w){
                    dist[v] = dist[u]+w;
                    minh.add(v);
                }
            }
    }
    return dist;
}
```

In this approach: was getting error (leetcode: 1368) when using `if(visited[u]) continue;` removing it worked fine.

```java
public static void dijkstra(List<Pair>[] g) {
       // for storing distances from node = 0 (Source)
       int[] dist = new int[g.length];
       // initially all the nodes are assumed to be at INF distance
       Arrays.fill(dist, INF);
       // nodes whose shortest distance is already found
       boolean[] visited = new boolean[g.length];
       // min Heap for storing Pairs(node[i], dist[node[i]])
       // to find the smallest 'dist[node]' for unvisited nodes
       // 'The_Comparator' sets this PriorityQueue as Min heap
       PriorityQueue<Pair> minh = new PriorityQueue<>(new The_Comparator());


       // initially distance of node[0] from [0](source) is kept zero
       dist[0] = 0;
       // since min heap is empty we add the node[0] with it's dist[0] = 0 to the minH
       minh.add(new Pair(0,0));


       // unless minh is empty, for every iteration
       while (!minh.isEmpty()) {
              // find the element whose dist[node[i]] is minimum among unvisited nodes
              Pair pop = minh.poll();
              // since it's been popped, we have already found all the nodes
              // which are more closer to the source than this node.
              // So the path from the closest node(the previous node which was popped) to this
              // node (which is popped) has been found in previous iterations
              // so this node is placed in visited list
              visited[pop.v] = true;


              // if popped node has no childeren
              if(g[pop.v] != null)
              // for all its neighbors iterate
                  for (Pair p : g[pop.v])
               // if this neighbor 'p.v' is not visited earlier
               // and it's current distance from origin is greater than
               // distance of popped node and the edge weight of 'pop -> p.v'
               // perform decrease key operation in minH
                   if(!visited[p.v] && dist[p.v] > dist[pop.v] + p.w){
                       // Since this implementation of min heap dosen't contain the min Heap's decrease-key operation
                       // so we first remove this node from the heap then add new node
                       minh.remove(new Pair(p.v,dist[p.v]));
                       dist[p.v] = dist[pop.v] + p.w;
                       minh.add(new Pair(p.v,dist[p.v]));
                   }
       }
       for (int i = 0; i < dist.length; i++)
           System.out.printf("%3d",i);
       System.out.println();
       for (int d : dist)
           System.out.printf("%3d",d);


   }
```

### Boruvka's algorithm

```java
// this algorithm finds the MST by reducing the no. of components to one
   public static void boruvkaAlgo(List<Pair>[] g) {
       // using union-find to avoid the cycle in MST
       // ufds[] helps to store the reprentative node's index of component having node[i]
       int[] ufds = new int[g.length];
       // initially all the nodes are the parents of their own as independent components
       Arrays.fill(ufds, -1);    // -1 represents no parent for this node
       // closest[i] stores the edge corresponding to closest node in other component
       Edge[] closest = new Edge[g.length];
       // initially no. of components == total no. of nodes
       int components = g.length;


       // unless no. of components reduces to 1
       while (components > 1) {
             System.out.println(components); // prints current no. of components
             // for every node[i]
             for (int i = 0; i < ufds.length; i++)
                  // if it has neighbours
                  if(g[i] != null)
                      // for each of it's neighbor find the one which is closest to this node
                      // and in different component
                      for (Pair p : g[i])
                          // find the representative elements of both the node's component
                          // if they are same then they belong to same component
                          if(find(p.v,ufds) != find(i,ufds))
                             // if closest node is not defined or, if it's defined but it's
                             // more distant than the current neighbor 'p.v'
                           if(closest[find(i,ufds)] == null ||
closest[find(i,ufds)].w > p.w)
                                 // update this node's (component's) closest node
                                 closest[find(i,ufds)] = new Edge(i, p.v, p.w);


            for (int i = 0; i < closest.length; i++) {
                Edge e = closest[i];
                // if the 'e' is not null and both it's vertex are in different components
                if(e != null && find(e.u,ufds) != find(e.v,ufds)){
                    // join the two components
                    union(e.u,e.v,ufds);
                    System.out.println("\t->"+e.u+" "+e.v+" "+e.w);
                    // reduce the no. of components by one
                    components--;
                }
                // set closest[i] to null as it would
                // contain value which affect the next iteration
                closest[i] = null;
            }
        }
   }
```

### Bellman ford algorithm

```java
// used to find the shortest path in O(VE) and detect -ve weight cycle
   public static void bellmanford(List<Edge> g, int V) {
          // dist[] contains the shortest distance to node[i] from source( node[0] )
          int[] dist = new int[V];
          // initially all the nodes are at INF distance from source
          Arrays.fill(dist, INF);
          // the node[0] is the source so dist[0] == 0
          dist[0] = 0;
          // iterate for V-1 times.
          for(int i= 0; i < V-1; i++)
              // for every edge in edgeGraph g
              for (Edge e : g)
                  // if there is better shorter possible then update the dist[e.v]
                  if(dist[e.u] != INF && dist[e.v] > dist[e.u] + e.w)
                         dist[e.v] = dist[e.u] + e.w;


          // check for -ve weight cycle
          // as shortest path is of form of tree which contains all nodes
          // so the no. of edges would be V-1. Each earlier iteration forms an edge
          // in this tree. So we will have -ve cycle only if there is more relaxation possible.
          for (Edge e : g)
              if(dist[e.u] != INF && dist[e.v] > dist[e.u] + e.w){
                  System.out.println("Graph contains -ve weight cycle");
                  break;
              }
          for (int d : dist)
              System.out.printf("%d, ",d);


   }
```

### Floyd Warshall

```java
// All pairs shortest path O(V^3)
   public static void floydWarshall(int[][] g) {
       int V = g.length;
       // dist[][] stores the shortest distance between every pairs
       int dist[][] = new int[V][V];
       // initially dist[][] will contain direct edge distances (no intermediary nodes)
       dist = g.clone();
       // for pair 'i -> j' if there is shorter path from 'i -> k -> j' then update dist[i][j]
       // for every intermediary node k through which shorter path may pass through
       for (int k = 0; k < V; k++)
            for (int i = 0; i < V; i++)
                 for (int j = 0; j < V; j++)
                      if(dist[i][j] > min(dist[i][j] ,dist[i][k] + dist[k][j]))
                          dist[i][j] = min(dist[i][j] ,dist[i][k] + dist[k][j]);
       printArr(dist);
   }
```

### Johnson's Algorithm

If we apply Dijkstra's Single Source shortest path algorithm for every vertex, considering every vertex as source, we can find all pair shortest paths in O(V*VLogV) time. So using Dijkstra's single source shortest path seems to be a better option than Floyd Warshell, but the problem with Dijkstra's algorithm is, it doesn't work for negative weight edge.

The idea of Johnson's algorithm is to re-weight all edges and make them all positive, then apply Dijkstra's algorithm for every vertex.

**How to transform a given graph to a graph with all non-negative weight edges?**
One may think of a simple approach of finding the minimum weight edge and adding this weight to all edges. Unfortunately, this doesn't work as there may be different number of edges in different paths (See this for an example). If there are multiple paths from a vertex u to v, then all paths must be increased by same amount, so that the shortest path remains the shortest in the transformed graph.

The idea of Johnson's algorithm is to assign a weight to every vertex. Let the weight assigned to vertex u be h[u]. We reweight edges using vertex weights. For example, for an edge (u, v) of weight w(u, v), the new weight becomes:

$$w(u, v) + h[u] - h[v]$$

The great thing about this reweighting is, all set of paths between any two vertices are increased by same amount and all negative weights become non-negative. Consider any path between two vertices s and t, weight of every path is increased by h[s] - h[t], all h[] values of vertices on path from s to t cancel each other.

**How do we calculate h[] values?** Bellman-Ford algorithm is used for this purpose.
A new vertex is added to the graph and connected to all existing vertices. The shortest distance values from new vertex to all existing vertices are h[] values. It's basically shortest distance of each node from newly added node.

Eg. We add a new source s and add edges (with weight = 0) from s to all vertices of the original graph. We calculate the shortest distances from 4 (newly added node) to all other vertices using Bellman-Ford algorithm.
The shortest distances from 4 to 0, 1, 2 and 3 are 0, -5, -1 and 0 respectively, i.e., `h[] = {0, -5, -1, 0}`. Once we get these distances, we remove the source vertex 4 and reweight the edges using following formula:

$$w(u, v) = w(u, v) + h[u] - h[v]$$

**How does the transformation ensure nonnegative weight edges?**
The following property is always true about h[] values as they are shortest distances:

$$h[v] \le h[u] + w(u, v)$$

It means shortest distance to 'v' (from newly added node) is always equal or smaller than distance to some other node + weight of edge between them.

#### Algo

```java
1.   int[] h = bellmanFord(V);


2.   G.updateWeight(h);


3.   int[][] allPairs = dijkstra(G.ag,h);
```

#### Step 1

```java
public static int[] bellmanFord(int V) {
         int[] h = new int[V+1];
         // create the new graph with V+1 edges
         Graph bf = new Graph(V+1);
         // add the edges from new node 'V' to every other node with weight == 0
         for (int i = 0; i < V; i++)
              bf.addEdge(V, i, 0);


         Arrays.fill(h, INF);
         h[V] = 0;
         // find the shortest distance from 'V' to every other nodes
         for (int i = 0; i < V-1; i++)
              for (Edge e : bf.eg)
                   if(h[e.u] != INF && h[e.v] > h[e.u]+e.w)
                       h[e.v] = h[e.u] + e.w;


         return h;
   }
```

#### Step 2

```java
public void updateWeight(int[] h){
         int V = h.length-1;
         for (Edge e : eg)
              e.w = e.w + h[e.u] - h[e.v];
         for (int i = 0; i < V; i++)
              if(ag[i] != null)
                   for (Pair p : ag[i])
                       p.w = p.w + h[i] - h[p.v];
   }
```

#### Step 3

```java
   // basically applying dijkstra to find all pair shortest path in O(V^2 logV + VE)
   private static int[][] dijkstra(List<Pair>[] ag,int[] h) {
       int V = ag.length;
       int[][] dist = new int[V][V];
       for (int i = 0; i < V; i++)
             for (int j = 0; j < V; j++)
                 dist[i][j] = INF;
       // for each iteration set a new source node 's'
       // and find it's shortest distance to every other nodes
       for (int s = 0; s < V; s++) {
             PriorityQueue<Pair> minH = new PriorityQueue<>(new The_Comparator());
             boolean[] visited = new boolean[V];


             dist[s][s] = 0;
             minH.add(new Pair(s,0));
             while (!minH.isEmpty()) {
                 Pair poll = minH.poll();
                 visited[poll.v] = true;
                 if(ag[poll.v] != null)
                      for (Pair p : ag[poll.v])
                          if(!visited[p.v] && dist[s][p.v] > dist[s][poll.v] + p.w){
                               minH.remove(new Pair(p.v,dist[s][p.v]));
                               dist[s][p.v] = dist[s][poll.v] + p.w;
                               minH.add(new Pair(p.v,dist[s][p.v]));
                          }
             }
             // restore the original weights
             for (int v = 0; v < V; v++)
                 if(dist[s][v] != INF)
                      dist[s][v] += h[v] - h[s];
       }
       return dist;
   }
```

### Shortest Path in DAG

```java
public static void shortestPath(List<Pair>[] g, int s) {
        // By finding the topological order
        int[] topologicalOrder = topologicalSort(g);
        // dist[node[i]] will store the shortest distance from source 's'
        int[] dist = new int[g.length];
        Arrays.fill(dist, INF);
        // distance to node[s] == 0
        dist[s] = 0;
        // we visit each node in topological order coz
        // once we reach a node in this ordering (let's say 4) then we've already computed
        // the shortest path to it (4) as all the edges(as well as paths) of type 'u -> v (v = 4)'
        // and have already been visited.
        // Thus, each node is visited(topological Order) in such a way that all it's incoming
        // edges are already visited. so we have shortest distance to the node.
        for (int i = 0; i < g.length; i++) {
            int u = topologicalOrder[i];
            // for each node if better distance is found update dist[]
            if(g[u] != null)
                for (Pair p : g[u])
                       if(dist[u] != INF && dist[p.v] > dist[u]+p.w)
                           dist[p.v] = dist[u]+p.w;
        }
        for (int i = 0; i < dist.length; i++)
            System.out.printf("%d ",dist[i]);
   }
```

### Shortest path with exactly k edges in a directed and weighted graph

```java
   private static void shortestDistance(List<Pair>[] g, int k) {
         int[] dist = new int[g.length];
         Arrays.fill(dist, INF);


         recurAllPaths(0,g,k,dist, 0);


         for (int i = 0; i < dist.length; i++)
              System.out.printf("%d, ",dist[i]);
   }


   private static void recurAllPaths(int i, List<Pair>[] g, int k, int[] dist, int d) {
         if(k == 0)      {
              if(dist[i] > d)
                   dist[i] = d;
              return;
         }
         if(g[i] != null)
              for (Pair p : g[i])
                   recurAllPaths(p.v, g, k-1, dist, d + p.w);
   }
```

### Smallest Multiple With 0 and 1

You are given an integer N. You have to find smallest multiple of N which consists of digits 0 and 1 only. Since this multiple could be large, return it in form of a string.
For N = 55, 110 is smallest multiple consisting of digits 0 and 1.
For N = 2, 10 is the answer.

**Solution:**
Main goal is to find the smallest string required to get the remainder 0 when divided by n, which will be our answer. Starting from 1, we find it's remainder with n, then append "0" or "1" and then find the new remainder. Each remainder will represent the nodes in graph.
In the image below from node "1" we again get remainder of "6" which has already been found in the earlier level. So the previous value must be smaller in length, thus we don't need to move forward from here. As, suppose we have "101 001101" which gives remainder of 0, then "10 001101" will also give the same remainder of 0.

Note: remainder(1234) == remainder(remainder(12)*100 + 34), i.e.

$$\text{remainder}(1234) = \text{remainder}(\text{remainder}(12) \cdot 100 + 34)$$

![BFS tree of remainders for n = 7](/coding-ref/i-085-078.webp)

Image (BFS tree of remainders for n = 7, page 85). Node label = remainder; quoted string = binary string built so far (labels read from image; the green node's label is hard to read and is given as "1001"):

```
n=7
1 ["1"]
├── 3 ["10"]
│   ├── 2 ["100"]
│   │   ├── 6 ["1000"]   (red circle)
│   │   └── 0 ["1001"]   (green circle)
│   └── 3 ["101"]        (red circle, repeat of remainder 3)
└── 4 ["11"]
    ├── 5 ["110"]
    └── 6 ["111"]
```

Image (Java: smallest multiple using BFS over remainders, page 85):

```java
public static String multiple(int A) {
        if(A <= 1)  return Integer.toString(A);
        Queue<Integer> q = new LinkedList<>();
        String[] nums = new String[A];
        q.add(1);
        nums[1]="1";
        while(!q.isEmpty()){
            int size = q.size();
            for(int i = 0; i < size; i++){
                Integer rem = q.poll();
                if(nums[(rem*10)%A] == null){
                    q.add((rem*10)%A);
                    nums[(rem*10)%A] = nums[rem]+"0";
                }
                if(nums[(rem*10+1)%A] == null){
                    q.add((rem*10+1)%A);
                    nums[(rem*10+1)%A] = nums[rem]+"1";
                }
            }
        }
        return nums[0];
    }
```


### Kruskals algorithm for MST

Use when we get graph in form of edge list.

Image (Kruskal's with union-find, page 86):

```java
public class Solution {
    static int[] ufds;
    public List<int[]> kruskal(int numIslands, int[][] edges) {
        List<int[]> mst = new ArrayList<>();
        PriorityQueue<int[]> pq = new PriorityQueue<>(new Comparator<int[]>()
        {
            @Override
            public int compare(int[] a,int[] b){
                return a[2]-b[2];
            }
        });
        for(int[] e: edges)
            pq.add(e);

        ufds = new int[numIslands];
        Arrays.fill(ufds,-1);

        while(!pq.isEmpty() ){
            int[] edge = pq.poll();
            if(find(edge[0]-1) == find(edge[1]-1))  continue;
            mst.add(edge);
            union(edge[0]-1,edge[1]-1);
        }
        return mst;
    }
    public int find(int x){
        if(ufds[x] == -1)   return x;
        return ufds[x] = find(ufds[x]);
    }
    public void union(int u,int v){
        ufds[find(u)] = find(v);
    }
}
```

