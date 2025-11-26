# 📁 File Storage Feature - HealthChain DApp

## Overview

This guide explains how medical records (PDF, DICOM, images, etc.) are stored and accessed in the HealthChain DApp with proper authorization.

---

## 🎯 Feature Summary

When a **patient uploads a medical record**:
1. ✅ **File is stored** in the `backend/uploads/` directory
2. ✅ **Metadata is saved** in MongoDB (MedicalRecord collection)
3. ✅ **File path is recorded** in the database
4. ✅ **Blockchain identifiers** (IPFS CID, TX Hash) are generated

When a **doctor requests access**:
1. ✅ Doctor sends access request to patient
2. ✅ Patient approves with time duration
3. ✅ **Granted access is stored** in MongoDB
4. ✅ Doctor can **view and download** the actual files

---

## 📂 File Storage Structure

### Directory Structure
```
healthchain-dapp/
├── backend/
│   ├── uploads/                    # Stored medical files
│   │   ├── MRI_Scan-1234567890.dicom
│   │   ├── Blood_Test-9876543210.pdf
│   │   └── X_Ray-5555555555.jpg
│   └── src/
│       ├── middleware/
│       │   └── upload.js          # Multer file upload config
│       └── controllers/
│           └── recordsController.js
```

### Uploaded Files Naming
Files are automatically renamed with unique identifiers:
```
Original: MRI_Scan.dicom
Stored as: MRI_Scan-1705334567890-123456789.dicom
```

This prevents filename conflicts and ensures uniqueness.

---

## 🔧 How It Works

### 1. Patient Uploads File

**Frontend Request:**
```javascript
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('recordType', 'MRI Scan');
formData.append('description', 'Brain MRI for diagnosis');
formData.append('tags', JSON.stringify(['MRI', 'Brain']));

const response = await fetch('http://localhost:5000/api/records/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Backend Processing:**
1. Multer middleware intercepts file
2. File is saved to `uploads/` directory
3. Record metadata is saved to MongoDB:
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  fileName: "MRI_Scan.dicom",
  fileType: "DICOM",
  fileSize: "45.2 MB",
  fileSizeBytes: 47400000,
  filePath: "uploads/MRI_Scan-1705334567890-123456789.dicom",
  fileUrl: "/api/records/download/MRI_Scan-1705334567890-123456789.dicom",
  mimeType: "application/dicom",
  patientId: "507f1f77bcf86cd799439011",
  ipfsCid: "QmX7yP3c4987f2k9j38d7s6g5h4j3k2l1m0n9b8v7c6x5z",
  txHash: "0x8f2a9b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
  uploadDate: "2024-01-15T10:30:00.000Z"
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
      "txHash": "0x8f2a...",
      "lamport": 4532,
      "blockNumber": 8921
    }
  }
}
```

---

### 2. Doctor Requests Access

**Frontend Request:**
```javascript
const response = await fetch('http://localhost:5000/api/access/request', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${doctorToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    patientId: "507f1f77bcf86cd799439011",
    purpose: "Review MRI scan for consultation",
    requestedDuration: 48
  })
});
```

**What Happens:**
1. Access request is created in database
2. Patient is notified (future: email/push notification)
3. Status: `PENDING`

---

### 3. Patient Approves Request

