---
title: ATM Machine
description: Low level design for an ATM Machine
---

## Problem Statement

Design an Automated Teller Machine (ATM) that allows users to perform transactions such as withdrawals, deposits, and balance inquiries.

## Requirements

- Users should be able to insert their ATM card.
- The ATM should validate the card and PIN.
- Users can choose from different transaction types: withdraw, deposit, check balance.
- For withdrawals, the ATM should check account balance and dispense cash.
- For deposits, the ATM should accept cash/cheques and update the account balance.
- For balance inquiry, the ATM should display the account balance.
- The ATM should print a receipt for each transaction.
- The system should interact with a bank database.
- The ATM should handle various error conditions (e.g., insufficient funds, invalid PIN, card expiry).

## Class Diagram

```plantuml
@startuml
class ATM {
  - atmId: String
  - location: String
  - cashDispenser: CashDispenser
  - cashDeposit: CashDeposit
  - chequeDeposit: ChequeDeposit
  - cardReader: CardReader
  - keypad: Keypad
  - screen: Screen
  - printer: Printer
  - bank: Bank
  - currentState: ATMState
  + insertCard(card: Card): void
  + enterPin(pin: String): void
  + selectTransaction(type: TransactionType): void
  + executeTransaction(transaction: Transaction): void
  + setState(state: ATMState): void
  + getBank(): Bank
}

class Card {
  - cardNumber: String
  - cardHolderName: String
  - expiryDate: Date
  - pin: String
  - bankAccount: BankAccount
}

class Bank {
  - name: String
  - accounts: Map<String, BankAccount>
  + authenticateCard(cardNumber: String, pin: String): BankAccount
  + executeTransaction(transaction: Transaction): boolean
}

class BankAccount {
  - accountNumber: String
  - balance: double
  + deposit(amount: double): void
  + withdraw(amount: double): boolean
  + getBalance(): double
}

class CashDispenser {
  - availableCash: Map<Double, Integer>
  + dispenseCash(amount: double): boolean
  + hasEnoughCash(amount: double): boolean
}

class CashDeposit {
  + acceptCash(amount: double): void
}

class ChequeDeposit {
  + acceptCheque(chequeId: String): void
}

class CardReader {
  + readCard(): Card
  + ejectCard(): void
}

class Keypad {
  + getInput(): String
}

class Screen {
  + displayMessage(message: String): void
}

class Printer {
  + printReceipt(transaction: Transaction): void
}

abstract class Transaction {
  - transactionId: String
  - accountNumber: String
  - amount: double
  - status: TransactionStatus
  - transactionDate: Date
  + abstract execute(): boolean
}

class Withdrawal extends Transaction {
  + execute(): boolean
}

class Deposit extends Transaction {
  + execute(): boolean
}

class BalanceInquiry extends Transaction {
  + execute(): boolean
}

enum TransactionType {
  WITHDRAWAL
  DEPOSIT
  BALANCE_INQUIRY
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
}

interface ATMState {
  + handleInsertCard(atm: ATM, card: Card): void
  + handleEnterPin(atm: ATM, pin: String): void
  + handleSelectTransaction(atm: ATM, type: TransactionType): void
  + handleExecuteTransaction(atm: ATM, transaction: Transaction): void
  + handleEjectCard(atm: ATM): void
}

class IdleState implements ATMState { ... }
class CardInsertedState implements ATMState { ... }
class PinEnteredState implements ATMState { ... }
class TransactionSelectionState implements ATMState { ... }
class TransactionProcessingState implements ATMState { ... }

ATM "1" *-- "1" CashDispenser
ATM "1" *-- "1" CashDeposit
ATM "1" *-- "1" ChequeDeposit
ATM "1" *-- "1" CardReader
ATM "1" *-- "1" Keypad
ATM "1" *-- "1" Screen
ATM "1" *-- "1" Printer
ATM "1" *-- "1" Bank
ATM "1" *-- "1" ATMState : current

Bank "1" *-- "many" BankAccount
Card "1" *-- "1" BankAccount
Transaction <|-- Withdrawal
Transaction <|-- Deposit
Transaction <|-- BalanceInquiry
Transaction ..> TransactionType
Transaction ..> TransactionStatus

ATMState <|.. IdleState
ATMState <|.. CardInsertedState
ATMState <|.. PinEnteredState
ATMState <|.. TransactionSelectionState
ATMState <|.. TransactionProcessingState

note right of ATM
  Uses State Design Pattern
  to manage different operational
  phases.
end note
@enduml
```

## Code Snippets

### ATMState Interface

Defines the behavior for each state of the ATM.

```java
public interface ATMState {
    void handleInsertCard(ATM atm, Card card);
    void handleEnterPin(ATM atm, String pin);
    void handleSelectTransaction(ATM atm, TransactionType type);
    void handleExecuteTransaction(ATM atm, Transaction transaction);
    void handleEjectCard(ATM atm);
}
```

### IdleState

Initial state of the ATM.

```java
public class IdleState implements ATMState {
    @Override
    public void handleInsertCard(ATM atm, Card card) {
        System.out.println("Card inserted. Please enter PIN.");
        atm.setCard(card); // ATM now holds the card
        atm.setState(new CardInsertedState());
    }

    @Override
    public void handleEnterPin(ATM atm, String pin) {
        System.out.println("Please insert card first.");
    }

    // ... other empty implementations for IdleState ...
    @Override
    public void handleSelectTransaction(ATM atm, TransactionType type) {}
    @Override
    public void handleExecuteTransaction(ATM atm, Transaction transaction) {}
    @Override
    public void handleEjectCard(ATM atm) {}
}
```

### ATM Class (partial)

The context class that holds the current state and delegates operations to it.

```java
public class ATM {
    private String atmId;
    private Bank bank;
    private Card currentCard; // Card currently in the ATM
    private ATMState currentState;

    // Components
    private CardReader cardReader;
    private Keypad keypad;
    private Screen screen;
    private CashDispenser cashDispenser;
    private CashDeposit cashDeposit;
    private ChequeDeposit chequeDeposit;
    private Printer printer;


    public ATM(String atmId, Bank bank) {
        this.atmId = atmId;
        this.bank = bank;
        this.currentState = new IdleState(); // Initial state
        // Initialize components
        this.cardReader = new CardReader();
        this.keypad = new Keypad();
        this.screen = new Screen();
        this.cashDispenser = new CashDispenser();
        this.cashDeposit = new CashDeposit();
        this.chequeDeposit = new ChequeDeposit();
        this.printer = new Printer();
    }

    public void setState(ATMState newState) {
        this.currentState = newState;
    }

    public void insertCard(Card card) {
        currentState.handleInsertCard(this, card);
    }

    public void enterPin(String pin) {
        currentState.handleEnterPin(this, pin);
    }

    public void selectTransaction(TransactionType type) {
        currentState.handleSelectTransaction(this, type);
    }

    public void executeTransaction(Transaction transaction) {
        currentState.handleExecuteTransaction(this, transaction);
    }

    public void ejectCard() {
        currentState.handleEjectCard(this);
    }

    // Getters for components, bank, etc.
    public Bank getBank() { return bank; }
    public Screen getScreen() { return screen; }
    public CashDispenser getCashDispenser() { return cashDispenser; }
    public Card getCurrentCard() { return currentCard; }
    public void setCard(Card card) { this.currentCard = card; }
    public Printer getPrinter() { return printer; }
}
```
