---
title: Online Shopping System
description: Low-Level Design for an E-Commerce Platform
---

## Problem Statement

Design an online shopping system (e-commerce platform) that allows customers to browse products, add items to cart, place orders, make payments, and track shipments. The system should handle product catalog, inventory management, order processing, and support multiple sellers.

## Requirements

### Functional Requirements
1. Browse and search products by category, name, price
2. Add/remove products from shopping cart
3. Place orders and checkout
4. Multiple payment methods support
5. Order tracking and history
6. Product reviews and ratings
7. Inventory management
8. Support multiple sellers/vendors
9. Wishlist functionality
10. Apply discount coupons and promotions

### Non-Functional Requirements
1. Handle high concurrency for popular products
2. Prevent overselling (inventory consistency)
3. Secure payment processing
4. Fast search and browse operations
5. Scalable to millions of products and users

## Simplified Class Diagram

```plantuml
@startuml

skinparam classBorderThickness 3
skinparam ArrowThickness 1
skinparam defaultFontSize 16
skinparam classAttributeFontSize 18
skinparam classFontSize 16

class ShoppingService {
  + searchProducts()
  + addToCart()
  + checkout()
  + placeOrder()
}

class ProductCatalog {
  + searchByCategory()
  + getProductDetails()
  + checkInventory()
}

class Product {
  + getPrice()
  + getDescription()
  + getAvailability()
}

class ShoppingCart {
  + addItem()
  + removeItem()
  + calculateTotal()
}

class Order {
  + confirm()
  + track()
  + cancel()
}

class Customer {
  + getProfile()
  + getOrderHistory()
}

class PaymentProcessor {
  + processPayment()
  + refund()
}

ShoppingService *-- ProductCatalog
ShoppingService *-- PaymentProcessor
ShoppingService ..> Order
Customer *-- ShoppingCart
ShoppingCart o-- Product
Order --> Customer
Order --> Product
ProductCatalog o-- Product

@enduml
```

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Shopping Service" {
    [ShoppingService] as Service
}

package "Product Catalog" {
    interface "IProductCatalog" as Catalog
    interface "IProduct" as Product
    interface "IProductInventory" as Inventory
}

package "Customer & Cart" {
    interface "ICustomer" as Customer
    interface "IShoppingCart" as Cart
    interface "IWishlist" as Wishlist
}

package "Order Management" {
    interface "IOrder" as Order
    interface "IOrderItem" as OrderItem
    interface "IShipment" as Shipment
}

package "Payment" {
    interface "IPaymentProcessor" as PaymentProc
    interface "IDiscountPolicy" as Discount
}

package "Seller" {
    interface "ISeller" as SellerIntf
}

[ShoppingDriver] --> Service : uses
Service *-- Catalog : composed of
Service *-- PaymentProc : composed of
Service o-- Order : manages
Service o-- Customer : manages
Catalog o-- Product : manages
Catalog o-- Inventory : manages
Customer o-- Cart
Customer o-- Wishlist
Cart o-- Product
Order o-- OrderItem
Order o-- Customer
Order o-- Discount : uses
Order o-- Shipment
OrderItem o-- Product
Product o-- SellerIntf
Shipment o-- Order

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum ProductCategory {
    ELECTRONICS
    CLOTHING
    BOOKS
    HOME
    SPORTS
}

enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
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
    + Address(street: String, city: String)
}

interface ICustomer {
    + getCustomerId(): String
    + getName(): String
    + getEmail(): String
}

class Customer {
    - customerId: String
    - name: String
    - email: String
    - phone: String
    - addresses: List<Address>
    + Customer(customerId: String, name: String)
    + addAddress(address: Address): void
}

interface ISeller {
    + getSellerId(): String
    + getName(): String
}

class Seller {
    - sellerId: String
    - name: String
    - email: String
    - inventoryManager: IInventoryManager
    + Seller(sellerId: String, name: String, manager: IInventoryManager)
}

interface IProduct {
    - productId: String
    - name: String
    - description: String
    - category: ProductCategory
    - price: double
    - seller: Seller
    - images: List<String>
    - averageRating: double
    - reviews: List<Review>
    + Product(productId: String, name: String)
    + updatePrice(newPrice: double): void
    + addReview(review: Review): void
    + getAverageRating(): double
}

