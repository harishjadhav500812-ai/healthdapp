import mongoose from 'mongoose';

const grantedAccessSchema = new mongoose.Schema({
  // Patient who granted access
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true
  },
  patientName: {
    type: String,
    required: true
  },
  // Doctor who received access
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor ID is required'],
    index: true
  },
  doctorName: {
    type: String,
    required: true
  },
  // Related access request
  accessRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessRequest',
    required: true,
    index: true
  },
  // Records accessible (empty array means all records)
  accessibleRecords: [{
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    },
    recordName: String,
    ipfsCid: String
  }],
  // Access permissions
  permissions: {
    canView: {
      type: Boolean,
      default: true
    },
    canDownload: {
      type: Boolean,
      default: true
    },
    canShare: {
      type: Boolean,
      default: false
    },
    canComment: {
      type: Boolean,
      default: false
    }
  },
  // Access duration
  grantedAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: String // e.g., "24h", "48h", "7d"
  },
  durationHours: {
    type: Number,
    required: true
  },
  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'REVOKED'],
    default: 'ACTIVE',
    index: true
  },
  // Revocation details
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revocationReason: {
    type: String,
    maxlength: [500, 'Revocation reason cannot exceed 500 characters']
  },
  // Blockchain details
  txHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  blockNumber: {
    type: Number
  },
  lamportClock: {
    type: Number,
    default: 0
  },
  nodeId: {
    type: String,
    default: 'Node-Alpha'
  },
  // Access tracking
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date
  },
  accessLog: [{
    accessedAt: {
      type: Date,
      default: Date.now
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    },
    action: {
      type: String,
      enum: ['VIEW', 'DOWNLOAD', 'SHARE', 'COMMENT']
    },
    ipAddress: String,
    userAgent: String
  }],
  // Notifications
  expiryNotificationSent: {
    type: Boolean,
    default: false
  },
  expiryNotificationSentAt: {
    type: Date
  },
  // Additional metadata
  purpose: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
grantedAccessSchema.index({ patientId: 1, status: 1 });
grantedAccessSchema.index({ doctorId: 1, status: 1 });
grantedAccessSchema.index({ status: 1, expiresAt: 1 });
grantedAccessSchema.index({ patientId: 1, doctorId: 1, status: 1 });

// Virtual for time remaining
grantedAccessSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'ACTIVE') return 'N/A';

  const now = Date.now();
  const remaining = this.expiresAt.getTime() - now;

  if (remaining <= 0) return 'Expired';

  const hours = Math.floor(remaining / 3600000);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(remaining / 60000)}m`;
});

// Virtual for expiry status
grantedAccessSchema.virtual('isExpired').get(function() {
  return Date.now() > this.expiresAt.getTime();
});

// Virtual populate for patient details
grantedAccessSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for doctor details
grantedAccessSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
grantedAccessSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Auto-expire if past expiry date
  if (this.status === 'ACTIVE' && this.isExpired) {
    this.status = 'EXPIRED';
  }

  next();
});

// Method to revoke access
grantedAccessSchema.methods.revoke = async function(revokedById, reason = '') {
  this.status = 'REVOKED';
  this.revokedAt = Date.now();
  this.revokedBy = revokedById;
  this.revocationReason = reason;
  return this.save();
};

// Method to record access
grantedAccessSchema.methods.recordAccess = async function(recordId, action, metadata = {}) {
  this.accessCount += 1;
  this.lastAccessedAt = Date.now();

  this.accessLog.push({
    accessedAt: Date.now(),
    recordId,
    action,
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent
  });

  // Keep only last 100 access logs
  if (this.accessLog.length > 100) {
    this.accessLog = this.accessLog.slice(-100);
  }

  return this.save();
};

// Method to extend access
grantedAccessSchema.methods.extend = async function(additionalHours) {
  if (this.status !== 'ACTIVE') {
    throw new Error('Cannot extend non-active access');
  }

  const newExpiry = new Date(this.expiresAt.getTime() + additionalHours * 3600000);
  this.expiresAt = newExpiry;
  this.durationHours += additionalHours;

  return this.save();
};

// Method to check if access is valid
grantedAccessSchema.methods.isValid = function() {
  return this.status === 'ACTIVE' && !this.isExpired;
};

// Method to check permission
grantedAccessSchema.methods.hasPermission = function(permissionType) {
  return this.permissions[permissionType] === true;
};

// Static method to find active access for doctor
grantedAccessSchema.statics.findActiveByDoctor = function(doctorId) {
  return this.find({
    doctorId,
    status: 'ACTIVE',
    expiresAt: { $gt: new Date() }
  }).sort({ grantedAt: -1 });
};

// Static method to find active access for patient
grantedAccessSchema.statics.findActiveByPatient = function(patientId) {
  return this.find({
    patientId,
    status: 'ACTIVE',
    expiresAt: { $gt: new Date() }
  }).sort({ grantedAt: -1 });
};

// Static method to check if doctor has access to patient
grantedAccessSchema.statics.checkAccess = async function(doctorId, patientId) {
  const access = await this.findOne({
    doctorId,
    patientId,
    status: 'ACTIVE',
    expiresAt: { $gt: new Date() }
  });
  return access !== null;
};

// Static method to expire old access grants
grantedAccessSchema.statics.expireOldGrants = async function() {
  return this.updateMany(
    {
      status: 'ACTIVE',
      expiresAt: { $lt: new Date() }
    },
    {
      status: 'EXPIRED'
    }
  );
};

// Static method to get access statistics
grantedAccessSchema.statics.getAccessStats = async function(userId, role) {
  const matchField = role === 'DOCTOR' ? 'doctorId' : 'patientId';

  return this.aggregate([
    { $match: { [matchField]: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAccesses: { $sum: '$accessCount' }
      }
    }
  ]);
};

// Static method to find expiring soon (within 24 hours)
grantedAccessSchema.statics.findExpiringSoon = function(hours = 24) {
  const now = new Date();
  const threshold = new Date(now.getTime() + hours * 3600000);

  return this.find({
    status: 'ACTIVE',
    expiresAt: { $gt: now, $lt: threshold },
    expiryNotificationSent: false
  });
};

// Query middleware to auto-populate
grantedAccessSchema.pre(/^find/, function(next) {
  // Auto-populate patient and doctor if needed
  if (this.options.populate !== false) {
    this.populate({
      path: 'patient',
      select: 'name email role avatarUrl'
    }).populate({
      path: 'doctor',
      select: 'name email role specialization licenseId avatarUrl'
    });
  }
  next();
});

const GrantedAccess = mongoose.model('GrantedAccess', grantedAccessSchema);

export default GrantedAccess;
