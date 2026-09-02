---
title: Reliable, Scalable, and Maintainable Applications
description: Notes on reliability, faults, scalability, load, latency, response time, and performance percentiles.
sidebar:
  order: 1
---

These notes summarize the main ideas behind building **reliable**, **scalable**, and **maintainable** applications.

## System design principles

- **Reliability:** The system should continue to work correctly even when things go wrong, such as hardware or software faults.
- **Scalability:** As the system grows, there should be reasonable ways to handle the growth in traffic, data, or complexity.
- **Maintainability:** Engineers and operations teams should be able to work on the system productively over time.

## Reliability

### Faults vs. failures

- A **fault** is when one component of the system deviates from its specification.
- A **failure** is when the system as a whole stops providing the required service to the user.

:::note[Key distinction]
A fault does not always cause a failure. A fault-tolerant system contains or recovers from component faults before users lose the service.
:::

```diagramsnet
<mxfile>
  <diagram id="fault-to-failure" name="Faults and failures">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="2" value="Component fault" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="60" y="130" width="150" height="60" as="geometry" /></mxCell>
        <mxCell id="3" value="Fault tolerance&#xa;contains or recovers" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="300" y="50" width="180" height="70" as="geometry" /></mxCell>
        <mxCell id="4" value="Service continues" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="570" y="55" width="150" height="60" as="geometry" /></mxCell>
        <mxCell id="5" value="Fault is not contained" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1"><mxGeometry x="300" y="205" width="180" height="60" as="geometry" /></mxCell>
        <mxCell id="6" value="System failure&#xa;user loses service" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="570" y="200" width="150" height="70" as="geometry" /></mxCell>
        <mxCell id="7" value="contained" style="endArrow=classic;html=1;exitX=1;exitY=0.35;entryX=0;entryY=0.5;" edge="1" parent="1" source="2" target="3"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="8" style="endArrow=classic;html=1;" edge="1" parent="1" source="3" target="4"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="9" value="propagates" style="endArrow=classic;html=1;exitX=1;exitY=0.7;entryX=0;entryY=0.5;" edge="1" parent="1" source="2" target="5"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="10" style="endArrow=classic;html=1;" edge="1" parent="1" source="5" target="6"><mxGeometry relative="1" as="geometry" /></mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

### Types of faults

#### Hardware faults

Examples:

- A hard drive crashes.
- RAM becomes faulty.
- The power grid has a blackout.
- Somebody unplugs the wrong cable.

Common prevention and response approaches use **redundancy**:

- Configure disks using RAID.
- Use dual power supplies and replaceable hardware components.
- Provide battery and diesel-generator backup for data centers.

#### Software faults

Software faults are caused by bugs in the software running on the servers. Examples include:

- A bad input causes every application instance to crash.
- A runaway process consumes CPU, memory, bandwidth, or disk space.
- A dependency slows down, becomes unresponsive, or returns corrupted responses.

These faults may remain dormant for a long time and appear only under an unusual set of circumstances. Because many instances can share the same software, one bug can affect all of them at once.

#### Human errors

Configuration mistakes made by operators are a common cause of outages. Useful prevention and recovery approaches include:

- Use good management practices and training.
- Make recovery from human errors quick and easy.
- Set up detailed monitoring, including performance metrics and telemetry.
- Design systems to reduce opportunities for mistakes.
- Keep dangerous actions away from common workflows and require deliberate confirmation.
- Separate the places where people make changes from the systems those changes can break.

## Scalability

**Scalability** describes a system's ability to cope with increased load. It is not a one-dimensional label, so simply saying that one system is scalable and another is not is not very useful.

Better questions are:

- In what way is the system expected to grow?
- What options are available for handling that growth?
- How can more computing resources be added to handle the extra load?

### Load parameters

Load can be described using a few numbers called **load parameters**. The right parameters depend on the system's architecture.

Examples include:

- Requests per second to a web server.
- Ratio of database reads to writes.
- Number of simultaneously active users in a chat room.
- Cache hit rate.
- Distribution of followers per user in a system such as Twitter.

:::tip
Choose load parameters that describe the system's real bottlenecks. Requests per second alone may hide expensive requests, uneven user activity, or a low cache hit rate.
:::

## Latency and response time

- **Response time** is what the client sees: the total time from sending a request to receiving the result.
- **Latency** is the time a request waits before the server starts handling it.

In these notes, total response time can be viewed as:

$$
\text{response time} = \text{latency} + \text{queueing delay} + \text{service time} + \text{network delay}
$$

```diagramsnet
<mxfile>
  <diagram id="response-time" name="Response time components">
    <mxGraphModel dx="1000" dy="500" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="2" value="Latency" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="40" y="110" width="140" height="60" as="geometry" /></mxCell>
        <mxCell id="3" value="Queueing delay" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="220" y="110" width="140" height="60" as="geometry" /></mxCell>
        <mxCell id="4" value="Service time" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="400" y="110" width="140" height="60" as="geometry" /></mxCell>
        <mxCell id="5" value="Network delay" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1"><mxGeometry x="580" y="110" width="140" height="60" as="geometry" /></mxCell>
        <mxCell id="6" value="Total response time" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="300" y="240" width="180" height="60" as="geometry" /></mxCell>
        <mxCell id="7" style="endArrow=classic;html=1;" edge="1" parent="1" source="2" target="6"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="8" style="endArrow=classic;html=1;" edge="1" parent="1" source="3" target="6"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="9" style="endArrow=classic;html=1;" edge="1" parent="1" source="4" target="6"><mxGeometry relative="1" as="geometry" /></mxCell>
        <mxCell id="10" style="endArrow=classic;html=1;" edge="1" parent="1" source="5" target="6"><mxGeometry relative="1" as="geometry" /></mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

:::note
Terminology can vary between sources. Some use **latency** for the entire request duration. When measuring a system, define each metric clearly.
:::

## Describing performance

### Batch and online systems

- **Batch-processing systems** such as Hadoop usually care about **throughput**: the number of records processed per second.
- **Online systems** usually care more about **response time**: how long the client waits for a response.

### Response-time distribution

The same request can take a different amount of time on each attempt. For that reason, response time should be described as a **distribution**.

An average is often not enough because it does not show how many users experience long delays. Percentiles are usually more useful:

- **P50 (median):** Half of the requests are faster and half are slower. If P50 is 200 ms, half of the requests complete in less than 200 ms.
- **P95:** If P95 is 1.5 seconds, 95 out of 100 requests complete within 1.5 seconds and 5 take longer.
- **P99 and P99.9:** These show the experience of users in the slow tail of the distribution.

High percentiles matter because users with the most data or activity often create the most expensive requests. They may also be the most valuable customers.

### SLOs and SLAs

Performance and availability expectations are commonly expressed using:

- **SLO (Service Level Objective):** The internal target for a service, such as P99 response time below 500 ms.
- **SLA (Service Level Agreement):** A formal agreement with customers that may include consequences when targets are missed.
