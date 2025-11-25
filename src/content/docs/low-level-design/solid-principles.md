---
title: S.O.L.I.D. Principles
description: A comprehensive guide to SOLID principles in object-oriented design
---

The **SOLID** principles are five design principles intended to make object-oriented designs more understandable, flexible, and maintainable.

## Single Responsibility Principle (SRP)

:::tip[Key Concept]
A class should have only one reason to change.
:::

A class should do only one thing that is core to it. The idea is that the fewer responsibilities a class has, the less likely it will need to change in the future.

**Benefits:**
- Easier to understand and maintain
- Reduces the impact of changes
- Improves code reusability

---

## Open/Closed Principle (OCP)

:::tip[Key Concept]
Software entities should be **open for extension** but **closed for modification**.
:::

Instead of modifying existing base classes, we should extend them through inheritance to add new features. This prevents breaking existing functionality while allowing growth.

**Implementation Strategy:**
- Use inheritance to extend behavior
- Leverage interfaces and abstract classes
- Avoid modifying stable code

---

## Liskov Substitution Principle (LSP)

:::tip[Key Concept]
Objects of a superclass should be replaceable with objects of a subclass without breaking the application.
:::

If you have a subclass (e.g., `BigDog` extends `Dog`), you should be able to use a `BigDog` object anywhere a `Dog` object is expected without breaking the codebase.

**Example:**
```java
Dog myDog = new BigDog(); // Should work seamlessly
```

**Requirements:**
- Don't change method signatures in subclasses
- Maintain return types from the base class
- Preserve the expected behavior of the parent class

---

## Interface Segregation Principle (ISP)

:::tip[Key Concept]
Clients should not be forced to depend on interfaces they don't use.
:::

Instead of creating large interfaces with many methods, split them into smaller, focused interfaces (3-5 methods each). This prevents implementing classes from being burdened with irrelevant methods.

**Bad Example:**
```java
interface Organism {
    void fly();
    void walk();
}

class Bird implements Organism {
    void fly() { /* implementation */ }
    void walk() { /* birds can't walk! */ }
}
```

**Good Example:**
```java
interface Flyable {
    void fly();
}

interface Walkable {
    void walk();
}

class Bird implements Flyable { /* ... */ }
class Dog implements Walkable { /* ... */ }
```

---

## Dependency Inversion Principle (DIP)

:::tip[Key Concept]
- High-level modules should not depend on low-level modules. Both should depend on abstractions.
- Abstractions should not depend on details. Details should depend on abstractions.
:::

Write high-level classes that depend on interfaces rather than concrete low-level classes. This reverses the traditional dependency direction.

**Example Scenario:**

Instead of `StockMarketData` directly using a specific database implementation (SQL), it should depend on a `Database` interface:

```java
interface Database {
    void insert(Data data);
    Data retrieve(String id);
}

class SQLDatabase implements Database { /* ... */ }
class MongoDatabase implements Database { /* ... */ }

class StockMarketData {
    private Database db;
    
    // Dependency is injected, not created
    public StockMarketData(Database db) {
        this.db = db;
    }
}
```

:::note[Implementation Tips]
- Pass objects as arguments (dependency injection) instead of creating them internally
- Use interfaces to allow swapping implementations easily
- This makes your code more flexible and testable
:::

---

## Design Pattern Categories (GAMMA Categorization)

Design patterns, as defined by the Gang of Four (GoF), are organized into three main categories:

### Creational Patterns

**Purpose:** Deal with object creation mechanisms

- Focuses on how objects are constructed
- **Explicit creation:** Using constructors directly
- **Implicit creation:** Using patterns like Dependency Injection (DI), reflection, factories

[Learn more about Creational Patterns →](/low-level-design/patterns/creational-patterns/)

### Structural Patterns

**Purpose:** Concern the composition of classes and objects

- Focus on how classes and objects are structured
- Emphasize good API design
- Help create interfaces that are convenient to use
- Enable replication and adaptation of interfaces

[Learn more about Structural Patterns →](/low-level-design/patterns/structural-patterns/)

### Behavioral Patterns

**Purpose:** Define how objects interact and communicate

Each behavioral pattern addresses a specific problem related to object collaboration:

- Chain of Responsibility
- Command
- Interpreter
- Iterator
- Mediator
- Memento
- Observer
- State
- Strategy
- Template Method
- Visitor
- Null Object

[Learn more about Behavioral Patterns →](/low-level-design/patterns/behavioural-patterns/)

:::note
Unlike the other categories, behavioral patterns don't follow a single theme—each solves a unique problem in object interaction.
:::
