export {
  fetchAppointments,
  createAppointment,
  cancelAppointment,
  type AppointmentResponse,
  type CreateAppointmentRequest,
} from './appointments'

export async function fetchApi(endpoint: string, options: {
  method?: string
  body?: any
  query?: Record<string, string | undefined>
} = {}) {
  const { method = 'GET', body, query } = options
  
  let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}${endpoint}`
  
  if (query) {
    const queryString = Object.entries(query)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value!)}`)
      .join('&')
    
    if (queryString) {
      url += `?${queryString}`
    }
  }
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  })
  
  if (!response.ok) {
    const errorMessage = await response.text()
    throw new Error(errorMessage || 'An error occurred')
  }
  
  // Return null for 204 No Content
  if (response.status === 204) {
    return null
  }
  
  return response.json()
}