---
title: Back of the envelope calculations
sidebar:
    order: 3
---

:::note
**Time Units:**
- ns = nanosecond, µs = microsecond, ms = millisecond
- $1 \text{ ns} = 10^{-9}$ seconds
- $1 \text{ µs} = 10^{-6}$ seconds = 1,000 ns
- $1 \text{ ms} = 10^{-3}$ seconds = 1,000 µs = 1,000,000 ns
:::

## Power of 2

| Power | Approx |  | Memory Size |
|-------|--------|-------------|-------------|
| $2^{10}$ | $10^3$ | ~1 thousand | 1 KB |
| $2^{20}$ | $10^6$ | ~1 million  | 1 MB |
| $2^{30}$ | $10^9$ | ~1 billion  | 1 GB |
| $2^{40}$ | $10^{12}$ | ~1 trillion | 1 TB |
| $2^{50}$ | $10^{15}$ | ~1 quadrillion | 1 PB |

## Latency numbers

| Operation | Time | Description |
|-----------|------|-------------|
| L1 cache reference | 0.5 ns | CPU cache access |
| Branch mispredict | 5 ns | Pipeline stall |
| L2 cache reference | 7 ns | Slower CPU cache |
| Mutex lock/unlock | 25 ns | Thread synchronization |


| CPU Bound operation | Time | Description |
|-----------|------|-------------|
| Compress 1KB with Zippy | 3 µs | Fast compression |

| Memory Bound operation | Time | Description |
|-----------|------|-------------|
| Main memory reference | 100 ns | DRAM access |
| Read 1MB sequentially from memory | 9 µs | Sequential memory |

| IO Bound operation | Time | Description |
|-----------|------|-------------|
| Read 4KB randomly from SSD | 150 µs | Random SSD read |
| Read 1MB sequentially from SSD | 1 ms | Sequential SSD read |
| Disk seek | 10 ms | HDD seek time |
| Read 1MB sequentially from disk | 20 ms | HDD sequential read |

| Network Bound operation | Time | Description |
|-----------|------|-------------|
| Send 1KB over 1 Gbps network | 10 µs | Network transfer |
| Round trip within same datacenter | 500 µs | 0.5 ms |
| Send packet CA → Netherlands → CA | 150 ms | Intercontinental round trip |

## Throughput numbers

| System | QPS |
|--------|-----|
| MySQL | 1,000 |
| Key-value store | 10,000 |
| Cache server | 100,000–1M |

> approximations can vary greatly, depending on a variety of reasons like actual query, specs of machine, DB design, indexing and current load on server.

## Availability numbers

High availability is measured in "nines" - the percentage of uptime a system maintains.

| Availability % | Downtime per year (approx) |
|----------------|----------------------------|
| 90% (one nine) | ~1 month |
| 99% (two nines) | ~5 days |
| 99.9% (three nines) | ~10 hours |
| 99.99% (four nines) | ~1 hour |
| 99.999% (five nines) | ~5 minutes |
| 99.9999% (six nines) | ~30 seconds |

:::tip[Commonly asked back-of-the-envelope estimations]
QPS, peak QPS, storage, cache,
number of servers, etc.
:::

## Example: Estimate Twitter QPS and storage requirements
Please note the following numbers are for this exercise only as they are not real numbers
from Twitter.

Assumptions:
- 300 million monthly active users.
- 50% of users use Twitter daily.
- Users post 2 tweets per day on average.
- 10% of tweets contain media.
- Data is stored for 5 years.

Estimations:
Query per second (QPS) estimate:
- Daily active users (DAU) = 300 million * 50% = 150 million
- Tweets QPS = 150 million * 2 tweets / 24 hour / 3600 seconds = ~3500
- Peek QPS = 2 * QPS = ~7000

We will only estimate media storage here.
- Average tweet size:
    - tweet_id 64 bytes
    - text 140 bytes
    - media 1 MB
- Media storage: 150 million * 2 * 10% * 1 MB = 30 TB per day
- 5-year media storage: 30 TB * 365 * 5 = ~55 PB


## Request estimation

Number of requests a typical server can handle in a second.

**CPU clock rate:** $3.5 \text{ GHz} = 3.5 \times 10^9 \text{ clocks/s}$

**CPU time per program:**
$$\text{CPU time per program} = \text{Instructions per program} \times \text{Clock cycles per instruction} \times \text{CPU time per clock cycle}$$

