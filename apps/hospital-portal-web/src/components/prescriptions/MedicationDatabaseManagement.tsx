'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Pill, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConfirmation } from '@/components/common/ConfirmationDialog';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandNames: string[];
  category: string;
  form: string;
  standardDosages: string[];
  description?: string;
  warnings?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categories = [
  'Antibiotic',
  'Steroid',
  'Glaucoma',
  'NSAID',
  'Anti-VEGF',
  'Mydriatic',
  'Cycloplegic',
  'Lubricant',
  'Antihistamine',
  'Anti-inflammatory',
  'Other',
];

const forms = [
  'Eye Drops',
  'Ointment',
  'Gel',
  'Injection',
  'Tablet',
  'Capsule',
  'Syrup',
  'Cream',
];

// Mock data
const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Moxifloxacin',
    genericName: 'Moxifloxacin HCl',
    brandNames: ['Vigamox', 'Moxeza'],
    category: 'Antibiotic',
    form: 'Eye Drops',
    standardDosages: ['0.5%'],
    description: 'Fourth-generation fluoroquinolone antibiotic',
    warnings: 'Avoid contact lenses during treatment',
    isActive: true,
    createdAt: new Date(2025, 0, 1),
    updatedAt: new Date(2025, 0, 1),
  },
  {
    id: '2',
    name: 'Latanoprost',
    genericName: 'Latanoprost',
    brandNames: ['Xalatan'],
    category: 'Glaucoma',
    form: 'Eye Drops',
    standardDosages: ['0.005%'],
    description: 'Prostaglandin analog for intraocular pressure reduction',
    warnings: 'May cause iris pigmentation changes',
    isActive: true,
    createdAt: new Date(2025, 0, 1),
    updatedAt: new Date(2025, 0, 1),
  },
  {
    id: '3',
    name: 'Prednisolone Acetate',
    genericName: 'Prednisolone Acetate',
    brandNames: ['Pred Forte', 'Omnipred'],
    category: 'Steroid',
    form: 'Eye Drops',
    standardDosages: ['1%'],
    description: 'Corticosteroid for ocular inflammation',
    warnings: 'Monitor intraocular pressure. May cause cataract formation.',
    isActive: true,
    createdAt: new Date(2025, 0, 1),
    updatedAt: new Date(2025, 0, 1),
  },
];

