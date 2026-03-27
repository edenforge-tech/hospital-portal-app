'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  useSessionNotes, 
  useCreateSessionNote, 
  useUpdateSessionNote, 
  useDeleteSessionNote 
} from '@/hooks/use-counseling-sessions';
import type { SessionNote, CreateSessionNoteRequest } from '@/lib/api/counseling-sessions.api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { FileText, Plus, Edit, Trash2, Save, X, Lock, Tag } from 'lucide-react';

interface SessionNotesProps {
  sessionId: string;
  className?: string;
}

const NOTE_TYPES = [
  { value: 'General', label: 'General Note', color: 'bg-gray-100 text-gray-700' },
  { value: 'PatientEducation', label: 'Patient Education', color: 'bg-blue-100 text-blue-700' },
  { value: 'CostDiscussion', label: 'Cost Discussion', color: 'bg-green-100 text-green-700' },
  { value: 'Concerns', label: 'Patient Concerns', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'FollowupPlan', label: 'Follow-up Plan', color: 'bg-purple-100 text-purple-700' },
  { value: 'Internal', label: 'Internal Note', color: 'bg-red-100 text-red-700' },
];

export default function SessionNotes({ sessionId, className = '' }: SessionNotesProps) {
  const { tenantId } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSessionNoteRequest>({
    sessionId,
    noteType: 'General',
    noteText: '',
    isConfidential: false,
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  // Queries
  const { data: notes = [], isLoading, refetch } = useSessionNotes(sessionId);
  const createMutation = useCreateSessionNote();
  const updateMutation = useUpdateSessionNote();
  const deleteMutation = useDeleteSessionNote();

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      sessionId,
      noteType: 'General',
      noteText: '',
      isConfidential: false,
      tags: [],
    });
  };

  const handleEdit = (note: SessionNote) => {
    setEditingNoteId(note.id);
    setFormData({
      sessionId: note.sessionId,
      noteType: note.noteType || 'General',
      noteText: note.noteText,
      isConfidential: note.isConfidential,
      tags: note.tags || [],
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingNoteId(null);
    setFormData({
      sessionId,
      noteType: 'General',
      noteText: '',
      isConfidential: false,
      tags: [],
    });
    setTagInput('');
  };

  const handleSave = async () => {
    if (!formData.noteText.trim()) {
      toast.error('Note text is required');
      return;
    }

    try {
      if (editingNoteId) {
        // Update existing note
        await updateMutation.mutateAsync({
          noteId: editingNoteId,
          sessionId,
          data: {
            noteType: formData.noteType,
            noteText: formData.noteText,
            isConfidential: formData.isConfidential,
            tags: formData.tags,
          },
        });
        toast.success('Note updated successfully');
      } else {
        // Create new note
        await createMutation.mutateAsync({
          ...formData,
          tenantId,
        });
        toast.success('Note created successfully');
      }
      handleCancel();
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save note');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteMutation.mutateAsync({ noteId, sessionId });
      toast.success('Note deleted successfully');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete note');
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formData.tags?.includes(tagInput.trim())) {
      toast.error('Tag already exists');
      return;
    }
    setFormData({
      ...formData,
      tags: [...(formData.tags || []), tagInput.trim()],
    });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag),
    });
  };

  const getNoteTypeColor = (type?: string) => {
    return NOTE_TYPES.find(nt => nt.value === type)?.color || NOTE_TYPES[0].color;
  };

  const getNoteTypeLabel = (type?: string) => {
    return NOTE_TYPES.find(nt => nt.value === type)?.label || 'General Note';
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Session Notes ({notes.length})</h3>
        </div>
        {!isAdding && !editingNoteId && (
          <Button size="sm" onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {/* Note Form */}
      {(isAdding || editingNoteId) && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="space-y-3">
            {/* Note Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
              <select
                value={formData.noteType}
                onChange={(e) => setFormData({ ...formData, noteType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NOTE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
              <textarea
                value={formData.noteText}
                onChange={(e) => setFormData({ ...formData, noteText: e.target.value })}
                rows={4}
                placeholder="Enter your note here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Button type="button" size="sm" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Confidential Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isConfidential}
                onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Lock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Mark as confidential</span>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
                {editingNoteId ? 'Update' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="divide-y divide-gray-200">
        {notes.length === 0 && !isAdding ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No notes yet</p>
            <p className="text-sm mt-1">Click "Add Note" to create your first note</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(note.noteType)}`}>
                      {getNoteTypeLabel(note.noteType)}
                    </span>
                    {note.isConfidential && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        <Lock className="h-3 w-3" />
                        Confidential
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap break-words">{note.noteText}</p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {note.createdByUserName || 'Unknown'} • {new Date(note.createdAt).toLocaleString()}
                    {note.updatedAt && ` • Updated ${new Date(note.updatedAt).toLocaleString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(note)}
                    disabled={editingNoteId === note.id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(note.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
