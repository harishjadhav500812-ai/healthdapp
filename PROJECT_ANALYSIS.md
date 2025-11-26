# HealthChain DApp - Project Analysis & Restructuring

## 📋 Executive Summary

This document provides a comprehensive analysis of the HealthChain DApp project, identifying static values, database requirements, and the complete backend integration strategy.

---

## 🎯 Project Overview

**HealthChain** is a decentralized healthcare application that enables:
- **Patients** to securely store and manage medical records on blockchain/IPFS
- **Doctors** to request access to patient records with consent-based permissions
- **System** to maintain distributed ledger with consensus mechanisms

### Original State
- ✅ Frontend-only React + TypeScript application
- ✅ Mock API with hardcoded data in `api.ts`
- ✅ Beautiful UI with animations and blockchain aesthetics
- ❌ No real backend or database
- ❌ No persistent storage
- ❌ No authentication system

### Restructured State
- ✅ Separated frontend and backend
- ✅ MongoDB database integration
- ✅ RESTful API with Express.js
- ✅ JWT authentication
- ✅ Complete CRUD operations
- ✅ Activity logging and event tracking

---

## 📂 Old vs New Structure

### Before (Original Structure)
```
healthchain-dapp/
├── components/
├── views/
├── node_modules/
├── api.ts (mock data)
├── types.ts
├── index.tsx
├── package.json
└── Other config files
```

### After (Restructured)
```
healthchain-dapp/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── MedicalRecord.js
│   │   │   ├── AccessRequest.js
│   │   │   ├── GrantedAccess.js
│   │   │   └── SystemEvent.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── recordsController.js
│   │   │   ├── accessController.js
│   │   │   └── eventsController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── recordsRoutes.js
│   │   │   ├── accessRoutes.js
│   │   │   └── eventsRoutes.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── config/
│   │   │   └── database.js
│   │   └── server.js
│   ├── .env
│   └── package.json
└── frontend/
    └── (original React app - to be moved)
```

---

## 🗄️ Database Schema Design

