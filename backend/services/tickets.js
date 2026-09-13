const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { labs, tickets } = require('../state/state');

// Audit log file path
const AUDIT_LOG_PATH = path.resolve(__dirname, '..', 'logs', 'ticket-audit.log');

function ensureAuditLogDir() {
  const logDir = path.dirname(AUDIT_LOG_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Encryption at rest for sensitive ticket fields
function getEncryptionKey() {
  return process.env.TICKET_ENCRYPTION_KEY || crypto.createHash('sha256').update(process.env.JWT_SECRET || 'cybernet-lab-default').digest();
}

function encryptField(value) {
  if (!value) return value;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
  let encrypted = cipher.update(String(value), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptField(value) {
  if (!value || typeof value !== 'string' || !value.includes(':')) return value;
  try {
    const [ivHex, encrypted] = value.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return value;
  }
}

function logAuditEntry(entry) {
  ensureAuditLogDir();
  const timestamp = Date.now();
  const logEntry = `[${timestamp}] ${entry}\n`;
  fs.appendFileSync(AUDIT_LOG_PATH, logEntry);
}

/**
 * Validates ticket input data
 */
function validateTicketData(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate) {
    // Required fields for creating a ticket
    if (!data.labId) errors.push('labId is required');
    if (!data.issueType) errors.push('issueType is required');
    if (!data.description) errors.push('description is required');
    if (!data.reportedBy) errors.push('reportedBy is required');
    
    // Validate issue type
    const validIssueTypes = ['configuration_error', 'verification_failure', 'connectivity_issue', 'other'];
    if (data.issueType && !validIssueTypes.includes(data.issueType)) {
      errors.push(`issueType must be one of: ${validIssueTypes.join(', ')}`);
    }
  }
  
  // Validate status for updates
  if (isUpdate && data.status) {
    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`status must be one of: ${validStatuses.join(', ')}`);
    }
  }
  
  // Validate lab exists (for new tickets)
  if (data.labId && !labs.has(data.labId)) {
    errors.push('labId must reference an existing lab');
  }
  
  return errors;
}

/**
 * Create a new ticket
 */
function createTicket(data) {
  const errors = validateTicketData(data);
  if (errors.length > 0) {
    return { error: errors.join(', ') };
  }
  
  const ticket = {
    id: uuidv4(),
    labId: data.labId,
    issueType: data.issueType,
    description: encryptField(data.description),
    reportedBy: encryptField(data.reportedBy),
    status: 'open',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    evidence: (data.evidence || []).map(e => ({ ...e, data: encryptField(e.data) })),
    assignedTo: data.assignedTo || null,
    severity: data.severity || 'medium',
    impactedDevices: data.impactedDevices || [],
    investigationSteps: data.investigationSteps || [],
    remediation: encryptField(data.remediation),
    verificationSteps: data.verificationSteps || [],
    tags: data.tags || []
  };
  
  tickets.set(ticket.id, ticket);
  logAuditEntry(JSON.stringify({ action: 'ticket.created', ticketId: ticket.id, labId: ticket.labId, reportedBy: ticket.reportedBy, status: ticket.status, timestamp: Date.now() }));
  return { ticket: { ...ticket, description: decryptField(ticket.description), reportedBy: decryptField(ticket.reportedBy) } };
}

/**
 * Get tickets with optional filtering
 */
function getTickets(filter = {}) {
  let ticketList = Array.from(tickets.values());

  // Apply filters
  if (filter.labId) {
    ticketList = ticketList.filter(t => t.labId === filter.labId);
  }
  if (filter.id) {
    ticketList = ticketList.filter(t => t.id === filter.id);
  }
  if (filter.status) {
    ticketList = ticketList.filter(t => t.status === filter.status);
  }
  if (filter.reportedBy) {
    const encryptedFilter = encryptField(filter.reportedBy);
    ticketList = ticketList.filter(t => t.reportedBy === encryptedFilter);
  }
  if (filter.assignedTo) {
    ticketList = ticketList.filter(t => t.assignedTo === filter.assignedTo);
  }
  if (filter.severity) {
    ticketList = ticketList.filter(t => t.severity === filter.severity);
  }

  // Filter out resolved tickets if requested
  if (filter.includeResolved === false) {
    ticketList = ticketList.filter(t => t.status !== 'resolved');
  }

  // Apply sorting
  const sortBy = filter.sortBy || 'createdAt';
  const sortOrder = filter.sortOrder || 'desc';

  ticketList.sort((a, b) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;

    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });

  // Apply pagination
  const page = filter.page || 1;
  const limit = filter.limit || 50;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  logAuditEntry(JSON.stringify({ action: 'tickets.listed', filter: { labId: filter.labId, status: filter.status, severity: filter.severity }, count: ticketList.length, timestamp: Date.now() }));

  return {
    tickets: ticketList.slice(startIndex, endIndex).map(ticket => ({
      ...ticket,
      description: decryptField(ticket.description),
      reportedBy: decryptField(ticket.reportedBy),
      remediation: decryptField(ticket.remediation),
      evidence: (ticket.evidence || []).map(e => ({ ...e, data: decryptField(e.data) }))
    })),
    pagination: {
      page,
      limit,
      total: ticketList.length,
      totalPages: Math.ceil(ticketList.length / limit)
    }
  };
}

