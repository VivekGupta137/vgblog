---
title: Movie Ticket Booking System
description: Low-Level Design for an Online Movie Ticket Booking Platform
---

## Problem Statement

Design a movie ticket booking system (like BookMyShow) that allows users to search for movies, view showtimes, select seats, book tickets, and make payments. The system should handle multiple theaters, screens, movies, and prevent double-booking of seats.

## Requirements

### Functional Requirements
1. Browse movies by location, language, and genre
2. View theater locations and showtimes
3. Display seat layout and availability in real-time
4. Select and book seats with temporary hold
5. Support multiple seat types (Regular, Premium, VIP)
6. Process payments and generate tickets
7. Cancel bookings with refund policies
8. Send booking confirmations via email/SMS
9. Support different movie formats (2D, 3D, IMAX)
10. Handle multiple concurrent bookings

### Non-Functional Requirements
1. Prevent double-booking with proper locking
2. Seat hold timeout mechanism (10 minutes)
3. High availability for search operations
4. Fast seat availability checks
5. Scalable to multiple cities and theaters

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Booking Service" {
    [BookingService] as Service
}

package "Theater Management" {
    interface "ITheater" as Theater
    interface "IScreen" as Screen
    interface "ISeat" as Seat
}

package "Movies & Shows" {
    interface "IMovie" as Movie
    interface "IShow" as Show
}

package "Booking & User" {
    interface "IUser" as User
    interface "IBooking" as Booking
}

package "Payment & Pricing" {
    interface "IPaymentProcessor" as Payment
    interface "IPricingStrategy" as Pricing
}

package "Notification" {
    interface "INotificationService" as NotifSvc
}

package "Search" {
    interface "ISearchService" as SearchSvc
}

[BookingDriver] --> Service : uses
Service *-- Payment : composed of
Service *-- Pricing : composed of
Service *-- NotifSvc : composed of
Service *-- SearchSvc : composed of
Service o-- Booking : manages
Service o-- Theater : manages
Theater o-- Screen : contains
Screen o-- Seat : contains
Show o-- Movie
Show o-- Screen
Booking o-- User
Booking o-- Show
Booking o-- Seat

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum SeatType {
    REGULAR
    PREMIUM
    VIP
    WHEELCHAIR
}

enum SeatStatus {
    AVAILABLE
    BOOKED
    BLOCKED
    TEMPORARILY_HELD
}

enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
    EXPIRED
}

enum ShowStatus {
    SCHEDULED
    RUNNING
    COMPLETED
    CANCELLED
}

enum MovieFormat {
    TWO_D
    THREE_D
    IMAX
    IMAX_3D
}

class Address {
    - street: String
    - city: String
    - state: String
    - zipCode: String
    + Address(street: String, city: String)
}

class Movie {
    - movieId: String
    - title: String
    - description: String
    - duration: int
    - language: String
    - genre: String
    - releaseDate: Date
    - rating: double
    - format: MovieFormat
    + Movie(movieId: String, title: String)
}

class Theater {
    - theaterId: String
    - name: String
    - address: Address
    - screens: List<Screen>
    + Theater(theaterId: String, name: String)
    + addScreen(screen: Screen): void
    + getScreens(): List<Screen>
}

class Screen {
    - screenId: String
    - screenNumber: int
    - theater: Theater
    - seats: List<Seat>
    - totalSeats: int
    + Screen(screenId: String, screenNumber: int)
    + addSeat(seat: Seat): void
    + getSeatMap(): Map<String, Seat>
}

class Seat {
    - seatId: String
    - seatNumber: String
    - row: String
    - column: int
    - type: SeatType
    - status: SeatStatus
    - screen: Screen
    + Seat(seatId: String, seatNumber: String)
    + isAvailable(): boolean
    + temporaryHold(): void
    + release(): void
    + book(): void
}

class Show {
    - showId: String
    - movie: Movie
    - screen: Screen
    - startTime: DateTime
    - endTime: DateTime
    - status: ShowStatus
    - basePrice: double
    + Show(showId: String, movie: Movie, screen: Screen)
    + getAvailableSeats(): List<Seat>
    + getSeatPrice(seatType: SeatType): double
}