### 1. Users Collection
**Purpose**: Store patient and doctor accounts

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum ['PATIENT', 'DOCTOR', 'ADMIN'],
  
  // Patient-specific
  age: Number,
  gender: String,
  bloodType: String,
  
  // Doctor-specific
  licenseId: String (unique, indexed),
  specialization: String,
  hospitalAffiliation: String,
  
  // Common
  avatarUrl: String,
  phoneNumber: String,
  address: Object,
  walletAddress: String (for blockchain),
  
  // Security
  isActive: Boolean,
  isEmailVerified: Boolean,
  lastLogin: Date,
  passwordChangedAt: Date,
  
  timestamps: { createdAt, updatedAt }
}
```

**Indexes**:
- `email` (unique)
- `licenseId` (unique, sparse)
- `role`
- `walletAddress` (sparse)

---

### 2. MedicalRecords Collection
**Purpose**: Store metadata for uploaded medical files

```javascript
{
  _id: ObjectId,
  fileName: String,
  fileType: Enum ['PDF', 'DICOM', 'JPG', 'PNG', 'XML', 'TXT', 'DOC', 'DOCX', 'OTHER'],
  fileSize: String,
  fileSizeBytes: Number,
  patientId: ObjectId (ref: 'User', indexed),
  
  // Blockchain/IPFS
  ipfsCid: String (unique, indexed),
  txHash: String (unique, indexed),
  blockNumber: Number,
  lamportClock: Number,
  nodeId: String,
  
  // Metadata
  recordType: Enum ['Lab Report', 'MRI Scan', 'X-Ray', 'CT Scan', 'Blood Test', 'Vaccination', 'Prescription', 'Other'],
  description: String,
  tags: [String],
  
  // Encryption
  encryptionAlgorithm: String,
  encryptionKey: String (select: false),
  
  // Access tracking
  accessCount: Number,
  lastAccessedAt: Date,
  
  // Verification
  isVerified: Boolean,
  verifiedBy: ObjectId (ref: 'User'),
  verifiedAt: Date,
  
  // Soft delete
  isDeleted: Boolean,
  deletedAt: Date,
  
  uploadDate: Date,
  timestamps: { createdAt, updatedAt }
}
```

**Indexes**:
- `patientId` + `uploadDate` (compound)
- `ipfsCid` (unique)
- `txHash` (unique)
- `isDeleted` + `patientId`

---

### 3. AccessRequests Collection
**Purpose**: Manage doctor requests to access patient records

```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: 'User', indexed),
  patientName: String,
  doctorId: ObjectId (ref: 'User', indexed),
  doctorName: String,
  specialization: String,
  
  purpose: String (required),
  status: Enum ['PENDING', 'GRANTED', 'REJECTED', 'EXPIRED'],
  riskLevel: Enum ['LOW', 'MEDIUM', 'HIGH'],
  
  requestedRecords: [ObjectId] (ref: 'MedicalRecord'),
  requestedDuration: Number (hours),
  
  // Response
  respondedAt: Date,
  responseMessage: String,
  
  // Blockchain
  txHash: String,
  lamportClock: Number,
  nodeId: String,
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  expiresAt: Date,
  
  timestamps: { createdAt, updatedAt }
}
```

**Indexes**:
- `patientId` + `status` (compound)
- `doctorId` + `status` (compound)
- `status` + `createdAt`
- `expiresAt` (sparse)

---

### 4. GrantedAccess Collection
**Purpose**: Track active access permissions

```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: 'User', indexed),
  patientName: String,
  doctorId: ObjectId (ref: 'User', indexed),
  doctorName: String,
  accessRequestId: ObjectId (ref: 'AccessRequest'),
  
  accessibleRecords: [{
    recordId: ObjectId,
    recordName: String,
    ipfsCid: String
  }],
  
  permissions: {
    canView: Boolean,
    canDownload: Boolean,
    canShare: Boolean,
    canComment: Boolean
  },
  
  // Duration
  grantedAt: Date,
  expiresAt: Date (indexed),
  duration: String,
  durationHours: Number,
  
  status: Enum ['ACTIVE', 'EXPIRED', 'REVOKED'],
  
  // Revocation
  revokedAt: Date,
  revokedBy: ObjectId,
  revocationReason: String,
  
  // Blockchain
  txHash: String (unique),
  blockNumber: Number,
  lamportClock: Number,
  
  // Access tracking
  accessCount: Number,
  lastAccessedAt: Date,
  accessLog: [{
    accessedAt: Date,
    recordId: ObjectId,
    action: Enum ['VIEW', 'DOWNLOAD', 'SHARE', 'COMMENT'],
    ipAddress: String,
    userAgent: String
  }],
  
  timestamps: { createdAt, updatedAt }
}
```

**Indexes**:
- `patientId` + `status` (compound)
- `doctorId` + `status` (compound)
- `status` + `expiresAt`
- `patientId` + `doctorId` + `status`

---

### 5. SystemEvents Collection
**Purpose**: Audit log for all system activities

```javascript
{
  _id: ObjectId,
  type: Enum ['UPLOAD', 'ACCESS_GRANT', 'ACCESS_REVOKE', 'CONSENSUS', 'NODE_SYNC', 'LOGIN', 'LOGOUT', 'RECORD_DELETE', 'USER_REGISTER'],
  title: String,
  description: String,
  
  // Distributed system
  lamportClock: Number (indexed),
  nodeId: String (indexed),
  
  // User who triggered
  userId: ObjectId (ref: 'User', indexed),
  userName: String,
  userRole: Enum ['PATIENT', 'DOCTOR', 'ADMIN', 'SYSTEM'],
  
  // Related entities
  relatedRecordId: ObjectId,
  relatedAccessRequestId: ObjectId,
  relatedGrantedAccessId: ObjectId,
  
  // Blockchain
  txHash: String,
  blockNumber: Number,
  ipfsCid: String,
  
  // Categorization
  severity: Enum ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
  status: Enum ['SUCCESS', 'FAILED', 'PENDING', 'IN_PROGRESS'],
  category: Enum ['AUTHENTICATION', 'AUTHORIZATION', 'DATA', 'BLOCKCHAIN', 'SYSTEM', 'SECURITY'],
  
  // Error tracking
  errorMessage: String,
  errorStack: String (select: false),
  
  // Request metadata
  ipAddress: String,
  userAgent: String,
  requestId: String,
  duration: Number,
  
  metadata: Mixed,
  timestamp: Date,
  createdAt: Date
}
```

**Indexes**:
- `type` + `timestamp` (compound)
- `userId` + `timestamp`
- `nodeId` + `lamportClock`
- `severity` + `timestamp`
- TTL index on `createdAt` (90 days)

---

## 🔄 Static Values → Database Mapping

### Original Static Data in `api.ts`

#### 1. **MOCK_RECORDS** (Medical Records)
**Location**: `api.ts` - Line 7
```javascript
let MOCK_RECORDS: MedicalRecord[] = [
  { id: '1', fileName: 'MRI_Scan_Knee.dicom', uploadDate: '2023-10-15', ... },
  { id: '2', fileName: 'Blood_Work_2023.pdf', uploadDate: '2023-11-02', ... },
  { id: '3', fileName: 'Vaccination_Cert.pdf', uploadDate: '2023-12-10', ... }
];
```
**→ Now Stored In**: `MedicalRecords` collection
**→ API Endpoints**:
- `POST /api/records/upload` - Create
- `GET /api/records` - Read all
- `GET /api/records/:id` - Read one
- `PUT /api/records/:id` - Update
- `DELETE /api/records/:id` - Delete

---

#### 2. **MOCK_REQUESTS** (Access Requests)
**Location**: `api.ts` - Line 13
```javascript
let MOCK_REQUESTS: AccessRequest[] = [
  { id: 'req-1', patientId: 'p1', patientName: 'Alex Doe', doctorId: 'd1', ... },
  { id: 'req-2', patientId: 'p1', patientName: 'Alex Doe', doctorId: 'd2', ... }
];
```
**→ Now Stored In**: `AccessRequests` collection
**→ API Endpoints**:
- `POST /api/access/request` - Doctor requests access
- `GET /api/access/requests` - Patient views requests
- `PUT /api/access/approve/:id` - Patient approves
- `PUT /api/access/reject/:id` - Patient rejects

---

#### 3. **MOCK_GRANTED_ACCESS** (Granted Permissions)
**Location**: `api.ts` - Line 26
```javascript
let MOCK_GRANTED_ACCESS: any[] = [
  { id: '101', patient: 'Sarah Connor', record: 'Neural Net Scan.pdf', expiry: '24h', ... },
  { id: '102', patient: 'John Smith', record: 'Blood_Test_A1.pdf', expiry: '48h', ... }
];
```
**→ Now Stored In**: `GrantedAccess` collection
**→ API Endpoints**:
- `GET /api/access/granted` - Doctor views granted accesses
- `GET /api/access/granted/patient` - Patient views who has access
- `PUT /api/access/revoke/:id` - Patient revokes access
- `PUT /api/access/extend/:id` - Patient extends access

---

#### 4. **User Authentication** (Login/Signup)
**Location**: `api.ts` - Lines 31-62
```javascript
login: async (email: string, role: UserRole): Promise<User> => {
  // Mock validation
  return { id: 'u-...', name: 'Alex Doe', role: role, email: email };
}
```
**→ Now Stored In**: `Users` collection
**→ API Endpoints**:
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login with JWT
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

---

#### 5. **System Events** (Activity Log)
**Location**: Views (PatientDashboard.tsx, DoctorDashboard.tsx)
```javascript
const MOCK_EVENTS: SystemEvent[] = [
  { id: '1', type: 'CONSENSUS', title: 'Block #4092 Mined', ... },
  { id: '2', type: 'ACCESS_GRANT', title: 'Dr. Smith Granted', ... }
];
```
**→ Now Stored In**: `SystemEvents` collection
**→ API Endpoints**:
- `GET /api/events` - Get all events
- `GET /api/events/me` - Get my events
- `GET /api/events/dashboard` - Dashboard activity
- `GET /api/events/type/:type` - By event type
- `GET /api/events/stats` - Statistics

---

## 🔐 Authentication Flow

### Before (Mock)
```
User enters email → Instantly logged in → No verification
```

### After (JWT-Based)
```
1. User signup → Password hashed with bcrypt → Stored in DB
2. User login → Credentials verified → JWT token generated
3. Protected routes → Token validated → User authenticated
4. Token expires after 7 days → User must re-login
```

**Security Features**:
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiration
- ✅ Protected routes with middleware
- ✅ Role-based access control (PATIENT/DOCTOR/ADMIN)
- ✅ Password change tracking
- ✅ Last login tracking

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/signup` | Public | Register new user |
| POST | `/login` | Public | Login and get JWT token |
| POST | `/logout` | Private | Logout user |
| GET | `/me` | Private | Get current user profile |
| PUT | `/profile` | Private | Update profile |
| PUT | `/change-password` | Private | Change password |

