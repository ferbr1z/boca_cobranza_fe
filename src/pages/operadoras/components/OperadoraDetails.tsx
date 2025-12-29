import React from "react";
import { formatDateTime } from "../../../utils/dateFormat";
import { Box, Typography, CircularProgress } from "@mui/material";
import type { OperadoraDto } from "../../../types";

interface OperadoraDetailsProps {
  operadora: OperadoraDto | undefined;
  loading: boolean;
}

export const OperadoraDetails: React.FC<OperadoraDetailsProps> = ({
  operadora,
  loading,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!operadora) {
    return (
      <Typography color="textSecondary" align="center" p={3}>
        No se encontró la operadora
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          ID
        </Typography>
        <Typography variant="body1">{operadora.id}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Nombre
        </Typography>
        <Typography variant="body1">{operadora.nombre}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Número de Teléfono
        </Typography>
        <Typography variant="body1">{operadora.numeroTelefono}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Local ID
        </Typography>
        <Typography variant="body1">{operadora.localId}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Fecha de Creación
        </Typography>
        <Typography variant="body1">
          {formatDateTime(operadora.createAt)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Última Actualización
        </Typography>
        <Typography variant="body1">
          {formatDateTime(operadora.updateAt)}
        </Typography>
      </Box>
    </Box>
  );
};
