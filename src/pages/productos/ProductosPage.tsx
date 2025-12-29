import React, { useState, useMemo } from "react";
import { Box, Button, Chip, Typography, Paper } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { DataTable } from "../../components/DataTable";
import type { ColumnConfig, ActionMenuItem } from "../../components/DataTable";
import { FilterDrawer } from "../../components/FilterDrawer";
import { FormDrawer } from "../../components/FormDrawer";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useFilters } from "../../hooks/useFilters";
import type { FilterConfig } from "../../hooks/useFilters";
import { useOpenModal } from "../../hooks/useOpenModal";
import { useHasPermisos } from "../../hooks/useHasPermisos";
import { notify } from "../../utils/notify";
import { formatCurrency } from "../../utils/format";
import { formatDate } from "../../utils/dateFormat";
import { ProductoForm } from "./components/ProductoForm";
import type { ProductoFormData } from "./components/ProductoForm";
import { AddStockForm } from "./components/AddStockForm";
import type { AddStockFormData } from "./components/AddStockForm";
import type { ProductoDto } from "../../types";
import {
  useGetAllProductosQuery,
  useGetProductoQuery,
  useAddProductoMutation,
  useUpdateProductoMutation,
  useDeleteProductoMutation,
  useAddStockMutation,
} from "../../services/api/productosApi";
import { useLazyGetAllLocalesQuery } from "../../services/api/localesApi";
import { createLocalLoader } from "../../utils/filterHelpers";
import { useLocalFilter } from "../../contexts/LocalFilterContext";
import { useAuth } from "../../hooks/useAuth";

