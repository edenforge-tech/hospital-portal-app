// API types and client for handling appointments
import { baseURL } from './config'

// API response types
export interface AppointmentResponse {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  appointmentDate: string
  appointmentType: string
  durationMinutes: number
  status: string
  notes?: string
  cancellationReason?: string
  reminderSent: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentRequest {
  patientId: string
  doctorId: string
  appointmentDate: string
  appointmentType: string
  durationMinutes: number
  notes?: string
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string
  appointmentType?: string
  durationMinutes?: number
  notes?: string
}

// Types for paginated responses
export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// API Error types
export interface ApiError {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  errors?: Record<string, string[]>
}

// Custom error class for API errors
export class ApiException extends Error {
  constructor(public error: ApiError) {
    super(error.detail || error.title)
    this.name = 'ApiException'
  }
}

// Request parameters type
export interface AppointmentParams {
  fromDate?: string
  toDate?: string
  page?: number
  pageSize?: number
  doctorId?: string
  patientId?: string
  status?: string
}

const defaultPageSize = 10
const maxRetries = 3
const retryDelay = 1000 // 1 second

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error: ApiError
    try {
      error = await response.json()
    } catch {
      error = {
        type: 'https://hospital.api/errors/unknown',
        title: 'Unknown Error',
        status: response.status,
        detail: response.statusText,
      }
    }
    throw new ApiException(error)
  }

  return response.json()
}

// Helper function to build URL with query parameters
function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(`${baseURL}${endpoint}`)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })
  }
  
  return url.toString()
}

// Retry mechanism for failed requests
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  attempts: number = maxRetries
): Promise<T> {
  try {
    return await requestFn()
  } catch (error) {
    if (
      attempts > 0 &&
      error instanceof ApiException &&
      error.error.status >= 500 // Only retry server errors
    ) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      return retryRequest(requestFn, attempts - 1)
    }
    throw error
  }
}

// API Functions
export async function fetchAppointments(
  params: AppointmentParams = {}
): Promise<PaginatedResponse<AppointmentResponse>> {
  const queryParams = {
    page: params.page || 1,
    pageSize: params.pageSize || defaultPageSize,
    fromDate: params.fromDate,
    toDate: params.toDate,
    doctorId: params.doctorId,
    patientId: params.patientId,
    status: params.status,
  }

  return retryRequest(() =>
    fetch(buildUrl('/appointments', queryParams))
      .then(handleResponse<PaginatedResponse<AppointmentResponse>>)
  )
}

export async function getDoctorAppointments(
  doctorId: string,
  params: Omit<AppointmentParams, 'doctorId'> = {}
): Promise<PaginatedResponse<AppointmentResponse>> {
  const queryParams = {
    page: params.page || 1,
    pageSize: params.pageSize || defaultPageSize,
    fromDate: params.fromDate,
    toDate: params.toDate,
    status: params.status,
  }

  return retryRequest(() =>
    fetch(buildUrl(`/appointments/doctor/${doctorId}`, queryParams))
      .then(handleResponse<PaginatedResponse<AppointmentResponse>>)
  )
}

export async function getPatientAppointments(
  patientId: string,
  params: Omit<AppointmentParams, 'patientId'> = {}
): Promise<PaginatedResponse<AppointmentResponse>> {
  const queryParams = {
    page: params.page || 1,
    pageSize: params.pageSize || defaultPageSize,
    fromDate: params.fromDate,
    toDate: params.toDate,
    status: params.status,
  }

  return retryRequest(() =>
    fetch(buildUrl(`/appointments/patient/${patientId}`, queryParams))
      .then(handleResponse<PaginatedResponse<AppointmentResponse>>)
  )
}

export async function createAppointment(
  appointment: CreateAppointmentRequest
): Promise<AppointmentResponse> {
  return retryRequest(() =>
    fetch(`${baseURL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    }).then(handleResponse<AppointmentResponse>)
  )
}

export async function updateAppointment(
  id: string,
  appointment: UpdateAppointmentRequest
): Promise<AppointmentResponse> {
  return retryRequest(() =>
    fetch(`${baseURL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    }).then(handleResponse<AppointmentResponse>)
  )
}

export async function cancelAppointment(
  id: string,
  reason: string
): Promise<AppointmentResponse> {
  return retryRequest(() =>
    fetch(`${baseURL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancellationReason: reason }),
    }).then(handleResponse<AppointmentResponse>)
  )
}

export async function deleteAppointment(id: string): Promise<void> {
  return retryRequest(() =>
    fetch(`${baseURL}/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      if (!response.ok) {
        return handleResponse(response)
      }
    })
  )
}