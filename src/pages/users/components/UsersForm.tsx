import React, { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ROLE_OPTIONS } from "../../../enum/roleEnum";
import { AsyncSelectField } from "../../../components/AsyncSelectField";
import type { AsyncSelectOption } from "../../../components/AsyncSelectField";
import { useLocalesSelect } from "../../../hooks/useLocalesSelect";
import { useLocalFilter } from "../../../contexts/LocalFilterContext";

const userCreateSchema = z.object({
  userName: z
    .string()
    .min(1, "El nombre de usuario es requerido")
    .max(100, "Máximo 100 caracteres"),
  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(20, "Máximo 20 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.number().int().min(1).max(2),
  localId: z.number().int().optional(),
  modifyStock: z.boolean(),
});

const userUpdateSchema = z.object({
  userName: z
    .string()
    .min(1, "El nombre de usuario es requerido")
    .max(100, "Máximo 100 caracteres"),
  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(20, "Máximo 20 caracteres"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  role: z.number().int().min(1).max(2),
  localId: z.number().int().optional(),
  modifyStock: z.boolean().optional(),
});

export type UsersFormData = z.infer<typeof userUpdateSchema>;

interface UsersFormProps {
  onSubmit: (data: UsersFormData) => void;
  defaultValues?: Partial<UsersFormData>;
  loading?: boolean;
  mode: "create" | "update";
}

export const UsersForm: React.FC<UsersFormProps> = ({
  onSubmit,
  defaultValues,
  loading = false,
  mode,
}) => {
  const schema = mode === "create" ? userCreateSchema : userUpdateSchema;
  const { selectedLocalId } = useLocalFilter();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UsersFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      userName: "",
      telefono: "",
      password: "",
      role: 2,
      localId: selectedLocalId || 0,
      modifyStock: false,
    },
  });

  const {
    defaultOptions,
    loadOptions,
    getOptionFromValue,
    isLoading: isLoadingLocales,
  } = useLocalesSelect({
    initialLocalId: selectedLocalId || defaultValues?.localId,
  });

  const roleValue = useWatch({ control, name: "role" });

  useEffect(() => {
    if (defaultValues) {
      reset({
        userName: defaultValues.userName || "",
        telefono: defaultValues.telefono || "",
        password: "",
        role: defaultValues.role ?? 2,
        localId: selectedLocalId || (defaultValues.localId ?? 0),
        modifyStock:
          defaultValues.modifyStock ??
          (defaultValues.role === 1 ? true : false),
      });
    }
  }, [defaultValues, reset, selectedLocalId]);

  const handleFormSubmit = (data: UsersFormData) => {
    const effectiveLocalId = selectedLocalId || data.localId;
    const normalized = {
      ...data,
      localId:
        effectiveLocalId && effectiveLocalId > 0 ? effectiveLocalId : undefined,
      modifyStock: data.role === 1 ? true : data.modifyStock,
    } as UsersFormData;
    if (mode === "update" && !data.password) {
      const dataWithoutPassword = { ...data };
      delete dataWithoutPassword.password;
      onSubmit({
        ...dataWithoutPassword,
        localId: normalized.localId,
        modifyStock: normalized.modifyStock,
      });
    } else {
      onSubmit(normalized);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Controller
        name="userName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nombre de Usuario"
            fullWidth
            error={!!errors.userName}
            helperText={errors.userName?.message}
            disabled={loading}
          />
        )}
      />

      <Controller
        name="telefono"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Teléfono"
            fullWidth
            error={!!errors.telefono}
            helperText={errors.telefono?.message}
            disabled={loading}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="password"
            label={
              mode === "create"
                ? "Contraseña"
                : "Contraseña (dejar vacío para no cambiar)"
            }
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
          />
        )}
      />

      {!selectedLocalId && (
        <Controller
          name="localId"
          control={control}
          render={({ field }) => {
            const selectedOption: AsyncSelectOption | null = getOptionFromValue(
              field.value
            );
            return (
              <AsyncSelectField
                label="Local"
                value={selectedOption}
                onChange={(option) =>
                  field.onChange(option ? Number(option.value) : 0)
                }
                loadOptions={loadOptions}
                defaultOptions={defaultOptions}
                placeholder="Buscar local..."
                isLoading={isLoadingLocales}
                isDisabled={loading}
                error={errors.localId?.message}
              />
            );
          }}
        />
      )}

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Rol"
            fullWidth
            error={!!errors.role}
            helperText={errors.role?.message}
            disabled={loading}
          >
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {roleValue === 2 && (
        <Controller
          name="modifyStock"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Modificar Stock"
            />
          )}
        />
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </Box>
  );
};