class User {
    - userId: String
    - name: String
    - email: String
    - phone: String
    - bookings: List<Booking>
    + User(userId: String, name: String)
    + addBooking(booking: Booking): void
}

class Booking {
    - bookingId: String
    - user: User
    - show: Show
    - seats: List<Seat>
    - status: BookingStatus
    - totalAmount: double
    - bookingTime: DateTime
    - expiryTime: DateTime
    - payment: Payment
    + Booking(user: User, show: Show)
    + addSeat(seat: Seat): void
    + calculateTotal(): double
    + confirm(): void
    + cancel(): boolean
    + isExpired(): boolean
}

class Payment {
    - paymentId: String
    - booking: Booking
    - amount: double
    - paymentMethod: String
    - transactionId: String
    - timestamp: DateTime
    - isSuccessful: boolean
    + Payment(booking: Booking, amount: double)
    + process(): boolean
    + refund(): boolean
}

class Ticket {
    - ticketId: String
    - booking: Booking
    - seat: Seat
    - price: double
    - qrCode: String
    + Ticket(booking: Booking, seat: Seat)
    + generateQRCode(): String
}

class SeatLock {
    - seat: Seat
    - booking: Booking
    - lockTime: DateTime
    - expiryTime: DateTime
    + SeatLock(seat: Seat, booking: Booking)
    + isExpired(): boolean
    + release(): void
}

interface PricingStrategy {
    + calculatePrice(show: Show, seatType: SeatType): double
}

class StandardPricing {
    + calculatePrice(show: Show, seatType: SeatType): double
}

class WeekendPricing {
    - weekendMultiplier: double
    + calculatePrice(show: Show, seatType: SeatType): double
}

class SearchCriteria {
    - city: String
    - movieName: String
    - genre: String
    - language: String
    - date: Date
    + SearchCriteria(city: String)
}

class BookingService {
    - {static} instance: BookingService
    - theaters: Map<String, Theater>
    - movies: Map<String, Movie>
    - shows: Map<String, Show>
    - bookings: Map<String, Booking>
    - seatLocks: Map<String, SeatLock>
    - pricingStrategy: PricingStrategy
    - {static} getInstance(): BookingService
    + searchMovies(criteria: SearchCriteria): List<Movie>
    + getShows(movieId: String, city: String, date: Date): List<Show>
    + getAvailableSeats(showId: String): List<Seat>
    + createBooking(user: User, show: Show, seats: List<Seat>): Booking
    + confirmBooking(bookingId: String, payment: Payment): List<Ticket>
    + cancelBooking(bookingId: String): boolean
    - lockSeats(seats: List<Seat>, booking: Booking): boolean
    - releaseExpiredLocks(): void
}

class NotificationService {
    + sendBookingConfirmation(booking: Booking, tickets: List<Ticket>): void
    + sendCancellationNotification(booking: Booking): void
    + sendShowReminder(booking: Booking): void
}

Movie *-- MovieFormat
Theater o-- Address
Theater o-- Screen : contains
Screen o-- Theater : belongs to
Screen o-- Seat : contains
Seat *-- SeatType
Seat *-- SeatStatus
Seat o-- Screen : in
Show o-- Movie
Show o-- Screen
Show *-- ShowStatus
User o-- Booking : has
Booking o-- User
Booking o-- Show
Booking o-- Seat : holds
Booking *-- BookingStatus
Booking o-- Payment
Payment o-- Booking
Ticket o-- Booking
Ticket o-- Seat
SeatLock o-- Seat : locks
SeatLock o-- Booking : for
PricingStrategy <|.. StandardPricing
PricingStrategy <|.. WeekendPricing
BookingService o-- Theater : manages
BookingService o-- Movie : manages
BookingService o-- Show : manages
BookingService o-- Booking : manages
BookingService o-- SeatLock : manages
BookingService *-- PricingStrategy : uses
BookingService ..> SearchCriteria : uses
BookingService *-- NotificationService : composed of

@enduml
```

## Key Design Patterns

1. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: BookingService as central coordinator
2. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different pricing strategies
3. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Create bookings and tickets
4. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Notifications for bookings
5. **[State Pattern](/low-level-design/patterns/behavioural-patterns/#state-pattern)**: Seat and booking status management

### Design Pattern Diagrams

#### 1. Strategy Pattern - Dynamic Pricing

```plantuml
@startuml

