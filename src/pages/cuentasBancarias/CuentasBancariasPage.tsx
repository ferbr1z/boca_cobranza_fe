import React, { useState, useMemo } from "react";
import { Box, Button, Chip, Typography, Paper } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
} from "@mui/icons-material";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig, ActionMenuItem } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { FormDrawer } from "../../components/FormDrawer";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { CuentaBancariaForm } from "./components/CuentaBancariaForm";
import type { CuentaBancariaFormData } from "./components/CuentaBancariaForm";
import { CuentaBancariaDetails } from "./components/CuentaBancariaDetails";
import { AddMontoForm } from "../../components/AddMontoForm";
import type { AddMontoFormData } from "../../components/AddMontoForm";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import { useHasPermisos } from "../../hooks/useHasPermisos";
import {
  useGetAllCuentasBancariasQuery,
  useGetCuentaBancariaQuery,
  useAddCuentaBancariaMutation,
  useUpdateCuentaBancariaMutation,
  useDeleteCuentaBancariaMutation,
  useAddMontoCuentaBancariaMutation,
  useSubtractMontoCuentaBancariaMutation,
} from "../../services/api/cuentasBancariasApi";
import { useLazyGetAllLocalesQuery } from "../../services/api/localesApi";
import type { CuentaBancariaDto } from "../../types";
import { notify } from "../../utils/notify";
import { formatCurrency } from "../../utils/format";
import { createLocalLoader } from "../../utils/filterHelpers";
import { useLocalFilter } from "../../contexts/LocalFilterContext";

