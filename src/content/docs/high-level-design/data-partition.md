---
title: Data partition
lastUpdated: 2022-08-09

---

Increasing the data, concurrent read / write traffic to the data puts scalability pressure on databases, which in turn increases the latency and impacts throughput.

At some point a single node isn't enough to handle the load.

The goal is to have all nice properties as range queries, secondary indices, and transactions with the ACID properties while we distribute data over many nodes, it's challenging to provide single-node like properties over a distributed database.

One solution is to use NoSQL database, however the historical codebases are usually built around relational db and migrating from relational is difficult problem. 

Data partitioning enables us to use multiple nodes where each node manages some part of the data.


## Sharding

Sharding is the approach in which we split a large dataset into smaller chunks stored in different nodes across the network.

Goal is to distribute the data in an evenly across nodes so that each nodes will get evenly distributed queries.

It's of two types:
1. Vertical sharding
2. Horizontal sharding

## Vertical sharding

In Vertical sharding we split the table into multiple tables, and place them into multiple individual servers.

Often, if the table itself very large, eg. it contains contains columns with very wide texts or blob *(binary large object)*. In this case such columns could be split into different table.

Eg. Let's say we have an `Employee` table, which contains following columns - `EmployeeID`, `Name`, `Picture`.

We can split `Employee` table into two tables
1. `Employee` table - `EmployeeID`, `Name`
    
2. `EmployeePicture` table - `EmployeeID`, `Picture`

```plantuml
@startuml
!theme vibrant
skinparam backgroundColor #FFFFFF
skinparam shadowing true
skinparam roundcorner 10
skinparam padding 5

skinparam package {
    borderColor #555555
    backgroundColor #EEEEEE
    fontColor #333333
    fontSize 14
}

skinparam database {
    borderColor #007bff
    backgroundColor #cce5ff
    fontColor #004085
}

skinparam cloud {
    borderColor #28a745
    backgroundColor #d4edda
    fontColor #155724
}

skinparam node {
    borderColor #6c757d
    backgroundColor #e2e3e5
    fontColor #383d41
}

skinparam component {
    borderColor #17a2b8
    backgroundColor #d1ecf1
    fontColor #0c5460
}

skinparam actor {
    borderColor #dc3545
    backgroundColor #f8d7da
    fontColor #721c24
}

skinparam object {
    borderColor #17a2b8
    backgroundColor #d1ecf1
    fontColor #0c5460
}

skinparam participant {
    borderColor #6c757d
    backgroundColor #e2e3e5
    fontColor #383d41
}

skinparam arrow {
    color #333333
}

skinparam title {
    fontColor #333333
    fontSize 20
}
left to right direction


package "Original Employee Table" {
    object "Employee" as original_e {
        +EmployeeID
        +Name
        +Picture
    }
}

package "Vertical Sharding" {
    object "Employee" as new_e {
        +EmployeeID
        +Name
    }
    object "EmployeePicture" as ep {
        +EmployeeID
        +Picture
    }
}

original_e --> new_e
original_e --> ep

@enduml
```

:::tip[Advantages]

:::
:::caution[Cons]

:::

## Horizontal sharding
Some tables in databases becomes too big, that it impacts the `read/write` latencies.

Horizontal sharding / partitioning, partitions a table into multiple tables by splitting the data **row-wise**.

For example, a `Users` table can be split into multiple smaller tables (shards), with each shard containing a subset of the users.

