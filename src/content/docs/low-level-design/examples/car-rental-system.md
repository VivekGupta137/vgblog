---
title: Car Rental System
description: Low-Level Design for a Car Rental Service
---

## Problem Statement

Design a car rental system that allows customers to search for available vehicles, make reservations, pick up and return cars, and handle billing. The system should manage vehicle inventory across multiple locations, handle different vehicle types, and support various rental plans.

## Requirements

### Functional Requirements
1. Search vehicles by type, location, and dates
2. Reserve vehicles for specific dates
3. Handle vehicle pickup and return
4. Calculate rental charges based on duration and vehicle type
5. Support different rental plans (hourly, daily, weekly)
6. Manage vehicle inventory across multiple branches
7. Track vehicle maintenance and service schedules
8. Handle insurance options
9. Process payments and generate invoices
10. Support membership and loyalty programs

### Non-Functional Requirements
1. Prevent double-booking of vehicles
2. Handle high availability for search operations
3. Real-time inventory updates
4. Accurate billing calculations
5. Scalable to multiple locations

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Rental Service" {
    [RentalService] as Service
}

package "Fleet Management" {
    interface "IVehicle" as Vehicle
    interface "IVehicleInventory" as Inventory
    [VehicleType]
}

package "Customer" {
    interface "ICustomer" as CustomerIntf
    interface "IDriverLicense" as License
}

package "Rental & Billing" {
    interface "IRental" as Rental
    interface "IBill" as Bill
}

package "Strategies" {
    interface "IPricingCalculator" as Pricing
    interface "IDiscountPolicy" as Discount
    interface "IAdditionalChargeCalculator" as Charges
    interface "IPaymentProcessor" as Payment
}

[CarRentalDriver] --> Service : uses
Service *-- Inventory : composed of
Service *-- Pricing : composed of
Service *-- Discount : composed of
Service *-- Charges : composed of
Service *-- Payment : composed of
Service o-- Rental : manages
Inventory o-- Vehicle : manages
Rental o-- CustomerIntf
Rental o-- Vehicle
Bill o-- Rental
Bill o-- Discount : uses
Bill o-- Charges : uses

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum VehicleType {
    ECONOMY
    COMPACT
    SEDAN
    SUV
    LUXURY
    VAN
}

enum VehicleStatus {
    AVAILABLE
    RESERVED
    RENTED
    MAINTENANCE
    RETIRED
}

enum ReservationStatus {
    PENDING
    CONFIRMED
    ACTIVE
    COMPLETED
    CANCELLED
}

enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
}

class Address {
    - street: String
    - city: String
    - state: String
    - zipCode: String
    + Address(street: String, city: String)
    + getCity(): String
}

interface IVehicle {
    + getVehicleId(): String
    + getType(): VehicleType
    + getStatus(): VehicleStatus
    + getDailyRate(): double
}

class Vehicle {
    - vehicleId: String
    - licensePlate: String
    - make: String
    - model: String
    - type: VehicleType
    - status: VehicleStatus
    - mileage: int
    - dailyRate: double
    + Vehicle(vehicleId: String, licensePlate: String, type: VehicleType)
    + getVehicleId(): String
    + getType(): VehicleType
    + getStatus(): VehicleStatus
    + updateStatus(status: VehicleStatus): void
}

interface IDiscountPolicy {
    + getDiscountRate(): double
    + applyDiscount(amount: double): double
}

class NoDiscountPolicy {
    + getDiscountRate(): double
    + applyDiscount(amount: double): double
}

class LoyaltyDiscountPolicy {
    - discountRate: double
    - loyaltyPoints: int
    + LoyaltyDiscountPolicy(rate: double, points: int)
    + getDiscountRate(): double
    + applyDiscount(amount: double): double
    + addPoints(points: int): void
}

interface ICustomer {
    + getCustomerId(): String
    + getName(): String
    + getEmail(): String
    + getDiscountRate(): double
}

class Customer {
    - customerId: String
    - name: String
    - email: String
    - phone: String
    - driverLicense: String
    - address: Address
    - discountPolicy: IDiscountPolicy
    + Customer(customerId: String, name: String, policy: IDiscountPolicy)
    + getCustomerId(): String
    + getName(): String
    + getDiscountRate(): double
}