const CuentasBancariasPage: React.FC = () => {
  const { hasWritePermission } = useHasPermisos();
  const { modalState, openModal, closeModal } = useOpenModal();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const { selectedLocalId } = useLocalFilter();
  const [addMontoData, setAddMontoData] = useState<{
    id: number;
    nombre: string;
    monto: number;
  } | null>(null);
  const [subtractMontoData, setSubtractMontoData] = useState<{
    id: number;
    nombre: string;
    monto: number;
  } | null>(null);
  const [confirmAddMonto, setConfirmAddMonto] =
    useState<AddMontoFormData | null>(null);
  const [confirmSubtractMonto, setConfirmSubtractMonto] =
    useState<AddMontoFormData | null>(null);

  const [lazyGetAllLocales] = useLazyGetAllLocalesQuery();

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [
      {
        name: "nombre",
        label: "Nombre",
        type: "string",
        initialValue: "",
      },
    ];

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
    handlePageChange,
    resetFilters,
  } = useFilters({
    filters: filterConfigs,
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data, isLoading, error } = useGetAllCuentasBancariasQuery({
    page,
    query: {
      nombre: appliedFilters.nombre || undefined,
      localId: selectedLocalId || appliedFilters.localId?.value || undefined,
    },
  });

  const paginatedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.slice(0, pageSize);
  }, [data, pageSize]);

  const { data: selectedCuentaBancaria, isLoading: isLoadingCuentaBancaria } =
    useGetCuentaBancariaQuery((modalState.id as number) || 0, {
      skip:
        (modalState.type !== "edit" && modalState.type !== "details") ||
        !modalState.id,
    });

  const [addCuentaBancaria, { isLoading: isAdding }] =
    useAddCuentaBancariaMutation();
  const [updateCuentaBancaria, { isLoading: isUpdating }] =
    useUpdateCuentaBancariaMutation();
  const [deleteCuentaBancaria, { isLoading: isDeleting }] =
    useDeleteCuentaBancariaMutation();
  const [addMontoCuentaBancaria, { isLoading: isAddingMonto }] =
    useAddMontoCuentaBancariaMutation();
  const [subtractMontoCuentaBancaria, { isLoading: isSubtractingMonto }] =
    useSubtractMontoCuentaBancariaMutation();

  const handleAdd = async (formData: CuentaBancariaFormData) => {
    try {
      await addCuentaBancaria(formData).unwrap();
      notify.success("Cuenta bancaria creada exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al crear la cuenta bancaria");
    }
  };

  const handleEdit = async (formData: CuentaBancariaFormData) => {
    if (!modalState.id) return;
    try {
      await updateCuentaBancaria({
        id: modalState.id as number,
        body: formData,
      }).unwrap();
      notify.success("Cuenta bancaria actualizada exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(
        err?.data?.message || "Error al actualizar la cuenta bancaria"
      );
    }
  };

  const handleDelete = async () => {
    if (!modalState.id) return;
    try {
      await deleteCuentaBancaria(modalState.id as number).unwrap();
      notify.success("Cuenta bancaria eliminada exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(
        err?.data?.message || "Error al eliminar la cuenta bancaria"
      );
    }
  };

  const handleAddMontoSubmit = (formData: AddMontoFormData) => {
    setConfirmAddMonto(formData);
  };

  const handleConfirmAddMonto = async () => {
    if (!addMontoData || !confirmAddMonto) return;
    try {
      await addMontoCuentaBancaria({
        id: addMontoData.id,
        monto: confirmAddMonto.monto,
      }).unwrap();
      notify.success(
        `Se agregaron ${formatCurrency(confirmAddMonto.monto)} Gs. al monto`
      );
      setAddMontoData(null);
      setConfirmAddMonto(null);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al agregar monto");
    }
  };

  const handleCancelAddMonto = () => {
    setConfirmAddMonto(null);
  };

  const handleSubtractMontoSubmit = (formData: AddMontoFormData) => {
    setConfirmSubtractMonto(formData);
  };

  const handleConfirmSubtractMonto = async () => {
    if (!subtractMontoData || !confirmSubtractMonto) return;
    try {
      await subtractMontoCuentaBancaria({
        id: subtractMontoData.id,
        monto: confirmSubtractMonto.monto,
      }).unwrap();
      notify.success(
        `Se retiraron ${formatCurrency(
          confirmSubtractMonto.monto
        )} Gs. del monto`
      );
      setSubtractMontoData(null);
      setConfirmSubtractMonto(null);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al retirar monto");
    }
  };

  const handleCancelSubtractMonto = () => {
    setConfirmSubtractMonto(null);
  };

  const columns: ColumnConfig<CuentaBancariaDto>[] = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "monto",
      header: "Monto (Gs.)",
      render: (row) => formatCurrency(row.monto),
      align: "center",
    },
    {
      key: "comision",
      header: "Comisión",
      render: (row) => formatCurrency(row.comision),
      align: "center",
    },
    {
      key: "localNombre",
      header: "Local",
      align: "center",
    },
    {
      key: "redDePago",
      header: "Red de Pago",
      align: "center",
      render: (row) =>
        row.redDePagos ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Sí"
            color="primary"
            size="small"
          />
        ) : (
          <Chip icon={<CancelIcon />} label="No" color="default" size="small" />
        ),
    },
    {
      key: "active",
      header: "Estado",
      align: "center",
      render: (row) =>
        row.active ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Activo"
            color="success"
            size="small"
          />
        ) : (
          <Chip
            icon={<CancelIcon />}
            label="Inactivo"
            color="default"
            size="small"
          />
        ),
    },
    {
      key: "createAt",
      header: "Fecha Creación",
      render: (row) => new Date(row.createAt).toLocaleDateString(),
    },
  ];

  const actions: ActionMenuItem<CuentaBancariaDto>[] = [
    {
      label: "Agregar Monto",
      icon: <AddCircleIcon fontSize="small" />,
      onClick: (row) =>
        setAddMontoData({
          id: Number(row.id),
          nombre: row.nombre,
          monto: row.monto,
        }),
      color: "success",
      show: () => hasWritePermission,
    },
    {
      label: "Retirar Monto",
      icon: <RemoveCircleIcon fontSize="small" />,
      onClick: (row) =>
        setSubtractMontoData({
          id: Number(row.id),
          nombre: row.nombre,
          monto: row.monto,
        }),
      color: "warning",
      show: () => hasWritePermission,
    },
    {
      label: "Ver detalles",
      icon: <VisibilityIcon fontSize="small" />,
      onClick: (row) => openModal("details", Number(row.id)),
      color: "info",
    },
    {
      label: "Editar",
      icon: <EditIcon fontSize="small" />,
      onClick: (row) => openModal("edit", Number(row.id)),
      color: "primary",
      show: () => hasWritePermission,
    },
    {
      label: "Eliminar",
      icon: <DeleteIcon fontSize="small" />,
      onClick: (row) => openModal("delete", Number(row.id), row),
      color: "error",
      show: () => hasWritePermission,
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
            Gestión de Cuentas Bancarias
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
            {hasWritePermission && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openModal("add")}
                size="small"
              >
                Nueva Cuenta Bancaria
              </Button>
            )}
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

      <FormDrawer
        open={modalState.type === "add"}
        onClose={closeModal}
        title="Nueva Cuenta Bancaria"
      >
        <CuentaBancariaForm onSubmit={handleAdd} loading={isAdding} />
      </FormDrawer>

      <FormDrawer
        open={modalState.type === "edit"}
        onClose={closeModal}
        title="Editar Cuenta Bancaria"
      >
        {isLoadingCuentaBancaria ? (
          <Typography>Cargando...</Typography>
        ) : (
          <CuentaBancariaForm
            onSubmit={handleEdit}
            defaultValues={
              selectedCuentaBancaria
                ? {
                    nombre: selectedCuentaBancaria.nombre,
                    localId: selectedCuentaBancaria.localId,
                    comision: selectedCuentaBancaria.comision,
                    porDefecto: selectedCuentaBancaria.porDefecto,
                    redDePagos: selectedCuentaBancaria.redDePagos,
                    comisionCuentaBancarias:
                      selectedCuentaBancaria.comisionCuentaBancarias || [],
                  }
                : undefined
            }
            loading={isUpdating}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={modalState.type === "delete"}
        title="Eliminar Cuenta Bancaria"
        description={`¿Está seguro que desea eliminar la cuenta bancaria "${modalState.data?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={closeModal}
        loading={isDeleting}
        confirmText="Eliminar"
        confirmColor="error"
      />

      <FormDrawer
        open={modalState.type === "details"}
        onClose={closeModal}
        title="Detalles de Cuenta Bancaria"
      >
        <CuentaBancariaDetails
          cuentaBancaria={selectedCuentaBancaria}
          loading={isLoadingCuentaBancaria}
        />
      </FormDrawer>

      <FormDrawer
        open={!!addMontoData && !confirmAddMonto}
        onClose={() => setAddMontoData(null)}
        title="Agregar Monto"
      >
        {addMontoData && (
          <AddMontoForm
            entityName={addMontoData.nombre}
            montoActual={addMontoData.monto}
            onSubmit={handleAddMontoSubmit}
            onCancel={() => setAddMontoData(null)}
            loading={false}
            isSubtract={false}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={!!confirmAddMonto}
        title="Confirmar Agregar Monto"
        description={`¿Está seguro que desea agregar ${formatCurrency(
          confirmAddMonto?.monto || 0
        )} Gs. al monto de "${
          addMontoData?.nombre
        }"? El nuevo monto será ${formatCurrency(
          (addMontoData?.monto || 0) + (confirmAddMonto?.monto || 0)
        )} Gs.`}
        onConfirm={handleConfirmAddMonto}
        onCancel={handleCancelAddMonto}
        loading={isAddingMonto}
        confirmText="Confirmar"
        confirmColor="primary"
      />

      <FormDrawer
        open={!!subtractMontoData && !confirmSubtractMonto}
        onClose={() => setSubtractMontoData(null)}
        title="Retirar Monto"
      >
        {subtractMontoData && (
          <AddMontoForm
            entityName={subtractMontoData.nombre}
            montoActual={subtractMontoData.monto}
            onSubmit={handleSubtractMontoSubmit}
            onCancel={() => setSubtractMontoData(null)}
            loading={false}
            isSubtract={true}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={!!confirmSubtractMonto}
        title="Confirmar Retirar Monto"
        description={`¿Está seguro que desea retirar ${formatCurrency(
          confirmSubtractMonto?.monto || 0
        )} Gs. del monto de "${
          subtractMontoData?.nombre
        }"? El nuevo monto será ${formatCurrency(
          (subtractMontoData?.monto || 0) - (confirmSubtractMonto?.monto || 0)
        )} Gs.`}
        onConfirm={handleConfirmSubtractMonto}
        onCancel={handleCancelSubtractMonto}
        loading={isSubtractingMonto}
        confirmText="Confirmar"
        confirmColor="warning"
      />
    </Box>
  );
};

export default CuentasBancariasPage;
