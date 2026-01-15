import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Divider,
  IconButton,
  TextField,
  MenuItem,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useLazyGetAllProductosQuery } from "../../../services/api/productosApi";
import { useGetAllCajasQuery } from "../../../services/api/cajasApi";
import { useGetAllCuentasBancariasQuery } from "../../../services/api/cuentasBancariasApi";
import { useGetAllPosQuery } from "../../../services/api/posApi";
import {
  useAddVentaMutation,
  useUpdateVentaMutation,
  useGetVentaQuery,
} from "../../../services/api/ventasApi";
import type {
  VentaRequest,
  DetalleVentaRequest,
  PagoEfectivoRequest,
  PagoTransferenciaRequest,
  PagoPosRequest,
} from "../../../types";
import { notify } from "../../../utils/notify";
import { NumericInput } from "../../../components/NumericInput";
import { formatCurrency } from "../../../utils/format";
import { AsyncSelectField } from "../../../components/AsyncSelectField";
import type { AsyncSelectOption } from "../../../components/AsyncSelectField";
import { useSesionValidation } from "../../../hooks/useSesionValidation";

interface VentaFormProps {
  localId: number;
  ventaId?: number;
  onClose?: () => void;
}

interface ProductoOption extends AsyncSelectOption {
  stock: number;
  precio: number;
  nombre: string;
  codigo: string;
  isServicio: boolean;
}

interface ProductoItem {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  stock: number;
  nombre: string;
  option: ProductoOption | null;
  isServicio: boolean;
}

interface PagoItem {
  tipo: "efectivo" | "transferencia" | "pos";
  monto: number;
  cajaId?: number;
  cuentaBancariaId?: number;
  posId?: number;
}