**CPU time per clock cycle:** 
$$\frac{1}{3.5 \times 10^9}$$

**Given:** $1 \text{ request} = 3.5 \times 10^6 \text{ instructions}$

**CPU time per program:**
$$3.5 \times 10^6 \times 1 \times \left(\frac{1}{3.5 \times 10^9}\right) = 0.001 \text{ seconds}$$

**Total requests a CPU executes in 1 second:** $= 1000 \text{ requests}$

**Total requests a 64-core server executes in 1 second:** $= 64000 \text{ requests}$

## Example: Number of servers required Twitter

Assumptions 
- There are `500 million` (M) daily active users (DAU).
- A single user makes `20 requests per day` on average.
- We know that a single server (with `64 cores`) can handle `64000 RPS`.

**Numbers of requests in a day**:  $${500M \times 20}$$ = $$10 \text{ Billion}$$

### Number of Requests per second:

**Total requests per second:**
$$\frac{10 \text{ Billion}}{86400} = 115K \text{ requests per second}$$

### Number of servers required:

**Number of servers required:**
$$\frac{\text{Number of Requests/sec}}{\text{RPS of server}} = \frac{115K}{64000} \approx 2 \text{ servers}$$

### Peak capacity:
To better calculate the peak capacity, we need request and response distributions -- a statistics distribution telling the timing and frequency of requests throughout the entire day.



:::note
We may assume that the requests follow a particular type of distribution like Poisson distribution.

A Poisson distribution is a probability distribution that gives the probability of an outcome. It is a discrete probability distribution that describes the likelihood of a certain number of events occurring within a fixed interval of time or space.
:::

If not available, we can just use the DAU as a proxy for the peak users.

Servers needed at peak load = $$\frac{\text{Number of requests} / \text{second}}{RPS of server}$$ = $$\frac{\text{10 Billion}}{64000}$$ = $$157K$$

157K is an astronomical amount, that might not even be feasible. to reduce this amount, we have two potential paths.
1. Improving the RPS of a server - though possible but require extensive engineering. We can bump 64k RPS server capacity to 100k.
2. Improving over the peak load assumption - this is to improve our assumption, we can make use of pareto principle of 80/20 rule.
:::tip[Pareto principle]
The Pareto principle suggests that approximately 80% of the effects come from 20% of the causes. 
:::
in our case we can assume that 80% of the peak traffic occurs  within 20%(5hrs) of time.

Number of requests/second = $$ \frac{0.8 * \text{10 Billion}}{5 * 60 * 60} $$


Number of servers = $$ \frac{\frac{0.8 * \text{10 Billion}}{5 * 60 * 60}}{64000} $$  $$\approx 8 \text{ servers}$$

### Cost of servers
 EC2 instance type called m7i.16xlarge with a 64-core processor and 256 GB of RAM to get a handle on the dollar cost of servers.
 The cost of one such instance is $$\text{\$3.5K}$$ with a 1-year contract plan.

Low bound server cost per hour = 2*$3.548 = $7.096
Cost under 80–20 assumptions per hour = 8*$3.548 = $28.38
Peak load cost per hour = 157K*$3.548 = $557,061

### Storage estimations

**Assumptions:**
- We have a total of `500M` daily active users.
- Each user posts `3 tweets` per day.
- `10%` of tweets contain images, `5%` contain videos (mutually exclusive).
- Average image size: `200 KB`
- Average video size: `3 MB`
- Tweet text + metadata: `250 bytes`

**Calculations:**

**Total tweets per day:**
$$500M \times 3 = 1500M \text{ tweets/day}$$

**Storage for tweet text:**
$$\frac{1500M \times 250 \text{ bytes}}{1000^3} = 375 \text{ GB/day}$$

**Storage for images:**
$$\frac{1500M \times 10\% \times 200 \text{ KB}}{1000^2} = 30 \text{ TB/day}$$

**Storage for videos:**
$$\frac{1500M \times 5\% \times 3 \text{ MB}}{1000} = 225 \text{ TB/day}$$

**Total storage per day:**
$$0.375 \text{ TB} + 30 \text{ TB} + 225 \text{ TB} \approx 255 \text{ TB/day}$$

**Storage required for one year:**
$$365 \times 255 \text{ TB} = 93,075 \text{ TB} \approx 93.08 \text{ PB}$$
