---
title: Behavioural Patterns
sidebar:
  order: 4
---

Behavioral patterns take care of effective communication and the assignment of responsibilities between objects.

## Overview of Behavioral Patterns

1. **Strategy** - Lets you define a family of algorithms, put each of them in a separate class and make their objects interchangeable.
2. **Observer** - Lets you define a subscription mechanism to notify multiple objects if any events happens to objects they're observing.
3. **Command** - Turns a request into a stand-alone object that contains all information about the request. This transformation lets us pass the requests as arguments, delay or queue execution, and support undo operations.
4. **Iterator** - Lets us traverse elements of a collection without exposing the underlying representation (List, stack, tree, etc.).
5. **State** - Lets an object alter its behavior when its internal state changes, it appears as if the object changed its class.
6. **Chain of Responsibility** - Lets you pass the requests along the chain of handlers; on receiving the request, each handler decides either to process the request or to pass it to the next handler in the chain.
7. **Template Method** - Defines the skeleton of an algorithm in the superclass but lets the subclasses override specific steps of the algorithm without changing its structure.
8. **Visitor** - Lets you separate the algorithms from the objects on which they operate.
9. **Mediator** - Lets you reduce the chaotic dependencies between objects. The pattern restricts direct communication between objects and forces them to collaborate only through the mediator object.
10. **Memento** - Lets you store and restore the previous state of the object without revealing the details of its implementation.

## Strategy Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

class Context {
  - strategy: Strategy
  + setStrategy(Strategy)
  + executeStrategy()
}

interface Strategy {
  + execute()
}

class ConcreteStrategyA {
  + execute()
}

class ConcreteStrategyB {
  + execute()
}

class ConcreteStrategyC {
  + execute()
}

Client --> Context
Client ..> ConcreteStrategyA
Client ..> ConcreteStrategyB
Client ..> ConcreteStrategyC
Context o--> Strategy
Strategy <|-- ConcreteStrategyA
Strategy <|-- ConcreteStrategyB
Strategy <|-- ConcreteStrategyC

note right of Context::executeStrategy
  strategy.execute()
end note

note right of Client::main
  // Create strategies
  strategyA = new ConcreteStrategyA()
  strategyB = new ConcreteStrategyB()
  
  // Create context
  context = new Context()
  
  // Set and execute strategy A
  context.setStrategy(strategyA)
  context.executeStrategy()
  
  // Switch to strategy B
  context.setStrategy(strategyB)
  context.executeStrategy()
end note
@enduml
```

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

### Key Components:

- **Context**: Maintains a reference to a Strategy object and delegates it to execute the algorithm
- **Strategy**: Common interface for all concrete strategies
- **ConcreteStrategy**: Implements the algorithm using the Strategy interface

### When to Use:

- When you need different variants of an algorithm
- When you want to isolate algorithm implementation details from the code that uses it
- When you have many related classes that differ only in their behavior
- When you need to switch algorithms at runtime
- When an algorithm uses data that clients shouldn't know about

### Real-World Example:

Navigation apps that can calculate a route using different strategies: fastest route, shortest distance, avoiding highways, public transport, etc.

## Observer Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

class Subject {
  - observers: List<Observer>
  - state: State
  + attach(Observer)
  + detach(Observer)
  + setState(State)
  + notify()
}

interface Observer {
  + update()
}

class ConcreteObserverA {
  + update()
}

class ConcreteObserverB {
  + update()
}

Client --> Subject
Client --> ConcreteObserverA
Client --> ConcreteObserverB
Subject o--> Observer
Observer <|-- ConcreteObserverA
Observer <|-- ConcreteObserverB

note right of Subject::notify
  for each observer in observers:
    observer.update()
end note

note right of Subject::setState
  this.state = state
  notify()  // Notify all observers
end note

note right of Client::main
  // Create subject and observers
  subject = new Subject()
  observerA = new ConcreteObserverA()
  observerB = new ConcreteObserverB()
  
  // Register observers
  subject.attach(observerA)
  subject.attach(observerB)
  
  // Change state - triggers notification
  subject.setState(newState)
  
  // Unregister an observer
  subject.detach(observerB)
end note
@enduml
```

The Observer pattern lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they're observing.

### Key Components:

- **Subject**: Maintains a list of observers and notifies them of state changes
- **Observer**: Interface that defines the update method for objects that should be notified
- **ConcreteObserver**: Implements the Observer interface to respond to updates

