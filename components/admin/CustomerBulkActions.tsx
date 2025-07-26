import React from 'react';
// NOTE: Install @mui/material and @mui/icons-material for these imports to work
import { Button } from '@mui/material';

// Local fallback type for Customer
export type Customer = { name: string; email: string; role: string; status: string; segment?: string; };

interface CustomerBulkActionsProps {
  selectedCustomers: Customer[];
  onBulkDelete: (customers: Customer[]) => void;
  onBulkEdit: (customers: Customer[]) => void;
}

export default function CustomerBulkActions({ selectedCustomers, onBulkDelete, onBulkEdit }: CustomerBulkActionsProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button disabled={selectedCustomers.length === 0} onClick={() => onBulkEdit(selectedCustomers)}>
        Bulk Edit
      </Button>
      <Button disabled={selectedCustomers.length === 0} color="error" onClick={() => onBulkDelete(selectedCustomers)}>
        Bulk Delete
      </Button>
    </div>
  );
}
