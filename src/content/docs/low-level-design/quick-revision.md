---
title: LLD Quick Revision Guide
description: One-page revision sheet for low-level design interviews covering the interview framework, OOP, SOLID, UML relationships, GoF design patterns, concurrency and a problem-to-pattern map.
---

Use this page the night before an interview. Each section is a summary with a link to the full page.

:::tip[How to use]
Skim the tables first, then open the linked deep dives only for the topics you feel unsure about.
:::

## 1. Interview framework (45 minutes)

:::::group-container

::::group-item[Steps]{active}

| Step | Time | What to do |
|------|------|------------|
| 1. Clarify | 5 min | Ask for functional requirements, scale, actors, constraints; fix the scope out loud. |
| 2. Entities | 5 min | List nouns → classes/enums; verbs → methods. |
| 3. Relationships | 5 min | Draw the class diagram: association, aggregation, composition, inheritance. |
| 4. APIs | 5 min | Define the public interfaces/methods first, implementation later. |
| 5. Patterns | 5 min | Apply patterns only where a real variation exists (Strategy, State, Observer...). |
| 6. Code | 15 min | Write core classes and the main flow; keep it compilable. |
| 7. Extend | 5 min | Show how new requirements plug in (OCP), then discuss concurrency. |

::::

::::group-item[Checklist]

- Requirements confirmed and **scoped** (what is out of scope?).
- Enums for fixed sets (status, type, level).
- Interfaces for things that vary (payment, pricing, notification).
- Single responsibility per class; manager/service classes orchestrate.
- Thread safety on shared state (inventory, seats, slots, balances).
- Custom exceptions for domain errors (`InsufficientBalanceException`).
- Mention testing, extensibility and what you would improve.

::::

:::::

:::caution[Common mistakes]
- Jumping into code before clarifying requirements.
- Using inheritance where composition is cleaner.
- Forcing design patterns without a real need.
- Ignoring concurrency for resources that many users share.
:::

## 2. OOP in one table

| Pillar | Meaning | Java cue |
|--------|---------|----------|
| **Encapsulation** | Hide state, expose behaviour | `private` fields + getters/methods |
| **Abstraction** | Expose *what*, hide *how* | `interface`, `abstract class` |
| **Inheritance** | *is-a* reuse | `extends` |
| **Polymorphism** | Same call, different behaviour | overriding, interface references |

:::note[Abstract class vs interface]
- **Interface**: contract, multiple implementation, no state (default methods allowed).
- **Abstract class**: shared state + partial implementation, single inheritance.
- Prefer an interface to define a role; use an abstract class for a common base with shared fields.
:::

:::tip[Composition over inheritance]
Inheritance couples child to parent. Prefer holding a collaborator (`has-a`) and delegating, so behaviour can change at runtime (Strategy, Decorator).
:::

More: [Object-Oriented Analysis and Design](/low-level-design/object-oriented-analysis-design/).

## 3. SOLID

:::data-table{paging=false searchable=false sortable=false}

| Principle | One-liner | Violation smell | Fix |
|-----------|-----------|-----------------|-----|
| **S**ingle Responsibility | A class has one reason to change | `Invoice` that calculates, prints and saves | Split into `InvoiceCalculator`, `InvoicePrinter`, `InvoiceRepository` |
| **O**pen/Closed | Open for extension, closed for modification | `if/else` or `switch` on type | Interface + new implementation (Strategy/Factory) |
| **L**iskov Substitution | Subtypes must be usable as their base type | Subclass throws `UnsupportedOperationException` | Better hierarchy, split interfaces |
| **I**nterface Segregation | Many small interfaces beat one fat one | Implementers leave methods empty | Split `Worker` into `Workable`, `Eatable` |
| **D**ependency Inversion | Depend on abstractions, not concretions | `new MySqlRepo()` inside a service | Inject an interface via constructor |

:::

```java title="OCP + DIP together" showLineNumbers mark={1,8-10}
interface PaymentMethod { void pay(double amount); }

class CardPayment implements PaymentMethod { public void pay(double a) { /* ... */ } }
class UpiPayment  implements PaymentMethod { public void pay(double a) { /* ... */ } }

class Checkout {
    private final PaymentMethod method;          // depends on abstraction
    Checkout(PaymentMethod method) { this.method = method; }   // injected
    void complete(double amount) { method.pay(amount); }
}
```