title Strategy Pattern - Movie Ticket Pricing

interface IPricingStrategy {
  + calculatePrice(show, seat, date): double
  + applyDiscount(basePrice, customer): double
}

class StandardPricing {
  - basePriceMultipliers: Map<SeatType, Double>
  + calculatePrice(show, seat, date): double
}

class WeekendPricing {
  - weekendMultiplier: double = 1.3
  + calculatePrice(show, seat, date): double
}

class MatineePricing {
  - matineeDiscount: double = 0.7
  - matineeEndTime: Time = 17:00
  + calculatePrice(show, seat, date): double
}

class DynamicPricing {
  - occupancyRate: double
  - demandMultiplier: double
  + calculatePrice(show, seat, date): double
  - calculateDemandMultiplier(occupancy): double
}

class BookingService {
  - pricingStrategy: IPricingStrategy
  + setPricingStrategy(IPricingStrategy): void
  + calculateBookingPrice(show, seats): double
}

IPricingStrategy <|.. StandardPricing
IPricingStrategy <|.. WeekendPricing
IPricingStrategy <|.. MatineePricing
IPricingStrategy <|.. DynamicPricing
BookingService *-- IPricingStrategy

note right of StandardPricing
  Fixed pricing:
  - Regular: $10
  - Premium: $15
  - VIP: $25
end note

note right of WeekendPricing
  Weekend markup:
  Friday-Sunday: 1.3x
  Holidays: 1.5x
end note

note right of MatineePricing
  Before 5 PM:
  30% discount
  on all seats
end note

note right of DynamicPricing
  Based on demand:
  <50% full: 0.8x
  50-80%: 1.0x
  80-95%: 1.2x
  >95%: 1.5x
end note

note bottom of BookingService
  **Code Example:**
  
  BookingService service = BookingService.getInstance();
  
  // Weekday afternoon: use matinee pricing
  Show matineeShow = getShow("14:00");
  service.setPricingStrategy(new MatineePricing());
  double price1 = service.calculateBookingPrice(matineeShow, seats);
  // Regular seat: $10 * 0.7 = $7
  
  // Weekend evening: use weekend pricing
  Show weekendShow = getShow("Saturday 20:00");
  service.setPricingStrategy(new WeekendPricing());
  double price2 = service.calculateBookingPrice(weekendShow, seats);
  // Regular seat: $10 * 1.3 = $13
  
  // Blockbuster release: use dynamic pricing
  Show blockbuster = getShow("Opening night");
  service.setPricingStrategy(new DynamicPricing());
  double price3 = service.calculateBookingPrice(blockbuster, seats);
  // 95% full, Regular seat: $10 * 1.5 = $15
  
  // Combine strategies (Decorator pattern)
  IPricingStrategy combo = new CompositePricing(
    new WeekendPricing(),  // 1.3x for weekend
    new DynamicPricing()   // Additional demand multiplier
  );
  // Saturday blockbuster: $10 * 1.3 * 1.5 = $19.50
end note

@enduml
```

#### 2. State Pattern - Seat Locking & Booking

```plantuml
@startuml

title State Pattern - Seat and Booking States

enum SeatStatus {
  AVAILABLE
  TEMPORARILY_HELD
  BOOKED
  BLOCKED
}

enum BookingStatus {
  INITIATED
  PAYMENT_PENDING
  CONFIRMED
  CANCELLED
  EXPIRED
}

class Seat {
  - seatId: String
  - status: SeatStatus
  - lockExpiry: DateTime
  + isAvailable(): boolean
  + temporaryHold(booking, duration): boolean
  + release(): void
  + book(): void
  + block(reason): void
  - validateTransition(newStatus): void
}

class Booking {
  - bookingId: String
  - status: BookingStatus
  - expiryTime: DateTime
  - seats: List<Seat>
  + initiate(): void
  + holdSeats(): boolean
  + confirmPayment(): void
  + cancel(): void
  + expire(): void
  + isExpired(): boolean
}

