'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  Settings,
  Map,
  Navigation,
  Phone,
  Mail,
  Clock,
  Wheelchair,
  Car,
  Wifi,
  Coffee,
  Shield,
  Heart,
  Stethoscope,
  Download,
  Upload,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  Location, 
  Facility,
  Organization,
  organizationsEnhancedApi 
} from '@/lib/api/organizations-enhanced.api';
import { LocationFormModal } from './LocationFormModal';

interface LocationManagementProps {
  locations: Location[];
  organizations: Organization[];
  onLocationUpdate: () => Promise<void>;
}

export const LocationManagement: React.FC<LocationManagementProps> = ({
  locations,
  organizations,
  onLocationUpdate
}) => {
  // State Management
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('grid');

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    organization: '',
    accessibility: '',
    services: ''
  });

  // Filtered locations based on search and filters
  const filteredLocations = locations.filter(location => {
    const matchesSearch = !searchQuery || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !filters.type || location.type === filters.type;
    const matchesStatus = !filters.status || location.status === filters.status;
    const matchesOrganization = !filters.organization || 
      location.organizationId === filters.organization;
    const matchesAccessibility = !filters.accessibility || 
      location.accessibility.wheelchairAccessible.toString() === filters.accessibility;
    const matchesServices = !filters.services ||
      location.services.some(service => service.toLowerCase().includes(filters.services.toLowerCase()));

    return matchesSearch && matchesType && matchesStatus && matchesOrganization && 
           matchesAccessibility && matchesServices;
  });

  const handleLocationAction = async (action: string, location: Location) => {
    switch (action) {
      case 'edit':
        setSelectedLocation(location);
        setShowFormModal(true);
        break;
      case 'duplicate':
        const duplicatedLocation = { 
          ...location, 
          name: `${location.name} (Copy)`, 
          id: undefined 
        };
        setSelectedLocation(duplicatedLocation);
        setShowFormModal(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete the location "${location.name}"?`)) {
          try {
            await organizationsEnhancedApi.deleteLocation(location.id);
            await onLocationUpdate();
          } catch (error) {
            console.error('Error deleting location:', error);
          }
        }
        break;
      case 'view':
        setSelectedLocation(location);
        // Could open a detailed view modal
        break;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Under Construction': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Main Campus': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Branch Office': return 'bg-green-100 text-green-800 border-green-200';
      case 'Satellite Clinic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Emergency Center': return 'bg-red-100 text-red-800 border-red-200';
      case 'Outpatient': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Imaging Center': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceIcon = (service: string) => {
    const serviceLower = service.toLowerCase();
    if (serviceLower.includes('emergency')) return <Heart className="w-4 h-4 text-red-500" />;
    if (serviceLower.includes('cardiology')) return <Heart className="w-4 h-4 text-pink-500" />;
    if (serviceLower.includes('general')) return <Stethoscope className="w-4 h-4 text-blue-500" />;
    if (serviceLower.includes('imaging')) return <Eye className="w-4 h-4 text-purple-500" />;
    if (serviceLower.includes('surgery')) return <Shield className="w-4 h-4 text-green-500" />;
    return <Stethoscope className="w-4 h-4 text-gray-500" />;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'parking': return <Car className="w-4 h-4 text-blue-500" />;
      case 'wifi': return <Wifi className="w-4 h-4 text-green-500" />;
      case 'cafeteria': return <Coffee className="w-4 h-4 text-orange-500" />;
      case 'wheelchair_accessible': return <Wheelchair className="w-4 h-4 text-purple-500" />;
      default: return <Building className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatOperatingHours = (hours: Location['operatingHours']) => {
    if (hours.is24Hours) return '24/7';
    return `${hours.openTime} - ${hours.closeTime}`;
  };

  // Statistics
  const stats = {
    total: locations.length,
    active: locations.filter(l => l.status === 'Active').length,
    types: [...new Set(locations.map(l => l.type))].length,
    organizations: [...new Set(locations.map(l => l.organizationId))].length,
    totalCapacity: locations.reduce((sum, l) => sum + l.capacity.totalBeds, 0),
    accessibleLocations: locations.filter(l => l.accessibility.wheelchairAccessible).length
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-7 h-7 text-blue-600 mr-3" />
            Location Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage facilities, addresses, and location-specific services
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => organizationsEnhancedApi.exportLocations('xlsx')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={() => {
              setSelectedLocation(null);
              setShowFormModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.types}</div>
            <div className="text-sm text-gray-600">Location Types</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.organizations}</div>
            <div className="text-sm text-gray-600">Organizations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-600">{stats.totalCapacity}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.accessibleLocations}</div>
            <div className="text-sm text-gray-600">Accessible</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search locations, addresses, or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.type} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Main Campus">Main Campus</SelectItem>
                  <SelectItem value="Branch Office">Branch Office</SelectItem>
                  <SelectItem value="Satellite Clinic">Satellite Clinic</SelectItem>
                  <SelectItem value="Emergency Center">Emergency Center</SelectItem>
                  <SelectItem value="Outpatient">Outpatient</SelectItem>
                  <SelectItem value="Imaging Center">Imaging Center</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.organization} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, organization: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.accessibility} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, accessibility: value }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Accessibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Accessible</SelectItem>
                  <SelectItem value="false">Not Accessible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {location.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getStatusBadgeColor(location.status)}>
                            {location.status}
                          </Badge>
                          <Badge className={getTypeBadgeColor(location.type)}>
                            {location.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{location.code}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleLocationAction('view', location)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLocationAction('edit', location)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Location
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleLocationAction('duplicate', location)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleLocationAction('delete', location)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <div>{location.address.street}</div>
                          <div>
                            {location.address.city}, {location.address.state} {location.address.zipCode}
                          </div>
                          {location.address.country !== 'United States' && (
                            <div>{location.address.country}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1">
                      {location.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {location.phone}
                        </div>
                      )}
                      {location.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {location.email}
                        </div>
                      )}
                    </div>

                    {/* Operating Hours */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatOperatingHours(location.operatingHours)}
                    </div>

                    {/* Capacity */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{location.capacity.totalBeds}</div>
                        <div className="text-gray-600">Beds</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{location.capacity.availableBeds}</div>
                        <div className="text-gray-600">Available</div>
                      </div>
                    </div>

                    {/* Services */}
                    {location.services.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">Services</div>
                        <div className="flex flex-wrap gap-1">
                          {location.services.slice(0, 3).map((service, index) => (
                            <div key={index} className="flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {getServiceIcon(service)}
                              <span className="ml-1">{service}</span>
                            </div>
                          ))}
                          {location.services.length > 3 && (
                            <div className="text-xs text-gray-500 px-2 py-1">
                              +{location.services.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Accessibility */}
                    {location.accessibility.wheelchairAccessible && (
                      <div className="flex items-center text-sm text-green-600">
                        <Wheelchair className="w-4 h-4 mr-2" />
                        Wheelchair Accessible
                      </div>
                    )}

                    {/* Facilities */}
                    {location.facilities.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-2">Facilities</div>
                        <div className="flex flex-wrap gap-1">
                          {location.facilities.slice(0, 4).map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility.name}
                            </Badge>
                          ))}
                          {location.facilities.length > 4 && (
                            <span className="text-xs text-gray-500 px-2">
                              +{location.facilities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2">
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusBadgeColor(location.status)} variant="outline">
                            {location.status}
                          </Badge>
                          <Badge className={getTypeBadgeColor(location.type)} variant="outline">
                            {location.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{location.code}</p>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900">Address</div>
                        <div className="text-sm text-gray-600">
                          {location.address.street}
                          <br />
                          {location.address.city}, {location.address.state}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900">Capacity</div>
                        <div className="text-sm text-gray-600">
                          {location.capacity.availableBeds}/{location.capacity.totalBeds} beds
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round((location.capacity.availableBeds / location.capacity.totalBeds) * 100)}% available
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900">Contact</div>
                        {location.phone && (
                          <div className="text-sm text-gray-600">{location.phone}</div>
                        )}
                        {location.email && (
                          <div className="text-sm text-gray-600">{location.email}</div>
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-900">Services</div>
                        <div className="text-sm text-gray-600">
                          {location.services.slice(0, 2).join(', ')}
                          {location.services.length > 2 && ` (+${location.services.length - 2} more)`}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleLocationAction('view', location)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLocationAction('edit', location)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleLocationAction('duplicate', location)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleLocationAction('delete', location)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Map View */}
        <TabsContent value="map" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="w-5 h-5 mr-2" />
                Location Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Map integration would be implemented here</p>
                  <p className="text-sm text-gray-500">
                    Showing {filteredLocations.length} locations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* No Results */}
      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No locations found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => f)
                ? 'No locations match your current filters.'
                : 'No locations have been created yet.'}
            </p>
            <Button onClick={() => {
              setSelectedLocation(null);
              setShowFormModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Location
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Location Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <LocationFormModal
            location={selectedLocation}
            organizations={organizations}
            onSave={async (locationData) => {
              try {
                if (selectedLocation?.id) {
                  await organizationsEnhancedApi.updateLocation(selectedLocation.id, locationData);
                } else {
                  await organizationsEnhancedApi.createLocation(locationData);
                }
                await onLocationUpdate();
                setShowFormModal(false);
                setSelectedLocation(null);
              } catch (error) {
                console.error('Error saving location:', error);
              }
            }}
            onCancel={() => {
              setShowFormModal(false);
              setSelectedLocation(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationManagement;