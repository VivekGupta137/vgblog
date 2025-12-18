---
title: Parking Lot System
description: Low-Level Design for a Multi-Level Parking Lot System
---

## Problem Statement

Design a parking lot system that can manage multiple levels of parking, different vehicle types (motorcycle, car, truck), and handle parking/unparking operations. The system should efficiently allocate parking spots, calculate fees, and track parking availability.

## Requirements

### Functional Requirements
1. Support multiple vehicle types: Motorcycle, Car, Truck
2. Handle multiple parking levels/floors
3. Different spot sizes: Compact, Regular, Large
4. Assign nearest available spot to vehicles
5. Calculate parking fees based on duration
6. Track spot availability in real-time
7. Generate parking tickets with unique ID
8. Support payment processing
9. Handle entry and exit gates

### Non-Functional Requirements
1. Thread-safe for concurrent parking operations
2. Fast spot lookup (O(1) or O(log n))
3. Scalable to handle thousands of spots
4. High availability
5. Accurate fee calculation

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Core Service" {
    [ParkingLotService] as Service
}

package "Parking Structure" {
    [ParkingFloor] as Floor
    [ParkingSpot] as Spot
}

package "Vehicle & Ticket" {
    interface "IVehicle" as Vehicle
    [ParkingTicket] as Ticket
}

package "Strategies" {
    interface "ISpotAssignmentStrategy" as SpotStrategy
    interface "IFeeCalculator" as FeeCalc
    interface "IPaymentProcessor" as Payment
}

package "Gates" {
    [EntryGate]
    [ExitGate]
}

[ParkingLotDriver] --> Service : uses
Service *-- Floor : composed of
Service *-- SpotStrategy : composed of
Service *-- FeeCalc : composed of
Service *-- Payment : composed of
Service o-- Ticket : manages
Floor *-- Spot : contains
Spot o-- Vehicle : parks
EntryGate --> Service : uses
ExitGate --> Service : uses
ExitGate --> Payment : uses

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum VehicleType {
    MOTORCYCLE
    CAR
    TRUCK
    + canFitIn(spotType: SpotType): boolean
}

enum SpotType {
    COMPACT
    REGULAR
    LARGE
    + getSizeOrder(): int
}

enum ParkingSpotStatus {
    AVAILABLE
    OCCUPIED
    RESERVED
    OUT_OF_SERVICE
}

interface IVehicle {
    + getLicensePlate(): String
    + getType(): VehicleType
}

class Vehicle {
    - licensePlate: String
    - type: VehicleType
    + Vehicle(licensePlate: String, type: VehicleType)
    + getLicensePlate(): String
    + getType(): VehicleType
}

interface ISpotAssignmentStrategy {
    + findSpot(vehicle: IVehicle, floors: List<ParkingFloor>): ParkingSpot
}

class NearestSpotStrategy {
    + findSpot(vehicle: IVehicle, floors: List<ParkingFloor>): ParkingSpot
}

class RandomSpotStrategy {
    + findSpot(vehicle: IVehicle, floors: List<ParkingFloor>): ParkingSpot
}

class ParkingSpot {
    - spotId: String
    - floor: int
    - type: SpotType
    - status: ParkingSpotStatus
    - currentVehicle: IVehicle
    + ParkingSpot(spotId: String, floor: int, type: SpotType)
    + isAvailable(): boolean
    + assign(vehicle: IVehicle): boolean
    + release(): IVehicle
    + canFitVehicle(vehicle: IVehicle): boolean
    + getStatus(): ParkingSpotStatus
    + setStatus(status: ParkingSpotStatus): void
}

class ParkingFloor {
    - floorNumber: int
    - spots: Map<String, ParkingSpot>
    - availableSpotsByType: Map<SpotType, List<ParkingSpot>>
    + ParkingFloor(floorNumber: int)
    + addSpot(spot: ParkingSpot): void
    + findAvailableSpot(vehicle: IVehicle): ParkingSpot
    + getAvailableCount(type: SpotType): int
    + updateAvailability(spot: ParkingSpot): void
}

interface IFeeCalculator {
    + calculateFee(ticket: ParkingTicket): double
}

