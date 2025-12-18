---
title: LRU Cache
description: Low-Level Design for a Least Recently Used Cache
---

## Problem Statement

Design a data structure that implements a Least Recently Used (LRU) cache with O(1) time complexity for both get and put operations. The cache should have a fixed capacity and evict the least recently used item when the capacity is exceeded.

## Requirements

### Functional Requirements
1. Store key-value pairs with fixed capacity
2. Get value by key in O(1) time
3. Put key-value pair in O(1) time
4. Evict least recently used item when capacity is full
5. Update item's position when accessed (get or put)
6. Support generic key-value types
7. Thread-safe operations for concurrent access

### Non-Functional Requirements
1. O(1) time complexity for get and put
2. O(n) space complexity where n is capacity
3. Thread-safe implementation
4. Memory efficient
5. Support cache statistics (hit rate, miss rate)

## Simplified Class Diagram

```plantuml
@startuml

skinparam classBorderThickness 3
skinparam ArrowThickness 1
skinparam defaultFontSize 16
skinparam classAttributeFontSize 18
skinparam classFontSize 16

class LRUCache {
  + get()
  + put()
  + remove()
  + clear()
}

class Node {
  + getKey()
  + getValue()
  + setValue()
}

class DoublyLinkedList {
  + addToFront()
  + removeNode()
  + removeLast()
  + moveToFront()
}

class EvictionPolicy {
  + evict()
  + updateAccess()
}

class CacheStatistics {
  + recordHit()
  + recordMiss()
  + getHitRate()
}

LRUCache *-- DoublyLinkedList
LRUCache *-- EvictionPolicy
LRUCache *-- CacheStatistics
DoublyLinkedList o-- Node
EvictionPolicy --> DoublyLinkedList

@enduml
```

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Cache Interface" {
    interface "ICache" as Cache
    [LRUCache]
}

package "Data Structure" {
    interface "ILinkedList" as List
    [DoublyLinkedList]
    [Node]
}

package "Eviction" {
    interface "IEvictionPolicy" as Policy
    [LRUEvictionPolicy]
    [LFUEvictionPolicy]
}

package "Support" {
    interface "ICacheStatistics" as Stats
    interface "ICacheLock" as Lock
}

package "Factory" {
    [CacheFactory]
}

[CacheDriver] --> CacheFactory : uses
CacheFactory ..> Cache : creates
Cache <|.. LRUCache
LRUCache *-- Policy : composed of
LRUCache *-- Stats : composed of
LRUCache *-- Lock : composed of
LRUCache o-- Node : manages
Policy o-- List : uses
List <|.. DoublyLinkedList
DoublyLinkedList *-- Node : contains

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

class Node<K, V> {
    - key: K
    - value: V
    - prev: Node<K, V>
    - next: Node<K, V>
    + Node(key: K, value: V)
    + getKey(): K
    + getValue(): V
    + setValue(value: V): void
}

interface ILinkedList<K, V> {
    + addToFront(node: Node<K, V>): void
    + removeNode(node: Node<K, V>): void
    + removeLast(): Node<K, V>
    + moveToFront(node: Node<K, V>): void
    + getSize(): int
    + isEmpty(): boolean
}

class DoublyLinkedList<K, V> {
    - head: Node<K, V>
    - tail: Node<K, V>
    - size: int
    + DoublyLinkedList()
    + addToFront(node: Node<K, V>): void
    + removeNode(node: Node<K, V>): void
    + removeLast(): Node<K, V>
    + moveToFront(node: Node<K, V>): void
    + getSize(): int
    + isEmpty(): boolean
}

interface ICache<K, V> {
    + get(key: K): V
    + put(key: K, value: V): void
    + remove(key: K): boolean
    + clear(): void
    + size(): int
    + getStatistics(): ICacheStatistics
}

interface IEvictionPolicy<K, V> {
    + evict(): K
    + recordAccess(key: K, node: Node<K, V>): void
    + recordRemoval(key: K): void
}