class ProductInventory {
    - product: Product
    - availableQuantity: int
    - reservedQuantity: int
    - reorderLevel: int
    + ProductInventory(product: Product, quantity: int)
    + isAvailable(quantity: int): boolean
    + reserve(quantity: int): boolean
    + release(quantity: int): void
    + deduct(quantity: int): boolean
}

class Review {
    - reviewId: String
    - customer: Customer
    - product: Product
    - rating: int
    - comment: String
    - timestamp: DateTime
    + Review(customer: Customer, product: Product, rating: int)
}

class ShoppingCart {
    - cartId: String
    - customer: Customer
    - items: List<CartItem>
    - totalAmount: double
    + ShoppingCart(customer: Customer)
    + addItem(product: Product, quantity: int): void
    + removeItem(productId: String): void
    + updateQuantity(productId: String, quantity: int): void
    + clear(): void
    + calculateTotal(): double
}

class CartItem {
    - product: Product
    - quantity: int
    - price: double
    + CartItem(product: Product, quantity: int)
    + getSubtotal(): double
}

class Order {
    - orderId: String
    - customer: Customer
    - items: List<OrderItem>
    - shippingAddress: Address
    - status: OrderStatus
    - totalAmount: double
    - discount: double
    - tax: double
    - orderDate: DateTime
    - payment: Payment
    + Order(customer: Customer)
    + addItem(orderItem: OrderItem): void
    + calculateTotal(): double
    + applyDiscount(coupon: Coupon): void
    + cancel(): boolean
}

class OrderItem {
    - product: Product
    - quantity: int
    - price: double
    - seller: Seller
    + OrderItem(product: Product, quantity: int)
    + getSubtotal(): double
}

class Payment {
    - paymentId: String
    - order: Order
    - amount: double
    - method: PaymentMethod
    - status: PaymentStatus
    - transactionId: String
    - timestamp: DateTime
    + Payment(order: Order, amount: double, method: PaymentMethod)
    + process(): boolean
    + refund(): boolean
}

interface PaymentProcessor {
    + processPayment(payment: Payment): boolean
    + refundPayment(payment: Payment): boolean
}

class CreditCardProcessor {
    + processPayment(payment: Payment): boolean
    + refundPayment(payment: Payment): boolean
}

class PayPalProcessor {
    + processPayment(payment: Payment): boolean
    + refundPayment(payment: Payment): boolean
}

class Coupon {
    - couponCode: String
    - discountPercentage: double
    - maxDiscount: double
    - minOrderAmount: double
    - expiryDate: Date
    - usageLimit: int
    - usedCount: int
    + Coupon(code: String, discount: double)
    + isValid(): boolean
    + apply(orderAmount: double): double
}

class Shipment {
    - shipmentId: String
    - order: Order
    - trackingNumber: String
    - carrier: String
    - shippedDate: DateTime
    - estimatedDelivery: DateTime
    - actualDelivery: DateTime
    + Shipment(order: Order)
    + updateStatus(status: String): void
    + track(): String
}

interface SearchStrategy {
    + search(query: String): List<Product>
}

class NameSearchStrategy {
    + search(query: String): List<Product>
}

class CategorySearchStrategy {
    + search(category: ProductCategory): List<Product>
}

class ProductCatalog {
    - products: Map<String, Product>
    - inventory: Map<String, ProductInventory>
    - searchStrategy: SearchStrategy
    + addProduct(product: Product, quantity: int): void
    + removeProduct(productId: String): boolean
    + searchProducts(query: String): List<Product>
    + getProductsByCategory(category: ProductCategory): List<Product>
    + checkInventory(productId: String, quantity: int): boolean
}

class OrderService {
    - orders: Map<String, Order>
    - catalog: ProductCatalog
    - paymentProcessor: PaymentProcessor
    + createOrder(customer: Customer, cart: ShoppingCart): Order
    + processPayment(order: Order, method: PaymentMethod): Payment
    + cancelOrder(orderId: String): boolean
    + trackOrder(orderId: String): Shipment
    - validateInventory(order: Order): boolean
}

class NotificationService {
    + sendOrderConfirmation(order: Order): void
    + sendShipmentNotification(shipment: Shipment): void
    + sendDeliveryNotification(order: Order): void
}

