const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { sanitizeMetadata } = require('../utils/auditLogger');

/**
 * Builds reusable query filters for audit log retrieval and export.
 */
function buildAuditQuery(queryParams) {
  const { action, role, entityType, startDate, endDate, search } = queryParams;
  const query = {};

  // Filter by action
  if (action && action !== 'ALL') {
    query.action = action;
  }

  // Filter by actor role
  if (role && role !== 'ALL') {
    query.actorRole = role;
  }

  // Filter by entity type
  if (entityType && entityType !== 'ALL') {
    query.entityType = entityType;
  }

  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      if (endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
      query.createdAt.$lte = end;
    }
  }

  // Keyword search across action, entityType, actorRole, and entityId
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { action: { $regex: s, $options: 'i' } },
      { entityType: { $regex: s, $options: 'i' } },
      { actorRole: { $regex: s, $options: 'i' } },
      { entityId: { $regex: s, $options: 'i' } },
    ];
  }

  return query;
}

/**
 * Safely quotes and escapes values for standard CSV compliance.
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * GET /api/admin/audit-logs
 * Paginated administrative audit log search with multi-dimensional filtering.
 * Strict RBAC: Accessible only by Admin.
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const query = buildAuditQuery(req.query);

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actorId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/audit-logs/export
 * Admin exports filtered audit logs in CSV or JSON format.
 * Format: ?format=csv or ?format=json (default: csv)
 */
const exportAuditLogs = async (req, res, next) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const query = buildAuditQuery(req.query);

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="veyro-audit-logs-${timestamp}.json"`);
      const sanitizedLogs = logs.map((log) => ({
        ...log,
        metadata: sanitizeMetadata(log.metadata),
      }));
      return res.json(sanitizedLogs);
    }

    // CSV format
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="veyro-audit-logs-${timestamp}.csv"`);

    const headers = ['createdAt', 'actorId', 'actorRole', 'action', 'entityType', 'entityId', 'metadata'];
    const rows = [headers.join(',')];

    for (const log of logs) {
      const sanitizedMeta = sanitizeMetadata(log.metadata);
      const row = [
        escapeCsvCell(log.createdAt ? new Date(log.createdAt).toISOString() : ''),
        escapeCsvCell(log.actorId ? String(log.actorId) : ''),
        escapeCsvCell(log.actorRole || ''),
        escapeCsvCell(log.action || ''),
        escapeCsvCell(log.entityType || ''),
        escapeCsvCell(log.entityId || ''),
        escapeCsvCell(sanitizedMeta),
      ];
      rows.push(row.join(','));
    }

    return res.send(rows.join('\r\n'));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
  exportAuditLogs,
};
