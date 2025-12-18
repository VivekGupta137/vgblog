---
title: Library Management System
description: Low-Level Design for a Library Management System
---

## Problem Statement

Design a library management system that handles book inventory, member management, book borrowing and returning, reservations, and fine calculations. The system should track book copies, manage due dates, and handle multiple branches.

## Requirements

### Functional Requirements
1. Add, update, and remove books from the catalog
2. Register and manage library members
3. Issue books to members
4. Return books and calculate fines
5. Reserve books that are currently borrowed
6. Search books by title, author, ISBN, or category
7. Track book copies across multiple branches
8. Generate reports on popular books and overdue items
9. Support different member types with different borrowing limits
10. Send notifications for due dates and reservations

### Non-Functional Requirements
1. Handle concurrent book checkouts
2. Accurate fine calculations
3. Scalable for large book collections
4. Fast search operations
5. Data consistency for inventory

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Library Service" {
    [LibraryService] as Service
}

package "Catalog" {
    interface "ICatalogSearch" as CatalogIntf
    interface "IBook" as Book
    interface "IBookItem" as BookItem
}

package "Members" {
    interface "IMember" as Member
    interface "IMembershipPolicy" as Policy
}

package "Transactions" {
    interface "ILoan" as Loan
    interface "IReservation" as Reservation
}

package "Support Services" {
    interface "IFineCalculator" as FineCalc
    interface "INotificationService" as Notification
}

[LibraryDriver] --> Service : uses
Service *-- CatalogIntf : composed of
Service *-- FineCalc : composed of
Service *-- Notification : composed of
Service o-- Member : manages
Service o-- Loan : manages
Service o-- Reservation : manages
CatalogIntf o-- Book : manages
CatalogIntf o-- BookItem : manages
Member *-- Policy : composed of
Loan o-- BookItem
Loan o-- Member
Reservation o-- Book
Reservation o-- Member

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum BookStatus {
    AVAILABLE
    BORROWED
    RESERVED
    LOST
    MAINTENANCE
}

enum ReservationStatus {
    PENDING
    FULFILLED
    CANCELLED
    EXPIRED
}

class Address {
    - street: String
    - city: String
    - state: String
    - zipCode: String
    + Address(street: String, city: String)
}

interface IBook {
    + getISBN(): String
    + getTitle(): String
    + getAuthors(): List<String>
}

class Book {
    - ISBN: String
    - title: String
    - authors: List<String>
    - publisher: String
    - publicationDate: Date
    - category: String
    + Book(ISBN: String, title: String)
    + getISBN(): String
    + getTitle(): String
}

interface IBookItem {
    + getBarcode(): String
    + getBook(): IBook
    + getStatus(): BookStatus
    + isAvailable(): boolean
}

class BookItem {
    - barcode: String
    - book: IBook
    - status: BookStatus
    - rackLocation: String
    + BookItem(barcode: String, book: IBook)
    + isAvailable(): boolean
    + updateStatus(status: BookStatus): void
}

interface IMember {
    + getMemberId(): String
    + getName(): String
    + getMaxBooksAllowed(): int
    + canBorrowMore(currentLoans: int): boolean
}

interface IMembershipPolicy {
    + getMaxBooksAllowed(): int
    + getLoanPeriodDays(): int
}

class StudentMembershipPolicy {
    + getMaxBooksAllowed(): int
    + getLoanPeriodDays(): int
}

class FacultyMembershipPolicy {
    + getMaxBooksAllowed(): int
    + getLoanPeriodDays(): int
}

class Member {
    - memberId: String
    - name: String
    - email: String
    - phone: String
    - address: Address
    - membershipPolicy: IMembershipPolicy
    + Member(memberId: String, name: String, policy: IMembershipPolicy)
    + getMemberId(): String
    + getMaxBooksAllowed(): int
    + canBorrowMore(currentLoans: int): boolean
}

interface ILoan {
    + getLoanId(): String
    + getBookItem(): IBookItem
    + getMember(): IMember
    + isOverdue(): boolean
}

class Loan {
    - loanId: String
    - bookItem: IBookItem
    - member: IMember
    - issueDate: Date
    - dueDate: Date
    - returnDate: Date
    - fineAmount: double
    + Loan(bookItem: IBookItem, member: IMember, dueDate: Date)
    + isOverdue(): boolean
    + setReturnDate(date: Date): void
}

