---
title: Online Ticket Booking System
description: Low level design for an Online Ticket Booking System (e.g., Movie Tickets)
---

## Problem Statement

Design an online movie ticket booking system where users can view movie listings, select shows, choose seats, and book tickets.

## Requirements

- Users can browse movies currently showing.
- Users can view showtimes for a selected movie at various cinemas.
- Users can select a specific showtime and view the seating layout.
- Users can select available seats.
- The system should prevent multiple users from booking the same seat simultaneously.
- Users can make payments for their selected tickets.
- Users should receive a booking confirmation and an e-ticket.
- The system should manage cinema halls, movies, and show schedules.

## Class Diagram

```plantuml
@startuml
class Cinema {
  - id: String
  - name: String
  - address: String
  - halls: List<Hall>
  + addHall(hall: Hall): void
}

class Hall {
  - id: String
  - name: String
  - totalSeats: int
  - seats: List<Seat>
  + addSeat(seat: Seat): void
}

class Seat {
  - id: String
  - seatNumber: String
  - seatType: SeatType
}

enum SeatType {
  STANDARD
  PREMIUM
  VIP
}

class Movie {
  - id: String
  - title: String
  - description: String
  - duration: int // minutes
  - language: String
  - genre: String
}

class Show {
  - id: String
  - movie: Movie
  - hall: Hall
  - startTime: Date
  - endTime: Date
  - availableSeats: Set<Seat>
  - bookedSeats: Map<Seat, Booking>
  + getAvailableSeats(): List<Seat>
  + bookSeat(seat: Seat, booking: Booking): boolean
}

class Booking {
  - id: String
  - user: User
  - show: Show
  - seats: List<Seat>
  - bookingTime: Date
  - amount: double
  - status: BookingStatus
  + makePayment(payment: Payment): boolean
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

class User {
  - id: String
  - username: String
  - email: String
}

class Payment {
  - id: String
  - booking: Booking
  - amount: double
  - paymentTime: Date
  - paymentMethod: PaymentMethod
  - status: PaymentStatus
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  UPI
}

enum PaymentStatus {
  SUCCESS
  FAILED
  REFUNDED
}

Cinema "1" *-- "many" Hall
Hall "1" *-- "many" Seat
Show "1" *-- "1" Movie
Show "1" *-- "1" Hall
Show "1" *-- "many" Seat : contains
Booking "1" *-- "1" User
Booking "1" *-- "1" Show
Booking "1" *-- "many" Seat : contains
Booking "1" *-- "1" Payment
Seat ..> SeatType
Booking ..> BookingStatus
Payment ..> PaymentMethod
Payment ..> PaymentStatus
@enduml
```

## Code Snippets

### Show

Manages seat availability and booking for a specific showtime.

```java
public class Show {
    private String id;
    private Movie movie;
    private Hall hall;
    private Date startTime;
    private Date endTime;
    private Set<Seat> availableSeats; // All initially available seats
    private Map<Seat, Booking> bookedSeats; // Seats currently booked or held

    public synchronized boolean bookSeat(Seat seat, Booking booking) {
        if (!availableSeats.contains(seat)) {
            System.out.println("Seat " + seat.getSeatNumber() + " is not available.");
            return false;
        }
        if (bookedSeats.containsKey(seat)) {
            // This seat is already held or booked by another transaction
            System.out.println("Seat " + seat.getSeatNumber() + " is already taken.");
            return false;
        }
        // Temporarily hold the seat (e.g., for 5-10 minutes)
        bookedSeats.put(seat, booking);
        availableSeats.remove(seat); // Or mark as 'held' for a payment window
        System.out.println("Seat " + seat.getSeatNumber() + " held for booking " + booking.getId());
        return true;
    }

    public synchronized void releaseSeat(Seat seat) {
        if (bookedSeats.containsKey(seat)) {
            bookedSeats.remove(seat);
            availableSeats.add(seat);
            System.out.println("Seat " + seat.getSeatNumber() + " released.");
        }
    }
}
```

### Booking

Represents a user's ticket booking.

```java
public class Booking {
    private String id;
    private User user;
    private Show show;
    private List<Seat> seats;
    private Date bookingTime;
    private double amount;
    private BookingStatus status;

    public boolean makePayment(Payment payment) {
        // Integrate with a payment gateway
        // For simplicity, assume payment is always successful
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            this.status = BookingStatus.CONFIRMED;
            System.out.println("Booking " + this.id + " confirmed.");
            return true;
        } else {
            // Handle failed payment: release seats, notify user
            for (Seat seat : seats) {
                show.releaseSeat(seat);
            }
            this.status = BookingStatus.CANCELLED;
            System.out.println("Booking " + this.id + " cancelled due to payment failure.");
            return false;
        }
    }
}
```
