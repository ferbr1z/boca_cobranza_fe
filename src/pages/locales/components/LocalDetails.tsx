import React from "react";
import { formatDateTime } from "../../../utils/dateFormat";
import { Box, Typography, CircularProgress } from "@mui/material";
import type { LocalDto } from "../../../types";

interface LocalDetailsProps {
  local: LocalDto | undefined;
  loading: boolean;
}

export const LocalDetails: React.FC<LocalDetailsProps> = ({
  local,
  loading,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!local) {
    return (
      <Typography color="textSecondary" align="center" p={3}>
        No se encontró el local
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          ID
        </Typography>
        <Typography variant="body1">{local.id}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Nombre
        </Typography>
        <Typography variant="body1">{local.nombre}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Estado
        </Typography>
        <Typography variant="body1">
          {local.active ? "Activo" : "Inactivo"}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Fecha de Creación
        </Typography>
        <Typography variant="body1">
          {formatDateTime(local.createAt)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Última Actualización
        </Typography>
        <Typography variant="body1">
          {formatDateTime(local.updateAt)}
        </Typography>
      </Box>
    </Box>
  );
};