const ProductosPage: React.FC = () => {
  const { hasWritePermission } = useHasPermisos();
  const { isAdmin } = useAuth();
  const { modalState, openModal, closeModal } = useOpenModal();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [addStockData, setAddStockData] = useState<{
    id: number;
    nombre: string;
    stock: number;
  } | null>(null);
  const [confirmAddStock, setConfirmAddStock] =
    useState<AddStockFormData | null>(null);
  const { selectedLocalId } = useLocalFilter();

  const [lazyGetAllLocales] = useLazyGetAllLocalesQuery();

  const filterConfigs: FilterConfig[] = useMemo(() => {
    const configs: FilterConfig[] = [
      {
        name: "busqueda",
        label: "Buscar por nombre o código",
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

    configs.push({
      name: "stock",
      label: "Stock",
      type: "select",
      initialValue: "",
      options: [
        { value: "", label: "Todos" },
        { value: true, label: "Con stock" },
        { value: false, label: "Sin stock" },
      ],
    });

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

  const { data, isLoading, error } = useGetAllProductosQuery({
    page,
    query: {
      busqueda: appliedFilters.busqueda || undefined,
      orderBy: undefined,
      asc: undefined,
      localId: selectedLocalId || appliedFilters.localId?.value || undefined,
      stock: appliedFilters.stock === "" ? undefined : appliedFilters.stock,
    },
  });

  const { data: selectedProducto, isLoading: isLoadingProducto } =
    useGetProductoQuery((modalState.id as number) || 0, {
      skip: !modalState.id || modalState.type !== "edit",
    });

  const [addProducto, { isLoading: isAdding }] = useAddProductoMutation();
  const [updateProducto, { isLoading: isUpdating }] =
    useUpdateProductoMutation();
  const [deleteProducto, { isLoading: isDeleting }] =
    useDeleteProductoMutation();
  const [addStock, { isLoading: isAddingStock }] = useAddStockMutation();

  const handleAdd = async (formData: ProductoFormData) => {
    try {
      await addProducto(formData).unwrap();
      notify.success("Producto creado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al crear el producto");
    }
  };

  const handleEdit = async (formData: ProductoFormData) => {
    if (!modalState.id) return;
    try {
      await updateProducto({
        id: modalState.id as number,
        body: formData,
      }).unwrap();
      notify.success("Producto actualizado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al actualizar el producto");
    }
  };

  const handleDelete = async () => {
    if (!modalState.id) return;
    try {
      await deleteProducto(modalState.id as number).unwrap();
      notify.success("Producto eliminado exitosamente");
      closeModal();
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al eliminar el producto");
    }
  };

  const handleAddStockSubmit = (formData: AddStockFormData) => {
    setConfirmAddStock(formData);
  };

  const handleConfirmAddStock = async () => {
    if (!addStockData || !confirmAddStock) return;
    try {
      await addStock({
        id: addStockData.id,
        cantidad: confirmAddStock.cantidad,
      }).unwrap();
      notify.success(
        `Se agregaron ${confirmAddStock.cantidad} unidades al stock`
      );
      setAddStockData(null);
      setConfirmAddStock(null);
    } catch (err: any) {
      notify.error(err?.data?.message || "Error al agregar stock");
    }
  };

  const handleCancelAddStock = () => {
    setConfirmAddStock(null);
  };

  const columns: ColumnConfig<ProductoDto>[] = [
    { key: "nombre", header: "Nombre" },
    { key: "codigo", header: "Código" },
    { key: "localNombre", header: "Local", align: "center" },
    {
      key: "precio",
      header: "Precio",
      render: (row) => `${formatCurrency(row.precio)} Gs.`,
    },
    ...(isAdmin
      ? [
          {
            key: "costo" as const,
            header: "Costo",
            render: (row: ProductoDto) => `${formatCurrency(row.costo)} Gs.`,
          },
        ]
      : []),
    { key: "stock", header: "Stock", align: "center" },
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

  const actions: ActionMenuItem<ProductoDto>[] = [
    {
      label: "Agregar Stock",
      icon: <InventoryIcon fontSize="small" />,
      onClick: (row) =>
        setAddStockData({
          id: Number(row.id),
          nombre: row.nombre,
          stock: row.stock,
        }),
      color: "success",
      show: () => hasWritePermission,
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
          <Typography
            variant="h5"
            component="h1"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            Gestión de Productos
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant="outlined"
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
                Nuevo Producto
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
        rows={data?.data || []}
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
        title="Nuevo Producto"
      >
        <ProductoForm onSubmit={handleAdd} loading={isAdding} />
      </FormDrawer>

      <FormDrawer
        open={modalState.type === "edit"}
        onClose={closeModal}
        title="Editar Producto"
      >
        {isLoadingProducto ? (
          <Typography>Cargando...</Typography>
        ) : (
          <ProductoForm
            onSubmit={handleEdit}
            defaultValues={selectedProducto}
            loading={isUpdating}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={modalState.type === "delete"}
        title="Eliminar Producto"
        description={`¿Está seguro que desea eliminar el producto "${
          (modalState.data as ProductoDto | undefined)?.nombre ?? ""
        }"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={closeModal}
        loading={isDeleting}
        confirmText="Eliminar"
        confirmColor="error"
      />

      <FormDrawer
        open={!!addStockData && !confirmAddStock}
        onClose={() => setAddStockData(null)}
        title="Agregar Stock"
      >
        {addStockData && (
          <AddStockForm
            productoNombre={addStockData.nombre}
            stockActual={addStockData.stock}
            onSubmit={handleAddStockSubmit}
            onCancel={() => setAddStockData(null)}
            loading={false}
          />
        )}
      </FormDrawer>

      <ConfirmDialog
        open={!!confirmAddStock}
        title="Confirmar Agregar Stock"
        description={`¿Está seguro que desea agregar ${
          confirmAddStock?.cantidad || 0
        } unidades al stock de "${addStockData?.nombre}"? El nuevo stock será ${
          (addStockData?.stock || 0) + (confirmAddStock?.cantidad || 0)
        } unidades.`}
        onConfirm={handleConfirmAddStock}
        onCancel={handleCancelAddStock}
        loading={isAddingStock}
        confirmText="Confirmar"
        confirmColor="primary"
      />
    </Box>
  );
};

export default ProductosPage;
