---
title: 03 Processor Integration Lld
---

# Processor Integration — Low Level Design

A payment gateway must integrate with multiple card processors (Visa/Mastercard networks via different acquirers, PayPal, Braintree, etc.) and adapt to different API formats. Three patterns work together: Strategy for swapping processor implementations, Adapter for wrapping legacy or incompatible processor APIs, and Facade for presenting a single simple interface to the transaction engine.

---

## Section 1: Strategy Pattern — Processor Routing

:::tip[Intent]
Define a family of processor implementations (VisaNetProcessor, MastercardProcessor, PayPalProcessor, AchProcessor) and make them interchangeable. The transaction engine selects and uses the correct processor strategy without knowing its internals.
:::

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

interface PaymentProcessor {
    + authorize(AuthorizationRequest): AuthorizationResponse
    + capture(CaptureRequest): CaptureResponse
    + void_(VoidRequest): VoidResponse
    + refund(RefundRequest): RefundResponse
    + getProcessorType(): ProcessorType
}

enum ProcessorType {
    VISA_NET
    MASTERCARD
    AMEX
    PAYPAL
    ACH
}

class VisaNetProcessor implements PaymentProcessor
class MastercardProcessor implements PaymentProcessor
class PayPalProcessor implements PaymentProcessor
class AchProcessor implements PaymentProcessor

class ProcessorRouter {
    - routingRules: Map<ProcessorType, PaymentProcessor>
    + route(Transaction): PaymentProcessor
    - determineProcessor(Transaction): ProcessorType
}

note right of ProcessorRouter::route
  reads card BIN →
  determines card network →
  returns correct processor
end note

ProcessorRouter --> PaymentProcessor : routes to
ProcessorRouter --> ProcessorType : uses
@enduml
```

:::note[Use Strategy for Processor Routing When]
- Each card processor has a different API format, authentication method, and response code scheme
- New processors (e.g., a regional acquirer) must be added without modifying existing processor logic
- You need to route different transaction types to different processors (cards to card network, ACH to bank network)
- A/B testing: route 10% of Visa transactions to a new acquirer to compare approval rates
:::

```java
// PaymentProcessor.java
public interface PaymentProcessor {
    AuthorizationResponse authorize(AuthorizationRequest request);
    CaptureResponse capture(CaptureRequest request);
    VoidResponse void_(VoidRequest request);
    RefundResponse refund(RefundRequest request);
    ProcessorType getProcessorType();
}
```

```java
// AuthorizationRequest.java
public class AuthorizationRequest {
    private final String transactionId;
    private final BigDecimal amount;
    private final String currency;
    private final PaymentMethod paymentMethod;
    private final BillingAddress billingAddress;
    private final String merchantId;
    private final String customerIp;
    // constructor + getters
}
```

```java
// AuthorizationResponse.java
public class AuthorizationResponse {
    private final boolean approved;
    private final String authCode;
    private final String processorTransactionId;
    private final String declineCode;
    private final String avsResult;
    private final String cvvResult;
    // constructor + getters
}
```

```java collapse={1-6}
// VisaNetProcessor.java
public class VisaNetProcessor implements PaymentProcessor {
    private final VisaNetClient visaNetClient;
    private final MessageFormatter formatter;

    public VisaNetProcessor(VisaNetClient visaNetClient, MessageFormatter formatter) {
        this.visaNetClient = visaNetClient;
        this.formatter = formatter;
    }

    @Override
    public AuthorizationResponse authorize(AuthorizationRequest request) {
        // Build ISO 8583 message for Visa network
        Iso8583Message message = formatter.buildAuthorizationMessage(request);
        Iso8583Response response = visaNetClient.send(message);
        return formatter.parseAuthorizationResponse(response);
    }

    @Override
    public CaptureResponse capture(CaptureRequest request) {
        Iso8583Message message = formatter.buildCaptureMessage(request);
        Iso8583Response response = visaNetClient.send(message);
        return formatter.parseCaptureResponse(response);
    }

