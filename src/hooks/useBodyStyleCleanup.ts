import { useEffect } from 'react';

/**
 * Hook para limpiar estilos del body que pueden quedar atascados
 * al redimensionar la ventana o abrir devtools con modales/drawers abiertos
 */
export const useBodyStyleCleanup = () => {
  useEffect(() => {
    const cleanBodyStyles = () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };

    // Limpiar en cada resize
    window.addEventListener('resize', cleanBodyStyles);
    
    // Limpiar al desmontar el componente
    return () => {
      window.removeEventListener('resize', cleanBodyStyles);
      cleanBodyStyles();
    };
  }, []);
};
