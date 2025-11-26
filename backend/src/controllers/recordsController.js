import MedicalRecord from "../models/MedicalRecord.js";
import User from "../models/User.js";
import SystemEvent from "../models/SystemEvent.js";
import GrantedAccess from "../models/GrantedAccess.js";
import path from "path";
import fs from "fs";

// Helper function to generate mock IPFS CID
const generateIPFSCID = () => {
  return "Qm" + Math.random().toString(36).substring(2, 34).padEnd(32, "0");
};

// Helper function to generate mock transaction hash
const generateTxHash = () => {
  return "0x" + Math.random().toString(36).substring(2, 42).padEnd(40, "0");
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

// Helper function to get file type from filename
const getFileType = (filename) => {
  const ext = filename.split(".").pop().toUpperCase();
  const typeMap = {
    PDF: "PDF",
    DICOM: "DICOM",
    DCM: "DICOM",
    JPG: "JPG",
    JPEG: "JPG",
    PNG: "PNG",
    XML: "XML",
    TXT: "TXT",
    DOC: "DOC",
    DOCX: "DOCX",
  };
  return typeMap[ext] || "OTHER";
};

// @desc    Upload medical record
// @route   POST /api/records/upload
// @access  Private (Patient only)
export const uploadRecord = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        success: false,
        message: "Only patients can upload medical records",
      });
    }

    // Check if file exists from multer
    if (!req.file && !req.body.fileName) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file or provide file information",
      });
    }

    let fileName,
      fileSize,
      fileSizeBytes,
      fileType,
      filePath,
      mimeType,
      fileUrl;

    // If actual file was uploaded via multer
    if (req.file) {
      fileName = req.file.originalname;
      fileSizeBytes = req.file.size;
      fileSize = formatFileSize(req.file.size);
      fileType = getFileType(req.file.originalname);
      filePath = req.file.path;
      mimeType = req.file.mimetype;
      fileUrl = `/api/records/download/${path.basename(req.file.path)}`;
    } else {
      // Fallback for metadata-only uploads (backward compatibility)
      fileName = req.body.fileName;
      fileSize = req.body.fileSize;
      fileSizeBytes = req.body.fileSizeBytes || 0;
      fileType = getFileType(fileName);
    }

    const { recordType, description, tags } = req.body;

    // Generate blockchain and IPFS identifiers
    const ipfsCid = generateIPFSCID();
    const txHash = generateTxHash();
    const lamportClock = Math.floor(Math.random() * 1000) + 4000;
    const blockNumber = Math.floor(Math.random() * 10000) + 1000;

    // Create medical record
    const record = await MedicalRecord.create({
      fileName,
      fileType,
      fileSize,
      fileSizeBytes,
      filePath: filePath || undefined,
      fileUrl: fileUrl || undefined,
      mimeType: mimeType || undefined,
      patientId: req.user._id,
      ipfsCid,
      txHash,
      blockNumber,
      lamportClock,
      nodeId: "Node-Alpha",
      recordType: recordType || "Other",
      description,
      tags: tags || [],
      uploadDate: new Date(),
    });

    // Log system event
    await SystemEvent.logUpload(
      req.user._id,
      req.user.name,
      record._id,
      fileName,
      ipfsCid,
      txHash,
    );

    res.status(201).json({
      success: true,
      message: "Record uploaded successfully",
      data: {
        record,
        blockchain: {
          cid: ipfsCid,
          txHash,
          lamport: lamportClock,
          blockNumber,
        },
      },
    });
  } catch (error) {
    console.error("Upload Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading record",
      error: error.message,
    });
  }
};

// @desc    Get all records for logged-in patient
// @route   GET /api/records
// @access  Private (Patient only)
export const getMyRecords = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        success: false,
        message: "Only patients can view their records",
      });
    }

    const records = await MedicalRecord.findByPatient(req.user._id);

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get Records Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching records",
      error: error.message,
    });
  }
};

// @desc    Get single record by ID
// @route   GET /api/records/:id
// @access  Private (Patient owner or Doctor with access)
export const getRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate(
      "patientId",
      "name email",
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Check authorization
    if (req.user.role === "PATIENT") {
      // Patient can only view their own records
      if (record.patientId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this record",
        });
      }
    } else if (req.user.role === "DOCTOR") {
      // Doctor can only view if they have active access
      const hasAccess = await GrantedAccess.checkAccess(
        req.user._id,
        record.patientId._id,
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this patient's records",
        });
      }

      // Record the access
      await record.recordAccess();
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Get Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching record",
      error: error.message,
    });
  }
};

// @desc    Update record metadata
// @route   PUT /api/records/:id
// @access  Private (Patient owner only)
export const updateRecord = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        success: false,
        message: "Only patients can update their records",
      });
    }

    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Check ownership
    if (record.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this record",
      });
    }

    // Allowed fields to update
    const allowedFields = ["recordType", "description", "tags"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Update Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating record",
      error: error.message,
    });
  }
};

// @desc    Delete (soft delete) medical record
// @route   DELETE /api/records/:id
// @access  Private (Patient owner only)
export const deleteRecord = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== "PATIENT") {
      return res.status(403).json({
        success: false,
        message: "Only patients can delete their records",
      });
    }

    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Check ownership
    if (record.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this record",
      });
    }

    // Soft delete
    await record.softDelete();

    // Log system event
    await SystemEvent.createEvent({
      type: "RECORD_DELETE",
      title: "Record Deleted",
      description: `${record.fileName} removed from ledger`,
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      relatedRecordId: record._id,
      category: "DATA",
      status: "SUCCESS",
    });

    res.status(200).json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("Delete Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting record",
      error: error.message,
    });
  }
};

