import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, IconButton, Button } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useGetAllMovimientosQuery } from "../../services/api/movimientoApi";
import type { MovimientoDto } from "../../types";
import { formatCurrency } from "../../utils/format";
import { formatDateTime } from "../../utils/dateFormat";
import { TIPO_MOVIMIENTO_LABELS } from "../../enum/tipoMovimientoEnum";
import { getFuenteDeFondoNombre } from "../../utils/movimientoHelpers";

const SesionLocalMovimientosPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        name: "tipoMovimiento",
        label: "Tipo de Movimiento",
        type: "select",
        initialValue: "",
        options: [
          { value: "", label: "Todos" },
          { value: "1", label: "Pago Efectivo" },
          { value: "2", label: "Pago Transferencia" },
          { value: "3", label: "Pago POS" },
          { value: "4", label: "Transferencia" },
          { value: "5", label: "Operación Operadora" },
          { value: "6", label: "Red de Pago" },
        ],
      },
      {
        name: "fechaRango",
        label: "Rango de Fechas",
        type: "date-range",
        initialValue: { desde: "", hasta: "" },
      },
    ],
    []
  );

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

  const { data, isLoading, error } = useGetAllMovimientosQuery({
    page,
    query: {
      sesionLocalId: Number(id),
      tipoMovimiento: appliedFilters.tipoMovimiento
        ? Number(appliedFilters.tipoMovimiento)
        : undefined,
      fechaInicio: appliedFilters.fechaRango?.desde || undefined,
      fechaFin: appliedFilters.fechaRango?.hasta || undefined,
      orderBy: "CreateAt",
      asc: false,
    },
  });

  const columns: ColumnConfig<MovimientoDto>[] = [
    {
      key: "createAt",
      header: "Fecha",
      render: (row) => formatDateTime(row.createAt),
    },
    {
      key: "tipoMovimiento",
      header: "Tipo",
      render: (row) =>
        TIPO_MOVIMIENTO_LABELS[row.tipoMovimiento] || "Desconocido",
    },
    {
      key: "fuenteDeFondo",
      header: "Fuente de Fondo",
      render: (row) => getFuenteDeFondoNombre(row),
    },
    {
      key: "isEntrada",
      header: "Dirección",
      render: (row) => (row.isEntrada ? "Entrada" : "Salida"),
      align: "center",
    },
    {
      key: "monto",
      header: "Monto (Gs.)",
      render: (row) => formatCurrency(row.monto),
      align: "right",
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (row) => row.descripcion || "-",
    },
  ];

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => navigate(`/sesion-local/${id}`)}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              Historial de Movimientos
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDrawerOpen(true)}
            size="small"
          >
            Filtros
          </Button>
        </Box>
      </Paper>

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

      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        error={error}
        page={page}
        pageSize={pageSize}
        total={data?.totalRecords || 0}
        onPageChange={handlePageChange}
      />
    </Box>
  );
};

export default SesionLocalMovimientosPage;