:::tip[Memory aid]
If you see a `switch` over a type → think **OCP**. If you see `new` of a concrete service inside a class → think **DIP**. If a subclass overrides to throw → **LSP**.
:::

More: [S.O.L.I.D. Principles](/low-level-design/solid-principles/).

## 4. UML class relationships

:::data-table{paging=false searchable=false sortable=false}

| Relationship | Meaning | Lifetime | Arrow | Java cue |
|--------------|---------|----------|-------|----------|
| **Dependency** | *uses* temporarily | none | dashed → | parameter / local variable |
| **Association** | *knows* | independent | solid line | field reference |
| **Aggregation** | *has-a* (weak) | part can outlive whole | hollow ◇ | field set from outside |
| **Composition** | *owns* (strong) | part dies with whole | filled ◆ | `new` inside constructor |
| **Inheritance** | *is-a* | n/a | hollow ▷ solid | `extends` |
| **Realization** | implements interface | n/a | hollow ▷ dashed | `implements` |

:::

:::note[Strength order]
Dependency < Association < Aggregation < Composition < Inheritance. Use the weakest relationship that models reality.
:::

:::tip[Multiplicity]
`1`, `0..1`, `*` (many), `1..*`. Example: `Order 1 ── * OrderItem` (composition), `Customer 1 ── * Order` (association).
:::

## 5. Design patterns cheat sheet

:::caution
Do not name-drop patterns. State the *variation* first ("payment type changes"), then the pattern ("so I use Strategy").
:::

### Creational

:::data-table{paging=false searchable=false sortable=false}

| Pattern | Intent | Use when | LLD example |
|---------|--------|----------|-------------|
| **Singleton** | One instance, global access | shared config, logger, cache manager | Logger, `ParkingLot` |
| **Factory Method / Simple Factory** | Create objects without exposing the class | type chosen at runtime | Vehicle, Notification, Shape |
| **Abstract Factory** | Families of related objects | UI theme, cross-platform widgets | GUI kits |
| **Builder** | Step-by-step construction | many optional fields | `Pizza`, `HttpRequest` |
| **Prototype** | Clone existing object | creation is costly | game objects |

:::

```java title="Thread-safe Singleton (enum)" showLineNumbers
public enum Config {
    INSTANCE;
    public String get(String key) { return System.getProperty(key); }
}
```

:::tip[Singleton choices]
Enum (safest, serialization-proof) · Bill Pugh holder (lazy, thread-safe) · Double-checked locking needs `volatile`. See [Singleton](/low-level-design/patterns/singleton/).
:::

```java title="Builder" showLineNumbers mark={9-12}
class Pizza {
    private final String size; private final boolean cheese; private final boolean olives;
    private Pizza(Builder b) { size = b.size; cheese = b.cheese; olives = b.olives; }

    static class Builder {
        private String size; private boolean cheese, olives;
        Builder size(String s)      { this.size = s; return this; }
        Builder cheese(boolean c)   { this.cheese = c; return this; }
        Builder olives(boolean o)   { this.olives = o; return this; }
        Pizza build()               { return new Pizza(this); }
    }
}
// new Pizza.Builder().size("L").cheese(true).build();
```

More: [Creational patterns](/low-level-design/patterns/creational-patterns/).

### Structural

:::data-table{paging=false searchable=false sortable=false}

| Pattern | Intent | Use when | Example |
|---------|--------|----------|---------|
| **Adapter** | Convert one interface to another | integrate legacy/third-party API | payment gateway wrapper |
| **Bridge** | Decouple abstraction from implementation | two independent dimensions | Shape × Renderer |
| **Composite** | Treat tree of objects uniformly | part-whole hierarchy | file system, menu |
| **Decorator** | Add behaviour dynamically | optional stackable features | toppings, coffee add-ons |
| **Facade** | Simple API over complex subsystem | many collaborators | `OrderService`, checkout |
| **Flyweight** | Share intrinsic state | huge number of similar objects | text characters, trees |
| **Proxy** | Control access | lazy load, auth, cache, remote | cached image loader |

:::

:::note[Decorator vs Proxy vs Adapter]
**Decorator** adds behaviour, same interface. **Proxy** controls access, same interface. **Adapter** changes the interface.
:::

