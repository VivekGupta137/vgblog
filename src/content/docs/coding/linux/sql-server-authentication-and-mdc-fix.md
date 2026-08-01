---
title: Sql Server Authentication And Mdc Fix
---

# SQL Server Authentication & Migration Data Collector Login Fix

## Problem Statement

The Migration Data Collector (MDC) service was failing with:

```
Cannot open database "Anet2Migration" requested by the login. The login failed.
Login failed for user 'LABWEBAPP\svcmdc'.
Error Number: 4060, State: 1, Class: 11
```

Followed by:

```
The server principal "LABWEBAPP\svcmdc" is not able to access the database "Auth30" under the current security context.
```

The service worked in one environment but not another, despite both having the login at the server level.

---

## Root Cause

The databases (`Anet2Migration` and `Auth30`) had **orphaned users** — database-level user principals that existed but were not mapped to the correct server-level login. This typically happens after a database restore from a different server where the login SIDs differ.

---

## Fix Applied

### Step 1: Remap orphaned user in Anet2Migration

```sql
USE Anet2Migration;
ALTER USER [MigrationDataCollectorUser] WITH LOGIN = [LABWEBAPP\svcmdc];
```

### Step 2: Remap orphaned user in Auth30

```sql
USE Auth30;
ALTER USER [MigrationDataCollectorUser] WITH LOGIN = [LABWEBAPP\svcmdc];
```

### Step 3: Verify roles were intact

```sql
USE Auth30;
SELECT dp.name AS user_name, r.name AS role_name
FROM sys.database_role_members drm
JOIN sys.database_principals dp ON drm.member_principal_id = dp.principal_id
JOIN sys.database_principals r ON drm.role_principal_id = r.principal_id
WHERE SUSER_SNAME(dp.sid) = 'LABWEBAPP\svcmdc';
```

Roles confirmed: `db_datareader` and `Approle` on Auth30; appropriate roles on Anet2Migration.

---

## How SQL Server Authentication Works

### Two-Level Security Model

SQL Server uses a **two-level** authentication and authorization model:

```
┌─────────────────────────────────────────────────────┐
│  SQL Server Instance (Server Level)                 │
│                                                     │
│  sys.server_principals  ←  Logins live here         │
│  ┌───────────────────┐                              │
│  │ LABWEBAPP\svcmdc  │  (Windows Login)             │
│  │ sa                 │  (SQL Login)                 │
│  │ LABWEBAPP\DBAdmins│  (Windows Group)             │
│  └───────────────────┘                              │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  Database: Anet2Migration (Database Level)  │    │
│  │                                             │    │
│  │  sys.database_principals  ← Users live here │    │
│  │  ┌─────────────────────────────────┐        │    │
│  │  │ MigrationDataCollectorUser      │        │    │
│  │  │   → mapped to LABWEBAPP\svcmdc  │        │    │
│  │  │   → member of db_datareader     │        │    │
│  │  └─────────────────────────────────┘        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Authentication Flow

1. **Connection**: Client connects to SQL Server with credentials (Windows or SQL auth).
2. **Server-level authentication**: SQL Server checks `sys.server_principals` — does a matching login exist? If not → connection refused.
3. **Database access**: Client requests a specific database (e.g., `Anet2Migration`). SQL Server checks `sys.database_principals` in that database — is there a user mapped to this login's SID? If not → Error 4060.
4. **Authorization**: Once inside the database, permissions are checked via roles and explicit grants.

### Windows Integrated Authentication (SSPI)

When the connection string uses `Integrated Security=SSPI`:
- The application authenticates as the **Windows identity** running the process (the IIS app pool identity in this case: `LABWEBAPP\svcmdc`).
- No username/password is in the connection string — credentials come from the OS-level token.
- SQL Server validates the Windows token and matches it to a login in `sys.server_principals`.

### The SID Link

The **SID (Security Identifier)** is the critical link between a server login and a database user:

- Each login in `sys.server_principals` has a SID.
- Each user in `sys.database_principals` also stores a SID.
- SQL Server matches them: "this database user **is** that server login."

When these SIDs don't match (orphaned user), the login authenticates at the server level but can't access the database.

---

## Key System Tables Explained

### sys.server_principals

Server-level catalog view. Contains all server-level security principals:

| Column | Meaning |
|--------|---------|
| `name` | Login name (e.g., `LABWEBAPP\svcmdc`) |
| `principal_id` | Unique ID within the server |
| `sid` | Security Identifier — the unique binary value that ties login to database users |
| `type_desc` | `SQL_LOGIN`, `WINDOWS_LOGIN`, `WINDOWS_GROUP`, `SERVER_ROLE` |
| `is_disabled` | Whether the login is disabled |

### sys.database_principals

Database-level catalog view. Contains all users, roles, and groups within a specific database:

| Column | Meaning |
|--------|---------|
| `name` | User name within this database (can differ from login name) |
| `principal_id` | Unique ID within the database |
| `sid` | SID that maps back to a login in `sys.server_principals` |
| `type_desc` | `SQL_USER`, `WINDOWS_USER`, `WINDOWS_GROUP`, `DATABASE_ROLE` |
| `default_schema_name` | Default schema for this user (typically `dbo`) |

### sys.database_role_members

Maps users to their database roles:

| Column | Meaning |
|--------|---------|
| `role_principal_id` | The role (look up name in `sys.database_principals`) |
| `member_principal_id` | The user who belongs to this role |

### sys.database_permissions

Explicit permissions granted within a database:

| Column | Meaning |
|--------|---------|
| `grantee_principal_id` | Who has the permission |
| `permission_name` | `SELECT`, `EXECUTE`, `CONNECT`, etc. |
| `state_desc` | `GRANT`, `DENY`, `REVOKE` |
| `major_id` | Object the permission applies to (use `OBJECT_NAME()` to resolve) |

---

## What is an Orphaned User?

An orphaned user occurs when:
- A database is restored/moved to a different server.
- The user entry in `sys.database_principals` still has the **old** SID from the original server.
- The login on the new server has a **different** SID (even though the name is the same).

Result: SQL Server can't match the database user to any server login → access denied.

### Detecting Orphaned Users

```sql
-- Users with no matching server login
USE Anet2Migration;
SELECT dp.name, dp.type_desc, dp.sid
FROM sys.database_principals dp
LEFT JOIN sys.server_principals sp ON dp.sid = sp.sid
WHERE dp.type IN ('S', 'U')
AND sp.sid IS NULL
AND dp.name NOT IN ('dbo', 'guest', 'INFORMATION_SCHEMA', 'sys');
```

### Fixing Orphaned Users

```sql
-- Remap to the correct login
ALTER USER [UserName] WITH LOGIN = [LoginName];
```

---

## How Access Can Work Without an Explicit Database User

In the working environment, even though we initially thought there was no user, access can be granted through several mechanisms (listed in order of likelihood):

1. **Explicit user mapping** (with a different name) — This was our case. The user `MigrationDataCollectorUser` was mapped to `LABWEBAPP\svcmdc`.
2. **sysadmin server role** — Members can access any database without a user mapping.
3. **Windows group membership** — If an AD group has a user in the database and the login is a member of that group.
4. **Guest user enabled** — If `guest` has `CONNECT` permission, any authenticated login can access the database.
5. **Database ownership** — The login that owns a database maps implicitly to `dbo`.

---

## Diagnostic Queries Cheat Sheet

```sql
-- 1. Does the login exist on the server?
SELECT name, type_desc, is_disabled
FROM sys.server_principals
WHERE name = 'LABWEBAPP\svcmdc';

