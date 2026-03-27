'use client';

import React, { useState, useMemo } from 'react';
import { X, Users, Mail, Building, Shield, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface DepartmentStaff {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string | null;
  userType: string;
  userStatus: string;
  isPrimary: boolean;
  accessLevel: string | null;
}

interface DepartmentStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  staff: DepartmentStaff[];
  loading: boolean;
}

type SortField = 'name' | 'email' | 'designation' | 'userType' | 'accessLevel';
type SortDirection = 'asc' | 'desc';

export const DepartmentStaffModal: React.FC<DepartmentStaffModalProps> = ({
  isOpen,
  onClose,
  departmentName,
  staff,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const filteredAndSortedStaff = useMemo(() => {
    let result = [...staff];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.userName.toLowerCase().includes(term) ||
        (s.designation?.toLowerCase().includes(term) || false)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let aValue: string, bValue: string;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'designation':
          aValue = a.designation || '';
          bValue = b.designation || '';
          break;
        case 'userType':
          aValue = a.userType;
          bValue = b.userType;
          break;
        case 'accessLevel':
          aValue = a.accessLevel || '';
          bValue = b.accessLevel || '';
          break;
        default:
          aValue = '';
          bValue = '';
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [staff, searchTerm, sortField, sortDirection]);
  
  if (!isOpen) return null;
  
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Department Staff
            </h2>
            <p className="text-sm text-gray-600 mt-1">{departmentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or designation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAndSortedStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Users className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">
                {staff.length === 0 ? 'No staff assigned' : 'No matching staff found'}
              </p>
              {staff.length === 0 && (
                <p className="text-sm">Assign staff members to this department to see them here</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Email <SortIcon field="email" />
                  </th>
                  <th
                    onClick={() => handleSort('designation')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Designation <SortIcon field="designation" />
                  </th>
                  <th
                    onClick={() => handleSort('userType')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Type <SortIcon field="userType" />
                  </th>
                  <th
                    onClick={() => handleSort('accessLevel')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Access Level <SortIcon field="accessLevel" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {member.firstName} {member.lastName}
                            {member.isPrimary && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">@{member.userName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Building className="h-4 w-4 text-gray-400" />
                        {member.designation || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.userType === 'Doctor'
                          ? 'bg-purple-100 text-purple-800'
                          : member.userType === 'Nurse'
                          ? 'bg-blue-100 text-blue-800'
                          : member.userType === 'Admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Shield className="h-4 w-4 text-gray-400" />
                        {member.accessLevel || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.userStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : member.userStatus === 'inactive'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.userStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedStaff.length} of {staff.length} staff members
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
