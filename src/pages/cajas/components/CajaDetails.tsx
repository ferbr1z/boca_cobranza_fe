import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import type { CajaDto } from "../../../types";
import { formatCurrency } from "../../../utils/format";
import { formatDateTime } from "../../../utils/dateFormat";

interface CajaDetailsProps {
  caja: CajaDto | undefined;
  loading: boolean;
}

export const CajaDetails: React.FC<CajaDetailsProps> = ({ caja, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!caja) {
    return (
      <Typography color="textSecondary" align="center" p={3}>
        No se encontró la caja
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          ID
        </Typography>
        <Typography variant="body1">{caja.id}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Nombre
        </Typography>
        <Typography variant="body1">{caja.nombre}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Monto
        </Typography>
        <Typography variant="body1">{formatCurrency(caja.monto)}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Local ID
        </Typography>
        <Typography variant="body1">{caja.localId}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Estado
        </Typography>
        <Typography variant="body1">
          {caja.active ? "Activo" : "Inactivo"}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Fecha de Creación
        </Typography>
        <Typography variant="body1">{formatDateTime(caja.createAt)}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Última Actualización
        </Typography>
        <Typography variant="body1">{formatDateTime(caja.updateAt)}</Typography>
      </Box>
    </Box>
  );
};
