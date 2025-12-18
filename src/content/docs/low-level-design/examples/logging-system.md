---
title: Logging System
description: Low-Level Design for a Logging System
---

## Problem Statement

Design a flexible and extensible logging system that allows applications to log messages with different severity levels to various destinations (console, file, database, etc.). The system should support log formatting, filtering by log levels, and easy configuration of multiple log destinations.

## Requirements

### Functional Requirements
1. Support multiple log levels: DEBUG, INFO, WARNING, ERROR, FATAL
2. Allow logging to multiple destinations (console, file, remote server)
3. Support custom log message formatting
4. Enable filtering logs based on severity level
5. Thread-safe logging operations
6. Support both synchronous and asynchronous logging
7. Allow runtime configuration of log levels and destinations

### Non-Functional Requirements
1. High performance with minimal overhead
2. Thread-safe for concurrent logging
3. Extensible to add new log destinations
4. Memory efficient for high-volume logging
5. Easy to integrate and use

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Core" {
    [Logger] as Logger
    [LogMessage] as Msg
}

package "Configuration" {
    [LoggerConfig] as Config
    [LoggerFactory] as Factory
}

package "Formatting" {
    interface "ILogFormatter" as Formatter
    [SimpleFormatter]
    [JsonFormatter]
}

package "Destinations" {
    interface "ILogDestination" as Dest
    [ConsoleDestination]
    [FileDestination]
    [DatabaseDestination]
}

package "Processing" {
    interface "IMessageProcessor" as Processor
    [SynchronousProcessor]
    [AsynchronousProcessor]
}

[LoggerDriver] --> Factory : uses
Factory --> Logger : creates
Logger *-- Config : composed of
Logger *-- Processor : composed of
Logger ..> Msg : creates
Config o-- Formatter : aggregates
Config o-- Dest : aggregates
Formatter <|.. SimpleFormatter
Formatter <|.. JsonFormatter
Dest <|.. ConsoleDestination
Dest <|.. FileDestination
Dest <|.. DatabaseDestination
Processor <|.. SynchronousProcessor
Processor <|.. AsynchronousProcessor

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum LogLevel {
    DEBUG
    INFO
    WARNING
    ERROR
    FATAL
    + getValue(): int
    + isMoreSevereThan(other: LogLevel): boolean
}

class LogMessage {
    - timestamp: DateTime
    - level: LogLevel
    - message: String
    - threadId: String
    - className: String
    - context: Map<String, Object>
    + LogMessage(level: LogLevel, message: String)
    + getTimestamp(): DateTime
    + getLevel(): LogLevel
    + getMessage(): String
    + addContext(key: String, value: Object): void
}

interface ILogFormatter {
    + format(message: LogMessage): String
}

class SimpleFormatter {
    - dateFormat: String
    + SimpleFormatter()
    + format(message: LogMessage): String
}

class JsonFormatter {
    - includeContext: boolean
    + JsonFormatter(includeContext: boolean)
    + format(message: LogMessage): String
}

class XmlFormatter {
    + format(message: LogMessage): String
}

interface ILogDestination {
    + write(formattedMessage: String): void
    + flush(): void
    + close(): void
}

class ConsoleDestination {
    - outputStream: PrintStream
    + ConsoleDestination()
    + write(formattedMessage: String): void
    + flush(): void
    + close(): void
}

class FileDestination {
    - filePath: String
    - writer: BufferedWriter
    - maxFileSize: long
    + FileDestination(filePath: String)
    + write(formattedMessage: String): void
    + flush(): void
    + close(): void
    - rotateFile(): void
}

class DatabaseDestination {
    - connectionProvider: IConnectionProvider
    + DatabaseDestination(provider: IConnectionProvider)
    + write(formattedMessage: String): void
    + flush(): void
    + close(): void
}

interface IConnectionProvider {
    + getConnection(): Connection
    + releaseConnection(conn: Connection): void
}

interface ILogFilter {
    + shouldLog(message: LogMessage): boolean
}

class LevelFilter {
    - minLevel: LogLevel
    + LevelFilter(minLevel: LogLevel)
    + shouldLog(message: LogMessage): boolean
}

class ThreadFilter {
    - allowedThreads: Set<String>
    + shouldLog(message: LogMessage): boolean
}