interface IReservation {
    + getReservationId(): String
    + getBook(): IBook
    + getMember(): IMember
    + getStatus(): ReservationStatus
}

class Reservation {
    - reservationId: String
    - book: IBook
    - member: IMember
    - reservationDate: Date
    - status: ReservationStatus
    + Reservation(book: IBook, member: IMember)
    + cancel(): void
    + getStatus(): ReservationStatus
}

interface IFineCalculator {
    + calculateFine(loan: ILoan): double
}

class StandardFineCalculator {
    - dailyFineRate: double
    - maxFineAmount: double
    + StandardFineCalculator(dailyRate: double, maxFine: double)
    + calculateFine(loan: ILoan): double
}

interface IFinePaymentProcessor {
    + processFinePayment(memberId: String, amount: double): boolean
}

class Fine {
    - fineId: String
    - loan: ILoan
    - amount: double
    - isPaid: boolean
    - paymentProcessor: IFinePaymentProcessor
    + Fine(loan: ILoan, amount: double, processor: IFinePaymentProcessor)
    + pay(): boolean
}

interface ICatalogSearch {
    + searchByTitle(title: String): List<IBook>
    + searchByAuthor(author: String): List<IBook>
    + searchByISBN(ISBN: String): IBook
    + searchByCategory(category: String): List<IBook>
}

class Catalog {
    - books: Map<String, IBook>
    - bookItems: Map<String, IBookItem>
    + Catalog()
    + addBook(book: IBook): void
    + addBookItem(item: IBookItem): void
    + searchByTitle(title: String): List<IBook>
    + searchByISBN(ISBN: String): IBook
}

interface ILibraryService {
    + registerMember(member: IMember): void
    + issueBook(barcode: String, memberId: String): ILoan
    + returnBook(barcode: String): Fine
    + reserveBook(ISBN: String, memberId: String): IReservation
}

class LibraryService {
    - catalog: ICatalogSearch
    - members: Map<String, IMember>
    - loans: Map<String, ILoan>
    - reservations: Map<String, IReservation>
    - fineCalculator: IFineCalculator
    - notificationService: INotificationService
    + LibraryService(catalog: ICatalogSearch, calculator: IFineCalculator, notification: INotificationService)
    + registerMember(member: IMember): void
    + issueBook(barcode: String, memberId: String): ILoan
    + returnBook(barcode: String): Fine
    + reserveBook(ISBN: String, memberId: String): IReservation
}

interface INotificationService {
    + sendDueReminder(loan: ILoan): void
    + sendOverdueNotice(loan: ILoan): void
    + sendReservationNotification(reservation: IReservation): void
}

class EmailNotificationService {
    + sendDueReminder(loan: ILoan): void
    + sendOverdueNotice(loan: ILoan): void
    + sendReservationNotification(reservation: IReservation): void
}

class LibraryDriver {
    + {static} main(args: String[]): void
    - setupLibrary(): ILibraryService
    - demonstrateBookIssue(): void
    - demonstrateBookReturn(): void
}

IBook <|.. Book
IBookItem <|.. BookItem
BookItem o-- IBook
BookItem *-- BookStatus

IMember <|.. Member
Member o-- Address
Member *-- IMembershipPolicy : composed of
IMembershipPolicy <|.. StudentMembershipPolicy
IMembershipPolicy <|.. FacultyMembershipPolicy

ILoan <|.. Loan
Loan o-- IBookItem
Loan o-- IMember

IReservation <|.. Reservation
Reservation o-- IBook
Reservation o-- IMember
Reservation *-- ReservationStatus

IFineCalculator <|.. StandardFineCalculator

Fine o-- ILoan
Fine o-- IFinePaymentProcessor : uses

ICatalogSearch <|.. Catalog
Catalog o-- IBook : manages
Catalog o-- IBookItem : manages

ILibraryService <|.. LibraryService
LibraryService *-- ICatalogSearch : composed of
LibraryService o-- IMember : manages
LibraryService o-- ILoan : manages
LibraryService o-- IReservation : manages
LibraryService *-- IFineCalculator : composed of
LibraryService *-- INotificationService : composed of

INotificationService <|.. EmailNotificationService

LibraryDriver ..> ILibraryService : uses
LibraryDriver ..> IMember : creates
LibraryDriver ..> IBook : creates