export function MedicationDatabaseManagement() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>(mockMedications);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  // Filter medications
  useEffect(() => {
    let filtered = medications;

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((m) => m.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((m) => !m.isActive);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((m) => m.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.genericName.toLowerCase().includes(query) ||
          m.brandNames.some((b) => b.toLowerCase().includes(query)) ||
          m.category.toLowerCase().includes(query)
      );
    }

    setFilteredMedications(filtered);
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, medications]);

  const handleCreateNew = () => {
    setSelectedMedication(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = (medication: Medication) => {
    setSelectedMedication(medication);
    setIsEditing(true);
    setShowFormModal(true);
  };

  const handleDeactivate = (medication: Medication) => {
    showConfirmation({
      title: 'Deactivate Medication',
      message: `Are you sure you want to deactivate ${medication.name}?`,
      variant: 'warning',
      confirmText: 'Deactivate',
      onConfirm: async () => {
        setMedications((prev) =>
          prev.map((m) => (m.id === medication.id ? { ...m, isActive: false } : m))
        );
      },
    });
  };

  const handleReactivate = (medication: Medication) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === medication.id ? { ...m, isActive: true } : m))
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);
  const paginatedMedications = filteredMedications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: medications.length,
    active: medications.filter((m) => m.isActive).length,
    inactive: medications.filter((m) => !m.isActive).length,
    categories: new Set(medications.map((m) => m.category)).size,
  };

  return (
    <div className="space-y-6">
      <ConfirmationComponent />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medication Database</h1>
          <p className="text-gray-500 mt-1">Manage medication catalog and drug information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Medications</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Pill className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Pill className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold">{stats.categories}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Pill className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medications..."
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication Name</TableHead>
                <TableHead>Generic Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Dosages</TableHead>
                <TableHead>Brand Names</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMedications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell className="font-medium">{medication.name}</TableCell>
                  <TableCell className="text-gray-600">{medication.genericName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{medication.category}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{medication.form}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {medication.standardDosages.map((dosage, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {dosage}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {medication.brandNames.join(', ')}
                  </TableCell>
                  <TableCell>
                    {medication.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(medication)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {medication.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(medication)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReactivate(medication)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredMedications.length)} of{' '}
                {filteredMedications.length} medications
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Form Modal */}
      {showFormModal && (
        <MedicationFormModal
          medication={selectedMedication}
          onClose={() => {
            setShowFormModal(false);
            setSelectedMedication(null);
          }}
          onSave={(medication) => {
            if (isEditing) {
              setMedications((prev) =>
                prev.map((m) => (m.id === medication.id ? medication : m))
              );
            } else {
              setMedications((prev) => [medication, ...prev]);
            }
            setShowFormModal(false);
          }}
        />
      )}
    </div>
  );
}

// Medication Form Modal Component
function MedicationFormModal({
  medication,
  onClose,
  onSave,
}: {
  medication: Medication | null;
  onClose: () => void;
  onSave: (medication: Medication) => void;
}) {
  const [formData, setFormData] = useState<Partial<Medication>>(
    medication || {
      name: '',
      genericName: '',
      brandNames: [],
      category: '',
      form: '',
      standardDosages: [],
      description: '',
      warnings: '',
      isActive: true,
    }
  );

  const [brandNameInput, setBrandNameInput] = useState('');
  const [dosageInput, setDosageInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.genericName || !formData.category || !formData.form) {
      alert('Please fill in all required fields');
      return;
    }

    const savedMedication: Medication = {
      id: medication?.id || `MED-${Date.now()}`,
      name: formData.name!,
      genericName: formData.genericName!,
      brandNames: formData.brandNames || [],
      category: formData.category!,
      form: formData.form!,
      standardDosages: formData.standardDosages || [],
      description: formData.description,
      warnings: formData.warnings,
      isActive: formData.isActive ?? true,
      createdAt: medication?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(savedMedication);
  };

  const addBrandName = () => {
    if (brandNameInput.trim()) {
      setFormData({
        ...formData,
        brandNames: [...(formData.brandNames || []), brandNameInput.trim()],
      });
      setBrandNameInput('');
    }
  };

  const removeBrandName = (index: number) => {
    setFormData({
      ...formData,
      brandNames: formData.brandNames?.filter((_, i) => i !== index),
    });
  };

  const addDosage = () => {
    if (dosageInput.trim()) {
      setFormData({
        ...formData,
        standardDosages: [...(formData.standardDosages || []), dosageInput.trim()],
      });
      setDosageInput('');
    }
  };

  const removeDosage = (index: number) => {
    setFormData({
      ...formData,
      standardDosages: formData.standardDosages?.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{medication ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Medication Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Moxifloxacin"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="genericName">Generic Name *</Label>
              <Input
                id="genericName"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                placeholder="e.g., Moxifloxacin HCl"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" className="mt-2">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="form">Form *</Label>
              <Select
                value={formData.form}
                onValueChange={(value) => setFormData({ ...formData, form: value })}
              >
                <SelectTrigger id="form" className="mt-2">
                  <SelectValue placeholder="Select form..." />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Brand Names */}
          <div>
            <Label>Brand Names</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={brandNameInput}
                onChange={(e) => setBrandNameInput(e.target.value)}
                placeholder="Enter brand name"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBrandName();
                  }
                }}
              />
              <Button type="button" onClick={addBrandName} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.brandNames?.map((brand, idx) => (
                <Badge key={idx} variant="secondary" className="gap-2">
                  {brand}
                  <button
                    type="button"
                    onClick={() => removeBrandName(idx)}
                    className="hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Standard Dosages */}
          <div>
            <Label>Standard Dosages</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={dosageInput}
                onChange={(e) => setDosageInput(e.target.value)}
                placeholder="e.g., 0.5%, 1mg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDosage();
                  }
                }}
              />
              <Button type="button" onClick={addDosage} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.standardDosages?.map((dosage, idx) => (
                <Badge key={idx} variant="secondary" className="gap-2">
                  {dosage}
                  <button
                    type="button"
                    onClick={() => removeDosage(idx)}
                    className="hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the medication"
              rows={3}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="warnings">Warnings & Precautions</Label>
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <Textarea
                  id="warnings"
                  value={formData.warnings}
                  onChange={(e) => setFormData({ ...formData, warnings: e.target.value })}
                  placeholder="Important warnings, contraindications, or precautions"
                  rows={3}
                  className="border-none p-0 focus-visible:ring-0"
                />
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{medication ? 'Save Changes' : 'Add Medication'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