interface IReservation {
    + getReservationId(): String
    + getCustomer(): ICustomer
    + getVehicle(): IVehicle
    + getStatus(): ReservationStatus
}

class Reservation {
    - reservationId: String
    - customer: ICustomer
    - vehicle: IVehicle
    - pickupDate: DateTime
    - returnDate: DateTime
    - status: ReservationStatus
    - pricingCalculator: IPricingStrategy
    + Reservation(customer: ICustomer, vehicle: IVehicle, calculator: IPricingStrategy)
    + getStatus(): ReservationStatus
    + calculateCost(): double
}

interface IPricingStrategy {
    + calculatePrice(vehicle: IVehicle, days: int): double
}

class HourlyPricing {
    + calculatePrice(vehicle: IVehicle, hours: int): double
}

class DailyPricing {
    + calculatePrice(vehicle: IVehicle, days: int): double
}

class WeeklyPricing {
    - weeklyDiscount: double
    + calculatePrice(vehicle: IVehicle, days: int): double
}

interface IAdditionalChargeCalculator {
    + calculateCharges(rental: IRental): double
}

class LateFeeCalculator {
    + calculateCharges(rental: IRental): double
}

class MileageChargeCalculator {
    + calculateCharges(rental: IRental): double
}

interface IRental {
    + getRentalId(): String
    + getReservation(): IReservation
    + getActualReturnTime(): DateTime
}

class Rental {
    - rentalId: String
    - reservation: IReservation
    - actualPickupTime: DateTime
    - actualReturnTime: DateTime
    - chargeCalculators: List<IAdditionalChargeCalculator>
    + Rental(reservation: IReservation, calculators: List<IAdditionalChargeCalculator>)
    + calculateFinalCost(): double
}

interface IPaymentProcessor {
    + processPayment(amount: double, method: String): boolean
    + refund(transactionId: String, amount: double): boolean
}

class PaymentProcessor {
    + processPayment(amount: double, method: String): boolean
    + refund(transactionId: String, amount: double): boolean
}

class Payment {
    - paymentId: String
    - amount: double
    - status: PaymentStatus
    - processor: IPaymentProcessor
    + Payment(amount: double, processor: IPaymentProcessor)
    + processPayment(): boolean
}

interface IVehicleInventory {
    + checkAvailability(vehicle: IVehicle, start: Date, end: Date): boolean
    + getAvailableVehicles(type: VehicleType, start: Date, end: Date): List<IVehicle>
}

class VehicleInventory {
    - vehicles: Map<String, IVehicle>
    - reservations: List<IReservation>
    + checkAvailability(vehicle: IVehicle, start: Date, end: Date): boolean
    + getAvailableVehicles(type: VehicleType, start: Date, end: Date): List<IVehicle>
}

class SearchCriteria {
    - location: String
    - vehicleType: VehicleType
    - pickupDate: DateTime
    - returnDate: DateTime
    + SearchCriteria(location: String, pickup: DateTime, return: DateTime)
}

interface IRentalService {
    + searchVehicles(criteria: SearchCriteria): List<IVehicle>
    + createReservation(customer: ICustomer, vehicle: IVehicle, pickup: DateTime, return: DateTime): IReservation
    + pickupVehicle(reservationId: String): IRental
}

class RentalService {
    - inventory: IVehicleInventory
    - reservations: Map<String, IReservation>
    - rentals: Map<String, IRental>
    - pricingStrategy: IPricingStrategy
    - paymentProcessor: IPaymentProcessor
    + RentalService(inventory: IVehicleInventory, pricing: IPricingStrategy, processor: IPaymentProcessor)
    + searchVehicles(criteria: SearchCriteria): List<IVehicle>
    + createReservation(customer: ICustomer, vehicle: IVehicle, pickup: DateTime, return: DateTime): IReservation
    + pickupVehicle(reservationId: String): IRental
}

class CarRentalDriver {
    + {static} main(args: String[]): void
    - setupRentalSystem(): IRentalService
    - demonstrateRental(): void
}

IVehicle <|.. Vehicle
Vehicle *-- VehicleType
Vehicle *-- VehicleStatus

IDiscountPolicy <|.. NoDiscountPolicy
IDiscountPolicy <|.. LoyaltyDiscountPolicy

ICustomer <|.. Customer
Customer o-- Address
Customer *-- IDiscountPolicy : composed of