### When to Use:

- When changes to one object require changing others, and you don't know how many objects need to change
- When an object should be able to notify other objects without making assumptions about who these objects are
- When you need a one-to-many dependency between objects that is loosely coupled
- When you need a publish-subscribe communication pattern
- When the set of objects that need to be notified can change dynamically

### Real-World Example:

Event listeners in user interfaces, subscription systems (like YouTube channel subscriptions), or financial market data feeds.

## Command Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

class Invoker {
  - command: Command
  + setCommand(Command)
  + executeCommand()
}

interface Command {
  + execute()
}

class ConcreteCommand {
  - receiver: Receiver
  + execute()
}

class Receiver {
  + action()
}

Client --> Receiver: creates >
Client --> ConcreteCommand: creates >
Client --> Invoker: configures >
Invoker o--> Command
Command <|-- ConcreteCommand
ConcreteCommand --> Receiver

note right of ConcreteCommand::execute
  receiver.action()
end note

note right of Client::main
  // Create receiver
  receiver = new Receiver()
  
  // Create command with receiver
  command = new ConcreteCommand(receiver)
  
  // Setup invoker with command
  invoker = new Invoker()
  invoker.setCommand(command)
  
  // Execute the command
  invoker.executeCommand()
end note

note "Commands encapsulate actions\nand their parameters" as N1
@enduml
```

The Command pattern turns a request into a stand-alone object containing all information about the request, allowing you to parameterize clients with queues, requests, and operations.

### Key Components:

- **Command**: Interface with an execute method
- **ConcreteCommand**: Implements Command and links to a Receiver
- **Invoker**: Asks the command to carry out the action

### When to Use:

- When you want to parameterize objects with operations
- When you want to queue operations, schedule their execution, or execute them remotely
- When you need to implement reversible operations (undo/redo functionality)
- When you want to structure a system around high-level operations built on primitive operations
- When you need to decouple objects that execute commands from objects that issue commands
- **Receiver**: Knows how to perform the operations

### Real-World Example:

Remote controls, command queues in game engines, transactional systems with undo capability, or task schedulers.

## Iterator Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

interface Iterator {
  + hasNext(): boolean
  + next(): Object
}

class ConcreteIterator {
  - collection: ConcreteCollection
  - position: int
  + hasNext(): boolean
  + next(): Object
}

interface Collection {
  + createIterator(): Iterator
}

class ConcreteCollection {
  - items: Object[]
  + createIterator(): Iterator
}

Client --> Collection: uses >
Client --> Iterator: uses >
Collection <|-- ConcreteCollection
Iterator <|-- ConcreteIterator
ConcreteCollection ..> ConcreteIterator: creates >

note right of Client::main
  // Get collection
  collection = new ConcreteCollection()
  
  // Get iterator from collection
  iterator = collection.createIterator()
  
  // Iterate through elements
  while (iterator.hasNext()) {
    item = iterator.next()
    // Process item
  }
end note

note right of ConcreteCollection::createIterator
  return new ConcreteIterator(this)
end note

note "Iterator provides a way to access\nelements sequentially without\nexposing underlying structure" as N1
@enduml
```

The Iterator pattern provides a way to access elements of a collection sequentially without exposing its underlying representation.

### Key Components:

- **Iterator**: Interface with methods for traversing a collection
- **ConcreteIterator**: Implements the Iterator interface
- **Collection**: Interface that creates an Iterator
- **ConcreteCollection**: Implements Collection and returns ConcreteIterator

### When to Use:

- When you need to access a collection's contents without exposing its internal structure
- When you need multiple traversal algorithms for a collection
- When you want to provide a uniform interface for traversing different collection types
- When you need to decouple algorithms from the data structures they operate on
- When you want to hide the complexity of navigation from client code

### Real-World Example:

Java's Iterator and Iterable interfaces, database result sets, or custom collection traversal implementations.

## State Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

class Context {
  - state: State
  + setState(State)
  + request()
}

interface State {
  + handle(Context)
}

class ConcreteStateA {
  + handle(Context)
}

class ConcreteStateB {
  + handle(Context)
}

Client --> Context: uses >
Context o--> State
State <|-- ConcreteStateA
State <|-- ConcreteStateB

note right of Context::request
  state.handle(this)
end note

note right of ConcreteStateA::handle
  // Do something
  // May change context's state
  context.setState(new ConcreteStateB())
end note

