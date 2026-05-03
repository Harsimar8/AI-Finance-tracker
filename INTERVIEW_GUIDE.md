# 🎯 Finance AI - Complete Interview Guide & Project Explanation

## 📚 TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Architecture Explanation](#architecture-explanation)
3. [API Routes Documentation](#api-routes-documentation)
4. [Technical Interview Questions with Answers](#technical-interview-questions-with-answers)
5. [Key Definitions & Concepts](#key-definitions--concepts)
6. [Important Code Flows](#important-code-flows)

---

# 📖 PROJECT OVERVIEW

## What is Finance AI?

**Finance AI** is a full-stack **MERN (MongoDB, Express, React, Node.js) SaaS platform** that uses **artificial intelligence** to help users manage their personal finances intelligently.

### Core Problem It Solves
- Manual transaction entry is time-consuming
- Users don't get financial insights from their spending patterns
- Receipt management is chaotic
- Users lack intelligent budget recommendations

### Key Features

| Feature | Description |
|---------|-------------|
| **AI Receipt Scanning** | Upload a receipt photo → Gemini AI extracts transaction data automatically |
| **Transaction Management** | Create, read, update, delete transactions with categories |
| **Financial Analytics** | Real-time charts, expense breakdowns, spending summaries |
| **AI Budget Suggestions** | Get intelligent budget recommendations based on spending patterns |
| **Report Generation** | AI-generated financial reports sent via email automatically |
| **Recurring Transactions** | Set up recurring expenses/income that auto-create transactions |
| **Multi-user Support** | Each user has their own isolated financial data |
| **Responsive Dashboard** | Real-time financial overview with visualizations |

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Redux Toolkit, Radix UI, TailwindCSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access Token + Refresh Token)
- **AI**: Google Gemini API for text extraction from images
- **File Storage**: Cloudinary for image hosting
- **Email Service**: Resend API for sending reports
- **Task Scheduler**: Cron jobs for scheduled reports
- **Image Upload**: Multer for file handling

---

# 🏗️ ARCHITECTURE EXPLANATION

## Folder Structure Breakdown

```
backend/src/
├── controllers/      → Business logic & request handling
├── services/        → Core business logic (reusable)
├── models/          → MongoDB schemas (data layer)
├── routes/          → API endpoint definitions
├── middlewares/     → Request/response interceptors
├── config/          → External service configurations
├── crons/           → Scheduled jobs
├── validators/      → Input validation schemas
├── utils/           → Helper functions & utilities
├── mailers/         → Email template & sending logic
├── enums/           → Enumerated constants
└── @types/          → TypeScript type definitions
```

## MVC Pattern Explanation

The project follows the **MVC (Model-View-Controller) Pattern**:

```
User Request
    ↓
Routes (auth.routes.ts, transaction.route.ts)
    ↓
Controllers (auth.controller.ts, transaction.controller.ts)
    ├─→ Extract request data
    ├─→ Call business logic
    └─→ Return response
    ↓
Services (auth.service.ts, transaction.service.ts)
    ├─→ Core business logic
    ├─→ Database queries
    └─→ AI API calls
    ↓
Models (user.model.ts, transaction.model.ts)
    └─→ MongoDB schemas & validations
    ↓
Middleware (auth.middleware.ts, errorHandler.middleware.ts)
    ├─→ JWT verification
    ├─→ Error handling
    └─→ Async error catching
    ↓
Database (MongoDB)
    └─→ Data persistence
```

## Authentication Flow

```
1. User Registration
   POST /api/auth/register
   ├─→ Validate email & password
   ├─→ Hash password with bcrypt
   ├─→ Save user to MongoDB
   └─→ Return success message

2. User Login
   POST /api/auth/login
   ├─→ Find user by email
   ├─→ Compare password with bcrypt
   ├─→ Generate JWT Access Token (15 minutes)
   ├─→ Generate JWT Refresh Token (7 days)
   └─→ Return tokens to client

3. Token Refresh
   POST /api/auth/refresh-token
   ├─→ Verify refresh token
   ├─→ Generate new access token
   └─→ Return new token

4. Protected Route Access
   GET /api/user/current-user
   ├─→ authMiddleware extracts JWT
   ├─→ Verifies JWT signature
   ├─→ Attaches user ID to request
   └─→ Controller processes request
```

## Request Processing Flow

```
HTTP Request
    ↓
Express.json() middleware (parse JSON body)
    ↓
CORS middleware (check origin)
    ↓
Route matching (find correct route)
    ↓
authMiddleware (if protected route)
    ├─→ Extract token from Authorization header
    ├─→ Verify JWT signature
    └─→ Attach user info to request
    ↓
asyncHandler middleware
    └─→ Wrap controller in try-catch
    ↓
Controller Logic
    ├─→ Validate input
    ├─→ Call service layer
    └─→ Format response
    ↓
Error (if any)
    ↓
errorHandler middleware
    ├─→ Log error
    ├─→ Format error response
    └─→ Send HTTP error status
    ↓
HTTP Response
```

---

# 🔌 API ROUTES DOCUMENTATION

## Base Configuration
- **Base Path**: `/api` (configurable via BASE_PATH in env.config.ts)
- **Server Port**: 8000 (default)
- **Full URL Example**: `http://localhost:8000/api/auth/login`

## 1️⃣ AUTHENTICATION ROUTES (`/api/auth`)

### POST `/api/auth/register`
**Purpose**: Create a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Cases**:
- 400: Email already exists
- 400: Invalid email format
- 400: Password too weak

---

### POST `/api/auth/login`
**Purpose**: Authenticate user and return tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Headers Required**: None (public endpoint)

---

### POST `/api/auth/refresh-token`
**Purpose**: Get a new access token using refresh token

**Request Header**:
```
Authorization: Bearer <refresh_token>
```

**Response** (200 OK):
```json
{
  "message": "Token refreshed",
  "access_token": "new_eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "new_eyJhbGciOiJIUzI1NiIs..."
}
```

**Protected**: ✅ Yes (requires valid refresh token)

---

## 2️⃣ USER ROUTES (`/api/user`)

### GET `/api/user/current-user`
**Purpose**: Get details of logged-in user

**Request Header**:
```
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "message": "User fetched successfully",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "profilePicture": "https://cloudinary.url/image.jpg",
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

**Protected**: ✅ Yes

---

### PUT `/api/user/update`
**Purpose**: Update user profile and/or profile picture

**Request Header**:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data**:
```
name: "New Name"
email: "newemail@example.com"
profilePicture: <file> (optional)
```

**Response** (200 OK):
```json
{
  "message": "User updated successfully",
  "user": {
    "_id": "user_id",
    "name": "New Name",
    "email": "newemail@example.com",
    "profilePicture": "https://cloudinary.url/new_image.jpg"
  }
}
```

**Protected**: ✅ Yes

---

## 3️⃣ TRANSACTION ROUTES (`/api/transaction`)

### POST `/api/transaction/create`
**Purpose**: Create a single transaction manually

**Request Header**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 150.50,
  "category": "groceries",
  "description": "Weekly grocery shopping",
  "type": "expense",
  "date": "2026-05-01"
}
```

**Response** (201 Created):
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "transaction_id",
    "amount": 150.50,
    "category": "groceries",
    "description": "Weekly grocery shopping",
    "type": "expense",
    "date": "2026-05-01",
    "userId": "user_id"
  }
}


**Protected**: ✅ Yes

---

### POST `/api/transaction/scan-receipt`
**Purpose**: Upload receipt image and extract transaction using AI

**Request Header**:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data**:
```
receipt: <image_file> (jpg, png)
```

**Process Flow**:
1. Upload image to Cloudinary
2. Send image to Google Gemini AI
3. AI extracts: amount, items, store name, date
4. Create transaction from extracted data
5. Return transaction details

**Response** (201 Created):
```json
{
  "message": "Receipt scanned and transaction created",
  "transaction": {
    "_id": "transaction_id",
    "amount": 45.99,
    "category": "groceries",
    "description": "Walmart - Groceries (AI extracted)",
    "type": "expense",
    "receiptImage": "https://cloudinary.url/receipt.jpg",
    "extractedData": {
      "items": ["Milk", "Bread", "Eggs"],
      "storeName": "Walmart",
      "total": 45.99
    }
  }
}
```

**Protected**: ✅ Yes

---

### GET `/api/transaction/all`
**Purpose**: Fetch all transactions for logged-in user

**Query Parameters** (optional):
```
?page=1&limit=20&category=groceries&type=expense&startDate=2026-01-01&endDate=2026-05-01
```

**Response** (200 OK):
```json
{
  "message": "Transactions fetched",
  "transactions": [
    {
      "_id": "id1",
      "amount": 150.50,
      "category": "groceries",
      "description": "Weekly shopping",
      "type": "expense",
      "date": "2026-05-01"
    },
    {
      "_id": "id2",
      "amount": 2000,
      "category": "salary",
      "description": "Monthly salary",
      "type": "income",
      "date": "2026-05-01"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

**Protected**: ✅ Yes

---

### GET `/api/transaction/:id`
**Purpose**: Get a specific transaction by ID

**Response** (200 OK):
```json
{
  "message": "Transaction fetched",
  "transaction": {
    "_id": "transaction_id",
    "amount": 150.50,
    "category": "groceries",
    "description": "Weekly grocery shopping",
    "type": "expense",
    "date": "2026-05-01"
  }
}
```

**Protected**: ✅ Yes

---

### GET `/api/transaction/duplicate/:id`
**Purpose**: Duplicate an existing transaction

**Response** (201 Created):
```json
{
  "message": "Transaction duplicated",
  "transaction": {
    "_id": "new_transaction_id",
    "amount": 150.50,
    "category": "groceries",
    "description": "Weekly grocery shopping (Duplicated)",
    "type": "expense",
    "date": "2026-05-01"
  }
}
```

**Protected**: ✅ Yes
**Use Case**: Recurring transactions that aren't automated

---

### PUT `/api/transaction/update/:id`
**Purpose**: Update an existing transaction

**Request Body**:
```json
{
  "amount": 160.75,
  "category": "groceries",
  "description": "Updated grocery shopping",
  "type": "expense",
  "date": "2026-05-01"
}
```

**Response** (200 OK):
```json
{
  "message": "Transaction updated successfully",
  "transaction": {
    "_id": "transaction_id",
    "amount": 160.75,
    "category": "groceries",
    "description": "Updated grocery shopping",
    "type": "expense",
    "date": "2026-05-01"
  }
}
```

**Protected**: ✅ Yes

---

### DELETE `/api/transaction/delete/:id`
**Purpose**: Delete a single transaction

**Response** (200 OK):
```json
{
  "message": "Transaction deleted successfully",
  "deletedId": "transaction_id"
}
```

**Protected**: ✅ Yes

---

### POST `/api/transaction/bulk-transaction`
**Purpose**: Create multiple transactions at once

**Request Body**:
```json
{
  "transactions": [
    {
      "amount": 50,
      "category": "food",
      "description": "Lunch",
      "type": "expense",
      "date": "2026-05-01"
    },
    {
      "amount": 100,
      "category": "transport",
      "description": "Fuel",
      "type": "expense",
      "date": "2026-05-01"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "message": "Transactions created successfully",
  "transactions": [
    { "_id": "id1", "amount": 50, ... },
    { "_id": "id2", "amount": 100, ... }
  ]
}
```

**Protected**: ✅ Yes
**Use Case**: Import from CSV or bulk operations

---

### DELETE `/api/transaction/bulk-delete`
**Purpose**: Delete multiple transactions at once

**Request Body**:
```json
{
  "transactionIds": ["id1", "id2", "id3"]
}
```

**Response** (200 OK):
```json
{
  "message": "Transactions deleted successfully",
  "deletedCount": 3
}
```

**Protected**: ✅ Yes

---

## 4️⃣ REPORT ROUTES (`/api/report`)

### GET `/api/report/all`
**Purpose**: Fetch all generated reports for user

**Response** (200 OK):
```json
{
  "message": "Reports fetched",
  "reports": [
    {
      "_id": "report_id",
      "title": "Monthly Financial Report - April 2026",
      "summary": "You spent $2,500 this month on...",
      "totalIncome": 5000,
      "totalExpenses": 2500,
      "netIncome": 2500,
      "categories": {
        "groceries": 500,
        "utilities": 300,
        "entertainment": 200
      },
      "generatedAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

**Protected**: ✅ Yes

---

### GET `/api/report/generate`
**Purpose**: Generate new AI report from transaction data

**Query Parameters** (optional):
```
?dateRange=lastMonth&includeCharts=true
```

**Response** (200 OK):
```json
{
  "message": "Report generated successfully",
  "report": {
    "_id": "new_report_id",
    "title": "Financial Report - April 2026",
    "summary": "AI Generated Summary:\nYour spending increased by 15%...",
    "insights": [
      "Highest spending category: Groceries ($500)",
      "You saved $2,500 this month",
      "Recommended budget for next month: $2,300"
    ],
    "totalIncome": 5000,
    "totalExpenses": 2500,
    "netIncome": 2500,
    "dateRange": "lastMonth",
    "generatedAt": "2026-05-01T10:00:00Z"
  }
}
```

**Protected**: ✅ Yes
**Process**:
1. Fetch user's transactions for selected period
2. Calculate totals & breakdowns
3. Send to Gemini AI for insights
4. Save report to database
5. Return report details

---

### POST `/api/report/upload`
**Purpose**: Upload image and generate report

**Request Header**:
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data**:
```
file: <image_file>
dateRange: "lastMonth"
```

**Response** (201 Created):
```json
{
  "message": "Report generated from image",
  "report": {
    "_id": "report_id",
    "title": "Report Generated from Document",
    "summary": "Extracted content and analysis...",
    "imageUrl": "https://cloudinary.url/report.jpg"
  }
}
```

**Protected**: ✅ Yes

---

### PUT `/api/report/update-setting`
**Purpose**: Update report generation preferences

**Request Body**:
```json
{
  "autoGenerateReports": true,
  "reportFrequency": "weekly",
  "includeCharts": true,
  "recipientEmail": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Report settings updated",
  "settings": {
    "autoGenerateReports": true,
    "reportFrequency": "weekly",
    "nextReportDate": "2026-05-08T09:00:00Z"
  }
}
```

**Protected**: ✅ Yes

---

### POST `/api/report/resend-all`
**Purpose**: Resend all reports via email

**Response** (200 OK):
```json
{
  "message": "All reports sent successfully",
  "emailsSent": 1,
  "recipients": ["user@example.com"]
}
```

**Protected**: ✅ Yes (Admin feature)
**Triggered By**: Cron job or manual request

---

## 5️⃣ ANALYTICS ROUTES (`/api/analytics`)

### GET `/api/analytics/summary`
**Purpose**: Get financial summary (total income, expenses, net)

**Response** (200 OK):
```json
{
  "message": "Summary fetched",
  "summary": {
    "period": "lastMonth",
    "totalIncome": 5000,
    "totalExpenses": 2500,
    "netIncome": 2500,
    "transactionCount": 45,
    "averageTransaction": 55.56,
    "largestExpense": 500,
    "largestIncome": 5000
  }
}
```

**Protected**: ✅ Yes
**Use Case**: Dashboard header/overview

---

### GET `/api/analytics/chart`
**Purpose**: Get data for time-series chart (daily/weekly/monthly)

**Query Parameters**:
```
?period=lastMonth&type=expense
```

**Response** (200 OK):
```json
{
  "message": "Chart data fetched",
  "chartData": {
    "labels": ["2026-04-01", "2026-04-02", "2026-04-03"],
    "datasets": [
      {
        "label": "Expenses",
        "data": [100, 150, 80]
      },
      {
        "label": "Income",
        "data": [0, 2000, 0]
      }
    ]
  }
}
```

**Protected**: ✅ Yes
**Frontend Usage**: Chart.js or similar

---

### GET `/api/analytics/expense-breakdown`
**Purpose**: Get pie chart data by expense category

**Response** (200 OK):
```json
{
  "message": "Expense breakdown fetched",
  "breakdown": {
    "labels": ["Groceries", "Utilities", "Entertainment", "Transport"],
    "datasets": [
      {
        "label": "Expenses",
        "data": [500, 300, 200, 150],
        "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
      }
    ]
  }
}
```

**Protected**: ✅ Yes

---

### GET `/api/analytics/suggestions`
**Purpose**: Get AI-powered budget suggestions

**Response** (200 OK):
```json
{
  "message": "Budget suggestions generated",
  "suggestions": {
    "currentBudget": {
      "groceries": 500,
      "utilities": 300,
      "entertainment": 200,
      "transport": 150
    },
    "recommendedBudget": {
      "groceries": 450,
      "utilities": 300,
      "entertainment": 150,
      "transport": 100
    },
    "insights": [
      "You're overspending on entertainment. Reduce by $50 to save $600/year",
      "Transport costs are trending up. Consider carpooling",
      "Great job on groceries! You're below the average"
    ],
    "potentialSavings": 200
  }
}
```

**Protected**: ✅ Yes
**AI Powered**: ✅ Yes (Gemini API)

---

# ❓ TECHNICAL INTERVIEW QUESTIONS WITH ANSWERS

## SECTION 1: PROJECT & ARCHITECTURE UNDERSTANDING

### Q1: What is this project about and what problem does it solve?

**Answer**:
Finance AI is a MERN stack SaaS platform that solves the following problems:

1. **Manual Data Entry Problem**: Instead of manually entering receipt data, users can take a photo and AI extracts the details automatically
2. **Lack of Financial Insights**: Users don't understand their spending patterns. The platform provides analytics and visualizations
3. **Scattered Financial Data**: All transactions are in one place with proper categorization
4. **No Budget Guidance**: AI provides intelligent budget suggestions based on spending habits
5. **Receipt Management**: Digital storage of all receipts in the cloud

**Key Innovation**: Integration of Google Gemini AI for automatic receipt data extraction, making financial tracking effortless.

---

### Q2: Explain the project structure and the separation of concerns

**Answer**:
The project follows a **layered architecture** with clear separation of concerns:

```
1. ROUTES Layer (API Contracts)
   ├─→ Define HTTP endpoints
   ├─→ Define request/response formats
   └─→ Apply middleware (auth, validation)
   
2. CONTROLLERS Layer (Request Handlers)
   ├─→ Extract data from request
   ├─→ Call service layer
   ├─→ Handle errors
   └─→ Format responses
   
3. SERVICES Layer (Business Logic)
   ├─→ Core business logic
   ├─→ Database operations via models
   ├─→ External API calls (Gemini, Cloudinary)
   └─→ Data validation & transformation
   
4. MODELS Layer (Data Persistence)
   ├─→ MongoDB schemas
   ├─→ Data validation rules
   ├─→ Indexes for performance
   └─→ Relationships between data
   
5. UTILS & HELPERS Layer
   ├─→ Reusable helper functions
   ├─→ Currency conversion
   ├─→ Date manipulation
   └─→ Error handling
   
6. MIDDLEWARES Layer (Cross-cutting Concerns)
   ├─→ JWT authentication
   ├─→ Global error handling
   ├─→ Async error wrapping
   └─→ CORS handling
```

**Benefits**:
- **Testability**: Each layer can be tested independently
- **Reusability**: Services can be used in multiple controllers
- **Maintainability**: Easy to find and update code
- **Scalability**: Easy to add new features without affecting existing code

---

### Q3: How does authentication work in this application?

**Answer**:
The application uses **JWT (JSON Web Token) based authentication** with the following flow:

```
REGISTRATION:
1. User submits email + password
2. Password is hashed using bcrypt (salt rounds: 10)
3. User saved to MongoDB with hashed password
4. Success response sent

LOGIN:
1. User submits email + password
2. Find user by email in database
3. Compare provided password with stored hash using bcrypt.compare()
4. If match:
   a. Generate Access Token (JWT)
      - Expires in 15 minutes
      - Contains: userId, email
      - Signed with JWT_SECRET
   b. Generate Refresh Token (JWT)
      - Expires in 7 days
      - Contains: userId
      - Signed with JWT_REFRESH_SECRET
   c. Return both tokens to client
5. If no match: Return 401 Unauthorized

TOKEN USAGE:
1. Client stores tokens (localStorage/sessionStorage)
2. For protected requests, client sends:
   Authorization: Bearer <access_token>
3. authMiddleware:
   a. Extracts token from Authorization header
   b. Verifies signature with JWT_SECRET
   c. If valid: Attaches user info to request.user
   d. If invalid: Returns 401 Unauthorized
4. Controller proceeds with user's request

REFRESH TOKEN:
1. When access token expires (15 min)
2. Client sends POST /refresh-token with refresh token
3. Server verifies refresh token
4. If valid: Issues new access token
5. Client uses new access token for next request
```

**Why Two Tokens?**:
- **Access Token**: Short-lived (15 min), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access token
- **Security**: Even if access token is stolen, attacker can only access for 15 minutes

---

### Q4: What middleware is used and what does each do?

**Answer**:

| Middleware | Purpose | Used In |
|-----------|---------|---------|
| **authMiddleware** | Verifies JWT token and attaches user to request | Protected routes |
| **asyncHandler** | Wraps async functions to catch errors automatically | All controllers |
| **errorHandler** | Global error handler, formats error responses | App-level (catches all errors) |
| **CORS middleware** | Allows frontend requests from specific origin | App-level |
| **express.json()** | Parses JSON request body | App-level |

**Code Example**:
```typescript
// authMiddleware Flow
app.get("/protected", authMiddleware, controller)
// 1. Request comes in
// 2. authMiddleware verifies token
// 3. If valid: Sets req.user and calls next()
// 4. If invalid: Sends 401 response, doesn't call controller

// asyncHandler Flow
asyncHandler(async (req, res) => {
  // Any error thrown here is caught
  throw new Error("Something failed");
  // Gets caught by asyncHandler and passed to errorHandler
})

// errorHandler Flow
app.use(errorHandler)
// Catches all errors from controllers
// Formats response with status code and message
// Sends response to client
```

---

### Q5: How are environment variables configured?

**Answer**:
Environment variables are configured in `env.config.ts`:

```typescript
// getEnv function: Gets value from .env file, returns default if not found
const envConfig = () => ({
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: getEnv("PORT", "8000"),
    MONGO_URI: getEnv("MONGO_URI"),  // Required
    
    JWT_SECRET: getEnv("JWT_SECRET", "secret_jwt"),
    JWT_EXPRESS_IN: getEnv("JWT_EXPIRES_IN", "15m"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "secret_jwt_refresh"),
    JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_IN", "7d"),
    
    GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),  // Required for AI
    
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
    
    RESEND_API_KEY: getEnv("RESEND_API_KEY"),  // Email service
    RESEND_MAILER_SENDER: getEnv("RESEND_MAILER_SENDER", ""),
    
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
});

export const Env = envConfig();
```

**Why Separate Config File?**:
- Centralized configuration
- Type-safe (TypeScript)
- Easy to add/remove variables
- Can be imported anywhere in the application

**In .env file**:
```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
FRONTEND_ORIGIN=http://localhost:5173
```

---

## SECTION 2: FEATURES & FUNCTIONALITY

### Q6: How does AI receipt scanning work?

**Answer**:
Receipt scanning is a multi-step process:

```
STEP 1: IMAGE UPLOAD
- User uploads receipt image via /scan-receipt endpoint
- Image is sent to controller with authMiddleware (user verified)

STEP 2: CLOUDINARY UPLOAD
- Image uploaded to Cloudinary cloud storage
- Gets secure URL for future reference
- Returns imageUrl to use in transaction

STEP 3: AI EXTRACTION (Gemini)
- Image sent to Google Gemini API with prompt:
  "Extract from receipt: amount, store name, items, date"
- Gemini AI processes image and returns structured data

STEP 4: TRANSACTION CREATION
- Service layer processes AI response:
  a. Validate extracted amount
  b. Determine category (groceries, restaurant, etc.)
  c. Parse date
  d. Create transaction object
  
STEP 5: DATABASE SAVE
- Transaction saved to MongoDB with:
  a. Extracted amount & date
  b. AI-determined category
  c. Description (store name)
  d. Receipt image URL
  e. User ID (for data isolation)
  
STEP 6: RESPONSE
- Return new transaction with all details
- Frontend shows success message
```

**Example Flow**:
```typescript
// routes/transaction.route.ts
transactionRoutes.post("/scan-receipt", authMiddleware, scanReceiptController);

// controllers/transaction.controller.ts
export const scanReceiptController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const receipt = req.files.receipt;
  
  // Call service
  const transaction = await scanReceiptService(userId, receipt);
  
  res.status(201).json({
    message: "Receipt scanned",
    transaction
  });
});

// services/transaction.service.ts
export const scanReceiptService = async (userId, receipt) => {
  // 1. Upload to Cloudinary
  const cloudinaryResult = await uploadToCloudinary(receipt);
  
  // 2. Extract with Gemini
  const extractedData = await extractReceiptWithGemini(cloudinaryResult.url);
  
  // 3. Create transaction
  const transaction = new Transaction({
    userId,
    amount: extractedData.amount,
    category: extractedData.category,
    description: extractedData.storeName,
    receiptImage: cloudinaryResult.url,
    date: extractedData.date,
    type: "expense"
  });
  
  // 4. Save to database
  return await transaction.save();
};
```

**Why This Approach?**:
- **User Convenience**: No manual data entry required
- **Accuracy**: AI extracts structured data from unstructured image
- **Cloud Storage**: Images stored securely with CDN delivery
- **Atomicity**: Transaction + image stored together

---

### Q7: How is the financial analytics calculated?

**Answer**:
Analytics involves aggregation and transformation of transaction data:

```
SUMMARY ANALYTICS:
- Fetch all transactions for user in date range
- Calculate:
  a. totalIncome = SUM(transactions where type="income")
  b. totalExpenses = SUM(transactions where type="expense")
  c. netIncome = totalIncome - totalExpenses
  d. transactionCount = COUNT(transactions)
  e. averageTransaction = totalExpenses / transactionCount
  f. largestExpense = MAX(amount where type="expense")
  g. largestIncome = MAX(amount where type="income")

CHART DATA (Time-series):
- Group transactions by date (daily/weekly/monthly)
- For each period:
  a. Sum expenses for period
  b. Sum income for period
  c. Calculate cumulative
- Return as array of {date, expense, income}

PIE CHART (Category Breakdown):
- Group transactions by category

- Calculate total per category
- Example:
  {
    Groceries: $500,
    Utilities: $300,
    Entertainment: $200,
    Transport: $150
  }
- Return as labels + data for chart library
```

**MongoDB Aggregation Pipeline Example**:
```typescript
// Get expense by category
const breakdown = await Transaction.aggregate([
  { $match: { userId: userId, type: "expense" } },
  {
    $group: {
      _id: "$category",
      total: { $sum: "$amount" }
    }
  },
  { $sort: { total: -1 } }
]);

// Result:
// [
//   { _id: "groceries", total: 500 },
//   { _id: "utilities", total: 300 },
//   { _id: "entertainment", total: 200 }
// ]
```

---

### Q8: How are AI budget suggestions generated?

**Answer**:
Budget suggestions use AI analysis of spending patterns:

```
STEP 1: COLLECT SPENDING DATA
- Get transactions from last 3 months
- Group by category
- Calculate average spending per category

STEP 2: IDENTIFY PATTERNS
- Find categories with:
  a. Increasing trend (spending going up)
  b. High spending (vs benchmarks)
  c. Volatile spending (inconsistent)

STEP 3: GENERATE WITH AI
- Send to Gemini:
  {
    "currentSpending": {
      "groceries": 500,
      "entertainment": 200,
      "transport": 100
    },
    "averageIncome": 5000,
    "savingsGoal": "increase savings"
  }
  
- Gemini returns:
  {
    "recommendedBudget": {
      "groceries": 450,
      "entertainment": 150,
      "transport": 80
    },
    "insights": [
      "You're overspending on entertainment...",
      "Consider carpooling for transport..."
    ],
    "potentialSavings": 170
  }

STEP 4: RETURN TO USER
- Display current vs recommended
- Show savings opportunity
- Provide actionable insights
```

---

### Q9: How do recurring transactions work?

**Answer**:
Recurring transactions are handled by cron jobs:

```
USER SETUP:
1. User creates transaction with "recurring" flag
2. Sets frequency: daily, weekly, monthly, yearly
3. Saved to database with nextDueDate

CRON JOB (Runs every hour):
// crons/jobs/transaction.job.ts
1. Find all recurring transactions
2. Filter where nextDueDate <= today
3. For each:
   a. Create new transaction copy
   b. Update nextDueDate (add frequency)
   c. Save to database
4. Log created transactions

EXAMPLE:
- User sets up: Gym subscription $50/month on 1st
- Cron finds it needs creation
- Creates: $50 transaction on 1st
- Updates nextDueDate to next month 1st
- Next month, cron runs again and repeats

BENEFITS:
- Automation: No manual entry needed
- Consistency: Recurring expenses tracked automatically
- History: All instances visible in transaction list
```

---

### Q10: How are reports generated and emailed?

**Answer**:
Reports are AI-generated and sent via email:

```
MANUAL REPORT GENERATION:
1. User requests: GET /api/report/generate
2. Controller calls reportService

REPORT SERVICE:
a. Fetch transactions for selected period
b. Calculate totals (income, expense, net)
c. Group by category
d. Send to Gemini AI:
   - "Analyze spending and generate insights"
   - AI returns detailed insights
e. Create report document:
   {
     title: "Monthly Report - April",
     summary: "AI-generated text",
     insights: [...],
     categories: {...},
     generatedAt: timestamp
   }
f. Save to database
g. Return report to user

AUTO-GENERATION (Cron):
// crons/jobs/report_job.ts
1. Check if auto-generate is enabled
2. Check if report is due (weekly/monthly)
3. If due: Call reportService
4. Send via email to user

EMAIL SENDING (Resend API):
// mailers/report_mailer.ts
1. Format report as HTML email
2. Call Resend API:
   {
     from: "noreply@finance-ai.com",
     to: user.email,
     subject: "Your Financial Report",
     html: reportHTML
   }
3. Log email send status
4. If failed: Retry logic

CRON SCHEDULING:
- Stored in reportSettings model
- Fields:
  a. autoGenerateReports: boolean
  b. reportFrequency: "weekly" | "monthly"
  c. nextReportDate: timestamp
  d. lastReportDate: timestamp
```

---

## SECTION 3: DATABASE & MODELS

### Q11: What MongoDB models are used and their relationships?

**Answer**:
The application uses 4 main models:

```
MODEL 1: USER
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  name: string,
  profilePicture: string (URL),
  createdAt: timestamp,
  updatedAt: timestamp
}
Relationships:
- Has Many: Transactions
- Has Many: Reports
- Has One: ReportSettings

MODEL 2: TRANSACTION
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: number,
  category: string (groceries, utilities, salary, etc.),
  description: string,
  type: "income" | "expense",
  date: Date,
  receiptImage: string (URL, optional),
  recurring: boolean,
  recurringFrequency: "daily" | "weekly" | "monthly",
  nextDueDate: Date (if recurring),
  createdAt: timestamp
}
Indexes:
- userId (for fast user lookup)
- userId + date (for analytics)
- userId + category (for breakdown)

MODEL 3: REPORT
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: string,
  summary: string (AI-generated),
  insights: [string],
  totalIncome: number,
  totalExpenses: number,
  netIncome: number,
  dateRange: string,
  categories: {
    [categoryName]: amount
  },
  emailSent: boolean,
  generatedAt: timestamp
}

MODEL 4: REPORT SETTING
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  autoGenerateReports: boolean,
  reportFrequency: "weekly" | "monthly",
  lastReportDate: Date,
  nextReportDate: Date,
  recipientEmail: string,
  includeCharts: boolean
}

RELATIONSHIP DIAGRAM:
┌─────────────────────────┐
│        USER             │
│ email, password, name   │
└─────────────────────────┘
      ↓         ↓           ↓
  (1:N)     (1:N)       (1:1)
      ↓         ↓           ↓
┌──────────┬──────────┬──────────────┐
│TRANSACTION│ REPORT  │REPORT SETTING│
│amount,cat │title,   │autoGenerate  │
│description│summary  │frequency     │
└──────────┴──────────┴──────────────┘
```

---

### Q12: How is data isolated per user?

**Answer**:
Data isolation is achieved through user authentication and database queries:

```
PRINCIPLE: Every query includes userId filter

REGISTRATION:
- New user created with unique email
- Password hashed before storage
- User ID auto-generated by MongoDB

AUTHENTICATION:
- authMiddleware extracts userId from JWT
- Attaches req.user._id to request

DATA ISOLATION:
// In every service query
const transactions = await Transaction.find({
  userId: req.user._id  // ← User-specific query
});

// User can't query another user's data
// Even if they modify request, userId is from JWT token
// Can't forge/modify JWT without JWT_SECRET

SECURITY FLOW:
1. User logs in → receives JWT with their userId
2. User makes request with JWT
3. authMiddleware verifies JWT signature (can't be faked)
4. Extracts userId from JWT
5. All queries filtered by userId
6. User only sees their own data

EXAMPLE:
// User A tries to access Transaction B's data:
GET /api/transaction/transactionB_id
Authorization: Bearer userA_token

// Server:
1. Verifies JWT, gets userId = userA
2. Queries: Transaction.findById(transactionB_id, userId: userA)
3. Transaction belongs to userB
4. Returns: Transaction not found
5. User A can't see userB's transaction

ENFORCEMENT:
- Every model has userId field
- Every query filters by userId
- Frontend stores JWT securely
- JWT can't be forged (needs JWT_SECRET)
```

---

### Q13: What indexes are created for performance?

**Answer**:
Indexes are created in Mongoose models to optimize queries:

```typescript
// User Model
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,  // ← Index for login queries
    required: true
  },
  password: String
});

// Transaction Model
const transactionSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: "User",
    index: true  // ← Index for user lookup
  },
  date: {
    type: Date,
    index: true  // ← Index for date range queries
  },
  category: {
    type: String,
    index: true  // ← Index for category filtering
  }
});

// Compound Indexes (faster for multiple conditions)
transactionSchema.index({ userId: 1, date: 1 });  // User's transactions by date
transactionSchema.index({ userId: 1, category: 1 });  // User's expenses by category

// Text Index (for search)
transactionSchema.index({ description: "text" });  // Search transactions by description
```

**Why Indexes?**:
```
WITHOUT INDEX:
- Query: find(userId: "123")
- MongoDB scans entire collection (SLOW)
- Time complexity: O(n)

WITH INDEX:
- Query: find(userId: "123")
- MongoDB uses B-tree structure (FAST)
- Time complexity: O(log n)

EXAMPLE:
- 1 million transactions
- Without index: Scan 1M documents (~100ms)
- With index: Look up in index tree (~1ms)
- 100x faster!
```

---

## SECTION 4: FILE HANDLING & EXTERNAL SERVICES

### Q14: How are images uploaded to Cloudinary?

**Answer**:
Image upload involves Multer (local handling) and Cloudinary (cloud storage):

```typescript
// config/cloudinary.config.ts
import multer from "multer";
import cloudinary from "cloudinary";

// Local file upload to memory
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  fileSize: 5 * 1024 * 1024  // 5MB limit
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: Env.CLOUDINARY_CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET
});

// UPLOAD FLOW:
// routes/transaction.route.ts
transactionRoutes.post(
  "/scan-receipt",
  authMiddleware,
  upload.single("receipt"),  // ← Multer handles file
  scanReceiptController
);

// controller/transaction.controller.ts
export const scanReceiptController = asyncHandler(async (req, res) => {
  const file = req.file;  // ← File from Multer
  const uploadResult = await uploadToCloudinary(file);
  // uploadResult.secure_url = "https://res.cloudinary.com/..."
});

// Service function
async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        resource_type: "auto",  // Auto-detect type
        folder: "receipts"      // Store in /receipts folder
      },
      (error, result) => {
        if (error) reject(error);
        resolve(result);
      }
    );
    
    stream.end(file.buffer);  // Send file buffer to stream
  });
}
```

**Why Cloudinary?**:
- **CDN Delivery**: Images served from edge locations (fast)
- **Storage**: Don't need server disk space
- **Scalability**: Handles millions of images
- **Transformations**: Auto-resize, optimize, format conversion
- **URL-based**: Direct links instead of file paths

---

### Q15: How is Gemini AI integrated for text extraction?

**Answer**:
Google Gemini API is used for AI-powered data extraction:

```typescript
// config/google-ai-config.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);
const genAIModel = "gemini-pro-vision";  // Vision model for images

export { genAI, genAIModel };

// SERVICE: Receipt extraction
async function extractReceiptWithGemini(imageUrl: string) {
  const prompt = `
    Extract from this receipt image:
    1. Total amount
    2. Store/merchant name
    3. Items purchased
    4. Purchase date
    5. Category (groceries, restaurant, shopping, etc.)
    
    Return as JSON: {
      amount: number,
      storeName: string,
      items: [string],
      date: string (YYYY-MM-DD),
      category: string
    }
  `;
  
  const result = await genAI.models.generateContent({
    model: genAIModel,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64EncodedImage  // Image as base64
            }
          }
        ]
      }
    ],
    config: { responseMimeType: "application/json" }
  });
  
  return JSON.parse(result.text);
}

// USAGE in controller:
const extractedData = await extractReceiptWithGemini(receiptImageUrl);
// {
//   amount: 45.99,
//   storeName: "Walmart",
//   items: ["Milk", "Bread", "Eggs"],
//   date: "2026-05-01",
//   category: "groceries"
// }
```

**Why Gemini?**:
- **Vision Capability**: Understands images like humans
- **JSON Output**: Structured data extraction
- **Accuracy**: Better than traditional OCR
- **Multi-task**: Can also generate reports, summaries
- **Cost-effective**: Pay per API call

---

### Q16: How is the email service (Resend) configured?

**Answer**:
Resend API is used to send transactional emails:

```typescript
// config/resend.config.ts
import { Resend } from "resend";

const resend = new Resend(Env.RESEND_API_KEY);

export default resend;

// mailers/report_mailer.ts
import resend from "../config/resend.config";

async function sendReportEmail(user: User, report: Report) {
  try {
    const result = await resend.emails.send({
      from: Env.RESEND_MAILER_SENDER,  // "noreply@finance-ai.com"
      to: user.email,
      subject: `Your Financial Report - ${report.title}`,
      html: generateReportHTML(report)  // HTML email template
    });
    
    if (result.error) {
      console.error("Email send failed:", result.error);
      return false;
    }
    
    console.log("Email sent successfully:", result.data.id);
    return true;
  } catch (error) {
    console.error("Resend error:", error);
    return false;
  }
}

// EMAIL TEMPLATE
function generateReportHTML(report: Report) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>${report.title}</h1>
        <p>${report.summary}</p>
        
        <h2>Financial Summary</h2>
        <ul>
          <li>Total Income: $${report.totalIncome}</li>
          <li>Total Expenses: $${report.totalExpenses}</li>
          <li>Net Income: $${report.netIncome}</li>
        </ul>
        
        <h2>Insights</h2>
        ${report.insights.map(i => `<p>• ${i}</p>`).join('')}
        
        <a href="${Env.FRONTEND_ORIGIN}/reports/${report._id}">
          View Full Report
        </a>
      </body>
    </html>
  `;
}

// USAGE in cron job
async function sendScheduledReports() {
  const users = await User.find({});
  for (const user of users) {
    const report = await generateReport(user._id);
    await sendReportEmail(user, report);
  }
}
```

---

## SECTION 5: ADVANCED PATTERNS & CONCEPTS

### Q17: Explain the asyncHandler middleware

**Answer**:
The asyncHandler wraps async controllers to catch errors automatically:

```typescript
// middlewares/asyncHandler.middleware.ts
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// WHY NEEDED?
// Problem: Express doesn't catch errors in async functions automatically
// Solution: asyncHandler catches them and passes to errorHandler

// USAGE:
// ❌ Without asyncHandler (error not caught):
app.get("/transaction", async (req, res) => {
  const transaction = await Transaction.findById(id);  // Error thrown
  // Express won't catch this error
});

// ✅ With asyncHandler (error caught):
app.get(
  "/transaction", 
  asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(id);  // Error caught
    // Error passed to errorHandler middleware
  })
);

// FLOW:
1. Async function throws error
2. asyncHandler catches it
3. Calls next(error)
4. Global errorHandler processes it
5. Formatted error response sent to client
```

---

### Q18: How does the error handling system work?

**Answer**:
Multi-layer error handling with custom error classes:

```typescript
// utils/app-error.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
  }
}

export class BadRequestException extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class NotFoundException extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictException extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// USAGE in service:
if (userExists) {
  throw new ConflictException("Email already registered");
}

// ERROR HANDLING FLOW:
// 1. Service throws error
// 2. asyncHandler catches it
// 3. Calls next(error)
// 4. errorHandler middleware catches it
// 5. Formats response

// middlewares/errorHandler.middleware.ts
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error("Error:", error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack })
  });
};

