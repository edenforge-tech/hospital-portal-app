'use client';

import React, { useState, useMemo } from 'react';
import { Check, X, Search, Filter, ChevronDown, ChevronRight, Eye, Shield, Users, Layers } from 'lucide-react';

// ============================================================================
// INTERFACES
// ============================================================================

interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  action: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  userCount?: number;
  isActive?: boolean;
}

interface PermissionMatrixProps {
  permissions: Permission[];
  roles: Role[];
  rolePermissions: Map<string, string[]>;
  onTogglePermission: (roleId: string, permissionId: string, hasPermission: boolean) => void;
  readonly?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PermissionMatrix({
  permissions,
  roles,
  rolePermissions,
  onTogglePermission,
  readonly = false
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<{ roleId: string; permId: string } | null>(null);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const grouped = new Map<string, Permission[]>();
    permissions.forEach(perm => {
      const module = perm.module || 'Other';
      if (!grouped.has(module)) {
        grouped.set(module, []);
      }
      grouped.get(module)!.push(perm);
    });
    // Sort permissions within each module by name
    grouped.forEach((perms, module) => {
      grouped.set(module, perms.sort((a, b) => a.name.localeCompare(b.name)));
    });
    return grouped;
  }, [permissions]);

  const modules = useMemo(() => 
    Array.from(permissionsByModule.keys()).sort(),
    [permissionsByModule]
  );

  // Filter permissions based on search and module selection
  const filteredPermissions = useMemo(() => {
    let filtered = permissions;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.module.toLowerCase().includes(query)
      );
    }
    
    if (selectedModule !== 'all') {
      filtered = filtered.filter(p => p.module === selectedModule);
    }
    
    return filtered;
  }, [permissions, searchQuery, selectedModule]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPerms = permissions.length;
    const totalRoles = roles.length;
    let totalAssignments = 0;
    let maxPermsPerRole = 0;
    let minPermsPerRole = totalPerms;

    roles.forEach(role => {
      const rolePerms = rolePermissions.get(role.id)?.length || 0;
      totalAssignments += rolePerms;
      maxPermsPerRole = Math.max(maxPermsPerRole, rolePerms);
      minPermsPerRole = Math.min(minPermsPerRole, rolePerms);
    });

    return {
      totalPermissions: totalPerms,
      totalRoles,
      totalAssignments,
      avgPermsPerRole: Math.round(totalAssignments / totalRoles) || 0,
      maxPermsPerRole,
      minPermsPerRole,
      coveragePercent: Math.round((totalAssignments / (totalPerms * totalRoles)) * 100) || 0
    };
  }, [permissions, roles, rolePermissions]);

  const toggleModule = (module: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(module)) {
        newSet.delete(module);
      } else {
        newSet.add(module);
      }
      return newSet;
    });
  };

  const expandAllModules = () => {
    setExpandedModules(new Set(modules));
  };

  const collapseAllModules = () => {
    setExpandedModules(new Set());
  };

  const formatModuleName = (module: string) => {
    return module
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const hasPermission = (roleId: string, permissionId: string): boolean => {
    return rolePermissions.get(roleId)?.includes(permissionId) || false;
  };

  const getModulePermissionCount = (roleId: string, module: string): number => {
    const modulePerms = permissionsByModule.get(module) || [];
    return modulePerms.filter(p => hasPermission(roleId, p.id)).length;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-900">Total Permissions</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalPermissions}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-900">Total Roles</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.totalRoles}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-900">Assignments</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{stats.totalAssignments}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-orange-600" />
            <span className="text-sm text-orange-900">Avg Per Role</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{stats.avgPermsPerRole}</div>
        </div>
        <div className="bg-cyan-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-cyan-900">Max/Min</span>
          </div>
          <div className="text-xl font-bold text-cyan-900">{stats.maxPermsPerRole}/{stats.minPermsPerRole}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-900">Coverage</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.coveragePercent}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Modules</option>
              {modules.map(module => (
                <option key={module} value={module}>{formatModuleName(module)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAllModules}
              className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllModules}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-[250px] sticky left-0 bg-gray-100 z-20">
                  Permission
                </th>
                {roles.map(role => (
                  <th 
                    key={role.id} 
                    className="px-3 py-3 text-center font-semibold text-gray-900 min-w-[100px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="truncate max-w-[100px]" title={role.name}>
                        {role.name}
                      </span>
                      {role.userCount !== undefined && (
                        <span className="text-xs text-gray-500 font-normal">
                          ({role.userCount} users)
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(module => {
                const modulePerms = permissionsByModule.get(module) || [];
                const isExpanded = expandedModules.has(module);
                
                // Filter module permissions
                const filteredModulePerms = selectedModule === 'all' || selectedModule === module
                  ? modulePerms.filter(p => 
                      !searchQuery || 
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.code.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  : [];
                
                if (filteredModulePerms.length === 0 && selectedModule !== 'all') return null;
                
                return (
                  <React.Fragment key={module}>
                    {/* Module Header Row */}
                    <tr className="bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleModule(module)}>
                      <td className="px-4 py-2 font-medium text-gray-700 sticky left-0 bg-gray-50 hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                          <span>{formatModuleName(module)}</span>
                          <span className="text-xs text-gray-500">({modulePerms.length} perms)</span>
                        </div>
                      </td>
                      {roles.map(role => (
                        <td key={role.id} className="px-3 py-2 text-center">
                          <span className="text-xs font-medium text-gray-600">
                            {getModulePermissionCount(role.id, module)}/{modulePerms.length}
                          </span>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Permission Rows (when expanded) */}
                    {isExpanded && filteredModulePerms.map((perm, idx) => (
                      <tr 
                        key={perm.id} 
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                      >
                        <td className={`px-4 py-2 pl-10 sticky left-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{perm.name}</span>
                            <span className="text-xs text-gray-500 font-mono">{perm.code}</span>
                          </div>
                        </td>
                        {roles.map(role => {
                          const hasPerm = hasPermission(role.id, perm.id);
                          const isHovered = hoveredCell?.roleId === role.id && hoveredCell?.permId === perm.id;
                          
                          return (
                            <td 
                              key={role.id} 
                              className="px-3 py-2 text-center"
                              onMouseEnter={() => setHoveredCell({ roleId: role.id, permId: perm.id })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              <button
                                onClick={() => !readonly && onTogglePermission(role.id, perm.id, hasPerm)}
                                disabled={readonly}
                                className={`
                                  w-8 h-8 rounded-lg flex items-center justify-center transition-all
                                  ${hasPerm 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                  }
                                  ${isHovered ? 'ring-2 ring-blue-400' : ''}
                                  ${readonly ? 'cursor-default' : 'cursor-pointer'}
                                `}
                                title={`${role.name}: ${hasPerm ? 'Has' : 'Missing'} ${perm.name}`}
                              >
                                {hasPerm ? (
                                  <Check className="h-5 w-5" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Check className="h-5 w-5 text-green-700" />
          </div>
          <span>Permission Granted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <X className="h-4 w-4 text-gray-400" />
          </div>
          <span>Permission Not Granted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">3/5</span>
          <span>Module Summary (assigned/total)</span>
        </div>
      </div>
    </div>
  );
}

export default PermissionMatrix;
