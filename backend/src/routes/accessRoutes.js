import express from 'express';
import {
  requestAccess,
  getMyRequests,
  getMySentRequests,
  approveRequest,
  rejectRequest,
  getGrantedAccesses,
  getPatientGrantedAccesses,
  revokeAccess,
  extendAccess,
  getAccessStats,
  checkDoctorAccess
} from '../controllers/accessController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Doctor routes
router.post('/request', authorize('DOCTOR'), requestAccess);
router.get('/requests/sent', authorize('DOCTOR'), getMySentRequests);
router.get('/granted', authorize('DOCTOR'), getGrantedAccesses);
router.get('/check/:patientId', authorize('DOCTOR'), checkDoctorAccess);

// Patient routes
router.get('/requests', authorize('PATIENT'), getMyRequests);
router.put('/approve/:id', authorize('PATIENT'), approveRequest);
router.put('/reject/:id', authorize('PATIENT'), rejectRequest);
router.get('/granted/patient', authorize('PATIENT'), getPatientGrantedAccesses);
router.put('/revoke/:id', authorize('PATIENT'), revokeAccess);
router.put('/extend/:id', authorize('PATIENT'), extendAccess);

// Shared routes
router.get('/stats', getAccessStats);

export default router;