Customer o-- Address
Customer o-- ShoppingCart
Customer o-- Order
Seller o-- Product : sells
Product *-- ProductCategory
Product o-- Review : has
ProductInventory o-- Product : tracks
Review o-- Customer
Review o-- Product
ShoppingCart o-- Customer
ShoppingCart o-- CartItem : contains
CartItem o-- Product
Order o-- Customer
Order o-- OrderItem : contains
Order o-- Address : ships to
Order *-- OrderStatus
Order o-- Payment
OrderItem o-- Product
OrderItem o-- Seller
Payment *-- PaymentMethod
Payment *-- PaymentStatus
PaymentProcessor <|.. CreditCardProcessor
PaymentProcessor <|.. PayPalProcessor
Payment *-- PaymentProcessor : uses
Shipment o-- Order
SearchStrategy <|.. NameSearchStrategy
SearchStrategy <|.. CategorySearchStrategy
ProductCatalog o-- Product : manages
ProductCatalog o-- ProductInventory : manages
ProductCatalog *-- SearchStrategy : uses
OrderService o-- Order : manages
OrderService *-- ProductCatalog : composed of
OrderService *-- PaymentProcessor : composed of
OrderService *-- NotificationService : composed of

@enduml
```

## Key Design Patterns

1. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: ProductCatalog, OrderService
2. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different search and payment strategies
3. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Create orders and payments
4. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Notifications for order updates
5. **[State Pattern](/low-level-design/patterns/behavioural-patterns/#state-pattern)**: Order status management

### Design Pattern Diagrams

#### 1. Strategy Pattern - Search & Payment Strategies

```plantuml
@startuml

title Strategy Pattern - Search and Payment

interface ISearchStrategy {
  + search(query, products): List<Product>
}

class NameSearchStrategy {
  + search(query, products): List<Product>
}

class CategorySearchStrategy {
  + search(query, products): List<Product>
}

class PriceRangeSearchStrategy {
  - minPrice: double
  - maxPrice: double
  + search(query, products): List<Product>
}

interface IPaymentProcessor {
  + processPayment(amount, details): PaymentResult
  + refund(transactionId, amount): boolean
}

class CreditCardProcessor {
  + processPayment(amount, details): PaymentResult
  + validateCard(cardDetails): boolean
}

class PayPalProcessor {
  + processPayment(amount, details): PaymentResult
  + redirectToPayPal(): String
}

class CryptoProcessor {
  + processPayment(amount, details): PaymentResult
  + getWalletAddress(): String
}

class ProductCatalog {
  - searchStrategy: ISearchStrategy
  + setSearchStrategy(ISearchStrategy): void
  + searchProducts(query): List<Product>
}

class OrderService {
  - paymentProcessor: IPaymentProcessor
  + setPaymentProcessor(IPaymentProcessor): void
  + processPayment(order): PaymentResult
}

ISearchStrategy <|.. NameSearchStrategy
ISearchStrategy <|.. CategorySearchStrategy
ISearchStrategy <|.. PriceRangeSearchStrategy

IPaymentProcessor <|.. CreditCardProcessor
IPaymentProcessor <|.. PayPalProcessor
IPaymentProcessor <|.. CryptoProcessor

ProductCatalog *-- ISearchStrategy
OrderService *-- IPaymentProcessor

note bottom of ProductCatalog
  **Code Example - Search:**
  
  ProductCatalog catalog = new ProductCatalog();
  
  // Search by name
  catalog.setSearchStrategy(new NameSearchStrategy());
  List<Product> laptops = catalog.searchProducts("laptop");
  
  // Search by category
  catalog.setSearchStrategy(new CategorySearchStrategy());
  List<Product> electronics = catalog.searchProducts("ELECTRONICS");
  
  // Search by price range
  catalog.setSearchStrategy(
    new PriceRangeSearchStrategy(100, 500)
  );
  List<Product> affordable = catalog.searchProducts("");
  
  // Combine strategies (Composite pattern)
  catalog.setSearchStrategy(
    new CompositeSearchStrategy(
      new NameSearchStrategy(),
      new PriceRangeSearchStrategy(0, 1000)
    )
  );
end note

