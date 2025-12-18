---
title: Hotel Booking System
description: Low-Level Design for a Hotel Room Booking System
---

## Problem Statement

Design a hotel booking system that allows customers to search for available rooms, make reservations, manage bookings, and handle payments. The system should support multiple hotels, room types, booking cancellations, and pricing strategies.

## Requirements

### Functional Requirements
1. Search hotels by location, dates, and room type
2. Check room availability for given dates
3. Create, modify, and cancel bookings
4. Support multiple room types (Single, Double, Suite)
5. Handle payment processing
6. Generate booking confirmations
7. Manage customer profiles
8. Support different pricing strategies (seasonal, weekend, holiday)
9. Handle overbooking scenarios
10. Send booking notifications

### Non-Functional Requirements
1. Handle concurrent bookings without double-booking
2. High availability for search operations
3. ACID properties for booking transactions
4. Scalable to handle multiple hotels
5. Fast search response time

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Booking Service" {
    [BookingService] as Service
}

package "Hotel Management" {
    interface "IHotel" as Hotel
    interface "IRoomManager" as RoomMgr
    interface "IRoom" as Room
}

package "Customer & Booking" {
    interface "IGuest" as Guest
    interface "IBooking" as Booking
}

package "Strategies" {
    interface "IPricingStrategy" as Pricing
    interface "IPaymentProcessor" as Payment
    interface "IInventoryChecker" as Inventory
}

package "Notification" {
    interface "INotificationService" as NotificationIntf
}

[HotelBookingDriver] --> Service : uses
Service *-- Pricing : composed of
Service *-- Payment : composed of
Service *-- Inventory : composed of
Service *-- NotificationIntf : composed of
Service o-- Hotel : manages
Service o-- Booking : manages
Hotel *-- RoomMgr : composed of
RoomMgr o-- Room : manages
Booking o-- Guest
Booking o-- Room
Booking o-- Pricing : uses

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum RoomType {
    SINGLE
    DOUBLE
    SUITE
    DELUXE
}

enum BookingStatus {
    PENDING
    CONFIRMED
    CHECKED_IN
    CHECKED_OUT
    CANCELLED
    NO_SHOW
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
    - country: String
    + Address(street: String, city: String, state: String, zipCode: String, country: String)
    + getCity(): String
}

interface IRoom {
    + getRoomId(): String
    + getRoomNumber(): String
    + getType(): RoomType
    + getPrice(): double
    + isAvailable(checkIn: Date, checkOut: Date): boolean
}

class Room {
    - roomId: String
    - roomNumber: String
    - type: RoomType
    - price: double
    - maxOccupancy: int
    - amenities: List<String>
    + Room(roomId: String, roomNumber: String, type: RoomType)
    + getRoomId(): String
    + getType(): RoomType
    + getPrice(): double
}

interface IHotel {
    + getHotelId(): String
    + getName(): String
    + getAddress(): Address
    + getRooms(): List<IRoom>
}

class Hotel {
    - hotelId: String
    - name: String
    - address: Address
    - roomManager: IRoomManager
    - rating: double
    + Hotel(hotelId: String, name: String, address: Address, manager: IRoomManager)
    + getHotelId(): String
    + getName(): String
    + getAddress(): Address
    + getRooms(): List<IRoom>
}

interface IRoomManager {
    + addRoom(room: IRoom): void
    + removeRoom(roomId: String): void
    + getRooms(): List<IRoom>
    + getAvailableRooms(checkIn: Date, checkOut: Date, type: RoomType): List<IRoom>
}

class RoomManager {
    - rooms: Map<String, IRoom>
    - inventoryChecker: IInventoryChecker
    + RoomManager(checker: IInventoryChecker)
    + addRoom(room: IRoom): void
    + getRooms(): List<IRoom>
    + getAvailableRooms(checkIn: Date, checkOut: Date, type: RoomType): List<IRoom>
}

interface IGuest {
    + getGuestId(): String
    + getName(): String
    + getEmail(): String
}

class Guest {
    - guestId: String
    - name: String
    - email: String
    - phone: String
    - address: Address
    + Guest(guestId: String, name: String)
    + getGuestId(): String
    + getName(): String
    + getEmail(): String
}

interface IBooking {
    + getBookingId(): String
    + getGuest(): IGuest
    + getRoom(): IRoom
    + getStatus(): BookingStatus
    + getTotalAmount(): double
}