    @Override
    public ProcessorType getProcessorType() { return ProcessorType.VISA_NET; }

    // void_ and refund implementations omitted for brevity
}
```

```java {14,18}
// ProcessorRouter.java
public class ProcessorRouter {
    private final Map<ProcessorType, PaymentProcessor> processors;
    private final BinLookupService binLookupService;

    public ProcessorRouter(Map<ProcessorType, PaymentProcessor> processors,
                            BinLookupService binLookupService) {
        this.processors = processors;
        this.binLookupService = binLookupService;
    }

    public PaymentProcessor route(Transaction transaction) {
        ProcessorType type = determineProcessorType(transaction);
        PaymentProcessor processor = processors.get(type);
        if (processor == null) {
            throw new UnsupportedProcessorException("No processor registered for " + type);
        }
        return processor;
    }

    private ProcessorType determineProcessorType(Transaction transaction) {
        String bin = transaction.getPaymentMethod().getCardNumber().substring(0, 8);
        CardNetwork network = binLookupService.lookupNetwork(bin);

        return switch (network) {
            case VISA -> ProcessorType.VISA_NET;
            case MASTERCARD -> ProcessorType.MASTERCARD;
            case AMEX -> ProcessorType.AMEX;
            case PAYPAL -> ProcessorType.PAYPAL;
            default -> throw new UnsupportedCardNetworkException(network.name());
        };
    }
}
```

:::success[Advantages]
- **Isolated test surface**: each processor can be unit tested with a mock without touching others
- **Zero-downtime processor swap**: route 0% to old processor, 100% to new without code changes
- **Independent deployment**: `VisaNetProcessor` changes deploy without touching `MastercardProcessor`
:::

:::caution[Disadvantages]
- **Response code normalization**: each processor has unique decline codes; the router must normalize them into a common `DeclineCode` enum — ongoing maintenance as processors change their codes
- **Configuration complexity**: routing rules must cover all card BIN ranges, edge cases, and fallbacks
:::

---

## Section 2: Adapter Pattern — Legacy Processor Integration

:::tip[Intent]
Some payment processors have legacy or incompatible APIs that don't match the `PaymentProcessor` interface. The Adapter wraps the legacy API and translates calls from the gateway's interface into the format the legacy system understands — without modifying either side.
:::

Problem: the gateway uses `PaymentProcessor` interface everywhere. But `LegacyBankGateway` has a completely different API — different method names, different request format, different response format:

```java {3}
// LegacyBankGateway.java — the Adaptee (cannot be modified)
public class LegacyBankGateway {
    private long lastReferenceNumber;

    public void submitTransaction(double totalAmount, String currencyCode, String cardData) {
        System.out.println("LegacyGateway: submitting " + currencyCode + " " + totalAmount);
        this.lastReferenceNumber = System.currentTimeMillis(); // simulated reference
    }

    public boolean verifyTransactionStatus(long referenceNumber) {
        System.out.println("LegacyGateway: checking status for ref " + referenceNumber);
        return true; // simulated approval
    }

    public long getLastReferenceNumber() {
        return lastReferenceNumber;
    }

    public void reverseTransaction(long referenceNumber) {
        System.out.println("LegacyGateway: reversing ref " + referenceNumber);
    }
}
```

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

interface PaymentProcessor <<Target>> {
    + authorize(AuthorizationRequest): AuthorizationResponse
    + capture(CaptureRequest): CaptureResponse
    + void_(VoidRequest): VoidResponse
    + refund(RefundRequest): RefundResponse
    + getProcessorType(): ProcessorType
}

class LegacyBankGateway <<Adaptee>> {
    + submitTransaction(double, String, String)
    + verifyTransactionStatus(long): boolean
    + getLastReferenceNumber(): long
    + reverseTransaction(long)
}

class LegacyBankGatewayAdapter implements PaymentProcessor {
    - legacyGateway: LegacyBankGateway
    + authorize(AuthorizationRequest): AuthorizationResponse
    + capture(CaptureRequest): CaptureResponse
    + void_(VoidRequest): VoidResponse
    + refund(RefundRequest): RefundResponse
}

LegacyBankGatewayAdapter o--> LegacyBankGateway : wraps

note on link
  authorize() →
  submitTransaction() +
  verifyTransactionStatus()
  returns AuthorizationResponse
end note
@enduml
```

