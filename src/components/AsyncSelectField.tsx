import React from "react";
import AsyncSelect from "react-select/async";
import type { StylesConfig } from "react-select";
import { FormControl, FormLabel, FormHelperText } from "@mui/material";

export interface AsyncSelectOption {
  value: string | number;
  label: string;
  monto?: number;
}

export interface AsyncSelectFieldProps {
  label: string;
  value: AsyncSelectOption | null;
  onChange: (option: AsyncSelectOption | null) => void;
  loadOptions: (inputValue: string) => Promise<AsyncSelectOption[]>;
  defaultOptions?: boolean | AsyncSelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isMulti?: boolean;
  error?: string;
  required?: boolean;
  debounceTimeout?: number;
  isClearable?: boolean;
  clearLabel?: string;
  formatOptionLabel?: (
    option: AsyncSelectOption,
    context: any
  ) => React.ReactNode;
  isOptionDisabled?: (option: AsyncSelectOption) => boolean;
  autoFocus?: boolean;
  onInputChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

const controlStyles: StylesConfig<AsyncSelectOption, boolean> = {
  control: (base, state) => ({
    ...base,
    borderRadius: 8,
    borderColor: state.isFocused ? "#1976d2" : base.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px #1976d2" : base.boxShadow,
    "&:hover": {
      borderColor: "#1976d2",
    },
    minHeight: 56,
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#e3f2fd" : "white",
    color: "black",
    "&:active": {
      backgroundColor: "#bbdefb",
    },
  }),
};

export const AsyncSelectField: React.FC<AsyncSelectFieldProps> = ({
  label,
  value,
  onChange,
  loadOptions,
  defaultOptions = true,
  placeholder = "Buscar...",
  isDisabled = false,
  isLoading = false,
  isMulti = false,
  error,
  required = false,
  debounceTimeout = 500,
  isClearable = false,
  formatOptionLabel,
  isOptionDisabled,
  autoFocus = false,
  onInputChange,
  onKeyDown,
}) => {
  const timeoutRef = React.useRef<number | null>(null);

  const debouncedLoadOptions = React.useCallback(
    (input: string, callback: (options: AsyncSelectOption[]) => void) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          const options = await loadOptions(input);
          callback(options);
        } catch (error) {
          callback([]);
        }
      }, debounceTimeout);
    },
    [loadOptions, debounceTimeout]
  );

  return (
    <FormControl
      fullWidth
      error={!!error}
      disabled={isDisabled}
      required={required}
    >
      <FormLabel sx={{ mb: 1 }}>{label}</FormLabel>
      <AsyncSelect
        cacheOptions
        defaultOptions={defaultOptions}
        loadOptions={debouncedLoadOptions}
        value={value as any}
        onChange={(option) => {
          if (Array.isArray(option)) {
            onChange(option as any);
          } else {
            onChange(option as AsyncSelectOption | null);
          }
        }}
        onInputChange={(newValue, actionMeta) => {
          if (actionMeta.action === "input-change" && onInputChange) {
            onInputChange(newValue);
          }
        }}
        onKeyDown={onKeyDown}
        isMulti={isMulti}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        formatOptionLabel={formatOptionLabel}
        isOptionDisabled={isOptionDisabled}
        styles={controlStyles as StylesConfig<AsyncSelectOption, boolean>}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        menuPlacement="auto"
        autoFocus={autoFocus}
        noOptionsMessage={({ inputValue }) =>
          inputValue ? "No se encontraron resultados" : "Escribe para buscar"
        }
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};