note right of Client::main
  // Create context with initial state
  initialState = new ConcreteStateA()
  context = new Context()
  context.setState(initialState)
  
  // Request actions - state changes internally
  context.request()  // In state A
  context.request()  // Now in state B
  
  // Client doesn't need to track state changes
end note

note "State transitions are controlled\nby the concrete state classes" as N1
@enduml
```

The State pattern allows an object to alter its behavior when its internal state changes, making it appear as if the object changed its class.

### Key Components:

- **Context**: Maintains a reference to a State object and delegates state-specific behavior
- **State**: Interface defining state-specific behavior
- **ConcreteState**: Classes that implement specific states' behavior

### When to Use:

- When an object's behavior depends on its state, and it must change behavior at runtime
- When operations have large, multipart conditional statements that depend on the object's state
- When state transitions are complex and need to be represented explicitly
- When you want to avoid massive conditional logic in one class
- When you want state transitions to be explicit and controlled by the state objects themselves

### Real-World Example:

Order processing systems (ordered, shipped, delivered), document editing (editing, formatting, reviewing), or media players (playing, paused, stopped).

## Chain of Responsibility Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

class Request {
  - type: String
  - content: String
  + getType(): String
  + getContent(): String
}

abstract class Handler {
  - successor: Handler
  + setSuccessor(Handler)
  + handleRequest(Request)
}

class ConcreteHandlerA {
  + handleRequest(Request)
}

class ConcreteHandlerB {
  + handleRequest(Request)
}

class ConcreteHandlerC {
  + handleRequest(Request)
}

Client --> Handler: uses >
Client --> Request: creates >
Handler <|-- ConcreteHandlerA
Handler <|-- ConcreteHandlerB
Handler <|-- ConcreteHandlerC
Handler o--> Handler

note right of Handler::handleRequest
  if (can handle request)
    handle it
  else if (successor != null)
    successor.handleRequest(request)
end note

note right of Client::main
  // Create the chain of handlers
  handlerA = new ConcreteHandlerA()
  handlerB = new ConcreteHandlerB()
  handlerC = new ConcreteHandlerC()
  
  // Build the chain
  handlerA.setSuccessor(handlerB)
  handlerB.setSuccessor(handlerC)
  
  // Create and process requests
  request1 = new Request("Type1", "Process this")
  request2 = new Request("Type3", "Handle this")
  
  // Send requests to first handler in chain
  handlerA.handleRequest(request1)
  handlerA.handleRequest(request2)
end note

note "Each handler decides either to\nprocess the request or pass\nit to the next handler" as N1
@enduml
```

The Chain of Responsibility pattern passes a request along a chain of handlers, with each handler deciding either to process the request or pass it to the next handler in the chain.

### Key Components:

- **Handler**: Abstract class/interface defining the request handling method and successor link
- **ConcreteHandler**: Implements the request handling behavior

### When to Use:

- When more than one object may handle a request, and the handler isn't known in advance
- When you want to issue a request to one of several objects without specifying the receiver explicitly
- When the set of objects that can handle a request should be specified dynamically
- When you want to decouple the sender and receiver of a request
- When you need to process different requests in different ways but don't know the sequence in advance

### Real-World Example:

HTTP request middleware, event propagation in UI frameworks, or approval workflows with multiple levels of authority.

## Template Method Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

abstract class AbstractClass {
  + templateMethod()
  # {abstract} primitiveOperation1()
  # {abstract} primitiveOperation2()
  # hook()
}

class ConcreteClassA {
  # primitiveOperation1()
  # primitiveOperation2()
}

class ConcreteClassB {
  # primitiveOperation1()
  # primitiveOperation2()
  # hook()
}

Client --> ConcreteClassA: uses >
Client --> ConcreteClassB: uses >
AbstractClass <|-- ConcreteClassA
AbstractClass <|-- ConcreteClassB

note right of AbstractClass::templateMethod
  primitiveOperation1()
  primitiveOperation2()
  hook()
  // Algorithm structure is fixed
end note

note right of Client::main
  // Create concrete implementations
  classA = new ConcreteClassA()
  classB = new ConcreteClassB()
  
  // Call template method on each
  // Steps are defined in subclasses
  classA.templateMethod()
  classB.templateMethod()
  
  // Client uses the same interface
  // but gets different implementations
end note