class HourlyFeeCalculator {
    - rateProvider: IRateProvider
    + HourlyFeeCalculator(provider: IRateProvider)
    + calculateFee(ticket: ParkingTicket): double
}

class FlatFeeCalculator {
    - flatRate: double
    + calculateFee(ticket: ParkingTicket): double
}

interface IRateProvider {
    + getRate(vehicleType: VehicleType): double
    + setRate(vehicleType: VehicleType, rate: double): void
}

class ParkingRateProvider {
    - hourlyRates: Map<VehicleType, Double>
    + getRate(vehicleType: VehicleType): double
    + setRate(vehicleType: VehicleType, rate: double): void
}

class ParkingTicket {
    - ticketId: String
    - vehicle: IVehicle
    - spot: ParkingSpot
    - entryTime: DateTime
    - exitTime: DateTime
    - fee: double
    + ParkingTicket(vehicle: IVehicle, spot: ParkingSpot)
    + setExitTime(time: DateTime): void
    + setFee(fee: double): void
    + getDuration(): long
}

interface IPaymentProcessor {
    + processPayment(amount: double, method: String): boolean
    + refund(transactionId: String, amount: double): boolean
}

class CashPaymentProcessor {
    + processPayment(amount: double, method: String): boolean
    + refund(transactionId: String, amount: double): boolean
}

class CardPaymentProcessor {
    + processPayment(amount: double, method: String): boolean
    + refund(transactionId: String, amount: double): boolean
}

interface IParkingService {
    + parkVehicle(vehicle: IVehicle): ParkingTicket
    + unparkVehicle(ticketId: String): double
    + getAvailableSpots(): int
}

class ParkingLotService {
    - name: String
    - floors: List<ParkingFloor>
    - tickets: Map<String, ParkingTicket>
    - spotStrategy: ISpotAssignmentStrategy
    - feeCalculator: IFeeCalculator
    - paymentProcessor: IPaymentProcessor
    + ParkingLotService(name: String, strategy: ISpotAssignmentStrategy, 
      calculator: IFeeCalculator, processor: IPaymentProcessor)
    + parkVehicle(vehicle: IVehicle): ParkingTicket
    + unparkVehicle(ticketId: String): double
    + addFloor(floor: ParkingFloor): void
    + getAvailableSpots(): int
}

interface IGate {
    + getId(): String
    + isOperational(): boolean
}

class EntryGate {
    - gateId: String
    - parkingService: IParkingService
    + EntryGate(gateId: String, service: IParkingService)
    + generateTicket(vehicle: IVehicle): ParkingTicket
    + getId(): String
    + isOperational(): boolean
}

class ExitGate {
    - gateId: String
    - parkingService: IParkingService
    - paymentProcessor: IPaymentProcessor
    + ExitGate(gateId: String, service: IParkingService, processor: IPaymentProcessor)
    + processExit(ticket: ParkingTicket): double
    + getId(): String
    + isOperational(): boolean
}

class ParkingLotDriver {
    + {static} main(args: String[]): void
    - setupParkingLot(): IParkingService
    - demonstrateParking(): void
}

IVehicle <|.. Vehicle
Vehicle *-- VehicleType

ParkingSpot *-- SpotType
ParkingSpot *-- ParkingSpotStatus
ParkingSpot o-- IVehicle : parks

ParkingFloor *-- ParkingSpot : contains

ISpotAssignmentStrategy <|.. NearestSpotStrategy
ISpotAssignmentStrategy <|.. RandomSpotStrategy

ParkingTicket o-- IVehicle
ParkingTicket o-- ParkingSpot

IFeeCalculator <|.. HourlyFeeCalculator
IFeeCalculator <|.. FlatFeeCalculator
HourlyFeeCalculator o-- IRateProvider
IFeeCalculator ..> ParkingTicket : calculates

IRateProvider <|.. ParkingRateProvider

IPaymentProcessor <|.. CashPaymentProcessor
IPaymentProcessor <|.. CardPaymentProcessor

IParkingService <|.. ParkingLotService
ParkingLotService *-- ParkingFloor : composed of
ParkingLotService o-- ParkingTicket : manages
ParkingLotService *-- ISpotAssignmentStrategy : composed of
ParkingLotService *-- IFeeCalculator : composed of
ParkingLotService *-- IPaymentProcessor : composed of