note bottom of OrderService
  **Code Example - Payment:**
  
  OrderService orderService = new OrderService();
  
  // Customer selects payment method
  String paymentMethod = order.getPaymentMethod();
  
  switch (paymentMethod) {
    case "CREDIT_CARD":
      orderService.setPaymentProcessor(
        new CreditCardProcessor()
      );
      break;
    case "PAYPAL":
      orderService.setPaymentProcessor(
        new PayPalProcessor()
      );
      break;
    case "CRYPTO":
      orderService.setPaymentProcessor(
        new CryptoProcessor()
      );
      break;
  }
  
  PaymentResult result = orderService.processPayment(order);
  
  if (result.isSuccess()) {
    order.confirm();
  }
end note

@enduml
```

#### 2. State Pattern - Order Status Management

```plantuml
@startuml

title State Pattern - Order Lifecycle

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  RETURNED
}

class Order {
  - orderId: String
  - status: OrderStatus
  + confirm(): void
  + startProcessing(): void
  + ship(trackingNumber): void
  + deliver(): void
  + cancel(): void
  + return(): void
  + canCancel(): boolean
  + canReturn(): boolean
  - transitionTo(OrderStatus): void
  - validateTransition(OrderStatus): void
}

class OrderStateMachine {
  - allowedTransitions: Map<OrderStatus, Set<OrderStatus>>
  + isValidTransition(from, to): boolean
  + getNextStates(current): Set<OrderStatus>
}

Order *-- OrderStatus
Order o-- OrderStateMachine

note right of OrderStatus
  **State Flow:**
  
  PENDING -> CONFIRMED (payment success)
  CONFIRMED -> PROCESSING (warehouse picks items)
  PROCESSING -> SHIPPED (courier pickup)
  SHIPPED -> DELIVERED (customer receives)
  
  PENDING -> CANCELLED (payment failed)
  CONFIRMED -> CANCELLED (within cancellation window)
  DELIVERED -> RETURNED (within return period)
end note

note bottom of Order
  **Code Example:**
  
  Order order = new Order(customer, items);
  // Status: PENDING
  
  // Payment successful
  if (paymentResult.isSuccess()) {
      order.confirm();
      // Status: PENDING -> CONFIRMED
  }
  
  // Warehouse picks order
  order.startProcessing();
  // Status: CONFIRMED -> PROCESSING
  
  // Shipped with tracking
  order.ship("TRACK123456");
  // Status: PROCESSING -> SHIPPED
  // Notification sent with tracking info
  
  // Delivered
  order.deliver();
  // Status: SHIPPED -> DELIVERED
  
  // Customer can cancel only before shipping
  if (order.canCancel()) {  // true if PENDING or CONFIRMED
      order.cancel();
      paymentService.refund(order);
  }
  
  // Customer can return within 30 days
  if (order.canReturn()) {  // true if DELIVERED and < 30 days
      order.return();
      // Status: DELIVERED -> RETURNED
      // Refund initiated after return received
  }
  
  // Invalid transitions throw exception
  order.ship();  // IllegalStateException if status != PROCESSING
end note

@enduml
```

#### 3. Observer Pattern - Order Notifications

```plantuml
@startuml

title Observer Pattern - Order Events

interface IOrderObserver {
  + onOrderCreated(order): void
  + onOrderConfirmed(order): void
  + onOrderShipped(order, trackingNumber): void
  + onOrderDelivered(order): void
  + onOrderCancelled(order): void
}

class Order {
  - observers: List<IOrderObserver>
  + addObserver(IOrderObserver): void
  + removeObserver(IOrderObserver): void
  + confirm(): void
  + ship(trackingNumber): void
  - notifyObservers(event, data): void
}

class EmailNotificationService {
  + onOrderConfirmed(order): void
  + onOrderShipped(order, trackingNumber): void
  + onOrderDelivered(order): void
  - sendEmail(customer, template, order): void
}

class SMSNotificationService {
  + onOrderShipped(order, trackingNumber): void
  + onOrderDelivered(order): void
  - sendSMS(phoneNumber, message): void
}

class InventoryService {
  + onOrderConfirmed(order): void
  + onOrderCancelled(order): void
  - updateStock(product, quantity): void
  - releaseReservedStock(order): void
}

