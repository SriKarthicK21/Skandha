import { useGRC } from '../context/GRCContext';
import { GlobalTheme } from '../types';

/**
 * Enterprise UI & Layout Domain Store
 */
export function useUIStore() {
  const {
    theme,
    toggleTheme,
    activeModule,
    setActiveModule,
    entityDrawerState,
    openEntityDrawer,
    closeEntityDrawer,
    navigateEntityDrawerBack,
    productMode,
    setProductMode,
    activePersona,
    setActivePersona
  } = useGRC();

  return {
    theme,
    toggleTheme,
    activeModule,
    setActiveModule,
    entityDrawerState,
    openEntityDrawer,
    closeEntityDrawer,
    navigateEntityDrawerBack,
    productMode,
    setProductMode,
    activePersona,
    setActivePersona
  };
}

export default useUIStore;
