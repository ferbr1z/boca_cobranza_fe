import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { Send } from "@mui/icons-material";
import { OperacionForm } from "./components/OperacionForm";
import { useGiroBilleteraMutation } from "../../services/api/operacionOperadoraApi";
import { notify } from "../../utils/notify";
import type { OperacionRequest } from "../../types";

const GenerarGiroBilleteraPage: React.FC = () => {
  const [giroBilletera, { isLoading }] = useGiroBilleteraMutation();

  const handleSubmit = async (data: OperacionRequest) => {
    try {
      await giroBilletera(data).unwrap();
      notify.success("Giro a billetera realizado exitosamente");
      // Reset form or redirect as needed
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al realizar giro a billetera");
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Operaciones de Operadora
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Realizar giro desde operadora hacia billetera
        </Typography>
      </Paper>

      <OperacionForm
        title="Giro a Billetera"
        description="Transferir fondos desde la operadora hacia una billetera"
        icon={<Send />}
        operationType="giro-billetera"
        onSubmit={handleSubmit}
        loading={isLoading}
        isEntrada={false}
      />
    </Box>
  );
};

export default GenerarGiroBilleteraPage;