note "Template Method defines the skeleton\nof an algorithm, with concrete steps\ndefined by subclasses" as N1
@enduml
```

The Template Method pattern defines the skeleton of an algorithm in a base class, with specific steps implemented by subclasses without changing the algorithm's structure.

### Key Components:

- **AbstractClass**: Defines template methods and abstract operations
- **ConcreteClass**: Implements the primitive operations required by the template method

### When to Use:

- When you want to implement the invariant parts of an algorithm once and leave the variant parts to subclasses
- When you want to control the extension points available to subclasses
- When common behavior among subclasses should be factored into a common class
- When you want to avoid code duplication in related classes
- When you need a way to refactor for better code reuse while maintaining algorithm structure

### Real-World Example:

Framework lifecycle methods, data processing pipelines, or document generation systems.

## Visitor Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

class ObjectStructure {
  - elements: List<Element>
  + accept(Visitor)
}

interface Visitor {
  + visitConcreteElementA(ConcreteElementA)
  + visitConcreteElementB(ConcreteElementB)
}

class ConcreteVisitor1 {
  + visitConcreteElementA(ConcreteElementA)
  + visitConcreteElementB(ConcreteElementB)
}

class ConcreteVisitor2 {
  + visitConcreteElementA(ConcreteElementA)
  + visitConcreteElementB(ConcreteElementB)
}

interface Element {
  + accept(Visitor)
}

class ConcreteElementA {
  + accept(Visitor)
  + operationA()
}

class ConcreteElementB {
  + accept(Visitor)
  + operationB()
}

Client --> ObjectStructure: uses >
Client --> ConcreteVisitor1: creates >
Client --> ConcreteVisitor2: creates >
ObjectStructure o--> Element
Visitor <|-- ConcreteVisitor1
Visitor <|-- ConcreteVisitor2
Element <|-- ConcreteElementA
Element <|-- ConcreteElementB

note right of ConcreteElementA::accept
  visitor.visitConcreteElementA(this)
end note

note right of ObjectStructure::accept
  for each element in elements:
    element.accept(visitor)
end note

note right of Client::main
  // Create object structure with elements
  structure = new ObjectStructure()
  structure.add(new ConcreteElementA())
  structure.add(new ConcreteElementB())
  
  // Create different visitors
  visitor1 = new ConcreteVisitor1()
  visitor2 = new ConcreteVisitor2()
  
  // Apply visitors to the structure
  structure.accept(visitor1)
  structure.accept(visitor2)
  
  // Same elements, different operations
end note

note "Visitor separates algorithms\nfrom the objects they operate on" as N1
@enduml
```

The Visitor pattern separates algorithms from the objects on which they operate, allowing you to add new operations to existing object structures without modifying those structures.

### Key Components:

- **Visitor**: Interface declaring visit methods for each element type
- **ConcreteVisitor**: Implements the visitor interface with specific behavior
- **Element**: Interface declaring an accept method
- **ConcreteElement**: Implements the element interface

### When to Use:

- When you need to perform operations on objects of a composite structure
- When you want to add new operations to a class hierarchy without modifying the hierarchy
- When you have many distinct operations to perform on objects, but don't want to pollute their classes
- When the object structure classes rarely change but you often need to define new operations on them
- When you want to collect related operations into a single class rather than spreading them across multiple classes

### Real-World Example:

Document object model (DOM) operations, abstract syntax tree (AST) processing, or report generation from complex data structures.

## Mediator Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

interface Mediator {
  + notify(Colleague, Event)
}

class ConcreteMediator {
  - colleagueA: ConcreteColleagueA
  - colleagueB: ConcreteColleagueB
  + setColleagueA(ConcreteColleagueA)
  + setColleagueB(ConcreteColleagueB)
  + notify(Colleague, Event)
}

abstract class Colleague {
  # mediator: Mediator
  + setMediator(Mediator)
}

class ConcreteColleagueA {
  + operationA()
  + receiveFromB()
}

class ConcreteColleagueB {
  + operationB()
  + receiveFromA()
}

Client --> ConcreteMediator: creates >
Client --> ConcreteColleagueA: creates >
Client --> ConcreteColleagueB: creates >
Mediator <|-- ConcreteMediator
Colleague <|-- ConcreteColleagueA
Colleague <|-- ConcreteColleagueB
Colleague o--> Mediator
ConcreteMediator --> ConcreteColleagueA
ConcreteMediator --> ConcreteColleagueB