**Frontend Request:**
```javascript
const response = await fetch(`http://localhost:5000/api/access/approve/${requestId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${patientToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    duration: 48,
    responseMessage: "Access granted for consultation"
  })
});
```

**What Happens:**
1. Access request status → `GRANTED`
2. **GrantedAccess record is created** with expiry date
3. Doctor can now access patient's files

**GrantedAccess Record:**
```javascript
{
  _id: "607f1f77bcf86cd799439022",
  patientId: "507f1f77bcf86cd799439011",
  doctorId: "607f1f77bcf86cd799439033",
  status: "ACTIVE",
  grantedAt: "2024-01-15T10:30:00.000Z",
  expiresAt: "2024-01-17T10:30:00.000Z",
  durationHours: 48,
  permissions: {
    canView: true,
    canDownload: true
  }
}
```

---

### 4. Doctor Views Patient's Files

**Get Accessible Records:**
```javascript
const response = await fetch('http://localhost:5000/api/records/doctor/accessible', {
  headers: {
    'Authorization': `Bearer ${doctorToken}`
  }
});
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "patientsCount": 1,
  "data": [
    {
      "patient": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "records": [
        {
          "_id": "507f1f77bcf86cd799439044",
          "fileName": "MRI_Scan.dicom",
          "fileType": "DICOM",
          "fileSize": "45.2 MB",
          "fileUrl": "/api/records/download/MRI_Scan-1705334567890-123456789.dicom",
          "uploadDate": "2024-01-15T10:30:00.000Z"
        }
      ],
      "access": {
        "expiresAt": "2024-01-17T10:30:00.000Z",
        "timeRemaining": "2d 0h"
      }
    }
  ]
}
```

---

### 5. Doctor Downloads/Views File

**View File (Inline in Browser):**
```javascript
// Open in new tab
window.open(`http://localhost:5000/api/records/view/${recordId}`, '_blank');
```

**Download File:**
```javascript
const response = await fetch(`http://localhost:5000/api/records/download/${filename}`, {
  headers: {
    'Authorization': `Bearer ${doctorToken}`
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'MRI_Scan.dicom';
a.click();
```

**Backend Authorization Check:**
1. Verify doctor has active granted access
2. Check access hasn't expired
3. Record the access in audit log
4. Stream the file to client

---

## 🔒 Security & Authorization

### Multi-Layer Security

1. **JWT Authentication**
   - All endpoints require valid JWT token
   - Token identifies user and role

2. **Role-Based Access Control**
   - Only PATIENT can upload files
   - Only DOCTOR can request access
   - Only PATIENT can approve/reject

3. **Access Permission Validation**
   - Before serving file, check:
     - Is requester the patient owner? ✓
     - OR does doctor have active granted access? ✓
     - Has access expired? ✗

4. **Audit Logging**
   - Every file access is logged
   - Tracks: who, when, which file, action (VIEW/DOWNLOAD)

### Authorization Flow

```
Doctor requests file
    ↓
Check JWT token → Valid?
    ↓
Check role → DOCTOR?
    ↓
Find GrantedAccess record
    ↓
Check status → ACTIVE?
    ↓
Check expiresAt → Not expired?
    ↓
✅ Serve file
    ↓
Log access in audit trail
```

---

## 📊 Database Records

### MedicalRecord (with file storage)
```javascript
{
  _id: ObjectId,
  fileName: "MRI_Scan.dicom",
  fileType: "DICOM",
  fileSize: "45.2 MB",
  fileSizeBytes: 47400000,
  
  // File storage (NEW)
  filePath: "uploads/MRI_Scan-1705334567890-123456789.dicom",
  fileUrl: "/api/records/download/MRI_Scan-1705334567890-123456789.dicom",
  mimeType: "application/dicom",
  
  patientId: ObjectId,
  ipfsCid: "QmX7yP3c...",
  txHash: "0x8f2a...",
  
  // Access tracking
  accessCount: 3,
  lastAccessedAt: "2024-01-16T14:20:00.000Z"
}
```

### GrantedAccess (with access logs)
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  status: "ACTIVE",
  expiresAt: "2024-01-17T10:30:00.000Z",
  
  // Access logs (NEW)
  accessLog: [
    {
      accessedAt: "2024-01-16T14:20:00.000Z",
      recordId: ObjectId,
      action: "VIEW",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0..."
    }
  ],
  accessCount: 3
}
```

---

## 🎨 Frontend Integration

### Update `api.ts` for File Upload

```typescript
// File upload with actual file
export const uploadRecord = async (file: File, metadata: any, token: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('recordType', metadata.recordType);
  formData.append('description', metadata.description);
  formData.append('tags', JSON.stringify(metadata.tags));

  const response = await fetch('http://localhost:5000/api/records/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData // Don't set Content-Type, browser will set it
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  return data;
};
```

### Update Upload Component

```typescript
// PatientUpload.tsx
const handleUpload = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('recordType', recordType);
  formData.append('description', description);
  formData.append('tags', JSON.stringify(tags));

  try {
    const result = await api.records.upload(formData);
    toast.success('File uploaded successfully!');
  } catch (error) {
    toast.error('Upload failed: ' + error.message);
  }
};
```

### Display File Preview/Download

```typescript
// In DoctorDashboard.tsx
const handleViewRecord = (record: MedicalRecord) => {
  const url = `http://localhost:5000${record.fileUrl}`;
  window.open(url, '_blank');
};

const handleDownloadRecord = async (record: MedicalRecord) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:5000${record.fileUrl}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = record.fileName;
  a.click();
};
```

---

## 🔍 Supported File Types

### Allowed File Types
- **PDF**: `application/pdf`
- **DICOM**: `application/dicom`
- **Images**: `image/jpeg`, `image/jpg`, `image/png`
- **XML**: `application/xml`, `text/xml`
- **Text**: `text/plain`
- **Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### File Size Limit
- **Default**: 50 MB
- **Configurable**: Set `MAX_FILE_SIZE` in `.env`

### File Validation
Files are validated on:
1. **MIME type** (from browser)
2. **File extension** (from filename)
3. **File size** (max 50 MB)

---

## 🧪 Testing the Feature

### Step 1: Upload File (as Patient)

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/records/upload \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -F "file=@/path/to/MRI_Scan.dicom" \
  -F "recordType=MRI Scan" \
  -F "description=Brain MRI" \
  -F "tags=[\"MRI\", \"Brain\"]"
```

**Check uploads folder:**
```bash
ls backend/uploads/
# Should show: MRI_Scan-1705334567890-123456789.dicom
```

### Step 2: Request Access (as Doctor)

```bash
curl -X POST http://localhost:5000/api/access/request \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "507f1f77bcf86cd799439011",
    "purpose": "Review MRI scan"
  }'
```

### Step 3: Approve Request (as Patient)

```bash
curl -X PUT http://localhost:5000/api/access/approve/REQUEST_ID \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"duration": 48}'
```

### Step 4: View Files (as Doctor)

```bash
# Get accessible records
curl http://localhost:5000/api/records/doctor/accessible \
  -H "Authorization: Bearer DOCTOR_TOKEN"

# Download specific file
curl http://localhost:5000/api/records/download/MRI_Scan-1705334567890-123456789.dicom \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  --output downloaded_mri.dicom
```

---

## 📈 Access Tracking

### Every File Access is Logged

When a doctor views/downloads a file:

1. **Record access count incremented**
```javascript
record.accessCount += 1;
record.lastAccessedAt = Date.now();
```

2. **Access log entry added to GrantedAccess**
```javascript
grantedAccess.accessLog.push({
  accessedAt: Date.now(),
  recordId: record._id,
  action: 'VIEW', // or 'DOWNLOAD'
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```

3. **System event created**
```javascript
SystemEvent.create({
  type: 'DATA_ACCESS',
  description: 'Dr. Smith accessed MRI_Scan.dicom',
  userId: doctorId,
  relatedRecordId: recordId
});
```

### View Access History

**Patient can view who accessed their files:**
```javascript
GET /api/access/granted/patient
```

Response includes access logs with timestamps and actions.

---

## 🚀 Production Considerations

### File Storage Options

**Current: Local File System**
- ✅ Simple and fast
- ✅ Good for development
- ❌ Not scalable for production
- ❌ No redundancy

**Production Options:**

1. **AWS S3**
   - Scalable cloud storage
   - Built-in redundancy
   - CDN integration

2. **Azure Blob Storage**
   - Enterprise-grade storage
   - HIPAA compliant options

3. **Google Cloud Storage**
   - High performance
   - Global availability

4. **MongoDB GridFS**
   - Store large files in MongoDB
   - Good for metadata queries
   - Single database solution

### Security Enhancements for Production

1. **Encrypt files at rest**
   ```javascript
   import crypto from 'crypto';
   const cipher = crypto.createCipher('aes-256-gcm', encryptionKey);
   ```

2. **Virus scanning**
   - Scan uploaded files with ClamAV or similar
   - Reject infected files

3. **HTTPS only**
   - Never transfer files over HTTP
   - Use SSL/TLS certificates

4. **Signed URLs**
   - Generate temporary signed URLs
   - Auto-expire after download

5. **Rate limiting**
   - Prevent abuse
   - Limit downloads per hour

---

## 🔗 API Endpoints Summary

### Upload & Manage
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/records/upload` | Upload file with metadata |
| GET | `/api/records` | Get my uploaded records |
| PUT | `/api/records/:id` | Update record metadata |
| DELETE | `/api/records/:id` | Delete record |

### Access & View
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/records/doctor/accessible` | Get all accessible records |
| GET | `/api/records/download/:filename` | Download file |
| GET | `/api/records/view/:id` | View file inline |
| GET | `/api/records/:id` | Get record details |

### Access Control
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/access/request` | Request access |
| PUT | `/api/access/approve/:id` | Approve request |
| PUT | `/api/access/reject/:id` | Reject request |
| PUT | `/api/access/revoke/:id` | Revoke access |

---

## ✅ Feature Checklist

- [x] File upload with multer
- [x] File storage in uploads/ directory
- [x] Unique filename generation
- [x] File metadata in MongoDB
- [x] File type validation
- [x] File size limit (50MB)
- [x] Authorization checks
- [x] Doctor can request access
- [x] Patient can approve/reject
- [x] Doctor can view granted records
- [x] Doctor can download files
- [x] Access tracking and logging
- [x] Time-based access expiry
- [x] Audit trail for all file access
- [ ] Frontend integration (TODO)
- [ ] Cloud storage integration (Future)
- [ ] File encryption (Future)
- [ ] DICOM viewer (Future)

---

## 📞 Support

If you encounter issues:

1. Check backend logs
2. Verify uploads/ directory exists and is writable
3. Check MongoDB records
4. Verify JWT tokens are valid
5. Check granted access hasn't expired

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Fully Functional