:::note[Method translation in the Adapter]
Each method in `PaymentProcessor` is translated into one or more calls to the legacy API:
1. Renaming: `authorize()` → `submitTransaction()` + `verifyTransactionStatus()`
2. Type conversion: `BigDecimal amount` → `double totalAmount`
3. State tracking: `lastReferenceNumber` must be stored in the adapter between calls
4. Response mapping: `boolean` success → `AuthorizationResponse` object
:::

```java {3,5}
// LegacyBankGatewayAdapter.java
public class LegacyBankGatewayAdapter implements PaymentProcessor {
    private final LegacyBankGateway legacyGateway;  // holds instance of adaptee
    private long currentReferenceNumber;

    public LegacyBankGatewayAdapter(LegacyBankGateway legacyGateway) {
        this.legacyGateway = legacyGateway;
    }

    @Override
    public AuthorizationResponse authorize(AuthorizationRequest request) {
        // Translate: BigDecimal → double, PaymentMethod → cardData string
        String cardData = formatCardData(request.getPaymentMethod());
        double amount = request.getAmount().doubleValue();

        legacyGateway.submitTransaction(amount, request.getCurrency(), cardData);
        currentReferenceNumber = legacyGateway.getLastReferenceNumber();

        boolean approved = legacyGateway.verifyTransactionStatus(currentReferenceNumber);

        return AuthorizationResponse.builder()
                .approved(approved)
                .processorTransactionId("LEGACY_" + currentReferenceNumber)
                .authCode(approved ? String.valueOf(currentReferenceNumber) : null)
                .declineCode(approved ? null : "LEGACY_DECLINED")
                .build();
    }

    @Override
    public VoidResponse void_(VoidRequest request) {
        long ref = Long.parseLong(request.getProcessorTransactionId().replace("LEGACY_", ""));
        legacyGateway.reverseTransaction(ref);
        return new VoidResponse(true, "LEGACY_" + ref + "_REVERSED");
    }

    @Override
    public CaptureResponse capture(CaptureRequest request) {
        // Legacy gateway uses auto-capture — capture is a no-op
        return new CaptureResponse(true, request.getTransactionId(), request.getAmount());
    }

    @Override
    public RefundResponse refund(RefundRequest request) {
        long ref = Long.parseLong(request.getProcessorTransactionId().replace("LEGACY_", ""));
        legacyGateway.reverseTransaction(ref);
        return new RefundResponse(true, "LEGACY_REFUND_" + ref);
    }

    @Override
    public ProcessorType getProcessorType() { return ProcessorType.LEGACY_BANK; }

    private String formatCardData(PaymentMethod pm) {
        return pm.getCardNumber() + "|" + pm.getExpiryMonth() + "/" + pm.getExpiryYear();
    }
}
```

Usage — the transaction engine never knows it's talking to a legacy gateway:

```java
// No changes to TransactionEngine — it uses PaymentProcessor interface
PaymentProcessor legacyProcessor = new LegacyBankGatewayAdapter(new LegacyBankGateway());
processorRouter.register(ProcessorType.LEGACY_BANK, legacyProcessor);

// ProcessorRouter selects it when a merchant is configured to use LEGACY_BANK
```

:::success[Advantages]
- **Zero changes to existing code**: `TransactionEngine` and `ProcessorRouter` are unchanged
- **Incremental migration**: run legacy and new processors in parallel; migrate merchants one at a time
- **Clean isolation**: all the ugly translation code is in one class — easy to find and update
:::

:::caution[Disadvantages]
- **State leakage risk**: `currentReferenceNumber` is instance state — adapter must be request-scoped or thread-safe
- **Partial translation**: if the legacy API doesn't support partial refunds, the adapter must simulate it or throw `UnsupportedOperationException`
:::

