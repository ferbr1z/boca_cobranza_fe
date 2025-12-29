import React, { useMemo, useState } from "react";
import { Box, Paper, Typography, Button, Chip, Alert } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  SwapHoriz as SwapHorizIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useGetAllTransferenciasQuery } from "../../services/api/transferenciaApi";
import { useLocalFilter } from "../../contexts/LocalFilterContext";
import { formatCurrency } from "../../utils/format";
import { formatDateTime } from "../../utils/dateFormat";
import type { TransferenciaDto } from "../../types";

const TransferenciasListadoPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocalId } = useLocalFilter();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [];

    configs.push(
      {
        name: "numeroTransaccion",
        label: "N° Transacción",
        type: "string",
        initialValue: "",
      },
      {
        name: "isEntrada",
        label: "Tipo",
        type: "select",
        initialValue: "",
        options: [
          { value: "", label: "Todos" },
          { value: "true", label: "Entrada" },
          { value: "false", label: "Salida" },
        ],
      }
    );

    return configs;
  }, []);

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

  const { data, isLoading, error } = useGetAllTransferenciasQuery({
    page,
    query: {
      localId: selectedLocalId || undefined,
      numeroTransaccion: appliedFilters.numeroTransaccion || undefined,
      isEntrada: appliedFilters.isEntrada
        ? appliedFilters.isEntrada === "true"
        : undefined,
      orderBy: "createAt",
      asc: false,
    },
  });

  const columns: ColumnConfig<TransferenciaDto>[] = [
    {
      key: "createAt",
      header: "Fecha",
      render: (row) => formatDateTime(row.createAt),
    },
    {
      key: "numeroTransaccion",
      header: "N° Transacción",
    },
    {
      key: "cuentaBancariaNombre",
      header: "Cuenta Bancaria",
    },
    {
      key: "cajaNombre",
      header: "Caja",
    },
    {
      key: "monto",
      header: "Monto",
      render: (row) => `${formatCurrency(row.monto)} Gs.`,
    },
    {
      key: "cobroComision",
      header: "Comisión",
      render: (row) => `${formatCurrency(row.cobroComision)} Gs.`,
    },
    {
      key: "isEntrada",
      header: "Tipo",
      align: "center",
      render: (row) => {
        if (row.isEntrada) {
          return (
            <Chip
              icon={<ArrowForwardIcon />}
              label="Entrada"
              color="success"
              size="small"
              sx={{ fontSize: "0.75rem" }}
            />
          );
        }
        return (
          <Chip
            icon={<ArrowBackIcon />}
            label="Salida"
            color="error"
            size="small"
            sx={{ fontSize: "0.75rem" }}
          />
        );
      },
    },
  ];

  if (!selectedLocalId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Por favor, selecciona un local del menú para ver el listado de
          transferencias
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/home")}
              size="small"
            >
              Volver
            </Button>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Listado de Transferencias
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Historial completo de transferencias
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              size="small"
            >
              Filtros
            </Button>
            <Button
              variant="contained"
              startIcon={<SwapHorizIcon />}
              onClick={() => navigate("/transferencias")}
            >
              Nueva Transferencia
            </Button>
          </Box>
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

      <Paper sx={{ p: { xs: 2, md: 3 } }}>
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
      </Paper>
    </Box>
  );
};

export default TransferenciasListadoPage;
