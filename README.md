# MedSimplify AI

### AI-Powered Medical Report Simplifier

MedSimplify AI is a full-stack web application that uses OCR, artificial intelligence, and a structured database to help users understand medical reports in simple language.

## Problem

Medical reports often contain complex medical terminology, abbreviations, laboratory values, and reference ranges that can be difficult for non-medical users to understand.

MedSimplify AI converts uploaded medical reports into structured and easier-to-understand information while keeping the original medical context.

## Key Features

* Upload medical reports in PDF, JPG, and PNG formats
* Extract text from PDF documents
* OCR-based text extraction from medical report images
* AI-powered medical report analysis
* Extract test names, values, units, reference ranges, and dates
* Plain-language explanations of test results
* Historical test-value comparison
* Interactive report history
* PostgreSQL database storage
* Exportable report summaries
* Responsive web interface
* Medical safety disclaimer
* Document validation to reject unrelated files

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Axios
* Recharts
* Lucide React
* jsPDF

### Backend

* Node.js
* Express.js
* PostgreSQL
* Multer
* PDF parsing
* Tesseract.js OCR
* Google Gemini AI

## System Architecture

```text
User
  │
  ▼
React + Vite Frontend
  │
  │ HTTP / REST API
  ▼
Node.js + Express Backend
  │
  ├── PDF Text Extraction
  ├── Image OCR
  ├── Medical Report Validation
  └── Gemini AI Analysis
  │
  ▼
PostgreSQL Database
  │
  ├── Users
  ├── Reports
  └── Test Results
  │
  ▼
Dashboard / Reports / History
```

## Application Flow

```text
Upload Report
      ↓
File Validation
      ↓
Text Extraction / OCR
      ↓
Medical Report Validation
      ↓
AI Analysis
      ↓
Extract Test Results
      ↓
Store in PostgreSQL
      ↓
Display Simplified Report
      ↓
Compare Historical Results
      ↓
Export Summary
```

## Project Structure

```text
medsimplify-ai/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── data/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── docs/
├── .gitignore
├── README.md
└── package.json
```

## Database

The application uses PostgreSQL with the following main entities:

### Users

Stores basic user information.

### Reports

Stores uploaded report metadata and extracted text.

### Test Results

Stores structured medical test information such as:

* Test name
* Value
* Unit
* Reference range
* Status
* Plain-language explanation

Reports and their test results are connected using relational database relationships.

## Medical Safety

MedSimplify AI is designed for **informational purposes only**.

The system does not:

* Diagnose diseases
* Prescribe medication
* Recommend treatments
* Replace a qualified healthcare professional

Users should consult a qualified medical professional for medical interpretation and decisions.

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Vas04/medsimplify-ai.git
cd medsimplify-ai
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/medsimplify
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Never commit `.env` to GitHub.

### 5. Start PostgreSQL

Create the database:

```text
medsimplify
```

Then execute the database schema from:

```text
server/db/schema.sql
```

### 6. Start the backend

```bash
cd server
node server.js
```

Backend:

```text
http://localhost:5000
```

### 7. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend will be available at the Vite development URL shown in the terminal.

## Main Pages

* Landing Page
* Dashboard
* Upload Report
* Report Details
* Report History
* Settings

## Future Enhancements

Possible future improvements include:

* User authentication
* Multi-user report management
* More regional languages
* Advanced historical trend analysis
* Mobile application
* Improved OCR for handwritten reports
* Cloud deployment
* Role-based access for healthcare organizations

## Project Purpose

This project demonstrates the integration of:

* Artificial Intelligence
* Optical Character Recognition
* Full-stack web development
* REST APIs
* Relational database management
* Data visualization
* Human-centered software design

---

**MedSimplify AI — Making medical reports easier to understand.**
