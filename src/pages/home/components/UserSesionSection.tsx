import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { FormDrawer } from "../../../components/FormDrawer";
import {
  useGetActiveSesionByCurrentUserQuery,
  useOpenSesionLocalMutation,
  useCloseSesionLocalMutation,
} from "../../../services/api/sesionLocalApi";
import type { SesionLocalRequest } from "../../../types";
import { notify } from "../../../utils/notify";
import { formatDateTime } from "../../../utils/dateFormat";
import { SesionLocalForm } from "../../localManagement/components";
import { useSesionValidation } from "../../../hooks/useSesionValidation";

interface UserSesionSectionProps {
  localId: number;
  localNombre: string;
}

export const UserSesionSection: React.FC<UserSesionSectionProps> = ({
  localId,
  localNombre,
}) => {
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [closeDrawer, setCloseDrawer] = useState(false);
  const { puedeRealizarVentas } = useSesionValidation(localId);

  const { data: sesionActiva, isLoading } =
    useGetActiveSesionByCurrentUserQuery();
  const [openSesion, { isLoading: isOpening }] = useOpenSesionLocalMutation();
  const [closeSesion, { isLoading: isClosing }] = useCloseSesionLocalMutation();

  const handleOpenSesion = async (formData: SesionLocalRequest) => {
    try {
      await openSesion({ localId, body: formData }).unwrap();
      notify.success("Sesión abierta exitosamente");
      setOpenDrawer(false);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al abrir la sesión");
    }
  };

  const handleCloseSesion = async (formData: SesionLocalRequest) => {
    try {
      await closeSesion({ localId, body: formData }).unwrap();
      notify.success("Sesión cerrada exitosamente");
      setCloseDrawer(false);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al cerrar la sesión");
    }
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Cargando...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Sesión del Local</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {!sesionActiva && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDrawer(true)}
              size="small"
            >
              Abrir Sesión
            </Button>
          )}
          {sesionActiva && (
            <>
              <Button
                variant="contained"
                color="error"
                startIcon={<LockIcon />}
                onClick={() => setCloseDrawer(true)}
                size="small"
              >
                Cerrar Sesión
              </Button>
              {puedeRealizarVentas && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ShoppingCartIcon className="cart-icon" />}
                  endIcon={<ArrowForwardIcon className="arrow-icon" />}
                  onClick={() => navigate(`/local/${localId}/ventas`)}
                  size="small"
                  sx={{
                    "& .cart-icon": {
                      transition: "transform 0.3s ease",
                    },
                    "& .arrow-icon": {
                      transition: "transform 0.2s ease",
                    },
                    "&:hover .cart-icon": {
                      transform: "rotate(-15deg)",
                    },
                    "&:hover .arrow-icon": {
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  Ir a Ventas
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>

      {sesionActiva ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            Tienes una sesión abierta para este local
          </Alert>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <LockOpenIcon color="success" fontSize="large" />
                <Box>
                  <Typography variant="h6">Sesión Activa</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Abierta el {formatDateTime(sesionActiva.createAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No tienes una sesión abierta. Abre una sesión para comenzar a
          trabajar.
        </Alert>
      )}

      <FormDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title={`Abrir Sesión - ${localNombre}`}
      >
        <SesionLocalForm
          onSubmit={handleOpenSesion}
          loading={isOpening}
          localId={localId}
          mode="open"
        />
      </FormDrawer>

      <FormDrawer
        open={closeDrawer}
        onClose={() => setCloseDrawer(false)}
        title={`Cerrar Sesión - ${localNombre}`}
      >
        <SesionLocalForm
          onSubmit={handleCloseSesion}
          loading={isClosing}
          localId={localId}
          mode="close"
        />
      </FormDrawer>
    </Paper>
  );
};
