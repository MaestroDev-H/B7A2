# DevPulse API

A professional modular backend built with Express, TypeScript, and PostgreSQL (NeonDB) for tracking bugs and feature requests.

## Live URL
- **Backend API:** 

## Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database:** PostgreSQL (Cloud hosted on NeonDB)
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt

## Key Features
- **Modular Architecture:** Fully structured using clean controllers, routes, and middlewares.
- **Strict Authentication:** Password hashing using Bcrypt and stateful route protection via JWT.
- **Role-Based Access Control (RBAC):** Distinct workflow privileges for `contributor` and `maintainer` roles.
- **Database Scalability:** Uses Node-Postgres connection pooling to interface efficiently with cloud database clusters.
- **Global Error Handling:** Centralized custom middleware preventing server failure and formatting semantic validation payloads.

## Database Schema Summary
The database consists of two core transactional tables:
1. **users:** Stores registered entities with attributes for `id`, `name`, `email`, `password` (hashed), and `role` (enum: contributor, maintainer).
2. **issues:** Tracks task lifecycles with fields for `id`, `title`, `description`, `type` (enum: bug, feature_request), `status` (enum: open, in_progress, resolved), and `reporter_id` (foreign key mapping back to users).

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MaestroDev-H/B7A2
   cd b7a2