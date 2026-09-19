# MedSimplify AI

### AI-Powered Medical Report Simplifier

MedSimplify AI is a full-stack web application that uses OCR, artificial intelligence, and a structured database to help users understand medical reports in simple language.

## Quick Start — Demo Mode

The repository is configured for **Demo Mode by default**.

Demo Mode lets anyone clone the project and explore the main application without:
- PostgreSQL
- a Gemini API key
- consuming Gemini API quota

The demo uses safe sample medical-report data stored in the frontend. It does **not** send uploaded files to Gemini.

### 1. Clone

```bash
git clone https://github.com/Vas04/medsimplify-ai.git
cd medsimplify-ai
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Start Demo Mode

```bash
npm run dev
```

Open the Vite URL shown in the terminal.

You can explore:

- Dashboard
- Upload Report
- Demo AI report
- Report history
- Historical comparison
- PDF export
- Settings

**No PostgreSQL or Gemini key is required for Demo Mode.**

## Real AI Mode

To process real medical reports, switch Demo Mode off.

Create:

```text
client/.env
```

with:

```env
VITE_DEMO_MODE=false
```

Then configure the backend.

### Backend setup

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

Never commit `.env` or API keys to GitHub.

Create the PostgreSQL database:

```text
medsimplify
```

Run:

```text
server/db/schema.sql
server/db/seed.sql
```

Install and start the backend:

```bash
cd server
npm install
node server.js
```

Then start the frontend in another terminal:

```bash
cd client
npm run dev
```

## Features

- PDF, JPG and PNG medical report upload
- PDF text extraction
- OCR for report images
- AI-powered report simplification
- Test/value/unit/reference-range extraction
- Plain-language explanations
- Historical test comparison
- PostgreSQL storage
- PDF export
- Responsive interface
- Medical report validation
- Medical safety disclaimer

## Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React
- jsPDF

### Backend
- Node.js
- Express.js
- PostgreSQL
- Multer
- PDF parsing
- Tesseract.js OCR
- Google Gemini AI

## Architecture

```text
User
  |
  v
React + Vite
  |
  +---- Demo Mode ----> Local sample data
  |
  +---- Real AI Mode --> Express API
                              |
                    +---------+---------+
                    |                   |
                 OCR/PDF            Gemini AI
                    |
                    v
                PostgreSQL
                    |
                    v
          Reports / History / Export
```

## Medical Safety

MedSimplify AI provides informational explanations only.

It does not:
- diagnose diseases
- prescribe medication
- recommend treatment
- replace a healthcare professional

Reference ranges can vary between laboratories. Users should consult a qualified healthcare professional for medical decisions.

## Project Structure

```text
medsimplify-ai/
├── client/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── .env.example
│   └── package.json
├── docs/
├── .gitignore
└── README.md
```

## Authentication\n\nThe application supports real user registration and login in Real AI Mode. Passwords are stored as secure scrypt hashes and API access uses signed expiring authentication tokens. Reports, test history, viewing, upload, and deletion are scoped to the authenticated user.\n\nFor local Real AI Mode, add `AUTH_SECRET` to `server/.env` using a long random secret. Never commit `.env` files or API keys.\n\n## Future Enhancements

- User authentication
- Multi-user cloud deployment
- Additional regional languages
- Advanced trend analysis
- Mobile application
- Improved handwritten-report OCR
- Healthcare organization roles

---

**MedSimplify AI — Making medical reports easier to understand.**