```java title="Decorator" showLineNumbers mark={6-8,12}
interface Coffee { double cost(); }
class Espresso implements Coffee { public double cost() { return 50; } }

abstract class CoffeeDecorator implements Coffee {
    protected final Coffee inner;
    CoffeeDecorator(Coffee inner) { this.inner = inner; }
}
class Milk extends CoffeeDecorator {
    Milk(Coffee c) { super(c); }
    public double cost() { return inner.cost() + 10; }
}
// new Milk(new Milk(new Espresso())).cost() -> 70
```

More: [Structural patterns](/low-level-design/patterns/structural-patterns/).

### Behavioural

:::data-table{paging=false searchable=false sortable=false}

| Pattern | Intent | Use when | LLD example |
|---------|--------|----------|-------------|
| **Strategy** | Swap algorithms at runtime | `if/else` over algorithm type | pricing, payment, sorting, parking fee |
| **Observer** | Notify dependents of changes | one-to-many events | notifications, stock ticker |
| **State** | Behaviour changes with state | finite-state machine | vending machine, ATM, elevator, order status |
| **Command** | Wrap request as object | undo/redo, queues | text editor, remote control |
| **Template Method** | Fixed skeleton, variable steps | same flow with different steps | data import/export |
| **Chain of Responsibility** | Pass request along handlers | multiple possible handlers | logging levels, approvals, ATM cash dispense |
| **Iterator** | Traverse without exposing structure | custom collections | tree/graph iteration |
| **Mediator** | Centralise communication | many-to-many interaction | chat room, air traffic |
| **Memento** | Save/restore state | undo | editor snapshots |
| **Visitor** | New operation without changing classes | stable hierarchy, many operations | AST, tax calculation |

:::

:::::group-container

::::group-item[Strategy]{active}

```java title="Strategy" showLineNumbers mark={1,10-13}
interface PricingStrategy { double fee(long minutes); }

class HourlyPricing implements PricingStrategy {
    public double fee(long m) { return Math.ceil(m / 60.0) * 20; }
}
class FlatPricing implements PricingStrategy {
    public double fee(long m) { return 100; }
}
class Ticket {
    private PricingStrategy strategy;
    Ticket(PricingStrategy s) { this.strategy = s; }
    void setStrategy(PricingStrategy s) { this.strategy = s; }
    double bill(long minutes) { return strategy.fee(minutes); }
}
```

::::

::::group-item[Observer]

```java title="Observer" showLineNumbers mark={13-15}
interface Observer { void update(String event); }

class Subject {
    private final List<Observer> observers = new ArrayList<>();
    void subscribe(Observer o)   { observers.add(o); }
    void unsubscribe(Observer o) { observers.remove(o); }
    void notifyAll(String event) { for (Observer o : observers) o.update(event); }
}
class EmailNotifier implements Observer {
    public void update(String e) { System.out.println("Email: " + e); }
}
class Stock extends Subject {
    void setPrice(double p) {
        notifyAll("Price changed to " + p);
    }
}
```

::::

::::group-item[State]

```java title="State" showLineNumbers mark={14-17}
interface State { void next(Order o); String name(); }

class Placed implements State {
    public void next(Order o) { o.setState(new Shipped()); }
    public String name() { return "PLACED"; }
}
class Shipped implements State {
    public void next(Order o) { o.setState(new Delivered()); }
    public String name() { return "SHIPPED"; }
}
class Delivered implements State {
    public void next(Order o) { throw new IllegalStateException("Already delivered"); }
    public String name() { return "DELIVERED"; }
}
class Order {
    private State state = new Placed();
    void setState(State s) { this.state = s; }
    void next() { state.next(this); }
}
```

::::

::::group-item[Command]

```java title="Command (with undo)" showLineNumbers mark={1-4,11}
interface Command { void execute(); void undo(); }

class AddText implements Command {
    private final Editor e; private final String text;
    AddText(Editor e, String t) { this.e = e; this.text = t; }
    public void execute() { e.append(text); }
    public void undo()    { e.delete(text.length()); }
}
class Invoker {
    private final Deque<Command> history = new ArrayDeque<>();
    void run(Command c) { c.execute(); history.push(c); }
    void undo() { if (!history.isEmpty()) history.pop().undo(); }
}
```