note right of ConcreteMediator::notify
  if (sender == colleagueA && event == "A_EVENT")
    colleagueB.receiveFromA()
  else if (sender == colleagueB && event == "B_EVENT")
    colleagueA.receiveFromB()
end note

note right of Client::main
  // Create mediator
  mediator = new ConcreteMediator()
  
  // Create colleagues
  colleagueA = new ConcreteColleagueA()
  colleagueB = new ConcreteColleagueB()
  
  // Register colleagues with mediator
  mediator.setColleagueA(colleagueA)
  mediator.setColleagueB(colleagueB)
  
  // Set mediator for colleagues
  colleagueA.setMediator(mediator)
  colleagueB.setMediator(mediator)
  
  // Colleagues communicate through mediator
  colleagueA.operationA() // Triggers notification
end note

note "Mediator centralizes complex\ncommunication between objects" as N1
@enduml
```

The Mediator pattern reduces chaotic dependencies between objects by restricting direct communications and forcing collaborations through a mediator object.

### Key Components:

- **Mediator**: Interface defining communication method between colleagues
- **ConcreteMediator**: Implements Mediator and coordinates between colleague objects
- **Colleague**: Abstract class for objects that communicate through the mediator
- **ConcreteColleague**: Implements Colleague with specific behavior

### When to Use:

- When a set of objects communicate in well-defined but complex ways
- When reusing an object is difficult because it communicates with many other objects
- When you want to customize how objects interact without subclassing
- When you have many classes that are tightly coupled making the system hard to maintain
- When you want to avoid a "many-to-many" relationship between communicating objects

### Real-World Example:

Air traffic control systems, chat room servers, or UI components coordination.

## Memento Pattern

```plantuml
@startuml
skinparam backgroundColor #ffffff
skinparam Shadowing false
skinparam DefaultFontName Arial
skinparam DefaultFontSize 13
skinparam ArrowColor #475569
skinparam rectangleBorderColor #64748b
skinparam rectangleBackgroundColor #f8fafc
skinparam classBackgroundColor #f8fafc
skinparam classBorderColor #64748b
skinparam interfaceBackgroundColor #ecfdf5
skinparam interfaceBorderColor #10b981
skinparam noteBackgroundColor #fef3c7
skinparam noteBorderColor #d97706

class Client {
  + main()
}

class Originator {
  - state: String
  + setState(String)
  + getState(): String
  + createMemento(): Memento
  + restore(Memento)
}

class Memento {
  - state: String
  + getState(): String
}

class Caretaker {
  - mementos: List<Memento>
  + addMemento(Memento)
  + getMemento(int): Memento
}

Client --> Originator: uses >
Client --> Caretaker: uses >
Originator --> Memento: creates >
Caretaker o--> Memento: stores >

note right of Originator::createMemento
  return new Memento(state)
end note

note right of Originator::restore
  setState(memento.getState())
end note

note right of Client::main
  // Create originator with initial state
  originator = new Originator()
  originator.setState("State 1")
  System.out.println(originator.getState())
  
  // Create caretaker to track history
  caretaker = new Caretaker()
  
  // Save current state
  caretaker.addMemento(originator.createMemento())
  
  // Change state and save again
  originator.setState("State 2")
  System.out.println(originator.getState())
  caretaker.addMemento(originator.createMemento())
  
  // Change state once more
  originator.setState("State 3")
  System.out.println(originator.getState())
  
  // Restore to previous state
  originator.restore(caretaker.getMemento(1))
  System.out.println("Restored to: " + 
                    originator.getState())
  
  // Restore to first state
  originator.restore(caretaker.getMemento(0))
  System.out.println("Restored to: " + 
                    originator.getState())
end note

note "Memento captures and externalizes\nan object's state for later restoration" as N1
@enduml
```

The Memento pattern lets you capture and externalize an object's internal state so it can be restored to this state later without violating encapsulation.

### Key Components:

- **Originator**: Creates a memento containing its state and uses it to restore state
- **Memento**: Stores the internal state of the Originator
- **Caretaker**: Keeps track of multiple mementos

### When to Use:

- When you need to create snapshots of an object's state for later restoration
- When direct access to an object's fields/getters/setters would expose implementation details
- When you need to implement undo/redo functionality
- When you want to provide a rollback mechanism for operations
- When you need to maintain history states while preserving encapsulation

### Real-World Example:

Undo/redo functionality, save game systems, or transaction rollbacks in databases.
