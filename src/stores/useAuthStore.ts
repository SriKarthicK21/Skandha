import { useGRC } from '../context/GRCContext';
import { User, UserRole, TenantCompany } from '../types';

/**
 * Enterprise Auth & Identity Domain Store
 */
export function useAuthStore() {
  const {
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    currentRole,
    currentTenantId,
    currentTenant,
    users,
    tenants,
    login,
    loginWithSessionContext,
    sessionContext,
    logout,
    switchUser,
    switchRole,
    switchTenant,
    isPreviewRoleActive,
    previewRole,
    enableRolePreview,
    disableRolePreview,
    toggleRolePreview,
    canUserAccessModule
  } = useGRC();

  return {
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    currentRole,
    currentTenantId,
    currentTenant,
    users,
    tenants,
    login,
    loginWithSessionContext,
    sessionContext,
    logout,
    switchUser,
    switchRole,
    switchTenant,
    isPreviewRoleActive,
    previewRole,
    enableRolePreview,
    disableRolePreview,
    toggleRolePreview,
    canUserAccessModule
  };
}

export default useAuthStore;
