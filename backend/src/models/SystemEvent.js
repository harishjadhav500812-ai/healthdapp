import mongoose from 'mongoose';

const systemEventSchema = new mongoose.Schema({
  // Event type
  type: {
    type: String,
    enum: ['UPLOAD', 'ACCESS_GRANT', 'ACCESS_REVOKE', 'CONSENSUS', 'NODE_SYNC', 'LOGIN', 'LOGOUT', 'RECORD_DELETE', 'USER_REGISTER'],
    required: [true, 'Event type is required'],
    index: true
  },
  // Event details
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Distributed system metadata
  lamportClock: {
    type: Number,
    default: 0,
    required: true,
    index: true
  },
  nodeId: {
    type: String,
    required: true,
    default: 'Node-Alpha',
    index: true
  },
  // User who triggered the event
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  userName: {
    type: String
  },
  userRole: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'ADMIN', 'SYSTEM']
  },
  // Related entities
  relatedRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord'
  },
  relatedAccessRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessRequest'
  },
  relatedGrantedAccessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GrantedAccess'
  },
  // Blockchain details
  txHash: {
    type: String,
    sparse: true,
    index: true
  },
  blockNumber: {
    type: Number
  },
  ipfsCid: {
    type: String,
    sparse: true
  },
  // Severity level
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    default: 'INFO',
    index: true
  },
  // Status
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'IN_PROGRESS'],
    default: 'SUCCESS',
    index: true
  },
  // Error details (if any)
  errorMessage: {
    type: String
  },
  errorStack: {
    type: String,
    select: false
  },
  // Network/Request metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  requestId: {
    type: String,
    index: true
  },
  // Additional data (flexible field)
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  // Event categorization
  category: {
    type: String,
    enum: ['AUTHENTICATION', 'AUTHORIZATION', 'DATA', 'BLOCKCHAIN', 'SYSTEM', 'SECURITY'],
    default: 'SYSTEM'
  },
  // Performance metrics
  duration: {
    type: Number, // in milliseconds
    min: 0
  },
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
systemEventSchema.index({ type: 1, timestamp: -1 });
systemEventSchema.index({ userId: 1, timestamp: -1 });
systemEventSchema.index({ nodeId: 1, lamportClock: -1 });
systemEventSchema.index({ severity: 1, timestamp: -1 });
systemEventSchema.index({ category: 1, type: 1 });
systemEventSchema.index({ status: 1, timestamp: -1 });

// TTL index - auto-delete events older than 90 days
systemEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Virtual for formatted timestamp
systemEventSchema.virtual('formattedTimestamp').get(function() {
  const now = Date.now();
  const diff = now - this.timestamp.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
});

// Virtual for time display
systemEventSchema.virtual('timeDisplay').get(function() {
  return this.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Pre-save middleware
systemEventSchema.pre('save', function(next) {
  // Auto-increment Lamport clock if not set
  if (this.isNew && this.lamportClock === 0) {
    SystemEvent.findOne()
      .sort({ lamportClock: -1 })
      .then(lastEvent => {
        if (lastEvent) {
          this.lamportClock = lastEvent.lamportClock + 1;
        } else {
          this.lamportClock = 1;
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

// Static method to create event
systemEventSchema.statics.createEvent = async function(eventData) {
  const event = new this(eventData);
  return event.save();
};

// Static method to log upload event
systemEventSchema.statics.logUpload = async function(userId, userName, recordId, fileName, ipfsCid, txHash) {
  return this.createEvent({
    type: 'UPLOAD',
    title: 'Record Uploaded',
    description: `${fileName} encrypted and uploaded to IPFS`,
    userId,
    userName,
    userRole: 'PATIENT',
    relatedRecordId: recordId,
    ipfsCid,
    txHash,
    category: 'DATA',
    status: 'SUCCESS'
  });
};

// Static method to log access grant
systemEventSchema.statics.logAccessGrant = async function(patientId, patientName, doctorId, doctorName, txHash) {
  return this.createEvent({
    type: 'ACCESS_GRANT',
    title: `Access Granted to ${doctorName}`,
    description: `${patientName} granted access to medical records`,
    userId: patientId,
    userName: patientName,
    userRole: 'PATIENT',
    txHash,
    category: 'AUTHORIZATION',
    status: 'SUCCESS',
    metadata: {
      doctorId,
      doctorName
    }
  });
};

// Static method to log consensus
systemEventSchema.statics.logConsensus = async function(blockNumber, txCount, nodeId) {
  return this.createEvent({
    type: 'CONSENSUS',
    title: `Block #${blockNumber} Mined`,
    description: `${txCount} transaction${txCount !== 1 ? 's' : ''} verified by distributed nodes`,
    category: 'BLOCKCHAIN',
    status: 'SUCCESS',
    nodeId,
    blockNumber,
    metadata: {
      transactionCount: txCount
    }
  });
};

// Static method to log node sync
systemEventSchema.statics.logNodeSync = async function(nodeId, syncStatus) {
  return this.createEvent({
    type: 'NODE_SYNC',
    title: 'Node Synchronization',
    description: `${nodeId} synchronized with network`,
    category: 'SYSTEM',
    status: syncStatus,
    nodeId
  });
};

// Static method to log authentication
systemEventSchema.statics.logAuth = async function(userId, userName, userRole, action, ipAddress, userAgent) {
  return this.createEvent({
    type: action === 'login' ? 'LOGIN' : 'LOGOUT',
    title: action === 'login' ? 'User Login' : 'User Logout',
    description: `${userName} ${action === 'login' ? 'logged in' : 'logged out'} successfully`,
    userId,
    userName,
    userRole,
    category: 'AUTHENTICATION',
    status: 'SUCCESS',
    ipAddress,
    userAgent
  });
};

// Static method to get recent events
systemEventSchema.statics.getRecentEvents = function(limit = 50, filters = {}) {
  return this.find(filters)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email role');
};

// Static method to get events by user
systemEventSchema.statics.getUserEvents = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get events by type
systemEventSchema.statics.getEventsByType = function(type, limit = 50) {
  return this.find({ type })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get events by date range
systemEventSchema.statics.getEventsByDateRange = function(startDate, endDate) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: -1 });
};

// Static method to get event statistics
systemEventSchema.statics.getEventStats = async function(filters = {}) {
  return this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get node activity
systemEventSchema.statics.getNodeActivity = async function(nodeId) {
  return this.aggregate([
    { $match: { nodeId } },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);
};

const SystemEvent = mongoose.model('SystemEvent', systemEventSchema);

export default SystemEvent;
