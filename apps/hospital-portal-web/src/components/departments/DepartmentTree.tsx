'use client';
'use client';
import React, { useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Building2, Users, ChevronDown, ChevronRight, MoreVertical } from 'lucide-react';
import { useConfirmation } from '@/components/common/ConfirmationDialog';

interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  departmentType: string;
  parentDepartmentId: string | null;
  departmentHeadId: string | null;
  is24x7: boolean;
  requiresApproval: boolean;
  status: string;
  _staffCount?: number;
}

interface DepartmentTreeProps {
  departments: Department[];
  onMove: (departmentId: string, newParentId: string | null) => Promise<void>;
  onViewStaff: (department: Department) => void;
  onEdit: (department: Department) => void;
}

// Helper function to build tree structure
const buildTree = (departments: Department[]): Department[] => {
  const departmentMap = new Map<string, Department & { children: Department[] }>();
  
  // Initialize map
  departments.forEach(dept => {
    departmentMap.set(dept.id, { ...dept, children: [] });
  });
  
  const roots: (Department & { children: Department[] })[] = [];
  
  // Build parent-child relationships
  departments.forEach(dept => {
    const deptWithChildren = departmentMap.get(dept.id)!;
    if (dept.parentDepartmentId) {
      const parent = departmentMap.get(dept.parentDepartmentId);
      if (parent) {
        parent.children.push(deptWithChildren);
      } else {
        roots.push(deptWithChildren);
      }
    } else {
      roots.push(deptWithChildren);
    }
  });
  
  return roots;
};

// Color coding by department type
const getDepartmentColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Emergency': 'bg-red-100 border-red-300 text-red-900',
    'Cardiology': 'bg-pink-100 border-pink-300 text-pink-900',
    'Surgery': 'bg-blue-100 border-blue-300 text-blue-900',
    'Pediatrics': 'bg-yellow-100 border-yellow-300 text-yellow-900',
    'Laboratory': 'bg-green-100 border-green-300 text-green-900',
    'Radiology': 'bg-purple-100 border-purple-300 text-purple-900',
    'default': 'bg-gray-100 border-gray-300 text-gray-900'
  };
  return colors[type] || colors.default;
};

const DepartmentCard: React.FC<{
  department: Department & { children?: Department[] };
  onViewStaff: (dept: Department) => void;
  onEdit: (dept: Department) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hasChildren: boolean;
}> = ({ department, onViewStaff, onEdit, isExpanded, onToggleExpand, hasChildren }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className={`relative p-4 rounded-lg border-2 shadow-md min-w-[280px] ${getDepartmentColor(department.departmentType)}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <div>
            <div className="font-semibold text-sm">{department.departmentName}</div>
            <div className="text-xs opacity-75">{department.departmentCode}</div>
          </div>
        </div>
        
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-white/30 rounded"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4 text-xs mb-2">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{department._staffCount || 0} staff</span>
        </div>
        {department.is24x7 && (
          <span className="px-2 py-0.5 bg-white/30 rounded-full">24/7</span>
        )}
        {department.requiresApproval && (
          <span className="px-2 py-0.5 bg-white/30 rounded-full">Approval</span>
        )}
      </div>
      
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          department.status === 'active' ? 'bg-green-500/20' : 'bg-gray-500/20'
        }`}>
          {department.status}
        </span>
        
        {hasChildren && (
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-white/30 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-0 top-12 mt-1 bg-white rounded-lg shadow-lg border z-10 min-w-[150px]">
          <button
            onClick={() => {
              onViewStaff(department);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-lg"
          >
            View Staff
          </button>
          <button
            onClick={() => {
              onEdit(department);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-lg"
          >
            Edit Department
          </button>
        </div>
      )}
    </div>
  );
};

const DepartmentTreeNode: React.FC<{
  department: Department & { children?: Department[] };
  onViewStaff: (dept: Department) => void;
  onEdit: (dept: Department) => void;
}> = ({ department, onViewStaff, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = department.children && department.children.length > 0;
  
  return (
    <TreeNode
      label={
        <DepartmentCard
          department={department}
          onViewStaff={onViewStaff}
          onEdit={onEdit}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
          hasChildren={!!hasChildren}
        />
      }
    >
      {isExpanded && hasChildren && department.children!.map(child => (
        <DepartmentTreeNode
          key={child.id}
          department={child}
          onViewStaff={onViewStaff}
          onEdit={onEdit}
        />
      ))}
    </TreeNode>
  );
};

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({
  departments,
  onMove,
  onViewStaff,
  onEdit
}) => {
  const { showConfirmation, ConfirmationComponent } = useConfirmation();
  const [isDragging, setIsDragging] = useState(false);
  
  const tree = buildTree(departments);
  
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    const departmentId = result.draggableId;
    const newParentId = result.destination.droppableId === 'root' ? null : result.destination.droppableId;
    
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    
    // Don't move if already in the same parent
    if (department.parentDepartmentId === newParentId) return;
    
    // Confirm move
    const targetName = newParentId ? departments.find(d => d.id === newParentId)?.departmentName : 'root level';
    showConfirmation({
      title: 'Move Department',
      message: `Move "${department.departmentName}" to ${targetName}?`,
      variant: 'info',
      confirmText: 'Move',
      onConfirm: async () => {
        try {
          await onMove(departmentId, newParentId);
        } catch (error: any) {
          alert(error.message || 'Failed to move department. This may create a circular reference.');
        }
      },
    });
  };
  
  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Building2 className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No departments found</p>
        <p className="text-sm">Create your first department to get started</p>
      </div>
    );
  }
  
  return (
    <DragDropContext
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
    >
      <ConfirmationComponent />
      <div className={`overflow-auto p-8 ${isDragging ? 'bg-blue-50' : ''}`}>
        <Tree
          lineWidth="2px"
          lineColor="#94a3b8"
          lineBorderRadius="10px"
          label={
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Department Hierarchy</h3>
              <p className="text-sm text-gray-600">Drag departments to reorganize</p>
            </div>
          }
        >
          {tree.map(dept => (
            <DepartmentTreeNode
              key={dept.id}
              department={dept}
              onViewStaff={onViewStaff}
              onEdit={onEdit}
            />
          ))}
        </Tree>
      </div>
    </DragDropContext>
  );
};