@enduml
```

## Key Design Patterns

1. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: LibrarySystem as central management point
2. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Create different member types
3. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different fine calculation strategies
4. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Notifications for due dates
5. **Repository Pattern**: Catalog for book management

### Design Pattern Diagrams

#### 1. Strategy Pattern - Membership Policies (Composition over Inheritance)

```plantuml
@startuml

title Strategy Pattern - Membership Policies

interface IMembershipPolicy {
  + getMaxBooksAllowed(): int
  + getMaxBorrowDays(): int
  + canReserveBook(): boolean
  + getFinePerDay(): double
}

class StudentMembershipPolicy {
  - maxBooks: int = 3
  - maxDays: int = 14
  - finePerDay: double = 1.0
  + getMaxBooksAllowed(): int
  + getMaxBorrowDays(): int
  + canReserveBook(): boolean
}

class FacultyMembershipPolicy {
  - maxBooks: int = 10
  - maxDays: int = 60
  - finePerDay: double = 2.0
  + getMaxBooksAllowed(): int
  + getMaxBorrowDays(): int
  + canReserveBook(): boolean
}

class GuestMembershipPolicy {
  - maxBooks: int = 2
  - maxDays: int = 7
  - finePerDay: double = 1.5
  + getMaxBooksAllowed(): int
  + canReserveBook(): boolean
}

class Member {
  - memberId: String
  - membershipPolicy: IMembershipPolicy
  + Member(id, IMembershipPolicy)
  + canBorrowBook(): boolean
  + borrowBook(book): ILoan
  + getFineAmount(): double
}

IMembershipPolicy <|.. StudentMembershipPolicy
IMembershipPolicy <|.. FacultyMembershipPolicy
IMembershipPolicy <|.. GuestMembershipPolicy
Member *-- IMembershipPolicy

note bottom of Member
  **Code Example:**
  
  // Create members with different policies (composition)
  IMember student = new Member(
    "S001",
    new StudentMembershipPolicy()
  );
  
  IMember faculty = new Member(
    "F001",
    new FacultyMembershipPolicy()
  );
  
  // Policies control behavior
  student.canBorrowBook();  // true if < 3 books
  faculty.canBorrowBook();  // true if < 10 books
  
  // Calculate fines based on policy
  double studentFine = student.getFineAmount();
  // $1.0 per day * overdue days
  
  double facultyFine = faculty.getFineAmount();
  // $2.0 per day * overdue days
  
  // Upgrade membership without changing Member class
  student.setMembershipPolicy(new FacultyMembershipPolicy());
end note

@enduml
```

#### 2. Observer Pattern - Due Date Notifications

```plantuml
@startuml

title Observer Pattern - Loan Due Date Notifications

interface ILoanObserver {
  + onLoanCreated(loan): void
  + onLoanDueSoon(loan, daysRemaining): void
  + onLoanOverdue(loan, daysOverdue): void
  + onLoanReturned(loan): void
}

class Loan {
  - observers: List<ILoanObserver>
  - dueDate: Date
  - isReturned: boolean
  + addObserver(ILoanObserver): void
  + checkDueDate(): void
  + returnBook(): void
  - notifyObservers(event): void
}

class EmailNotificationService {
  + onLoanDueSoon(loan, daysRemaining): void
  + onLoanOverdue(loan, daysOverdue): void
  - sendEmail(member, subject, body): void
}

class SMSNotificationService {
  + onLoanDueSoon(loan, daysRemaining): void
  + onLoanOverdue(loan, daysOverdue): void
  - sendSMS(phoneNumber, message): void
}

class FineCalculationService {
  + onLoanOverdue(loan, daysOverdue): void
  + onLoanReturned(loan): void
  - calculateFine(loan): double
  - applyFine(member, amount): void
}

class LibraryAnalytics {
  + onLoanCreated(loan): void
  + onLoanReturned(loan): void
  - trackLoanMetrics(loan): void
}

Loan o-- "*" ILoanObserver
ILoanObserver <|.. EmailNotificationService
ILoanObserver <|.. SMSNotificationService
ILoanObserver <|.. FineCalculationService
ILoanObserver <|.. LibraryAnalytics

