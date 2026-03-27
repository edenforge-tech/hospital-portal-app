'use client';

import React, { useState } from 'react';
import { RoleTemplateGalleryProps, RoleTemplateDto, TemplateCategory } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  StarIcon,
  ShieldIcon,
  UserIcon,
  CogIcon,
  HeartIcon,
  ClipboardIcon,
  FilterIcon,
  FileTextIcon
} from 'lucide-react';

export const RoleTemplateGallery: React.FC<RoleTemplateGalleryProps> = ({
  templates,
  onSelectTemplate,
  selectedCategory,
  onCategoryChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryIcon = (category: TemplateCategory) => {
    switch (category) {
      case TemplateCategory.Medical:
        return <HeartIcon className="w-4 h-4" />;
      case TemplateCategory.Administrative:
        return <ClipboardIcon className="w-4 h-4" />;
      case TemplateCategory.IT:
        return <CogIcon className="w-4 h-4" />;
      case TemplateCategory.Security:
        return <ShieldIcon className="w-4 h-4" />;
      case TemplateCategory.Support:
        return <UserIcon className="w-4 h-4" />;
      default:
        return <FileTextIcon className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: TemplateCategory) => {
    switch (category) {
      case TemplateCategory.Medical:
        return 'bg-red-100 text-red-800 border-red-200';
      case TemplateCategory.Administrative:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TemplateCategory.IT:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case TemplateCategory.Security:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TemplateCategory.Support:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = Object.values(TemplateCategory).reduce((acc, category) => {
    acc[category] = templates.filter(t => t.category === category).length;
    return acc;
  }, {} as Record<TemplateCategory, number>);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileTextIcon className="w-5 h-5" />
          <span>Role Templates</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose from pre-configured role templates to quickly create new roles
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
            className="flex items-center space-x-1"
          >
            <span>All</span>
            <Badge variant="secondary" className="ml-1">
              {templates.length}
            </Badge>
          </Button>
          
          {Object.values(TemplateCategory).map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className="flex items-center space-x-1"
            >
              {getCategoryIcon(category)}
              <span>{category}</span>
              <Badge variant="secondary" className="ml-1">
                {categoryCounts[category]}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedCategory 
              ? 'Try adjusting your search or filter criteria' 
              : 'No role templates are available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {template.name}
                  </h3>
                </div>
                
                {template.isSystemTemplate && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <StarIcon className="w-3 h-3" />
                    <span>System</span>
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ShieldIcon className="w-3 h-3" />
                  <span>{template.previewPermissions?.length || 0} permissions</span>
                </div>
              </div>

              {/* Permission Preview */}
              {template.previewPermissions && template.previewPermissions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Included permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.previewPermissions.slice(0, 3).map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {template.previewPermissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.previewPermissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <Button 
                  size="sm" 
                  variant="default" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template);
                  }}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};