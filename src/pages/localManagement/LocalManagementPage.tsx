import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useGetLocalQuery } from '../../services/api/localesApi';
import { SesionLocalSection } from './sections';

const LocalManagementPage: React.FC = () => {
  const { localId } = useParams<{ localId: string }>();
  const numericLocalId = Number(localId);

  const { data: local, isLoading, error } = useGetLocalQuery(numericLocalId, {
    skip: !localId || isNaN(numericLocalId),
  });

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
        <Typography variant="h6" color="error">
          No se pudo cargar el local
        </Typography>
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

      <SesionLocalSection localId={numericLocalId} localNombre={local.nombre} />
    </Box>
  );
};

export default LocalManagementPage;