class Booking {
    - bookingId: String
    - guest: IGuest
    - room: IRoom
    - checkInDate: Date
    - checkOutDate: Date
    - numberOfGuests: int
    - status: BookingStatus
    - totalAmount: double
    - pricingCalculator: IPricingStrategy
    + Booking(guest: IGuest, room: IRoom, checkIn: Date, checkOut: Date, calculator: IPricingStrategy)
    + getStatus(): BookingStatus
    + getTotalAmount(): double
    + calculateTotalAmount(): double
}

interface IPricingStrategy {
    + calculatePrice(room: IRoom, checkIn: Date, checkOut: Date): double
}

class StandardPricing {
    + calculatePrice(room: IRoom, checkIn: Date, checkOut: Date): double
}

class SeasonalPricing {
    - seasonRates: Map<String, Double>
    + calculatePrice(room: IRoom, checkIn: Date, checkOut: Date): double
}

class WeekendPricing {
    - weekendMultiplier: double
    + calculatePrice(room: IRoom, checkIn: Date, checkOut: Date): double
}

interface IPaymentProcessor {
    + processPayment(amount: double, method: String): boolean
    + refund(transactionId: String, amount: double): boolean
}

class Payment {
    - paymentId: String
    - booking: IBooking
    - amount: double
    - status: PaymentStatus
    - processor: IPaymentProcessor
    + Payment(booking: IBooking, amount: double, processor: IPaymentProcessor)
    + processPayment(): boolean
    + refund(): boolean
}

class PaymentProcessor {
    + processPayment(amount: double, method: String): boolean
    + refund(transactionId: String, amount: double): boolean
}

interface IInventoryChecker {
    + checkAvailability(room: IRoom, checkIn: Date, checkOut: Date): boolean
    + blockRoom(room: IRoom, checkIn: Date, checkOut: Date): boolean
    + releaseRoom(booking: IBooking): void
}

class RoomInventory {
    - bookings: List<IBooking>
    + checkAvailability(room: IRoom, checkIn: Date, checkOut: Date): boolean
    + blockRoom(room: IRoom, checkIn: Date, checkOut: Date): boolean
    + releaseRoom(booking: IBooking): void
}

class SearchCriteria {
    - location: String
    - checkInDate: Date
    - checkOutDate: Date
    - roomType: RoomType
    - numberOfGuests: int
    - minPrice: double
    - maxPrice: double
    + SearchCriteria(location: String, checkIn: Date, checkOut: Date)
}

interface IBookingService {
    + searchHotels(criteria: SearchCriteria): List<IHotel>
    + createBooking(guest: IGuest, room: IRoom, checkIn: Date, checkOut: Date): IBooking
    + cancelBooking(bookingId: String): boolean
}

class BookingService {
    - hotels: Map<String, IHotel>
    - bookings: Map<String, IBooking>
    - inventoryChecker: IInventoryChecker
    - pricingStrategy: IPricingStrategy
    - paymentProcessor: IPaymentProcessor
    - notificationService: INotificationService
    + BookingService(inventory: IInventoryChecker, pricing: IPricingStrategy, 
      payment: IPaymentProcessor, notification: INotificationService)
    + searchHotels(criteria: SearchCriteria): List<IHotel>
    + createBooking(guest: IGuest, room: IRoom, checkIn: Date, checkOut: Date): IBooking
    + cancelBooking(bookingId: String): boolean
}

interface INotificationService {
    + sendBookingConfirmation(booking: IBooking): void
    + sendCancellationNotification(booking: IBooking): void
    + sendReminder(booking: IBooking): void
}

class EmailNotificationService {
    + sendBookingConfirmation(booking: IBooking): void
    + sendCancellationNotification(booking: IBooking): void
    + sendReminder(booking: IBooking): void
}

class HotelBookingDriver {
    + {static} main(args: String[]): void
    - setupBookingSystem(): IBookingService
    - demonstrateBooking(): void
}

IRoom <|.. Room
Room *-- RoomType

IHotel <|.. Hotel
Hotel o-- Address
Hotel *-- IRoomManager : composed of

IRoomManager <|.. RoomManager
RoomManager o-- IRoom : manages
RoomManager o-- IInventoryChecker : uses

IGuest <|.. Guest
Guest o-- Address

IBooking <|.. Booking
Booking o-- IGuest
Booking o-- IRoom
Booking *-- BookingStatus
Booking o-- IPricingStrategy : uses

IPricingStrategy <|.. StandardPricing
IPricingStrategy <|.. SeasonalPricing
IPricingStrategy <|.. WeekendPricing

