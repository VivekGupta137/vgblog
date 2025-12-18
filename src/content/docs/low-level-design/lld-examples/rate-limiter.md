---
title: Rate Limiter
description: Low level design for a Rate Limiter
---

## Problem Statement

Design a rate limiter to control the number of requests a user can make to an API within a certain time window.

## Requirements

- The rate limiter should limit the number of requests per user.
- The configuration (e.g., 100 requests per minute) should be flexible.
- The system should be able to handle a large number of users and requests efficiently.
- When a user exceeds the limit, the system should block their requests and return an appropriate error.

## Class Diagram

This diagram shows a Token Bucket algorithm implementation.

```plantuml
@startuml
interface RateLimiter {
  + isAllowed(userId: String): boolean
}

class TokenBucketLimiter implements RateLimiter {
  - buckets: Map<String, TokenBucket>
  - bucketCapacity: int
  - refillRate: int
  + isAllowed(userId: String): boolean
  - getBucket(userId: String): TokenBucket
}

class TokenBucket {
  - tokens: long
  - lastRefillTimestamp: long
  - capacity: int
  - refillRate: int
  + tryConsume(): boolean
  - refill(): void
}

TokenBucketLimiter o-- TokenBucket

note right of TokenBucketLimiter
  `isAllowed` checks if a user's bucket
  exists. If not, it creates a new one.
  It then calls `tryConsume` on the bucket.
end note

note bottom of TokenBucket
  `refill()` adds new tokens based on the
  time elapsed since the last refill, up
  to the bucket's capacity.
  `tryConsume()` first calls `refill()` and
  then checks if there's at least one
  token to consume.
end note
@enduml
```

## Code Snippets

### TokenBucket

The core logic for a single user's token bucket.

```java
public class TokenBucket {
    private final long capacity;
    private final int refillRate; // tokens per second
    private long currentTokens;
    private long lastRefillTimestamp;

    public TokenBucket(long capacity, int refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.currentTokens = capacity;
        this.lastRefillTimestamp = System.nanoTime();
    }

    public synchronized boolean tryConsume() {
        refill();
        if (currentTokens >= 1) {
            currentTokens--;
            return true;
        } else {
            return false;
        }
    }

    private void refill() {
        long now = System.nanoTime();
        double elapsedSeconds = (now - lastRefillTimestamp) / 1.0e9;
        long tokensToAdd = (long) (elapsedSeconds * refillRate);
        if (tokensToAdd > 0) {
            currentTokens = Math.min(capacity, currentTokens + tokensToAdd);
            lastRefillTimestamp = now;
        }
    }
}
```

### TokenBucketLimiter

Manages buckets for all users.

```java
public class TokenBucketLimiter implements RateLimiter {
    private final int bucketCapacity;
    private final int refillRate;
    private final ConcurrentMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    public TokenBucketLimiter(int bucketCapacity, int refillRate) {
        this.bucketCapacity = bucketCapacity;
        this.refillRate = refillRate;
    }

    @Override
    public boolean isAllowed(String userId) {
        TokenBucket bucket = buckets.computeIfAbsent(userId, k -> new TokenBucket(bucketCapacity, refillRate));
        return bucket.tryConsume();
    }
}
```
