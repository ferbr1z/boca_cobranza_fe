import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import AdminHome from './AdminHome';
import UserHome from './UserHome';


const Home: React.FC = () => {
  const { isLoading, isAdmin, user } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAdmin) {
    return <AdminHome userName={user?.nombre} />;
  }

  return <UserHome userName={user?.nombre} localName={user?.localNombre} />;
};

export default Home;
