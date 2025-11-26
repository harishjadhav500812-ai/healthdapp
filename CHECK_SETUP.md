# ✅ Setup Verification Checklist

## Quick Start Guide - Verify Your Setup

Follow these steps to ensure everything is configured correctly before running the application.

---

## 📋 Pre-Flight Checklist

### Step 1: Verify Directory Structure

Your project should look like this:

```
healthchain-dapp/
├── backend/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── node_modules/
├── frontend/
│   ├── components/
│   ├── views/
│   ├── api.ts
│   └── ... (other files)
├── PROJECT_ANALYSIS.md
├── TROUBLESHOOTING.md
└── README.md
```

**✅ Verify:** Both `backend/` and `frontend/` folders exist

---

### Step 2: Check Backend Configuration

#### File: `backend/.env`

**Must contain:**
```env
MONGO_URI=mongodb+srv://harishjadhav27:sauYTlQjWIhpQGXp@kycv.orfjrga.mongodb.net/?appName=kycv
PORT=5000
NODE_ENV=development
JWT_SECRET=healthchain_super_secret_key_change_in_production_2024
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

**✅ Verify:** File exists and has all variables

---

### Step 3: Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

**Expected packages:**
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- multer
- helmet
- morgan

**✅ Verify:** `node_modules/` folder created with 100+ packages

#### Frontend:
```bash
cd ..
npm install
```

**Expected packages:**
- react
- react-dom
- typescript
- vite
- framer-motion
- lucide-react

**✅ Verify:** `node_modules/` folder created

---

### Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

**✅ Expected Output:**
```
═══════════════════════════════════════════════════════
   🏥 HealthChain DApp Backend Server
═══════════════════════════════════════════════════════
   Environment: development
   Server running on port: 5000
   API URL: http://localhost:5000
   Health Check: http://localhost:5000/health
═══════════════════════════════════════════════════════

✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
📊 Database Name: kycv
```

**❌ If you see errors:**
- "Port 5000 already in use" → Run `npx kill-port 5000`
- "MongoDB connection failed" → Check MongoDB Atlas IP whitelist
- "Cannot find module" → Run `npm install` again

---

### Step 5: Test Backend Health

**Open new terminal and run:**
```bash
curl http://localhost:5000/health
```

**✅ Expected Response:**
```json
{
  "success": true,
  "message": "HealthChain API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12.345,
  "environment": "development"
}
```

**Or open in browser:** http://localhost:5000/health

---

### Step 6: Start Frontend Server

**Open NEW terminal:**
```bash
cd healthchain-dapp
npm run dev
```

**✅ Expected Output:**
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**❌ If you see errors:**
- "Port 5173 already in use" → Press 'y' to use different port OR run `npx kill-port 5173`
- "Cannot find module" → Run `npm install`

---

### Step 7: Verify Frontend

**Open browser:** http://localhost:5173

**✅ You should see:**
- HealthChain landing page
- Animated background
- "Patient Portal" and "Doctor Portal" buttons
- Green "Node Active" indicator

**❌ If page is blank:**
- Check browser console (F12) for errors
- Verify frontend server is running
- Try hard refresh (Ctrl+Shift+R)

---

### Step 8: Test Patient Registration

1. Click **"Patient Portal"**
2. Click **"Mint Identity"** (signup)
3. Fill in form:
   - **Name:** Test Patient
   - **Email:** patient@test.com
   - **Password:** password123
   - **Confirm Password:** password123
   - **Age:** 30

4. Click **"Generate Block"**

**✅ Expected Result:**
- Success toast message
- Redirected to login page
- No errors in console

**❌ If "Failed to fetch" error:**
- Check backend is running
- Check backend logs for errors
- Verify CORS_ORIGIN in backend/.env
- See TROUBLESHOOTING.md

---

### Step 9: Test Doctor Registration

1. Open **NEW INCOGNITO WINDOW**
2. Go to: http://localhost:5173
3. Click **"Doctor Portal"** (or Provider)
4. Click **"Mint Identity"**
5. Fill in form:
   - **Name:** Dr. Test
   - **Email:** doctor@test.com
   - **Password:** password123
   - **Confirm Password:** password123
   - **Medical License ID:** MD-12345 ← Important!

6. Click **"Generate Block"**

**✅ Expected Result:**
- Success toast message
- Redirected to doctor login
- No errors

**❌ If "License ID required" error:**
- Make sure you filled the License ID field
- This field only appears for doctors

---

### Step 10: Verify Database

1. Go to: https://cloud.mongodb.com/
2. Login with credentials
3. Click **"Browse Collections"**
4. Database: **kycv**

**✅ You should see collections:**
- `users` (with 2 documents: patient and doctor)
- `medicalrecords` (empty for now)
- `accessrequests` (empty for now)
- `grantedaccesses` (empty for now)
- `systemevents` (with registration events)

**Check user documents have correct roles:**
- Patient: `role: "PATIENT"`
- Doctor: `role: "DOCTOR"`, `licenseId: "MD-12345"`

---

### Step 11: Test Login

#### Patient Login:
1. Email: patient@test.com
2. Password: password123
3. Click **"Decrypt & Enter"**

**✅ Should redirect to Patient Dashboard**

#### Doctor Login:
1. Email: doctor@test.com
2. Password: password123
3. Click **"Decrypt & Enter"**

**✅ Should redirect to Doctor Dashboard**

---

### Step 12: Test File Upload (Patient)

1. Login as Patient
2. Go to **"Upload Record"**
3. Click **"Browse files"**
4. Select any file (PDF, image, etc.)
5. Fill in:
   - **Record Type:** MRI Scan
   - **Description:** Test upload
6. Click **"Upload"**

**✅ Expected Result:**
- Upload progress animation
- Success message with blockchain details
- File saved in `backend/uploads/` folder
- Record in MongoDB `medicalrecords` collection

**❌ If upload fails:**
- Check file size (max 50MB)
- Check file type is allowed
- Check backend logs

---

### Step 13: Test Access Request (Doctor)

1. Login as Doctor (in incognito window)
2. You'll need the Patient ID
   - Login as patient in normal window
   - Check URL or database for patient _id

3. As Doctor, click **"Request Access"**
4. Enter Patient ID
5. Enter Purpose: "Review medical records"
6. Click **"Send Request"**

**✅ Expected Result:**
- Success message
- Request saved in database
- Patient can see request

---

### Step 14: Test Access Approval (Patient)

1. Login as Patient
2. Go to **"Access Requests"**
3. See pending request from doctor
4. Click **"Approve"**
5. Set duration: 48 hours
6. Click **"Confirm"**

**✅ Expected Result:**
- Success message
- GrantedAccess record created
- Doctor can now see patient's records

---

### Step 15: Test Doctor Viewing Records

1. Login as Doctor
2. Go to **"Granted Access"**
3. See patient's records

**✅ Expected Result:**
- List of accessible patients
- Can view/download medical records
- Access expires after set duration

---

## 🎯 Complete Setup Checklist

Mark each as complete:

### Backend
- [ ] backend/.env file exists with correct values
- [ ] npm install completed (node_modules exists)
- [ ] Backend server starts without errors
- [ ] Health check returns success
- [ ] MongoDB connection successful
- [ ] Port 5000 is available

### Frontend
- [ ] npm install completed
- [ ] Frontend server starts without errors
- [ ] Can access http://localhost:5173
- [ ] Landing page loads correctly
- [ ] No console errors (F12)

### Functionality
- [ ] Can register as Patient
- [ ] Can register as Doctor (with license ID)
- [ ] Can login as Patient
- [ ] Can login as Doctor
- [ ] Patient and Doctor see different dashboards
- [ ] Can upload medical record (Patient)
- [ ] Can request access (Doctor)
- [ ] Can approve/reject requests (Patient)
- [ ] Can view granted records (Doctor)

### Database
- [ ] MongoDB Atlas accessible
- [ ] Users collection has correct data
- [ ] Roles are saved correctly (PATIENT/DOCTOR)
- [ ] SystemEvents are being logged

---

## 🔧 Common Issues

### Backend won't start
```bash
# Kill process on port 5000
npx kill-port 5000

# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Frontend shows old data
```bash
# Clear browser cache
# Or use Incognito mode
```

### MongoDB connection fails
```bash
# Check IP whitelist in MongoDB Atlas
# Add 0.0.0.0/0 (allow all) for development
```

### CORS errors
```bash
# Check backend/.env
CORS_ORIGIN=http://localhost:5173

# Restart backend after changing
```

---

## 📚 Additional Resources

- **Full Documentation:** README_NEW.md
- **Project Analysis:** PROJECT_ANALYSIS.md
- **Troubleshooting:** TROUBLESHOOTING.md
- **File Storage:** FILE_STORAGE_GUIDE.md
- **API Documentation:** backend/README.md

---

## 🎉 Success Criteria

**Your setup is complete when:**

✅ Backend server running on port 5000
✅ Frontend server running on port 5173
✅ MongoDB connected and accessible
✅ Can register both Patient and Doctor
✅ Can login with correct credentials
✅ Patient sees Patient Dashboard
✅ Doctor sees Doctor Dashboard
✅ Can upload files and store in database
✅ Can request and grant access
✅ No errors in console or terminal

---

## 📞 Need Help?

If you've completed all steps and still have issues:

1. Check TROUBLESHOOTING.md
2. Review backend terminal logs
3. Check browser console (F12)
4. Verify MongoDB Atlas connection
5. Ensure all ports are available

---

**Version:** 1.0.0  
**Setup Time:** ~10 minutes  
**Difficulty:** Beginner-Friendly  
**Status:** ✅ Production Ready