```plantuml
@startuml
!theme vibrant
skinparam backgroundColor #FFFFFF
skinparam shadowing true
skinparam roundcorner 10
skinparam padding 5

skinparam package {
    borderColor #555555
    backgroundColor #EEEEEE
    fontColor #333333
    fontSize 14
}

skinparam object {
    borderColor #17a2b8
    backgroundColor #d1ecf1
    fontColor #0c5460
}

skinparam arrow {
    color #333333
}

skinparam title {
    fontColor #333333
    fontSize 20
}

title Horizontal Sharding: Row-wise Splitting

package "Original Users Table" {
    object "Users" as original_users {
        UserID
        Name
        Email
        --
        1, 'Alice', 'alice@example.com'
        2, 'Bob', 'bob@example.com'
        3, 'Charlie', 'charlie@example.com'
        4, 'David', 'david@example.com'
    }
}

package "Horizontally Sharded Users Tables" {
    object "Users_Shard1 (Range 1-2)" as shard1 {
        UserID
        Name
        Email
        --
        1, 'Alice', 'alice@example.com'
        2, 'Bob', 'bob@example.com'
    }

    object "Users_Shard2 (Range 3-4)" as shard2 {
        UserID
        Name
        Email
        --
        3, 'Charlie', 'charlie@example.com'
        4, 'David', 'david@example.com'
    }
}

original_users --> shard1
original_users --> shard2

@enduml
```

It's of two types
1. Key-range based sharding
2. Hash based sharding

### Key-range based sharding

In this case each database node is assigned a range of keys *(partition key)*, and based on these keys the data in a table is split into multiple tables.

```plantuml
@startuml
!theme vibrant
skinparam backgroundColor #FFFFFF
skinparam shadowing true
skinparam roundcorner 10
skinparam padding 5

skinparam package {
    borderColor #555555
    backgroundColor #EEEEEE
    fontColor #333333
    fontSize 14
}

skinparam database {
    borderColor #007bff
    backgroundColor #cce5ff
    fontColor #004085
}

skinparam object {
    borderColor #17a2b8
    backgroundColor #d1ecf1
    fontColor #0c5460
}

skinparam arrow {
    color #333333
}

skinparam title {
    fontColor #333333
    fontSize 20
}

title Key-Range Based Sharding: Single Table

package "Original Orders Table" {
    object "Orders" as original {
        OrderID (PK)
        CustomerID
        OrderDate
        Amount
        --
        1001, 'C1', '2024-01-15', $50
        1002, 'C2', '2024-01-16', $75
        1003, 'C3', '2024-01-17', $100
        1004, 'C4', '2024-01-18', $60
    }
}

package "Sharded by OrderID Range" {
    database "Shard 1\n(OrderID: 1000-1999)" as shard1 {
        object "Orders" as s1_orders {
            1001, 'C1', '2024-01-15', $50
            1002, 'C2', '2024-01-16', $75
        }
    }

    database "Shard 2\n(OrderID: 2000-2999)" as shard2 {
        object "Orders" as s2_orders {
            2001, 'C3', '2024-01-17', $100
            2002, 'C4', '2024-01-18', $60
        }
    }
}

original --> shard1
original --> shard2

@enduml
```

sometimes, there multiple tables which are bound by foreign key relationships, in such cases all the data in other tables which is related to the partition key are also stored in same shard.

```plantuml
@startuml
!theme vibrant
skinparam backgroundColor #FFFFFF
skinparam shadowing true
skinparam roundcorner 10
skinparam padding 5

skinparam package {
    borderColor #555555
    backgroundColor #EEEEEE
    fontColor #333333
    fontSize 14
}

skinparam database {
    borderColor #007bff
    backgroundColor #cce5ff
    fontColor #004085
}

skinparam object {
    borderColor #17a2b8
    backgroundColor #d1ecf1
    fontColor #0c5460
}

skinparam arrow {
    color #333333
}

skinparam title {
    fontColor #333333
    fontSize 20
}

title Key-Range Based Sharding: Related Tables with Foreign Keys

package "Original Tables" {
    object "Orders" as orig_orders {
        OrderID (PK)
        CustomerID
        OrderDate
        --
        1001, 'C1', '2024-01-15'
        2001, 'C2', '2024-01-16'
    }
    
    object "OrderItems" as orig_items {
        ItemID (PK)
        OrderID (FK)
        ProductID
        Quantity
        --
        1, 1001, 'P1', 2
        2, 1001, 'P2', 1
        3, 2001, 'P3', 5
    }
}

package "Sharded by OrderID Range" {
    database "Shard 1\n(OrderID: 1000-1999)" as shard1 {
        object "Orders" as s1_orders {
            1001, 'C1', '2024-01-15'
        }
        object "OrderItems" as s1_items {
            1, 1001, 'P1', 2
            2, 1001, 'P2', 1
        }
        s1_orders .. s1_items : FK relationship\nstored together
    }

    database "Shard 2\n(OrderID: 2000-2999)" as shard2 {
        object "Orders" as s2_orders {
            2001, 'C2', '2024-01-16'
        }
        object "OrderItems" as s2_items {
            3, 2001, 'P3', 5
        }
        s2_orders .. s2_items : FK relationship\nstored together
    }
}

orig_orders --> s1_orders
orig_orders --> s2_orders
orig_items --> s1_items
orig_items --> s2_items

note right of shard1
  All data related to OrderID 1001
  (from both Orders and OrderItems)
  is stored in the same shard
end note

@enduml
```

