---
title: Elevator System
description: Low-Level Design for a Multi-Elevator System
---

## Problem Statement

Design an elevator control system for a building with multiple elevators. The system should efficiently handle user requests from different floors, optimize elevator movement to reduce wait times, and manage elevator states. Support both internal (inside elevator) and external (floor) requests.

## Requirements

### Functional Requirements
1. Handle multiple elevators in a building
2. Process requests from floors (up/down buttons)
3. Process requests from inside elevator (floor selection)
4. Optimal elevator selection based on proximity and direction
5. Support different elevator states: IDLE, MOVING_UP, MOVING_DOWN, MAINTENANCE
6. Door open/close operations with safety checks
7. Emergency stop functionality
8. Maximum capacity enforcement

### Non-Functional Requirements
1. Minimize average wait time
2. Thread-safe for concurrent requests
3. Efficient scheduling algorithm
4. Real-time status updates
5. Fault-tolerant system

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "System Management" {
    [ElevatorSystemService] as System
}

package "Elevator Components" {
    interface "IElevatorCar" as Car
    interface "IElevatorController" as Controller
    interface "IDoorController" as Door
}

package "Building Structure" {
    [Floor]
}

package "User Interface" {
    interface "IPanel" as Panel
    interface "IDisplay" as Display
    interface "IButton" as Button
}

package "Strategy" {
    interface "ISelectionStrategy" as StrategyIntf
}

[ElevatorSystemDriver] --> System : uses
System *-- Car : manages
System *-- Controller : manages
System *-- Floor : manages
System *-- StrategyIntf : composed of
Car *-- Door : composed of
Car *-- Display : composed of
Controller o-- Car : controls
Floor o-- Button : has
Floor o-- Display : has

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum Direction {
    UP
    DOWN
    IDLE
}

enum ElevatorState {
    IDLE
    MOVING_UP
    MOVING_DOWN
    MAINTENANCE
    EMERGENCY
}

enum DoorState {
    OPEN
    CLOSED
    OPENING
    CLOSING
}

class Request {
    - sourceFloor: int
    - destinationFloor: int
    - direction: Direction
    - timestamp: DateTime
    + Request(sourceFloor: int, destinationFloor: int)
    + getDirection(): Direction
    + getSourceFloor(): int
}

interface IElevatorCar {
    + getId(): String
    + getCurrentFloor(): int
    + getState(): ElevatorState
    + addRequest(floor: int): void
    + isMovingTowards(floor: int, direction: Direction): boolean
    + hasCapacity(): boolean
}

class ElevatorCar {
    - id: String
    - currentFloor: int
    - state: ElevatorState
    - doorController: IDoorController
    - displayPanel: IDisplay
    - currentCapacity: int
    - maxCapacity: int
    - requests: PriorityQueue<Integer>
    + ElevatorCar(id: String, maxCapacity: int, doorCtrl: IDoorController, display: IDisplay)
    + move(): void
    + addRequest(floor: int): void
    + getCurrentFloor(): int
    + getState(): ElevatorState
    + isMovingTowards(floor: int, direction: Direction): boolean
    + hasCapacity(): boolean
}

interface IDoorController {
    + open(): void
    + close(): void
    + getState(): DoorState
    + forceOpen(): void
}

class DoorController {
    - state: DoorState
    - sensor: IDoorSensor
    + DoorController(sensor: IDoorSensor)
    + open(): void
    + close(): void
    + getState(): DoorState
    + forceOpen(): void
}

interface IDoorSensor {
    + isObstructed(): boolean
}

class DoorSensor {
    + isObstructed(): boolean
}

interface IButton {
    + press(): void
    + reset(): void
    + isPressed(): boolean
}

class FloorButton {
    - floor: int
    - direction: Direction
    - pressed: boolean
    + FloorButton(floor: int, direction: Direction)
    + press(): void
    + reset(): void
    + isPressed(): boolean
}

class ElevatorButton {
    - destinationFloor: int
    - pressed: boolean
    + ElevatorButton(floor: int)
    + press(): void
    + reset(): void
    + isPressed(): boolean
}

interface IPanel {
    + selectFloor(floor: int): void
    + emergency(): void
}

class ElevatorPanel {
    - buttons: Map<Integer, ElevatorButton>
    - controller: IElevatorController
    + ElevatorPanel(controller: IElevatorController)
    + selectFloor(floor: int): void
    + emergency(): void
}