IPaymentProcessor <|.. PaymentProcessor

Payment o-- IBooking
Payment *-- PaymentStatus
Payment *-- IPaymentProcessor : composed of

IInventoryChecker <|.. RoomInventory
RoomInventory o-- IBooking : tracks

IBookingService <|.. BookingService
BookingService o-- IHotel : manages
BookingService o-- IBooking : manages
BookingService *-- IInventoryChecker : composed of
BookingService *-- IPricingStrategy : composed of
BookingService *-- IPaymentProcessor : composed of
BookingService *-- INotificationService : composed of
BookingService ..> SearchCriteria : uses

INotificationService <|.. EmailNotificationService

HotelBookingDriver ..> IBookingService : uses
HotelBookingDriver ..> IGuest : creates
HotelBookingDriver ..> IHotel : creates

@enduml
```

## Key Design Patterns

1. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different pricing strategies
2. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Create bookings and rooms
3. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Notify users about booking status
4. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: BookingService as central coordinator
5. **Repository Pattern**: Data access for hotels and bookings

### Design Pattern Diagrams

#### 1. Strategy Pattern - Pricing Strategies

```plantuml
@startuml

title Strategy Pattern - Dynamic Pricing

interface IPricingStrategy {
  + calculatePrice(room, checkIn, checkOut): double
}

class StandardPricing {
  + calculatePrice(room, checkIn, checkOut): double
}

class SeasonalPricing {
  - peakSeasonMultiplier: double
  - peakSeasonMonths: List<Integer>
  + calculatePrice(room, checkIn, checkOut): double
}

class WeekendPricing {
  - weekendRate: double
  - weekdayRate: double
  + calculatePrice(room, checkIn, checkOut): double
}

class DynamicPricing {
  - occupancyThresholds: Map<Double, Double>
  + calculatePrice(room, checkIn, checkOut): double
}

class BookingService {
  - pricingStrategy: IPricingStrategy
  + setPricingStrategy(IPricingStrategy): void
  + calculateBookingPrice(booking): double
}

IPricingStrategy <|.. StandardPricing
IPricingStrategy <|.. SeasonalPricing
IPricingStrategy <|.. WeekendPricing
IPricingStrategy <|.. DynamicPricing
BookingService *-- IPricingStrategy

note bottom of StandardPricing
  Fixed price per night
  price = basePrice * nights
end note

note bottom of SeasonalPricing
  Higher rates during peak season
  if (isPeakSeason) {
    price *= multiplier
  }
end note

note bottom of WeekendPricing
  Different rates for
  weekends vs weekdays
end note

note bottom of DynamicPricing
  Price based on occupancy:
  >90% = 1.5x base
  70-90% = 1.2x base
  <70% = 1.0x base
end note

note right of BookingService
  **Code Example:**
  
  BookingService service = new BookingService();
  
  // Standard pricing for budget hotels
  service.setPricingStrategy(new StandardPricing());
  double price1 = service.calculateBookingPrice(booking);
  // Result: $100 * 3 nights = $300
  
  // Seasonal pricing for resort
  service.setPricingStrategy(new SeasonalPricing(2.0));
  double price2 = service.calculateBookingPrice(booking);
  // Result: $100 * 3 nights * 2.0 = $600 (peak season)
  
  // Dynamic pricing based on demand
  service.setPricingStrategy(new DynamicPricing());
  double price3 = service.calculateBookingPrice(booking);
  // Result: Varies by current occupancy
end note

@enduml
```

#### 2. Observer Pattern - Booking Notifications

```plantuml
@startuml

title Observer Pattern - Booking Status Notifications

interface IBookingObserver {
  + onBookingCreated(booking): void
  + onBookingConfirmed(booking): void
  + onBookingCancelled(booking): void
  + onBookingModified(booking): void
}

class Booking {
  - observers: List<IBookingObserver>
  - status: BookingStatus
  + addObserver(IBookingObserver): void
  + removeObserver(IBookingObserver): void
  + confirm(): void
  + cancel(): void
  - notifyObservers(event): void
}

class EmailNotificationService {
  + onBookingCreated(booking): void
  + onBookingConfirmed(booking): void
  + onBookingCancelled(booking): void
  - sendEmail(guest, subject, body): void
}

class SMSNotificationService {
  + onBookingCreated(booking): void
  + onBookingConfirmed(booking): void
  - sendSMS(phoneNumber, message): void
}

class AnalyticsService {
  + onBookingCreated(booking): void
  + onBookingCancelled(booking): void
  - trackEvent(eventName, data): void
}