IGate <|.. EntryGate
IGate <|.. ExitGate
EntryGate o-- IParkingService : uses
ExitGate o-- IParkingService : uses
ExitGate o-- IPaymentProcessor : uses

ParkingLotDriver ..> IParkingService : uses
ParkingLotDriver ..> IVehicle : creates
ParkingLotDriver ..> EntryGate : uses
ParkingLotDriver ..> ExitGate : uses

@enduml
```

## Key Design Patterns

1. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: ParkingLot ensures single instance
2. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Create different vehicle types
3. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different payment methods
4. **[State Pattern](/low-level-design/patterns/behavioural-patterns/#state-pattern)**: Parking spot status management

### Design Pattern Diagrams

#### 1. Strategy Pattern - Fee Calculation & Spot Assignment

```plantuml
@startuml

title Strategy Pattern - Flexible Pricing & Assignment

interface IFeeCalculator {
  + calculateFee(Ticket): double
}

class HourlyFeeCalculator {
  - ratePerHour: double
  + calculateFee(Ticket): double
}

class DailyFeeCalculator {
  - dailyRate: double
  + calculateFee(Ticket): double
}

class WeekendFeeCalculator {
  - weekendMultiplier: double
  + calculateFee(Ticket): double
}

interface ISpotAssignmentStrategy {
  + findSpot(VehicleType, List<ParkingSpot>): ParkingSpot
}

class NearestSpotStrategy {
  + findSpot(VehicleType, List<ParkingSpot>): ParkingSpot
}

class CheapestSpotStrategy {
  + findSpot(VehicleType, List<ParkingSpot>): ParkingSpot
}

class ParkingLotService {
  - feeCalculator: IFeeCalculator
  - assignmentStrategy: ISpotAssignmentStrategy
  + setFeeCalculator(IFeeCalculator): void
  + setAssignmentStrategy(ISpotAssignmentStrategy): void
}

IFeeCalculator <|.. HourlyFeeCalculator
IFeeCalculator <|.. DailyFeeCalculator
IFeeCalculator <|.. WeekendFeeCalculator

ISpotAssignmentStrategy <|.. NearestSpotStrategy
ISpotAssignmentStrategy <|.. CheapestSpotStrategy

ParkingLotService *-- IFeeCalculator
ParkingLotService *-- ISpotAssignmentStrategy

note bottom of ParkingLotService
  **Code Example:**
  
  // Weekday configuration
  service.setFeeCalculator(new HourlyFeeCalculator(5.0));
  service.setAssignmentStrategy(new NearestSpotStrategy());
  
  // Weekend configuration
  service.setFeeCalculator(new WeekendFeeCalculator(1.5));
  
  // Airport parking (daily rate)
  service.setFeeCalculator(new DailyFeeCalculator(25.0));
  service.setAssignmentStrategy(new CheapestSpotStrategy());
end note

@enduml
```

#### 2. Factory Pattern - Vehicle Creation

```plantuml
@startuml

title Factory Pattern - Vehicle Factory

class VehicleFactory {
  + {static} createVehicle(VehicleType, String): IVehicle
  + {static} createCar(String): Car
  + {static} createMotorcycle(String): Motorcycle
  + {static} createTruck(String): Truck
}

interface IVehicle {
  + getType(): VehicleType
  + getLicensePlate(): String
}

class Car {
  - licensePlate: String
  - type: VehicleType = CAR
  + getType(): VehicleType
}

class Motorcycle {
  - licensePlate: String
  - type: VehicleType = MOTORCYCLE
  + getType(): VehicleType
}

class Truck {
  - licensePlate: String
  - type: VehicleType = TRUCK
  + getType(): VehicleType
}

VehicleFactory ..> IVehicle : creates
IVehicle <|.. Car
IVehicle <|.. Motorcycle
IVehicle <|.. Truck

