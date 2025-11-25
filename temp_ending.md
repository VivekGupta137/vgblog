---

## Association Types in Code

**Association:** A class A is associated with class B if class A contains some reference to class B anywhere inside the class.

:::tip[Three Types of Association]
1. **Dependency** - Weakest relationship
2. **Aggregation** - Moderate relationship  
3. **Composition** - Strongest relationship
:::

### Dependency in Code

`java
public class Driver {
    public void drive(Vehicle vehicle) {
        vehicle.accelerate();
    }
}
`

### Aggregation in Code

`java
public class Car {
    private Engine engine;  // Engine created separately
    
    public Car(Engine eng) {
        this.engine = eng;  // Reference passed in
    }
}
`

:::note
Engine can exist independently of Car - weak bonding (Aggregation).
:::

### Composition in Code

`java
public class Vehicle {
    private Engine myEngine;
    
    public Vehicle(int horsePower) {
        myEngine = new Engine(horsePower);  // Created here!
    }
}
`

:::caution
Engine is destroyed when Vehicle is destroyed - strong bonding (Composition).
:::

---

## Relationship Hierarchy

:::tip[Arrow Direction Rule]
The arrow head points toward the dependency - toward objects that receive messages.
:::

### Strength Order (Weakest  Strongest)

Dependency  Association  Aggregation  Composition

| Relationship | Symbol | Strength | Lifecycle | Example |
|--------------|--------|----------|-----------|---------|
| **Dependency** | ..> | Weakest | Independent | Driver uses Vehicle |
| **Association** | --> | Weak | Independent | Admin  ParkingFloor |
| **Aggregation** | o-- | Moderate | Independent | Person Has-A Address |
| **Composition** | *-- | Strongest | Dependent | ParkingFloor owns Spots |
| **Inheritance** | <\|-- | - | - | Dog IS-A Animal |

---

## Summary

:::tip[Key Takeaways]
1. **Loose coupling** is preferred for maintainability
2. **UML** provides standard visualization for OO designs
3. **Class diagrams** show structure and relationships
4. **Relationships** range from weak (dependency) to strong (composition)
5. Use **aggregation** when parts can exist independently
6. Use **composition** when parts cannot exist without the whole
:::