class InventoryManager {
  + onBookingConfirmed(booking): void
  + onBookingCancelled(booking): void
  - updateAvailability(room, dates): void
}

Booking o-- "*" IBookingObserver
IBookingObserver <|.. EmailNotificationService
IBookingObserver <|.. SMSNotificationService
IBookingObserver <|.. AnalyticsService
IBookingObserver <|.. InventoryManager

note bottom of Booking
  **Code Example:**
  
  Booking booking = new Booking(guest, room, dates);
  
  // Register observers
  booking.addObserver(new EmailNotificationService());
  booking.addObserver(new SMSNotificationService());
  booking.addObserver(new AnalyticsService());
  booking.addObserver(new InventoryManager());
  
  // Single action triggers all observers
  booking.confirm();
  
  // Results:
  // - Email sent: "Booking confirmed for Room 305..."
  // - SMS sent: "Your booking is confirmed"
  // - Analytics: Track conversion event
  // - Inventory: Mark room as unavailable for dates
  
  booking.cancel();
  // All observers notified of cancellation
end note

@enduml
```

#### 3. Factory Pattern - Room & Booking Creation

```plantuml
@startuml

title Factory Pattern - Room and Booking Factory

class RoomFactory {
  + {static} createRoom(type, number, hotel): IRoom
  + {static} createStandardRoom(number, hotel): StandardRoom
  + {static} createDeluxeRoom(number, hotel): DeluxeRoom
  + {static} createSuiteRoom(number, hotel): SuiteRoom
}

class BookingFactory {
  + {static} createBooking(guest, room, dates): IBooking
  + {static} createOnlineBooking(...): OnlineBooking
  + {static} createWalkInBooking(...): WalkInBooking
  + {static} createGroupBooking(...): GroupBooking
}

interface IRoom {
  + getRoomType(): RoomType
  + getBasePrice(): double
}

class StandardRoom {
  - roomNumber: String
  - basePrice: double = 100
  + getRoomType(): RoomType
}

class DeluxeRoom {
  - roomNumber: String
  - basePrice: double = 200
  - hasSeaView: boolean
  + getRoomType(): RoomType
}

class SuiteRoom {
  - roomNumber: String
  - basePrice: double = 500
  - numberOfRooms: int
  + getRoomType(): RoomType
}

RoomFactory ..> IRoom : creates
IRoom <|.. StandardRoom
IRoom <|.. DeluxeRoom
IRoom <|.. SuiteRoom

note right of RoomFactory
  **Code Example:**
  
  Hotel hotel = new Hotel("Grand Plaza");
  
  // Create different room types
  IRoom standard = RoomFactory.createRoom(
    RoomType.STANDARD, "101", hotel
  );
  
  IRoom deluxe = RoomFactory.createRoom(
    RoomType.DELUXE, "501", hotel
  );
  
  IRoom suite = RoomFactory.createRoom(
    RoomType.SUITE, "1001", hotel
  );
  
  // Factory handles complex initialization
  // - Sets default amenities
  // - Configures pricing
  // - Links to hotel
  // - Registers in room inventory
end note

note right of BookingFactory
  **Code Example:**
  
  // Different booking types
  IBooking online = BookingFactory.createOnlineBooking(
    guest, room, checkIn, checkOut, paymentInfo
  );
  
  IBooking walkIn = BookingFactory.createWalkInBooking(
    guest, room, checkIn, checkOut
  );
  
  IBooking group = BookingFactory.createGroupBooking(
    guests, rooms, dates, discountCode
  );
  
  // Each type has different:
  // - Cancellation policies
  // - Payment requirements
  // - Discount applicability
end note

@enduml
```

#### 4. Repository Pattern - Data Access Layer

```plantuml
@startuml

interface BookingRepository {
  + save(booking: Booking): void
  + findById(id: String): Booking
  + findByGuest(guestId: String): List<Booking>
  + findByRoom(roomId: String, start: Date, end: Date): List<Booking>
  + update(booking: Booking): void
  + delete(id: String): void
}

interface RoomRepository {
  + save(room: Room): void
  + findById(id: String): Room
  + findByType(type: RoomType): List<Room>
  + findAvailable(start: Date, end: Date): List<Room>
  + update(room: Room): void
}

class InMemoryBookingRepository {
  - bookings: Map<String, Booking>
  + save(booking: Booking): void
  + findById(id: String): Booking
  + findByGuest(guestId: String): List<Booking>
  + findByRoom(roomId: String, start: Date, end: Date): List<Booking>
  + update(booking: Booking): void
  + delete(id: String): void
}

