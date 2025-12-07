export interface Tenant {
  id: number;
  name: string;
  tenantIdentifier: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Patient {
  id: number;
  tenantId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  medicalRecordNumber: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Doctor {
  id: number;
  tenantId: number;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  phone: string;
  licenseNumber: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  id: number;
  tenantId: number;
  patientId: number;
  doctorId: number;
  scheduledDate: string;
  status: string;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  patient?: Patient;
  doctor?: Doctor;
}
