---
title: Vending Machine
description: Low level design for a Vending Machine
---

## Problem Statement

Design a vending machine that allows users to select products, insert money, and receive their selected product along with any change.

## Requirements

- The vending machine should have an inventory of products, each with a price and quantity.
- Users can select a product.
- Users can insert various denominations of coins/notes.
- The machine should validate the inserted money.
- If the inserted money is less than the product price, the machine should prompt for more money.
- If the inserted money is sufficient, the machine should dispense the product.
- The machine should return the correct change if any.
- The machine should handle out-of-stock products.
- The machine should allow for cancellation of a transaction and refund the inserted money.

## Class Diagram

```plantuml
@startuml
class VendingMachine {
  - inventory: Map<Product, Integer>
  - prices: Map<Product, Double>
  - cashRegister: CashRegister
  - currentState: State
  + selectProduct(product: Product): void
  + insertMoney(amount: double): void
  + dispenseProduct(): void
  + refundMoney(): void
  + setState(state: State): void
  + getInventory(): Map<Product, Integer>
}

class Product {
  - name: String
  - price: double
  - code: String
}

class CashRegister {
  - availableCash: Map<Double, Integer> // Denomination, Count
  + addMoney(amount: double): void
  + deductMoney(amount: double): Map<Double, Integer>
  + calculateChange(amount: double, productPrice: double): Map<Double, Integer>
}

interface State {
  + selectProduct(vm: VendingMachine, product: Product): void
  + insertMoney(vm: VendingMachine, amount: double): void
  + dispenseProduct(vm: VendingMachine): void
  + refundMoney(vm: VendingMachine): void
}

class IdleState implements State {
  + selectProduct(vm: VendingMachine, product: Product): void
  + insertMoney(vm: VendingMachine, amount: double): void
  + dispenseProduct(vm: VendingMachine): void
  + refundMoney(vm: VendingMachine): void
}

class HasSelectionState implements State {
  - selectedProduct: Product
  + selectProduct(vm: VendingMachine, product: Product): void
  + insertMoney(vm: VendingMachine, amount: double): void
  + dispenseProduct(vm: VendingMachine): void
  + refundMoney(vm: VendingMachine): void
}

class HasMoneyState implements State {
  - insertedMoney: double
  + selectProduct(vm: VendingMachine, product: Product): void
  + insertMoney(vm: VendingMachine, amount: double): void
  + dispenseProduct(vm: VendingMachine): void
  + refundMoney(vm: VendingMachine): void
}

class DispenseState implements State {
  + selectProduct(vm: VendingMachine, product: Product): void
  + insertMoney(vm: VendingMachine, amount: double): void
  + dispenseProduct(vm: VendingMachine): void
  + refundMoney(vm: VendingMachine): void
}

VendingMachine "1" *-- "many" Product
VendingMachine "1" *-- "1" CashRegister
VendingMachine "1" *-- "1" State : current

State <|.. IdleState
State <|.. HasSelectionState
State <|.. HasMoneyState
State <|.. DispenseState

note right of VendingMachine
  Uses State Design Pattern
  to manage different operational
  phases.
end note
@enduml
```

## Code Snippets

### State Interface

Defines the behavior for each state of the vending machine.

```java
public interface State {
    void selectProduct(VendingMachine vm, Product product);
    void insertMoney(VendingMachine vm, double amount);
    void dispenseProduct(VendingMachine vm);
    void refundMoney(VendingMachine vm);
}
```

### IdleState

Initial state where no product is selected and no money is inserted.

```java
public class IdleState implements State {
    @Override
    public void selectProduct(VendingMachine vm, Product product) {
        if (vm.getInventory().getOrDefault(product, 0) > 0) {
            System.out.println("Product " + product.getName() + " selected. Please insert money.");
            vm.setState(new HasSelectionState(product));
        } else {
            System.out.println("Product " + product.getName() + " is out of stock.");
        }
    }

    @Override
    public void insertMoney(VendingMachine vm, double amount) {
        System.out.println("Please select a product first.");
    }

    @Override
    public void dispenseProduct(VendingMachine vm) {
        System.out.println("No product selected to dispense.");
    }

    @Override
    public void refundMoney(VendingMachine vm) {
        System.out.println("No money to refund.");
    }
}
```

### VendingMachine Class (partial)

The context class that holds the current state and delegates operations to it.

```java
public class VendingMachine {
    private Map<Product, Integer> inventory;
    private Map<Product, Double> prices;
    private CashRegister cashRegister;
    private State currentState;

    public VendingMachine() {
        this.inventory = new HashMap<>();
        this.prices = new HashMap<>();
        this.cashRegister = new CashRegister();
        this.currentState = new IdleState(); // Initial state
    }

    public void setState(State newState) {
        this.currentState = newState;
    }

    public void selectProduct(Product product) {
        currentState.selectProduct(this, product);
    }

    public void insertMoney(double amount) {
        currentState.insertMoney(this, amount);
    }

    // Other methods...
}
```