class Floor {
    - floorNumber: int
    - upButton: FloorButton
    - downButton: FloorButton
    - display: IDisplay
    + Floor(floorNumber: int, display: IDisplay)
    + requestUp(): void
    + requestDown(): void
    + getFloorNumber(): int
}

interface IElevatorController {
    + acceptRequest(floor: int): void
    + start(): void
    + stop(): void
}

class ElevatorController {
    - elevator: IElevatorCar
    - requestQueue: Queue<Integer>
    - running: AtomicBoolean
    + ElevatorController(elevator: IElevatorCar)
    + acceptRequest(floor: int): void
    + start(): void
    + stop(): void
    - processNextRequest(): void
    - shouldStop(floor: int): boolean
}

interface ISelectionStrategy {
    + selectElevator(elevators: List<IElevatorCar>, request: Request): IElevatorCar
}

class NearestElevatorStrategy {
    + selectElevator(elevators: List<IElevatorCar>, request: Request): IElevatorCar
}

class ZoneBasedStrategy {
    - zones: Map<Integer, List<IElevatorCar>>
    + selectElevator(elevators: List<IElevatorCar>, request: Request): IElevatorCar
}

interface IDisplay {
    + update(floor: int, direction: Direction): void
    + show(message: String): void
}

class ElevatorDisplay {
    + update(floor: int, direction: Direction): void
    + show(message: String): void
}

class FloorDisplay {
    + update(floor: int, direction: Direction): void
    + show(message: String): void
}

interface IElevatorSystem {
    + requestElevator(floor: int, direction: Direction): void
    + addElevator(elevator: IElevatorCar, controller: IElevatorController): void
    + getElevatorStatus(): Map<String, String>
}

class ElevatorSystemService {
    - elevators: List<IElevatorCar>
    - controllers: Map<String, IElevatorController>
    - floors: List<Floor>
    - selectionStrategy: ISelectionStrategy
    + ElevatorSystemService(strategy: ISelectionStrategy)
    + requestElevator(floor: int, direction: Direction): void
    + addElevator(elevator: IElevatorCar, controller: IElevatorController): void
    + addFloor(floor: Floor): void
    + getElevatorStatus(): Map<String, String>
}

class ElevatorSystemDriver {
    + {static} main(args: String[]): void
    - setupElevatorSystem(): IElevatorSystem
    - simulateRequests(): void
}

Request *-- Direction

IElevatorCar <|.. ElevatorCar
ElevatorCar *-- ElevatorState
ElevatorCar *-- IDoorController : composed of
ElevatorCar *-- IDisplay : composed of

IDoorController <|.. DoorController
DoorController *-- DoorState
DoorController o-- IDoorSensor : uses
IDoorSensor <|.. DoorSensor

IButton <|.. FloorButton
IButton <|.. ElevatorButton
FloorButton *-- Direction

IPanel <|.. ElevatorPanel
ElevatorPanel o-- ElevatorButton : has
ElevatorPanel o-- IElevatorController : uses

Floor o-- FloorButton : has
Floor o-- IDisplay : has

IElevatorController <|.. ElevatorController
ElevatorController o-- IElevatorCar : controls

ISelectionStrategy <|.. NearestElevatorStrategy
ISelectionStrategy <|.. ZoneBasedStrategy

IDisplay <|.. ElevatorDisplay
IDisplay <|.. FloorDisplay

IElevatorSystem <|.. ElevatorSystemService
ElevatorSystemService *-- IElevatorCar : manages
ElevatorSystemService *-- IElevatorController : manages
ElevatorSystemService *-- Floor : manages
ElevatorSystemService *-- ISelectionStrategy : composed of

ElevatorSystemDriver ..> IElevatorSystem : uses
ElevatorSystemDriver ..> IElevatorCar : creates
ElevatorSystemDriver ..> IElevatorController : creates

@enduml
```

## Key Design Patterns

1. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: ElevatorSystem as single control point
2. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different elevator selection algorithms
3. **[State Pattern](/low-level-design/patterns/behavioural-patterns/#state-pattern)**: Elevator and door state management
4. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Display updates when elevator moves

### Design Pattern Diagrams

#### 1. Strategy Pattern - Elevator Selection Algorithm

```plantuml
@startuml

title Strategy Pattern - Elevator Selection

interface ISelectionStrategy {
  + selectElevator(List<IElevatorCar>, Request): IElevatorCar
}

