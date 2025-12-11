# Badminton Court Booking System

A full-stack web application for booking badminton courts, managing coaches, equipment, and pricing rules. Built with Express.js backend and React frontend.

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Setup](#database-setup)
- [Assumptions](#assumptions)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Features](#features)

## Project Overview

This application provides a comprehensive solution for managing badminton court bookings with the following capabilities:

- **Court Management**: View and manage available courts
- **Booking System**: Reserve courts for specific dates and times
- **Coach Management**: Register and manage coaches
- **Equipment Tracking**: Manage equipment availability and assignments
- **Admin Dashboard**: Administer courts, coaches, equipment, and pricing rules
- **User Authentication**: Secure login and authorization
- **Dynamic Pricing**: Apply pricing rules based on court, time slots, and demand

## System Architecture

```
Badminton Court Booking System
├── Frontend (React + Vite)
│   ├── Pages: Booking, Admin Dashboard, Login
│   ├── Components: Booking Modal
│   ├── Context: Authentication state management
│   └── Services: API client
└── Backend (Express.js + PostgreSQL)
    ├── Controllers: Business logic
    ├── Routes: API endpoints
    ├── Models: Data models (Sequelize ORM)
    ├── Middleware: Authentication
    └── Utils: Price calculation
```

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **npm**: v8 or higher (comes with Node.js)
- **PostgreSQL**: v12 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control
- **Any Code Editor**: VS Code recommended

### Verify Installation

```bash
node --version
npm --version
psql --version
```

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment configuration file:**
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   # Database Configuration
   DB_NAME=badminton_db
   DB_USER=postgres
   DB_PASS=your_password_here
   DB_HOST=localhost
   
   # Server Configuration
   PORT=5000
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Create PostgreSQL database:**
   ```bash
   psql -U postgres
   CREATE DATABASE badminton_db;
   \q
   ```

5. **Run database migrations (if applicable):**
   The Sequelize models will automatically sync with the database on first run.

6. **Seed the database (optional):**
   ```bash
   node seed.js
   ```
   This populates the database with initial data for courts, coaches, and equipment.

7. **Start the backend server:**
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory (from root):**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment configuration file:**
   Create a `.env` file in the `frontend` directory (if needed):
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or the next available port)

5. **Build for production:**
   ```bash
   npm run build
   ```

### Database Setup

The application uses **PostgreSQL** with **Sequelize ORM**. 

1. **Ensure PostgreSQL is running:**
   - **Windows**: Check Services or use PostgreSQL installer
   - **macOS**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`

2. **Create database:**
   ```bash
   psql -U postgres -c "CREATE DATABASE badminton_db;"
   ```

3. **Database tables** are automatically created by Sequelize models on first server startup.

## Assumptions

This project is built on the following assumptions:

### Technical Assumptions
- **PostgreSQL is installed locally** on your machine and accessible at `localhost`
- **Node.js version 16+** is installed with npm package manager
- **Express.js** is used for the REST API backend
- **React 19** with Vite as the frontend build tool
- **Sequelize ORM** for database operations and migrations
- **JWT (JSON Web Tokens)** for authentication and authorization
- **CORS** is enabled to allow frontend-backend communication

### Database Assumptions
- PostgreSQL username is `postgres` with a configurable password
- Database name is `badminton_db` (configurable via `.env`)
- Tables are created automatically using Sequelize models
- No pre-existing database or schema is required

### Functional Assumptions
- **Default Admin Credentials** are provided during seeding (check `seed.js`)
- **Pricing Model**: Courts have dynamic pricing based on time slots, demand, and special rules
- **Booking Rules**: Bookings are made for specific courts and time slots
- **Coach Assignment**: Coaches can be assigned to bookings
- **Equipment Management**: Equipment can be tracked and assigned to courts
- **User Roles**: System supports at least two roles - Admin and User (regular customer)
- **Authentication**: All protected routes require JWT token in Authorization header

### Frontend Assumptions
- **Vite** is used for fast development and optimized production builds
- **React Router v7** for client-side navigation
- **Tailwind CSS** for styling
- **Axios** for HTTP requests to the backend
- **Context API** is used for state management (Authentication)
- **Browser Compatibility**: Modern browsers with ES6+ support

### Development Assumptions
- **nodemon** is used for automatic backend restart during development
- **ESLint** is configured for code quality checks
- **Nodemon** watches for file changes in the backend directory
- Development URLs: Frontend on port 5173, Backend on port 5000
- Environment variables are loaded from `.env` files (not committed to git)

### Deployment Assumptions
- Application will be deployed on a server with Node.js and PostgreSQL installed
- Production environment variables will be configured on the deployment platform
- Frontend will be built as static files and served by a web server
- Backend API will be hosted on a separate server or same server on different port

## Project Structure

```
court-booking-system/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection config
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── coachController.js
│   │   ├── courtController.js
│   │   └── equipmentController.js
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── models/                  # Sequelize models
│   │   ├── User.js
│   │   ├── Court.js
│   │   ├── Booking.js
│   │   ├── Coach.js
│   │   ├── Equipment.js
│   │   ├── PricingRule.js
│   │   └── index.js
│   ├── routes/                  # API endpoints
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── coachRoutes.js
│   │   ├── courtRoutes.js
│   │   └── equipmentRoutes.js
│   ├── utils/
│   │   └── priceCalculator.js   # Pricing logic
│   ├── server.js                # Express app initialization
│   ├── seed.js                  # Database seeding script
│   └── package.json
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   └── BookingModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── pages/
│   │   │   ├── BookingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── eslint.config.js
│   └── package.json
└── README.md
```

## Available Scripts

### Backend Scripts

```bash
# Start development server (with auto-reload via nodemon)
npm start

# Run tests (not yet configured)
npm test
```

### Frontend Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_NAME` | PostgreSQL database name | `badminton_db` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASS` | PostgreSQL password | `your_secure_password` |
| `DB_HOST` | PostgreSQL host address | `localhost` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_12345` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000` |

## API Routes

### Authentication Routes (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Courts Routes (`/courts`)
- `GET /courts` - Get all courts
- `GET /courts/:id` - Get court by ID
- `POST /courts` - Create court (Admin only)
- `PUT /courts/:id` - Update court (Admin only)
- `DELETE /courts/:id` - Delete court (Admin only)

### Bookings Routes (`/bookings`)
- `GET /bookings` - Get user's bookings
- `GET /bookings/:id` - Get booking by ID
- `POST /bookings` - Create new booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Coaches Routes (`/coaches`)
- `GET /coaches` - Get all coaches
- `GET /coaches/:id` - Get coach by ID
- `POST /coaches` - Create coach (Admin only)
- `PUT /coaches/:id` - Update coach (Admin only)
- `DELETE /coaches/:id` - Delete coach (Admin only)

### Equipment Routes (`/equipment`)
- `GET /equipment` - Get all equipment
- `GET /equipment/:id` - Get equipment by ID
- `POST /equipment` - Create equipment (Admin only)
- `PUT /equipment/:id` - Update equipment (Admin only)
- `DELETE /equipment/:id` - Delete equipment (Admin only)

### Admin Routes (`/admin`)
- Various admin management endpoints

## Features

### User Features
- ✅ Browse available courts
- ✅ Check court availability for specific dates
- ✅ Make court bookings
- ✅ View booking history
- ✅ Cancel bookings
- ✅ User authentication (login/register)

### Admin Features
- ✅ Manage courts (CRUD operations)
- ✅ Manage coaches (CRUD operations)
- ✅ Manage equipment (CRUD operations)
- ✅ Set dynamic pricing rules
- ✅ View all bookings
- ✅ User management
- ✅ Admin dashboard

### System Features
- ✅ Dynamic price calculation based on rules
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ CORS enabled for cross-origin requests
- ✅ PostgreSQL database with Sequelize ORM
- ✅ Responsive React frontend with Tailwind CSS

## Troubleshooting

### Database Connection Error
**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
1. Ensure PostgreSQL is running
2. Check DB credentials in `.env`
3. Verify database `badminton_db` exists

### Port Already in Use
**Problem**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
1. Change `PORT` in `.env` to an available port
2. Or kill the process: `lsof -i :5000` (macOS/Linux) or `netstat -ano | findstr :5000` (Windows)

### CORS Error
**Problem**: Frontend cannot communicate with backend

**Solution**:
1. Ensure backend CORS is configured correctly
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Verify backend is running on expected port

### Module Not Found
**Problem**: `Cannot find module 'express'`

**Solution**:
1. Ensure you're in the correct directory (backend or frontend)
2. Run `npm install` to install dependencies
3. Delete `node_modules` and `package-lock.json`, then reinstall

## Support & Contribution

For issues or contributions, please refer to the project's git repository.

---

**Last Updated**: December 2025
**Version**: 1.0.0
