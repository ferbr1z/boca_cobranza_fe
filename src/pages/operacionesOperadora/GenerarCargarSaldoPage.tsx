import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { AccountBalance } from "@mui/icons-material";
import { OperacionForm } from "./components/OperacionForm";
import { useCargarSaldoMutation } from "../../services/api/operacionOperadoraApi";
import { notify } from "../../utils/notify";
import type { OperacionRequest } from "../../types";

const GenerarCargarSaldoPage: React.FC = () => {
  const [cargarSaldo, { isLoading }] = useCargarSaldoMutation();

  const handleSubmit = async (data: OperacionRequest) => {
    try {
      await cargarSaldo(data).unwrap();
      notify.success("Saldo cargado exitosamente");
      // Reset form or redirect as needed
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al cargar saldo");
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Operaciones de Operadora
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cargar saldo a operadora
        </Typography>
      </Paper>

      <OperacionForm
        title="Cargar Saldo"
        description="Agregar saldo a la cuenta de una operadora"
        icon={<AccountBalance />}
        operationType="cargar-saldo"
        onSubmit={handleSubmit}
        loading={isLoading}
        isEntrada={true}
      />
    </Box>
  );
};

export default GenerarCargarSaldoPage;
