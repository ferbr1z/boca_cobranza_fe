import React from "react";
import { formatDateTime } from "../../../utils/dateFormat";
import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import type { SistemaExternoDto } from "../../../types";
import { CONTEO_OPTIONS } from "../../../enum/conteoEnum";
import { formatCurrency } from "../../../utils/format";

interface SistemaExternoDetailsProps {
  sistema: SistemaExternoDto | undefined;
  loading: boolean;
}

export const SistemaExternoDetails: React.FC<SistemaExternoDetailsProps> = ({
  sistema,
  loading,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sistema) {
    return (
      <Typography color="textSecondary" align="center" p={3}>
        No se encontró el sistema externo
      </Typography>
    );
  }

  const conteoLabel =
    CONTEO_OPTIONS.find((option) => option.value === sistema.conteo)?.label ??
    sistema.conteo;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          ID
        </Typography>
        <Typography variant="body1">{sistema.id}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Nombre
        </Typography>
        <Typography variant="body1">{sistema.nombre}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Monto por Operación
        </Typography>
        <Typography variant="body1">
          {formatCurrency(sistema.montoPorOperacion)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Conteo
        </Typography>
        <Chip label={conteoLabel} color="primary" variant="outlined" />
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Local ID
        </Typography>
        <Typography variant="body1">{sistema.localId}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Estado
        </Typography>
        <Typography variant="body1">
          {sistema.active ? "Activo" : "Inactivo"}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Fecha de Creación
        </Typography>
        <Typography variant="body1">
          {formatDateTime(sistema.createAt)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Última Actualización
        </Typography>
        <Typography variant="body1">
          {formatDateTime(sistema.updateAt)}
        </Typography>
      </Box>
    </Box>
  );
};