### Medical Records (`/api/records`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/upload` | Patient | Upload new record |
| GET | `/` | Patient | Get my records |
| GET | `/:id` | Auth | Get single record (with access check) |
| PUT | `/:id` | Patient | Update record metadata |
| DELETE | `/:id` | Patient | Soft delete record |
| GET | `/doctor/accessible` | Doctor | Get accessible records |
| POST | `/:id/verify` | Doctor | Verify record authenticity |
| GET | `/stats` | Auth | Get statistics |

### Access Management (`/api/access`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/request` | Doctor | Request access to patient |
| GET | `/requests` | Patient | View pending requests |
| GET | `/requests/sent` | Doctor | View sent requests |
| PUT | `/approve/:id` | Patient | Approve request |
| PUT | `/reject/:id` | Patient | Reject request |
| GET | `/granted` | Doctor | View granted accesses |
| GET | `/granted/patient` | Patient | View who has access |
| PUT | `/revoke/:id` | Patient | Revoke access |
| PUT | `/extend/:id` | Patient | Extend access duration |
| GET | `/check/:patientId` | Doctor | Check if has access |
| GET | `/stats` | Auth | Access statistics |

### System Events (`/api/events`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Auth | Get all events (with filters) |
| GET | `/me` | Auth | Get my events |
| GET | `/dashboard` | Auth | Dashboard activity feed |
| GET | `/type/:type` | Auth | Events by type |
| GET | `/date-range` | Auth | Events by date range |
| GET | `/stats` | Auth | Event statistics |
| GET | `/blockchain/consensus` | Auth | Consensus events |
| GET | `/node/:nodeId` | Auth | Node activity |
| POST | `/` | Auth | Create manual event |

