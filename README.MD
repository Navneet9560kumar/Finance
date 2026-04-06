# Finance Dashboard Backend API

A robust, secure, and logically structured backend system for a Finance Dashboard. This API manages users, enforces Role-Based Access Control (RBAC), handles financial records (income/expenses), and provides powerful aggregation-based summaries for dashboard analytics.

## 🌐 Live API URL

**Base URL:** [https://finance-zorvyn-y85l.onrender.com](https://finance-zorvyn-y85l.onrender.com)

> **Note:** Since this is hosted on Render's free tier, the first request might take 30-50 seconds to wake up the server. Please be patient!

---

## 🚀 Tech Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| Runtime        | Node.js               |
| Framework      | Express.js            |
| Database       | MongoDB Atlas (Cloud) |
| ODM            | Mongoose              |
| Authentication | JSON Web Tokens (JWT) |
| Encryption     | bcryptjs              |

---

## ✨ Core Features

- **User & Role Management** — Secure registration and login with encrypted passwords. Three roles: Viewer, Analyst, and Admin. Admins can manage all users including activating or deactivating accounts.
- **Role-Based Access Control (RBAC)** — Middleware-level protection ensuring users only access what their role permits. Inactive users are blocked at the middleware level.
- **Financial Records Management** — Full CRUD operations for income and expense records.
- **Advanced Search & Filtering** — Powerful query support including Text Search (partial match), Date Ranges, Amount Ranges, and Dynamic Sorting (Highest amount, Newest, etc.).
- **Dashboard Analytics** — MongoDB Aggregation pipeline to calculate total income, total expenses, net balance, category-wise totals, recent activity, and monthly trends in a single optimized API call.
- **Data Validation & Error Handling** — Input validation on all endpoints, standard HTTP status codes, and a global error handling middleware to prevent server crashes.

---

## 🧪 Test Credentials (Seeded Data)

Use these credentials to quickly test the Role-Based Access Control (RBAC). All passwords are `password123`.

| Role    | Email Address    | Password    | Capabilities                                     |
| ------- | ---------------- | ----------- | ------------------------------------------------ |
| Admin   | admin@test.com   | password123 | Full access (Create, Edit, Delete, Manage Users) |
| Analyst | analyst@test.com | password123 | Can view Dashboard Summary & All Records         |
| Viewer  | viewer@test.com  | password123 | Can ONLY view Dashboard Summary                  |

> **Note:** Run `node seed.js` (if included in your repo) to generate these users and some dummy financial records automatically.

---

## 🔐 Access Control Rules

| Role    | View Summary | View Records | Create/Edit/Delete Records | Manage Users |
| ------- | ------------ | ------------ | -------------------------- | ------------ |
| Viewer  | ✅           | ❌           | ❌                         | ❌           |
| Analyst | ✅           | ✅           | ❌                         | ❌           |
| Admin   | ✅           | ✅           | ✅                         | ✅           |

> Inactive users are blocked from all routes regardless of role.

---

## 🛠️ Local Setup & Installation

**1. Clone the repository:**

```bash
git clone https://github.com/Navneet9560kumar/Finance
cd Financial
```

**2. Install dependencies:**

```bash
npm install
```

**3. Create `.env` file in the root folder:**

```env
PORT=3000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

**4. Start the development server:**

```bash
npm run dev
```

Server will start at `http://localhost:3000`

---

## 📚 API Endpoints

### 🔑 Authentication (Public)

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/register` | Register a new user         |
| POST   | `/api/auth/login`    | Login and receive JWT token |

> All other endpoints require `Authorization: Bearer <token>` header.

---

### 👤 User Management (Admin only)

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| GET    | `/api/users`            | Get all users                 |
| PUT    | `/api/users/:id/role`   | Update a user's role          |
| PUT    | `/api/users/:id/status` | Activate or deactivate a user |
| DELETE | `/api/users/:id`        | Delete a user                 |

---

### 📊 Dashboard & Analytics

| Method | Endpoint               | Description                                                          | Access                 |
| ------ | ---------------------- | -------------------------------------------------------------------- | ---------------------- |
| GET    | `/api/records/summary` | Total income, expenses, net balance, category totals, monthly trends | Viewer, Analyst, Admin |

---

### 💰 Financial Records

| Method | Endpoint           | Description                                      | Access         |
| ------ | ------------------ | ------------------------------------------------ | -------------- |
| GET    | `/api/records`     | Get all records (Supports advanced query params) | Analyst, Admin |
| POST   | `/api/records`     | Create a new record                              | Admin          |
| PUT    | `/api/records/:id` | Update an existing record                        | Admin          |
| DELETE | `/api/records/:id` | Delete a record                                  | Admin          |

#### Supported Query Parameters for `GET /api/records`:

| Parameter                 | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `search`                  | Text search in notes or category                             |
| `type`                    | `income` or `expense`                                        |
| `category`                | Exact category match                                         |
| `startDate` / `endDate`   | Filter by date range (`YYYY-MM-DD`)                          |
| `minAmount` / `maxAmount` | Filter by amount range                                       |
| `sort`                    | `amount_desc`, `amount_asc`, `oldest`, or `newest` (default) |

---

## 📦 Record Fields (For POST/PUT)

| Field      | Type   | Required | Description              |
| ---------- | ------ | -------- | ------------------------ |
| `amount`   | Number | ✅       | Must be greater than 0   |
| `type`     | String | ✅       | `income` or `expense`    |
| `category` | String | ✅       | e.g. Food, Salary, Rent  |
| `date`     | Date   | ❌       | Defaults to current date |
| `notes`    | String | ❌       | Optional description     |

---

## 💡 Design Decisions

- **Cloud Persistence** — MongoDB Atlas used for production-ready cloud storage.
- **Aggregation for Performance** — MongoDB `$aggregate` pipeline used for all dashboard calculations at the DB level, avoiding unnecessary data transfer.
- **Advanced Filtering** — Integrated regex matching and range queries directly into the Mongoose `find` operators.
- **Global Error Handling** — Centralized `errorMiddleware` catches all errors and returns clean JSON responses with appropriate status codes.
- **Inactive User Blocking** — The `protect` middleware fetches the user from DB on every request to check `isActive`, so deactivated users are blocked immediately even if their token is still valid.
- **asyncHandler Wrapper** — All async route handlers are wrapped to forward errors to the global error handler without try-catch in every route.
- **Input Validation** — Email format (regex) and password length (min 6 chars) validated on registration.

---

## ⚠️ Assumptions Made

- Any user can self-register with the default **Viewer** role. Only an Admin can upgrade roles.
- Soft delete is not implemented; `DELETE` permanently removes the record.
- No pagination is implemented on record listing (all records matching filters are returned).
