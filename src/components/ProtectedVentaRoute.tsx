import React from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
} from "@mui/material";
import { useSesionValidation } from "../hooks/useSesionValidation";

interface ProtectedVentaRouteProps {
  children: React.ReactNode;
}

const ProtectedVentaRoute: React.FC<ProtectedVentaRouteProps> = ({
  children,
}) => {
  const { puedeRealizarVentas, sesionAbiertaPorOtroUsuario, isLoading } =
    useSesionValidation();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!puedeRealizarVentas) {
    if (sesionAbiertaPorOtroUsuario) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => window.history.back()}
              >
                Volver
              </Button>
            }
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Acceso denegado a ventas
            </Typography>
            <Typography>
              Hay una sesión abierta por el usuario{" "}
              <strong>{sesionAbiertaPorOtroUsuario.userName}</strong> en el
              local <strong>{sesionAbiertaPorOtroUsuario.localNombre}</strong>.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Como administrador, no puedes realizar ventas mientras otro
              usuario tenga una sesión activa.
            </Typography>
          </Alert>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.history.back()}
            >
              Volver
            </Button>
          }
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Sesión requerida
          </Typography>
          <Typography>
            Debes tener una sesión activa para realizar ventas.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedVentaRoute;