---

## 🚀 Setup Instructions

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `backend/.env` file:
```env
MONGO_URI=mongodb+srv://harishjadhav27:sauYTlQjWIhpQGXp@kycv.orfjrga.mongodb.net/?appName=kycv
PORT=5000
NODE_ENV=development
JWT_SECRET=healthchain_super_secret_key_change_in_production_2024
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

### 4. Update Frontend API
Replace `api.ts` with actual API calls:
```typescript
const API_URL = 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers
    }
  });
  
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data;
};
```

---

## 📊 Data Migration Strategy

### Initial Seed Data (Optional)
Create `backend/src/seeds/seedData.js`:
```javascript
import User from '../models/User.js';
import MedicalRecord from '../models/MedicalRecord.js';

// Create test users
const patients = await User.create([
  { name: 'Alex Doe', email: 'alex@test.com', password: 'password123', role: 'PATIENT', age: 35 },
  { name: 'Sarah Connor', email: 'sarah@test.com', password: 'password123', role: 'PATIENT', age: 42 }
]);

const doctors = await User.create([
  { name: 'Dr. Emily Chen', email: 'emily@doctor.com', password: 'password123', role: 'DOCTOR', licenseId: 'MD-12345', specialization: 'Neurologist' }
]);

// Create sample records
await MedicalRecord.create([
  { fileName: 'MRI_Scan.dicom', patientId: patients[0]._id, ... }
]);
```

---

## 🔧 Frontend Integration Checklist

### Files to Update:

1. **`api.ts`** → Replace all mock functions with real API calls
2. **`index.tsx`** → Add token storage/retrieval logic
3. **`PatientAuth.tsx`** → Connect to `/api/auth/login` and `/api/auth/signup`
4. **`PatientDashboard.tsx`** → Fetch from `/api/records` and `/api/access/requests`
5. **`DoctorDashboard.tsx`** → Fetch from `/api/access/granted`
6. **`PatientUpload.tsx`** → Post to `/api/records/upload`
7. **All views** → Add error handling and loading states

---

## 🎯 Key Benefits of Restructuring

1. **Data Persistence**: All data now stored permanently in MongoDB
2. **Scalability**: Backend can handle multiple clients simultaneously
3. **Security**: JWT authentication + password hashing + role-based access
4. **Audit Trail**: Complete activity logging in SystemEvents
5. **Separation of Concerns**: Frontend/Backend decoupled
6. **Real Blockchain Integration**: Ready for IPFS and Ethereum smart contracts
7. **Production-Ready**: Environment variables, error handling, validation

---

## 📈 Next Steps

### Phase 1: Backend Integration ✅
- [x] Database models created
- [x] Controllers implemented
- [x] Routes configured
- [x] Authentication middleware
- [x] Server setup

### Phase 2: Frontend Update (To Do)
- [ ] Move original files to `frontend/` directory
- [ ] Update `api.ts` with real API calls
- [ ] Add token management (localStorage)
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Update environment variables

### Phase 3: Advanced Features (Future)
- [ ] File upload to IPFS (using ipfs-http-client)
- [ ] Smart contract integration (using web3.js/ethers.js)
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] WebSocket for real-time updates
- [ ] Push notifications

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure `CORS_ORIGIN` in `.env` matches frontend URL

### Issue: JWT Token Expired
**Solution**: Implement token refresh mechanism or re-login

### Issue: MongoDB Connection Failed
**Solution**: Check MongoDB URI, network access, and IP whitelist

### Issue: File Upload Too Large
**Solution**: Adjust `MAX_FILE_SIZE` in `.env` and Express body parser limit

---

## 📞 Support & Documentation

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Express.js Docs**: https://expressjs.com
- **Mongoose Docs**: https://mongoosejs.com
- **JWT Docs**: https://jwt.io

---

**Last Updated**: 2024
**Version**: 1.0.0
**Author**: HealthChain Development Team