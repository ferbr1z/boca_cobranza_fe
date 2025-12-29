import React from "react";
import { formatDateTime } from "../../../utils/dateFormat";
import {
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import type { PosDto } from "../../../types";
import { formatCurrency } from "../../../utils/format";

interface PosDetailsProps {
  pos?: PosDto;
  loading?: boolean;
}

export const PosDetails: React.FC<PosDetailsProps> = ({ pos, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!pos) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No se encontró el POS</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Nombre
        </Typography>
        <Typography variant="body1">{pos.nombre}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Monto (Gs.)
        </Typography>
        <Typography variant="body1">{formatCurrency(pos.monto)}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Local
        </Typography>
        <Typography variant="body1">{pos.localNombre || "N/A"}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Estado
        </Typography>
        {pos.active ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Activo"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<CancelIcon />}
            label="Inactivo"
            color="default"
            size="small"
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Fecha de Creación
        </Typography>
        <Typography variant="body1">{formatDateTime(pos.createAt)}</Typography>
      </Box>
    </Box>
  );
};
