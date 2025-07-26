import React from 'react';
import { Chip } from '@mui/material';

interface CustomerSegmentationProps {
  segment: 'VIP' | 'Inactive' | 'New' | string;
}

export default function CustomerSegmentation({ segment }: CustomerSegmentationProps) {
  let color: 'default' | 'error' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' = 'default';
  if (segment === 'VIP') color = 'success';
  if (segment === 'Inactive') color = 'warning';
  if (segment === 'New') color = 'info';
  return <Chip label={segment} color={color} />;
}