---

## Section 3: Facade Pattern — Payment Processing API

:::tip[Intent]
Provide a single simplified interface (`PaymentGatewayFacade`) that hides the complexity of coordinating the processor router, fraud engine, MLE decryption service, transaction repository, and event publisher. The merchant-facing API controller calls one method; the facade orchestrates all subsystems.
:::

Without a Facade, the API controller would need to:
1. Decrypt the MLE-encrypted card data → calls `MleDecryptionService`
2. Look up merchant config → calls `MerchantConfigService`
3. Write PENDING transaction → calls `TransactionRepository`
4. Check for duplicates → calls `DuplicateDetectionService`
5. Run fraud evaluation → calls `FraudPipeline`
6. Route to processor → calls `ProcessorRouter`
7. Call the processor → calls `PaymentProcessor`
8. Update transaction with result → calls `TransactionRepository`
9. Publish events → calls `FraudEventPublisher`

This couples the controller to 7+ subsystems.

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

class PaymentGatewayFacade {
    + processPayment(PaymentRequest): PaymentResult
    + capturePayment(CaptureRequest): CaptureResult
    + voidPayment(VoidRequest): VoidResult
    + refundPayment(RefundRequest): RefundResult
}

class MleDecryptionService
class MerchantConfigService
class DuplicateDetectionService
class FraudPipeline
class ProcessorRouter
class TransactionRepository
class FraudEventPublisher

class PaymentApiController {
    + createTransaction(PaymentRequest): ResponseEntity
}

PaymentApiController --> PaymentGatewayFacade : calls

PaymentGatewayFacade --> MleDecryptionService
PaymentGatewayFacade --> MerchantConfigService
PaymentGatewayFacade --> DuplicateDetectionService
PaymentGatewayFacade --> FraudPipeline
PaymentGatewayFacade --> ProcessorRouter
PaymentGatewayFacade --> TransactionRepository
PaymentGatewayFacade --> FraudEventPublisher

note right of PaymentGatewayFacade
  processPayment():
  1. Decrypt MLE payload
  2. Load merchant config
  3. Duplicate check
  4. Write PENDING record
  5. Fraud evaluation
  6. Route to processor
  7. Call processor.authorize()
  8. Update transaction
  9. Publish fraud event
end note
@enduml
```

:::note[The Facade Pattern solves this by]
- Providing ONE entry point (`PaymentGatewayFacade`) that knows about all subsystems
- The controller just calls `facade.processPayment(request)` and gets a result
- The orchestration logic lives in the facade, not scattered across controllers
- Each subsystem (fraud engine, processor router) can still be used directly by other services that need granular access
:::

```java {8}
// PaymentGatewayFacade.java
public class PaymentGatewayFacade {
    private final MleDecryptionService mleDecryptionService;
    private final MerchantConfigService merchantConfigService;
    private final DuplicateDetectionService duplicateDetector;
    private final FraudPipeline fraudPipeline;
    private final ProcessorRouter processorRouter;
    private final TransactionRepository transactionRepository;  // write-before-call
    private final FraudEventPublisher eventPublisher;

    // Constructor injection (Spring @Autowired or manual)
    public PaymentGatewayFacade(MleDecryptionService mle, MerchantConfigService config,
                                  DuplicateDetectionService dedup, FraudPipeline fraud,
                                  ProcessorRouter router, TransactionRepository repo,
                                  FraudEventPublisher publisher) {
        this.mleDecryptionService = mle;
        this.merchantConfigService = config;
        this.duplicateDetector = dedup;
        this.fraudPipeline = fraud;
        this.processorRouter = router;
        this.transactionRepository = repo;
        this.eventPublisher = publisher;
    }