::::

:::::

:::tip[Strategy vs State]
Both swap an object that implements an interface. **Strategy**: the *client* picks the algorithm. **State**: the object *itself* changes state and transitions. 
:::

More: [Behavioural patterns](/low-level-design/patterns/behavioural-patterns/).

## 6. Concurrency checklist for LLD

:::data-table{paging=false searchable=false sortable=false}

| Need | Java tool | Note |
|------|-----------|------|
| Mutual exclusion on a method/block | `synchronized` | simple, coarse |
| Fine-grained / try-lock / timeout | `ReentrantLock` | always unlock in `finally` |
| Many readers, few writers | `ReentrantReadWriteLock` | cache, config |
| Thread-safe map | `ConcurrentHashMap` | atomic ops: `compute`, `merge`, `putIfAbsent` |
| Counters | `AtomicInteger/Long` | CAS, lock-free |
| Producer/consumer | `BlockingQueue` | decouples threads |
| Async tasks | `ExecutorService` | do not spawn raw threads |
| Visibility flag | `volatile` | no atomicity |

:::

```java title="Book a seat safely" showLineNumbers mark={4-9}
class Show {
    private final Map<Integer, Boolean> seats = new HashMap<>();

    public synchronized boolean book(int seatNo) {
        if (Boolean.TRUE.equals(seats.get(seatNo))) return false; // already booked
        seats.put(seatNo, true);
        return true;
    }
}
```

:::caution[Race condition = check-then-act]
`if (!booked) book();` is unsafe without a lock. Make the check and the update one atomic step (lock, or `ConcurrentHashMap.putIfAbsent`).
:::

:::warn[Deadlock]
Acquire locks in a **fixed global order** (e.g. by account id when transferring money) and prefer `tryLock` with timeout.
:::

## 7. Problem → pattern map

:::data-table{paging=false searchable=true sortable=true}

| System | Key entities | Patterns / concepts |
|--------|--------------|---------------------|
| [Parking Lot](/low-level-design/examples/parking-lot-system/) | Vehicle, Slot, Ticket, Gate | Strategy (pricing, slot allocation), Factory (vehicle), Singleton |
| [Elevator](/low-level-design/examples/elevator-system/) | Elevator, Request, Controller | State, Strategy (scheduling), Observer |
| [ATM](/low-level-design/examples/atm-system/) | Card, Account, Cash dispenser | State, Chain of Responsibility (notes) |
| [LRU Cache](/low-level-design/examples/lru-cache/) | HashMap + doubly linked list | Data structures, thread safety, Strategy (eviction) |
| [Logging System](/low-level-design/examples/logging-system/) | Logger, Appender, Level | Singleton, Chain of Responsibility, Strategy |
| [Movie Ticket Booking](/low-level-design/examples/movie-ticket-booking-system/) | Show, Seat, Booking | Concurrency (seat lock), Strategy (payment), Observer |
| [Hotel Booking](/low-level-design/examples/hotel-booking-system/) | Room, Reservation | Strategy (pricing), State, concurrency |
| [Car Rental](/low-level-design/examples/car-rental-system/) | Vehicle, Reservation, Payment | Factory, Strategy, State |
| [Library Management](/low-level-design/examples/library-management-system/) | Book, Member, Loan | Observer (due reminders), Factory |
| [Online Shopping](/low-level-design/examples/online-shopping-system/) | Cart, Order, Payment | Strategy, Observer, State (order), Facade |
| [Snake and Ladder](/low-level-design/examples/snake-and-ladder-game/) | Board, Dice, Player | Strategy (dice), simple OOP |
| [Payment Gateway](/low-level-design/payment-gateway/lld-payment-gateway/) | Transaction, Processor, Fraud | Strategy, Adapter, State, Chain of Responsibility |

:::

## 8. Last-minute checklist

:::success[Before you say "done"]
- Entities, enums and interfaces are clearly named.
- Every pattern you used solves a **stated** problem.
- Core flow is walked through with an example (happy path + one failure).
- Shared state is protected (locks / concurrent collections).
- You explained extensibility: *"to add X, I add a new class implementing Y; nothing else changes."*
- You mentioned trade-offs and what you would add with more time (persistence, monitoring, caching).
:::
