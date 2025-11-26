import AccessRequest from '../models/AccessRequest.js';
import GrantedAccess from '../models/GrantedAccess.js';
import User from '../models/User.js';
import SystemEvent from '../models/SystemEvent.js';

// Helper function to generate mock transaction hash
const generateTxHash = () => {
  return '0x' + Math.random().toString(36).substring(2, 42).padEnd(40, '0');
};

// Helper function to calculate duration display
const formatDuration = (hours) => {
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// @desc    Request access to patient records (Doctor)
// @route   POST /api/access/request
// @access  Private (Doctor only)
export const requestAccess = async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can request access to patient records'
      });
    }

    const { patientId, purpose, requestedDuration, requestedRecords, riskLevel } = req.body;

    // Validate required fields
    if (!patientId || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientId and purpose'
      });
    }

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (patient.role !== 'PATIENT') {
      return res.status(400).json({
        success: false,
        message: 'Provided user is not a patient'
      });
    }

    // Check if there's already a pending request
    const existingRequest = await AccessRequest.findOne({
      doctorId: req.user._id,
      patientId: patientId,
      status: 'PENDING'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this patient'
      });
    }

    // Check if doctor already has active access
    const hasActiveAccess = await GrantedAccess.checkAccess(req.user._id, patientId);
    if (hasActiveAccess) {
      return res.status(400).json({
        success: false,
        message: 'You already have active access to this patient\'s records'
      });
    }

    // Create access request
    const accessRequest = await AccessRequest.create({
      patientId: patient._id,
      patientName: patient.name,
      doctorId: req.user._id,
      doctorName: req.user.name,
      specialization: req.user.specialization || 'General Practitioner',
      purpose,
      status: 'PENDING',
      requestedDuration: requestedDuration || 24,
      requestedRecords: requestedRecords || [],
      riskLevel: riskLevel || 'LOW',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Log system event
    await SystemEvent.createEvent({
      type: 'ACCESS_GRANT',
      title: 'Access Request Sent',
      description: `Dr. ${req.user.name} requested access to ${patient.name}'s records`,
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'DOCTOR',
      relatedAccessRequestId: accessRequest._id,
      category: 'AUTHORIZATION',
      status: 'PENDING',
      metadata: {
        patientId: patient._id,
        patientName: patient.name
      }
    });

    res.status(201).json({
      success: true,
      message: 'Access request sent successfully',
      data: accessRequest
    });

  } catch (error) {
    console.error('Request Access Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting access',
      error: error.message
    });
  }
};

// @desc    Get all access requests for patient
// @route   GET /api/access/requests
// @access  Private (Patient only)
export const getMyRequests = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can view their access requests'
      });
    }

    const requests = await AccessRequest.findPendingByPatient(req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching access requests',
      error: error.message
    });
  }
};

// @desc    Get all access requests sent by doctor
// @route   GET /api/access/requests/sent
// @access  Private (Doctor only)
export const getMySentRequests = async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view their sent requests'
      });
    }

    const { status } = req.query;
    const requests = await AccessRequest.findByDoctor(req.user._id, status);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Get Sent Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sent requests',
      error: error.message
    });
  }
};

// @desc    Approve access request
// @route   PUT /api/access/approve/:id
// @access  Private (Patient only)
export const approveRequest = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can approve access requests'
      });
    }

    const accessRequest = await AccessRequest.findById(req.params.id);

    if (!accessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    // Check ownership
    if (accessRequest.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this request'
      });
    }

    // Check if already processed
    if (accessRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request already ${accessRequest.status.toLowerCase()}`
      });
    }

    const { responseMessage, duration } = req.body;

    // Approve the request
    await accessRequest.approve(responseMessage);

    // Calculate expiry date
    const durationHours = duration || accessRequest.requestedDuration || 24;
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    // Create granted access
    const grantedAccess = await GrantedAccess.create({
      patientId: req.user._id,
      patientName: req.user.name,
      doctorId: accessRequest.doctorId,
      doctorName: accessRequest.doctorName,
      accessRequestId: accessRequest._id,
      accessibleRecords: accessRequest.requestedRecords || [],
      permissions: {
        canView: true,
        canDownload: true,
        canShare: false,
        canComment: false
      },
      grantedAt: new Date(),
      expiresAt: expiresAt,
      duration: formatDuration(durationHours),
      durationHours: durationHours,
      status: 'ACTIVE',
      txHash: accessRequest.txHash,
      lamportClock: accessRequest.lamportClock,
      purpose: accessRequest.purpose
    });

    // Log system event
    await SystemEvent.logAccessGrant(
      req.user._id,
      req.user.name,
      accessRequest.doctorId,
      accessRequest.doctorName,
      accessRequest.txHash
    );

    res.status(200).json({
      success: true,
      message: 'Access request approved successfully',
      data: {
        request: accessRequest,
        grantedAccess: grantedAccess
      }
    });

  } catch (error) {
    console.error('Approve Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving access request',
      error: error.message
    });
  }
};

// @desc    Reject access request
// @route   PUT /api/access/reject/:id
// @access  Private (Patient only)
export const rejectRequest = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can reject access requests'
      });
    }

    const accessRequest = await AccessRequest.findById(req.params.id);

    if (!accessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    // Check ownership
    if (accessRequest.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    // Check if already processed
    if (accessRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request already ${accessRequest.status.toLowerCase()}`
      });
    }

    const { responseMessage } = req.body;

    // Reject the request
    await accessRequest.reject(responseMessage);

    // Log system event
    await SystemEvent.createEvent({
      type: 'ACCESS_GRANT',
      title: 'Access Request Rejected',
      description: `${req.user.name} rejected access request from ${accessRequest.doctorName}`,
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'PATIENT',
      relatedAccessRequestId: accessRequest._id,
      category: 'AUTHORIZATION',
      status: 'FAILED',
      metadata: {
        doctorId: accessRequest.doctorId,
        doctorName: accessRequest.doctorName
      }
    });

    res.status(200).json({
      success: true,
      message: 'Access request rejected',
      data: accessRequest
    });

  } catch (error) {
    console.error('Reject Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting access request',
      error: error.message
    });
  }
};

