'use client';

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Calendar, Award, ExternalLink } from 'lucide-react';
import { Certification, AddCertificationRequest, UpdateCertificationRequest } from '../../../types/profile';

interface CertificationSectionProps {
  certifications: Certification[];
  onAdd: (data: AddCertificationRequest) => Promise<void>;
  onUpdate: (id: string, data: UpdateCertificationRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CertificationSection({
  certifications,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}: CertificationSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Certification | null>(null);
  const [formData, setFormData] = useState<AddCertificationRequest>({
    name: '',
    issuer: '',
    date: new Date().toISOString().split('T')[0],
    url: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      date: new Date().toISOString().split('T')[0],
      url: '',
    });
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: Certification) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      issuer: item.issuer,
      date: item.date,
      url: item.url || '',
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
      console.error('Failed to save certification:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        <button
          onClick={handleOpenAdd}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus size={16} />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No certifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="text-indigo-600" size={20} />
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  </div>
                  <p className="text-gray-600 mb-2">{item.issuer}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={14} />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2"
                    >
                      <ExternalLink size={14} />
                      View Certificate
                    </a>
                  )}
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
                {editingItem ? 'Edit Certification' : 'Add Certification'}
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
                  Certification Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Amazon Web Services"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://www.credly.com/badges/..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {editingItem ? 'Update Certification' : 'Add Certification'}
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