note bottom of Loan
  **Code Example:**
  
  Loan loan = new Loan(member, book, dueDate);
  
  // Register observers
  loan.addObserver(new EmailNotificationService());
  loan.addObserver(new SMSNotificationService());
  loan.addObserver(new FineCalculationService());
  loan.addObserver(new LibraryAnalytics());
  
  // Scheduled job checks due dates daily
  scheduler.schedule(() -> {
      for (Loan activeLoan : activeLoans) {
          activeLoan.checkDueDate();
      }
  }, everyDay);
  
  // When due date approaches (3 days before):
  // - Email: "Your book 'Java Programming' is due in 3 days"
  // - SMS: "Book due soon. Return by Dec 21"
  
  // When overdue:
  // - Email/SMS: Overdue notice
  // - FineCalculation: Apply $1/day fine
  // - Analytics: Track overdue rate
end note

@enduml
```

#### 3. Repository Pattern - Catalog Management

```plantuml
@startuml

title Repository Pattern - Book Catalog

interface ICatalogRepository {
  + findBookById(bookId): IBook
  + findBooksByTitle(title): List<IBook>
  + findBooksByAuthor(author): List<IBook>
  + findBooksByISBN(isbn): List<IBook>
  + getAllBooks(): List<IBook>
  + addBook(book): void
  + updateBook(book): void
  + deleteBook(bookId): void
}

class Catalog {
  - books: Map<String, IBook>
  - bookItems: Map<String, IBookItem>
  - titleIndex: Map<String, List<IBook>>
  - authorIndex: Map<String, List<IBook>>
  + findBookById(bookId): IBook
  + findBooksByTitle(title): List<IBook>
  + searchBooks(criteria): List<IBook>
  - rebuildIndexes(): void
}

class LibraryService {
  - catalog: ICatalogRepository
  + searchBooks(keyword): List<IBook>
  + checkoutBook(member, bookId): ILoan
  + returnBook(loanId): void
}

interface IBook {
  + getBookId(): String
  + getTitle(): String
  + getAuthor(): String
}

ICatalogRepository <|.. Catalog
LibraryService o-- ICatalogRepository
Catalog o-- "*" IBook

note right of Catalog
  Repository Pattern provides:
  - Abstraction over data access
  - Centralized query logic
  - Caching and indexing
  - Easy to swap implementations
end note

note bottom of LibraryService
  **Code Example:**
  
  // Service depends on interface, not implementation
  ICatalogRepository catalog = new Catalog();
  LibraryService service = new LibraryService(catalog);
  
  // Search operations
  List<IBook> books = catalog.findBooksByTitle("Java");
  List<IBook> authorBooks = catalog.findBooksByAuthor("Bloch");
  IBook book = catalog.findBookById("B001");
  
  // Easy to switch implementations:
  // - InMemoryCatalog (fast, dev/testing)
  // - DatabaseCatalog (persistent, production)
  // - CachedCatalog (decorator with caching)
  
  ICatalogRepository dbCatalog = new DatabaseCatalog(connection);
  LibraryService prodService = new LibraryService(dbCatalog);
  
  // Same interface, different storage
  ICatalogRepository cachedCatalog = new CachedCatalog(
    new DatabaseCatalog(connection)
  );
end note

@enduml
```

## Code Snippets

### Issue Book

:::note
The `synchronized` block prevents race conditions. The method validates member eligibility, checks fines, creates a loan, and updates book status atomically.
:::

```java title="LibrarySystem.java" {4,6-8,15-17,26,31,37}
public class LibrarySystem {
    public Loan issueBook(BookItem bookItem, Member member) throws LibraryException {
        synchronized(this) {
            // Validate member can borrow
            if (!member.canBorrowMore()) {
                throw new LibraryException("Member has reached borrowing limit");
            }
            
            // Check for outstanding fines
            if (hasOutstandingFines(member)) {
                throw new LibraryException("Member has outstanding fines");
            }
            
            // Check book availability
            if (!bookItem.isAvailable()) {
                throw new LibraryException("Book is not available");
            }
            
            // Create loan
            Loan loan = new Loan(bookItem, member);
            
            // Calculate due date based on member type
            int loanPeriod = getLoanPeriod(member.getMemberType());
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, loanPeriod);
            loan.setDueDate(cal.getTime());
            
            // Update book status
            bookItem.updateStatus(BookStatus.BORROWED);
            
            // Save loan
            loans.put(loan.getLoanId(), loan);
            
            // Check and fulfill reservations
            fulfillPendingReservations(bookItem.getBook());
            
            return loan;
        }
    }
    
    private int getLoanPeriod(MemberType type) {
        switch(type) {
            case STUDENT: return 14;
            case FACULTY: return 30;
            case PREMIUM: return 21;
            default: return 14;
        }
    }
}
```

### Return Book and Calculate Fine

:::note
Handles book return, calculates overdue fines if applicable, updates book status, and automatically fulfills pending reservations.
:::

```java title="LibrarySystem.java" {4,6-9,14-18,24,27}
public class LibrarySystem {
    public Fine returnBook(String barcode) throws LibraryException {
        synchronized(this) {
            // Find loan
            Loan loan = findLoanByBarcode(barcode);
            if (loan == null) {
                throw new LibraryException("No active loan found for barcode: " + barcode);
            }
            
            // Set return date
            loan.setReturnDate(new Date());
            
            // Calculate fine if overdue
            Fine fine = null;
            if (loan.isOverdue()) {
                double fineAmount = fineCalculator.calculateFine(loan);
                fine = new Fine(loan, fineAmount);
                loan.setFine(fineAmount);
            }
            
            // Update book status
            loan.getBookItem().updateStatus(BookStatus.AVAILABLE);
            
            // Check for reservations
            fulfillReservation(loan.getBookItem());
            
            return fine;
        }
    }
    