// @desc    Get records accessible to doctor (via granted access)
// @route   GET /api/records/doctor/accessible
// @access  Private (Doctor only)
export const getDoctorAccessibleRecords = async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access this endpoint",
      });
    }

    // Get all active granted accesses for this doctor
    const grantedAccesses = await GrantedAccess.findActiveByDoctor(
      req.user._id,
    );

    // Get all patient IDs the doctor has access to
    const patientIds = grantedAccesses.map((access) => access.patientId);

    // Get all records for these patients
    const records = await MedicalRecord.find({
      patientId: { $in: patientIds },
      isDeleted: false,
    })
      .populate("patientId", "name email age gender")
      .sort({ uploadDate: -1 });

    // Group records by patient
    const groupedRecords = records.reduce((acc, record) => {
      const patientId = record.patientId._id.toString();
      if (!acc[patientId]) {
        acc[patientId] = {
          patient: record.patientId,
          records: [],
          access: grantedAccesses.find(
            (ga) => ga.patientId.toString() === patientId,
          ),
        };
      }
      acc[patientId].records.push(record);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: records.length,
      patientsCount: Object.keys(groupedRecords).length,
      data: Object.values(groupedRecords),
    });
  } catch (error) {
    console.error("Get Accessible Records Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching accessible records",
      error: error.message,
    });
  }
};

// @desc    Verify record on blockchain
// @route   POST /api/records/:id/verify
// @access  Private (Doctor only)
export const verifyRecord = async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can verify records",
      });
    }

    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Check if doctor has access to this patient
    const hasAccess = await GrantedAccess.checkAccess(
      req.user._id,
      record.patientId,
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this patient's records",
      });
    }

    // Verify the record
    const verifiedRecord = await MedicalRecord.verifyRecord(
      record._id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Record verified successfully",
      data: verifiedRecord,
    });
  } catch (error) {
    console.error("Verify Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying record",
      error: error.message,
    });
  }
};

// @desc    Get record statistics
// @route   GET /api/records/stats
// @access  Private
export const getRecordStats = async (req, res) => {
  try {
    let stats;

    if (req.user.role === "PATIENT") {
      // Patient statistics
      const records = await MedicalRecord.findByPatient(req.user._id);

      stats = {
        totalRecords: records.length,
        totalSize: records.reduce((sum, r) => sum + (r.fileSizeBytes || 0), 0),
        byType: records.reduce((acc, r) => {
          acc[r.recordType] = (acc[r.recordType] || 0) + 1;
          return acc;
        }, {}),
        verified: records.filter((r) => r.isVerified).length,
        unverified: records.filter((r) => !r.isVerified).length,
      };
    } else if (req.user.role === "DOCTOR") {
      // Doctor statistics
      const grantedAccesses = await GrantedAccess.findActiveByDoctor(
        req.user._id,
      );
      const patientIds = grantedAccesses.map((access) => access.patientId);

      const records = await MedicalRecord.find({
        patientId: { $in: patientIds },
        isDeleted: false,
      });

      stats = {
        patientsWithAccess: patientIds.length,
        accessibleRecords: records.length,
        totalAccesses: grantedAccesses.reduce(
          (sum, ga) => sum + ga.accessCount,
          0,
        ),
      };
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Download/View medical record file
// @route   GET /api/records/download/:filename
// @access  Private (Patient owner or Doctor with access)
export const downloadRecord = async (req, res) => {
  try {
    const { filename } = req.params;

    // Find the record by filename
    const filePath = path.join("uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Find the record in database
    const record = await MedicalRecord.findOne({
      filePath: { $regex: filename },
    }).populate("patientId", "name email");

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found in database",
      });
    }

    // Check authorization
    if (req.user.role === "PATIENT") {
      // Patient can only view their own records
      if (record.patientId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this record",
        });
      }
    } else if (req.user.role === "DOCTOR") {
      // Doctor can only view if they have active access
      const hasAccess = await GrantedAccess.checkAccess(
        req.user._id,
        record.patientId._id,
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this patient's records",
        });
      }

      // Record the access
      await record.recordAccess();

      // Log access in granted access
      const grantedAccess = await GrantedAccess.findOne({
        doctorId: req.user._id,
        patientId: record.patientId._id,
        status: "ACTIVE",
      });

      if (grantedAccess) {
        await grantedAccess.recordAccess(record._id, "VIEW", {
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        });
      }
    }

    // Set appropriate headers
    res.setHeader(
      "Content-Type",
      record.mimeType || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${record.fileName}"`,
    );

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading record",
      error: error.message,
    });
  }
};

// @desc    View record file (same as download but with inline display)
// @route   GET /api/records/view/:id
// @access  Private (Patient owner or Doctor with access)
export const viewRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate(
      "patientId",
      "name email",
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Check if file exists
    if (!record.filePath || !fs.existsSync(record.filePath)) {
      return res.status(404).json({
        success: false,
        message: "Physical file not found",
      });
    }

    // Check authorization
    if (req.user.role === "PATIENT") {
      if (record.patientId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this record",
        });
      }
    } else if (req.user.role === "DOCTOR") {
      const hasAccess = await GrantedAccess.checkAccess(
        req.user._id,
        record.patientId._id,
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this patient's records",
        });
      }

      // Record the access
      await record.recordAccess();
    }

    // Set headers for inline display
    res.setHeader(
      "Content-Type",
      record.mimeType || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${record.fileName}"`,
    );

    // Stream the file
    const fileStream = fs.createReadStream(record.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("View Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Error viewing record",
      error: error.message,
    });
  }
};
