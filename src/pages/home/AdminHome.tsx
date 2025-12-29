import React from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useLocalFilter } from '../../contexts/LocalFilterContext';
import { useGetLocalQuery } from '../../services/api/localesApi';
import {
  SesionLocalSection
} from '../localManagement/sections';

interface AdminHomeProps {
  userName?: string;
}

const AdminHome: React.FC<AdminHomeProps> = ({ userName }) => {
  const { selectedLocalId } = useLocalFilter();

  const { data: local, isLoading, error } = useGetLocalQuery(selectedLocalId || 0, {
    skip: !selectedLocalId,
  });

  if (!selectedLocalId) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 500, color: '#1976d2' }}>
            {userName ? `Hola, ${userName}` : 'Bienvenido'}
          </Typography>
          <Typography variant="h6" sx={{ color: '#666' }}>
            Panel de Administración
          </Typography>
        </Box>
        <Alert severity="info">
          Por favor, selecciona un local del menú para administrar las sesiones
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !local) {
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

      <SesionLocalSection localId={selectedLocalId} localNombre={local.nombre} />
    </Box>
  );
};

export default AdminHome;