class AnalyticsService {
  + onOrderCreated(order): void
  + onOrderConfirmed(order): void
  + onOrderCancelled(order): void
  - trackEvent(eventName, properties): void
}

class LoyaltyPointsService {
  + onOrderDelivered(order): void
  - awardPoints(customer, amount): void
}

Order o-- "*" IOrderObserver
IOrderObserver <|.. EmailNotificationService
IOrderObserver <|.. SMSNotificationService
IOrderObserver <|.. InventoryService
IOrderObserver <|.. AnalyticsService
IOrderObserver <|.. LoyaltyPointsService

note bottom of Order
  **Code Example:**
  
  Order order = new Order(customer, cartItems);
  
  // Register all observers
  order.addObserver(new EmailNotificationService());
  order.addObserver(new SMSNotificationService());
  order.addObserver(new InventoryService());
  order.addObserver(new AnalyticsService());
  order.addObserver(new LoyaltyPointsService());
  
  // Order confirmed - notifies all observers
  order.confirm();
  
  // Each observer reacts:
  // 1. EmailNotificationService:
  //    "Your order #12345 is confirmed!"
  // 2. InventoryService:
  //    Deducts stock for each item
  // 3. AnalyticsService:
  //    Tracks conversion, revenue
  
  // Order shipped
  order.ship("TRACK-XYZ-789");
  // - Email: "Your order has shipped! Track: TRACK-XYZ-789"
  // - SMS: "Package shipped. Track at: link.com/TRACK-XYZ-789"
  
  // Order delivered
  order.deliver();
  // - Email: "Your order has been delivered. Enjoy!"
  // - SMS: "Package delivered"
  // - LoyaltyPoints: Award 100 points
  // - Analytics: Track completion rate
  
  // Easy to add new functionality
  order.addObserver(new RecommendationService());
  // Now order events trigger product recommendations too
end note

@enduml
```

## Code Snippets

### Add to Cart

:::note
Checks inventory before adding items. Handles quantity updates for existing items and automatically recalculates cart total.
:::

```java title="ShoppingCart.java" {4-6,9,12-14,17-20,24-27}
public class ShoppingCart {
    public void addItem(Product product, int quantity) throws CartException {
        // Check inventory availability
        if (!catalog.checkInventory(product.getProductId(), quantity)) {
            throw new CartException("Insufficient inventory");
        }
        
        // Check if product already in cart
        CartItem existingItem = findItem(product.getProductId());
        
        if (existingItem != null) {
            // Update quantity
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            // Add new item
            CartItem item = new CartItem(product, quantity);
            item.setPrice(product.getPrice());
            items.add(item);
        }
        
        // Recalculate total
        calculateTotal();
    }
    
    public double calculateTotal() {
        totalAmount = items.stream()
            .mapToDouble(CartItem::getSubtotal)
            .sum();
        return totalAmount;
    }
}
```

### Create Order

:::note
Atomically creates order by reserving inventory for each item. Implements automatic rollback on failure to maintain data consistency.
:::

```java title="OrderService.java" {4,6-8,19-24,27-30,36-37,43,47,50-53}
public class OrderService {
    public Order createOrder(Customer customer, ShoppingCart cart) throws OrderException {
        synchronized(this) {
            if (cart.getItems().isEmpty()) {
                throw new OrderException("Cart is empty");
            }
            
            // Create order
            Order order = new Order(customer);
            order.setOrderDate(DateTime.now());
            
            // Validate and reserve inventory
            for (CartItem cartItem : cart.getItems()) {
                Product product = cartItem.getProduct();
                int quantity = cartItem.getQuantity();
                
                ProductInventory inventory = catalog.getInventory(product.getProductId());
                
                if (!inventory.reserve(quantity)) {
                    // Rollback previous reservations
                    rollbackReservations(order);
                    throw new OrderException("Product unavailable: " + product.getName());
                }
                
                // Create order item
                OrderItem orderItem = new OrderItem(product, quantity);
                orderItem.setPrice(product.getPrice());
                orderItem.setSeller(product.getSeller());
                order.addItem(orderItem);
            }
            
            // Calculate totals
            order.calculateTotal();
            order.setStatus(OrderStatus.PENDING);
            
            // Save order
            orders.put(order.getOrderId(), order);
            
            // Clear cart
            cart.clear();
            
            return order;
        }
    }
    
