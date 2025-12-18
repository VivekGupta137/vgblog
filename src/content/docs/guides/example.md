---
title: Example Guide
description: A guide in my new Starlight docs site.
---


Guides lead a user through a specific task they want to accomplish, often with a sequence of steps.
Writing a good guide requires thinking about what your users are trying to do.

[fundamentals](/high-level-design/fundamentals)

[system-design](/high-level-design/system-design)

```d2
direction: right
installation -> configuration

```


Text can be **bold**, _italic_, or ~~strikethrough~~.

```plantuml
@startuml
participant "Service A" as A
participant "Message Queue" as MQ
participant "Service B" as B

A -> MQ: Publish event
note right: Async message
MQ -> MQ: Store message
MQ --> A: Acknowledged

... 5 minutes later ...

B -> MQ: Poll for messages
MQ --> B: Deliver event
B -> B: Process event
B -> MQ: Acknowledge
@enduml
```

```java
// example.java
System.out.println();
```

## Class Diagram Example

```plantuml
@startuml

skinparam classBorderThickness 3
skinparam ArrowThickness 1
skinparam defaultFontSize 16
skinparam classAttributeFontSize 18
skinparam classFontSize 16

class Vehicle {
  - vehicleId: String
  - brand: String
  - model: String
  - year: int
  + start(): void
  + stop(): void
  + getDetails(): String
}

class Car {
  - numberOfDoors: int
  - fuelType: String
  + openTrunk(): void
}

class Motorcycle {
  - hasCarrier: boolean
  + wheelie(): void
}

abstract class Engine {
  # horsepower: int
  # type: String
  + start(): void
  + stop(): void
}

class ElectricEngine {
  - batteryCapacity: int
  + charge(): void
}

class CombustionEngine {
  - fuelCapacity: double
  + refuel(): void
}

Vehicle <|-- Car
Vehicle <|-- Motorcycle
Vehicle *-- Engine
Engine <|-- ElectricEngine
Engine <|-- CombustionEngine

@enduml
```


```
Text can be **bold**, _italic_, or ~~strikethrough~~.
```
## Further reading

- Read [about how-to guides](https://diataxis.fr/how-to-guides/) in the Diátaxis framework
https://github.com/antfu