import React from "react";
import { formatDateTime } from "../../../utils/dateFormat";
import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import type { UserDto } from "../../../types";
import { ROLE_OPTIONS } from "../../../enum/roleEnum";

interface UsersDetailsProps {
  user: UserDto | undefined;
  loading: boolean;
}

export const UsersDetails: React.FC<UsersDetailsProps> = ({
  user,
  loading,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Typography color="textSecondary" align="center" p={3}>
        No se encontró el usuario
      </Typography>
    );
  }

  const roleLabel =
    ROLE_OPTIONS.find((option) => option.value === user.role)?.label ??
    user.role;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          ID
        </Typography>
        <Typography variant="body1">{user.id}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Nombre de Usuario
        </Typography>
        <Typography variant="body1">{user.userName}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Teléfono
        </Typography>
        <Typography variant="body1">{user.telefono}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Rol
        </Typography>
        <Chip label={roleLabel} color="primary" variant="outlined" />
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Estado
        </Typography>
        <Typography variant="body1">
          {user.active ? "Activo" : "Inactivo"}
        </Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Fecha de Creación
        </Typography>
        <Typography variant="body1">{formatDateTime(user.createAt)}</Typography>
      </Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">
          Última Actualización
        </Typography>
        <Typography variant="body1">{formatDateTime(user.updateAt)}</Typography>
      </Box>
    </Box>
  );
};
