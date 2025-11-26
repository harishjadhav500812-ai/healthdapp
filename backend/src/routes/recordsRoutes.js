import express from "express";
import {
  uploadRecord,
  getMyRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getDoctorAccessibleRecords,
  verifyRecord,
  getRecordStats,
  downloadRecord,
  viewRecord,
} from "../controllers/recordsController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload, { handleUploadError } from "../middleware/upload.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Patient routes
router.post(
  "/upload",
  authorize("PATIENT"),
  upload.single("file"),
  handleUploadError,
  uploadRecord,
);
router.get("/", authorize("PATIENT"), getMyRecords);
router.get("/stats", getRecordStats);
router.put("/:id", authorize("PATIENT"), updateRecord);
router.delete("/:id", authorize("PATIENT"), deleteRecord);

// Doctor routes
router.get(
  "/doctor/accessible",
  authorize("DOCTOR"),
  getDoctorAccessibleRecords,
);
router.post("/:id/verify", authorize("DOCTOR"), verifyRecord);

// File download/view routes (with authorization check inside controller)
router.get("/download/:filename", downloadRecord);
router.get("/view/:id", viewRecord);

// Shared routes (with authorization check inside controller)
router.get("/:id", getRecordById);

export default router;
