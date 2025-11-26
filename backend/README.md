# HealthChain DApp - Backend API

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success)
![Express](https://img.shields.io/badge/Express-v4.18-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

Backend API for HealthChain - A decentralized healthcare records management system with blockchain integration.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Patient, Doctor, and Admin roles
- 📁 **Medical Records Management** - Upload, store, and manage medical files
- 🤝 **Access Request System** - Doctors request access, patients approve/reject
- ⏱️ **Time-Based Permissions** - Configurable access duration and expiry
- 🔗 **Blockchain Integration Ready** - IPFS CID and transaction hash support
- 📊 **Activity Logging** - Complete audit trail of all system events
- 🔒 **Data Encryption** - Password hashing with bcrypt
- 📈 **Statistics & Analytics** - Comprehensive stats for users
- 🌐 **CORS Enabled** - Cross-origin resource sharing configured
- 🛡️ **Security Headers** - Helmet.js for security
- 📝 **Request Validation** - Input validation and sanitization
- 🗄️ **MongoDB Integration** - Scalable NoSQL database

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Environment**: dotenv
- **Compression**: compression

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd healthchain-dapp/backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- cors
- dotenv
- bcryptjs
- jsonwebtoken
- helmet
- morgan
- compression
- multer
- express-validator

### 3. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Or create it manually with the following content:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://harishjadhav27:sauYTlQjWIhpQGXp@kycv.orfjrga.mongodb.net/?appName=kycv

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=healthchain_super_secret_key_change_in_production_2024
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=50000000
UPLOAD_PATH=./uploads

# IPFS Configuration (Mock for now)
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Blockchain Configuration (Mock for now)
BLOCKCHAIN_NETWORK=ethereum-testnet
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

### 4. Configure MongoDB

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (if you haven't)
3. Click "Connect" and select "Connect your application"
4. Copy the connection string
5. Replace `<username>`, `<password>`, and `<dbname>` in the connection string
6. Update `MONGO_URI` in your `.env` file

**Important**: Whitelist your IP address in MongoDB Atlas Network Access settings.

---

## 🏃 Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

You should see:

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
📊 Database Name: healthchain
```

### Health Check

Test if the server is running:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "HealthChain API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User (Signup)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT",
  "age": 30,
  "gender": "Male"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "PATIENT"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phoneNumber": "+1234567890"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

### Medical Records Endpoints

#### Upload Record (Patient Only)
```http
POST /api/records/upload
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "fileName": "MRI_Scan_Brain.dicom",
  "fileSizeBytes": 45000000,
  "recordType": "MRI Scan",
  "description": "Brain MRI scan for diagnosis",
  "tags": ["MRI", "Brain", "Radiology"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Record uploaded successfully",
  "data": {
    "record": { ... },
    "blockchain": {
      "cid": "QmX7yP3c4987f2k9j38d7s6g5h4j3k2l1m0n9b8v7c6x5z",
      "txHash": "0x8f2a9b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
      "lamport": 4532,
      "blockNumber": 8921
    }
  }
}
```

#### Get My Records (Patient Only)
```http
GET /api/records
Authorization: Bearer <patient-token>
```

#### Get Single Record
```http
GET /api/records/:id
Authorization: Bearer <token>
```

#### Update Record Metadata (Patient Only)
```http
PUT /api/records/:id
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "description": "Updated description",
  "tags": ["Updated", "Tags"]
}
```

#### Delete Record (Patient Only)
```http
DELETE /api/records/:id
Authorization: Bearer <patient-token>
```

#### Get Accessible Records (Doctor Only)
```http
GET /api/records/doctor/accessible
Authorization: Bearer <doctor-token>
```

#### Get Record Statistics
```http
GET /api/records/stats
Authorization: Bearer <token>
```

---

### Access Management Endpoints

#### Request Access (Doctor Only)
```http
POST /api/access/request
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "purpose": "Review medical history for consultation",
  "requestedDuration": 48,
  "riskLevel": "MEDIUM"
}
```

#### Get Pending Requests (Patient Only)
```http
GET /api/access/requests
Authorization: Bearer <patient-token>
```

#### Approve Request (Patient Only)
```http
PUT /api/access/approve/:requestId
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "duration": 48,
  "responseMessage": "Access granted for consultation"
}
```

#### Reject Request (Patient Only)
```http
PUT /api/access/reject/:requestId
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "responseMessage": "Not comfortable sharing at this time"
}
```

#### Get Granted Accesses (Doctor Only)
```http
GET /api/access/granted
Authorization: Bearer <doctor-token>
```

#### Get Who Has Access (Patient Only)
```http
GET /api/access/granted/patient
Authorization: Bearer <patient-token>
```

#### Revoke Access (Patient Only)
```http
PUT /api/access/revoke/:accessId
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "reason": "Consultation completed"
}
```

#### Check Access (Doctor Only)
```http
GET /api/access/check/:patientId
Authorization: Bearer <doctor-token>
```

---

### System Events Endpoints

#### Get All Events
```http
GET /api/events?limit=50&type=UPLOAD&severity=INFO
Authorization: Bearer <token>
```

#### Get My Events
```http
GET /api/events/me?limit=20
Authorization: Bearer <token>
```

#### Get Dashboard Activity
```http
GET /api/events/dashboard
Authorization: Bearer <token>
```

#### Get Events by Type
```http
GET /api/events/type/ACCESS_GRANT
Authorization: Bearer <token>
```

#### Get Event Statistics
```http
GET /api/events/stats
Authorization: Bearer <token>
```

---

## 🗄️ Database Models

### User Model
- **Patients**: name, email, password, age, gender, blood type
- **Doctors**: name, email, password, license ID, specialization, hospital

### MedicalRecord Model
- File metadata (name, type, size)
- IPFS CID and blockchain transaction hash
- Patient owner reference
- Access tracking and verification

### AccessRequest Model
- Doctor request to patient
- Purpose, status (PENDING/GRANTED/REJECTED)
- Risk level and duration

### GrantedAccess Model
- Active permissions between doctor and patient
- Expiry date and access logs
- Revocation tracking

### SystemEvent Model
- Audit log of all activities
- Distributed consensus (Lamport clock)
- Event categorization and severity

---

## 🔐 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

### How it works:

1. **Register/Login**: User receives a JWT token
2. **Store Token**: Frontend stores token (localStorage/sessionStorage)
3. **Send Token**: Include token in Authorization header for protected routes
4. **Token Expiry**: Tokens expire after 7 days (configurable)

### Using the Token:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/records', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Protected Routes:

All routes except `/api/auth/signup` and `/api/auth/login` require authentication.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── User.js              # User model (Patient/Doctor)
│   │   ├── MedicalRecord.js     # Medical records model
│   │   ├── AccessRequest.js     # Access request model
│   │   ├── GrantedAccess.js     # Granted permissions model
│   │   └── SystemEvent.js       # System events/audit log
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── recordsController.js # Medical records logic
│   │   ├── accessController.js  # Access management logic
│   │   └── eventsController.js  # Events/logging logic
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── recordsRoutes.js     # Records endpoints
│   │   ├── accessRoutes.js      # Access endpoints
│   │   └── eventsRoutes.js      # Events endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT verification & authorization
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   └── server.js                # Express app entry point
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🧪 Testing

### Manual Testing with cURL

#### Test Health Endpoint:
```bash
curl http://localhost:5000/health
```

#### Test Signup:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "email": "test@example.com",
    "password": "password123",
    "role": "PATIENT",
    "age": 30
  }'
```

#### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Test Protected Route:
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testing with Postman

1. Import the API collection (create one from endpoints above)
2. Set environment variable `token` after login
3. Use `{{token}}` in Authorization header
4. Test all endpoints systematically

---

## 🚀 Deployment

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=<your-production-mongodb-uri>
JWT_SECRET=<generate-strong-secret-key>
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Platforms

#### Heroku
```bash
heroku create healthchain-api
heroku config:set MONGO_URI=<your-uri>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

#### Render
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

#### Railway
1. Create new project from GitHub
2. Add environment variables
3. Deploy with one click

#### AWS EC2
1. Launch Ubuntu instance
2. Install Node.js and PM2
3. Clone repository
4. Set environment variables
5. Run with PM2: `pm2 start src/server.js`

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: Could not connect to MongoDB
```
**Solution**: 
- Check MongoDB URI in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

#### JWT Token Invalid
```
Error: Not authorized to access this route
```
**Solution**:
- Check if token is being sent in Authorization header
- Verify token hasn't expired
- Ensure JWT_SECRET matches between signup and verification

#### CORS Error
```
Access to fetch has been blocked by CORS policy
```
**Solution**:
- Update `CORS_ORIGIN` in `.env` to match frontend URL
- Restart server after changing environment variables

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
```bash
# Kill process on port 5000
npx kill-port 5000
# Or change PORT in .env
```

---

## 📝 License

MIT License - see LICENSE file for details

---

## 👥 Contributors

- **Development Team**: HealthChain
- **Contact**: support@healthchain.io

---

## 🔗 Related Links

- [Frontend Repository](../frontend)
- [Project Analysis](../PROJECT_ANALYSIS.md)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)

---

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: support@healthchain.io
- Documentation: [Project Analysis](../PROJECT_ANALYSIS.md)

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Active Development