# 💰 Finance Tracker — MERN Stack

A complete Personal Finance Tracker built with MongoDB, Express, React, and Node.js.

## ✅ Features
- JWT Authentication (Register, Login, Logout)
- Add Income & Expenses with category, date, description
- Dashboard with balance, monthly stats, recent transactions
- Transaction History with filters (type, category, date range, search)
- Analytics — Pie chart, Bar chart, Line chart (Recharts)
- Budget Goals with progress bars and email alerts
- Recurring Transactions (auto-add monthly)
- Dark Mode toggle
- Export transactions as CSV
- Fully responsive with Bootstrap 5

## 🚀 How to Run

### Step 1 — Backend
```bash
cd backend
npm install
npm run dev
```
Server starts at: http://localhost:5001

### Step 2 — Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
App opens at: http://localhost:5173

### Step 3 — Open Browser
```
http://localhost:5173
```

## ⚙️ Environment Variables (backend/.env)
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/finance-tracker
JWT_SECRET=financetracker_secret_key_2024
EMAIL_USER=your_gmail@gmail.com       ← optional, for budget alerts
EMAIL_PASS=your_gmail_app_password    ← optional
```

## 📁 Project Structure
```
finance-tracker/
├── backend/
│   ├── config/db.js
│   ├── middleware/authMiddleware.js
│   ├── models/         (User, Transaction, Budget, Recurring)
│   ├── routes/         (auth, transactions, budgets, recurring)
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── pages/      (Login, Register, Dashboard, Transactions, Analytics, Budgets, Recurring)
        ├── components/ (Layout, AddTransactionModal)
        ├── context/    (AuthContext)
        └── api/        (api.js)
```

## 🗄️ API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET  | /api/transactions | Get all (with filters) |
| POST | /api/transactions | Add transaction |
| DELETE | /api/transactions/:id | Delete |
| GET  | /api/transactions/summary | Dashboard stats |
| GET  | /api/transactions/charts/category | Pie chart data |
| GET  | /api/transactions/charts/monthly | Bar/line chart data |
| GET  | /api/transactions/export/csv | Export CSV |
| GET  | /api/budgets | Get budgets with progress |
| POST | /api/budgets | Create/update budget |
| DELETE | /api/budgets/:id | Delete budget |
| GET  | /api/recurring | Get recurring list |
| POST | /api/recurring | Create recurring |
| PUT  | /api/recurring/:id | Toggle active |
| DELETE | /api/recurring/:id | Delete |
| POST | /api/recurring/process | Auto-process due entries |
