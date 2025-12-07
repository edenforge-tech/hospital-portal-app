'use client';

import { useEffect, useState } from 'react';
import { examinationApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Examination {
  id: string;
  patientId: string;
  patientName: string;
  examinationDate: string;
  chiefComplaint: string;
  diagnosis?: string;
  examiningDoctorName: string;
  followUpDate?: string;
}

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExaminations();
  }, []);

  const fetchExaminations = async () => {
    try {
      const response = await examinationApi.getAll();
      setExaminations(response.data);
    } catch (error) {
      console.error('Failed to fetch examinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="EXAMINATION_VIEW_ALL">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clinical Examinations</h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {/* TODO: Implement new examination form */}}
          >
            New Examination
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center">Loading examinations...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chief Complaint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examinations.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(exam.examinationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exam.patientName}
                    </td>
                    <td className="px-6 py-4">
                      {exam.chiefComplaint}
                    </td>
                    <td className="px-6 py-4">
                      {exam.diagnosis || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exam.examiningDoctorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {exam.followUpDate 
                        ? new Date(exam.followUpDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}