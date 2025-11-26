import SystemEvent from '../models/SystemEvent.js';

// @desc    Get all system events
// @route   GET /api/events
// @access  Private
export const getAllEvents = async (req, res) => {
  try {
    const { limit = 50, type, severity, status, nodeId } = req.query;

    // Build filter object
    const filters = {};
    if (type) filters.type = type;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (nodeId) filters.nodeId = nodeId;

    const events = await SystemEvent.getRecentEvents(parseInt(limit), filters);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system events',
      error: error.message
    });
  }
};

// @desc    Get events by user
// @route   GET /api/events/user/:userId
// @access  Private
export const getUserEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    // Check authorization - users can only see their own events unless admin
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these events'
      });
    }

    const events = await SystemEvent.getUserEvents(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('Get User Events Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user events',
      error: error.message
    });
  }
};

// @desc    Get my events
// @route   GET /api/events/me
// @access  Private
export const getMyEvents = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const events = await SystemEvent.getUserEvents(req.user._id, parseInt(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('Get My Events Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your events',
      error: error.message
    });
  }
};

// @desc    Get events by type
// @route   GET /api/events/type/:type
// @access  Private
export const getEventsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 50 } = req.query;

    const validTypes = ['UPLOAD', 'ACCESS_GRANT', 'ACCESS_REVOKE', 'CONSENSUS', 'NODE_SYNC', 'LOGIN', 'LOGOUT', 'RECORD_DELETE', 'USER_REGISTER'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
    }

    const events = await SystemEvent.getEventsByType(type, parseInt(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('Get Events By Type Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events by type',
      error: error.message
    });
  }
};

// @desc    Get events by date range
// @route   GET /api/events/date-range
// @access  Private
export const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const events = await SystemEvent.getEventsByDateRange(start, end);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('Get Events By Date Range Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events by date range',
      error: error.message
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private
export const getEventStats = async (req, res) => {
  try {
    const { type, severity, status } = req.query;

    // Build filter object
    const filters = {};
    if (type) filters.type = type;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;

    const stats = await SystemEvent.getEventStats(filters);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get Event Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event statistics',
      error: error.message
    });
  }
};

// @desc    Get node activity
// @route   GET /api/events/node/:nodeId
// @access  Private
export const getNodeActivity = async (req, res) => {
  try {
    const { nodeId } = req.params;

    const activity = await SystemEvent.getNodeActivity(nodeId);

    res.status(200).json({
      success: true,
      nodeId: nodeId,
      data: activity
    });

  } catch (error) {
    console.error('Get Node Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching node activity',
      error: error.message
    });
  }
};

// @desc    Create manual event (for testing or admin purposes)
// @route   POST /api/events
// @access  Private (Admin only or for system use)
export const createEvent = async (req, res) => {
  try {
    const { type, title, description, severity, status, metadata } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, title, and description'
      });
    }

    const event = await SystemEvent.createEvent({
      type,
      title,
      description,
      severity: severity || 'INFO',
      status: status || 'SUCCESS',
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      category: 'SYSTEM',
      metadata: metadata || {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });

  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// @desc    Get blockchain consensus events
// @route   GET /api/events/blockchain/consensus
// @access  Private
export const getConsensusEvents = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const events = await SystemEvent.find({ type: 'CONSENSUS' })
      .sort({ lamportClock: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('Get Consensus Events Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consensus events',
      error: error.message
    });
  }
};

// @desc    Get recent activity for dashboard
// @route   GET /api/events/dashboard
// @access  Private
export const getDashboardActivity = async (req, res) => {
  try {
    let events;

    if (req.user.role === 'PATIENT') {
      // Patient sees their own activity
      events = await SystemEvent.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .limit(10);
    } else if (req.user.role === 'DOCTOR') {
      // Doctor sees access-related events
      events = await SystemEvent.find({
        $or: [
          { userId: req.user._id },
          { 'metadata.doctorId': req.user._id }
        ],
        type: { $in: ['ACCESS_GRANT', 'ACCESS_REVOKE', 'UPLOAD'] }
      })
        .sort({ timestamp: -1 })
        .limit(10);
    } else {
      // Admin or system view
      events = await SystemEvent.find()
        .sort({ timestamp: -1 })
        .limit(10);
    }

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error) {
    console.error('Get Dashboard Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard activity',
      error: error.message
    });
  }
};