IReservation <|.. Reservation
Reservation o-- ICustomer
Reservation o-- IVehicle
Reservation *-- ReservationStatus
Reservation o-- IPricingStrategy : uses

IPricingStrategy <|.. HourlyPricing
IPricingStrategy <|.. DailyPricing
IPricingStrategy <|.. WeeklyPricing

IAdditionalChargeCalculator <|.. LateFeeCalculator
IAdditionalChargeCalculator <|.. MileageChargeCalculator

IRental <|.. Rental
Rental o-- IReservation
Rental o-- IAdditionalChargeCalculator : uses

IPaymentProcessor <|.. PaymentProcessor
Payment *-- PaymentStatus
Payment *-- IPaymentProcessor : composed of

IVehicleInventory <|.. VehicleInventory
VehicleInventory o-- IVehicle : manages
VehicleInventory o-- IReservation : tracks

IRentalService <|.. RentalService
RentalService *-- IVehicleInventory : composed of
RentalService o-- IReservation : manages
RentalService o-- IRental : manages
RentalService *-- IPricingStrategy : composed of
RentalService *-- IPaymentProcessor : composed of
RentalService ..> SearchCriteria : uses

CarRentalDriver ..> IRentalService : uses
CarRentalDriver ..> ICustomer : creates
CarRentalDriver ..> IVehicle : creates

@enduml
```

## Key Design Patterns

1. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: RentalService as central management
2. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different pricing strategies
3. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Create customers and reservations
4. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Notifications for reservations
5. **[State Pattern](/low-level-design/patterns/behavioural-patterns/#state-pattern)**: Vehicle and reservation status management

### Design Pattern Diagrams

#### 1. Strategy Pattern - Discount Policies (Composition)

```plantuml
@startuml

title Strategy Pattern - Discount Policies

interface IDiscountPolicy {
  + calculateDiscount(basePrice, days): double
  + isApplicable(customer, rental): boolean
}

class NoDiscount {
  + calculateDiscount(basePrice, days): double
  + isApplicable(customer, rental): boolean
}

class SeasonalDiscount {
  - discountPercentage: double
  - validMonths: List<Integer>
  + calculateDiscount(basePrice, days): double
  + isApplicable(customer, rental): boolean
}

class MembershipDiscount {
  - membershipTier: String
  - discountPercentage: double
  + calculateDiscount(basePrice, days): double
  + isApplicable(customer, rental): boolean
}

class LongTermDiscount {
  - minDays: int
  - discountPercentage: double
  + calculateDiscount(basePrice, days): double
}

class Customer {
  - customerId: String
  - discountPolicy: IDiscountPolicy
  + Customer(id, IDiscountPolicy)
  + setDiscountPolicy(IDiscountPolicy): void
  + calculateRentalPrice(rental): double
}

class RentalService {
  - pricingCalculator: IPricingCalculator
  - defaultDiscountPolicy: IDiscountPolicy
  + calculatePrice(customer, rental): double
}

IDiscountPolicy <|.. NoDiscount
IDiscountPolicy <|.. SeasonalDiscount
IDiscountPolicy <|.. MembershipDiscount
IDiscountPolicy <|.. LongTermDiscount
Customer *-- IDiscountPolicy
RentalService *-- IDiscountPolicy

note bottom of Customer
  **Code Example (Composition over Inheritance):**
  
  // Instead of: RegularCustomer, PremiumCustomer, VIPCustomer classes
  // Use composition with discount policies
  
  ICustomer regular = new Customer(
    "C001",
    new NoDiscount()
  );
  
  ICustomer premium = new Customer(
    "C002",
    new MembershipDiscount("GOLD", 15.0)
  );
  
  ICustomer vip = new Customer(
    "C003",
    new MembershipDiscount("PLATINUM", 25.0)
  );
  
  // Seasonal promotion: switch policy dynamically
  regular.setDiscountPolicy(new SeasonalDiscount(20.0));
  
  // Calculate price with discount
  double price = regular.calculateRentalPrice(rental);
  // basePrice: $300
  // After 20% seasonal discount: $240
  
  // VIP with long-term rental gets both discounts
  IDiscountPolicy combined = new CompositeDiscount(
    new MembershipDiscount("PLATINUM", 25.0),
    new LongTermDiscount(7, 10.0)
  );
  vip.setDiscountPolicy(combined);
end note