class LRUEvictionPolicy<K, V> {
    - accessOrder: ILinkedList<K, V>
    + LRUEvictionPolicy(list: ILinkedList<K, V>)
    + evict(): K
    + recordAccess(key: K, node: Node<K, V>): void
    + recordRemoval(key: K): void
}

class LFUEvictionPolicy<K, V> {
    - frequencyMap: Map<K, Integer>
    - minFrequency: int
    + evict(): K
    + recordAccess(key: K, node: Node<K, V>): void
    + recordRemoval(key: K): void
}

interface ICacheStatistics {
    + recordHit(): void
    + recordMiss(): void
    + recordEviction(): void
    + getHitRate(): double
    + getMissRate(): double
    + getTotalRequests(): long
    + reset(): void
}

class CacheStatistics {
    - hits: AtomicLong
    - misses: AtomicLong
    - evictions: AtomicLong
    + CacheStatistics()
    + recordHit(): void
    + recordMiss(): void
    + recordEviction(): void
    + getHitRate(): double
    + getMissRate(): double
    + getTotalRequests(): long
    + reset(): void
}

interface ICacheLock {
    + lock(): void
    + unlock(): void
}

class ReentrantCacheLock {
    - lock: ReentrantLock
    + lock(): void
    + unlock(): void
}

class LRUCache<K, V> {
    - capacity: int
    - cache: Map<K, Node<K, V>>
    - evictionPolicy: IEvictionPolicy<K, V>
    - statistics: ICacheStatistics
    - cacheLock: ICacheLock
    + LRUCache(capacity: int, policy: IEvictionPolicy<K, V>, 
      stats: ICacheStatistics, lock: ICacheLock)
    + get(key: K): V
    + put(key: K, value: V): void
    + remove(key: K): boolean
    + clear(): void
    + size(): int
    + getCapacity(): int
    + getStatistics(): ICacheStatistics
    - evict(): void
}

class CacheFactory {
    + {static} createLRUCache<K, V>(capacity: int): ICache<K, V>
    + {static} createLFUCache<K, V>(capacity: int): ICache<K, V>
    + {static} createThreadSafeCache<K, V>(cache: ICache<K, V>): ICache<K, V>
}

class CacheDriver {
    + {static} main(args: String[]): void
    - demonstrateLRUCache(): void
    - demonstrateLFUCache(): void
    - demonstrateStatistics(): void
}

ILinkedList <|.. DoublyLinkedList
DoublyLinkedList *-- Node : contains

ICache <|.. LRUCache
LRUCache o-- Node : manages
LRUCache *-- IEvictionPolicy : composed of
LRUCache *-- ICacheStatistics : composed of
LRUCache *-- ICacheLock : composed of

IEvictionPolicy <|.. LRUEvictionPolicy
IEvictionPolicy <|.. LFUEvictionPolicy
LRUEvictionPolicy o-- ILinkedList : uses

ICacheStatistics <|.. CacheStatistics

ICacheLock <|.. ReentrantCacheLock

CacheFactory ..> ICache : creates
CacheFactory ..> IEvictionPolicy : creates
CacheFactory ..> ICacheStatistics : creates

CacheDriver ..> CacheFactory : uses
CacheDriver ..> ICache : uses

@enduml
```

## Key Design Patterns

1. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different eviction policies (LRU, LFU, FIFO)
2. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: Cache instance management
3. **[Template Method](/low-level-design/patterns/behavioural-patterns/#template-method-pattern)**: Common cache operations with customizable eviction

### Design Pattern Diagrams

#### 1. Strategy Pattern - Eviction Policies

```plantuml
@startuml

title Strategy Pattern - Cache Eviction Policies

interface IEvictionPolicy {
  + onAccess(key): void
  + evict(): String
  + keyToEvict(): String
}

class LRUEvictionPolicy {
  - accessOrder: DoublyLinkedList
  + onAccess(key): void
  + evict(): String
  + keyToEvict(): String
}

class LFUEvictionPolicy {
  - frequencyMap: Map<String, Integer>
  - minFrequency: int
  + onAccess(key): void
  + evict(): String
  + keyToEvict(): String
}

