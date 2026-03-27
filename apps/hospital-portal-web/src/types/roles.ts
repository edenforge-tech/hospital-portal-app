// Role Management Types for Frontend
export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  users?: User[];
  permissions?: Permission[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  category: string;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  configuration: any; // JSONB field with permissions and settings
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: string;
}

export enum TemplateCategory {
  Medical = 'Medical',
  Administrative = 'Administrative', 
  IT = 'IT',
  Security = 'Security',
  Support = 'Support'
}

export interface RoleHierarchy {
  id: string;
  parentRoleId?: string;
  childRoleId: string;
  level: number;
  path: string; // JSON array of role IDs from root to child
  inheritanceType: InheritanceType;
  inheritanceConfig?: any; // JSONB configuration
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum InheritanceType {
  InheritAll = 'inherit_all',
  InheritSelective = 'inherit_selective', 
  None = 'none'
}

export interface UserRoleHistory {
  id: string;
  userId: string;
  roleId: string;
  action: RoleAction;
  effectiveFrom?: string;
  effectiveUntil?: string;
  assignedByUserId: string;
  reason?: string;
  createdAt: string;
}

export enum RoleAction {
  Assigned = 'assigned',
  Removed = 'removed',
  Expired = 'expired',
  Revoked = 'revoked'
}

// DTOs for API responses
export interface RoleHierarchyDto {
  roleId: string;
  roleName: string;
  description?: string;
  parentRoleId?: string;
  parentRoleName?: string;
  level: number;
  inheritanceType: InheritanceType;
  children: RoleHierarchyDto[];
  permissions: string[];
}

export interface RoleTemplateDto {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  previewPermissions: string[];
  isSystemTemplate: boolean;
}

export interface InheritancePreviewDto {
  roleId: string;
  roleName: string;
  currentPermissions: string[];
  inheritedPermissions: string[];
  totalPermissions: string[];
  parentRoles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
}

// Form data types
export interface CreateRoleFromTemplateRequest {
  name: string;
  description?: string;
  parentRoleId?: string;
  inheritanceType?: InheritanceType;
  customPermissions?: string[];
}

export interface UpdateHierarchyRequest {
  parentRoleId?: string;
  inheritanceType: InheritanceType;
  inheritanceConfig?: any;
}

export interface BulkHierarchyOperation {
  roleId: string;
  parentRoleId?: string;
  inheritanceType: InheritanceType;
  inheritanceConfig?: any;
}

// Tree visualization types
export interface RoleTreeNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  children: RoleTreeNode[];
  permissions?: string[];
  userCount?: number;
  inheritanceType?: InheritanceType;
  isTemplate?: boolean;
}

// Component props types
export interface RoleTreeProps {
  roles: RoleHierarchyDto[];
  onRoleSelect: (role: RoleHierarchyDto) => void;
  onUpdateHierarchy: (roleId: string, parentRoleId?: string) => void;
  selectedRoleId?: string;
}

export interface RoleTemplateGalleryProps {
  templates: RoleTemplateDto[];
  onSelectTemplate: (template: RoleTemplateDto) => void;
  selectedCategory?: TemplateCategory;
  onCategoryChange: (category?: TemplateCategory) => void;
}

export interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  currentRoles: Role[];
  availableRoles: Role[];
  onAssignRole: (roleId: string, effectiveFrom?: string, effectiveUntil?: string) => void;
  onRemoveRole: (roleId: string, reason?: string) => void;
  loading?: boolean;
}