    public PaymentResult processPayment(PaymentRequest request) {
        // Step 1: Decrypt MLE-encrypted card data
        PaymentMethod decryptedMethod = mleDecryptionService.decrypt(request.getEncryptedPayload());

        // Step 2: Load merchant config (from cache)
        MerchantConfig config = merchantConfigService.load(request.getMerchantId());

        // Step 3: Idempotency / duplicate check
        Optional<Transaction> existing = duplicateDetector.findDuplicate(request);
        if (existing.isPresent()) {
            return PaymentResult.fromExisting(existing.get());
        }

        // Step 4: Write PENDING record (write-before-call)
        Transaction transaction = transactionRepository.insertPending(request, config);

        // Step 5: Fraud evaluation
        FraudContext fraudContext = new FraudContext(transaction, config, request.getCustomerIp());
        FilterResult fraudResult = fraudPipeline.evaluate(fraudContext);

        if (fraudResult.getAction() == FraudAction.DECLINE) {
            transactionRepository.updateDeclined(transaction.getId(), fraudResult.getReason());
            return PaymentResult.declined(transaction.getId(), fraudResult.getReason());
        }

        // Step 6: Route to processor and authorize
        PaymentProcessor processor = processorRouter.route(transaction);
        AuthorizationRequest authRequest = buildAuthRequest(transaction, decryptedMethod);
        AuthorizationResponse authResponse = processor.authorize(authRequest);

        // Step 7: Update transaction record with result
        transactionRepository.updateResponse(transaction.getId(), authResponse);

        // Step 8: Publish fraud event if held
        if (fraudResult.getAction() == FraudAction.AUTH_AND_HOLD) {
            eventPublisher.publish(new FraudEvent(FraudEventType.TRANSACTION_HELD,
                    transaction.getId(), request.getMerchantId(), fraudResult.getTriggeredBy(),
                    FraudAction.AUTH_AND_HOLD, Instant.now()));
        }

        return PaymentResult.from(transaction, authResponse);
    }
}
```

```java collapse={1-4}
// PaymentApiController.java — clean, no subsystem dependencies
@RestController
public class PaymentApiController {
    private final PaymentGatewayFacade gateway;

    public PaymentApiController(PaymentGatewayFacade gateway) {
        this.gateway = gateway;
    }

    @PostMapping("/v1/transactions")
    public ResponseEntity<PaymentResult> createTransaction(@RequestBody PaymentRequest request) {
        PaymentResult result = gateway.processPayment(request);
        int status = result.isApproved() ? 201 : 402;
        return ResponseEntity.status(status).body(result);
    }
}
```

:::success[Advantages]
- **Simple controller**: the API controller has ONE dependency and ONE method call — easy to read, test, and maintain
- **Centralized orchestration**: the 9-step sequence is in one place — when a step changes, one file changes
- **Testable facade**: the facade can be tested by mocking its 7 dependencies independently
:::

:::caution[Disadvantages]
- **God object risk**: the facade can grow to handle every edge case — resist adding business logic into it; it should only orchestrate
- **Hidden complexity**: subsystems CAN still be used directly; the facade doesn't prevent bypassing it
:::

Final wiring example showing how all three patterns compose:

```java
// Application startup wiring
LegacyBankGateway legacyGateway = new LegacyBankGateway();
LegacyBankGatewayAdapter legacyAdapter = new LegacyBankGatewayAdapter(legacyGateway); // Adapter

Map<ProcessorType, PaymentProcessor> processors = Map.of(           // Strategy
    ProcessorType.VISA_NET, new VisaNetProcessor(visaNetClient, formatter),
    ProcessorType.MASTERCARD, new MastercardProcessor(mcClient, formatter),
    ProcessorType.LEGACY_BANK, legacyAdapter                        // Adapter plugs into Strategy
);
ProcessorRouter router = new ProcessorRouter(processors, binLookupService);

PaymentGatewayFacade facade = new PaymentGatewayFacade(             // Facade
    mleService, merchantConfigService, duplicateDetector,
    fraudPipeline, router, transactionRepository, eventPublisher
);
```

---

[← Payment Gateway LLD](/learnings/payment-gateway/lld/)
