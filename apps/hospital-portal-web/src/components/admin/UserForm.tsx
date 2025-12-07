'use client';

import { useState } from 'react';
import { usersApi } from '@/lib/api';

interface Props {
  initialUser?: any;
  onClose?: () => void;
}

export default function UserForm({ initialUser, onClose }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    id: initialUser?.id || '',
    firstName: initialUser?.firstName || '',
    lastName: initialUser?.lastName || '',
    email: initialUser?.email || '',
    userName: initialUser?.userName || '',
    userType: initialUser?.userType || 'Staff',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (form.id) {
        await usersApi.update(form.id, form);
      } else {
        await usersApi.create(form);
      }
      onClose?.();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm">First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="text-sm">Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
      </div>

      <div>
        <label className="text-sm">Email</label>
        <input name="email" value={form.email} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="text-sm">Username</label>
        <input name="userName" value={form.userName} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
      </div>

      <div>
        <label className="text-sm">User Type</label>
        <select name="userType" value={form.userType} onChange={handleChange} className="w-full border px-3 py-2 rounded">
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
          <option value="Patient">Patient</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded">{isSaving ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
