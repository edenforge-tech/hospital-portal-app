import { getApi } from '../api';

// ============================================================================
// Service Catalog V2 — TypeScript interfaces
// ============================================================================

export interface ServiceVariantDto {
  id: string;
  code: string;
  name: string;
  price: number;
  priceType: 'PER_EYE' | 'BOTH_EYES' | 'FIXED';
  hasIolOptions: boolean;
  displayOrder: number;
  isActive: boolean;
  /** Internal brand/sub-type choices. Null when no sub-options exist. Staff-only — not shown to patient or insurance. */
  subOptions?: string[] | null;
}

export interface CatalogServiceDto {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  variants: ServiceVariantDto[];
}

export interface ServiceCategoryDto {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  services: CatalogServiceDto[];
}

export interface IolMasterDto {
  id: string;
  modelName: string;
  brandManufacturer: string;
  iolType: string;
  origin: 'Indian' | 'Imported';
  price: number;
  isDefault: boolean;
}

export interface FullCatalogResponse {
  categories: ServiceCategoryDto[];
}

export interface BranchVariantPricingDto {
  variantId: string;
  amount: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isActive: boolean;
}

/** Variant enriched with its parent category/service info — used for flat lists in dropdowns */
export interface FlatVariantDto extends ServiceVariantDto {
  categoryCode: string;
  categoryName: string;
  serviceName: string;
}

/** Flatten a FullCatalogResponse into a single array of FlatVariantDto */
export function flattenCatalog(catalog: FullCatalogResponse): FlatVariantDto[] {
  return catalog.categories.flatMap(cat =>
    cat.services.flatMap(svc =>
      svc.variants.map(v => ({
        ...v,
        categoryCode: cat.code,
        categoryName: cat.name,
        serviceName: svc.name,
      }))
    )
  );
}

// ============================================================================
// API functions
// ============================================================================

export const serviceCatalogApi = {
  /** Full catalog tree: categories → services → variants */
  async getFullCatalog(): Promise<FullCatalogResponse> {
    const api = getApi();
    const res = await api.get<FullCatalogResponse>('/servicecatalog/full');
    return res.data;
  },

  /** Flat list of active categories */
  async getCategories(): Promise<ServiceCategoryDto[]> {
    const api = getApi();
    const res = await api.get<ServiceCategoryDto[]>('/servicecatalog/categories');
    return res.data;
  },

  /** IOL options for a specific service variant */
  async getVariantIolOptions(variantId: string): Promise<IolMasterDto[]> {
    const api = getApi();
    const res = await api.get<IolMasterDto[]>(`/servicecatalog/variants/${variantId}/iol`);
    return res.data;
  },

  /** Branch-specific price overrides */
  async getBranchPricing(branchId: string): Promise<BranchVariantPricingDto[]> {
    const api = getApi();
    const res = await api.get<BranchVariantPricingDto[]>(`/servicecatalog/branch/${branchId}/pricing`);
    return res.data;
  },
};

/** Return a human-readable price suffix based on priceType */
export function priceSuffix(priceType: ServiceVariantDto['priceType']): string {
  if (priceType === 'PER_EYE') return '/eye';
  if (priceType === 'BOTH_EYES') return '/both eyes';
  return '';
}