/**
 * Update ticket with comprehensive field support
 */
function updateTicket(ticketId, data) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { error: 'Ticket not found' };
  }
  
  const errors = validateTicketData(data, true);
  if (errors.length > 0) {
    return { error: errors.join(', ') };
  }
  
  const updates = {};
  
  // Update allowed fields
  if (data.issueType) updates.issueType = data.issueType;
  if (data.description) updates.description = encryptField(data.description);
  if (data.status) updates.status = data.status;
  if (data.assignedTo !== undefined) updates.assignedTo = data.assignedTo;
  if (data.severity) updates.severity = data.severity;
  if (data.evidence) updates.evidence = data.evidence.map(e => ({ ...e, data: encryptField(e.data) }));
  if (data.impactedDevices) updates.impactedDevices = [...data.impactedDevices];
  if (data.investigationSteps) updates.investigationSteps = [...data.investigationSteps];
  if (data.remediation) updates.remediation = encryptField(data.remediation);
  if (data.verificationSteps) updates.verificationSteps = [...data.verificationSteps];
  if (data.tags) updates.tags = [...data.tags];
  if (data.notes) updates.notes = encryptField(data.notes);
  
  // Update timestamp
  updates.updatedAt = Date.now();
  
  // Apply updates
  Object.assign(ticket, updates);
  
  logAuditEntry(JSON.stringify({ action: 'ticket.updated', ticketId, updates: Object.keys(updates), updatedBy: data.updatedBy || 'system', timestamp: Date.now() }));
  return { ticket: { ...ticket, description: decryptField(ticket.description), reportedBy: decryptField(ticket.reportedBy), remediation: decryptField(ticket.remediation), evidence: (ticket.evidence || []).map(e => ({ ...e, data: decryptField(e.data) })) } };
}

/**
 * Add evidence to a ticket
 */
function addEvidence(ticketId, evidenceData) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { error: 'Ticket not found' };
  }
  
  const evidence = {
    id: uuidv4(),
    type: evidenceData.type || 'screenshot',
    data: evidenceData.data || '',
    description: evidenceData.description || '',
    timestamp: Date.now(),
    addedBy: evidenceData.addedBy || 'system'
  };
  
  if (!ticket.evidence) ticket.evidence = [];
  ticket.evidence.push(evidence);
  ticket.updatedAt = Date.now();
  
  logAuditEntry(JSON.stringify({ action: 'evidence.added', ticketId, evidenceId: evidence.id, addedBy: evidence.addedBy || 'system', timestamp: Date.now() }));
  return { evidence };
}

/**
 * Add investigation step to a ticket
 */
function addInvestigationStep(ticketId, stepData) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { error: 'Ticket not found' };
  }
  
  const step = {
    id: uuidv4(),
    title: stepData.title,
    description: stepData.description,
    actions: stepData.actions || [],
    results: stepData.results || [],
    timestamp: Date.now(),
    completedBy: stepData.completedBy,
    completedAt: Date.now()
  };
  
  if (!ticket.investigationSteps) ticket.investigationSteps = [];
  ticket.investigationSteps.push(step);
  ticket.updatedAt = Date.now();
  
  logAuditEntry(JSON.stringify({ action: 'investigation.step.added', ticketId, stepId: step.id, completedBy: step.completedBy || 'system', timestamp: Date.now() }));
  return { step };
}

