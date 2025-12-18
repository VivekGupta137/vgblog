---
title: Notification System
description: Low level design for a Notification System
---

## Problem Statement

Design a flexible notification system that can send various types of notifications (e.g., email, SMS, push notifications) to users.

## Requirements

- The system should support multiple notification channels (Email, SMS, Push).
- Users can subscribe/unsubscribe to different types of notifications.
- The system should allow for scheduling notifications.
- It should handle different notification templates.
- Notifications should be trackable (sent, failed, delivered, read).
- The system should be scalable to handle a large volume of notifications.

## Class Diagram

```plantuml
@startuml
interface NotificationService {
  + sendNotification(notification: Notification): boolean
}

class NotificationManager implements NotificationService {
  - channelAdapters: Map<NotificationChannel, NotificationSender>
  - templateEngine: TemplateEngine
  - notificationRepository: NotificationRepository
  + sendNotification(notification: Notification): boolean
  + scheduleNotification(notification: Notification, scheduleTime: Date): boolean
}

class Notification {
  - id: String
  - userId: String
  - channel: NotificationChannel
  - type: NotificationType
  - subject: String
  - body: String
  - templateName: String
  - data: Map<String, String>
  - status: NotificationStatus
  - sentTime: Date
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
}

enum NotificationType {
  TRANSACTIONAL
  PROMOTIONAL
  ALERT
}

enum NotificationStatus {
  CREATED
  SCHEDULED
  SENDING
  SENT
  DELIVERED
  FAILED
}

interface NotificationSender {
  + send(notification: Notification): boolean
}

class EmailSender implements NotificationSender {
  + send(notification: Notification): boolean
}

class SMSSender implements NotificationSender {
  + send(notification: Notification): boolean
}

class PushNotificationSender implements NotificationSender {
  + send(notification: Notification): boolean
}

class TemplateEngine {
  + render(templateName: String, data: Map<String, String>): String
}

interface NotificationRepository {
  + save(notification: Notification): void
  + updateStatus(notificationId: String, status: NotificationStatus): void
  + findById(notificationId: String): Notification
}

class DbNotificationRepository implements NotificationRepository {
  + save(notification: Notification): void
  + updateStatus(notificationId: String, status: NotificationStatus): void
  + findById(notificationId: String): Notification
}

NotificationManager o-- NotificationSender
NotificationManager o-- TemplateEngine
NotificationManager o-- NotificationRepository
NotificationManager "1" *-- "many" NotificationChannel
Notification ..> NotificationChannel
Notification ..> NotificationType
Notification ..> NotificationStatus
NotificationSender <|.. EmailSender
NotificationSender <|.. SMSSender
NotificationSender <|.. PushNotificationSender
NotificationRepository <|.. DbNotificationRepository
@enduml
```

## Code Snippets

### NotificationManager

The central component to manage and send notifications.

```java
public class NotificationManager implements NotificationService {
    private final Map<NotificationChannel, NotificationSender> channelAdapters;
    private final TemplateEngine templateEngine;
    private final NotificationRepository notificationRepository;

    public NotificationManager(Map<NotificationChannel, NotificationSender> channelAdapters,
                               TemplateEngine templateEngine,
                               NotificationRepository notificationRepository) {
        this.channelAdapters = channelAdapters;
        this.templateEngine = templateEngine;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public boolean sendNotification(Notification notification) {
        notification.setStatus(NotificationStatus.SENDING);
        notificationRepository.save(notification);

        // Render template if present
        if (notification.getTemplateName() != null && !notification.getTemplateName().isEmpty()) {
            String renderedBody = templateEngine.render(notification.getTemplateName(), notification.getData());
            notification.setBody(renderedBody);
        }

        NotificationSender sender = channelAdapters.get(notification.getChannel());
        if (sender != null) {
            boolean success = sender.send(notification);
            notification.setStatus(success ? NotificationStatus.SENT : NotificationStatus.FAILED);
            notification.setSentTime(new Date());
            notificationRepository.updateStatus(notification.getId(), notification.getStatus());
            return success;
        }
        notification.setStatus(NotificationStatus.FAILED);
        notificationRepository.updateStatus(notification.getId(), notification.getStatus());
        return false;
    }

    public boolean scheduleNotification(Notification notification, Date scheduleTime) {
        notification.setStatus(NotificationStatus.SCHEDULED);
        notification.setSentTime(scheduleTime); // Use this field for scheduleTime
        notificationRepository.save(notification);
        // In a real system, this would involve adding the notification to a queue
        // processed by a scheduler service.
        return true;
    }
}
```

### EmailSender

An example implementation for sending emails.

```java
public class EmailSender implements NotificationSender {
    @Override
    public boolean send(Notification notification) {
        System.out.println("Sending email to: " + notification.getUserId());
        System.out.println("Subject: " + notification.getSubject());
        System.out.println("Body: " + notification.getBody());
        // Simulate actual email sending
        return Math.random() > 0.1; // 90% success rate
    }
}
```