class LoggerConfig {
    - formatter: ILogFormatter
    - destinations: List<ILogDestination>
    - filters: List<ILogFilter>
    + LoggerConfig()
    + setFormatter(formatter: ILogFormatter): LoggerConfig
    + addDestination(destination: ILogDestination): LoggerConfig
    + addFilter(filter: ILogFilter): LoggerConfig
    + getFormatter(): ILogFormatter
    + getDestinations(): List<ILogDestination>
    + getFilters(): List<ILogFilter>
}

interface ILogger {
    + debug(message: String): void
    + info(message: String): void
    + warning(message: String): void
    + error(message: String): void
    + fatal(message: String): void
    + log(level: LogLevel, message: String): void
}

class Logger {
    - config: LoggerConfig
    - messageProcessor: IMessageProcessor
    + Logger(config: LoggerConfig, processor: IMessageProcessor)
    + debug(message: String): void
    + info(message: String): void
    + warning(message: String): void
    + error(message: String): void
    + fatal(message: String): void
    + log(level: LogLevel, message: String): void
    - shouldLog(message: LogMessage): boolean
}

interface IMessageProcessor {
    + process(message: LogMessage, config: LoggerConfig): void
}

class SynchronousProcessor {
    + process(message: LogMessage, config: LoggerConfig): void
}

class AsynchronousProcessor {
    - messageQueue: BlockingQueue<LogMessage>
    - workerThread: Thread
    - running: AtomicBoolean
    + AsynchronousProcessor()
    + process(message: LogMessage, config: LoggerConfig): void
    + start(): void
    + stop(): void
    - processQueue(): void
}

class LoggerFactory {
    - {static} instance: LoggerFactory
    - loggers: Map<String, ILogger>
    - defaultConfig: LoggerConfig
    - LoggerFactory()
    + {static} getInstance(): LoggerFactory
    + createLogger(name: String): ILogger
    + createLogger(name: String, config: LoggerConfig): ILogger
    + setDefaultConfig(config: LoggerConfig): void
}

class LoggerDriver {
    + {static} main(args: String[]): void
    - demonstrateBasicLogging(): void
    - demonstrateAsyncLogging(): void
    - demonstrateMultipleDestinations(): void
}

LogMessage *-- LogLevel

ILogFormatter <|.. SimpleFormatter
ILogFormatter <|.. JsonFormatter
ILogFormatter <|.. XmlFormatter

ILogDestination <|.. ConsoleDestination
ILogDestination <|.. FileDestination
ILogDestination <|.. DatabaseDestination

DatabaseDestination o-- IConnectionProvider

ILogFilter <|.. LevelFilter
ILogFilter <|.. ThreadFilter

LoggerConfig o-- ILogFormatter
LoggerConfig o-- ILogDestination
LoggerConfig o-- ILogFilter

ILogger <|.. Logger
Logger *-- LoggerConfig : composed of
Logger *-- IMessageProcessor : composed of
Logger ..> LogMessage : creates

IMessageProcessor <|.. SynchronousProcessor
IMessageProcessor <|.. AsynchronousProcessor

LoggerFactory ..> ILogger : creates
LoggerFactory o-- LoggerConfig

LoggerDriver ..> LoggerFactory : uses
LoggerDriver ..> LoggerConfig : configures
LoggerDriver ..> ILogFormatter : configures
LoggerDriver ..> ILogDestination : configures

@enduml
```

## Key Design Patterns

1. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: Logger class ensures only one instance exists
2. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: LogFormatter and LogDestination use strategy pattern for flexible implementations
3. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Multiple destinations can subscribe to log events
4. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Can be used to create different types of loggers

### Design Pattern Diagrams

#### 1. Strategy Pattern - Formatters & Destinations

```plantuml
@startuml
title Strategy Pattern in Logging System

interface ILogFormatter {
  + format(LogEntry): String
}

note right of ILogFormatter
  Strategy Pattern allows switching
  formatting behavior at runtime
  without changing Logger code
end note

class SimpleFormatter {
  + format(LogEntry): String
}

class JSONFormatter {
  + format(LogEntry): String
}

class XMLFormatter {
  + format(LogEntry): String
}

class Logger {
  - formatter: ILogFormatter
  + setFormatter(ILogFormatter): void
  + log(LogLevel, String): void
}

ILogFormatter <|.. SimpleFormatter
ILogFormatter <|.. JSONFormatter
ILogFormatter <|.. XMLFormatter
Logger o-- ILogFormatter : uses

