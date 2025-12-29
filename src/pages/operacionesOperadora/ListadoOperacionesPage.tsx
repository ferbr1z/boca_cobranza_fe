import React, { useState, useMemo } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useGetAllOperacionesOperadoraQuery } from "../../services/api/operacionOperadoraApi";
import { useLazyGetAllOperadorasQuery } from "../../services/api/operadorasApi";
import { formatCurrency } from "../../utils/format";
import { formatDateTime } from "../../utils/dateFormat";
import type { OperacionOperadoraDto } from "../../types";
import { TIPO_MOVIMIENTO_LABELS } from "../../enum/tipoMovimientoEnum";

const ListadoOperacionesPage: React.FC = () => {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [lazyGetAllOperadoras] = useLazyGetAllOperadorasQuery();

  const loadOperadoras = async (inputValue: string) => {
    try {
      const result = await lazyGetAllOperadoras({
        page: 1,
        query: {
          nombre: inputValue || undefined,
        },
      }).unwrap();

      return result.data.map((operadora) => ({
        value: operadora.id.toString(),
        label: operadora.nombre,
      }));
    } catch (error) {
      return [];
    }
  };

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        name: "operadoraId",
        label: "Operadora",
        type: "async-select",
        loadOptions: loadOperadoras,
        initialValue: null,
      },
      {
        name: "sesionLocalId",
        label: "ID Sesión Local",
        type: "string",
        placeholder: "Ingrese ID de sesión...",
        initialValue: "",
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
    handlePageChange,
    resetFilters,
  } = useFilters({
    filters: filterConfigs,
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data, isLoading, error } = useGetAllOperacionesOperadoraQuery(
    {
      page,
      query: {
        operadoraId: appliedFilters.operadoraId?.value
          ? Number(appliedFilters.operadoraId.value)
          : undefined,
        sesionLocalId: appliedFilters.sesionLocalId
          ? Number(appliedFilters.sesionLocalId)
          : undefined,
      },
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const columns: ColumnConfig<OperacionOperadoraDto>[] = [
    {
      key: "createAt",
      header: "Fecha",
      render: (row) => formatDateTime(row.createAt),
    },
    {
      key: "operadoraNombre",
      header: "Operadora",
    },
    {
      key: "tipoMovimiento",
      header: "Tipo",
      render: (row) => {
        const tipo =
          TIPO_MOVIMIENTO_LABELS[row.tipoMovimiento] || "Desconocido";
        return row.isEntrada ? `${tipo} (Entrada)` : `${tipo} (Salida)`;
      },
    },
    {
      key: "isBilletera",
      header: "Billetera",
      align: "center",
      render: (row) => (row.isBilletera ? "Sí" : "No"),
    },
    {
      key: "monto",
      header: "Monto (Gs.)",
      render: (row) => (
        <span style={{ color: row.isEntrada ? "#4caf50" : "#f44336" }}>
          {row.isEntrada ? "+" : "-"} {formatCurrency(row.monto)}
        </span>
      ),
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
        <Typography variant="h4" component="h1" gutterBottom>
          Operaciones de Operadora
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Listado de todas las operaciones realizadas
        </Typography>
      </Paper>

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

      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filterConfigs}
        values={filterValues}
        onChange={handleFilterChange}
        onReset={resetFilters}
        onApply={applyFilters}
      />
    </Box>
  );
};

export default ListadoOperacionesPage;