    private void fulfillReservation(BookItem bookItem) {
        for (Reservation reservation : reservations) {
            if (reservation.getBook().equals(bookItem.getBook()) 
                && reservation.getStatus() == ReservationStatus.PENDING) {
                // Notify member
                notificationService.sendReservationNotification(reservation);
                reservation.setStatus(ReservationStatus.FULFILLED);
                bookItem.updateStatus(BookStatus.RESERVED);
                break;
            }
        }
    }
}
```

### Fine Calculator

```java
public class StandardFineCalculator implements FineCalculator {
    private static final double DAILY_FINE_RATE = 1.0;
    private static final double MAX_FINE = 50.0;
    
    @Override
    public double calculateFine(Loan loan) {
        if (!loan.isOverdue()) {
            return 0.0;
        }
        
        Date returnDate = loan.getReturnDate() != null 
            ? loan.getReturnDate() 
            : new Date();
        
        long overdueDays = calculateOverdueDays(loan.getDueDate(), returnDate);
        double fine = overdueDays * DAILY_FINE_RATE;
        
        // Cap at maximum fine
        return Math.min(fine, MAX_FINE);
    }
    
    private long calculateOverdueDays(Date dueDate, Date returnDate) {
        long diffMillis = returnDate.getTime() - dueDate.getTime();
        return Math.max(0, diffMillis / (1000 * 60 * 60 * 24));
    }
}
```

### Search Books

```java
public class Catalog {
    public List<Book> searchByTitle(String title) {
        return books.values().stream()
            .filter(book -> book.getTitle().toLowerCase()
                .contains(title.toLowerCase()))
            .collect(Collectors.toList());
    }
    
    public List<Book> searchByAuthor(String author) {
        return books.values().stream()
            .filter(book -> book.getAuthors().stream()
                .anyMatch(a -> a.toLowerCase().contains(author.toLowerCase())))
            .collect(Collectors.toList());
    }
    
    public Book searchByISBN(String ISBN) {
        return books.get(ISBN);
    }
}
```

### Reserve Book

```java
public class LibrarySystem {
    public Reservation reserveBook(Book book, Member member) throws LibraryException {
        // Check if book has available copies
        long availableCopies = catalog.getBookItems().stream()
            .filter(item -> item.getBook().equals(book))
            .filter(BookItem::isAvailable)
            .count();
        
        if (availableCopies > 0) {
            throw new LibraryException("Book is available, reservation not needed");
        }
        
        // Check if member already has reservation
        boolean hasReservation = reservations.stream()
            .anyMatch(r -> r.getMember().equals(member) 
                && r.getBook().equals(book)
                && r.getStatus() == ReservationStatus.PENDING);
        
        if (hasReservation) {
            throw new LibraryException("Member already has a reservation for this book");
        }
        
        Reservation reservation = new Reservation(book, member);
        reservations.add(reservation);
        
        return reservation;
    }
}
```

## Extension Points

1. Add digital book lending (e-books)
2. Implement inter-branch book transfers
3. Add book recommendation system
4. Support different loan periods for different book types
5. Implement waiting list when multiple reservations exist
6. Add barcode/RFID scanning integration
7. Support bulk operations for librarians
8. Add analytics and reporting dashboard
9. Implement late fee payment integration
10. Support book renewal with limits
