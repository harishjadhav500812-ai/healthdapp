# 🚀 How to Run HealthChain DApp

**Complete Guide to Starting the Application**

---

## 📋 Prerequisites

Before running the project, ensure you have:

- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **MongoDB** - Running locally or MongoDB Atlas connection
- ✅ **Git** (optional) - For cloning the repository

---

## 🎯 Quick Start (Recommended)

### Option 1: Using Batch Files (Windows)

1. **Start Backend Server:**
   ```
   Double-click: RUN_BACKEND.bat
   ```
   - Opens a new command window
   - Installs dependencies (if needed)
   - Starts backend on http://localhost:5000

2. **Start Frontend (in a new window):**
   ```
   Double-click: RUN_FRONTEND_NEW.bat
   ```
   - Opens a new command window
   - Installs dependencies (if needed)
   - Starts frontend on http://localhost:5173

3. **Open Browser:**
   - Navigate to: http://localhost:5173
   - Login with test credentials (see below)

---

## 💻 Manual Start (All Platforms)

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ..
npm install
```

### Step 2: Configure Environment

**Backend Environment (.env file):**

Create `backend/.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

**Note:** The project already has MongoDB configured. Check if `.env` exists in backend folder.

### Step 3: Start Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
═══════════════════════════════════════════════════════
   🏥 HealthChain DApp Backend Server
═══════════════════════════════════════════════════════
   Environment: development
   Server running on port: 5000
   API URL: http://localhost:5000
   Health Check: http://localhost:5000/health
═══════════════════════════════════════════════════════

✅ MongoDB Connected: [your-db-host]
📊 Database Name: kycv
```

### Step 4: Start Frontend (New Terminal)

```bash
cd healthchain-dapp
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Step 5: Access Application

Open browser and navigate to:
```
http://localhost:5173
```

---

## 🔐 Test Credentials

### Patient Account
- **Email:** `testpatient@healthchain.com`
- **Password:** `password123`
- **Role:** PATIENT

### Doctor Account
- **Email:** `doctor@healthchain.com`
- **Password:** `password123`
- **Role:** DOCTOR

---

## 🧪 Verify Backend is Running

### Method 1: Health Check Endpoint
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "HealthChain API is running",
  "timestamp": "2025-11-25T20:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### Method 2: Browser
Open in browser:
```
http://localhost:5000/health
```

### Method 3: Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"testpatient@healthchain.com\",\"password\":\"password123\"}"
```

---

## 📱 Application Features

Once running, you can:

### As a Patient:
1. ✅ Login/Register
2. ✅ Upload medical records
3. ✅ View your uploaded records
4. ✅ Approve/Reject doctor access requests
5. ✅ Delete records
6. ✅ View system events

### As a Doctor:
1. ✅ Login/Register
2. ✅ Request access to patient records
3. ✅ View granted access records
4. ✅ View patient medical records (if approved)
5. ✅ View system events

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Port 5000 already in use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use the provided batch file
backend\kill-port.bat
```

**Problem:** MongoDB connection error
- Check if `.env` file exists in backend folder
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas whitelist (if using cloud)

**Problem:** "Cannot find module" errors
```bash
cd backend
npm install
```

### Frontend Issues

**Problem:** Port 5173 already in use
- Close other Vite dev servers
- Or change port in `vite.config.ts`

**Problem:** "Cannot connect to backend"
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Verify `API_URL` in `api.ts` is correct

**Problem:** Login fails with wrong credentials
- Use test credentials provided above
- Or create a new account via signup

---

## 📂 Project Structure

```
healthchain-dapp/
├── backend/                    # Backend server
│   ├── src/
│   │   ├── controllers/       # API logic
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, upload, etc.
│   │   └── server.js          # Entry point
│   ├── uploads/               # Uploaded files
│   └── package.json
├── views/                     # Frontend views (root)
├── components/                # Frontend components (root)
├── api.ts                     # API client (root)
├── index.tsx                  # App entry point
├── package.json               # Frontend dependencies
├── RUN_BACKEND.bat           # Start backend (Windows)
└── RUN_FRONTEND_NEW.bat      # Start frontend (Windows)
```

---

## 🔄 Development Workflow

### 1. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

### 2. Make Changes
- Backend changes will auto-restart (if using nodemon)
- Frontend changes will hot-reload automatically

### 3. Test APIs
Use the test credentials or create new accounts

### 4. View Logs
- Backend logs appear in Terminal 1
- Frontend logs in browser console (F12)

---

## 📊 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Available Endpoints

**Authentication:**
- POST `/auth/login` - User login
- POST `/auth/signup` - User registration
- GET `/auth/me` - Get current user

**Medical Records:**
- GET `/records` - Get all records
- POST `/records/upload` - Upload record
- DELETE `/records/:id` - Delete record

**Access Control:**
- POST `/access/request` - Request access
- GET `/access/requests` - Get requests
- PUT `/access/approve/:id` - Approve request
- PUT `/access/reject/:id` - Reject request
- GET `/access/granted` - Get granted access

**System Events:**
- GET `/events` - Get all events
- GET `/events/me` - Get user events

---

## 🎨 Frontend Routes

```
/                          → Landing page
/patient/login            → Patient login
/patient/signup           → Patient signup
/patient/dashboard        → Patient dashboard
/patient/upload           → Upload records
/doctor/login             → Doctor login
/doctor/signup            → Doctor signup
/doctor/dashboard         → Doctor dashboard
/system-monitor           → System events
```

---

## 🔒 Security Notes

- JWT tokens stored in localStorage
- Passwords hashed with bcrypt
- CORS configured for localhost:5173
- File uploads restricted to specific types
- Role-based access control implemented

---

## 📚 Additional Documentation

- `TEST_CREDENTIALS.md` - All test account details
- `API_INTEGRATION_COMPLETE.md` - Complete API documentation
- `FORM_MODEL_VALIDATION.md` - Form validation details
- `LOGIN_FIX_SUMMARY.md` - Recent bug fixes

---

## ✅ Quick Checklist

Before reporting issues, verify:

- [ ] Node.js installed (check: `node --version`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected (check backend logs)
- [ ] Using correct test credentials
- [ ] Browser console shows no errors
- [ ] Backend console shows no errors

---

## 🆘 Need Help?

1. Check browser console (F12) for frontend errors
2. Check backend terminal for API errors
3. Verify all dependencies installed (`npm install`)
4. Try restarting both servers
5. Clear browser cache and localStorage

---

## 🎉 Success!

If everything is working, you should see:

✅ Backend: "HealthChain DApp Backend Server" banner
✅ MongoDB: "MongoDB Connected" message
✅ Frontend: Vite dev server running
✅ Browser: HealthChain landing page
✅ Login: Successfully login with test credentials

**Enjoy using HealthChain DApp!**

---

**Last Updated:** 2025-11-25
**Status:** Production Ready
**Version:** 1.0.0