import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema({
  // Patient who received the request
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
  // Doctor who made the request
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
  specialization: {
    type: String
  },
  // Request details
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    maxlength: [1000, 'Purpose cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['PENDING', 'GRANTED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING',
    required: true,
    index: true
  },
  // Risk assessment
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  // Specific records requested (optional - if empty, means all records)
  requestedRecords: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  }],
  // Access duration (in hours)
  requestedDuration: {
    type: Number,
    default: 24,
    min: 1,
    max: 720 // 30 days max
  },
  // Response details
  respondedAt: {
    type: Date
  },
  responseMessage: {
    type: String,
    maxlength: [500, 'Response message cannot exceed 500 characters']
  },
  // Blockchain details
  txHash: {
    type: String,
    sparse: true,
    index: true
  },
  lamportClock: {
    type: Number,
    default: 0
  },
  nodeId: {
    type: String,
    default: 'Node-Alpha'
  },
  // Notification status
  isNotificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  },
  // Expiry
  expiresAt: {
    type: Date
  },
  // Metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
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
accessRequestSchema.index({ patientId: 1, status: 1 });
accessRequestSchema.index({ doctorId: 1, status: 1 });
accessRequestSchema.index({ status: 1, createdAt: -1 });
accessRequestSchema.index({ expiresAt: 1 }, { sparse: true });

// Virtual for time ago
accessRequestSchema.virtual('timeAgo').get(function() {
  const now = Date.now();
  const diff = now - this.createdAt.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
});

// Virtual populate for patient details
accessRequestSchema.virtual('patient', {
  ref: 'User',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual populate for doctor details
accessRequestSchema.virtual('doctor', {
  ref: 'User',
  localField: 'doctorId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
accessRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Set expiry date if not set (30 days from creation for pending requests)
  if (!this.expiresAt && this.status === 'PENDING') {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  next();
});

// Method to approve request
accessRequestSchema.methods.approve = async function(responseMessage = '') {
  this.status = 'GRANTED';
  this.respondedAt = Date.now();
  this.responseMessage = responseMessage;

  // Generate mock transaction hash
  this.txHash = '0x' + Math.random().toString(36).substring(2, 42).padEnd(40, '0');
  this.lamportClock = Math.floor(Math.random() * 1000) + 4000;

  return this.save();
};

// Method to reject request
accessRequestSchema.methods.reject = async function(responseMessage = '') {
  this.status = 'REJECTED';
  this.respondedAt = Date.now();
  this.responseMessage = responseMessage;
  return this.save();
};

// Method to check if request is expired
accessRequestSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return Date.now() > this.expiresAt.getTime();
};

// Static method to find pending requests for a patient
accessRequestSchema.statics.findPendingByPatient = function(patientId) {
  return this.find({
    patientId,
    status: 'PENDING',
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to find requests by doctor
accessRequestSchema.statics.findByDoctor = function(doctorId, status = null) {
  const query = { doctorId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to expire old pending requests
accessRequestSchema.statics.expireOldRequests = async function() {
  return this.updateMany(
    {
      status: 'PENDING',
      expiresAt: { $lt: new Date() }
    },
    {
      status: 'EXPIRED',
      respondedAt: Date.now()
    }
  );
};

// Static method to get request statistics for a patient
accessRequestSchema.statics.getPatientStats = async function(patientId) {
  return this.aggregate([
    { $match: { patientId: mongoose.Types.ObjectId(patientId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Query middleware to auto-populate patient and doctor
accessRequestSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'patient',
    select: 'name email role avatarUrl'
  }).populate({
    path: 'doctor',
    select: 'name email role specialization licenseId avatarUrl'
  });
  next();
});

const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);

export default AccessRequest;
