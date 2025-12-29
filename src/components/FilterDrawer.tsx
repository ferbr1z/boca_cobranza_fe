import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { FilterConfig } from "../hooks/useFilters";
import { useBodyStyleCleanup } from "../hooks/useBodyStyleCleanup";
import { AsyncSelectField } from "./AsyncSelectField";
import type { AsyncSelectOption } from "./AsyncSelectField";
import { DateInput } from "./DateInput";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onReset: () => void;
  onApply: () => void;
  validateFilters?: (values: Record<string, any>) => boolean;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  filters,
  values,
  onChange,
  onReset,
  onApply,
  validateFilters,
}) => {
  useBodyStyleCleanup();
  const [validationError, setValidationError] = useState<string>("");

  const handleApply = () => {
    if (validateFilters && !validateFilters(values)) {
      setValidationError(
        "Por favor, complete correctamente los filtros. Las fechas deben estar completas y la fecha 'Desde' no puede ser posterior a la fecha 'Hasta'."
      );
      return;
    }
    setValidationError("");
    onApply();
    onClose();
  };

  const handleReset = () => {
    setValidationError("");
    onReset();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      disableScrollLock={true}
      keepMounted={false}
      ModalProps={{
        keepMounted: false,
        disableScrollLock: true,
      }}
    >
      <Box
        sx={{
          width: 350,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {validationError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {validationError}
            </Alert>
          )}

          {filters.map((filter) => {
            if (filter.type === "string" || filter.type === "number") {
              return (
                <TextField
                  key={filter.name}
                  label={filter.label}
                  type={filter.type === "number" ? "number" : "text"}
                  value={values[filter.name] || ""}
                  onChange={(e) => onChange(filter.name, e.target.value)}
                  fullWidth
                />
              );
            }

            if (filter.type === "select" && filter.options) {
              return (
                <FormControl key={filter.name} fullWidth>
                  <InputLabel>{filter.label}</InputLabel>
                  <Select
                    value={values[filter.name] || ""}
                    onChange={(e) => onChange(filter.name, e.target.value)}
                    label={filter.label}
                  >
                    {filter.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            if (filter.type === "async-select" && filter.loadOptions) {
              return (
                <AsyncSelectField
                  key={filter.name}
                  label={filter.label}
                  value={values[filter.name] || null}
                  onChange={(option: AsyncSelectOption | null) =>
                    onChange(filter.name, option)
                  }
                  loadOptions={filter.loadOptions}
                  placeholder={filter.placeholder || "Buscar..."}
                />
              );
            }

            if (filter.type === "date") {
              return (
                <DateInput
                  key={filter.name}
                  label={filter.label}
                  value={values[filter.name] || ""}
                  onChange={(value) => onChange(filter.name, value)}
                  fullWidth
                />
              );
            }

            if (filter.type === "date-range") {
              return (
                <Box
                  key={filter.name}
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {filter.label}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <DateInput
                      label="Desde"
                      value={values[filter.name]?.desde || ""}
                      onChange={(value) =>
                        onChange(filter.name, {
                          ...values[filter.name],
                          desde: value,
                        })
                      }
                      fullWidth
                    />
                    <DateInput
                      label="Hasta"
                      value={values[filter.name]?.hasta || ""}
                      onChange={(value) =>
                        onChange(filter.name, {
                          ...values[filter.name],
                          hasta: value,
                        })
                      }
                      fullWidth
                    />
                  </Box>
                </Box>
              );
            }

            return null;
          })}
        </Box>

        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={handleReset} fullWidth>
            Limpiar
          </Button>
          <Button variant="contained" onClick={handleApply} fullWidth>
            Aplicar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};