// EXAMPLE ERROR FLOW:
POST /api/auth/login
{
  "email": "existing@email.com",
  "password": "wrong"
}

→ authController → authService → throws UnauthorizedException
→ asyncHandler catches → calls next(error)
→ errorHandler catches → formats response:

{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

---

### Q19: How are cron jobs implemented for scheduled tasks?

**Answer**:
Cron jobs run scheduled tasks at specific intervals:

```typescript
// crons/index.ts
import { scheduleJob } from "node-schedule";
import { transactionJob } from "./jobs/transaction.job";
import { reportJob } from "./jobs/report_job";

export const initializeCrons = async () => {
  // Recurring transactions: Every hour
  scheduleJob("0 * * * *", async () => {
    console.log("Running transaction job...");
    await transactionJob();
  });
  
  // Report generation: Every Sunday at 9 AM
  scheduleJob("0 9 * * 0", async () => {
    console.log("Running report job...");
    await reportJob();
  });
  
  console.log("Cron jobs initialized");
};

// crons/jobs/transaction.job.ts
export const transactionJob = async () => {
  try {
    // Find recurring transactions due for creation
    const recurringTransactions = await Transaction.find({
      recurring: true,
      nextDueDate: { $lte: new Date() }
    });
    
    for (const transaction of recurringTransactions) {
      // Create new transaction copy
      const newTransaction = new Transaction({
        userId: transaction.userId,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        type: transaction.type,
        date: new Date(),
        recurring: true,
        recurringFrequency: transaction.recurringFrequency
      });
      
      await newTransaction.save();
      
      // Update nextDueDate based on frequency
      const nextDate = addFrequency(
        new Date(),
        transaction.recurringFrequency
      );
      
      transaction.nextDueDate = nextDate;
      await transaction.save();
    }
    
    console.log(`Created ${recurringTransactions.length} recurring transactions`);
  } catch (error) {
    console.error("Transaction job error:", error);
  }
};

// crons/jobs/report_job.ts
export const reportJob = async () => {
  try {
    // Find users with auto-report enabled
    const settings = await ReportSetting.find({
      autoGenerateReports: true,
      nextReportDate: { $lte: new Date() }
    }).populate("userId");
    
    for (const setting of settings) {
      const user = setting.userId;
      
      // Generate report
      const report = await generateReport(user._id);
      
      // Send email
      await sendReportEmail(user, report);
      
      // Update next report date
      const nextDate = addFrequency(
        new Date(),
        setting.reportFrequency
      );
      
      setting.nextReportDate = nextDate;
      setting.lastReportDate = new Date();
      await setting.save();
    }
    
    console.log(`Sent ${settings.length} reports`);
  } catch (error) {
    console.error("Report job error:", error);
  }
};

// CRON PATTERN FORMAT:
// ┌───────────── second (0 - 59)
// │ ┌───────────── minute (0 - 59)
// │ │ ┌───────────── hour (0 - 23)
// │ │ │ ┌───────────── day of month (1 - 31)
// │ │ │ │ ┌───────────── month (1 - 12)
// │ │ │ │ │ ┌───────────── day of week (0 - 7)
// │ │ │ │ │ │
// * * * * * *

// EXAMPLES:
"0 * * * *"      // Every hour
"0 0 * * *"      // Every day at midnight
"0 0 * * 0"      // Every Sunday at midnight
"0 9 * * *"      // Every day at 9 AM
"0 0 1 * *"      // First day of each month
"*/15 * * * *"   // Every 15 minutes
```

---

### Q20: How is JWT token validation implemented?

**Answer**:
JWT tokens are validated using the `jsonwebtoken` library:

```typescript
// utils/jwt.ts
import jwt from "jsonwebtoken";
import { Env } from "../config/env.config";

// Generate Access Token
export const generateAccessToken = (userId: string) => {
  return jwt.sign(
    { userId },  // Payload
    Env.JWT_SECRET,  // Secret key
    { expiresIn: Env.JWT_EXPRESS_IN }  // Expires in 15 min
  );
};

// Generate Refresh Token
export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    Env.JWT_REFRESH_SECRET,
    { expiresIn: Env.JWT_REFRESH_EXPIRES_IN }  // Expires in 7 days
  );
};

// Verify Token
export const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, decoded };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
};

// MIDDLEWARE: authMiddleware
export const authMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        message: "Authorization header missing" 
      });
    }
    
    // Token format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        message: "Token not provided" 
      });
    }
    
    // Verify token
    const { valid, decoded, error } = verifyToken(token, Env.JWT_SECRET);
    
    if (!valid) {
      return res.status(401).json({ 
        message: `Token invalid: ${error}` 
      });
    }
    
    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

// JWT TOKEN STRUCTURE:
// Access Token payload:
// {
//   userId: "507f1f77bcf86cd799439011",
//   iat: 1620000000,  // Issued at
//   exp: 1620003600   // Expires at (15 min from iat)
// }

// Refresh Token payload:
// {
//   userId: "507f1f77bcf86cd799439011",
//   iat: 1620000000,
//   exp: 1627776000   // Expires at (7 days from iat)
// }

// VERIFICATION PROCESS:
// 1. Client sends: Authorization: Bearer <token>
// 2. Server extracts token
// 3. Server decodes header.payload using Base64
// 4. Server verifies signature:
//    signature_received == HMAC(header.payload, secret)?
// 5. If true: Token valid, extract payload
// 6. If false: Token tampered, reject with 401
```

**JWT Structure (3 parts separated by dots)**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE2MjAwMDAwMDB9.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ

1. Header (Base64): {"alg":"HS256","typ":"JWT"}
2. Payload (Base64): {"userId":"507f1f77bcf86cd799439011","iat":1620000000}
3. Signature (HMAC): TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
   Signature = HMAC_SHA256(Header.Payload, secret)
```

---

## KEY DEFINITIONS & CONCEPTS

### 1. **JWT (JSON Web Token)**
A compact, self-contained way to represent claims between two parties. Used for stateless authentication.

**Structure**: `Header.Payload.Signature`
- **Header**: Algorithm and token type
- **Payload**: Claims (data)
- **Signature**: Verification (HMAC with secret)

**Why JWT?**:
- Stateless (no server storage needed)
- Self-contained (info embedded in token)
- Secure (signature prevents tampering)
- Scalable (works with multiple servers)

---

### 2. **Refresh Token Rotation**
Access tokens are short-lived (15 min). When expired, client uses refresh token to get a new access token without re-logging in.

**Benefits**:
- **Security**: Access token can't be used long if stolen
- **UX**: User stays logged in without password re-entry
- **Control**: Server can invalidate refresh tokens anytime

---

### 3. **Bcrypt Hashing**
Algorithm to securely hash passwords. Can't be reversed (one-way hash).

```typescript
// During registration
const hashedPassword = await bcrypt.hash(password, 10);  // salt rounds: 10
// During login
const matches = await bcrypt.compare(password, hashedPassword);
```

**Why Bcrypt?**:
- Slow (intentionally) - prevents brute force
- Salting - even same password gets different hash
- Industry standard for password hashing

---

### 4. **MongoDB Aggregation Pipeline**
Framework for data transformation and analysis using stages.

```typescript
// Example: Count transactions by category
Transaction.aggregate([
  { $match: { userId: userId } },           // Filter
  { $group: { _id: "$category", count: { $sum: 1 } } },  // Group
  { $sort: { count: -1 } }                   // Sort
])
```

**Common Stages**:
- `$match`: Filter documents (like WHERE)
- `$group`: Group by field (like GROUP BY)
- `$sort`: Sort results
- `$project`: Shape documents
- `$lookup`: Join with other collections

---

### 5. **Multer**
Middleware for handling file uploads in Express.

```typescript
const upload = multer({ 
  storage: multer.memoryStorage(),  // Store in RAM
  fileSize: 5 * 1024 * 1024  // 5MB limit
});

app.post("/upload", upload.single("file"), handler);
// req.file contains: buffer, originalname, mimetype, etc.
```

---

### 6. **Cloudinary**
Cloud image/media hosting service with CDN.

**Features**:
- Upload images
- Get secure URLs
- Auto-optimize images
- CDN delivery worldwide
- Transformations (resize, format, etc.)

---

### 7. **MERN Stack**
Full-stack JavaScript framework:
- **M**ongoDB: Database
- **E**xpress: Backend framework
- **R**eact: Frontend framework
- **N**ode.js: JavaScript runtime

**Advantages**:
- Single language (JavaScript)
- Fast development
- Large ecosystem
- Easy to find developers

---

### 8. **REST API**
Representational State Transfer - architecture for APIs.

**Principles**:
- Use HTTP methods: GET (read), POST (create), PUT (update), DELETE (delete)
- Stateless: Each request contains all needed info
- Resources-oriented: URLs represent resources

```
GET /api/users       → List all users
POST /api/users      → Create user
GET /api/users/:id   → Get specific user
PUT /api/users/:id   → Update user
DELETE /api/users/:id → Delete user
```

---

### 9. **Middleware**
Function that has access to request, response, and next function.

**Purpose**:
- Modify request/response
- End request-response cycle
- Call next middleware

**Execution Order**:
```
Request → Middleware1 → Middleware2 → Controller → Response
```

---

### 10. **Aggregation (Analytics)**
Combining and processing data to extract insights.

**Examples**:
- Total expenses by category
- Average daily spending
- Spending trend over time
- Comparison to previous period

---

# 🔄 IMPORTANT CODE FLOWS

## Flow 1: Complete Authentication Flow

```
USER REGISTRATION:
1. Frontend: POST /api/auth/register
   {email, password, name}
   ↓
2. Controller: validateInput() → call service
   ↓
3. Service: Check if email exists
   ├─ If exists: throw ConflictException
   ├─ If not: hash password with bcrypt
   ├─ Save to database
   └─ Return user (without password)
   ↓
4. Response: {message, user}

USER LOGIN:
1. Frontend: POST /api/auth/login
   {email, password}
   ↓
2. Controller: validateInput() → call service
   ↓
3. Service: Find user by email
   ├─ If not found: throw NotFoundException
   ├─ Compare password with hash
   ├─ If mismatch: throw UnauthorizedException
   ├─ Generate access token (15 min)
   ├─ Generate refresh token (7 days)
   └─ Return tokens + user
   ↓
4. Response: {message, access_token, refresh_token, user}
   ↓
5. Frontend: Store tokens in localStorage

PROTECTED REQUEST:
1. Frontend: GET /api/user/current-user
   Header: Authorization: Bearer <access_token>
   ↓
2. Middleware: authMiddleware
   ├─ Extract token from header
   ├─ Verify token with JWT_SECRET
   ├─ Extract userId
   ├─ If valid: Attach to req.user
   ├─ If invalid: Send 401
   └─ Call next()
   ↓
3. Controller: Use req.user._id to query database
   ↓
4. Response: {message, user}

TOKEN REFRESH:
1. Frontend detects: access_token expired
   ↓
2. Frontend: POST /api/auth/refresh-token
   Header: Authorization: Bearer <refresh_token>
   ↓
3. Middleware: authMiddleware (verifies refresh token)
   ↓
4. Controller: Call service
   ↓
5. Service: Verify refresh token, generate new access token
   ↓
6. Response: {message, access_token, refresh_token}
   ↓
7. Frontend: Update tokens in localStorage
```

---

## Flow 2: Receipt Scanning Flow

```
1. USER UPLOADS RECEIPT:
   Frontend: POST /api/transaction/scan-receipt
   Form Data: {receipt: <image>}
   Header: Authorization: Bearer <token>
   ↓
2. MIDDLEWARE: authMiddleware
   ├─ Verify JWT
   ├─ Extract userId
   └─ Continue to controller
   ↓
3. MULTER: upload.single("receipt")
   ├─ Receive file from request
   ├─ Store in memory (buffer)
   └─ Attach to req.file
   ↓
4. CONTROLLER: scanReceiptController
   ├─ Extract userId from req.user
   ├─ Extract file from req.file
   └─ Call service
   ↓
5. SERVICE: scanReceiptService(userId, file)
   
   a) UPLOAD TO CLOUDINARY:
      ├─ Send file buffer to Cloudinary
      ├─ Cloudinary returns secure URL
      └─ imageUrl = "https://res.cloudinary.com/..."
   
   b) EXTRACT WITH GEMINI:
      ├─ Send imageUrl + prompt to Gemini API
      ├─ Prompt: "Extract amount, store, items, date"
      ├─ Gemini processes image
      └─ Returns: {amount: 45.99, storeName: "Walmart", ...}
   
   c) DETERMINE CATEGORY:
      ├─ Use storeName to guess category
      ├─ Example: "Walmart" → "groceries"
      └─ category = extractedData.category
   
   d) CREATE TRANSACTION:
      ├─ New Transaction object
      ├─ amount: from Gemini
      ├─ category: determined
      ├─ description: store name
      ├─ type: "expense"
      ├─ date: from Gemini
      ├─ receiptImage: from Cloudinary
      ├─ userId: from JWT
      └─ Save to MongoDB
   
   e) RETURN TRANSACTION
      └─ {_id, amount, category, description, ...}
   ↓
