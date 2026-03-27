import { getApi } from './api';

export interface CheckInStatus {
  patientId: string;
  appointmentId?: string;
  isCheckedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  tokenNumber?: string;
  department?: string;
  doctorName?: string;
  checkInType: 'appointment' | 'walk-in';
  visitId?: string;
}

export interface CheckInRequest {
  patientId: string;
  appointmentId?: string;
  departmentId: string;
  doctorId?: string;
  checkInType: 'appointment' | 'walk-in';
  reasonForVisit: string;
}

export interface CheckInResponse {
  success: boolean;
  visitId: string;
  tokenNumber: string;
  checkedInAt: string;
  message: string;
}

export const checkInApi = {
  // Get check-in status for a patient
  async getStatus(patientId: string): Promise<CheckInStatus> {
    const api = getApi();
    try {
      // Get active visit for patient
      const response = await api.get(`/visits/by-patient/${patientId}?pageSize=1`);
      const visits = response.data;
      
      if (visits && visits.length > 0) {
        const activeVisit = visits.find((v: any) => v.status === 'checked-in' || v.status === 'in-progress');
        
        if (activeVisit) {
          return {
            patientId,
            appointmentId: activeVisit.appointmentId,
            isCheckedIn: true,
            checkedInAt: activeVisit.checkedInAt,
            checkedInBy: activeVisit.checkedInBy,
            tokenNumber: activeVisit.tokenNumber,
            department: activeVisit.department,
            doctorName: activeVisit.doctorName,
            checkInType: activeVisit.visitType || 'walk-in',
            visitId: activeVisit.id
          };
        }
      }
      
      return {
        patientId,
        isCheckedIn: false,
        checkInType: 'walk-in'
      };
    } catch (error) {
      console.error('Error fetching check-in status:', error);
      return {
        patientId,
        isCheckedIn: false,
        checkInType: 'walk-in'
      };
    }
  },

  // Check-in a patient
  async checkIn(request: CheckInRequest): Promise<CheckInResponse> {
    const api = getApi();
    try {
      const response = await api.post('/visits/checkin', {
        patientId: request.patientId,
        appointmentId: request.appointmentId,
        departmentId: request.departmentId,
        doctorId: request.doctorId,
        checkInType: request.checkInType,
        reasonForVisit: request.reasonForVisit
      });
      
      return {
        success: true,
        visitId: response.data.visitId || response.data.id,
        tokenNumber: response.data.tokenNumber,
        checkedInAt: response.data.checkedInAt || new Date().toISOString(),
        message: response.data.message || `Patient checked in successfully. Token: ${response.data.tokenNumber}`
      };
    } catch (error: any) {
      console.error('Check-in failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to check in patient');
    }
  },

  // Check-out a patient
  async checkOut(visitId: string): Promise<{ success: boolean; message: string }> {
    const api = getApi();
    try {
      const response = await api.post('/visits/checkout', { visitId });
      return {
        success: true,
        message: response.data.message || 'Patient checked out successfully'
      };
    } catch (error: any) {
      console.error('Check-out failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to check out patient');
    }
  },

  // Get today's checked-in patients
  async getTodayCheckIns(): Promise<CheckInStatus[]> {
    const api = getApi();
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/visits?date=${today}&status=checked-in,in-progress`);
      
      return response.data.map((visit: any) => ({
        patientId: visit.patientId,
        appointmentId: visit.appointmentId,
        isCheckedIn: true,
        checkedInAt: visit.checkedInAt,
        checkedInBy: visit.checkedInBy,
        tokenNumber: visit.tokenNumber,
        department: visit.department,
        doctorName: visit.doctorName,
        checkInType: visit.visitType || 'walk-in',
        visitId: visit.id
      }));
    } catch (error) {
      console.error('Error fetching today check-ins:', error);
      return [];
    }
  }
};