note bottom of Logger
  **Code Example:**
  
  // Switch formatters at runtime
  logger.setFormatter(new JSONFormatter());
  logger.log(INFO, "User logged in");
  
  // Output: {"level":"INFO","message":"User logged in"}
  
  logger.setFormatter(new SimpleFormatter());
  logger.log(INFO, "User logged out");
  
  // Output: [INFO] User logged out
end note

@enduml
```

#### 2. Observer Pattern - Multiple Destinations

```plantuml
@startuml
title Observer Pattern - Log Destinations

class Logger {
  - destinations: List<ILogDestination>
  + addDestination(ILogDestination): void
  + removeDestination(ILogDestination): void
  + log(LogLevel, String): void
  - notifyDestinations(LogEntry): void
}

note top of Logger
  Observer Pattern: Logger notifies
  all registered destinations when
  a log event occurs
end note

interface ILogDestination {
  + write(LogEntry): void
}

class ConsoleDestination {
  + write(LogEntry): void
}

class FileDestination {
  - filePath: String
  + write(LogEntry): void
}

class DatabaseDestination {
  - connection: Connection
  + write(LogEntry): void
}

Logger o-- "*" ILogDestination : notifies >
ILogDestination <|.. ConsoleDestination
ILogDestination <|.. FileDestination
ILogDestination <|.. DatabaseDestination

note bottom of Logger
  **Code Example:**
  
  Logger logger = Logger.getInstance();
  logger.addDestination(new ConsoleDestination());
  logger.addDestination(new FileDestination("app.log"));
  logger.addDestination(new DatabaseDestination());
  
  // Single log call notifies all 3 destinations
  logger.log(ERROR, "Database connection failed");
  // -> Console: [ERROR] Database connection failed
  // -> File: Appends to app.log
  // -> Database: Inserts into logs table
end note

@enduml
```

#### 3. Factory Pattern - Logger Creation

```plantuml
@startuml

title Factory Pattern - Logger Factory

class LoggerFactory {
  + {static} createLogger(LoggerConfig): Logger
  + {static} createConsoleLogger(): Logger
  + {static} createFileLogger(String): Logger
  + {static} createProductionLogger(): Logger
}

class Logger {
  - formatter: ILogFormatter
  - destinations: List<ILogDestination>
  - filters: List<ILogFilter>
  + log(LogLevel, String): void
}

class LoggerConfig {
  - minLogLevel: LogLevel
  - destinations: List<ILogDestination>
  - formatter: ILogFormatter
}

LoggerFactory ..> Logger : creates
LoggerFactory ..> LoggerConfig : uses

note right of LoggerFactory
  **Code Example:**
  
  // Simple console logger
  Logger devLogger = LoggerFactory.createConsoleLogger();
  
  // File logger with rotation
  Logger fileLogger = LoggerFactory.createFileLogger("app.log");
  
  // Production logger: File + Database + Email alerts
  Logger prodLogger = LoggerFactory.createProductionLogger();
  
  // Custom configuration
  LoggerConfig config = new LoggerConfig();
  config.setMinLogLevel(LogLevel.WARN);
  config.addDestination(new SlackDestination());
  Logger customLogger = LoggerFactory.createLogger(config);
end note

@enduml
```

## Code Snippets

### Basic Usage

```java title="LoggerUsageExample.java"
// Configure logger
LoggerConfig config = new LoggerConfig();
config.setMinLogLevel(LogLevel.DEBUG);
config.addDestination(new ConsoleDestination());
config.addDestination(new FileDestination("app.log"));
config.setFormatter(new SimpleFormatter());

// Get logger instance
Logger logger = Logger.getInstance();
logger.setConfig(config);

// Use logger
logger.info("Application started");
logger.error("Error occurred: " + errorMessage);
logger.debug("Debug information: " + debugData);
```

### Custom Log Formatter

:::note
Implement custom formatting logic by implementing the `LogFormatter` interface. Here we format logs as JSON for structured logging.
:::

```java title="JsonFormatter.java" {3-11}
public class JsonFormatter implements LogFormatter {
    @Override
    public String format(LogMessage message) {
        return String.format(
            "{\"timestamp\":\"%s\",\"level\":\"%s\",\"message\":\"%s\",\"thread\":\"%s\"}",
            message.getTimestamp(),
            message.getLevel(),
            message.getMessage(),
            message.getThreadId()
        );
    }
}
```

## Extension Points

1. Add new log destinations (Kafka, Redis, Cloud services)
2. Implement custom formatters (XML, custom protocols)
3. Add log filtering based on custom criteria
4. Implement log rotation and archival strategies
5. Add log aggregation and analysis capabilities
