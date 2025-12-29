import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { MoneyOff } from "@mui/icons-material";
import { OperacionForm } from "./components/OperacionForm";
import { useRetirarBilleteraMutation } from "../../services/api/operacionOperadoraApi";
import { notify } from "../../utils/notify";
import type { OperacionRequest } from "../../types";

const GenerarRetirarBilleteraPage: React.FC = () => {
  const [retirarBilletera, { isLoading }] = useRetirarBilleteraMutation();

  const handleSubmit = async (data: OperacionRequest) => {
    try {
      await retirarBilletera(data).unwrap();
      notify.success("Retiro de billetera realizado exitosamente");
      // Reset form or redirect as needed
    } catch (err: any) {
      notify.error(
        err?.data?.message || "Error al realizar retiro de billetera"
      );
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Operaciones de Operadora
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Retirar fondos desde billetera de operadora
        </Typography>
      </Paper>

      <OperacionForm
        title="Retirar de Billetera"
        description="Retirar fondos desde la billetera de la operadora"
        icon={<MoneyOff />}
        operationType="retirar-billetera"
        onSubmit={handleSubmit}
        loading={isLoading}
        isEntrada={false}
      />
    </Box>
  );
};

export default GenerarRetirarBilleteraPage;