export const VentaForm: React.FC<VentaFormProps> = ({
  localId,
  ventaId,
  onClose,
}) => {
  const { puedeRealizarVentas, sesionAbiertaPorOtroUsuario } =
    useSesionValidation();
  const [productos, setProductos] = useState<ProductoItem[]>(
    !ventaId
      ? [
          {
            productoId: 0,
            cantidad: 1,
            precioUnitario: 0,
            stock: 0,
            nombre: "",
            option: null,
            isServicio: false,
          },
        ]
      : []
  );
  const [pagos, setPagos] = useState<PagoItem[]>([]);
  const [focusIndex, setFocusIndex] = useState<number | null>(
    !ventaId ? 0 : null
  );
  
  // Cola de códigos escaneados pendientes de procesar
  const scanQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const currentInputRef = useRef<string>("");

  const [triggerGetProductos] = useLazyGetAllProductosQuery();
  const { data: cajasData } = useGetAllCajasQuery({
    page: 1,
    query: { localId },
  });
  const { data: cuentasData } = useGetAllCuentasBancariasQuery({
    page: 1,
    query: { localId },
  });
  const { data: posData } = useGetAllPosQuery({ page: 1, query: { localId } });

  const { data: ventaExistente, isLoading: isLoadingVenta } = useGetVentaQuery(
    ventaId || 0,
    {
      skip: !ventaId,
    }
  );

  const [addVenta, { isLoading: isAdding }] = useAddVentaMutation();
  const [updateVenta, { isLoading: isUpdating }] = useUpdateVentaMutation();

  const cajasDisponibles = useMemo(() => cajasData?.data || [], [cajasData]);
  const cuentasDisponibles = useMemo(
    () => cuentasData?.data || [],
    [cuentasData]
  );

  // Encontrar la cuenta bancaria por defecto
  const cuentaBancariaPorDefecto = useMemo(() => {
    return cuentasDisponibles.find((cuenta) => cuenta.porDefecto === true);
  }, [cuentasDisponibles]);
  const posDisponibles = useMemo(() => posData?.data || [], [posData]);

  useEffect(() => {
    if (focusIndex !== null) {
      const timer = setTimeout(() => setFocusIndex(null), 100);
      return () => clearTimeout(timer);
    }
  }, [focusIndex]);

  useEffect(() => {
    if (!ventaId && pagos.length === 0 && cajasDisponibles.length > 0) {
      setPagos([
        { tipo: "efectivo", monto: 0, cajaId: Number(cajasDisponibles[0].id) },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ventaId, cajasDisponibles]);

  useEffect(() => {
    if (ventaExistente) {
      const initProductos = async () => {
        const newProductos: ProductoItem[] = [];
        for (const d of ventaExistente.detalles) {
          try {
            const res = await triggerGetProductos({
              page: 1,
              query: { localId, nombre: d.productoNombre },
            }).unwrap();
            const found = res.data.find((p) => Number(p.id) === d.productoId);
            if (found) {
              newProductos.push({
                productoId: d.productoId,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
                stock: found.stock,
                nombre: found.nombre,
                isServicio: found.isServicio,
                option: {
                  value: Number(found.id),
                  label: found.nombre,
                  stock: found.stock,
                  precio: found.precio,
                  nombre: found.nombre,
                  codigo: found.codigo,
                  isServicio: found.isServicio,
                },
              });
            } else {
              newProductos.push({
                productoId: d.productoId,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
                stock: 0,
                nombre: d.productoNombre || "",
                option: {
                  value: d.productoId,
                  label: d.productoNombre || "Producto",
                  stock: 0,
                  precio: d.precioUnitario,
                  nombre: d.productoNombre || "",
                  codigo: "",
                },
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
        setProductos(newProductos);
      };

      initProductos();

      const pagosInit: PagoItem[] = [];
      if (ventaExistente.pagoEfectivo) {
        pagosInit.push({
          tipo: "efectivo",
          monto: ventaExistente.pagoEfectivo.monto,
          cajaId: ventaExistente.pagoEfectivo.cajaId,
        });
      }
      ventaExistente.pagosTransferencia.forEach((pt) => {
        pagosInit.push({
          tipo: "transferencia",
          monto: pt.monto,
          cuentaBancariaId: pt.cuentaBancariaId,
        });
      });
      ventaExistente.pagosPos.forEach((pp) => {
        pagosInit.push({
          tipo: "pos",
          monto: pp.monto,
          posId: pp.posId,
        });
      });
      setPagos(pagosInit);
    }
  }, [ventaExistente, localId, triggerGetProductos]);

  const montoTotal = useMemo(() => {
    return productos.reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0);
  }, [productos]);

  const montoPagado = useMemo(() => {
    return pagos.reduce((sum, p) => sum + p.monto, 0);
  }, [pagos]);

  const montoVuelto = useMemo(() => {
    return Math.max(0, montoPagado - montoTotal);
  }, [montoPagado, montoTotal]);

  const montoPendiente = useMemo(() => {
    return Math.max(0, montoTotal - montoPagado);
  }, [montoTotal, montoPagado]);

  // Función para agregar un producto encontrado a la lista
  const addScannedProduct = useCallback((product: ProductoOption) => {
    setProductos((prevProductos) => {
      // Buscar si hay una fila vacía (sin producto seleccionado)
      const emptyIndex = prevProductos.findIndex((p) => p.productoId === 0);
      
      if (emptyIndex !== -1) {
        // Usar la fila vacía existente
        const newProductos = [...prevProductos];
        newProductos[emptyIndex] = {
          productoId: Number(product.value),
          cantidad: 1,
          precioUnitario: product.precio,
          stock: product.stock,
          nombre: product.nombre,
          option: product,
        };
        return newProductos;
      } else {
        // Agregar nueva fila con el producto
        return [
          ...prevProductos,
          {
            productoId: Number(product.value),
            cantidad: 1,
            precioUnitario: product.precio,
            stock: product.stock,
            nombre: product.nombre,
            option: product,
          },
        ];
      }
    });
    
    // Agregar una nueva fila vacía para el siguiente escaneo
    setTimeout(() => {
      setProductos((prev) => {
        const hasEmpty = prev.some((p) => p.productoId === 0);
        if (!hasEmpty) {
          const newList = [
            ...prev,
            {
              productoId: 0,
              cantidad: 1,
              precioUnitario: 0,
              stock: 0,
              nombre: "",
              option: null,
            },
          ];
          setFocusIndex(newList.length - 1);
          return newList;
        }
        return prev;
      });
    }, 50);
  }, []);

  // Procesar la cola de escaneos
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || scanQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    
    while (scanQueueRef.current.length > 0) {
      const searchValue = scanQueueRef.current.shift();
      if (!searchValue) continue;
      
      try {
        const response = await triggerGetProductos({
          page: 1,
          query: { localId, busqueda: searchValue },
        }).unwrap();

        const options = response.data
          .map((p) => ({
            value: Number(p.id),
            label: p.nombre,
            stock: p.stock,
            precio: p.precio,
            nombre: p.nombre,
            codigo: p.codigo,
            isServicio: p.isServicio,
          }))
          .filter((p) => p.stock > 0 || p.isServicio);

        // Buscar producto por código exacto primero
        const foundProduct = options.find(
          (p) => p.codigo.toLowerCase() === searchValue.toLowerCase()
        ) || options[0]; // Si no hay match exacto, usar el primero

        if (foundProduct) {
          addScannedProduct(foundProduct);
        } else {
          notify.error(`Producto no encontrado: ${searchValue}`);
        }
      } catch (error) {
        console.error("Error buscando producto:", error);
        notify.error(`Error buscando producto: ${searchValue}`);
      }
    }
    
    isProcessingRef.current = false;
  }, [triggerGetProductos, localId, addScannedProduct]);

  const loadProductoOptions = async (
    inputValue: string
  ): Promise<ProductoOption[]> => {
    try {
      const response = await triggerGetProductos({
        page: 1,
        query: { localId, busqueda: inputValue || "" },
      }).unwrap();

      const options = response.data
        .map((p) => ({
          value: Number(p.id),
          label: p.nombre,
          stock: p.stock,
          precio: p.precio,
          nombre: p.nombre,
          codigo: p.codigo,
          isServicio: p.isServicio,
        }))
        .filter((p) => p.stock > 0 || p.isServicio)
        .slice(0, 20);

      return options;
    } catch (error) {
      console.error("Error loading products:", error);
      return [];
    }
  };

  const handleAddProducto = () => {
    const newProductos = [
      ...productos,
      {
        productoId: 0,
        cantidad: 1,
        precioUnitario: 0,
        stock: 0,
        nombre: "",
        option: null,
        isServicio: false,
      },
    ];
    setProductos(newProductos);
    setFocusIndex(newProductos.length - 1);
  };

  const handleRemoveProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const handleProductoChange = (
    index: number,
    option: ProductoOption | null
  ) => {
    const newProductos = [...productos];
    if (option) {
      if (option.stock === 0 && !option.isServicio) {
        notify.error("Este producto no tiene stock disponible");
        return;
      }
      newProductos[index] = {
        productoId: Number(option.value),
        cantidad: 0,
        precioUnitario: option.precio,
        stock: option.stock,
        nombre: option.nombre,
        isServicio: option.isServicio,
        option: option,
      };
    } else {
      newProductos[index] = {
        productoId: 0,
        cantidad: 1,
        precioUnitario: 0,
        stock: 0,
        nombre: "",
        isServicio: false,
        option: null,
      };
    }
    setProductos(newProductos);
  };

  const handleProductoKeyDown = (
    _index: number,
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === "Enter" && currentInputRef.current.trim()) {
      event.preventDefault();
      event.stopPropagation();
      
      // Agregar a la cola y procesar
      scanQueueRef.current.push(currentInputRef.current.trim());
      currentInputRef.current = "";
      
      // Procesar la cola sin await para no bloquear
      processQueue();
    }
  };

  const handleInputChange = (value: string) => {
    currentInputRef.current = value;
  };

  const handleCantidadChange = (index: number, cantidad: number) => {
    const newProductos = [...productos];
    newProductos[index].cantidad = cantidad;
    setProductos(newProductos);
  };

  const tieneEfectivo = useMemo(() => {
    return pagos.some((p) => p.tipo === "efectivo");
  }, [pagos]);

  const handleAddPago = () => {
    const nuevoTipo = tieneEfectivo ? "transferencia" : "efectivo";

    const defaultCajaId =
      nuevoTipo === "efectivo" && cajasDisponibles.length > 0
        ? Number(cajasDisponibles[0].id)
        : undefined;

    const defaultCuentaBancariaId =
      nuevoTipo === "transferencia" && cuentaBancariaPorDefecto
        ? Number(cuentaBancariaPorDefecto.id)
        : undefined;

    setPagos([
      ...pagos,
      {
        tipo: nuevoTipo,
        monto: 0,
        cajaId: defaultCajaId,
        cuentaBancariaId: defaultCuentaBancariaId,
      },
    ]);
  };

  const handleRemovePago = (index: number) => {
    setPagos(pagos.filter((_, i) => i !== index));
  };

  const handlePagoChange = (
    index: number,
    field: keyof PagoItem,
    value: string | number
  ) => {
    const newPagos = [...pagos];

    if (field === "tipo") {
      const nuevoTipo = value as "efectivo" | "transferencia" | "pos";
      if (nuevoTipo === "efectivo") {
        const yaExisteEfectivo = pagos.some(
          (p, i) => p.tipo === "efectivo" && i !== index
        );
        if (yaExisteEfectivo) {
          notify.error("Solo se permite un pago en efectivo");
          return;
        }

        if (cajasDisponibles.length > 0) {
          newPagos[index].cajaId = Number(cajasDisponibles[0].id);
        }
      } else {
        newPagos[index].cajaId = undefined;
      }

      if (nuevoTipo === "transferencia") {
        // Preseleccionar la cuenta bancaria por defecto si existe
        if (cuentaBancariaPorDefecto) {
          newPagos[index].cuentaBancariaId = Number(
            cuentaBancariaPorDefecto.id
          );
        }
      } else {
        newPagos[index].cuentaBancariaId = undefined;
      }

      if (nuevoTipo !== "pos") {
        newPagos[index].posId = undefined;
      }
    }

    newPagos[index] = { ...newPagos[index], [field]: value };
    setPagos(newPagos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!puedeRealizarVentas) {
      if (sesionAbiertaPorOtroUsuario) {
        notify.error(
          `No puedes realizar ventas. Hay una sesión abierta por ${sesionAbiertaPorOtroUsuario.userName} en el local ${sesionAbiertaPorOtroUsuario.localNombre}`
        );
      } else {
        notify.error("Debes tener una sesión activa para realizar ventas");
      }
      return;
    }

    if (productos.length === 0) {
      notify.error("Debe agregar al menos un producto");
      return;
    }

    if (productos.some((p) => !p.productoId || p.productoId === 0)) {
      notify.error("Debe seleccionar todos los productos");
      return;
    }

    if (productos.some((p) => p.cantidad > p.stock && !p.isServicio)) {
      notify.error("La cantidad no puede superar el stock disponible");
      return;
    }

    if (montoPagado < montoTotal) {
      notify.error("El monto pagado debe ser mayor o igual al monto total");
      return;
    }

    if (pagos.length === 0) {
      notify.error("Debe agregar al menos una forma de pago");
      return;
    }

    const pagosEfectivo = pagos.filter((p) => p.tipo === "efectivo");
    if (pagosEfectivo.length > 1) {
      notify.error("Solo se permite un pago en efectivo");
      return;
    }

    const detallesVentaRequest: DetalleVentaRequest[] = productos.map((p) => ({
      productoId: p.productoId,
      cantidad: p.cantidad,
    }));

    const pagoEfectivo = pagos.find((p) => p.tipo === "efectivo");
    const pagoEfectivoRequest: PagoEfectivoRequest | undefined =
      pagoEfectivo && pagoEfectivo.cajaId
        ? {
            monto: pagoEfectivo.monto,
            cajaId: pagoEfectivo.cajaId,
          }
        : undefined;

    const pagosTransferencia: PagoTransferenciaRequest[] = pagos
      .filter((p) => p.tipo === "transferencia" && p.cuentaBancariaId)
      .map((p) => ({
        monto: p.monto,
        cuentaBancariaId: p.cuentaBancariaId!,
      }));

    const pagosPos: PagoPosRequest[] = pagos
      .filter((p) => p.tipo === "pos" && p.posId)
      .map((p) => ({
        monto: p.monto,
        posId: p.posId!,
      }));

    const request: VentaRequest = {
      detallesVentaRequest,
      pagoEfectivo: pagoEfectivoRequest,
      pagosTransferencia,
      pagosPos,
    };

    try {
      if (ventaId) {
        await updateVenta({ id: ventaId, body: request }).unwrap();
        notify.success("Venta actualizada exitosamente");
      } else {
        await addVenta(request).unwrap();
        notify.success("Venta creada exitosamente");
      }
      if (onClose) onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      notify.error(error?.data?.message || "Error al guardar la venta");
    }
  };

  if (ventaId && isLoadingVenta) {
    return <Box>Cargando...</Box>;
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: { xs: 1, sm: 2 },
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Productos
        </Typography>
        {productos.map((producto, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: 2,
              borderColor: "divider",
              "&:hover": { borderColor: "primary.main", boxShadow: 1 },
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                <AsyncSelectField
                  label="Producto"
                  value={producto.option}
                  onChange={(option) =>
                    handleProductoChange(index, option as ProductoOption)
                  }
                  onInputChange={handleInputChange}
                  onKeyDown={(event) => handleProductoKeyDown(index, event)}
                  loadOptions={loadProductoOptions}
                  required
                  placeholder="Buscar producto..."
                  autoFocus={focusIndex === index}
                  formatOptionLabel={(option, context) => {
                    const p = option as ProductoOption;
                    if (context === "value") {
                      return (
                        <Typography variant="body1">{p.nombre}</Typography>
                      );
                    }
                    return (
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {p.nombre}{!p.isServicio ? ` (${p.codigo})` : ""}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={p.stock === 0 && !p.isServicio ? "error" : "text.secondary"}
                          display="block"
                        >
                          {p.isServicio ? "Servicio" : `Stock: ${p.stock}`}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {formatCurrency(p.precio)} Gs.
                        </Typography>
                      </Box>
                    );
                  }}
                  isOptionDisabled={(option) =>
                    (option as ProductoOption).stock === 0 && !(option as ProductoOption).isServicio
                  }
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }} sx={{ mt: { xs: 0, md: 6 } }}>
                <NumericInput
                  label="Cantidad"
                  value={producto.cantidad}
                  onChange={(value) => handleCantidadChange(index, value)}
                  required
                  defaultValue={0}
                  allowDecimal={false}
                  size="medium"
                  error={producto.cantidad > producto.stock && !producto.isServicio}
                  helperText={
                    producto.cantidad > producto.stock && !producto.isServicio
                      ? `Stock: ${producto.stock}`
                      : " "
                  }
                  fullWidth
                  disabled={!producto.productoId || producto.productoId === 0}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 2 }} sx={{ mt: { xs: 0, md: 6 } }}>
                <TextField
                  label="Precio Unit."
                  value={formatCurrency(producto.precioUnitario)}
                  disabled
                  size="medium"
                  fullWidth
                  helperText=" "
                />
              </Grid>
              <Grid size={{ xs: 9, md: 2 }} sx={{ mt: { xs: 0, md: 6 } }}>
                <TextField
                  label="Subtotal"
                  value={formatCurrency(
                    producto.cantidad * producto.precioUnitario
                  )}
                  disabled
                  size="medium"
                  fullWidth
                  helperText=" "
                />
              </Grid>
              <Grid
                size={{ xs: 3, md: 1 }}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  mt: { xs: 0, md: 3.5 },
                  paddingTop: 1,
                }}
              >
                <IconButton
                  size="medium"
                  color="error"
                  onClick={() => handleRemoveProducto(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddProducto}
        >
          Agregar Producto
        </Button>
      </Box>

      <Divider />

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Formas de Pago
        </Typography>
        {pagos.map((pago, index) => (
          <Paper
            key={index}
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: 2,
              borderColor: "divider",
              "&:hover": { borderColor: "primary.main", boxShadow: 1 },
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <TextField
                  select
                  label="Tipo"
                  value={pago.tipo}
                  onChange={(e) =>
                    handlePagoChange(index, "tipo", e.target.value)
                  }
                  required
                  disabled={
                    tieneEfectivo && pago.tipo === "transferencia" && false
                  }
                  size="medium"
                  fullWidth
                >
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                  <MenuItem value="transferencia">Transferencia</MenuItem>
                  <MenuItem value="pos">POS</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                {pago.tipo === "efectivo" && (
                  <TextField
                    select
                    label="Caja"
                    value={pago.cajaId || ""}
                    onChange={(e) =>
                      handlePagoChange(index, "cajaId", Number(e.target.value))
                    }
                    required
                    size="medium"
                    fullWidth
                  >
                    <MenuItem value="">Seleccionar caja</MenuItem>
                    {cajasDisponibles.map((c) => (
                      <MenuItem key={c.id} value={Number(c.id)}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                {pago.tipo === "transferencia" && (
                  <TextField
                    select
                    label="Cuenta Bancaria"
                    value={pago.cuentaBancariaId || ""}
                    onChange={(e) =>
                      handlePagoChange(
                        index,
                        "cuentaBancariaId",
                        Number(e.target.value)
                      )
                    }
                    required
                    size="medium"
                    fullWidth
                  >
                    <MenuItem value="">Seleccionar cuenta</MenuItem>
                    {cuentasDisponibles.map((c) => (
                      <MenuItem key={c.id} value={Number(c.id)}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
                {pago.tipo === "pos" && (
                  <TextField
                    select
                    label="POS"
                    value={pago.posId || ""}
                    onChange={(e) =>
                      handlePagoChange(index, "posId", Number(e.target.value))
                    }
                    required
                    size="medium"
                    fullWidth
                  >
                    <MenuItem value="">Seleccionar POS</MenuItem>
                    {posDisponibles.map((p) => (
                      <MenuItem key={p.id} value={Number(p.id)}>
                        {p.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>

              <Grid size={{ xs: 7, sm: 5, md: 2.5 }}>
                <NumericInput
                  label="Monto"
                  value={pago.monto}
                  onChange={(value) => handlePagoChange(index, "monto", value)}
                  required
                  allowDecimal={false}
                  size="medium"
                  fullWidth
                />
              </Grid>

              <Grid
                size={{ xs: 5, sm: 5, md: 2.5 }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {montoPendiente > 0 ? (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() =>
                      handlePagoChange(
                        index,
                        "monto",
                        pago.monto + montoPendiente
                      )
                    }
                    fullWidth
                  >
                    Gs. +{formatCurrency(montoPendiente)}
                  </Button>
                ) : (
                  <Box sx={{ width: "100%", height: "40px" }} />
                )}
              </Grid>

              <Grid
                size={{ xs: 12, sm: 2, md: 1 }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-end" },
                }}
              >
                <IconButton
                  size="medium"
                  color="error"
                  onClick={() => handleRemovePago(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
        ))}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddPago}
          >
            Agregar Forma de Pago
          </Button>
          {pagos.length > 0 && tieneEfectivo && (
            <Chip
              label="Solo 1 efectivo permitido"
              size="small"
              sx={{ alignSelf: "center" }}
            />
          )}
        </Box>
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        <Card
          sx={{
            flex: 1,
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              "&:last-child": { pb: { xs: 2, sm: 3 } },
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              Total a Pagar
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(montoTotal)} Gs.
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            flex: 1,
            bgcolor: montoPagado >= montoTotal ? "success.main" : "grey.100",
            color:
              montoPagado >= montoTotal
                ? "success.contrastText"
                : "text.primary",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              "&:last-child": { pb: { xs: 2, sm: 3 } },
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              Monto Pagado
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(montoPagado)} Gs.
            </Typography>
          </CardContent>
        </Card>

        {montoPendiente > 0 && (
          <Card
            sx={{
              flex: 1,
              bgcolor: "warning.main",
              color: "warning.contrastText",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, sm: 3 },
                "&:last-child": { pb: { xs: 2, sm: 3 } },
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Pendiente
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(montoPendiente)} Gs.
              </Typography>
            </CardContent>
          </Card>
        )}

        {montoVuelto > 0 && (
          <Card
            sx={{
              flex: 1,
              bgcolor: "success.light",
              color: "success.contrastText",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 2, sm: 3 },
                "&:last-child": { pb: { xs: 2, sm: 3 } },
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Vuelto
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(montoVuelto)} Gs.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        {onClose && (
          <Button onClick={onClose} size="large">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isAdding || isUpdating || montoPendiente > 0}
          size="large"
          sx={{ minWidth: { xs: "100%", sm: 200 } }}
        >
          {isAdding || isUpdating
            ? "Guardando..."
            : ventaId
            ? "Actualizar"
            : "Finalizar Venta"}
        </Button>
      </Box>
    </Box>
  );
};