@enduml
```

#### 2. State Pattern - Vehicle & Reservation Status

```plantuml
@startuml

title State Pattern - Vehicle Status Transitions

enum VehicleStatus {
  AVAILABLE
  RESERVED
  RENTED
  MAINTENANCE
  RETIRED
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  ACTIVE
  COMPLETED
  CANCELLED
}

class Vehicle {
  - vehicleId: String
  - status: VehicleStatus
  + markAvailable(): void
  + markReserved(): void
  + markRented(): void
  + markMaintenance(): void
  + canRent(): boolean
  + canReserve(): boolean
}

class Reservation {
  - reservationId: String
  - status: ReservationStatus
  + confirm(): void
  + activate(): void
  + complete(): void
  + cancel(): void
  - validateTransition(newStatus): void
}

Vehicle *-- VehicleStatus
Reservation *-- ReservationStatus

note right of VehicleStatus
  **State Transitions:**
  
  AVAILABLE -> RESERVED (reservation made)
  RESERVED -> RENTED (customer picks up)
  RENTED -> MAINTENANCE (damage reported)
  MAINTENANCE -> AVAILABLE (repair complete)
  AVAILABLE -> RETIRED (vehicle too old)
  
  Any state -> MAINTENANCE (emergency)
end note

note bottom of Vehicle
  **Code Example:**
  
  Vehicle car = new Vehicle("V-123", VehicleType.SEDAN);
  // Status: AVAILABLE
  
  // Customer makes reservation
  if (car.canReserve()) {
      car.markReserved();
      // Status: AVAILABLE -> RESERVED
  }
  
  // Customer picks up car
  if (car.status == VehicleStatus.RESERVED) {
      car.markRented();
      // Status: RESERVED -> RENTED
  }
  
  // Customer returns car
  car.markAvailable();
  // Status: RENTED -> AVAILABLE
  
  // Damage found during inspection
  car.markMaintenance();
  // Status: AVAILABLE -> MAINTENANCE
  
  // Invalid transitions throw exception
  car.markRented();  // IllegalStateException
  // "Cannot rent vehicle in MAINTENANCE status"
end note

note bottom of Reservation
  **Code Example:**
  
  Reservation reservation = new Reservation(customer, vehicle);
  // Status: PENDING
  
  // Payment confirmed
  reservation.confirm();
  // Status: PENDING -> CONFIRMED
  
  // Customer picks up vehicle
  reservation.activate();
  // Status: CONFIRMED -> ACTIVE
  
  // Customer returns vehicle
  reservation.complete();
  // Status: ACTIVE -> COMPLETED
  
  // Cancellation (only if PENDING or CONFIRMED)
  if (reservation.canCancel()) {
      reservation.cancel();
      // Refund processing based on cancellation policy
  }
end note

@enduml
```

#### 3. Observer Pattern - Reservation Notifications

```plantuml
@startuml

title Observer Pattern - Rental Notifications

interface IReservationObserver {
  + onReservationCreated(reservation): void
  + onReservationConfirmed(reservation): void
  + onRentalStarted(reservation): void
  + onRentalCompleted(reservation): void
  + onReservationCancelled(reservation): void
}

class Reservation {
  - observers: List<IReservationObserver>
  + addObserver(IReservationObserver): void
  + removeObserver(IReservationObserver): void
  + confirm(): void
  + cancel(): void
  - notifyObservers(event): void
}

class EmailNotificationService {
  + onReservationConfirmed(reservation): void
  + onRentalStarted(reservation): void
  + onReservationCancelled(reservation): void
  - sendEmail(customer, template, data): void
}

class SMSNotificationService {
  + onRentalStarted(reservation): void
  + onRentalCompleted(reservation): void
  - sendSMS(phoneNumber, message): void
}

class VehicleInventoryService {
  + onReservationConfirmed(reservation): void
  + onRentalCompleted(reservation): void
  + onReservationCancelled(reservation): void
  - updateVehicleStatus(vehicle, status): void
}

class BillingService {
  + onReservationConfirmed(reservation): void
  + onRentalCompleted(reservation): void
  + onReservationCancelled(reservation): void
  - processPayment(reservation): void
  - generateInvoice(reservation): void
}

Reservation o-- "*" IReservationObserver
IReservationObserver <|.. EmailNotificationService
IReservationObserver <|.. SMSNotificationService
IReservationObserver <|.. VehicleInventoryService
IReservationObserver <|.. BillingService