Here's a visual representation of the architecture:

```plantuml
@startuml
!theme vibrant
skinparam backgroundColor #FFFFFF
skinparam shadowing true
skinparam roundcorner 10
skinparam padding 5

skinparam package {
    borderColor #555555
    backgroundColor #EEEEEE
    fontColor #333333
    fontSize 14
}

skinparam database {
    borderColor #007bff
    backgroundColor #cce5ff
    fontColor #004085
}

skinparam cloud {
    borderColor #28a745
    backgroundColor #d4edda
    fontColor #155724
}

skinparam node {
    borderColor #6c757d
    backgroundColor #e2e3e5
    fontColor #383d41
}

skinparam component {
    borderColor #17a2b8
    backgroundColor #d1ecf1
    fontColor #0c5460
}

skinparam arrow {
    color #333333
}

skinparam title {
    fontColor #333333
    fontSize 20
}

title Key Range Based Sharding Architecture

cloud "Client Applications" as clients

node "Router / Query Layer" as router {
  component "Shard Key Logic" as logic
}

package "Shards" {
  database "Shard 1\n(Range: 1-1000)" as shard1
  database "Shard 2\n(Range: 1001-2000)" as shard2
  database "Shard 3\n(Range: 2001-3000)" as shard3
}

clients -> router
router -> shard1
router -> shard2
router -> shard3

note right of logic
  Determines which shard to route to
  based on the shard key's value.
end note

@enduml
```

#### Write Operation

When a client wants to write data, the router first determines the correct shard based on the shard key and then sends the write request to that shard.

```plantuml
@startuml
!theme vibrant
skinparam backgroundColor #FFFFFF
skinparam shadowing true
skinparam roundcorner 10
skinparam padding 5

skinparam database {
    borderColor #007bff
    backgroundColor #cce5ff
    fontColor #004085
}

skinparam participant {
    borderColor #6c757d
    backgroundColor #e2e3e5
    fontColor #383d41
}

skinparam actor {
    borderColor #dc3545
    backgroundColor #f8d7da
    fontColor #721c24
}

skinparam arrow {
    color #333333
}

skinparam title {
    fontColor #333333
    fontSize 20
}

title Write Operation with Key Range Based Sharding

actor Client
participant "Router" as router
database "Shard 1 (Users 1-1000)" as shard1
database "Shard 2 (Users 1001-2000)" as shard2

Client -> router: Write User (ID: 1500, Name: 'Alice')
activate router

router -> router: Analyze shard key (ID: 1500)
router -> shard2: Store User Data
activate shard2

shard2 --> router: Success
deactivate shard2

router --> Client: Write Acknowledged
deactivate router
@enduml
```

#### Read Operation

Similarly, for a read operation, the router identifies the correct shard to fetch the data from.

