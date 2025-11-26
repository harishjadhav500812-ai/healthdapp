# 🔧 Troubleshooting Guide - HealthChain DApp

## Common Issues and Solutions

---

## 🚨 Issue: "Failed to Fetch" Error During Registration

### Symptoms
- Clicking "Generate Block" (Register/Signup) shows "Failed to fetch" error
- Error appears for both Patient and Doctor registration
- Console shows network error

### Causes
1. **Backend server not running**
2. **Wrong backend URL**
3. **CORS configuration issue**
4. **Port conflict**

### Solutions

#### Solution 1: Start the Backend Server

**Step 1: Open terminal in backend directory**
```bash
cd backend
```

**Step 2: Install dependencies (if not done)**
```bash
npm install
```

**Step 3: Check .env file exists**
```bash
# Verify backend/.env has:
MONGO_URI=mongodb+srv://harishjadhav27:sauYTlQjWIhpQGXp@kycv.orfjrga.mongodb.net/?appName=kycv
PORT=5000
NODE_ENV=development
JWT_SECRET=healthchain_super_secret_key_change_in_production_2024
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

**Step 4: Start the server**
```bash
npm run dev
```

**Expected Output:**
```
═══════════════════════════════════════════════════════
   🏥 HealthChain DApp Backend Server
═══════════════════════════════════════════════════════
   Environment: development
   Server running on port: 5000
   API URL: http://localhost:5000
═══════════════════════════════════════════════════════

✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
📊 Database Name: kycv
```

**If you see this, backend is running! ✅**

---

#### Solution 2: Verify Backend is Accessible

**Test with cURL:**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "HealthChain API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Test with Browser:**
Open: http://localhost:5000/health

---

#### Solution 3: Check Frontend API URL

**File: `frontend/api.ts` (Line 10)**
```typescript
const API_URL = "http://localhost:5000/api";
```

Make sure it's pointing to `http://localhost:5000/api` (NOT 5173)

---

#### Solution 4: Fix CORS Issue

**Backend: `backend/.env`**
```env
CORS_ORIGIN=http://localhost:5173
```

**Make sure this matches your frontend URL!**

If frontend runs on different port (e.g., 5174):
```env
CORS_ORIGIN=http://localhost:5174
```

**After changing, restart backend:**
```bash
# Ctrl+C to stop
npm run dev  # Start again
```

---

## 🚨 Issue: Doctor Registration with Invalid Role

### Symptoms
- Error: "Invalid role. Must be PATIENT or DOCTOR"
- Role not being saved correctly

### Solution

**Check PatientAuth component is receiving role prop:**

File: `frontend/index.tsx`

**Doctor Login:**
```tsx
case "/doctor/login":
  return (
    <PatientAuth
      role={UserRole.DOCTOR}  // ← Must be present!
      initialMode="login"
      onLogin={() => handleLogin(UserRole.DOCTOR)}
      onNavigate={setCurrentPath}
    />
  );
```

**Doctor Signup:**
```tsx
case "/doctor/signup":
  return (
    <PatientAuth
      role={UserRole.DOCTOR}  // ← Must be present!
      initialMode="signup"
      onLogin={() => handleLogin(UserRole.DOCTOR)}
      onNavigate={setCurrentPath}
    />
  );
```

---

## 🚨 Issue: "License ID is required for doctors"

### Symptoms
- Doctor registration fails
- Error message about license ID

### Solution

**Ensure License ID field is filled:**
1. Go to Doctor Signup
2. Fill in **ALL fields**:
   - ✅ Full Name
   - ✅ Email
   - ✅ Password
   - ✅ Confirm Password
   - ✅ **Medical License ID** (Important!)

The License ID field only appears for doctors, not patients.

---

## 🚨 Issue: MongoDB Connection Failed

### Symptoms
- Backend starts but shows "MongoDB Connection Error"
- Cannot register users

### Solution 1: Check MongoDB URI

**Backend: `backend/.env`**
```env
MONGO_URI=mongodb+srv://harishjadhav27:sauYTlQjWIhpQGXp@kycv.orfjrga.mongodb.net/?appName=kycv
```

Make sure:
- No extra spaces
- URI is on one line
- No quotes around the URI

### Solution 2: Whitelist IP in MongoDB Atlas

1. Go to https://cloud.mongodb.com/
2. Login with credentials
3. Click **Network Access** (left sidebar)
4. Click **Add IP Address**
5. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **Confirm**
7. Wait 1-2 minutes for changes to propagate
8. Restart backend

---

## 🚨 Issue: Port 5000 Already in Use

### Symptoms
```
Error: listen EADDRINUSE: address already in use :::5000
```

### Solution 1: Kill Process on Port 5000

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

**Or use npx:**
```bash
npx kill-port 5000
```

### Solution 2: Change Port

**Backend: `backend/.env`**
```env
PORT=5001
```

**Frontend: `frontend/api.ts`**
```typescript
const API_URL = "http://localhost:5001/api";
```

Restart both servers.

---

## 🚨 Issue: Frontend Shows Old Mock Data

### Symptoms
- After registration, still seeing mock data
- Changes not appearing in dashboard

### Solution

**Clear Browser Cache:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear Storage**
4. Check all boxes
5. Click **Clear site data**
6. Refresh page (Ctrl+Shift+R)

