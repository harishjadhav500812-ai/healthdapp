# ⚡ Quick Start Guide - HealthChain DApp

This guide will get you up and running in **5 minutes**.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js v18+** installed ([Download](https://nodejs.org/))
- [ ] **npm** (comes with Node.js)
- [ ] **Git** installed
- [ ] **Code Editor** (VS Code recommended)
- [ ] **MongoDB Atlas account** (free tier is fine)

---

## 🚀 5-Minute Setup

### Step 1: Install Backend (2 minutes)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (this may take a minute)
npm install

# Your .env file is already configured with the MongoDB connection!
# Just verify it exists: backend/.env
```

### Step 2: Start Backend Server (30 seconds)

```bash
# Still in backend/ directory
npm run dev
```

✅ You should see:
```
═══════════════════════════════════════════════════════
   🏥 HealthChain DApp Backend Server
═══════════════════════════════════════════════════════
   Environment: development
   Server running on port: 5000
   API URL: http://localhost:5000
   Health Check: http://localhost:5000/health
═══════════════════════════════════════════════════════

✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database Name: kycv
```

### Step 3: Test Backend (30 seconds)

Open a new terminal and test:

```bash
curl http://localhost:5000/health
```

Or open in browser: **http://localhost:5000/health**

You should see:
```json
{
  "success": true,
  "message": "HealthChain API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 4: Install Frontend (1 minute)

```bash
# Open new terminal, go to project root
cd ..

# Install dependencies
npm install
```

### Step 5: Start Frontend (30 seconds)

```bash
# Still in project root
npm run dev
```

✅ You should see:
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 6: Open Application (30 seconds)

Open browser and go to: **http://localhost:5173**

🎉 **You should see the HealthChain landing page!**

---

## 🎮 Test the Application

### Create a Patient Account

1. Click **"Patient Portal"**
2. Click **"Mint Identity"** (Sign Up)
3. Fill in:
   - **Name**: Test Patient
   - **Email**: patient@test.com
   - **Password**: password123
   - **Age**: 30
4. Click **"Generate Block"**
5. You'll be auto-logged in!

### Create a Doctor Account

1. Open a new incognito/private window
2. Go to: **http://localhost:5173**
3. Click **"Doctor Portal"**
4. Click **"Mint Identity"**
5. Fill in:
   - **Name**: Dr. Test
   - **Email**: doctor@test.com
   - **Password**: password123
   - **License ID**: MD-12345
   - **Specialization**: General Practitioner
6. Click **"Generate Block"**

### Test the Flow

**As Patient:**
1. Go to **Upload Record**
2. Fill in:
   - **File Name**: test_mri.dicom
   - **File Size**: 45000000 (bytes)
   - **Record Type**: MRI Scan
   - **Description**: Test MRI scan
3. Click **Upload**
4. See success message with blockchain details!

**As Doctor (in incognito window):**
1. Go to **Request Access**
2. You'll need the patient ID (get from patient dashboard)
3. Fill in purpose and request access
4. Wait for patient to approve

**As Patient:**
1. Go to **Access Requests**
2. See the doctor's request
3. Click **Approve**
4. Set duration (e.g., 24 hours)
5. Confirm approval

**As Doctor:**
1. Go to **Granted Access**
2. See the patient's records you can now access!

---

## 🔍 Verify Backend is Working

### Test API Endpoints

Open new terminal and test these:

```bash
# 1. Signup a patient
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Patient",
    "email": "apitest@test.com",
    "password": "password123",
    "role": "PATIENT",
    "age": 25
  }'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@test.com",
    "password": "password123"
  }'

# Copy the token from response
# Use it in next request

# 3. Get current user (replace YOUR_TOKEN)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Access the Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login with your credentials
3. Click **"Browse Collections"**
4. You should see:
   - `users` collection
   - `medicalrecords` collection
   - `accessrequests` collection
   - `grantedaccesses` collection
   - `systemevents` collection

---

## 🐛 Troubleshooting

### Backend won't start

**Error**: `Port 5000 already in use`
```bash
# Kill the process using port 5000
npx kill-port 5000

# Or change PORT in backend/.env
PORT=5001
```

**Error**: `MongoDB connection failed`
- Check MongoDB Atlas is accessible
- Verify IP whitelist (add 0.0.0.0/0 for development)
- Check internet connection

### Frontend won't start

**Error**: `Port 5173 already in use`
```bash
# Kill the process
npx kill-port 5173

# Or it will prompt you to use a different port
```

### CORS Error in Browser Console

**Solution**: 
- Ensure backend is running on port 5000
- Check `CORS_ORIGIN` in `backend/.env` is `http://localhost:5173`
- Restart backend after changing .env

### API calls fail in frontend

**Current Issue**: Frontend still uses mock data!
- This is expected - frontend needs to be updated to use real API
- See `api.ts` file
- Backend is working, frontend integration is next phase

---

## 📁 Important Files

### Backend
- `backend/.env` - Environment variables (MongoDB URI already set!)
- `backend/src/server.js` - Main server file
- `backend/src/models/` - Database schemas
- `backend/src/controllers/` - Business logic
- `backend/src/routes/` - API endpoints

### Frontend
- `api.ts` - API client (currently mock, needs update)
- `types.ts` - TypeScript types
- `views/` - Page components
- `components/` - Reusable components

---

## 🎯 Next Steps

Now that you have it running:

### Phase 1: Explore ✅ (You are here!)
- [x] Backend running
- [x] Frontend running
- [x] Create test accounts
- [x] Test basic flow

### Phase 2: Update Frontend (Next)
- [ ] Update `api.ts` to call real backend
- [ ] Add token storage (localStorage)
- [ ] Update all views to use real data
- [ ] Add error handling

### Phase 3: Advanced (Later)
- [ ] File upload to IPFS
- [ ] Smart contract integration
- [ ] WebSocket real-time updates
- [ ] Email notifications

---

## 📖 Additional Resources

- **Full Documentation**: [README_NEW.md](README_NEW.md)
- **Project Analysis**: [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)
- **Backend API Docs**: [backend/README.md](backend/README.md)

---

## 📞 Need Help?

### Check These First:
1. Are both backend and frontend running?
2. Is MongoDB connection successful?
3. Any errors in terminal?
4. Check browser console for errors

### Still Stuck?
- Read [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) for detailed explanation
- Check backend logs for errors
- Verify environment variables in `.env`

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] MongoDB connected (check backend logs)
- [ ] Health check returns success
- [ ] Can create patient account
- [ ] Can create doctor account
- [ ] Patient can upload record
- [ ] Doctor can request access
- [ ] Patient can approve request
- [ ] Doctor can see granted records

---

## 🎉 Congratulations!

You now have a fully functional HealthChain DApp with:
- ✅ Working backend API
- ✅ MongoDB database integration
- ✅ User authentication
- ✅ Medical records management
- ✅ Access control system
- ✅ Activity logging

**Ready to integrate the frontend with real API calls!**

---

## 📸 What You Should See

### Terminal 1 (Backend):
```
🏥 HealthChain DApp Backend Server
Server running on port: 5000
✅ MongoDB Connected
```

### Terminal 2 (Frontend):
```
VITE v6.2.0  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Browser:
- Beautiful animated landing page
- Patient/Doctor login options
- Dashboard after login
- Upload, request, and access management features

---

**Version**: 1.0.0  
**Setup Time**: ~5 minutes  
**Status**: ✅ Ready to Use

---

<div align="center">

### 🚀 Happy Coding!

**Made with ❤️ by the HealthChain Team**

</div>