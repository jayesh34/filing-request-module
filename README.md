**Submitted by:** [Jayesh Ishi]

# Filing Request Submission Module

A full-stack module for customs brokers to submit, view, update, and delete customs filing requests. Built for the Neximprove Full Stack Internship task (Task Option 2).

## Tech Stack

- **Frontend:** React
- **Backend:** Express (Node.js)
- **Database:** MySQL

## Project Structure

filing-request-module/
├── filing-request-backend/ # Express API server
│ ├── Controller/
│ │ └── filingController.js
│ ├── routes/
│ │ └── filingRoutes.js
│ ├── db.js
│ └── server.js
├── filing-request-frontend/ # React application
│ └── src/
│ ├── components/
│ │ ├── FilingForm.js
│ │ └── FilingList.js
│ └── App.js
└── postman/ # Postman collection for API testing

## How to Run

### Backend

1. Navigate to the backend folder:
```bash
   cd filing-request-backend
```
2. Install dependencies:
```bash
   npm install
```
3. Create a `.env` file with the following (adjust values as needed):

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Preet@123
DB_NAME=filingdb
PORT=5000

4. Create the database and table in MySQL:
```sql
   CREATE DATABASE filingdb;
   USE filingdb;

   CREATE TABLE filings (
       id INT AUTO_INCREMENT PRIMARY KEY,
       shipment_id VARCHAR(100) NOT NULL,
       invoice_no VARCHAR(100) NOT NULL,
       value DECIMAL(12, 2) NOT NULL,
       items VARCHAR(500) NOT NULL,
       port VARCHAR(100),
       status VARCHAR(50) DEFAULT 'PENDING',
       submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
   );
```
5. Start the server:
```bash
   node server.js
```
   Server runs on `http://localhost:5000`.

### Frontend

1. Navigate to the frontend folder:
```bash
   cd filing-request-frontend
```
2. Install dependencies:
```bash
   npm install
```
3. Start the app:
```bash
   npm start
```
   App runs on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/filings` | Create a new filing |
| GET | `/api/filings` | Get all filings |
| GET | `/api/filings/:id` | Get a single filing by ID |
| PUT | `/api/filings/:id` | Update an existing filing |
| DELETE | `/api/filings/:id` | Delete a filing |

## Design Decisions

- **Form fields:** The form includes exactly the fields listed in the task brief — Shipment ID, Invoice Number, Value, and Items. The `port` column exists in the database (as specified in the data model) but is not part of the form input, since the brief's form-fields list didn't include it; it remains unused in this MVP.

- **Status flow:** A filing is created with status `PENDING`, then a simulated EDI webhook (the bonus feature) determines the outcome — `SUBMITTED` (~85% of the time) or `FAILED` (~15%) — mirroring how a real customs EDI gateway would acknowledge or reject a submission, rather than hardcoding a single status.

- **Duplicate prevention:** Invoice numbers are checked for uniqueness before insert, returning a `409 Conflict` if a filing with the same invoice number already exists.

- **Validation:** Required fields are enforced on both frontend and backend; `value` is validated as a positive number on both ends as well.

- **Line items:** The brief hints at structured invoice line-item handling (RES/ICEGATE reference) but doesn't require it explicitly. For this MVP, `items` is a simple text field; a production version would model line items as a separate table (item name, quantity, HS code, value) linked to each filing.

- **Security:** All SQL queries use parameterized placeholders to prevent SQL injection. Secrets (DB credentials) are kept in a `.env` file, excluded from version control.

- **Out of scope (by design):** Authentication/authorization, automated tests, and pagination were intentionally left out, as the brief didn't require them and the task timeline didn't allow for them without compromising the core CRUD flow. A production version would add JWT-based auth (similar to my other full-stack project) and `LIMIT`/`OFFSET`-based pagination on the list endpoint.

## Bonus Feature: EDI Submission Simulation

On every filing creation, a simulated webhook call logs a dummy EDI submission and acknowledgment to the console, and updates the filing's status based on the (simulated) outcome — demonstrating the trigger pattern a real EDI integration would follow.

## Testing

All endpoints were tested using Postman (collection included in `/postman`). Screenshots of the request/response flow and the running application are included in the submission.