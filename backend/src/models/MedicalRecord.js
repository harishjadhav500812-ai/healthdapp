import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: [
        "PDF",
        "DICOM",
        "JPG",
        "PNG",
        "XML",
        "TXT",
        "DOC",
        "DOCX",
        "OTHER",
      ],
    },
    fileSize: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    // File storage
    filePath: {
      type: String,
      required: false, // Optional for now, required if file is actually uploaded
    },
    fileUrl: {
      type: String, // URL to access the file
    },
    mimeType: {
      type: String,
    },
    // Patient who owns this record
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
    // IPFS Content Identifier
    ipfsCid: {
      type: String,
      required: [true, "IPFS CID is required"],
      unique: true,
    },
    // Blockchain transaction hash
    txHash: {
      type: String,
      required: [true, "Transaction hash is required"],
      unique: true,
    },
    // Block number where transaction was mined
    blockNumber: {
      type: Number,
    },
    // Lamport clock for distributed consensus
    lamportClock: {
      type: Number,
      default: 0,
    },
    // Node that processed this upload
    nodeId: {
      type: String,
      default: "Node-Alpha",
    },
    // Record metadata
    recordType: {
      type: String,
      enum: [
        "Lab Report",
        "MRI Scan",
        "X-Ray",
        "CT Scan",
        "Blood Test",
        "Vaccination",
        "Prescription",
        "Other",
      ],
      default: "Other",
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    // Encryption details
    encryptionAlgorithm: {
      type: String,
      default: "AES-256-GCM",
    },
    encryptionKey: {
      type: String,
      select: false, // Never return in queries by default
    },
    // Access control
    isPublic: {
      type: Boolean,
      default: false,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
    },
    // Medical data (optional structured fields)
    medicalData: {
      diagnosis: String,
      symptoms: [String],
      medications: [String],
      doctorNotes: String,
      testResults: mongoose.Schema.Types.Mixed,
    },
    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    // Timestamps
    uploadDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for performance
medicalRecordSchema.index({ patientId: 1, uploadDate: -1 });
// Note: ipfsCid and txHash indexes are created automatically via unique:true
medicalRecordSchema.index({ isDeleted: 1, patientId: 1 });
medicalRecordSchema.index({ recordType: 1 });

// Virtual for formatted upload date
medicalRecordSchema.virtual("formattedUploadDate").get(function () {
  return this.uploadDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

// Virtual populate for patient details
medicalRecordSchema.virtual("patient", {
  ref: "User",
  localField: "patientId",
  foreignField: "_id",
  justOne: true,
});

// Pre-save middleware to update timestamps
medicalRecordSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to soft delete
medicalRecordSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  return this.save();
};

// Method to increment access count
medicalRecordSchema.methods.recordAccess = function () {
  this.accessCount += 1;
  this.lastAccessedAt = Date.now();
  return this.save();
};

// Static method to find records by patient
medicalRecordSchema.statics.findByPatient = function (
  patientId,
  includeDeleted = false,
) {
  const query = { patientId };
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  return this.find(query).sort({ uploadDate: -1 });
};

// Static method to verify record authenticity
medicalRecordSchema.statics.verifyRecord = async function (
  recordId,
  verifierId,
) {
  return this.findByIdAndUpdate(
    recordId,
    {
      isVerified: true,
      verifiedBy: verifierId,
      verifiedAt: Date.now(),
    },
    { new: true },
  );
};

// Query middleware to exclude deleted records by default
medicalRecordSchema.pre(/^find/, function (next) {
  // Only apply if isDeleted is not explicitly set in the query
  if (this.getQuery().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;
