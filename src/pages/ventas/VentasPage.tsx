import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useGetLocalQuery } from '../../services/api/localesApi';
import { VentaForm } from './components';

const VentasPage: React.FC = () => {
  const { localId } = useParams<{ localId: string }>();
  const numericLocalId = Number(localId);
  const [formKey, setFormKey] = useState(0);

  const { data: local, isLoading: isLoadingLocal } = useGetLocalQuery(numericLocalId, {
    skip: !localId || isNaN(numericLocalId),
  });

  if (isLoadingLocal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!local) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          No se pudo cargar el local
        </Typography>
      </Box>
    );
  }

  const handleSuccess = () => {
    setFormKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600, color: '#1976d2', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
          Punto de Venta - {local.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Registrar nueva venta
        </Typography>

        <VentaForm key={formKey} localId={numericLocalId} onClose={handleSuccess} />
      </Paper>
    </Box>
  );
};

export default VentasPage;