class FIFOEvictionPolicy {
  - insertionOrder: Queue
  + onAccess(key): void
  + evict(): String
  + keyToEvict(): String
}

class LRUCache {
  - evictionPolicy: IEvictionPolicy
  - cache: Map<String, Object>
  - capacity: int
  + LRUCache(capacity, IEvictionPolicy)
  + get(key): Object
  + put(key, value): void
}

IEvictionPolicy <|.. LRUEvictionPolicy
IEvictionPolicy <|.. LFUEvictionPolicy
IEvictionPolicy <|.. FIFOEvictionPolicy
LRUCache *-- IEvictionPolicy

note right of LRUEvictionPolicy
  Least Recently Used:
  Evicts item not accessed
  for longest time
end note

note right of LFUEvictionPolicy
  Least Frequently Used:
  Evicts item with lowest
  access count
end note

note right of FIFOEvictionPolicy
  First In First Out:
  Evicts oldest inserted item
end note

note bottom of LRUCache
  **Code Example:**
  
  // LRU Cache
  ICache cache = new LRUCache(3, new LRUEvictionPolicy());
  cache.put("A", 1); cache.put("B", 2); cache.put("C", 3);
  cache.get("A");  // Access A
  cache.put("D", 4);  // Evicts B (least recently used)
  
  // LFU Cache
  ICache lfuCache = new LRUCache(3, new LFUEvictionPolicy());
  lfuCache.put("A", 1); lfuCache.put("B", 2);
  lfuCache.get("A"); lfuCache.get("A");  // A accessed 2 times
  lfuCache.put("C", 3); lfuCache.put("D", 4);
  // Evicts B or C (frequency = 0), not A (frequency = 2)
  
  // Switch policy at runtime
  cache.setEvictionPolicy(new FIFOEvictionPolicy());
end note

@enduml
```

#### 2. Template Method Pattern - Cache Operations

```plantuml
@startuml

title Template Method Pattern - Cache Template

abstract class AbstractCache {
  # cache: Map<String, Object>
  # capacity: int
  # statistics: ICacheStatistics
  
  + get(key): Object
  + put(key, value): void
  + remove(key): void
  
  # {abstract} evict(): void
  # {abstract} onAccess(key): void
  # beforePut(key, value): void
  # afterPut(key, value): void
  # beforeGet(key): void
  # afterGet(key, value): void
}

class LRUCache {
  - evictionPolicy: LRUEvictionPolicy
  # evict(): void
  # onAccess(key): void
}

class LFUCache {
  - evictionPolicy: LFUEvictionPolicy
  # evict(): void
  # onAccess(key): void
}

AbstractCache <|-- LRUCache
AbstractCache <|-- LFUCache

note left of AbstractCache
  Template method defines skeleton:
  
  **put(key, value):**
  1. beforePut(key, value)
  2. if (isFull()) evict()  // abstract
  3. cache.put(key, value)
  4. onAccess(key)  // abstract
  5. afterPut(key, value)
  
  **get(key):**
  1. beforeGet(key)
  2. value = cache.get(key)
  3. if (value != null) onAccess(key)  // abstract
  4. afterGet(key, value)
  5. return value
end note

note bottom of LRUCache
  **Code Example:**
  
  abstract class AbstractCache {
      public final void put(String key, Object value) {
          beforePut(key, value);  // Hook
          
          if (cache.size() >= capacity) {
              evict();  // Abstract - subclass defines
          }
          
          cache.put(key, value);
          onAccess(key);  // Abstract - subclass defines
          
          afterPut(key, value);  // Hook
          statistics.recordPut();
      }
  }
  
  class LRUCache extends AbstractCache {
      protected void evict() {
          String keyToEvict = evictionPolicy.keyToEvict();
          cache.remove(keyToEvict);
      }
      
      protected void onAccess(String key) {
          evictionPolicy.moveToFront(key);
      }
  }
end note

