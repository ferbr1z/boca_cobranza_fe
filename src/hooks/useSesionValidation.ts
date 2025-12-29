import {
  useGetActiveSesionByCurrentUserQuery,
  useGetAllSesionesLocalQuery,
} from "../services/api/sesionLocalApi";
import { useAuth } from "./useAuth";
import { useLocalFilter } from "../contexts/LocalFilterContext";

export const useSesionValidation = (localId?: number) => {
  const { isAdmin, user } = useAuth();
  const { selectedLocalId } = useLocalFilter();
  const currentUserId = user?.id;
  const effectiveLocalId = localId || selectedLocalId;

  const { data: sesionActivaUsuarioActual } =
    useGetActiveSesionByCurrentUserQuery();

  const localIdParaConsultar = isAdmin
    ? effectiveLocalId
    : user?.localId
    ? typeof user.localId === "number"
      ? user.localId
      : parseInt(user.localId, 10)
    : undefined;

  const { data: sesionesLocal } = useGetAllSesionesLocalQuery(
    {
      page: 1,
      query: {
        localId: localIdParaConsultar || undefined,
        abierta: true,
      },
    },
    { skip: !isAdmin || !localIdParaConsultar }
  );

  const haySesionAbiertaPorOtroUsuario = () => {
    if (!currentUserId || !localIdParaConsultar || !sesionesLocal) {
      return false;
    }

    const sesionesAbiertas = sesionesLocal.data.filter(
      (sesion) =>
        sesion.abierta &&
        sesion.localId === localIdParaConsultar &&
        sesion.userId !== currentUserId
    );

    return sesionesAbiertas.length > 0;
  };

  const puedeRealizarVentas = () => {
    if (!isAdmin) {
      return sesionActivaUsuarioActual?.abierta === true;
    }

    return !haySesionAbiertaPorOtroUsuario();
  };

  const getSesionAbiertaPorOtroUsuario = () => {
    if (!currentUserId || !localIdParaConsultar || !sesionesLocal) {
      return null;
    }

    return (
      sesionesLocal.data.find(
        (sesion) =>
          sesion.abierta &&
          sesion.localId === localIdParaConsultar &&
          sesion.userId !== currentUserId
      ) || null
    );
  };

  return {
    sesionActivaUsuarioActual,
    haySesionAbiertaPorOtroUsuario: haySesionAbiertaPorOtroUsuario(),
    puedeRealizarVentas: puedeRealizarVentas(),
    sesionAbiertaPorOtroUsuario: getSesionAbiertaPorOtroUsuario(),
    isLoading: false,
  };
};