// @desc    Get granted accesses for doctor
// @route   GET /api/access/granted
// @access  Private (Doctor only)
export const getGrantedAccesses = async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view granted accesses'
      });
    }

    const grantedAccesses = await GrantedAccess.findActiveByDoctor(req.user._id);

    res.status(200).json({
      success: true,
      count: grantedAccesses.length,
      data: grantedAccesses
    });

  } catch (error) {
    console.error('Get Granted Accesses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching granted accesses',
      error: error.message
    });
  }
};

// @desc    Get granted accesses for patient (who has access to my records)
// @route   GET /api/access/granted/patient
// @access  Private (Patient only)
export const getPatientGrantedAccesses = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can view who has access to their records'
      });
    }

    const grantedAccesses = await GrantedAccess.findActiveByPatient(req.user._id);

    res.status(200).json({
      success: true,
      count: grantedAccesses.length,
      data: grantedAccesses
    });

  } catch (error) {
    console.error('Get Patient Granted Accesses Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching granted accesses',
      error: error.message
    });
  }
};

// @desc    Revoke granted access
// @route   PUT /api/access/revoke/:id
// @access  Private (Patient only)
export const revokeAccess = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can revoke access'
      });
    }

    const grantedAccess = await GrantedAccess.findById(req.params.id);

    if (!grantedAccess) {
      return res.status(404).json({
        success: false,
        message: 'Granted access not found'
      });
    }

    // Check ownership
    if (grantedAccess.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to revoke this access'
      });
    }

    // Check if already revoked
    if (grantedAccess.status === 'REVOKED') {
      return res.status(400).json({
        success: false,
        message: 'Access already revoked'
      });
    }

    const { reason } = req.body;

    // Revoke the access
    await grantedAccess.revoke(req.user._id, reason);

    // Log system event
    await SystemEvent.createEvent({
      type: 'ACCESS_REVOKE',
      title: 'Access Revoked',
      description: `${req.user.name} revoked access for ${grantedAccess.doctorName}`,
      userId: req.user._id,
      userName: req.user.name,
      userRole: 'PATIENT',
      relatedGrantedAccessId: grantedAccess._id,
      category: 'AUTHORIZATION',
      status: 'SUCCESS',
      metadata: {
        doctorId: grantedAccess.doctorId,
        doctorName: grantedAccess.doctorName,
        reason: reason
      }
    });

    res.status(200).json({
      success: true,
      message: 'Access revoked successfully',
      data: grantedAccess
    });

  } catch (error) {
    console.error('Revoke Access Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking access',
      error: error.message
    });
  }
};

// @desc    Extend granted access
// @route   PUT /api/access/extend/:id
// @access  Private (Patient only)
export const extendAccess = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'PATIENT') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can extend access'
      });
    }

    const grantedAccess = await GrantedAccess.findById(req.params.id);

    if (!grantedAccess) {
      return res.status(404).json({
        success: false,
        message: 'Granted access not found'
      });
    }

    // Check ownership
    if (grantedAccess.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to extend this access'
      });
    }

    const { additionalHours } = req.body;

    if (!additionalHours || additionalHours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid additional hours'
      });
    }

    // Extend the access
    await grantedAccess.extend(additionalHours);

    res.status(200).json({
      success: true,
      message: 'Access extended successfully',
      data: grantedAccess
    });

  } catch (error) {
    console.error('Extend Access Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error extending access',
      error: error.message
    });
  }
};

// @desc    Get access statistics
// @route   GET /api/access/stats
// @access  Private
export const getAccessStats = async (req, res) => {
  try {
    let stats;

    if (req.user.role === 'PATIENT') {
      // Patient statistics
      const [requests, grantedAccesses] = await Promise.all([
        AccessRequest.getPatientStats(req.user._id),
        GrantedAccess.getAccessStats(req.user._id, 'PATIENT')
      ]);

      stats = {
        requests: requests,
        grantedAccesses: grantedAccesses,
        totalDoctorsWithAccess: await GrantedAccess.countDocuments({
          patientId: req.user._id,
          status: 'ACTIVE'
        })
      };
    } else if (req.user.role === 'DOCTOR') {
      // Doctor statistics
      const [grantedAccesses, pendingRequests] = await Promise.all([
        GrantedAccess.getAccessStats(req.user._id, 'DOCTOR'),
        AccessRequest.countDocuments({
          doctorId: req.user._id,
          status: 'PENDING'
        })
      ]);

      stats = {
        grantedAccesses: grantedAccesses,
        pendingRequests: pendingRequests,
        totalPatientsWithAccess: await GrantedAccess.countDocuments({
          doctorId: req.user._id,
          status: 'ACTIVE'
        })
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get Access Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching access statistics',
      error: error.message
    });
  }
};

// @desc    Check if doctor has access to patient
// @route   GET /api/access/check/:patientId
// @access  Private (Doctor only)
export const checkDoctorAccess = async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'DOCTOR') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can check access'
      });
    }

    const { patientId } = req.params;

    const hasAccess = await GrantedAccess.checkAccess(req.user._id, patientId);

    res.status(200).json({
      success: true,
      hasAccess: hasAccess
    });

  } catch (error) {
    console.error('Check Access Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking access',
      error: error.message
    });
  }
};