    private void rollbackReservations(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductInventory inventory = catalog.getInventory(
                item.getProduct().getProductId());
            inventory.release(item.getQuantity());
        }
    }
}
```

### Process Payment

```java
public class OrderService {
    public Payment processPayment(Order order, PaymentMethod method) 
            throws PaymentException {
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new PaymentException("Order not in pending state");
        }
        
        // Create payment
        Payment payment = new Payment(order, order.getTotalAmount(), method);
        
        // Select payment processor
        PaymentProcessor processor = getPaymentProcessor(method);
        
        try {
            // Process payment
            if (processor.processPayment(payment)) {
                payment.setStatus(PaymentStatus.COMPLETED);
                order.setPayment(payment);
                order.setStatus(OrderStatus.CONFIRMED);
                
                // Deduct from inventory
                deductInventory(order);
                
                // Create shipment
                createShipment(order);
                
                // Send confirmation
                notificationService.sendOrderConfirmation(order);
                
                return payment;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                releaseInventory(order);
                throw new PaymentException("Payment processing failed");
            }
        } catch (Exception e) {
            payment.setStatus(PaymentStatus.FAILED);
            releaseInventory(order);
            throw new PaymentException("Payment error: " + e.getMessage());
        }
    }
    
    private void deductInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductInventory inventory = catalog.getInventory(
                item.getProduct().getProductId());
            inventory.deduct(item.getQuantity());
        }
    }
    
    private void releaseInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductInventory inventory = catalog.getInventory(
                item.getProduct().getProductId());
            inventory.release(item.getQuantity());
        }
    }
}
```

### Apply Coupon

```java
public class Order {
    public void applyDiscount(Coupon coupon) throws OrderException {
        if (!coupon.isValid()) {
            throw new OrderException("Coupon is invalid or expired");
        }
        
        if (totalAmount < coupon.getMinOrderAmount()) {
            throw new OrderException("Order amount below minimum for this coupon");
        }
        
        double discountAmount = coupon.apply(totalAmount);
        this.discount = discountAmount;
        
        // Recalculate total
        calculateTotal();
        
        // Increment usage count
        coupon.incrementUsage();
    }
    
    public double calculateTotal() {
        double subtotal = items.stream()
            .mapToDouble(OrderItem::getSubtotal)
            .sum();
        
        double taxAmount = subtotal * 0.10; // 10% tax
        totalAmount = subtotal - discount + taxAmount;
        
        return totalAmount;
    }
}
```

### Search Products

```java
public class ProductCatalog {
    public List<Product> searchProducts(String query) {
        return products.values().stream()
            .filter(p -> p.getName().toLowerCase().contains(query.toLowerCase())
                      || p.getDescription().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
    }
    
    public List<Product> getProductsByCategory(ProductCategory category) {
        return products.values().stream()
            .filter(p -> p.getCategory() == category)
            .collect(Collectors.toList());
    }
    
    public List<Product> getProductsByPriceRange(double minPrice, double maxPrice) {
        return products.values().stream()
            .filter(p -> p.getPrice() >= minPrice && p.getPrice() <= maxPrice)
            .collect(Collectors.toList());
    }
}
```

### Inventory Management

```java
public class ProductInventory {
    public synchronized boolean reserve(int quantity) {
        if (availableQuantity >= quantity) {
            availableQuantity -= quantity;
            reservedQuantity += quantity;
            return true;
        }
        return false;
    }
    
    public synchronized void release(int quantity) {
        reservedQuantity -= quantity;
        availableQuantity += quantity;
    }
    
    public synchronized boolean deduct(int quantity) {
        if (reservedQuantity >= quantity) {
            reservedQuantity -= quantity;
            return true;
        }
        return false;
    }
    
    public boolean needsReorder() {
        return (availableQuantity + reservedQuantity) <= reorderLevel;
    }
}
```

## Extension Points

1. Add recommendation engine based on browsing history
2. Implement flash sales and limited-time offers
3. Add product comparison feature
4. Support subscription-based products
5. Implement seller dashboard and analytics
6. Add customer support chat system
7. Support international shipping and multi-currency
8. Implement loyalty points and rewards program
9. Add product availability notifications
10. Support bundle deals and combo offers
