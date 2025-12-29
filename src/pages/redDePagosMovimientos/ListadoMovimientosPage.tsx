import React, { useState, useMemo, useEffect } from "react";
import { Box, Button, Typography, MenuItem, TextField } from "@mui/material";
import {
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig, ActionMenuItem } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { FormDrawer } from "../../components/FormDrawer";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import {
  useGetAllRedDePagosMovQuery,
  useGetRedDePagosMovByIdQuery,
  useGetInformeDelMesQuery,
} from "../../services/api/redDePagosMovApi";
import { useLazyGetAllLocalesQuery } from "../../services/api/localesApi";
import type { RedDePagosMovDto } from "../../types";
import { formatCurrency } from "../../utils/format";
import { formatDateTime } from "../../utils/dateFormat";
import { createLocalLoader } from "../../utils/filterHelpers";
import { useLocalFilter } from "../../contexts/LocalFilterContext";

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const ListadoMovimientosPage: React.FC = () => {
  const { modalState, openModal, closeModal } = useOpenModal();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { selectedLocalId } = useLocalFilter();

  const currentDate = new Date();
  const [mes, setMes] = useState(currentDate.getMonth() + 1);
  const [año, setAño] = useState(currentDate.getFullYear());
  const [debouncedMes, setDebouncedMes] = useState(mes);
  const [debouncedAño, setDebouncedAño] = useState(año);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMes(mes);
    }, 500);
    return () => clearTimeout(timer);
  }, [mes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAño(año);
    }, 500);
    return () => clearTimeout(timer);
  }, [año]);

  const [lazyGetAllLocales] = useLazyGetAllLocalesQuery();

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [];

    if (!selectedLocalId) {
      configs.push({
        name: "localId",
        label: "Local",
        type: "async-select",
        initialValue: null,
        loadOptions: createLocalLoader(lazyGetAllLocales),
        placeholder: "Buscar local...",
      });
    }

    return configs;
  }, [lazyGetAllLocales, selectedLocalId]);

  const {
    filterValues,
    appliedFilters,
    page,
    pageSize,
    handleFilterChange,
    applyFilters,
    validateFilters,
    handlePageChange,
    resetFilters,
  } = useFilters({
    filters: filterConfigs,
    initialPage: 1,
    initialPageSize: 10,
  });

  const queryParams = useMemo(
    () => ({
      localId: selectedLocalId || appliedFilters.localId?.value || undefined,
      mes: debouncedMes,
      año: debouncedAño,
    }),
    [selectedLocalId, appliedFilters.localId, debouncedMes, debouncedAño]
  );

  const { data, isLoading, error } = useGetAllRedDePagosMovQuery({
    page,
    query: queryParams,
  });

  const { data: informeData } = useGetInformeDelMesQuery(queryParams);

  const paginatedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.slice(0, pageSize);
  }, [data, pageSize]);

  const { data: selectedMovimiento } = useGetRedDePagosMovByIdQuery(
    (modalState.id as number) || 0,
    {
      skip: modalState.type !== "details" || !modalState.id,
    }
  );

  const columns: ColumnConfig<RedDePagosMovDto>[] = [
    {
      key: "createAt",
      header: "Fecha/Hora",
      render: (row) => formatDateTime(row.createAt),
    },
    {
      key: "cajaNombre",
      header: "Caja",
    },
    {
      key: "monto",
      header: "Monto Total",
      render: (row) => formatCurrency(row.monto),
      align: "right",
    },
  ];

  const actions: ActionMenuItem<RedDePagosMovDto>[] = [
    {
      label: "Ver Detalles",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => openModal("details", row.id),
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error al cargar los datos</Typography>
      </Box>
    );
  }

  const mesNombre = MESES.find((m) => m.value === mes)?.label || "";

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Listado de Movimientos - Red de Pagos
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {filterConfigs.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              size="small"
            >
              Filtros
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          select
          label="Mes"
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {MESES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Año"
          type="number"
          value={año}
          onChange={(e) => setAño(Number(e.target.value))}
          size="small"
          sx={{ width: 120 }}
          inputProps={{ min: 2000, max: 2100 }}
        />
      </Box>

      {informeData && (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 1.5,
            mb: 3,
            borderRadius: 1,
            backgroundColor: "white",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Total del Mes:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatCurrency(informeData.total)} Gs.
          </Typography>
        </Box>
      )}

      <DataTable
        columns={columns}
        rows={paginatedData}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        total={data?.totalRecords || 0}
        onPageChange={handlePageChange}
        actions={actions}
      />

      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filterConfigs}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
        validateFilters={validateFilters}
      />

      <FormDrawer
        open={modalState.type === "details"}
        onClose={closeModal}
        title="Detalles del Movimiento"
      >
        {selectedMovimiento && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Fecha/Hora
              </Typography>
              <Typography variant="body1">
                {formatDateTime(selectedMovimiento.createAt)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Caja
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedMovimiento.cajaNombre}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Monto Total
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={600}>
                {formatCurrency(selectedMovimiento.monto)} Gs.
              </Typography>
            </Box>
            {selectedMovimiento.descripcion && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Descripción
                </Typography>
                <Typography variant="body1">
                  {selectedMovimiento.descripcion}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </FormDrawer>
    </Box>
  );
};

export default ListadoMovimientosPage;
