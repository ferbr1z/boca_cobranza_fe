import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useBodyStyleCleanup } from '../hooks/useBodyStyleCleanup';

interface FormDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number | string | { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number };
}

export const FormDrawer: React.FC<FormDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  width = 400,
}) => {
  useBodyStyleCleanup();

  return (
    <Drawer 
      anchor="right" 
      open={open} 
      onClose={onClose}
      disableScrollLock={true}
      keepMounted={false}
      ModalProps={{
        keepMounted: false,
        disableScrollLock: true,
      }}
    >
      <Box sx={{ 
        width, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: '100vw',
      }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Drawer>
  );
};
