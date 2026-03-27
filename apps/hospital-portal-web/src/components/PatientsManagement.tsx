'use client';

import * as React from 'react';
import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Download, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Heart, 
  FileText, 
  AlertCircle,
  Users,
  Activity,
  UserPlus,
  Droplet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { AdvancedFilters, ActiveFilters } from '@/components/AdvancedFilters';
import { Pagination } from '@/components/Pagination';

// Types
interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
  };
  registrationDate: string;
  lastVisit: string | null;
  appointmentCount: number;
  status: 'Active' | 'Inactive' | 'Archived';
  notes: string;
}

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  conditions: string;
  allergies: string;
  medications: string;
  status: 'Active' | 'Inactive' | 'Archived';
  notes: string;
}

type SortColumn = 'patientId' | 'name' | 'age' | 'bloodType' | 'lastVisit' | 'status';
type SortDirection = 'asc' | 'desc';

// Blood types for dropdown
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Mock data
const initialPatients: Patient[] = [
  {
    id: '1',
    patientId: 'PT-2024-0001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1985-03-15',
    age: 38,
    gender: 'Female',
    bloodType: 'A+',
    email: 'sarah.johnson@email.com',
    phone: '555-0101',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    },
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Spouse',
      phone: '555-0102'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-123456',
      expiryDate: '2025-12-31'
    },
    medicalHistory: {
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin'],
      medications: ['Metformin', 'Lisinopril']
    },
    registrationDate: '2024-01-15',
    lastVisit: '2025-01-20',
    appointmentCount: 12,
    status: 'Active',
    notes: 'Regular check-ups for diabetes management'
  },
  {
    id: '2',
    patientId: 'PT-2024-0002',
    firstName: 'Michael',
    lastName: 'Chen',
    dateOfBirth: '1990-07-22',
    age: 33,
    gender: 'Male',
    bloodType: 'O+',
    email: 'michael.chen@email.com',
    phone: '555-0201',
    address: {
      street: '456 Oak Ave',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201'
    },
    emergencyContact: {
      name: 'Lisa Chen',
      relationship: 'Sister',
      phone: '555-0202'
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET-789012',
      expiryDate: '2025-06-30'
    },
    medicalHistory: {
      conditions: ['Asthma'],
      allergies: [],
      medications: ['Albuterol Inhaler']
    },
    registrationDate: '2024-02-20',
    lastVisit: '2025-01-18',
    appointmentCount: 8,
    status: 'Active',
    notes: 'Seasonal asthma, prefers morning appointments'
  },
  {
    id: '3',
    patientId: 'PT-2024-0003',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    dateOfBirth: '1978-11-08',
    age: 45,
    gender: 'Female',
    bloodType: 'B+',
    email: 'emily.rodriguez@email.com',
    phone: '555-0301',
    address: {
      street: '789 Elm St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701'
    },
    emergencyContact: {
      name: 'Carlos Rodriguez',
      relationship: 'Spouse',
      phone: '555-0302'
    },
    insurance: {
      provider: 'United Healthcare',
      policyNumber: 'UHC-345678',
      expiryDate: '2025-09-15'
    },
    medicalHistory: {
      conditions: ['Migraine', 'Hypothyroidism'],
      allergies: ['Latex', 'Sulfa drugs'],
      medications: ['Levothyroxine', 'Sumatriptan']
    },
    registrationDate: '2024-01-10',
    lastVisit: '2025-01-15',
    appointmentCount: 15,
    status: 'Active',
    notes: 'Requires latex-free gloves'
  },
  {
    id: '4',
    patientId: 'PT-2024-0004',
    firstName: 'David',
    lastName: 'Williams',
    dateOfBirth: '2000-05-30',
    age: 23,
    gender: 'Male',
    bloodType: 'AB+',
    email: 'david.williams@email.com',
    phone: '555-0401',
    address: {
      street: '321 Pine Rd',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101'
    },
    emergencyContact: {
      name: 'Mary Williams',
      relationship: 'Mother',
      phone: '555-0402'
    },
    insurance: {
      provider: 'Kaiser Permanente',
      policyNumber: 'KP-901234',
      expiryDate: '2025-03-31'
    },
    medicalHistory: {
      conditions: [],
      allergies: [],
      medications: []
    },
    registrationDate: '2024-03-05',
    lastVisit: '2025-01-10',
    appointmentCount: 3,
    status: 'Active',
    notes: 'New patient, annual physical completed'
  },
  {
    id: '5',
    patientId: 'PT-2023-0245',
    firstName: 'Jennifer',
    lastName: 'Taylor',
    dateOfBirth: '1965-09-12',
    age: 58,
    gender: 'Female',
    bloodType: 'O-',
    email: 'jennifer.taylor@email.com',
    phone: '555-0501',
    address: {
      street: '654 Maple Dr',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101'
    },
    emergencyContact: {
      name: 'Robert Taylor',
      relationship: 'Spouse',
      phone: '555-0502'
    },
    insurance: {
      provider: 'Cigna',
      policyNumber: 'CIG-567890',
      expiryDate: '2025-11-30'
    },
    medicalHistory: {
      conditions: ['Osteoarthritis', 'High Cholesterol', 'GERD'],
      allergies: ['Codeine'],
      medications: ['Atorvastatin', 'Omeprazole', 'Acetaminophen']
    },
    registrationDate: '2023-05-20',
    lastVisit: '2025-01-05',
    appointmentCount: 24,
    status: 'Active',
    notes: 'Long-term patient, requires wheelchair access'
  },
  {
    id: '6',
    patientId: 'PT-2024-0005',
    firstName: 'James',
    lastName: 'Anderson',
    dateOfBirth: '1995-02-18',
    age: 28,
    gender: 'Male',
    bloodType: 'A-',
    email: 'james.anderson@email.com',
    phone: '555-0601',
    address: {
      street: '987 Cedar Ln',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201'
    },
    emergencyContact: {
      name: 'Karen Anderson',
      relationship: 'Mother',
      phone: '555-0602'
    },
    insurance: {
      provider: 'Humana',
      policyNumber: 'HUM-234567',
      expiryDate: '2025-08-15'
    },
    medicalHistory: {
      conditions: ['Seasonal Allergies'],
      allergies: ['Pollen', 'Dust'],
      medications: ['Cetirizine']
    },
    registrationDate: '2024-04-12',
    lastVisit: '2024-12-20',
    appointmentCount: 5,
    status: 'Active',
    notes: 'Athlete, sports medicine focus'
  },
  {
    id: '7',
    patientId: 'PT-2024-0006',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: '1982-12-25',
    age: 41,
    gender: 'Female',
    bloodType: 'B-',
    email: 'maria.garcia@email.com',
    phone: '555-0701',
    address: {
      street: '147 Birch St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101'
    },
    emergencyContact: {
      name: 'Jose Garcia',
      relationship: 'Spouse',
      phone: '555-0702'
    },
    insurance: {
      provider: 'Florida Blue',
      policyNumber: 'FLB-678901',
      expiryDate: '2025-10-31'
    },
    medicalHistory: {
      conditions: ['Fibromyalgia', 'Anxiety'],
      allergies: ['Shellfish'],
      medications: ['Duloxetine', 'Gabapentin']
    },
    registrationDate: '2024-02-28',
    lastVisit: '2025-01-12',
    appointmentCount: 11,
    status: 'Active',
    notes: 'Prefers Spanish-speaking providers'
  },
  {
    id: '8',
    patientId: 'PT-2023-0189',
    firstName: 'Robert',
    lastName: 'Martinez',
    dateOfBirth: '1970-06-05',
    age: 53,
    gender: 'Male',
    bloodType: 'AB-',
    email: 'robert.martinez@email.com',
    phone: '555-0801',
    address: {
      street: '258 Willow Way',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001'
    },
    emergencyContact: {
      name: 'Angela Martinez',
      relationship: 'Spouse',
      phone: '555-0802'
    },
    insurance: {
      provider: 'Banner Health',
      policyNumber: 'BAN-890123',
      expiryDate: '2024-02-28'
    },
    medicalHistory: {
      conditions: ['Coronary Artery Disease', 'Type 2 Diabetes', 'Sleep Apnea'],
      allergies: ['Aspirin'],
      medications: ['Metoprolol', 'Metformin', 'CPAP Machine']
    },
    registrationDate: '2023-08-15',
    lastVisit: '2024-11-30',
    appointmentCount: 18,
    status: 'Inactive',
    notes: 'Insurance expired, needs renewal'
  },
  {
    id: '9',
    patientId: 'PT-2024-0007',
    firstName: 'Amanda',
    lastName: 'Lee',
    dateOfBirth: '2010-04-20',
    age: 14,
    gender: 'Female',
    bloodType: 'O+',
    email: 'amanda.lee@email.com',
    phone: '555-0901',
    address: {
      street: '369 Spruce Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    },
    emergencyContact: {
      name: 'Susan Lee',
      relationship: 'Mother',
      phone: '555-0902'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-456789',
      expiryDate: '2025-12-31'
    },
    medicalHistory: {
      conditions: ['ADHD'],
      allergies: [],
      medications: ['Methylphenidate']
    },
    registrationDate: '2024-01-08',
    lastVisit: '2025-01-22',
    appointmentCount: 6,
    status: 'Active',
    notes: 'Pediatric patient, parent consent required'
  },
  {
    id: '10',
    patientId: 'PT-2023-0298',
    firstName: 'Thomas',
    lastName: 'Brown',
    dateOfBirth: '1955-10-30',
    age: 68,
    gender: 'Male',
    bloodType: 'A+',
    email: 'thomas.brown@email.com',
    phone: '555-1001',
    address: {
      street: '741 Ash Blvd',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19101'
    },
    emergencyContact: {
      name: 'Helen Brown',
      relationship: 'Spouse',
      phone: '555-1002'
    },
    insurance: {
      provider: 'Medicare',
      policyNumber: 'MED-123456',
      expiryDate: '2025-12-31'
    },
    medicalHistory: {
      conditions: ['Chronic Kidney Disease', 'Hypertension', 'Atrial Fibrillation'],
      allergies: ['Iodine'],
      medications: ['Warfarin', 'Amlodipine', 'Furosemide']
    },
    registrationDate: '2023-03-10',
    lastVisit: '2025-01-08',
    appointmentCount: 32,
    status: 'Active',
    notes: 'Requires dialysis 3x/week, avoid contrast dye'
  },
  {
    id: '11',
    patientId: 'PT-2024-0008',
    firstName: 'Jessica',
    lastName: 'White',
    dateOfBirth: '1988-08-14',
    age: 35,
    gender: 'Female',
    bloodType: 'B+',
    email: 'jessica.white@email.com',
    phone: '555-1101',
    address: {
      street: '852 Poplar St',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101'
    },
    emergencyContact: {
      name: 'Mark White',
      relationship: 'Spouse',
      phone: '555-1102'
    },
    insurance: {
      provider: 'Health Net',
      policyNumber: 'HN-234567',
      expiryDate: '2025-07-31'
    },
    medicalHistory: {
      conditions: ['Pregnancy - 2nd Trimester'],
      allergies: [],
      medications: ['Prenatal Vitamins', 'Folic Acid']
    },
    registrationDate: '2024-09-01',
    lastVisit: '2025-01-23',
    appointmentCount: 4,
    status: 'Active',
    notes: 'OB patient, high-risk pregnancy due to age'
  },
  {
    id: '12',
    patientId: 'PT-2022-0156',
    firstName: 'Christopher',
    lastName: 'Davis',
    dateOfBirth: '1992-01-03',
    age: 32,
    gender: 'Male',
    bloodType: 'O-',
    email: 'chris.davis@email.com',
    phone: '555-1201',
    address: {
      street: '963 Hickory Ct',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37201'
    },
    emergencyContact: {
      name: 'Patricia Davis',
      relationship: 'Mother',
      phone: '555-1202'
    },
    insurance: {
      provider: 'BlueCross BlueShield Tennessee',
      policyNumber: 'BCBS-TN-567890',
      expiryDate: '2025-04-30'
    },
    medicalHistory: {
      conditions: ['Depression', 'Chronic Back Pain'],
      allergies: ['NSAIDs'],
      medications: ['Sertraline', 'Acetaminophen']
    },
    registrationDate: '2022-11-20',
    lastVisit: '2024-10-15',
    appointmentCount: 21,
    status: 'Archived',
    notes: 'Moved out of state, records transferred'
  }
];