class SeatLockManager {
  - locks: Map<String, SeatLock>
  + acquireLock(seat, booking, duration): boolean
  + releaseLock(seat): void
  + releaseExpiredLocks(): void
  - cleanupExpiredLocks(): void
}

Seat *-- SeatStatus
Booking *-- BookingStatus
Booking o-- "*" Seat
SeatLockManager ..> Seat

note right of SeatStatus
  **State Transitions:**
  
  AVAILABLE -> TEMPORARILY_HELD
    (user selects seat, 10 min timer)
  
  TEMPORARILY_HELD -> BOOKED
    (payment successful)
  
  TEMPORARILY_HELD -> AVAILABLE
    (timer expires or user cancels)
  
  BOOKED -> BLOCKED
    (maintenance, damage)
  
  BLOCKED -> AVAILABLE
    (issue resolved)
end note

note bottom of Seat
  **Code Example:**
  
  Seat seat = show.getSeat("A-15");
  // Status: AVAILABLE
  
  // User selects seat during booking
  if (seat.isAvailable()) {
    seat.temporaryHold(booking, Duration.ofMinutes(10));
    // Status: AVAILABLE -> TEMPORARILY_HELD
    // Lock expires in 10 minutes
  }
  
  // Payment successful
  seat.book();
  // Status: TEMPORARILY_HELD -> BOOKED
  
  // Invalid transition throws exception
  seat.temporaryHold(otherBooking, duration);
  // IllegalStateException: "Seat already booked"
  
  // Concurrent booking prevention
  synchronized(seat) {
    if (seat.isAvailable()) {
      seat.temporaryHold(booking, duration);
    } else {
      throw new SeatUnavailableException();
    }
  }
end note

note bottom of Booking
  **Code Example:**
  
  Booking booking = new Booking(user, show, seats);
  // Status: INITIATED
  
  // Hold seats for payment
  if (booking.holdSeats()) {
    // Status: INITIATED -> PAYMENT_PENDING
    // Expiry: current time + 10 minutes
    
    // User completes payment
    Payment payment = processPayment(booking);
    
    if (payment.isSuccessful()) {
      booking.confirmPayment();
      // Status: PAYMENT_PENDING -> CONFIRMED
      // Seats: TEMPORARILY_HELD -> BOOKED
      // Send confirmation email & tickets
    }
  }
  
  // Background job releases expired bookings
  scheduler.schedule(() -> {
    for (Booking b : pendingBookings) {
      if (b.isExpired()) {
        b.expire();
        // Status: PAYMENT_PENDING -> EXPIRED
        // Release held seats
        b.releaseSeats();
      }
    }
  }, everyMinute);
end note

@enduml
```

#### 3. Observer Pattern - Booking Notifications

```plantuml
@startuml

title Observer Pattern - Booking Events

interface IBookingObserver {
  + onBookingCreated(booking): void
  + onSeatsSelected(booking, seats): void
  + onPaymentPending(booking): void
  + onBookingConfirmed(booking, tickets): void
  + onBookingCancelled(booking): void
  + onBookingExpired(booking): void
}

class Booking {
  - observers: List<IBookingObserver>
  + addObserver(IBookingObserver): void
  + removeObserver(IBookingObserver): void
  + confirm(): void
  + cancel(): void
  - notifyObservers(event, data): void
}

class EmailNotificationService {
  + onBookingConfirmed(booking, tickets): void
  + onBookingCancelled(booking): void
  + onBookingExpired(booking): void
  - sendEmail(user, template, data): void
  - sendTickets(user, tickets): void
}

class SMSNotificationService {
  + onBookingConfirmed(booking, tickets): void
  + onPaymentPending(booking): void
  - sendSMS(phoneNumber, message): void
}

class SeatInventoryService {
  + onSeatsSelected(booking, seats): void
  + onBookingConfirmed(booking, tickets): void
  + onBookingCancelled(booking): void
  + onBookingExpired(booking): void
  - lockSeats(seats, duration): void
  - releaseSeats(seats): void
}

class AnalyticsService {
  + onBookingCreated(booking): void
  + onBookingConfirmed(booking, tickets): void
  + onBookingCancelled(booking): void
  - trackEvent(eventName, properties): void
  - trackRevenue(amount): void
}