class ShortestDistanceStrategy {
  + selectElevator(List<IElevatorCar>, Request): IElevatorCar
}

class LeastLoadedStrategy {
  + selectElevator(List<IElevatorCar>, Request): IElevatorCar
}

class ZoneBasedStrategy {
  + selectElevator(List<IElevatorCar>, Request): IElevatorCar
}

class ElevatorSystemService {
  - selectionStrategy: ISelectionStrategy
  - elevators: List<IElevatorCar>
  + setSelectionStrategy(ISelectionStrategy): void
  + requestElevator(floor, direction): void
}

ISelectionStrategy <|.. ShortestDistanceStrategy
ISelectionStrategy <|.. LeastLoadedStrategy
ISelectionStrategy <|.. ZoneBasedStrategy
ElevatorSystemService *-- ISelectionStrategy

note right of ShortestDistanceStrategy
  Selects elevator with
  minimum distance to
  requested floor
end note

note right of LeastLoadedStrategy
  Selects elevator with
  fewest pending requests
  (load balancing)
end note

note right of ZoneBasedStrategy
  Divides building into zones,
  assigns specific elevators
  to each zone
end note

note bottom of ElevatorSystemService
  **Code Example:**
  
  // Office building: use shortest distance
  system.setSelectionStrategy(new ShortestDistanceStrategy());
  
  // Hotel: balance load across all elevators
  system.setSelectionStrategy(new LeastLoadedStrategy());
  
  // Skyscraper: zone-based (floors 1-20, 21-40, etc.)
  system.setSelectionStrategy(new ZoneBasedStrategy());
  
  // Strategy changes behavior without changing client code
  system.requestElevator(15, Direction.UP);
end note

@enduml
```

#### 2. State Pattern - Elevator State Management

```plantuml
@startuml

title State Pattern - Elevator States

enum ElevatorState {
  IDLE
  MOVING_UP
  MOVING_DOWN
  STOPPED
  MAINTENANCE
}

enum DoorState {
  OPEN
  CLOSED
  OPENING
  CLOSING
}

class ElevatorCar {
  - currentState: ElevatorState
  - doorState: DoorState
  - currentFloor: int
  + moveUp(): void
  + moveDown(): void
  + stop(): void
  + openDoors(): void
  + closeDoors(): void
  + handleStateTransition(): void
}

class DoorController {
  - state: DoorState
  + open(): void
  + close(): void
  + canOpen(): boolean
  + canClose(): boolean
}

ElevatorCar *-- ElevatorState
ElevatorCar *-- DoorController
DoorController *-- DoorState

note top of ElevatorState
  State Transitions:
  IDLE -> MOVING_UP/DOWN
  MOVING -> STOPPED
  STOPPED -> IDLE or MOVING
end note

note bottom of ElevatorCar
  **Code Example:**
  
  ElevatorCar elevator = new ElevatorCar(1);
  
  // State: IDLE, DoorState: CLOSED
  elevator.addRequest(5);
  
  // State changes: IDLE -> MOVING_UP
  elevator.move();
  
  // Reaches floor 5
  // State: MOVING_UP -> STOPPED
  elevator.stop();
  
  // Door state: CLOSED -> OPENING -> OPEN
  elevator.openDoors();
  
  // Wait for passengers
  Thread.sleep(3000);
  
  // Door state: OPEN -> CLOSING -> CLOSED
  elevator.closeDoors();
  
  // State: STOPPED -> IDLE (no more requests)
end note

@enduml
```

#### 3. Observer Pattern - Display Updates

```plantuml
@startuml

title Observer Pattern - Elevator Display

interface IElevatorObserver {
  + onFloorChanged(elevatorId, floor): void
  + onDirectionChanged(elevatorId, direction): void
  + onDoorStateChanged(elevatorId, doorState): void
}

class ElevatorCar {
  - observers: List<IElevatorObserver>
  - currentFloor: int
  + addObserver(IElevatorObserver): void
  + removeObserver(IElevatorObserver): void
  - notifyFloorChange(): void
  + moveToFloor(floor): void
}

class FloorDisplay {
  - floorNumber: int
  + onFloorChanged(elevatorId, floor): void
  + updateDisplay(floor): void
}

class CarDisplay {
  - elevatorId: String
  + onFloorChanged(elevatorId, floor): void
  + onDirectionChanged(elevatorId, direction): void
}

class MonitoringSystem {
  + onFloorChanged(elevatorId, floor): void
  + logElevatorMovement(): void
}

