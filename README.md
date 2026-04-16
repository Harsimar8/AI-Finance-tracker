# Finance AI - Personal Finance Management Platform

A MERN stack AI-powered personal finance management platform with receipt scanning, transaction tracking, and financial reporting.

## Features

- **AI Receipt Scanning** - Upload receipt images and automatically extract transaction details using Google Gemini AI
- **Transaction Management** - Track income and expenses with categories
- **Financial Reports** - AI-generated insights and analytics
- **Recurring Transactions** - Automatic recurring expense/income tracking
- **Dashboard** - Visual summary of financial health

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Redux Toolkit, Radix UI
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: Google Gemini API
- **Storage**: Cloudinary (image storage)

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key
- Cloudinary Account

## Installation

### Backend Setup

```bash
cd backend
npm install
```

### Configure Environment

Create `.env` file in `backend/` directory:

```env
PORT=8000
NODE_ENV=development

# MongoDB
MONGO_URI="your_mongodb_connection_string"

# JWT
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN=60m

JWT_REFRESH_SECRET="your_refresh_secret"
JWT_REFRESH_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY="your_gemini_api_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Frontend Origin (for CORS)
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend Setup

```bash
cd client/Advanced-MERN-AI-Financial-SaaS-Platform
npm install
```

### Configure Frontend Environment

Create `.env` file in `client/Advanced-MERN-AI-Financial-SaaS-Platform/`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend runs on http://localhost:8000

### Start Frontend

```bash
cd client/Advanced-MERN-AI-Financial-SaaS-Platform
npm run dev
```

Frontend runs on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Transactions
- `GET /api/v1/transaction/all` - Get all transactions
- `POST /api/v1/transaction/create` - Create transaction
- `POST /api/v1/transaction/scan-receipt` - AI scan receipt
- `PUT /api/v1/transaction/update/:id` - Update transaction
- `DELETE /api/v1/transaction/delete/:id` - Delete transaction

### Analytics
- `GET /api/v1/analytics/summary` - Get analytics summary

### Reports
- `GET /api/v1/report/generate` - Generate financial report

## Project Structure

```
finance/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/       # Express routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── package.json
│
├── client/
│   └── Advanced-MERN-AI-Financial-SaaS-Platform/
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── features/     # Redux features
│       │   ├── hooks/       # Custom hooks
│       │   └── pages/       # Page components
│       └── package.json
│
└── README.md
```

## Troubleshooting

### Receipt Scanning Not Working

1. Check backend console for error messages
2. Verify GEMINI_API_KEY is correct
3. Ensure model name is valid (gemini-1.5-flash-002)
4. Check network connectivity to Google API

### CORS Errors

Make sure `FRONTEND_ORIGIN` in backend .env matches your frontend URL.

### MongoDB Connection Issues

Verify your `MONGO_URI` is correct and MongoDB is running.

## License

MIT