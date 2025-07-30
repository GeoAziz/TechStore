import React, { useState } from 'react';
// NOTE: Install @mui/material for these imports to work
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

interface CustomerNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

export default function CustomerNotificationDialog({ open, onClose, onSend }: CustomerNotificationDialogProps) {
  const [message, setMessage] = useState('');
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Send Notification</DialogTitle>
      <DialogContent>
        <TextField
          label="Message"
          multiline
          rows={4}
          fullWidth
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onSend(message); setMessage(''); }} disabled={!message}>Send</Button>
      </DialogActions>
    </Dialog>
  );
}
