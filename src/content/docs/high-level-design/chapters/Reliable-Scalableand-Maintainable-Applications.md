---
title: Reliable Scalableand Maintainable Applications
---

# Chapter 1 - Reliable-Scalableand-Maintainable-Applications

## System Design Principles

- **Reliability**
  - The system should continue to work correctly even in case of adversity.
  - Adversity: hardware or software faults.

- **Scalability**
  - As the system grows there should be reasonable ways of dealing with that growth.
  - Growth: increase in traffic volume or complexity of the system.

- **Maintainability**
  - Over time different people work on the system and all of those people should be able to work on the system productively.
  - People: engineers or operations can work on the system.

## Faults vs. Failures

- **Fault**
  - A component of the system deviating from its spec.
- **Failure**
  - The system as a whole stops providing the required service to the user.


## Types of Faults

### Hardware Faults
- **Definition & Examples:**
  - Hard drive crashing.
  - RAM becomes faulty.
  - Power grid has a blackout.
  - Somebody unplugs the wrong cable.
- **Prevention / Response (Redundancy):**
  - Individual servers' hardware components like disk can be set up in RAID configuration.
  - Server can have dual power supplies and hot swappable CPUs.
  - Data centers have diesel and battery-powered generators for power backup.

### Software Faults
- **Definition & Examples:**
  - Caused due to bugs in the software itself being run on the servers.
  - Bug that causes every instance of the application's server to crash when given a bad input.
  - Runaway process that eats away all the CPU memory, bandwidth, or disk space.
  - A service that the system depends on slows down or becomes unresponsive and starts sending corrupted responses.
- **Characteristics:**
  - Often lie dormant for a long time.
  - Triggered by an unusual set of circumstances which reveals them.

### Human Errors
- **Definition & Examples:**
  - Configuration errors by operators running the servers are likely the cause of outages.
- **Prevention Approaches:**
  - Good management practices and training.
  - Allowing easy and quick recovery from human errors.
  - Setting up detailed monitoring such as performance metrics / telemetry.
  - Designing systems to minimize opportunities for error:
    - Critical options nested deep instead of showcased on the very first screen.
    - Decouple the places where people make the most mistakes that can cause failures.

## Scalability

- **Definition:**
  - A term used to describe a system's ability to cope with increased load.
  - Not a one-dimensional label; it is meaningless to say that X is scalable and Y is not scalable.
  - Better questions to ask:
    - If a system grows in a particular way, what are the reasonable options of coping with that growth?
    - How can we add more computing resources to handle the additional load?

### Load Parameters
- **Definition:**
  - Since load is a lot related with scalability, it can be defined with a few numbers called load parameters.
  - Depends entirely on the architecture of the system.
- **Examples:**
  - Requests per second to a web server.
  - Ratio of reads to writes to the database.
  - Simultaneously active users in a chat room.
  - The hit rate of a cache, or something else.
  - In the case of Twitter, one of the load parameters is the distribution of followers per user.

## Latency and Response Time

- **Response Time**
  - What the client sees.
  - From the moment the client makes a request to the request returning the result after doing the processing.

- **Latency**
  - The duration that a request has to wait before it's handled by the server.
  - Duration during which a request is latent or awaiting service.


## Response Time Components

- **Response Time Equation:**
  - Response time = latency + queuing delay + service time + network delay.

## Describing Performance

- **Batch Processing Systems (e.g., Hadoop)**
  - Usually care about throughput (the number of records we can process per second).

- **Online Systems**
  - What's usually more important is the service response time (the time it takes between the client sending a request and receiving a response).

- **Measuring Response Time Distribution**
  - Even if the same request is repeated again and again, we'll get slightly different response times for each try.
  - In general, we never look at a single number, but instead a distribution of requests.
  - Average response time in practice is not a very good metric because it doesn't tell how many users are actually experiencing that delay.
  - Usually we use percentiles:
    - Sort a list of times from fastest to slowest; the median is the halfway point.
    - **Median (50th Percentile / P50):**
      - If median response is 200 milliseconds, half of the requests return in less than 200 milliseconds.
      - Tells how long users typically have to wait for their request to be served.

- **Outliers & High Percentiles**
  - Look at 95th, 99th, and 99.9th percentiles (P95, P99, P99.9) to find how bad the outliers are.
  - **P95 Example:** If 95th percentile response time is 1.5 seconds, 95 out of 100 requests take less than 1.5 seconds, and 5 out of 100 take more than 1.5 seconds.
  - **Why care about P99 / high percentiles:**
    - That 1% of users facing higher response times often have the most amount of data in their account because they have made many purchases (they are the most valuable customers).
    - Important to keep them happy.

- **SLA Contracts / SLO / SLA**
  - Expected to define the performance and availability of the service.