class DatabaseBookingRepository {
  - connection: Connection
  - queryBuilder: QueryBuilder
  + save(booking: Booking): void
  + findById(id: String): Booking
  + findByGuest(guestId: String): List<Booking>
  + findByRoom(roomId: String, start: Date, end: Date): List<Booking>
  + update(booking: Booking): void
  + delete(id: String): void
}

class BookingService {
  - bookingRepository: BookingRepository
  - roomRepository: RoomRepository
  + createBooking(bookingData): Booking
  + cancelBooking(bookingId: String): void
  + findAvailableRooms(start: Date, end: Date): List<Room>
}

BookingRepository <|.. InMemoryBookingRepository
BookingRepository <|.. DatabaseBookingRepository
BookingService o-- BookingRepository
BookingService o-- RoomRepository

note right of BookingRepository
  Repository Pattern Benefits:
  
  1. **Abstraction**: Business logic doesn't 
     depend on storage implementation
  
  2. **Flexibility**: Easy to switch between
     in-memory, database, or external APIs
  
  3. **Testability**: Can use in-memory 
     repositories for testing
  
  4. **Centralized Queries**: All data access
     logic in one place
     
  5. **Caching**: Can add caching layer
     transparently
end note

note bottom of InMemoryBookingRepository
  // In-memory implementation for testing
  public class InMemoryBookingRepository 
      implements BookingRepository {
      
      private Map<String, Booking> bookings = 
          new ConcurrentHashMap<>();
      
      @Override
      public void save(Booking booking) {
          bookings.put(booking.getId(), booking);
      }
      
      @Override
      public Booking findById(String id) {
          return bookings.get(id);
      }
      
      @Override
      public List<Booking> findByGuest(String guestId) {
          return bookings.values().stream()
              .filter(b -> b.getGuest().getId().equals(guestId))
              .collect(Collectors.toList());
      }
      
      @Override
      public List<Booking> findByRoom(
          String roomId, Date start, Date end) {
          return bookings.values().stream()
              .filter(b -> b.getRoom().getId().equals(roomId))
              .filter(b -> datesOverlap(
                  b.getCheckInDate(), b.getCheckOutDate(), 
                  start, end))
              .collect(Collectors.toList());
      }
  }
end note

note bottom of DatabaseBookingRepository
  // Database implementation for production
  public class DatabaseBookingRepository 
      implements BookingRepository {
      
      private Connection connection;
      
      @Override
      public void save(Booking booking) {
          String sql = """
              INSERT INTO bookings 
              (id, guest_id, room_id, check_in, check_out, status)
              VALUES (?, ?, ?, ?, ?, ?)
              """;
          // Execute SQL...
      }
      
      @Override
      public Booking findById(String id) {
          String sql = """
              SELECT * FROM bookings 
              WHERE id = ?
              """;
          // Execute query and map to Booking object
      }
      
      @Override
      public List<Booking> findByRoom(
          String roomId, Date start, Date end) {
          String sql = """
              SELECT * FROM bookings
              WHERE room_id = ?
              AND check_out > ? AND check_in < ?
              AND status != 'CANCELLED'
              """;
          // Execute query and map to List<Booking>
      }
  }
end note

note bottom of BookingService
  // Service uses repositories without
  // knowing storage implementation
  public class BookingService {
      private BookingRepository bookingRepo;
      private RoomRepository roomRepo;
      
      // Constructor injection
      public BookingService(
          BookingRepository bookingRepo,
          RoomRepository roomRepo) {
          this.bookingRepo = bookingRepo;
          this.roomRepo = roomRepo;
      }
      
      public Booking createBooking(
          Guest guest, Room room, 
          Date checkIn, Date checkOut) {
          
          // Check availability using repository
          List<Booking> conflicts = 
              bookingRepo.findByRoom(
                  room.getId(), checkIn, checkOut);
          
          if (!conflicts.isEmpty()) {
              throw new RoomNotAvailableException();
          }
          
          Booking booking = new Booking(
              guest, room, checkIn, checkOut);
          bookingRepo.save(booking);
          return booking;
      }
      
      public List<Room> findAvailableRooms(
          Date checkIn, Date checkOut) {
          List<Room> allRooms = roomRepo.findAll();
          
          return allRooms.stream()
              .filter(room -> {
                  List<Booking> bookings = 
                      bookingRepo.findByRoom(
                          room.getId(), checkIn, checkOut);
                  return bookings.isEmpty();
              })
              .collect(Collectors.toList());
      }
  }