6. CONTROLLER: Format response
   ↓
7. RESPONSE: 201 Created
   {
     message: "Receipt scanned and transaction created",
     transaction: {_id, amount, category, ...}
   }
   ↓
8. FRONTEND: Show success, update transaction list
```

---

## Flow 3: Report Generation Flow

```
MANUAL TRIGGER:
1. User clicks "Generate Report"
   ↓
2. Frontend: GET /api/report/generate?dateRange=lastMonth
   Header: Authorization: Bearer <token>
   ↓
3. MIDDLEWARE: authMiddleware (verify + extract userId)
   ↓
4. CONTROLLER: generateReportController
   ├─ Extract userId from req.user
   ├─ Extract dateRange from query
   └─ Call service
   ↓
5. SERVICE: generateReportService(userId, dateRange)
   
   a) FETCH TRANSACTIONS:
      ├─ Query: Transaction.find({userId, date: {$gte, $lte}})
      ├─ Get all transactions for period
      └─ transactions = [...]
   
   b) CALCULATE TOTALS:
      ├─ totalIncome = SUM(amt where type="income")
      ├─ totalExpenses = SUM(amt where type="expense")
      ├─ netIncome = totalIncome - totalExpenses
      └─ byCategory = GROUP BY category
   
   c) GENERATE INSIGHTS WITH GEMINI:
      ├─ Prepare prompt:
      │  {
      │    totalIncome: 5000,
      │    totalExpenses: 2500,
      │    categories: {groceries: 500, ...},
      │    message: "Generate insights and budget suggestions"
      │  }
      ├─ Call Gemini API
      └─ Receive: insights[], recommendations[]
   
   d) CREATE REPORT OBJECT:
      ├─ title: "Financial Report - April 2026"
      ├─ summary: AI-generated text
      ├─ insights: from Gemini
      ├─ totalIncome: 5000
      ├─ totalExpenses: 2500
      ├─ netIncome: 2500
      ├─ dateRange: "lastMonth"
      ├─ userId: from JWT
      └─ Save to MongoDB
   
   e) RETURN REPORT
      └─ {_id, title, summary, insights, ...}
   ↓