ElevatorCar o-- "*" IElevatorObserver : notifies
IElevatorObserver <|.. FloorDisplay
IElevatorObserver <|.. CarDisplay
IElevatorObserver <|.. MonitoringSystem

note bottom of ElevatorCar
  **Code Example:**
  
  ElevatorCar elevator = new ElevatorCar("E1");
  
  // Register observers
  elevator.addObserver(new FloorDisplay(1));
  elevator.addObserver(new FloorDisplay(5));
  elevator.addObserver(new CarDisplay("E1"));
  elevator.addObserver(new MonitoringSystem());
  
  // Movement triggers notifications to all observers
  elevator.moveToFloor(5);
  
  // All displays update automatically:
  // - Floor 1 display: "↑ 2, 3, 4..."
  // - Floor 5 display: "Arriving"
  // - Car display: "Floor 5"
  // - Monitoring: Logs movement
end note

@enduml
```

## Code Snippets

### Elevator Movement Logic

:::note
The `move()` method handles elevator state transitions and floor movements. It processes requests sequentially and updates the display after each move.
:::

```java title="ElevatorCar.java" {3-5,13-21,27}
public class ElevatorCar {
    public void move() {
        if (requests.isEmpty()) {
            state = ElevatorState.IDLE;
            return;
        }
        
        int targetFloor = requests.peek();
        
        if (currentFloor < targetFloor) {
            state = ElevatorState.MOVING_UP;
            currentFloor++;
        } else if (currentFloor > targetFloor) {
            state = ElevatorState.MOVING_DOWN;
            currentFloor--;
        } else {
            // Reached target floor
            requests.poll();
            openDoor();
            // Wait for passengers
            closeDoor();
        }
        
        display.update(currentFloor, getDirection());
    }
    
    public boolean isMovingTowards(int floor, Direction direction) {
        if (state == ElevatorState.IDLE) {
            return true;
        }
        
        if (direction == Direction.UP) {
            return state == ElevatorState.MOVING_UP && currentFloor < floor;
        } else {
            return state == ElevatorState.MOVING_DOWN && currentFloor > floor;
        }
    }
}
```

### Elevator Selection Strategy

:::note
This strategy selects the nearest elevator that is:
1. Moving towards the request floor in the same direction (priority)
2. Idle and closest to the request floor (fallback)
:::

```java title="NearestElevatorStrategy.java" {6-9,12-17,25-32}
public class NearestElevatorStrategy implements ElevatorSelectionStrategy {
    @Override
    public ElevatorCar selectElevator(List<ElevatorCar> elevators, Request request) {
        ElevatorCar bestElevator = null;
        int minDistance = Integer.MAX_VALUE;
        
        for (ElevatorCar elevator : elevators) {
            if (!elevator.hasCapacity()) {
                continue;
            }
            
            // Prefer elevators already moving in the same direction
            if (elevator.isMovingTowards(request.getSourceFloor(), request.getDirection())) {
                int distance = Math.abs(elevator.getCurrentFloor() - request.getSourceFloor());
                if (distance < minDistance) {
                    minDistance = distance;
                    bestElevator = elevator;
                }
            }
        }
        
        // If no suitable elevator found, select nearest idle elevator
        if (bestElevator == null) {
            for (ElevatorCar elevator : elevators) {
                if (elevator.getState() == ElevatorState.IDLE) {
                    int distance = Math.abs(elevator.getCurrentFloor() - request.getSourceFloor());
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestElevator = elevator;
                    }
                }
            }
        }
        
        return bestElevator;
    }
}
```

### Request Processing

```java
public class ElevatorSystem {
    public void requestElevator(int floor, Direction direction) {
        Request request = new Request(floor, -1);
        request.setDirection(direction);
        
        ElevatorCar selectedElevator = selectionStrategy.selectElevator(elevators, request);
        
        if (selectedElevator != null) {
            selectedElevator.addRequest(floor);
            logger.info("Assigned elevator " + selectedElevator.getId() + 
                       " to floor " + floor);
        } else {
            logger.warning("No available elevator for floor " + floor);
        }
    }
}
```

## Extension Points

1. Add predictive algorithms for peak hours
2. Implement energy-saving mode during low usage
3. Add priority handling for VIP floors
4. Support express elevators (skip certain floors)
5. Implement load balancing across elevators
6. Add destination dispatch system (group passengers by destination)
7. Include elevator maintenance scheduling
