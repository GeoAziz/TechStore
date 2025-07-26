export type CustomerAuditLogEntry = { id: string; timestamp: string; admin: string; action: string; customer: string; details: string; };

const auditLogs: CustomerAuditLogEntry[] = [];

export function logCustomerAction(entry: CustomerAuditLogEntry) {
  auditLogs.push(entry);
}

export function getCustomerAuditLogs() {
  return auditLogs;
}