-- 2. What server roles does it have?
SELECT r.name AS server_role
FROM sys.server_role_members srm
JOIN sys.server_principals sp ON srm.member_principal_id = sp.principal_id
JOIN sys.server_principals r ON srm.role_principal_id = r.principal_id
WHERE sp.name = 'LABWEBAPP\svcmdc';

-- 3. Is the login mapped to a user in the target database?
USE <DatabaseName>;
SELECT name, type_desc, default_schema_name
FROM sys.database_principals
WHERE sid = SUSER_SID('LABWEBAPP\svcmdc');

-- 4. What database roles does the user have?
USE <DatabaseName>;
SELECT dp.name AS user_name, r.name AS role_name
FROM sys.database_role_members drm
JOIN sys.database_principals dp ON drm.member_principal_id = dp.principal_id
JOIN sys.database_principals r ON drm.role_principal_id = r.principal_id
WHERE SUSER_SNAME(dp.sid) = 'LABWEBAPP\svcmdc';

-- 5. What explicit permissions does the user have?
USE <DatabaseName>;
SELECT perm.permission_name, perm.state_desc, OBJECT_NAME(perm.major_id) AS object_name
FROM sys.database_permissions perm
JOIN sys.database_principals dp ON perm.grantee_principal_id = dp.principal_id
WHERE SUSER_SNAME(dp.sid) = 'LABWEBAPP\svcmdc';

-- 6. Who owns the database?
SELECT name, SUSER_SNAME(owner_sid) AS db_owner
FROM sys.databases
WHERE name = '<DatabaseName>';

-- 7. What AD groups grant access?
EXEC xp_logininfo 'LABWEBAPP\svcmdc', 'all';

-- 8. Find all orphaned users in a database
USE <DatabaseName>;
SELECT dp.name, dp.sid
FROM sys.database_principals dp
LEFT JOIN sys.server_principals sp ON dp.sid = sp.sid
WHERE dp.type IN ('S', 'U')
AND sp.sid IS NULL
AND dp.name NOT IN ('dbo', 'guest', 'INFORMATION_SCHEMA', 'sys');
```

---

## Connection String Breakdown

```
Data Source=DBPrimary;Integrated Security=SSPI;database=Anet2Migration;Application Name=MigrationDataCollector;Packet Size=4096;
```

| Parameter | Meaning |
|-----------|---------|
| `Data Source=DBPrimary` | Server hostname (resolved via DNS/hosts file — different server per environment) |
| `Integrated Security=SSPI` | Use Windows auth (app pool identity), no SQL username/password |
| `database=Anet2Migration` | Initial database to connect to |
| `Application Name=MigrationDataCollector` | Identifies the app in SQL Server activity monitors |
| `Packet Size=4096` | Network packet size for communication |

---

## Lessons Learned

1. **Always check by SID, not by name** — Database users can have different names than their mapped login.
2. **Database restores break user mappings** — After restoring a database to a new server, always check for orphaned users.
3. **Error 4060 means "login OK, database access denied"** — The login authenticated successfully but has no user mapping in the requested database.
4. **Cross-database queries require access to all databases** — MDC queries both `Anet2Migration` and `Auth30`, so the service account needs user mappings in both.

---

[← Linux](/coding/linux/)