class QRCodeGenerator {
  + onBookingConfirmed(booking, tickets): void
  - generateQRCode(ticket): String
  - storeQRCode(ticketId, qrCode): void
}

Booking o-- "*" IBookingObserver
IBookingObserver <|.. EmailNotificationService
IBookingObserver <|.. SMSNotificationService
IBookingObserver <|.. SeatInventoryService
IBookingObserver <|.. AnalyticsService
IBookingObserver <|.. QRCodeGenerator

note bottom of Booking
  **Code Example:**
  
  Booking booking = new Booking(user, show, selectedSeats);
  
  // Register observers
  booking.addObserver(new EmailNotificationService());
  booking.addObserver(new SMSNotificationService());
  booking.addObserver(new SeatInventoryService());
  booking.addObserver(new AnalyticsService());
  booking.addObserver(new QRCodeGenerator());
  
  // User selects seats
  booking.selectSeats(seats);
  // -> SeatInventory: Lock seats for 10 minutes
  // -> Analytics: Track seat selection patterns
  
  // Payment pending (user on payment page)
  booking.initiatePayment();
  // -> SMS: "Complete payment in 10 minutes"
  // -> Analytics: Track funnel drop-off
  
  // Payment successful
  booking.confirm();
  
  // All observers notified:
  // 1. EmailNotificationService:
  //    Subject: "Booking Confirmed - Avatar 2"
  //    Body: Show details, seat numbers
  //    Attachments: E-tickets with QR codes
  
  // 2. SMSNotificationService:
  //    "Tickets for Avatar 2 confirmed!
  //     Show: Dec 25, 7PM, Screen 3
  //     Seats: A15, A16
  //     Check email for tickets"
  
  // 3. SeatInventoryService:
  //    Mark seats as BOOKED (permanent)
  //    Remove temporary holds
  
  // 4. AnalyticsService:
  //    Track conversion
  //    Revenue: $30 (2 tickets * $15)
  //    Show popularity metrics
  
  // 5. QRCodeGenerator:
  //    Generate unique QR for each ticket
  //    Store mapping: ticketId -> QR code
  
  // Easy to extend
  booking.addObserver(new LoyaltyPointsService());
  booking.addObserver(new RecommendationEngine());
end note

@enduml
```

## Code Snippets

### Initialize Screen with Seats

:::note
Dynamically creates seats based on row position. Front rows are REGULAR, middle rows are PREMIUM, back rows are VIP.
:::

```java title="Screen.java" {2,4-5,11-21,23-27,32}
public class Screen {
    public void initializeSeats(int rows, int seatsPerRow) {
        char rowLabel = 'A';
        
        for (int i = 0; i < rows; i++) {
            for (int j = 1; j <= seatsPerRow; j++) {
                String seatNumber = rowLabel + String.valueOf(j);
                SeatType type;
                
                // Premium seats in middle rows
                if (i >= rows/3 && i < 2*rows/3) {
                    type = SeatType.PREMIUM;
                } 
                // VIP seats in back rows
                else if (i >= 2*rows/3) {
                    type = SeatType.VIP;
                } 
                // Regular seats in front
                else {
                    type = SeatType.REGULAR;
                }
                
                Seat seat = new Seat(UUID.randomUUID().toString(), seatNumber);
                seat.setRow(String.valueOf(rowLabel));
                seat.setColumn(j);
                seat.setType(type);
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setScreen(this);
                
                seats.add(seat);
            }
            rowLabel++;
        }
        
        this.totalSeats = seats.size();
    }
}
```

### Create Booking with Seat Locking

:::note
Implements temporary seat locking with 10-minute expiry. Uses `synchronized` to prevent race conditions. Includes automatic rollback on failure.
:::

```java title="BookingService.java" {4,7-9,13-17,26-28,31-33,37-38,42,46,49-56}
public class BookingService {
    private static final int SEAT_HOLD_DURATION_MINUTES = 10;
    
