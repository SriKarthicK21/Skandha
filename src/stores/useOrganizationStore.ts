import { useGRC } from '../context/GRCContext';
import {
  TenantCompany,
  AssetRecord,
  DataAssetRecord,
  VendorRecord,
  MasterDepartment
} from '../types';

/**
 * Enterprise Organization & Assets Domain Store
 */
export function useOrganizationStore() {
  const {
    currentTenant,
    tenants,
    switchTenant,
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    dataAssets,
    addDataAsset,
    updateDataAsset,
    deleteDataAsset,
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    masterDepartments,
    setTenantOnboardingPhase,
    isSurveyComplete,
    isOnboardingComplete
  } = useGRC();

  const tenantAssets = assets.filter(a => !currentTenant?.id || a.tenantId === currentTenant.id);
  const tenantDataAssets = dataAssets.filter(d => !currentTenant?.id || d.tenantId === currentTenant.id);
  const tenantVendors = vendors.filter(v => !currentTenant?.id || v.tenantId === currentTenant.id);

  return {
    organization: currentTenant,
    allOrganizations: tenants,
    switchOrganization: switchTenant,
    assets: tenantAssets,
    allAssets: assets,
    addAsset,
    updateAsset,
    deleteAsset,
    dataAssets: tenantDataAssets,
    allDataAssets: dataAssets,
    addDataAsset,
    updateDataAsset,
    deleteDataAsset,
    vendors: tenantVendors,
    allVendors: vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    departments: masterDepartments,
    setTenantOnboardingPhase,
    isSurveyComplete,
    isOnboardingComplete
  };
}

export default useOrganizationStore;