const statusColors = {
  Active: 'bg-emerald-100 text-emerald-800',
  Inactive: 'bg-amber-100 text-amber-800',
  Archived: 'bg-gray-100 text-gray-800'
};

export function PatientsManagement() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<SortColumn>('patientId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodType: 'O+',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
    conditions: '',
    allergies: '',
    medications: '',
    status: 'Active',
    notes: ''
  });

  // Calculate statistics
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'Active').length,
    newThisMonth: patients.filter(p => {
      const regDate = new Date(p.registrationDate);
      const now = new Date();
      return regDate.getMonth() === now.getMonth() && regDate.getFullYear() === now.getFullYear();
    }).length,
    byBloodType: patients.reduce((acc, p) => {
      acc[p.bloodType] = (acc[p.bloodType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byAge: {
      children: patients.filter(p => p.age < 18).length,
      adults: patients.filter(p => p.age >= 18 && p.age < 65).length,
      seniors: patients.filter(p => p.age >= 65).length
    }
  };

  // Filter configuration
  const filterGroups = [
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'Active', label: 'Active', count: stats.active },
        { value: 'Inactive', label: 'Inactive', count: patients.filter(p => p.status === 'Inactive').length },
        { value: 'Archived', label: 'Archived', count: patients.filter(p => p.status === 'Archived').length }
      ]
    },
    {
      label: 'Blood Type',
      key: 'bloodType',
      options: bloodTypes.map(bt => ({
        value: bt,
        label: bt,
        count: stats.byBloodType[bt] || 0
      }))
    },
    {
      label: 'Age Group',
      key: 'ageGroup',
      options: [
        { value: 'children', label: 'Children (0-17)', count: stats.byAge.children },
        { value: 'adults', label: 'Adults (18-64)', count: stats.byAge.adults },
        { value: 'seniors', label: 'Seniors (65+)', count: stats.byAge.seniors }
      ]
    },
    {
      label: 'Gender',
      key: 'gender',
      options: [
        { value: 'Male', label: 'Male', count: patients.filter(p => p.gender === 'Male').length },
        { value: 'Female', label: 'Female', count: patients.filter(p => p.gender === 'Female').length },
        { value: 'Other', label: 'Other', count: patients.filter(p => p.gender === 'Other').length }
      ]
    }
  ];

  // Filtering logic
  const filteredPatients = patients.filter(patient => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.patientId.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchQuery);

    // Status filter
    const statusFilter = activeFilters.status || [];
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(patient.status);

    // Blood type filter
    const bloodTypeFilter = activeFilters.bloodType || [];
    const matchesBloodType = bloodTypeFilter.length === 0 || bloodTypeFilter.includes(patient.bloodType);

    // Age group filter
    const ageGroupFilter = activeFilters.ageGroup || [];
    let matchesAgeGroup = true;
    if (ageGroupFilter.length > 0) {
      matchesAgeGroup = ageGroupFilter.some(group => {
        if (group === 'children') return patient.age < 18;
        if (group === 'adults') return patient.age >= 18 && patient.age < 65;
        if (group === 'seniors') return patient.age >= 65;
        return false;
      });
    }

    // Gender filter
    const genderFilter = activeFilters.gender || [];
    const matchesGender = genderFilter.length === 0 || genderFilter.includes(patient.gender);

    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const regDate = new Date(patient.registrationDate);
      if (dateRange.from) matchesDateRange = matchesDateRange && regDate >= new Date(dateRange.from);
      if (dateRange.to) matchesDateRange = matchesDateRange && regDate <= new Date(dateRange.to);
    }

    return matchesSearch && matchesStatus && matchesBloodType && matchesAgeGroup && matchesGender && matchesDateRange;
  });

  // Sorting logic
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case 'patientId':
        comparison = a.patientId.localeCompare(b.patientId);
        break;
      case 'name':
        comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        break;
      case 'age':
        comparison = a.age - b.age;
        break;
      case 'bloodType':
        comparison = a.bloodType.localeCompare(b.bloodType);
        break;
      case 'lastVisit':
        const aDate = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
        const bDate = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
        comparison = aDate - bDate;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = sortedPatients.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleCreate = () => {
    const newPatient: Patient = {
      id: (patients.length + 1).toString(),
      patientId: `PT-${new Date().getFullYear()}-${String(patients.length + 1).padStart(4, '0')}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formData.dateOfBirth,
      age: calculateAge(formData.dateOfBirth),
      gender: formData.gender,
      bloodType: formData.bloodType,
      email: formData.email,
      phone: formData.phone,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      },
      emergencyContact: {
        name: formData.emergencyContactName,
        relationship: formData.emergencyContactRelationship,
        phone: formData.emergencyContactPhone
      },
      insurance: {
        provider: formData.insuranceProvider,
        policyNumber: formData.insurancePolicyNumber,
        expiryDate: formData.insuranceExpiryDate
      },
      medicalHistory: {
        conditions: formData.conditions ? formData.conditions.split(',').map(c => c.trim()) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : []
      },
      registrationDate: new Date().toISOString().split('T')[0],
      lastVisit: null,
      appointmentCount: 0,
      status: formData.status,
      notes: formData.notes
    };

    setPatients([...patients, newPatient]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedPatient) return;

    const updatedPatients = patients.map(patient =>
      patient.id === selectedPatient.id
        ? {
            ...patient,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            age: calculateAge(formData.dateOfBirth),
            gender: formData.gender,
            bloodType: formData.bloodType,
            email: formData.email,
            phone: formData.phone,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode
            },
            emergencyContact: {
              name: formData.emergencyContactName,
              relationship: formData.emergencyContactRelationship,
              phone: formData.emergencyContactPhone
            },
            insurance: {
              provider: formData.insuranceProvider,
              policyNumber: formData.insurancePolicyNumber,
              expiryDate: formData.insuranceExpiryDate
            },
            medicalHistory: {
              conditions: formData.conditions ? formData.conditions.split(',').map(c => c.trim()) : [],
              allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
              medications: formData.medications ? formData.medications.split(',').map(m => m.trim()) : []
            },
            status: formData.status,
            notes: formData.notes
          }
        : patient
    );

    setPatients(updatedPatients);
    setIsEditModalOpen(false);
    setSelectedPatient(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedPatient) return;
    setPatients(patients.filter(patient => patient.id !== selectedPatient.id));
    setIsDeleteModalOpen(false);
    setSelectedPatient(null);
  };

  const openEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      bloodType: patient.bloodType,
      email: patient.email,
      phone: patient.phone,
      street: patient.address.street,
      city: patient.address.city,
      state: patient.address.state,
      zipCode: patient.address.zipCode,
      emergencyContactName: patient.emergencyContact.name,
      emergencyContactRelationship: patient.emergencyContact.relationship,
      emergencyContactPhone: patient.emergencyContact.phone,
      insuranceProvider: patient.insurance.provider,
      insurancePolicyNumber: patient.insurance.policyNumber,
      insuranceExpiryDate: patient.insurance.expiryDate,
      conditions: patient.medicalHistory.conditions.join(', '),
      allergies: patient.medicalHistory.allergies.join(', '),
      medications: patient.medicalHistory.medications.join(', '),
      status: patient.status,
      notes: patient.notes
    });
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Male',
      bloodType: 'O+',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceExpiryDate: '',
      conditions: '',
      allergies: '',
      medications: '',
      status: 'Active',
      notes: ''
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Patient ID', 'First Name', 'Last Name', 'Date of Birth', 'Age', 'Gender', 'Blood Type',
      'Email', 'Phone', 'Address', 'City', 'State', 'Zip', 
      'Emergency Contact', 'Emergency Phone', 'Emergency Relationship',
      'Insurance Provider', 'Policy Number', 'Insurance Expiry',
      'Conditions', 'Allergies', 'Medications',
      'Registration Date', 'Last Visit', 'Appointment Count', 'Status', 'Notes'
    ];

    const rows = sortedPatients.map(patient => [
      patient.patientId,
      patient.firstName,
      patient.lastName,
      patient.dateOfBirth,
      patient.age,
      patient.gender,
      patient.bloodType,
      patient.email,
      patient.phone,
      patient.address.street,
      patient.address.city,
      patient.address.state,
      patient.address.zipCode,
      patient.emergencyContact.name,
      patient.emergencyContact.phone,
      patient.emergencyContact.relationship,
      patient.insurance.provider,
      patient.insurance.policyNumber,
      patient.insurance.expiryDate,
      patient.medicalHistory.conditions.join('; '),
      patient.medicalHistory.allergies.join('; '),
      patient.medicalHistory.medications.join('; '),
      patient.registrationDate,
      patient.lastVisit || 'N/A',
      patient.appointmentCount,
      patient.status,
      patient.notes
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients Management</h1>
          <p className="text-gray-500">Manage patient records, demographics, and medical information</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">All registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-gray-500">{((stats.active / stats.total) * 100).toFixed(0)}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-gray-500">New registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age Distribution</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Children:</span>
                <span className="font-semibold">{stats.byAge.children}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adults:</span>
                <span className="font-semibold">{stats.byAge.adults}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Seniors:</span>
                <span className="font-semibold">{stats.byAge.seniors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Type O+</CardTitle>
            <Droplet className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byBloodType['O+'] || 0}</div>
            <p className="text-xs text-gray-500">Most common type</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, patient ID, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <AdvancedFilters
          filterGroups={filterGroups}
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Active Filters */}
      <ActiveFilters
        filterGroups={filterGroups}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
      />

      {/* Patients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('patientId')}>
                  <div className="flex items-center">
                    Patient ID
                    {getSortIcon('patientId')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('age')}>
                  <div className="flex items-center">
                    Age/Gender
                    {getSortIcon('age')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('bloodType')}>
                  <div className="flex items-center">
                    Blood Type
                    {getSortIcon('bloodType')}
                  </div>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('lastVisit')}>
                  <div className="flex items-center">
                    Last Visit
                    {getSortIcon('lastVisit')}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  <div className="flex items-center">
                    Status
                    {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.patientId}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                        {patient.medicalHistory.allergies.length > 0 && (
                          <div className="text-xs text-red-600 flex items-center">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Allergies: {patient.medicalHistory.allergies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{patient.age} years</div>
                      <div className="text-gray-500">{patient.gender}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Droplet className="mr-1 h-4 w-4 text-rose-500" />
                      <span className="font-medium">{patient.bloodType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Phone className="mr-1 h-3 w-3 text-gray-400" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Mail className="mr-1 h-3 w-3" />
                        {patient.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.lastVisit ? (
                      <div className="text-sm">
                        <div>{new Date(patient.lastVisit).toLocaleDateString()}</div>
                        <div className="text-gray-500">{patient.appointmentCount} total visits</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No visits</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[patient.status]}`}>
                      {patient.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailsModal(patient)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(patient)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={sortedPatients.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
          setSelectedPatient(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateModalOpen ? 'Register New Patient' : 'Edit Patient'}</DialogTitle>
            <DialogDescription>
              {isCreateModalOpen ? 'Enter patient information to register a new patient.' : 'Update patient information.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type *</Label>
                  <select
                    id="bloodType"
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {bloodTypes.map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Address
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Name *</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone *</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Insurance Information
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insuranceProvider">Provider</Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                  <Input
                    id="insurancePolicyNumber"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceExpiryDate">Expiry Date</Label>
                  <Input
                    id="insuranceExpiryDate"
                    type="date"
                    value={formData.insuranceExpiryDate}
                    onChange={(e) => setFormData({ ...formData, insuranceExpiryDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Medical History
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Input
                    id="conditions"
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    placeholder="Comma-separated (e.g., Hypertension, Diabetes)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Comma-separated (e.g., Penicillin, Latex)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Input
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                    placeholder="Comma-separated (e.g., Aspirin, Metformin)"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              resetForm();
              setSelectedPatient(null);
            }}>
              Cancel
            </Button>
            <Button onClick={isCreateModalOpen ? handleCreate : handleEdit} className="bg-emerald-600 hover:bg-emerald-700">
              {isCreateModalOpen ? 'Register Patient' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Comprehensive patient information and medical history
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <p className="text-gray-500">{selectedPatient.patientId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedPatient.status]}`}>
                  {selectedPatient.status}
                </span>
              </div>

              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Type</p>
                      <p className="font-medium flex items-center">
                        <Droplet className="mr-1 h-4 w-4 text-rose-500" />
                        {selectedPatient.bloodType}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">
                        {selectedPatient.address.street}<br />
                        {selectedPatient.address.city}, {selectedPatient.address.state} {selectedPatient.address.zipCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{selectedPatient.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Relationship</p>
                      <p className="font-medium">{selectedPatient.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedPatient.emergencyContact.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="font-medium">{selectedPatient.insurance.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Policy Number</p>
                      <p className="font-medium">{selectedPatient.insurance.policyNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expiry Date</p>
                      <p className="font-medium">{new Date(selectedPatient.insurance.expiryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Medical Conditions</p>
                      {selectedPatient.medicalHistory.conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.medicalHistory.conditions.map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {condition}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">None</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Allergies</p>
                      {selectedPatient.medicalHistory.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.medicalHistory.allergies.map((allergy, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">None</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Current Medications</p>
                      {selectedPatient.medicalHistory.medications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.medicalHistory.medications.map((medication, index) => (
                            <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm">
                              {medication}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">None</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visit History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Visit History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{new Date(selectedPatient.registrationDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Visit</p>
                      <p className="font-medium">
                        {selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : 'No visits yet'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Appointments</p>
                      <p className="font-medium">{selectedPatient.appointmentCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedPatient.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedPatient.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPatient?.firstName} {selectedPatient?.lastName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && selectedPatient.appointmentCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Warning</p>
                <p className="text-sm text-amber-700">
                  This patient has {selectedPatient.appointmentCount} appointment(s) in the system. Consider archiving instead of deleting.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
