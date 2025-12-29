import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import type { TextFieldProps } from "@mui/material";

dayjs.locale("es");

type DateInputProps = Omit<TextFieldProps, "type" | "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
};

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label,
  ...props
}) => {
  const dayjsValue = value ? dayjs(value) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <DatePicker
        label={label}
        value={dayjsValue}
        onChange={(newValue) => {
          if (newValue) {
            onChange(newValue.format("YYYY-MM-DD"));
          } else {
            onChange("");
          }
        }}
        format="DD/MM/YYYY"
        slotProps={{
          textField: {
            ...props,
            fullWidth: props.fullWidth,
          },
        }}
      />
    </LocalizationProvider>
  );
};
