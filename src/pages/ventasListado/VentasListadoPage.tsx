import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig, ActionMenuItem } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import {
  useGetAllVentasQuery,
  useGetVentaQuery,
} from "../../services/api/ventasApi";
import { useLazyGetAllLocalesQuery } from "../../services/api/localesApi";
import { useLazyGetAllCajasQuery } from "../../services/api/cajasApi";
import { useLazyGetAllCuentasBancariasQuery } from "../../services/api/cuentasBancariasApi";
import type { VentaDto } from "../../types";
import { formatCurrency } from "../../utils/format";
import { formatDateTime } from "../../utils/dateFormat";
import { createLocalLoader } from "../../utils/filterHelpers";
import { useLocalFilter } from "../../contexts/LocalFilterContext";
import { VentaDetails } from "./components/VentaDetails";

const VentasListadoPage: React.FC = () => {
  const { modalState, openModal, closeModal } = useOpenModal();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { selectedLocalId } = useLocalFilter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [lazyGetAllLocales] = useLazyGetAllLocalesQuery();
  const [lazyGetAllCajas] = useLazyGetAllCajasQuery();
  const [lazyGetAllCuentasBancarias] = useLazyGetAllCuentasBancariasQuery();

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

    configs.push(
      {
        name: "productoNombre",
        label: "Producto",
        type: "string",
        initialValue: "",
      },
      {
        name: "cajaId",
        label: "Caja",
        type: "async-select",
        initialValue: null,
        loadOptions: async (inputValue: string) => {
          const response = await lazyGetAllCajas({
            page: 1,
            query: {
              nombre: inputValue,
              localId: selectedLocalId || undefined,
            },
          }).unwrap();
          return response.data.map((c) => ({
            value: Number(c.id),
            label: c.nombre,
          }));
        },
        placeholder: "Buscar caja...",
      },
      {
        name: "cuentaBancariaId",
        label: "Cuenta Bancaria",
        type: "async-select",
        initialValue: null,
        loadOptions: async (inputValue: string) => {
          const response = await lazyGetAllCuentasBancarias({
            page: 1,
            query: {
              nombre: inputValue,
              localId: selectedLocalId || undefined,
            },
          }).unwrap();
          return response.data.map((c) => ({
            value: Number(c.id),
            label: c.nombre,
          }));
        },
        placeholder: "Buscar cuenta bancaria...",
      }
    );

    return configs;
  }, [
    lazyGetAllLocales,
    lazyGetAllCajas,
    lazyGetAllCuentasBancarias,
    selectedLocalId,
  ]);

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

  const { data, isLoading, error } = useGetAllVentasQuery({
    page,
    query: {
      localId: selectedLocalId || appliedFilters.localId?.value || undefined,
      productoNombre: appliedFilters.productoNombre || undefined,
      cajaId: appliedFilters.cajaId?.value || undefined,
      cuentaBancariaId: appliedFilters.cuentaBancariaId?.value || undefined,
    },
  });

  const paginatedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.slice(0, pageSize);
  }, [data, pageSize]);

  const { data: selectedVenta, isLoading: isLoadingVenta } = useGetVentaQuery(
    (modalState.id as number) || 0,
    {
      skip: modalState.type !== "details" || !modalState.id,
    }
  );

  const columns: ColumnConfig<VentaDto>[] = [
    {
      key: "createAt",
      header: "Fecha",
      render: (row) => formatDateTime(row.createAt),
    },
    {
      key:"userName",
      header: "Usuario",
      render: (row) => row.userName,
      align: "center",
    },
    {
      key: "detalles",
      header: "Productos",
      render: (row) => row.detalles.length,
      align: "center",
    },
    {
      key: "montoPagado",
      header: "Pagado (Gs.)",
      render: (row) => formatCurrency(row.montoPagado ?? 0),
      align: "right",
    },
    {
      key: "montoVuelto",
      header: "Vuelto (Gs.)",
      render: (row) => formatCurrency(row.montoVuelto ?? 0),
      align: "right",
    },
    {
      key: "montoTotal",
      header: "Total (Gs.)",
      render: (row) => formatCurrency(row.montoTotal ?? 0),
      align: "right",
    },
  ];

  const actions: ActionMenuItem<VentaDto>[] = [
    {
      label: "Ver detalles",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => openModal("details", Number(row.id)),
      color: "info",
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
          <Typography variant="h5" component="h1">
            Listado de Ventas
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              size="small"
            >
              Filtros
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
      />

      <DataTable
        columns={columns}
        rows={paginatedData}
        loading={isLoading}
        error={error}
        page={page}
        pageSize={pageSize}
        total={data?.totalRecords || 0}
        onPageChange={handlePageChange}
        actions={actions}
      />

      <Dialog
        open={modalState.type === "details"}
        onClose={closeModal}
        fullScreen={isMobile}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: isMobile ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Detalles de Venta</Typography>
          <IconButton
            aria-label="close"
            onClick={closeModal}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <VentaDetails venta={selectedVenta} loading={isLoadingVenta} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VentasListadoPage;
