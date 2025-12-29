import React from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import type { CuentaBancariaDto } from "../../../types";
import { formatCurrency } from "../../../utils/format";
import { formatDateTime } from "../../../utils/dateFormat";

interface CuentaBancariaDetailsProps {
  cuentaBancaria?: CuentaBancariaDto;
  loading?: boolean;
}

export const CuentaBancariaDetails: React.FC<CuentaBancariaDetailsProps> = ({
  cuentaBancaria,
  loading,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cuentaBancaria) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No se encontró la cuenta bancaria</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Nombre
        </Typography>
        <Typography variant="body1">{cuentaBancaria.nombre}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Monto (Gs.)
        </Typography>
        <Typography variant="body1">
          {formatCurrency(cuentaBancaria.monto)}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Comisión
        </Typography>
        <Typography variant="body1">{cuentaBancaria.comision}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Local
        </Typography>
        <Typography variant="body1">
          {cuentaBancaria.localNombre || "N/A"}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Estado
        </Typography>
        {cuentaBancaria.active ? (
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
          Red de Pago
        </Typography>
        {cuentaBancaria.redDePagos ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Sí"
            color="primary"
            size="small"
          />
        ) : (
          <Chip icon={<CancelIcon />} label="No" color="default" size="small" />
        )}
      </Box>

      {cuentaBancaria.redDePagos &&
        cuentaBancaria.comisionCuentaBancarias &&
        cuentaBancaria.comisionCuentaBancarias.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Comisiones
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {cuentaBancaria.comisionCuentaBancarias
                  .sort((a, b) => a.base - b.base)
                  .map((comision, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2">
                          Base: {formatCurrency(comision.base)} Gs.
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          Comisión: {formatCurrency(comision.comision)} Gs.
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
              </Box>
            </Box>
          </>
        )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Fecha de Creación
        </Typography>
        <Typography variant="body1">
          {formatDateTime(cuentaBancaria.createAt)}
        </Typography>
      </Box>
    </Box>
  );
};