6. CONTROLLER: Format response
   ↓
7. RESPONSE: 200 OK
   {
     message: "Report generated successfully",
     report: {...}
   }
   ↓
8. FRONTEND: Display report, show charts

AUTO-TRIGGER (CRON):
1. Cron job runs (e.g., every Sunday 9 AM)
2. Find all users with auto-report enabled
3. For each user:
   ├─ Generate report (same as above)
   └─ Send email
4. Update nextReportDate in settings
5. Log completion
```

---

## Flow 4: Error Handling Flow

```
SCENARIO: User tries to login with wrong password

1. Request: POST /api/auth/login
   {email: "user@example.com", password: "wrong"}
   ↓
2. Controller: loginController
   ├─ Extract email, password
   └─ Call service
   ↓
3. Service: loginService
   ├─ Find user by email
   ├─ Compare password: bcrypt.compare(wrong, hash) → false
   ├─ Throw error: UnauthorizedException("Invalid credentials")
   └─ Error bubbles up
   ↓
4. asyncHandler: Catches error
   ├─ Catches thrown exception
   └─ Calls next(error)
   ↓
5. ERROR GOES TO MIDDLEWARE STACK:
   ├─ Skips remaining middlewares
   └─ Reaches errorHandler
   ↓
6. errorHandler MIDDLEWARE:
   ├─ Receives error object
   ├─ Extract: statusCode (401), message ("Invalid credentials")
   ├─ Log error for debugging
   ├─ Format response:
   │  {
   │    success: false,
   │    message: "Invalid credentials",
   │    statusCode: 401
   │  }
   └─ Send to client
   ↓
7. RESPONSE: 401 Unauthorized
   {
     success: false,
     message: "Invalid credentials",
     statusCode: 401
   }
   ↓
8. FRONTEND: Show error message to user
```

---

This guide covers everything you need to ace your interviews! Good luck! 🚀

