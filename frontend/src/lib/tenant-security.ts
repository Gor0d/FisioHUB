// Tenant Security Utilities for Frontend

/**
 * Generate a secure public ID from a slug (client-side version)
 * This matches the backend SlugSecurity.generatePublicId()
 */
export function generatePublicId(slug: string): string {
  // This is a client-side approximation
  // In production, this should come from the API
  
  // Simple hash function for demonstration
  let hash = 0;
  const salt = 'fisiohub-public-2025';
  const input = slug + salt;
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to base64-like string and take first 12 chars
  const base64 = btoa(Math.abs(hash).toString()).replace(/[+/=]/g, '').substring(0, 12);
  return base64;
}

/**
 * Validate if a public ID has the correct format
 */
export function isValidPublicId(publicId: string): boolean {
  return /^[A-Za-z0-9_-]{12}$/.test(publicId);
}

/**
 * Check if a slug parameter is actually a publicId or legacy slug
 */
export function isPublicId(param: string): boolean {
  return isValidPublicId(param);
}

/**
 * Legacy slug patterns (for backward compatibility)
 */
export function isLegacySlug(param: string): boolean {
  return /^[a-z0-9-]+$/.test(param) && param.length > 12;
}

/**
 * Get the appropriate API endpoint based on ID type
 */
export function getTenantApiEndpoint(idOrSlug: string): string {
  if (isPublicId(idOrSlug)) {
    return `/api/secure/${idOrSlug}`;
  } else {
    // Legacy support - still works but not recommended
    return `/api/tenants/${idOrSlug}`;
  }
}

/**
 * Known public ID mappings (temporary, until all tenants are migrated)
 */
export const TENANT_PUBLIC_IDS = {
  'hospital-galileu': '0li0k7HNQslV',
  'hospital-marateste': 'x1HVX4TgxwLZ',
  // Add more as tenants are created
} as const;

/**
 * Convert legacy slug to public ID if known
 */
export function getPublicIdFromSlug(slug: string): string | null {
  return TENANT_PUBLIC_IDS[slug as keyof typeof TENANT_PUBLIC_IDS] || null;
}

/**
 * Generate frontend URLs with public IDs
 */
export function generateTenantUrls(publicId: string) {
  const base = `/t/${publicId}`;
  
  return {
    home: base,
    dashboard: `${base}/dashboard`,
    patients: `${base}/patients`,
    newPatient: `${base}/patients/new`,
    patient: (id: string) => `${base}/patients/${id}`,
    settings: `${base}/settings`,
  };
}

/**
 * Tenant context type for React components
 */
export interface TenantContext {
  publicId: string;
  slug?: string; // For backward compatibility
  name?: string;
  isActive: boolean;
  plan: string;
  urls: ReturnType<typeof generateTenantUrls>;
}

// Mock data for Hospital Galileu when API is not available
export function getMockTenantData(publicId: string): any | null {
  const mockData: Record<string, any> = {
    '0li0k7HNQslV': {
      id: 'tenant_galileu_2025',
      name: 'Hospital Galileu',
      publicId: '0li0k7HNQslV',
      slug: 'hospital-galileu',
      status: 'active',
      plan: 'professional',
      isActive: true,
      metadata: {
        specialty: 'fisioterapia_hospitalar',
        features: ['indicators', 'mrc_barthel', 'evolutions']
      }
    }
  };

  return mockData[publicId] || null;
}

/**
 * Create tenant context from public ID
 */
export function createTenantContext(publicId: string, data?: any): TenantContext {
  // If no data provided, try to use mock data for known tenants
  if (!data && publicId === '0li0k7HNQslV') {
    data = getMockTenantData(publicId);
  }

  return {
    publicId,
    slug: data?.slug,
    name: data?.name,
    isActive: data?.isActive ?? true,
    plan: data?.plan ?? 'basic',
    urls: generateTenantUrls(publicId)
  };
}