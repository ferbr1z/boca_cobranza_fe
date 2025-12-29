import React from "react";
import { Box, Button, IconButton, Typography, Paper } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { NumericInput } from "./NumericInput";

interface Comision {
  base: number;
  comision: number;
}

interface ComisionesManagerProps {
  comisiones: Comision[];
  onChange: (comisiones: Comision[]) => void;
  disabled?: boolean;
}

export const ComisionesManager: React.FC<ComisionesManagerProps> = ({
  comisiones,
  onChange,
  disabled = false,
}) => {
  const handleAddComision = () => {
    onChange([...comisiones, { base: 10000, comision: 0 }]);
  };

  const handleRemoveComision = (index: number) => {
    onChange(comisiones.filter((_, i) => i !== index));
  };

  const handleChangeBase = (index: number, value: number) => {
    const updated = [...comisiones];
    updated[index] = { ...updated[index], base: value };
    onChange(updated);
  };

  const handleChangeComision = (index: number, value: number) => {
    const updated = [...comisiones];
    updated[index] = { ...updated[index], comision: value };
    onChange(updated);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Comisiones
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddComision}
          disabled={disabled}
        >
          Agregar Comisión
        </Button>
      </Box>

      {comisiones.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", py: 2 }}
        >
          No hay comisiones definidas. Agregue al menos una.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {comisiones.map((comision, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                <Box sx={{ flex: 1 }}>
                  <NumericInput
                    label="Base (Gs.)"
                    value={comision.base}
                    onChange={(value) => handleChangeBase(index, value)}
                    allowDecimal={false}
                    fullWidth
                    disabled={disabled}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <NumericInput
                    label="Comisión (Gs.)"
                    value={comision.comision}
                    onChange={(value) => handleChangeComision(index, value)}
                    allowDecimal={false}
                    fullWidth
                    disabled={disabled}
                  />
                </Box>
                <Box>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveComision(index)}
                    disabled={disabled}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2 }}
      >
        * La base mínima debe ser 10,000 Gs.
      </Typography>
    </Box>
  );
};