note bottom of Reservation
  **Code Example:**
  
  Reservation reservation = new Reservation(customer, vehicle, dates);
  
  // Register observers
  reservation.addObserver(new EmailNotificationService());
  reservation.addObserver(new SMSNotificationService());
  reservation.addObserver(new VehicleInventoryService());
  reservation.addObserver(new BillingService());
  
  // Single action notifies all observers
  reservation.confirm();
  
  // Results:
  // 1. EmailNotificationService:
  //    Sends confirmation email with pickup details
  // 2. VehicleInventoryService:
  //    Marks vehicle as RESERVED
  // 3. BillingService:
  //    Processes payment, generates invoice
  
  // Customer picks up car
  reservation.startRental();
  // - Email: Rental agreement and keys info
  // - SMS: "Enjoy your ride! Return by Dec 25"
  // - Inventory: Vehicle status -> RENTED
  
  // Easy to add new observers without modifying Reservation
  reservation.addObserver(new LoyaltyPointsService());
end note

@enduml
```

## Code Snippets

### Create Reservation

:::note
The `synchronized` block ensures atomic reservation creation. Validates dates, checks availability, calculates pricing with discounts, and sends confirmation.
:::

```java title="RentalService.java" {5,7-9,12-14,24-27,31-32,35,38}
public class RentalService {
    public Reservation createReservation(Customer customer, Vehicle vehicle, 
                                        DateTime pickup, DateTime return) 
            throws RentalException {
        synchronized(this) {
            // Validate dates
            if (pickup.isAfter(return)) {
                throw new RentalException("Invalid dates");
            }
            
            // Check availability
            if (!inventory.checkAvailability(vehicle, pickup.toDate(), return.toDate())) {
                throw new RentalException("Vehicle not available for selected dates");
            }
            
            // Create reservation
            Reservation reservation = new Reservation(customer, vehicle);
            reservation.setPickupDate(pickup);
            reservation.setReturnDate(return);
            reservation.setPickupLocation(vehicle.getBranch());
            reservation.setReturnLocation(vehicle.getBranch());
            
            // Calculate estimated cost
            long days = calculateDays(pickup, return);
            double cost = pricingStrategy.calculatePrice(vehicle, (int) days);
            
            // Apply customer discount
            cost = cost * (1 - customer.getDiscountRate());
            reservation.setEstimatedCost(cost);
            
            // Update vehicle status
            vehicle.updateStatus(VehicleStatus.RESERVED);
            reservation.setStatus(ReservationStatus.CONFIRMED);
            
            // Save reservation
            reservations.put(reservation.getReservationId(), reservation);
            
            // Send confirmation
            notificationService.sendReservationConfirmation(reservation);
            
            return reservation;
        }
    }
}
```

### Vehicle Pickup

```java
public class RentalService {
    public Rental pickupVehicle(String reservationId) throws RentalException {
        synchronized(this) {
            Reservation reservation = reservations.get(reservationId);
            
            if (reservation == null) {
                throw new RentalException("Reservation not found");
            }
            
            if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
                throw new RentalException("Reservation is not confirmed");
            }
            
            // Create rental
            Rental rental = new Rental(reservation);
            rental.setActualPickupTime(DateTime.now());
            rental.setStartMileage(reservation.getVehicle().getMileage());
            
            // Update statuses
            reservation.setStatus(ReservationStatus.ACTIVE);
            reservation.getVehicle().updateStatus(VehicleStatus.RENTED);
            
            // Save rental
            rentals.put(rental.getRentalId(), rental);
            
            return rental;
        }
    }
}
```

### Vehicle Return and Invoice Generation

```java
public class RentalService {
    public Invoice returnVehicle(String rentalId, int endMileage) throws RentalException {
        synchronized(this) {
            Rental rental = rentals.get(rentalId);
            
            if (rental == null) {
                throw new RentalException("Rental not found");
            }
            
            // Set return details
            rental.setActualReturnTime(DateTime.now());
            rental.setEndMileage(endMileage);
            
            // Calculate final cost
            double finalCost = calculateFinalCost(rental);
            rental.setTotalCost(finalCost);
            
            // Create invoice
            Invoice invoice = new Invoice(rental);
            
            // Calculate charges
            Reservation reservation = rental.getReservation();
            long actualDays = calculateDays(rental.getActualPickupTime(), 
                                          rental.getActualReturnTime());
            
            // Rental charges
            double rentalCharges = pricingStrategy.calculatePrice(
                reservation.getVehicle(), (int) actualDays);
            invoice.setRentalCharges(rentalCharges);
            
            // Insurance charges
            if (reservation.isInsuranceAdded()) {
                double insuranceCharges = reservation.getInsurance()
                    .calculateCost((int) actualDays);
                invoice.setInsuranceCharges(insuranceCharges);
            }
            
            // Additional charges (mileage, late return, etc.)
            double additionalCharges = calculateAdditionalCharges(rental);
            invoice.setAdditionalCharges(additionalCharges);
            
            // Apply discount
            invoice.applyDiscount(reservation.getCustomer().getDiscountRate());
            
            // Calculate total
            invoice.calculateTotal();
            
            // Update statuses
            reservation.setStatus(ReservationStatus.COMPLETED);
            reservation.getVehicle().updateStatus(VehicleStatus.AVAILABLE);
            reservation.getVehicle().setMileage(endMileage);
            
            return invoice;
        }
    }
    
