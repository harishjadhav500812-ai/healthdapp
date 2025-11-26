import express from 'express';
import {
  getAllEvents,
  getUserEvents,
  getMyEvents,
  getEventsByType,
  getEventsByDateRange,
  getEventStats,
  getNodeActivity,
  createEvent,
  getConsensusEvents,
  getDashboardActivity
} from '../controllers/eventsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// General event routes
router.get('/', getAllEvents);
router.get('/me', getMyEvents);
router.get('/stats', getEventStats);
router.get('/dashboard', getDashboardActivity);
router.get('/type/:type', getEventsByType);
router.get('/date-range', getEventsByDateRange);
router.get('/user/:userId', getUserEvents);

// Blockchain-specific routes
router.get('/blockchain/consensus', getConsensusEvents);
router.get('/node/:nodeId', getNodeActivity);

// Admin/System routes
router.post('/', createEvent);

export default router;
