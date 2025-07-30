import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

// Local fallback type for CustomerAuditLogEntry
export type CustomerAuditLogEntry = {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  customer: string;
  details: string;
};

interface CustomerAuditLogProps {
  logs: CustomerAuditLogEntry[];
}

export default function CustomerAuditLog({ logs }: CustomerAuditLogProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Timestamp</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Customer</TableCell>
          <TableCell>Details</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {logs.map(log => (
          <TableRow key={log.id}>
            <TableCell>{log.timestamp}</TableCell>
            <TableCell>{log.admin}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.customer}</TableCell>
            <TableCell>{log.details}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