@enduml
```

## Code Snippets

### Core LRU Cache Implementation

:::note
Thread-safe LRU cache using `ReentrantLock`. The cache maintains O(1) access time using a HashMap and doubly linked list combination.
:::

```java title="LRUCache.java" {19-27,36-39,50-52,62-66}
public class LRUCache<K, V> implements Cache<K, V> {
    private final int capacity;
    private final Map<K, Node<K, V>> cache;
    private final DoublyLinkedList<K, V> list;
    private final ReentrantLock lock;
    private final CacheStatistics stats;
    
    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.cache = new HashMap<>();
        this.list = new DoublyLinkedList<>();
        this.lock = new ReentrantLock();
        this.stats = new CacheStatistics();
    }
    
    @Override
    public V get(K key) {
        lock.lock();
        try {
            Node<K, V> node = cache.get(key);
            if (node == null) {
                stats.recordMiss();
                return null;
            }
            
            // Move to front (most recently used)
            list.moveToFront(node);
            stats.recordHit();
            return node.getValue();
        } finally {
            lock.unlock();
        }
    }
    
    @Override
    public void put(K key, V value) {
        lock.lock();
        try {
            Node<K, V> existingNode = cache.get(key);
            
            if (existingNode != null) {
                // Update existing node
                existingNode.setValue(value);
                list.moveToFront(existingNode);
            } else {
                // Create new node
                Node<K, V> newNode = new Node<>(key, value);
                
                if (cache.size() >= capacity) {
                    evict();
                }
                
                cache.put(key, newNode);
                list.addToFront(newNode);
            }
        } finally {
            lock.unlock();
        }
    }
    
    private void evict() {
        Node<K, V> lru = list.removeLast();
        if (lru != null) {
            cache.remove(lru.getKey());
            stats.recordEviction();
        }
    }
    
    @Override
    public boolean remove(K key) {
        lock.lock();
        try {
            Node<K, V> node = cache.remove(key);
            if (node != null) {
                list.removeNode(node);
                return true;
            }
            return false;
        } finally {
            lock.unlock();
        }
    }
}
```

### Doubly Linked List Implementation

:::note
Uses dummy head and tail nodes to simplify edge cases. The most recently used items are at the front (after head), least recently used at the back (before tail).
:::

```java title="DoublyLinkedList.java" {7-11,14-20,23}
public class DoublyLinkedList<K, V> {
    private Node<K, V> head;
    private Node<K, V> tail;
    private int size;
    
    public DoublyLinkedList() {
        // Dummy head and tail
        head = new Node<>(null, null);
        tail = new Node<>(null, null);
        head.next = tail;
        tail.prev = head;
        size = 0;
    }
    
    public void addToFront(Node<K, V> node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
        size++;
    }
    
    public void removeNode(Node<K, V> node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        size--;
    }
    
    public Node<K, V> removeLast() {
        if (tail.prev == head) {
            return null;
        }
        Node<K, V> last = tail.prev;
        removeNode(last);
        return last;
    }
    
    public void moveToFront(Node<K, V> node) {
        removeNode(node);
        addToFront(node);
    }
}
```

### Node Class

```java
public class Node<K, V> {
    private K key;
    private V value;
    Node<K, V> prev;
    Node<K, V> next;
    
    public Node(K key, V value) {
        this.key = key;
        this.value = value;
    }
    
    public K getKey() {
        return key;
    }
    
    public V getValue() {
        return value;
    }
    
    public void setValue(V value) {
        this.value = value;
    }
}
```

### Usage Example

```java
// Create cache with capacity 3
LRUCache<Integer, String> cache = new LRUCache<>(3);

// Add items
cache.put(1, "one");
cache.put(2, "two");
cache.put(3, "three");

// Access item (moves to front)
String value = cache.get(1); // Returns "one"

// Add new item (evicts least recently used)
cache.put(4, "four"); // Evicts key 2

// Check statistics
System.out.println("Hit rate: " + cache.getHitRate());
System.out.println("Miss rate: " + cache.getMissRate());
```

## Extension Points

1. Add TTL (Time To Live) for cache entries
2. Implement cache warming strategies
3. Add write-through/write-back cache policies
4. Support cache persistence to disk
5. Implement distributed LRU cache
6. Add cache entry size limits (weighted LRU)
7. Support cache invalidation patterns
8. Add metrics and monitoring integration
