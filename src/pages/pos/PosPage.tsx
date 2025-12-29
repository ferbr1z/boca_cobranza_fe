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
import { PosForm } from "./components/PosForm";
import type { PosFormData } from "./components/PosForm";
import { PosDetails } from "./components/PosDetails";
import { AddMontoForm } from "../../components/AddMontoForm";
import type { AddMontoFormData } from "../../components/AddMontoForm";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import { useHasPermisos } from "../../hooks/useHasPermisos";
import {
  useGetAllPosQuery,
  useGetPosQuery,
  useAddPosMutation,
  useUpdatePosMutation,
  useDeletePosMutation,
  useAddMontoPosMutation,
  useSubtractMontoPosMutation,
} from "../../services/api/posApi";
import { useLazyGetAllLocalesQuery } from "../../services/api/localesApi";
import type { PosDto } from "../../types";
import { notify } from "../../utils/notify";
import { formatCurrency } from "../../utils/format";
import { formatDate } from "../../utils/dateFormat";
import { createLocalLoader } from "../../utils/filterHelpers";
import { useLocalFilter } from "../../contexts/LocalFilterContext";

const PosPage: React.FC = () => {
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

  const { data, isLoading, error } = useGetAllPosQuery({
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

  const { data: selectedPos, isLoading: isLoadingPos } = useGetPosQuery(
    (modalState.id as number) || 0,
    {
      skip:
        (modalState.type !== "edit" && modalState.type !== "details") ||
        !modalState.id,
    }
  );

  const [addPos, { isLoading: isAdding }] = useAddPosMutation();
  const [updatePos, { isLoading: isUpdating }] = useUpdatePosMutation();
  const [deletePos, { isLoading: isDeleting }] = useDeletePosMutation();
  const [addMontoPos, { isLoading: isAddingMonto }] = useAddMontoPosMutation();
  const [subtractMontoPos, { isLoading: isSubtractingMonto }] =
    useSubtractMontoPosMutation();

  const handleAdd = async (formData: PosFormData) => {
    try {
      await addPos(formData).unwrap();
      notify.success("POS creado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al crear el POS");
    }
  };

  const handleEdit = async (formData: PosFormData) => {
    if (!modalState.id) return;
    try {
      await updatePos({ id: modalState.id as number, body: formData }).unwrap();
      notify.success("POS actualizado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al actualizar el POS");
    }
  };

  const handleDelete = async () => {
    if (!modalState.id) return;
    try {
      await deletePos(modalState.id as number).unwrap();
      notify.success("POS eliminado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al eliminar el POS");
    }
  };

  const handleAddMontoSubmit = (formData: AddMontoFormData) => {
    setConfirmAddMonto(formData);
  };

  const handleConfirmAddMonto = async () => {
    if (!addMontoData || !confirmAddMonto) return;
    try {
      await addMontoPos({
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
      await subtractMontoPos({
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

  const columns: ColumnConfig<PosDto>[] = [
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
      key: "localNombre",
      header: "Local",
      align: "center",
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
      render: (row) => formatDate(row.createAt),
    },
  ];

  const actions: ActionMenuItem<PosDto>[] = [
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
            Gestión de POS
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
                Nuevo POS
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
        title="Nuevo POS"
      >
        <PosForm onSubmit={handleAdd} loading={isAdding} />
      </FormDrawer>

      <FormDrawer
        open={modalState.type === "edit"}
        onClose={closeModal}
        title="Editar POS"
      >
        {isLoadingPos ? (
          <Typography>Cargando...</Typography>
        ) : (
          <PosForm
            onSubmit={handleEdit}
            defaultValues={
              selectedPos
                ? { nombre: selectedPos.nombre, localId: selectedPos.localId }
                : undefined
            }
            loading={isUpdating}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={modalState.type === "delete"}
        title="Eliminar POS"
        description={`¿Está seguro que desea eliminar el POS "${modalState.data?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={closeModal}
        loading={isDeleting}
        confirmText="Eliminar"
        confirmColor="error"
      />

      <FormDrawer
        open={modalState.type === "details"}
        onClose={closeModal}
        title="Detalles de POS"
      >
        <PosDetails pos={selectedPos} loading={isLoadingPos} />
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

export default PosPage;
