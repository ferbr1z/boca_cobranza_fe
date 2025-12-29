import React, { useEffect, useState } from 'react';
import { Box, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const drawerWidth = 260;

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <Box display="flex">
      <Sidebar open={sidebarOpen} onToggle={handleToggleSidebar} />
      <Box
        component="main"
        flexGrow={1}
        p={3}
        sx={theme => ({
          ml: { xs: 0, md: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest
          })
        })}
      >
        {isMobile && (
          <IconButton
            onClick={handleToggleSidebar}
            sx={{ mb: 2 }}
            aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
