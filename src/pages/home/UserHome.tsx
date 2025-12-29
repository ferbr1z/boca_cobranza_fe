import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useGetProfileQuery } from '../../services/api/authApi';
import { useGetLocalQuery } from '../../services/api/localesApi';
import { SesionLocalSection } from '../localManagement/sections';

interface UserHomeProps {
  userName?: string;
  localName?: string | null;
}

const UserHome: React.FC<UserHomeProps> = ({ userName }) => {
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useGetProfileQuery();
  
  const localId = profile?.localId ? Number(profile.localId) : undefined;
  
  const { data: local, isLoading: isLoadingLocal, error: localError } = useGetLocalQuery(localId || 0, {
    skip: !localId,
  });

  if (isLoadingProfile || isLoadingLocal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (profileError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se pudo cargar el perfil del usuario</Alert>
      </Box>
    );
  }

  if (!localId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2' }}>
            {userName ? `Hola ${userName}` : 'Hola'}
          </Typography>
        </Box>
        <Alert severity="warning">No tienes un local asignado. Contacta al administrador.</Alert>
      </Box>
    );
  }

  if (localError || !local) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No se pudo cargar la información del local</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1976d2' }}>
          {local.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestión del Local
        </Typography>
      </Paper>

      <SesionLocalSection localId={localId}  localNombre={local.nombre}/>

    </Box>
  );
};

export default UserHome;