```plantuml
@startuml
!theme vibrant
skinparam backgroundColor #FFFFFF
skinparam shadowing true
skinparam roundcorner 10
skinparam padding 5

skinparam database {
    borderColor #007bff
    backgroundColor #cce5ff
    fontColor #004085
}

skinparam participant {
    borderColor #6c757d
    backgroundColor #e2e3e5
    fontColor #383d41
}

skinparam actor {
    borderColor #dc3545
    backgroundColor #f8d7da
    fontColor #721c24
}

skinparam arrow {
    color #333333
}

skinparam title {
    fontColor #333333
    fontSize 20
}

title Read Operation with Key Range Based Sharding

actor Client
participant "Router" as router
database "Shard 1 (Users 1-1000)" as shard1
database "Shard 2 (Users 1001-2000)" as shard2

Client -> router: Read User (ID: 800)
activate router

router -> router: Analyze shard key (ID: 800)
router -> shard1: Fetch User Data
activate shard1

shard1 --> router: User Data ('Bob')
deactivate shard1

router --> Client: User Data ('Bob')
deactivate router

@enduml
```

:::tip[Advantages]
- **Efficient Range Queries**: Since data is sorted by the shard key, queries for a range of keys are very efficient as they can be directed to a minimal number of shards.
:::
:::caution[Disadvantages]
- **Hotspots**: If the shard key is not chosen carefully, it can lead to uneven data distribution and hotspots. For example, if you shard by timestamp, all the new data will go to the last shard, creating a hotspot.
- **Re-sharding**: Re-sharding can be complex and may require significant data movement.
:::

### Hash-based sharding

Here a hash function is used to identify which shard a key *(partition key)* will belong to.

Idea here is to use the hash function to generate a hash value of a key and take the modulo of it with total number of shards to get the shard number.

$$
\text{Shard number} = \text{hash}(\textcolor{#FF9800}{\text{key}}) \textcolor{#4CAF50}{\bmod} \textcolor{#FF9800}{\text{total\_shards}}
$$


## Consistent hashing

Consistent hashing assigns each server hash in an abstract circle, irrespective of number of servers in the table.

To determine which server a key is stored on, we move clockwise from the key's position on the ring and pick the first server we encounter.

```plantuml
@startuml

title Consistent Hashing - Initial State

circle "Node A" as NA #cce5ff
circle "Node B" as NB #cce5ff
circle "Node C" as NC #cce5ff

NA -[hidden]right-> NB
NB -[hidden]right-> NC
NC -[hidden]right-> NA

NA -down-> NC : clockwise
NB -down-> NA : clockwise
NC -down-> NB : clockwise

rectangle "Key 1" as K1 #d4edda
rectangle "Key 2" as K2 #d4edda
rectangle "Key 3" as K3 #d4edda
rectangle "Key 4" as K4 #d4edda

K1 --> NB
K2 --> NC
K3 --> NA
K4 --> NA

note as N
  Keys are stored on the next
  clockwise node on the ring.
end note
@enduml
```

The main advantage of consistent hashing is that it minimizes the number of keys that need to be remapped when a server is added or removed.

For example, if we add a new server, `Node D`, only the keys that fall between the new node and the next node clockwise need to be moved.

```plantuml
@startuml

title Consistent Hashing - After Adding Node D

circle "Node A" as NA #cce5ff
circle "Node B" as NB #cce5ff
circle "Node C" as NC #cce5ff
circle "Node D" as ND #fff3cd

NA -[hidden]right-> NB
NB -[hidden]right-> NC
NC -[hidden]right-> ND
ND -[hidden]right-> NA

NA -down-> NB : clockwise
NB -down-> NC : clockwise
NC -down-> ND : clockwise
ND -down-> NA : clockwise

rectangle "Key 1" as K1 #d4edda
rectangle "Key 2" as K2 #d4edda
rectangle "Key 3" as K3 #ffcccc
rectangle "Key 4" as K4 #d4edda

K1 --> NB
K2 --> NC
K3 --> ND : remapped
K4 --> NA

note as N
  When Node D is added, only
  Key 3 is remapped from Node A to Node D.
  Other keys are not affected.
end note
@enduml
```
This reduces the amount of data that needs to be moved between servers, making scaling easier.

## Avoid hash mod n

## Partitioning and secondary indexes

key-value data model partitioning in which the records are retrieved with primary keys. But what if we have to access data with secondary indexes.

Secondary indexes are the records that aren’t identified by primary keys but are just a way of searching for some value.

We can partition with secondary indexes in the following ways.

### Partition secondary indexes by document