end note

@enduml
```

## Code Snippets

### Create Booking

:::note
The `synchronized` block ensures atomic booking operations, preventing double-booking. The process includes availability check, pricing calculation, room blocking, and notification.
:::

```java title="BookingService.java" {4,7-9,16,20-22,26,29}
public class BookingService {
    public Booking createBooking(Guest guest, Room room, Date checkIn, Date checkOut) 
            throws BookingException {
        synchronized(this) {
            // Check availability
            RoomInventory inventory = inventoryMap.get(room.getHotel().getHotelId());
            if (!inventory.checkAvailability(room, checkIn, checkOut)) {
                throw new BookingException("Room not available for selected dates");
            }
            
            // Create booking
            Booking booking = new Booking(guest, room, checkIn, checkOut);
            
            // Calculate price
            double totalAmount = pricingStrategy.calculatePrice(room, checkIn, checkOut);
            booking.setTotalAmount(totalAmount);
            
            // Block room
            if (!inventory.blockRoom(room, checkIn, checkOut)) {
                throw new BookingException("Failed to block room");
            }
            
            // Save booking
            booking.setStatus(BookingStatus.PENDING);
            bookings.put(booking.getBookingId(), booking);
            
            // Send notification
            notificationService.sendBookingConfirmation(booking);
            
            return booking;
        }
    }
}
```

### Check Room Availability

:::note
The method checks for date overlaps using the `datesOverlap` utility. It ignores cancelled bookings and only considers active/pending bookings.
:::

```java title="RoomInventory.java" {3-13,16}
public class RoomInventory {
    public boolean checkAvailability(Room room, Date checkIn, Date checkOut) {
        for (Booking booking : bookings) {
            if (!booking.getRoom().equals(room)) {
                continue;
            }
            
            if (booking.getStatus() == BookingStatus.CANCELLED) {
                continue;
            }
            
            // Check for overlap
            if (datesOverlap(booking.getCheckInDate(), booking.getCheckOutDate(), 
                           checkIn, checkOut)) {
                return false;
            }
        }
        return true;
    }
    
    private boolean datesOverlap(Date start1, Date end1, Date start2, Date end2) {
        return !(end1.before(start2) || end2.before(start1));
    }
}
```

### Seasonal Pricing Strategy

```java
public class SeasonalPricing implements PricingStrategy {
    private Map<Season, Double> seasonRates;
    
    @Override
    public double calculatePrice(Room room, Date checkIn, Date checkOut) {
        double basePrice = room.getPrice();
        long nights = calculateNights(checkIn, checkOut);
        
        double totalPrice = 0;
        Calendar cal = Calendar.getInstance();
        cal.setTime(checkIn);
        
        for (int i = 0; i < nights; i++) {
            Season season = getSeason(cal.getTime());
            double multiplier = seasonRates.getOrDefault(season, 1.0);
            totalPrice += basePrice * multiplier;
            cal.add(Calendar.DAY_OF_MONTH, 1);
        }
        
        return totalPrice;
    }
    
    private Season getSeason(Date date) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        int month = cal.get(Calendar.MONTH);
        
        if (month >= 11 || month <= 1) return Season.WINTER;
        if (month >= 2 && month <= 4) return Season.SPRING;
        if (month >= 5 && month <= 7) return Season.SUMMER;
        return Season.FALL;
    }
}
```

### Search Hotels

```java
public class BookingService {
    public List<Hotel> searchHotels(SearchCriteria criteria) {
        List<Hotel> results = new ArrayList<>();
        
        for (Hotel hotel : hotels.values()) {
            if (!matchesLocation(hotel, criteria.getLocation())) {
                continue;
            }
            
            List<Room> availableRooms = hotel.getAvailableRooms(
                criteria.getCheckInDate(),
                criteria.getCheckOutDate(),
                criteria.getRoomType()
            );
            
            if (!availableRooms.isEmpty()) {
                results.add(hotel);
            }
        }
        
        return results;
    }
}
```

## Extension Points

1. Add loyalty programs and rewards
2. Implement dynamic pricing based on demand
3. Add room upgrade options
4. Support group bookings
5. Implement waitlist for fully booked hotels
6. Add review and rating system
7. Support multi-room bookings
8. Implement booking modifications with price adjustments
9. Add integration with payment gateways
10. Support corporate accounts and bulk bookings
