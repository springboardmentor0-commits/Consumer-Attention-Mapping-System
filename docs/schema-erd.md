# Database Schema Entity-Relationship Diagram

This document contains the Entity-Relationship Diagram (ERD) describing the database schema for the Consumer Attention Mapping System.

```mermaid
erDiagram
    roles {
        int id PK
        string name UK "SuperAdmin, StoreManager, Analyst, MarketingManager, Admin"
    }

    users {
        uuid id PK
        string email UK
        string hashed_password
        int role_id FK
        boolean is_active
        timestamp created_at
    }

    stores {
        uuid id PK
        string name
        string location
        json metadata
        timestamp created_at
    }

    shelves {
        uuid id PK
        uuid store_id FK "ON DELETE CASCADE"
        string shelf_name
        json zone_coordinates
        timestamp created_at
    }

    roles ||--o{ users : "assigned to"
    stores ||--o{ shelves : "contains"
```

## Description of Relations and Cardinalities

1. **`roles` to `users` (`1:N`)**:
   * A **Role** can be assigned to zero, one, or many **Users** (`||--o{`).
   * A **User** must have exactly one **Role** (`}o--||`).

2. **`stores` to `shelves` (`1:N` with Cascade Delete)**:
   * A **Store** can contain zero, one, or many **Shelves** (`||--o{`).
   * A **Shelf** must belong to exactly one **Store** (`}o--||`).
   * Deleting a **Store** automatically cascade-deletes all its associated **Shelves** in the database.
