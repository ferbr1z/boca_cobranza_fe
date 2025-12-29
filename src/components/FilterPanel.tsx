import React from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
} from "@mui/material";
import { AsyncSelectField } from "./AsyncSelectField";
import type { FilterConfig } from "../hooks/useFilters";
import type { AsyncSelectOption } from "./AsyncSelectField";

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onReset,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        {filters.map((filter) => {
          if (filter.type === "string" || filter.type === "number") {
            return (
              <TextField
                key={filter.name}
                label={filter.label}
                type={filter.type === "number" ? "number" : "text"}
                value={values[filter.name] || ""}
                onChange={(e) => onChange(filter.name, e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              />
            );
          }

          if (filter.type === "select" && filter.options) {
            return (
              <FormControl
                key={filter.name}
                size="small"
                sx={{ minWidth: 200 }}
              >
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
              <Box key={filter.name} sx={{ minWidth: 200 }}>
                <AsyncSelectField
                  label={filter.label}
                  value={values[filter.name] || null}
                  onChange={(option: AsyncSelectOption | null) =>
                    onChange(filter.name, option)
                  }
                  loadOptions={filter.loadOptions}
                  placeholder={
                    filter.placeholder ||
                    `Buscar ${filter.label.toLowerCase()}...`
                  }
                  isClearable={true}
                />
              </Box>
            );
          }

          return null;
        })}

        <Button variant="outlined" onClick={onReset}>
          Limpiar Filtros
        </Button>
      </Box>
    </Paper>
  );
};
