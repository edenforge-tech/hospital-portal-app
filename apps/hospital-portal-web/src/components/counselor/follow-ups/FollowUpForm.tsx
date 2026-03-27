'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateFollowUp, useUpdateFollowUp, useFollowUp } from '@/hooks/use-follow-ups';
import { Loader2, Save, X } from 'lucide-react';

interface FollowUpFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  followUpId?: string;
  patientId?: string;
}

export default function FollowUpForm({
  isOpen,
  onClose,
  onSuccess,
  followUpId,
  patientId: initialPatientId,
}: FollowUpFormProps) {
  const isEditMode = !!followUpId;

  // Fetch follow-up data if editing
  const { data: followUpData } = useFollowUp(followUpId || '', {
    enabled: isEditMode,
  });

  // Mutations
  const createMutation = useCreateFollowUp();
  const updateMutation = useUpdateFollowUp();

  // Form state
  const [formData, setFormData] = useState({
    patientId: initialPatientId || '',
    followUpType: '',
    relatedProcedure: '',
    procedureDate: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'routine',
    assignedDoctorId: '',
    departmentId: '',
    notes: '',
    status: 'scheduled',
  });

  // Populate form when editing
  useEffect(() => {
    if (followUpData) {
      setFormData({
        patientId: followUpData.patientId,
        followUpType: followUpData.followUpType,
        relatedProcedure: followUpData.relatedProcedure || '',
        procedureDate: followUpData.procedureDate
          ? new Date(followUpData.procedureDate).toISOString().split('T')[0]
          : '',
        scheduledDate: new Date(followUpData.scheduledDate).toISOString().split('T')[0],
        scheduledTime: followUpData.scheduledTime || '',
        priority: followUpData.priority,
        assignedDoctorId: followUpData.assignedDoctorId,
        departmentId: followUpData.departmentId,
        notes: followUpData.notes || '',
        status: followUpData.status,
      });
    }
  }, [followUpData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && followUpId) {
        await updateMutation.mutateAsync({
          id: followUpId,
          data: {
            scheduledDate: formData.scheduledDate,
            scheduledTime: formData.scheduledTime || undefined,
            status: formData.status,
            priority: formData.priority,
            notes: formData.notes || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          patientId: formData.patientId,
          followUpType: formData.followUpType,
          relatedProcedure: formData.relatedProcedure || undefined,
          procedureDate: formData.procedureDate || undefined,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime || undefined,
          priority: formData.priority,
          assignedDoctorId: formData.assignedDoctorId,
          departmentId: formData.departmentId,
          notes: formData.notes || undefined,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save follow-up:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: initialPatientId || '',
      followUpType: '',
      relatedProcedure: '',
      procedureDate: '',
      scheduledDate: '',
      scheduledTime: '',
      priority: 'routine',
      assignedDoctorId: '',
      departmentId: '',
      notes: '',
      status: 'scheduled',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Follow-Up' : 'Schedule Follow-Up'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Patient ID (only for create mode) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="patientId">
                Patient ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                required
                placeholder="Enter patient ID"
              />
            </div>
          )}

          {/* Follow-Up Type */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="followUpType">
                Follow-Up Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.followUpType}
                onValueChange={(value) => setFormData({ ...formData, followUpType: value })}
                required
              >
                <SelectTrigger id="followUpType">
                  <SelectValue placeholder="Select follow-up type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Post-Operative">Post-Operative</SelectItem>
                  <SelectItem value="Routine Check-up">Routine Check-up</SelectItem>
                  <SelectItem value="Consultation Review">Consultation Review</SelectItem>
                  <SelectItem value="Test Results">Test Results</SelectItem>
                  <SelectItem value="Medication Review">Medication Review</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Related Procedure */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="relatedProcedure">Related Procedure (Optional)</Label>
              <Input
                id="relatedProcedure"
                value={formData.relatedProcedure}
                onChange={(e) => setFormData({ ...formData, relatedProcedure: e.target.value })}
                placeholder="e.g., Cataract Surgery"
              />
            </div>
          )}

          {/* Procedure Date */}
          {!isEditMode && formData.relatedProcedure && (
            <div className="space-y-2">
              <Label htmlFor="procedureDate">Procedure Date</Label>
              <Input
                id="procedureDate"
                type="date"
                value={formData.procedureDate}
                onChange={(e) => setFormData({ ...formData, procedureDate: e.target.value })}
              />
            </div>
          )}

          {/* Scheduled Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">
                Scheduled Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
              required
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status (edit mode only) */}
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assigned Doctor & Department (create mode only) */}
          {!isEditMode && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedDoctorId">
                  Assigned Doctor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="assignedDoctorId"
                  value={formData.assignedDoctorId}
                  onChange={(e) => setFormData({ ...formData, assignedDoctorId: e.target.value })}
                  required
                  placeholder="Doctor ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="departmentId"
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  required
                  placeholder="Department ID"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or instructions..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Follow-Up' : 'Schedule Follow-Up'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
