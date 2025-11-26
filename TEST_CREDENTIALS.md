# 🔐 Test Credentials for HealthChain DApp

## ✅ Login Fixed!
The login issue has been resolved. You can now use these test accounts to login.

---

## 👤 Patient Account

**Email:** `testpatient@healthchain.com`  
**Password:** `password123`  
**Role:** PATIENT  
**Age:** 30

### How to Login as Patient:
1. Go to Patient Login page
2. Enter the email: `testpatient@healthchain.com`
3. Enter the password: `password123`
4. Click "Decrypt & Enter"
5. ✅ You should now be logged in!

---

## 👨‍⚕️ Doctor Account

**Email:** `doctor@healthchain.com`  
**Password:** `password123`  
**Role:** DOCTOR  
**License ID:** MD12345  
**Specialization:** General Practitioner

### How to Login as Doctor:
1. Go to Doctor Login page
2. Enter the email: `doctor@healthchain.com`
3. Enter the password: `password123`
4. Click "Decrypt & Enter"
5. ✅ You should now be logged in!

---

## 🆕 Creating New Accounts

You can also create new accounts using the signup form:

### For Patients:
- Click "NO IDENTITY FOUND? MINT NEW" on login page
- Fill in:
  - Full Name
  - Age
  - Email (must be unique)
  - Password (min 8 characters)
  - Confirm Password
- Click "Generate Block"

### For Doctors:
- Switch to Doctor mode (icon in top right)
- Click "NO IDENTITY FOUND? MINT NEW" on login page
- Fill in:
  - Full Name
  - Medical License ID (must be unique)
  - Email (must be unique)
  - Password (min 8 characters)
  - Confirm Password
- Click "Generate Block"

---

## 🔧 Troubleshooting

### If login still fails:

1. **Check Backend is Running:**
   ```bash
   cd backend
   npm run dev
   ```
   Should see: "Server running on port: 5000"

2. **Check Frontend is Running:**
   ```bash
   npm run dev
   ```
   Should see: "Local: http://localhost:5173"

3. **Verify Backend Health:**
   Open: http://localhost:5000/health
   Should see: `{"success":true,"message":"HealthChain API is running"}`

4. **Check Browser Console:**
   - Press F12 to open Developer Tools
   - Check Console tab for errors
   - Check Network tab to see API requests

5. **Clear Browser Cache:**
   - Sometimes old JavaScript is cached
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Refresh page (Ctrl+F5)

---

## 📝 Additional Test Account

If you created other accounts during testing:

**Previous Test Account:**
- Email: `patient@test.com`
- Password: `test12345`
- Role: PATIENT

---

## 🎯 What Was Fixed

The login was failing because the code was sending the user's **role** (PATIENT/DOCTOR) instead of the **password** to the backend.

**Before (Broken):**
```typescript
await api.auth.login(email, role);  // ❌ Wrong!
```

**After (Fixed):**
```typescript
await api.auth.login(email, password);  // ✅ Correct!
```

---

## ✨ Success Indicators

When login works correctly, you should see:
- ✅ Green toast notification: "Access Granted - Decryption successful"
- ✅ Redirected to dashboard (Patient or Doctor)
- ✅ Your name appears in the header
- ✅ Backend logs show: `POST /api/auth/login 200` (not 401)

---

**Created:** 2025-11-25  
**Status:** All test accounts verified working  
**Backend:** Running on http://localhost:5000  
**Database:** MongoDB (kycv)