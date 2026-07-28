**Submitted by:** [Jayesh Ishi]

# Filing Request Submission Module

**Repository:** https://github.com/jayesh34/filing-request-module.git

A CRUD-based module for submitting and managing customs filing requests, built for the Neximprove Full Stack Internship task.

## Tech Stack

- Frontend: React
- Backend: Express (Node.js)
- Database: MySQL

## Project Structure
```
filing-request-module/
├── filing-request-backend/      
│   ├── Controller/
│   │   └── filingController.js
│   ├── routes/
│   │   └── filingRoutes.js
│   ├── db.js
│   └── server.js
├── filing-request-frontend/     
│   └── src/
│       ├── components/
│       │   ├── FilingForm.js
│       │   └── FilingList.js
│       └── App.js
└── postman/                    
```
## Setup

### Backend

```bash
cd filing-request-backend
npm install
```

Create a `.env` file in this folder:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Preet@123
DB_NAME=filingdb
PORT=5000

Run this in MySQL to set up the database:
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

Start the server:
```bash
node server.js
```
Runs on `http://localhost:5000`.

### Frontend

```bash
cd filing-request-frontend
npm install
npm start
```
Runs on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/filings` | Create a filing |
| GET | `/api/filings` | Get all filings |
| GET | `/api/filings/:id` | Get one filing |
| PUT | `/api/filings/:id` | Update a filing |
| DELETE | `/api/filings/:id` | Delete a filing |

## Notes on how I built this

The form only has the four fields the brief asked for — Shipment ID, Invoice Number, Value, Items. The `port` column is in the table since the data model listed it, but nothing writes to it since it wasn't part of the form fields, so it just stays empty for now.

For the bonus EDI simulation, I didn't want to just hardcode the status to "submitted" every time — felt too fake. So a filing starts as PENDING, then the simulated webhook decides SUBMITTED or FAILED (mostly SUBMITTED, occasionally FAILED), similar to how an actual EDI gateway would ack or reject something after you send it.

I added a duplicate check on invoice number too — wasn't explicitly asked for, but letting the same invoice get filed twice didn't seem right, so a repeat invoice number now gets rejected with a 409.

The brief mentions invoice line items possibly needing more structure (referencing RES/ICEGATE), but building out a whole separate line-items table felt like overkill for this scope, so `items` is just a text field for now. In a real version I'd probably split that into its own table (item name, qty, HS code, etc.) linked to the filing.

Didn't add auth, tests, or pagination — none of these were asked for in the brief, and adding them properly would've taken time away from getting the core flow solid. If this were a real production feature I'd add JWT auth and paginate the filings list once the data grows.

All the SQL queries use parameterized placeholders (no string concatenation), and DB credentials are in a gitignored `.env` file.

## Bonus Feature

When a filing is created, a simulated EDI webhook logs a dummy submission + response to the console and updates the filing's status based on that outcome.

## Testing

Tested all endpoints in Postman — collection is in `/postman`. Screenshots of the requests and the running app are attached with the submission.