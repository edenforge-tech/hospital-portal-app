'use client';

import React, { useState, useEffect } from 'react';
import { StickyNote, Flag, Lock, Archive } from 'lucide-react';
import { patientNotesApi, PatientNote } from '@/lib/api/patient-notes.api';

interface NotesTabProps {
  patientId: string;
}

export function NotesTab({ patientId }: NotesTabProps) {
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadNotes();
  }, [patientId, typeFilter]);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await patientNotesApi.getByPatient(patientId, {
        noteType: typeFilter || undefined,
      });
      setNotes(response.data || []);
    } catch (err: any) {
      console.error('Error loading notes:', err);
      setError('Failed to load clinical notes.');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlag = async (id: string) => {
    try {
      await patientNotesApi.toggleFlag(id);
      loadNotes();
    } catch (err) {
      console.error('Error toggling flag:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await patientNotesApi.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading notes...</span>
      </div>
    );
  }

  const noteTypes = ['general', 'clinical', 'progress', 'discharge', 'nursing', 'consult', 'procedure', 'follow_up'];

  const typeColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-800',
    clinical: 'bg-blue-100 text-blue-800',
    progress: 'bg-green-100 text-green-800',
    discharge: 'bg-purple-100 text-purple-800',
    nursing: 'bg-pink-100 text-pink-800',
    consult: 'bg-indigo-100 text-indigo-800',
    procedure: 'bg-orange-100 text-orange-800',
    follow_up: 'bg-yellow-100 text-yellow-800',
  };

  const flaggedNotes = notes.filter(n => n.isFlagged);
  const regularNotes = notes.filter(n => !n.isFlagged);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1 text-sm rounded-full border ${!typeFilter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          All
        </button>
        {noteTypes.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 text-sm rounded-full border capitalize ${typeFilter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Flagged Notes */}
      {flaggedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" /> Flagged Notes
          </h3>
          <div className="space-y-3">
            {flaggedNotes.map(note => (
              <NoteCard key={note.id} note={note} typeColors={typeColors} onToggleFlag={handleToggleFlag} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical Notes ({notes.length})</h3>
        <div className="space-y-3">
          {regularNotes.map(note => (
            <NoteCard key={note.id} note={note} typeColors={typeColors} onToggleFlag={handleToggleFlag} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {notes.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No clinical notes found for this patient.</p>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, typeColors, onToggleFlag, onDelete }: {
  note: PatientNote;
  typeColors: Record<string, string>;
  onToggleFlag: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`border rounded-lg p-4 ${note.isFlagged ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{note.title}</h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${typeColors[note.noteType] || 'bg-gray-100 text-gray-800'}`}>
              {note.noteType?.replace(/_/g, ' ')}
            </span>
            {note.isConfidential && <Lock className="w-3 h-3 text-red-500" title="Confidential" />}
            {note.status === 'archived' && <Archive className="w-3 h-3 text-gray-400" title="Archived" />}
          </div>
          {note.authorName && <p className="text-xs text-gray-500">By {note.authorName} on {new Date(note.createdAt).toLocaleString()}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleFlag(note.id)} className={`p-1 rounded hover:bg-gray-100 ${note.isFlagged ? 'text-red-500' : 'text-gray-400'}`}>
            <Flag className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
      {note.flagReason && (
        <p className="mt-2 text-xs text-red-600"><strong>Flag reason:</strong> {note.flagReason}</p>
      )}
    </div>
  );
}