**Or use Incognito Mode:**
- Ctrl+Shift+N (Chrome/Edge)
- Test registration in clean session

---

## 🧪 Testing Registration Step-by-Step

### Test Patient Registration

1. **Start Backend**
```bash
cd backend
npm run dev
```

2. **Start Frontend**
```bash
cd ..
npm run dev
```

3. **Register Patient**
- Open: http://localhost:5173
- Click: **Patient Portal**
- Click: **Mint Identity**
- Fill form:
  - Name: Test Patient
  - Email: patient@test.com
  - Password: password123
  - Confirm: password123
  - Age: 30
- Click: **Generate Block**

4. **Check Backend Logs**
Should see:
```
POST /api/auth/signup 201 1234ms
```

5. **Check MongoDB**
- Go to MongoDB Atlas
- Browse Collections
- See new user in `users` collection

---

### Test Doctor Registration

1. **Register Doctor**
- Open: http://localhost:5173
- Click: **Doctor Portal** (or Provider)
- Click: **Mint Identity**
- Fill form:
  - Name: Dr. Test
  - Email: doctor@test.com
  - Password: password123
  - Confirm: password123
  - **License ID: MD-12345** ← Important!
- Click: **Generate Block**

2. **Verify in Database**
- Check MongoDB Atlas
- User should have:
  - `role: "DOCTOR"`
  - `licenseId: "MD-12345"`

---

## 🔍 Debugging Checklist

### Backend
- [ ] Backend server is running (check terminal)
- [ ] Port 5000 is available
- [ ] MongoDB URI is correct in `.env`
- [ ] MongoDB Atlas IP whitelist includes your IP
- [ ] `.env` file exists in `backend/` folder
- [ ] `node_modules` installed (`npm install`)

### Frontend
- [ ] Frontend server is running (check terminal)
- [ ] API_URL points to `http://localhost:5000/api`
- [ ] Browser console shows no errors (F12)
- [ ] Network tab shows requests going to correct URL
- [ ] CORS_ORIGIN in backend matches frontend URL

### Registration Form
- [ ] All required fields are filled
- [ ] Email is valid format
- [ ] Password is at least 8 characters
- [ ] Password and Confirm Password match
- [ ] For Doctor: License ID is filled
- [ ] For Patient: Age is filled

---

## 📊 Check Backend Logs

**Look for these in terminal:**

### ✅ Good Signs
```
Server running on port: 5000
✅ MongoDB Connected
POST /api/auth/signup 201
```

### ❌ Bad Signs
```
❌ MongoDB Connection Error
POST /api/auth/signup 400
POST /api/auth/signup 500
Error: listen EADDRINUSE
```

---

## 🔧 Quick Fixes

### Reset Everything
```bash
# Stop all servers (Ctrl+C)

# Backend
cd backend
rm -rf node_modules
npm install
npm run dev

# Frontend (new terminal)
cd ..
npm install
npm run dev
```

### Test with cURL
```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Doctor",
    "email": "test@example.com",
    "password": "password123",
    "role": "DOCTOR",
    "licenseId": "MD-99999",
    "specialization": "General"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Test Doctor",
    "email": "test@example.com",
    "role": "DOCTOR"
  }
}
```

---

## 🆘 Still Having Issues?

### Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for red errors
4. Copy error message

### Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try registration again
4. Click on failed request (red)
5. Check **Response** tab for error details

### Check Backend Terminal
Look for error messages after registration attempt.

---

## 📞 Common Error Messages

### "Please provide name, email, password, and role"
**Fix:** Ensure role is being sent in request. Check `frontend/views/PatientAuth.tsx` line ~118

### "License ID is required for doctors"
**Fix:** Fill in the Medical License ID field (only visible for doctors)

### "User already exists with this email"
**Fix:** Use a different email or login instead

### "Invalid credentials"
**Fix:** Check email and password are correct

### "Cannot connect to server"
**Fix:** Start backend server (`npm run dev` in backend folder)

### "CORS policy error"
**Fix:** Check CORS_ORIGIN in backend/.env matches frontend URL

---

## ✅ Successful Registration Flow

1. **Backend receives request**
```
POST /api/auth/signup
Body: { name, email, password, role, ... }
```

2. **Validation passes**
```
✓ All required fields present
✓ Email format valid
✓ Role is PATIENT or DOCTOR
✓ License ID present (if doctor)
```

3. **User created in MongoDB**
```
✓ Password hashed
✓ User document saved
✓ SystemEvent logged
```

4. **Token generated**
```
✓ JWT token created
✓ Token returned to frontend
```

5. **Frontend receives response**
```
✓ Token saved to localStorage
✓ Success toast shown
✓ Redirect to login
```

6. **Login successful**
```
✓ User authenticated
✓ Correct dashboard shown (Patient/Doctor)
```

---

## 🎯 Final Checklist

Before asking for help, verify:

1. [ ] Backend is running and accessible
2. [ ] MongoDB is connected
3. [ ] Frontend is running
4. [ ] API_URL is correct
5. [ ] All form fields are filled correctly
6. [ ] Browser console shows no errors
7. [ ] Backend logs show no errors
8. [ ] Tried in incognito mode
9. [ ] Cleared browser cache
10. [ ] Used correct role (PATIENT/DOCTOR)

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Active Support