    public synchronized Booking createBooking(User user, Show show, List<Seat> seats) 
            throws BookingException {
        // Validate show
        if (show.getStatus() != ShowStatus.SCHEDULED) {
            throw new BookingException("Show is not available for booking");
        }
        
        // Check seat availability
        for (Seat seat : seats) {
            if (!seat.isAvailable()) {
                throw new BookingException("Seat " + seat.getSeatNumber() + 
                                         " is not available");
            }
        }
        
        // Create booking
        Booking booking = new Booking(user, show);
        booking.setStatus(BookingStatus.PENDING);
        booking.setBookingTime(DateTime.now());
        booking.setExpiryTime(DateTime.now().plusMinutes(SEAT_HOLD_DURATION_MINUTES));
        
        // Lock seats
        if (!lockSeats(seats, booking)) {
            throw new BookingException("Failed to lock seats");
        }
        
        // Add seats to booking
        for (Seat seat : seats) {
            booking.addSeat(seat);
        }
        
        // Calculate total
        double total = calculateBookingAmount(show, seats);
        booking.setTotalAmount(total);
        
        // Save booking
        bookings.put(booking.getBookingId(), booking);
        
        return booking;
    }
    
    private boolean lockSeats(List<Seat> seats, Booking booking) {
        DateTime expiryTime = DateTime.now().plusMinutes(SEAT_HOLD_DURATION_MINUTES);
        
        for (Seat seat : seats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                // Rollback previous locks
                rollbackSeatLocks(booking);
                return false;
            }
            
            // Create lock
            SeatLock lock = new SeatLock(seat, booking);
            lock.setExpiryTime(expiryTime);
            seatLocks.put(seat.getSeatId(), lock);
            
            // Update seat status
            seat.setStatus(SeatStatus.TEMPORARILY_HELD);
        }
        
        return true;
    }
    
    private double calculateBookingAmount(Show show, List<Seat> seats) {
        double total = 0;
        for (Seat seat : seats) {
            total += pricingStrategy.calculatePrice(show, seat.getType());
        }
        return total;
    }
}
```

### Confirm Booking and Generate Tickets

```java
public class BookingService {
    public synchronized List<Ticket> confirmBooking(String bookingId, Payment payment) 
            throws BookingException {
        Booking booking = bookings.get(bookingId);
        
        if (booking == null) {
            throw new BookingException("Booking not found");
        }
        
        if (booking.isExpired()) {
            releaseSeats(booking);
            throw new BookingException("Booking has expired");
        }
        
        // Process payment
        if (!payment.process()) {
            throw new BookingException("Payment processing failed");
        }
        
        // Update booking status
        booking.setPayment(payment);
        booking.setStatus(BookingStatus.CONFIRMED);
        
        // Book seats permanently
        for (Seat seat : booking.getSeats()) {
            seat.setStatus(SeatStatus.BOOKED);
            // Remove lock
            seatLocks.remove(seat.getSeatId());
        }
        
        // Generate tickets
        List<Ticket> tickets = new ArrayList<>();
        for (Seat seat : booking.getSeats()) {
            Ticket ticket = new Ticket(booking, seat);
            double price = pricingStrategy.calculatePrice(
                booking.getShow(), seat.getType());
            ticket.setPrice(price);
            ticket.setQrCode(ticket.generateQRCode());
            tickets.add(ticket);
        }
        
        // Send confirmation
        notificationService.sendBookingConfirmation(booking, tickets);
        
        return tickets;
    }
}
```

### Cancel Booking

```java
public class BookingService {
    public synchronized boolean cancelBooking(String bookingId) throws BookingException {
        Booking booking = bookings.get(bookingId);
        
        if (booking == null) {
            throw new BookingException("Booking not found");
        }
        
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BookingException("Only confirmed bookings can be cancelled");
        }
        
        // Check cancellation policy (e.g., 2 hours before show)
        DateTime showTime = booking.getShow().getStartTime();
        if (DateTime.now().plusHours(2).isAfter(showTime)) {
            throw new BookingException("Cancellation not allowed within 2 hours of show");
        }
        
        // Process refund
        if (booking.getPayment() != null) {
            booking.getPayment().refund();
        }
        
        // Release seats
        for (Seat seat : booking.getSeats()) {
            seat.setStatus(SeatStatus.AVAILABLE);
        }
        
        // Update booking status
        booking.setStatus(BookingStatus.CANCELLED);
        
        // Send notification
        notificationService.sendCancellationNotification(booking);
        
