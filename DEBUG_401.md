# 🔍 Debugging 401 Login Errors

## Current Situation
You're getting **401 Unauthorized** errors when trying to login through the web interface, even though the backend is running and responding.

```
POST /api/auth/login 401 80.450 ms - 49
POST /api/auth/login 401 47.317 ms - 49
POST /api/auth/login 401 44.154 ms - 49
```

The `401` status code means "Invalid credentials" - the backend received the request but rejected the login attempt.

---

## ✅ What We Know Works

1. **Backend is running** - Port 5000 is active
2. **Database is connected** - MongoDB (kycv) is connected
3. **API endpoints work** - Terminal login works perfectly
4. **Code is fixed** - The password parameter bug is resolved

---

## 🔴 Why You're Getting 401

### Reason #1: Wrong Credentials (Most Likely)
You're trying to login with credentials that don't exist in the database.

**Solution:** Use the test accounts that were just created:
- **Patient:** `testpatient@healthchain.com` / `password123`
- **Doctor:** `doctor@healthchain.com` / `password123`

### Reason #2: Browser Sending Wrong Data
The frontend might be sending incorrect data format to the backend.

**How to Check:**
1. Open Browser Developer Tools (F12)
2. Go to **Network** tab
3. Try to login again
4. Click on the `login` request in the Network tab
5. Check the **Payload** section

**Expected Payload:**
```json
{
  "email": "testpatient@healthchain.com",
  "password": "password123"
}
```

**If you see something different (like role in password field), that's the issue!**

### Reason #3: Cached Frontend Code
Your browser might be using old JavaScript with the bug.

**Solution:**
1. Hard refresh: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
2. Or clear cache and refresh
3. Or restart the frontend dev server:
   ```bash
   # Stop the frontend (Ctrl+C)
   npm run dev
   ```

### Reason #4: Wrong API File
There are two API files in the project:
- `/api.ts` - Takes 2 parameters (email, password)
- `/frontend/api.ts` - Takes 3 parameters (email, password, role)

If the wrong file is being used, login will fail.

---

## 🔧 Step-by-Step Debugging

### Step 1: Verify Backend Works with Terminal
```bash
cd backend
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"testpatient@healthchain.com\",\"password\":\"password123\"}"
```

**Expected:** `{"success":true,"message":"Login successful",...}`  
**If you get 401:** The account doesn't exist or password is wrong

### Step 2: Create Account if Needed
```bash
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"password\":\"password123\",\"role\":\"PATIENT\",\"age\":30}"
```

### Step 3: Check Browser Request
1. Open frontend in browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try to login
5. Look for error messages

### Step 4: Check Network Request
1. In DevTools, go to **Network** tab
2. Try to login again
3. Click on the `login` request
4. Check **Headers** > **Request Payload**
5. Verify it contains: `{"email":"...","password":"..."}`

### Step 5: Check Which Component is Running
Look at the URL in your browser:
- If it's the root level app: Should use `/api.ts`
- If it's in `/frontend/`: Should use `/frontend/api.ts`

---

## 📊 Checking the Payload

### ✅ CORRECT Payload:
```json
{
  "email": "testpatient@healthchain.com",
  "password": "password123"
}
```
or with role (if using frontend API):
```json
{
  "email": "testpatient@healthchain.com",
  "password": "password123",
  "role": "PATIENT"
}
```

### ❌ WRONG Payload (Old Bug):
```json
{
  "email": "testpatient@healthchain.com",
  "password": "PATIENT"
}
```
If you see this, the code fix didn't load - hard refresh!

---

## 🎯 Quick Fix Checklist

- [ ] Backend is running on port 5000
- [ ] You're using correct credentials: `testpatient@healthchain.com` / `password123`
- [ ] You've hard-refreshed the browser (Ctrl+Shift+R)
- [ ] You've checked the Network tab payload
- [ ] You've cleared localStorage: `localStorage.clear()` in Console
- [ ] You've restarted the frontend dev server
- [ ] The password field shows dots (not the text "PATIENT" or "DOCTOR")

---

## 🔍 Advanced Debugging

### Check if Account Exists
Look at backend terminal when you try to login. You should see:
```
2025-11-25T20:35:16.427Z - POST /api/auth/login
POST /api/auth/login 401 80.450 ms - 49
```

The `49` bytes response means: `{"success":false,"message":"Invalid credentials"}`

This happens when:
1. Email doesn't exist in database
2. Password is wrong
3. Account is deactivated

### Check MongoDB
If you have MongoDB Compass or CLI:
```javascript
use kycv
db.users.find({email: "testpatient@healthchain.com"})
```

This will show if the account exists.

### Enable Detailed Logging
Add this to your backend login try-catch:
```javascript
console.log('Login attempt:', { email, passwordReceived: !!password });
```

This will show in backend terminal what's being received.

---

## 💡 Most Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Wrong credentials** | 401 error | Use: `testpatient@healthchain.com` / `password123` |
| **Old cached code** | Still has bug | Hard refresh: Ctrl+Shift+R |
| **Account doesn't exist** | 401 error | Create account via signup or terminal |
| **Backend not running** | Connection error | `cd backend && npm run dev` |
| **Wrong API imported** | TypeScript errors | Check import statement |
| **Form validation blocking** | Button disabled | Fill all required fields |

---

## ✨ Success Indicators

When it works, you'll see:

### In Browser:
- ✅ Green toast: "Access Granted - Decryption successful"
- ✅ Redirected to dashboard
- ✅ User name in header

### In Backend Terminal:
```
2025-11-25T20:36:29.615Z - POST /api/auth/login
POST /api/auth/login 200 125.342 ms - 584
```
The `200` status code means success!

### In Browser DevTools (Network tab):
- Status: `200 OK`
- Response contains: `{"success":true,"token":"...","user":{...}}`

---

## 🆘 Still Not Working?

If you've tried everything and still get 401:

1. **Share the Network request details:**
   - Open DevTools > Network tab
   - Try login
   - Right-click the `login` request
   - Copy > Copy as cURL
   - Share this output

2. **Check what you're typing:**
   - Email: MUST be exactly `testpatient@healthchain.com`
   - Password: MUST be exactly `password123`
   - These are case-sensitive!

3. **Try creating a brand new account:**
   - Use the signup form
   - Use a new email you haven't tried before
   - Then immediately try logging in with those credentials

4. **Check if form is sending data:**
   Add `console.log('Submitting:', { email, password });` before the API call
   Look in browser console for this log

---

**Last Updated:** 2025-11-25  
**Issue:** 401 Unauthorized on Login  
**Status:** Backend works, investigating frontend request