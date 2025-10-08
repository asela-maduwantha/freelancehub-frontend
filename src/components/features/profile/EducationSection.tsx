'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Calendar, Building } from 'lucide-react';
import { EducationRecord, AddEducationRequest, UpdateEducationRequest } from '../../../types/profile';

interface EducationSectionProps {
  education: EducationRecord[];
  onAdd: (data: AddEducationRequest) => Promise<void>;
  onUpdate: (id: string, data: UpdateEducationRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function EducationSection({ education, onAdd, onUpdate, onDelete, isLoading }: EducationSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationRecord | null>(null);
  const [formData, setFormData] = useState<AddEducationRequest>({
    degree: '',
    institution: '',
    year: new Date().getFullYear(),
  });

  const resetForm = () => {
    setFormData({
      degree: '',
      institution: '',
      year: new Date().getFullYear(),
    });
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: EducationRecord) => {
    setEditingItem(item);
    setFormData({
      degree: item.degree,
      institution: item.institution,
      year: item.year,
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, formData);
      } else {
        await onAdd(formData);
      }
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save education record:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        <button
          onClick={handleOpenAdd}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus size={16} />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No education records yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.degree}</h4>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Building size={16} />
                    <span>{item.institution}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <Calendar size={16} />
                    <span>{item.year}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-gray-50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Education' : 'Add Education'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree *
                </label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Bachelor of Science in Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution *
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="University of Technology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  required
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="2020"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editingItem ? 'Update Education' : 'Add Education'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