    private double calculateAdditionalCharges(Rental rental) {
        double charges = 0;
        
        // Late return fee
        DateTime expectedReturn = rental.getReservation().getReturnDate();
        if (rental.getActualReturnTime().isAfter(expectedReturn)) {
            long lateHours = calculateHours(expectedReturn, rental.getActualReturnTime());
            charges += lateHours * 10; // $10 per hour
        }
        
        // Extra mileage fee (if exceeded free limit)
        int mileageDriven = rental.getEndMileage() - rental.getStartMileage();
        int freeMileage = 100 * (int) calculateDays(
            rental.getActualPickupTime(), rental.getActualReturnTime());
        
        if (mileageDriven > freeMileage) {
            charges += (mileageDriven - freeMileage) * 0.5; // $0.50 per extra mile
        }
        
        return charges;
    }
}
```

### Search Vehicles

```java
public class RentalService {
    public List<Vehicle> searchVehicles(SearchCriteria criteria) {
        List<Vehicle> availableVehicles = new ArrayList<>();
        
        // Find branches in location
        List<Branch> matchingBranches = branches.values().stream()
            .filter(b -> b.getAddress().getCity()
                .equalsIgnoreCase(criteria.getLocation()))
            .collect(Collectors.toList());
        
        for (Branch branch : matchingBranches) {
            List<Vehicle> vehicles = inventory.getAvailableVehicles(
                branch,
                criteria.getVehicleType(),
                criteria.getPickupDate().toDate(),
                criteria.getReturnDate().toDate()
            );
            
            // Filter by price range
            vehicles = vehicles.stream()
                .filter(v -> {
                    long days = calculateDays(criteria.getPickupDate(), 
                                            criteria.getReturnDate());
                    double price = v.calculateRentalCost((int) days);
                    return price >= criteria.getMinPrice() 
                        && price <= criteria.getMaxPrice();
                })
                .collect(Collectors.toList());
            
            availableVehicles.addAll(vehicles);
        }
        
        return availableVehicles;
    }
}
```

### Pricing Strategy

```java
public class WeeklyPricing implements PricingStrategy {
    private static final double WEEKLY_DISCOUNT = 0.15; // 15% off
    
    @Override
    public double calculatePrice(Vehicle vehicle, int days) {
        double dailyRate = vehicle.getDailyRate();
        
        if (days >= 7) {
            int weeks = days / 7;
            int remainingDays = days % 7;
            
            double weeklyRate = dailyRate * 7 * (1 - WEEKLY_DISCOUNT);
            double totalCost = (weeks * weeklyRate) + (remainingDays * dailyRate);
            
            return totalCost;
        }
        
        return days * dailyRate;
    }
}
```

## Extension Points

1. Add vehicle features and accessories (GPS, child seats)
2. Implement dynamic pricing based on demand
3. Add one-way rental support (different pickup/return locations)
4. Support corporate accounts and bulk bookings
5. Implement damage assessment and reporting
6. Add roadside assistance services
7. Support electric vehicle charging plans
8. Implement driver rating system
9. Add fuel policy options (full-to-full, prepaid)
10. Support multi-vehicle reservations for group travel