        return true;
    }
    
    private void releaseSeats(Booking booking) {
        for (Seat seat : booking.getSeats()) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seatLocks.remove(seat.getSeatId());
        }
    }
}
```

### Release Expired Seat Locks (Background Task)

```java
public class BookingService {
    public void releaseExpiredLocks() {
        DateTime now = DateTime.now();
        List<String> expiredLocks = new ArrayList<>();
        
        synchronized(this) {
            for (Map.Entry<String, SeatLock> entry : seatLocks.entrySet()) {
                SeatLock lock = entry.getValue();
                
                if (lock.isExpired()) {
                    // Release seat
                    lock.getSeat().setStatus(SeatStatus.AVAILABLE);
                    expiredLocks.add(entry.getKey());
                    
                    // Update booking status
                    Booking booking = lock.getBooking();
                    if (booking.getStatus() == BookingStatus.PENDING) {
                        booking.setStatus(BookingStatus.EXPIRED);
                    }
                }
            }
            
            // Remove expired locks
            for (String lockId : expiredLocks) {
                seatLocks.remove(lockId);
            }
        }
    }
    
    // This should be called periodically (e.g., every minute)
    public void startLockCleanupTask() {
        ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor();
        executor.scheduleAtFixedRate(
            this::releaseExpiredLocks, 
            0, 
            1, 
            TimeUnit.MINUTES
        );
    }
}
```

### Search Movies and Shows

```java
public class BookingService {
    public List<Movie> searchMovies(SearchCriteria criteria) {
        return movies.values().stream()
            .filter(movie -> {
                if (criteria.getMovieName() != null && 
                    !movie.getTitle().toLowerCase()
                        .contains(criteria.getMovieName().toLowerCase())) {
                    return false;
                }
                if (criteria.getGenre() != null && 
                    !movie.getGenre().equalsIgnoreCase(criteria.getGenre())) {
                    return false;
                }
                if (criteria.getLanguage() != null && 
                    !movie.getLanguage().equalsIgnoreCase(criteria.getLanguage())) {
                    return false;
                }
                return true;
            })
            .collect(Collectors.toList());
    }
    
    public List<Show> getShows(String movieId, String city, Date date) {
        return shows.values().stream()
            .filter(show -> show.getMovie().getMovieId().equals(movieId))
            .filter(show -> show.getScreen().getTheater()
                .getAddress().getCity().equalsIgnoreCase(city))
            .filter(show -> isSameDate(show.getStartTime().toDate(), date))
            .filter(show -> show.getStatus() == ShowStatus.SCHEDULED)
            .sorted(Comparator.comparing(Show::getStartTime))
            .collect(Collectors.toList());
    }
    
    private boolean isSameDate(Date date1, Date date2) {
        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal1.setTime(date1);
        cal2.setTime(date2);
        
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
               cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH) &&
               cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }
}
```

### Pricing Strategy

```java
public class WeekendPricing implements PricingStrategy {
    private static final double WEEKEND_MULTIPLIER = 1.3; // 30% more
    private static final Map<SeatType, Double> SEAT_MULTIPLIERS = Map.of(
        SeatType.REGULAR, 1.0,
        SeatType.PREMIUM, 1.5,
        SeatType.VIP, 2.0
    );
    
    @Override
    public double calculatePrice(Show show, SeatType seatType) {
        double basePrice = show.getBasePrice();
        double seatMultiplier = SEAT_MULTIPLIERS.get(seatType);
        
        // Check if weekend
        Calendar cal = Calendar.getInstance();
        cal.setTime(show.getStartTime().toDate());
        int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
        
        double price = basePrice * seatMultiplier;
        
        if (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY) {
            price *= WEEKEND_MULTIPLIER;
        }
        
        return price;
    }
}
```

## Extension Points

1. Add food and beverage ordering
2. Implement seat recommendations based on preferences
3. Add loyalty programs and discounts
4. Support group bookings with special pricing
5. Implement waitlist for sold-out shows
6. Add movie trailers and reviews integration
7. Support multiple languages for interface
8. Implement dynamic pricing based on demand
9. Add theater facility information (parking, accessibility)
10. Support gift cards and vouchers
