# Andrea360 – Fitness Center Management System

### Fullstack Challenge

Andrea360 is a full-stack web application for managing a fitness center.
The system enables managing locations, employees, members, services and sessions, purchasing services via Stripe, and booking sessions with real-time capacity updates.

This project was developed as part of the Andrea360 Fullstack Challenge.

## Goal of the Project
The goal of this project is to build a mini system for fitness center management that enables:
- Creating locations, services, and sessions
- Purchasing services via Stripe (test mode)
- Booking sessions with automatic real-time updates of remaining capacity
- Secure access through authentication
- Complete API documentation and local setup via Docker

## Domain & Roles:

### Administrator
- Creates and manages locations
- Creates and manages employees per location
- Has access to all employee functionalities

### Employee
- Creates members
- Creates services (trainings) for their location
- Creates and manages sessions
- Manages reservations and monitors session capacity

### Member
- Can purchase one or more services (Stripe test mode)
- Can reserve sessions only if a service is purchased
- Each reservation consumes one purchased service
- Can view own reservations and purchases

## Service Purchase (Stripe)
Stripe integration is implemented in test mode.
After a successful payment:
- Transaction data is stored
- Purchase is linked to the member
- Payments are required before session reservation

## Tech Stack:

### Backend
Java, Spring Boot,
Spring Security,
PostgreSQL,
Stripe API,
OpenAPI / Swagger

### Frontend
React,
TypeScript

### Infrastructure
Docker,
Docker Compose

## Running the Application Locally
Prerequisites: 
- Docker Desktop (only required dependency)

### Steps:
- git clone <REPOSITORY_URL>
- cd Andrea360
- docker compose up --build

After startup, the application is available at:
 - Frontend: http://localhost:3000
 - Backend API: http://localhost:8082
 - Swagger (OpenAPI): http://localhost:8082/swagger-ui/index.html
No additional installations or manual configuration are required.

## Stripe Test Cards
The application uses Stripe test mode.
Successful Payment
 - Card number: 4242 4242 4242 4242
 - Expiration date: any future date (e.g. 12/34)
 - CVC: any 3 digits (e.g. 123)
 - ZIP / Postal code: any value
No real payments are processed.

## API Documentation & Postman Collection

### Swagger (OpenAPI)
All backend endpoints are documented using Swagger:
 - http://localhost:8082/swagger-ui/index.html
  
### Postman Collection
A Postman collection is included in the repository:
 - /postman/Andrea360.postman_collection.json

The collection was generated directly from the OpenAPI specification and can also be imported from:
 - http://localhost:8082/v3/api-docs
  

Author: 
Andjela Mrdja