note left of VehicleFactory
  **Code Example:**
  
  // Create vehicles without knowing concrete class
  IVehicle car = VehicleFactory.createVehicle(
    VehicleType.CAR, "ABC-123"
  );
  
  IVehicle bike = VehicleFactory.createVehicle(
    VehicleType.MOTORCYCLE, "XYZ-789"
  );
  
  // Factory handles instantiation logic
  IVehicle vehicle = VehicleFactory.createVehicle(
    userInputType, plateNumber
  );
end note

@enduml
```

#### 3. State Pattern - Parking Spot Status

```plantuml
@startuml

title State Pattern - Parking Spot States

enum SpotStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
  OUT_OF_SERVICE
}

class ParkingSpot {
  - spotId: String
  - status: SpotStatus
  + markAvailable(): void
  + markOccupied(): void
  + markReserved(): void
  + markOutOfService(): void
  + isAvailable(): boolean
}

note top of SpotStatus
  State transitions:
  AVAILABLE -> RESERVED -> OCCUPIED -> AVAILABLE
  Any state -> OUT_OF_SERVICE -> AVAILABLE
end note

ParkingSpot *-- SpotStatus

note bottom of ParkingSpot
  **Code Example:**
  
  ParkingSpot spot = new ParkingSpot("A-101", VehicleType.CAR);
  
  // Initial state: AVAILABLE
  if (spot.isAvailable()) {
      spot.markReserved();  // Reserve during payment
  }
  
  // After payment confirmed
  spot.markOccupied();
  
  // Vehicle exits
  spot.markAvailable();
  
  // Maintenance needed
  spot.markOutOfService();
  
  // State transitions are managed internally
  // Invalid transitions can throw exceptions
end note

@enduml
```

## Code Snippets

### Parking a Vehicle

:::note
The `synchronized` block ensures thread-safe vehicle parking, preventing race conditions when multiple vehicles try to park simultaneously.
:::

```java title="ParkingLot.java" {3,5-7,11}
public class ParkingLot {
    public ParkingTicket parkVehicle(Vehicle vehicle) {
        synchronized(this) {
            ParkingSpot spot = findAvailableSpot(vehicle);
            if (spot == null) {
                throw new NoAvailableSpotException("No available spot for " + vehicle.getType());
            }
            
            spot.assignVehicle(vehicle);
            ParkingTicket ticket = new ParkingTicket(vehicle, spot);
            activeTickets.put(ticket.getTicketId(), ticket);
            
            return ticket;
        }
    }
    
    private ParkingSpot findAvailableSpot(Vehicle vehicle) {
        for (ParkingFloor floor : floors) {
            ParkingSpot spot = floor.findAvailableSpot(vehicle);
            if (spot != null) {
                return spot;
            }
        }
        return null;
    }
}
```

### Spot Availability Check

:::note
Different vehicle types have different size requirements. Motorcycles can fit in any spot, cars need compact or larger spots, and trucks require large spots.
:::

```java title="ParkingSpot.java" {2-4,7-14}
public class ParkingSpot {
    public boolean canFitVehicle(Vehicle vehicle) {
        if (status != ParkingSpotStatus.AVAILABLE) {
            return false;
        }
        
        switch(vehicle.getType()) {
            case MOTORCYCLE:
                return true; // Can fit in any spot
            case CAR:
                return type != SpotType.COMPACT;
            case TRUCK:
                return type == SpotType.LARGE;
            default:
                return false;
        }
    }
}
```

### Fee Calculation

:::note
Fee is calculated based on parking duration in hours, using `Math.ceil()` to round up partial hours.
:::

```java title="ParkingTicket.java" {5-6}
public class ParkingTicket {
    public double calculateFee(ParkingRate rate) {
        if (exitTime == null) {
            exitTime = DateTime.now();
        }
        
        long durationMillis = exitTime.getMillis() - entryTime.getMillis();
        double hours = Math.ceil(durationMillis / (1000.0 * 60 * 60));
        
        this.fee = rate.calculateFee(vehicle, hours);
        return this.fee;
    }
}
```

## Extension Points

1. Add reservation system for spots
2. Implement dynamic pricing based on demand
3. Add electric vehicle charging spots
4. Implement valet parking service
5. Add mobile app integration with QR code scanning
6. Support monthly/annual parking passes
7. Add parking spot navigation system