/**
 * Assign ticket to a person/team
 */
function assignTicket(ticketId, assignedTo, assignedBy) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { error: 'Ticket not found' };
  }
  
  ticket.assignedTo = assignedTo;
  ticket.assignedAt = Date.now();
  ticket.assignedBy = assignedBy;
  ticket.updatedAt = Date.now();
  
  logAuditEntry(JSON.stringify({ action: 'ticket.assigned', ticketId, assignedTo, assignedBy, timestamp: Date.now() }));
  return { ticket };
}

/**
 * Close a ticket with verification steps
 */
function closeTicket(ticketId, verificationData) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { error: 'Ticket not found' };
  }
  
  if (ticket.status === 'resolved') {
    return { error: 'Ticket is already resolved' };
  }
  
  ticket.status = 'resolved';
  ticket.resolvedAt = Date.now();
  ticket.resolvedBy = verificationData.resolvedBy || 'system';
  ticket.resolution = verificationData.resolution || '';
  ticket.verificationSteps = verificationData.verificationSteps || [];
  ticket.followUpActions = verificationData.followUpActions || [];
  ticket.updatedAt = Date.now();
  
  logAuditEntry(JSON.stringify({ action: 'ticket.closed', ticketId, resolvedBy: ticket.resolvedBy, timestamp: Date.now() }));
  return { ticket };
}

/**
 * Delete a ticket (requires proper permissions)
 */
function deleteTicket(ticketId, deletedBy) {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return { error: 'Ticket not found' };
  }
  
  // Only allow deleting unresolved tickets
  if (ticket.status !== 'open') {
    return { error: 'Cannot delete resolved or in-progress tickets' };
  }
  
  tickets.delete(ticketId);
  logAuditEntry(JSON.stringify({ action: 'ticket.deleted', ticketId, deletedBy: deletedBy || 'system', timestamp: Date.now() }));
  return { success: true, message: 'Ticket deleted successfully' };
}

/**
 * Search tickets by various criteria
 */
function searchTickets(searchQuery) {
  const ticketList = Array.from(tickets.values());
  const query = searchQuery.toLowerCase();

  const results = ticketList.filter(ticket => {
    const searchableFields = [
      ticket.id,
      ticket.issueType,
      decryptField(ticket.description),
      decryptField(ticket.reportedBy),
      ticket.assignedTo,
      ticket.severity
    ];

    return searchableFields.some(field =>
      field && field.toString().toLowerCase().includes(query)
    );
  });

  logAuditEntry(JSON.stringify({ action: 'tickets.searched', query, resultCount: results.length, timestamp: Date.now() }));
  return { tickets: results, count: results.length };
}

/**
 * Get ticket statistics for dashboard
 */
function getTicketStats() {
  const ticketList = Array.from(tickets.values());

  const stats = {
    total: ticketList.length,
    open: ticketList.filter(t => t.status === 'open').length,
    inProgress: ticketList.filter(t => t.status === 'in_progress').length,
    resolved: ticketList.filter(t => t.status === 'resolved').length,
    bySeverity: {
      low: ticketList.filter(t => t.severity === 'low').length,
      medium: ticketList.filter(t => t.severity === 'medium').length,
      high: ticketList.filter(t => t.severity === 'high').length
    },
    byLab: ticketList.reduce((acc, ticket) => {
      acc[ticket.labId] = (acc[ticket.labId] || 0) + 1;
      return acc;
    }, {}),
    recentTickets: ticketList
      .filter(t => t.createdAt > Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10)
  };

  logAuditEntry(JSON.stringify({ action: 'tickets.stats.accessed', total: stats.total, timestamp: Date.now() }));
  return stats;
}

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
  addEvidence,
  addInvestigationStep,
  assignTicket,
  closeTicket,
  deleteTicket,
  searchTickets,
  getTicketStats,
  decryptField,
  encryptField,
  logAuditEntry
};